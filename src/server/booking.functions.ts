import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  restaurants,
  areas,
  tables,
  menuCategories,
  menuItems,
  reservations,
  customers,
  ads,
} from "../../db/schema.js";
import { ensureSeeded } from "./seed.server.js";
import { sendWhatsappMessage } from "./whatsapp.server.js";
import { randomToken } from "./session.server.js";
import { isSubscriptionValid } from "./subscriptions.shared.js";
import { rateLimit } from "./rate-limit.server.js";

export const listRestaurants = createServerFn({ method: "GET" })
  .inputValidator((data: { q?: string; city?: string; cuisine?: string } | undefined) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const all = await db.select().from(restaurants).where(eq(restaurants.status, "active"));
    const q = data?.q?.toLowerCase();
    const city = data?.city?.toLowerCase();
    const cuisine = data?.cuisine?.toLowerCase();
    return all.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.cuisine.toLowerCase().includes(q)) return false;
      if (city && r.city.toLowerCase() !== city) return false;
      if (cuisine && r.cuisine.toLowerCase() !== cuisine) return false;
      return true;
    });
  });

export const getRestaurantBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    await ensureSeeded();
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, data.slug));
    if (!restaurant) return null;
    const areaRows = await db.select().from(areas).where(eq(areas.restaurantId, restaurant.id));
    const tableRows = await db.select().from(tables).where(eq(tables.restaurantId, restaurant.id));
    const [categoryRows, itemRows, adRows] = await Promise.all([
      db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurant.id)),
      db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurant.id)),
      // Platform-wide ads (restaurantId null) plus this restaurant's own, active only.
      db
        .select()
        .from(ads)
        .where(
          and(
            eq(ads.active, true),
            or(isNull(ads.restaurantId), eq(ads.restaurantId, restaurant.id)),
          ),
        )
        .orderBy(ads.sortOrder, ads.id)
        .limit(5),
    ]);
    return {
      restaurant,
      areas: areaRows,
      tables: tableRows,
      menu: categoryRows.map((c) => ({ ...c, items: itemRows.filter((i) => i.categoryId === c.id) })),
      ads: adRows,
    };
  });

export const getAvailability = createServerFn({ method: "GET" })
  .inputValidator((data: { restaurantId: number; date: string; partySize: number }) => data)
  .handler(async ({ data }) => {
    // Expired / suspended / pending restaurants expose no slots at all.
    const [restaurantRow] = await db
      .select({ status: restaurants.status, subscriptionEnd: restaurants.subscriptionEnd })
      .from(restaurants)
      .where(eq(restaurants.id, data.restaurantId));
    if (!restaurantRow || !isSubscriptionValid(restaurantRow)) return [];

    const tableRows = await db
      .select()
      .from(tables)
      .where(eq(tables.restaurantId, data.restaurantId));
    const suitable = tableRows.filter((t) => t.capacity >= data.partySize);

    const dayRes = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.restaurantId, data.restaurantId),
          eq(reservations.date, data.date),
          ne(reservations.status, "cancelled"),
          ne(reservations.status, "no_show"),
        ),
      );

    const slots = ["12:00", "12:30", "13:00", "13:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
    return slots.map((slot) => {
      const bookedTableIds = new Set(dayRes.filter((r) => r.time.slice(0, 5) === slot).map((r) => r.tableId));
      const availableTables = suitable.filter((t) => !bookedTableIds.has(t.id));
      return { time: slot, available: availableTables.length > 0, tableCount: availableTables.length };
    });
  });

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      restaurantId: number;
      guestName: string;
      guestPhone: string;
      partySize: number;
      date: string;
      time: string;
      areaId?: number;
      specialRequests?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    // Cheap abuse guard before touching the database.
    if (!rateLimit(`book:${data.guestPhone}`, 10, 60 * 60 * 1000)) {
      return { error: "Trop de réservations. Réessayez plus tard." };
    }

    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, data.restaurantId));

    // Premium feature + subscription validity — enforced server-side, not just UI.
    if (!restaurant || !isSubscriptionValid(restaurant) || restaurant.status !== "active") {
      return { error: "Cet établissement n'accepte pas les réservations pour le moment." };
    }
    if (restaurant.subscriptionTier === "basic") {
      return { error: "La réservation en ligne n'est pas activée pour cet établissement." };
    }

    // Check-and-insert must be atomic or two concurrent submissions can grab
    // the same table. Locking the restaurant's tables serializes the choice.
    const reservation = await db.transaction(async (tx) => {
      // Serialize all bookings for this phone number (across restaurants) so
      // two simultaneous submissions can never both pass the one-per-day check.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${data.guestPhone}))`);

      const tableRows = await tx.select().from(tables).where(eq(tables.restaurantId, data.restaurantId)).for("update");
      const suitable = tableRows.filter(
        (t) => t.capacity >= data.partySize && (!data.areaId || t.areaId === data.areaId),
      );

      // One reservation per customer per day. Cancelled ones don't count —
      // cancelling must free you up to rebook. To restrict this to per-restaurant
      // instead of platform-wide, add eq(reservations.restaurantId, data.restaurantId).
      const [existing] = await tx
        .select({ id: reservations.id })
        .from(reservations)
        .where(
          and(
            eq(reservations.guestPhone, data.guestPhone),
            eq(reservations.date, data.date),
            ne(reservations.status, "cancelled"),
          ),
        )
        .limit(1);
      if (existing) return { kind: "duplicate" as const };

      const dayRes = await tx
        .select()
        .from(reservations)
        .where(
          and(
            eq(reservations.restaurantId, data.restaurantId),
            eq(reservations.date, data.date),
            ne(reservations.status, "cancelled"),
            ne(reservations.status, "no_show"),
          ),
        );
      const bookedTableIds = new Set(dayRes.filter((r) => r.time.slice(0, 5) === data.time).map((r) => r.tableId));
      const table = suitable.find((t) => !bookedTableIds.has(t.id));
      if (!table) return { kind: "full" as const };

      let [customer] = await tx.select().from(customers).where(eq(customers.phone, data.guestPhone));
      if (!customer) {
        [customer] = await tx
          .insert(customers)
          .values({ phone: data.guestPhone, name: data.guestName })
          .returning();
      }
      const whatsappOptIn = customer.whatsappOptIn;
      const customerId = customer.id;

      const [created] = await tx
        .insert(reservations)
        .values({
          restaurantId: data.restaurantId,
          customerId: customer.id,
          tableId: table.id,
          areaId: table.areaId,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          partySize: data.partySize,
          date: data.date,
          time: `${data.time}:00`,
          status: "confirmed",
          source: "online",
          specialRequests: data.specialRequests ?? "",
          confirmationCode: randomToken(),
        })
        .returning();
      return { created, customerId, whatsappOptIn };
    });

    if (reservation.kind === "duplicate") {
      return { error: "Vous avez déjà une réservation pour cette date. Une seule réservation par jour est autorisée." };
    }
    if (reservation.kind === "full") {
      return { error: "Aucune table disponible à cette heure. Choisissez un autre horaire." };
    }
    const reservationRecord = reservation.created;

    if (reservation.whatsappOptIn) {
      await sendWhatsappMessage({
        restaurantId: data.restaurantId,
        customerId: reservation.customerId,
        kind: "confirmation",
        body: `Bonjour, votre table pour ${data.partySize} personnes chez ${restaurant?.name} le ${data.date} à ${data.time} est confirmée. Référence : ${reservationRecord.confirmationCode}. Répondez CANCEL pour annuler ou STOP pour ne plus recevoir de messages.`,
      });
    }

    return { reservation: reservationRecord, restaurant };
  });

export const lookupReservations = createServerFn({ method: "GET" })
  .inputValidator((data: { phone: string }) => data)
  .handler(async ({ data }) => {
    if (!rateLimit(`lookup:${data.phone}`, 10, 60 * 1000)) {
      return { error: "Trop de recherches. Réessayez dans une minute." };
    }
    const [customer] = await db.select().from(customers).where(eq(customers.phone, data.phone));
    if (!customer) return { customer: null, reservations: [] };
    const rows = await db
      .select({ reservation: reservations, restaurant: restaurants })
      .from(reservations)
      .innerJoin(restaurants, eq(reservations.restaurantId, restaurants.id))
      .where(eq(reservations.customerId, customer.id));
    return { customer, reservations: rows };
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; phone: string }) => data)
  .handler(async ({ data }) => {
    if (!rateLimit(`cancel:${data.phone}`, 10, 60 * 1000)) {
      return { error: "Trop de tentatives. Réessayez dans une minute." };
    }
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, data.id));
    if (!reservation || reservation.guestPhone !== data.phone) {
      return { error: "Réservation introuvable" };
    }
    await db
      .update(reservations)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(reservations.id, data.id));

    if (reservation.customerId) {
      await sendWhatsappMessage({
        restaurantId: reservation.restaurantId,
        customerId: reservation.customerId,
        kind: "cancellation",
        body: `Votre réservation ${reservation.confirmationCode} du ${reservation.date} a bien été annulée.`,
      });
    }
    return { success: true };
  });

export const setWhatsappOptIn = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string; optIn: boolean }) => data)
  .handler(async ({ data }) => {
    if (!rateLimit(`optin:${data.phone}`, 10, 60 * 1000)) {
      return { error: "Trop de tentatives. Réessayez dans une minute." };
    }
    await db.update(customers).set({ whatsappOptIn: data.optIn }).where(eq(customers.phone, data.phone));
    return { success: true };
  });
