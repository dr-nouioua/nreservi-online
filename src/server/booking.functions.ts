import { createServerFn } from "@tanstack/react-start";
import { and, eq, ilike, isNull, ne, or, sql } from "drizzle-orm";
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
  doctors,
} from "../../db/schema.js";
import { ensureSeeded } from "./seed.server.js";
import { sendWhatsappMessage } from "./whatsapp.server.js";
import { randomToken } from "./session.server.js";
import { isSubscriptionValid } from "./subscriptions.shared.js";
import { rateLimit } from "./rate-limit.server.js";

export const listRestaurants = createServerFn({ method: "GET" })
  .inputValidator((data: { q?: string; city?: string; cuisine?: string; category?: string } | undefined) => data)
  .handler(async ({ data }) => {
    try { await ensureSeeded(); } catch { /* seed is non-critical */ }
    // SQL-level filtering + minimal columns: scales to hundreds of restaurants.
    const conds = [eq(restaurants.status, "active")];
    const q = data?.q?.trim();
    if (q) {
      // Escape LIKE wildcards so "%"/"_" can't widen the match.
      const safe = q.replace(/[\\%_]/g, "\\$&");
      conds.push(
        or(
          ilike(restaurants.name, `%${safe}%`),
          ilike(restaurants.cuisine, `%${safe}%`),
          ilike(restaurants.city, `%${safe}%`),
        )!,
      );
    }
    if (data?.city) conds.push(eq(restaurants.city, data.city));
    if (data?.cuisine) conds.push(eq(restaurants.cuisine, data.cuisine));
    if (data?.category) conds.push(eq(restaurants.category, data.category));

    return db
      .select({
        id: restaurants.id,
        slug: restaurants.slug,
        name: restaurants.name,
        category: restaurants.category,
        city: restaurants.city,
        cuisine: restaurants.cuisine,
        coverImageUrl: restaurants.coverImageUrl,
      })
      .from(restaurants)
      .where(and(...conds))
      .orderBy(restaurants.name);
  });

export const getRestaurantBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    try { await ensureSeeded(); } catch { /* seed is non-critical */ }
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, data.slug));
    if (!restaurant) return null;
    const areaRows = await db.select().from(areas).where(eq(areas.restaurantId, restaurant.id));
    const tableRows = await db.select().from(tables).where(eq(tables.restaurantId, restaurant.id));
    const doctorRows = await db.select().from(doctors).where(eq(doctors.restaurantId, restaurant.id));
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
      doctors: doctorRows,
      menu: categoryRows.map((c) => ({ ...c, items: itemRows.filter((i) => i.categoryId === c.id) })),
      ads: adRows,
    };
  });

export const getAvailability = createServerFn({ method: "GET" })
  .inputValidator((data: { restaurantId: number; date: string; partySize: number; format?: string; doctorId?: number }) => data)
  .handler(async ({ data }) => {
    // Expired / suspended / pending restaurants expose no slots at all.
    const [restaurantRow] = await db
      .select({ status: restaurants.status, subscriptionEnd: restaurants.subscriptionEnd, slotDuration: restaurants.slotDuration, openingHours: restaurants.openingHours, category: restaurants.category })
      .from(restaurants)
      .where(eq(restaurants.id, data.restaurantId));
    if (!restaurantRow || !isSubscriptionValid(restaurantRow)) return [];

    const slotDuration = restaurantRow.slotDuration ?? 30;
    const openingHours = (restaurantRow.openingHours as Record<string, { open: string; close: string }[]>) ?? {};
    const category = restaurantRow.category ?? 'restaurant';
    const hasTables = category === 'restaurant';

    // Get day of week from date (0=Sunday, 1=Monday, etc.)
    const dateObj = new Date(data.date + 'T12:00:00');
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayKey = dayNames[dateObj.getDay()];
    const dayHours = openingHours[dayKey] ?? [];

    // Generate slots based on opening hours and slot duration
    const allSlots: string[] = [];
    for (const period of dayHours) {
      const [openH, openM] = period.open.split(':').map(Number);
      const [closeH, closeM] = period.close.split(':').map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;
      for (let m = openMinutes; m + slotDuration <= closeMinutes; m += slotDuration) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        allSlots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      }
    }

    // If no opening hours configured, use sensible defaults per category
    if (allSlots.length === 0) {
      const defaultStart = hasTables ? 720 : 480; // 12:00 for restaurants, 08:00 for others
      const defaultEnd = hasTables ? 1320 : 1320; // 22:00 for all
      for (let m = defaultStart; m + slotDuration <= defaultEnd; m += slotDuration) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        allSlots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
      }
    }

    // Filter out past slots for today
    const todayStr = new Date().toISOString().slice(0, 10);
    if (data.date === todayStr) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      const filteredSlots = allSlots.filter((slot) => {
        const [h, m] = slot.split(':').map(Number);
        return h * 60 + m > nowMinutes;
      });
      allSlots.length = 0;
      allSlots.push(...filteredSlots);
    }

    // Football: filter terrains by format, check availability per terrain
    if (category === 'football_pitch' && data.format) {
      const matchingAreas = await db
        .select()
        .from(areas)
        .where(and(eq(areas.restaurantId, data.restaurantId), eq(areas.format, data.format)));
      const matchingAreaIds = new Set(matchingAreas.map((a) => a.id));

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

      return allSlots.map((slot) => {
        const bookedAreaIds = new Set(
          dayRes.filter((r) => r.time.slice(0, 5) === slot && matchingAreaIds.has(r.areaId)).map((r) => r.areaId)
        );
        const availableCount = matchingAreas.filter((a) => !bookedAreaIds.has(a.id)).length;
        return { time: slot, available: availableCount > 0, tableCount: availableCount };
      });
    }

    // For non-restaurant categories (no format), there are no tables — check reservation conflicts only
    if (!hasTables) {
      const conds = [
        eq(reservations.restaurantId, data.restaurantId),
        eq(reservations.date, data.date),
        ne(reservations.status, "cancelled"),
        ne(reservations.status, "no_show"),
      ];
      // For doctors, check conflicts per-doctor (multiple doctors can share the same slot)
      if (data.doctorId) {
        conds.push(eq(reservations.doctorId, data.doctorId));
      }
      const dayRes = await db
        .select()
        .from(reservations)
        .where(and(...conds));
      const bookedTimes = new Set(dayRes.map((r) => r.time.slice(0, 5)));
      return allSlots.map((slot) => ({
        time: slot,
        available: !bookedTimes.has(slot),
        tableCount: bookedTimes.has(slot) ? 0 : 1,
      }));
    }

    // Restaurant: check table availability
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

    return allSlots.map((slot) => {
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
      doctorId?: number;
      format?: string;
      specialRequests?: string;
      babySeats?: number;
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

      // For non-restaurant categories (football, salon, spa, car rental, barbershop),
      // there are no tables — check reservation time conflicts only.
      const [restRow] = await tx.select({ category: restaurants.category }).from(restaurants).where(eq(restaurants.id, data.restaurantId));
      const category = restRow?.category ?? 'restaurant';
      const hasTables = category === 'restaurant';

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

      // For non-restaurant categories (except football), block if same time slot is already booked
      // For doctors, check per-doctor conflicts (multiple doctors can share the same slot)
      if (!hasTables && category !== 'football_pitch') {
        const conflictConds = [
          eq(reservations.restaurantId, data.restaurantId),
          eq(reservations.date, data.date),
          eq(reservations.time, `${data.time}:00`),
          ne(reservations.status, "cancelled"),
          ne(reservations.status, "no_show"),
        ];
        if (data.doctorId) {
          conflictConds.push(eq(reservations.doctorId, data.doctorId));
        }
        const bookedAtTime = await tx.select({ id: reservations.id }).from(reservations).where(and(...conflictConds)).limit(1);
        if (bookedAtTime.length > 0) return { kind: "full" as const };
      }

      let [customer] = await tx.select().from(customers).where(eq(customers.phone, data.guestPhone));
      if (!customer) {
        [customer] = await tx
          .insert(customers)
          .values({ phone: data.guestPhone, name: data.guestName })
          .returning();
      }
      const whatsappOptIn = customer.whatsappOptIn;
      const customerId = customer.id;

      let tableId: number | null = null;
      let areaId: number | null = null;

      if (hasTables) {
        // Restaurant: assign a specific table
        const bookedTableIds = new Set(dayRes.filter((r) => r.time.slice(0, 5) === data.time).map((r) => r.tableId));
        const table = suitable.find((t) => !bookedTableIds.has(t.id));
        if (!table) return { kind: "full" as const };
        tableId = table.id;
        areaId = table.areaId;
      } else if (category === 'football_pitch' && data.format) {
        // Football: find a terrain with matching format that's free at this time
        const matchingAreas = await tx
          .select()
          .from(areas)
          .where(and(eq(areas.restaurantId, data.restaurantId), eq(areas.format, data.format)));
        const bookedAreaIds = new Set(
          dayRes.filter((r) => r.time.slice(0, 5) === data.time && matchingAreas.some((a) => a.id === r.areaId)).map((r) => r.areaId)
        );
        const freeArea = matchingAreas.find((a) => !bookedAreaIds.has(a.id));
        if (!freeArea) return { kind: "full" as const };
        areaId = freeArea.id;
      } else {
        // Other non-restaurants: use area if provided, otherwise auto-assign first area
        if (data.areaId) {
          areaId = data.areaId;
        } else {
          const [firstArea] = await tx.select({ id: areas.id }).from(areas).where(eq(areas.restaurantId, data.restaurantId)).limit(1);
          areaId = firstArea?.id ?? null;
        }
      }

      // Baby seats only if the restaurant offers them; hard-capped at 4.
      const babySeats = restaurant.babySeatAvailable
        ? Math.min(4, Math.max(0, Math.round(data.babySeats ?? 0)))
        : 0;

      const [created] = await tx
        .insert(reservations)
        .values({
          restaurantId: data.restaurantId,
          customerId: customer.id,
          tableId,
          areaId,
          doctorId: data.doctorId ?? null,
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          partySize: data.partySize,
          babySeats,
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
      return { error: "Ce créneau est déjà réservé. Choisissez un autre horaire." };
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
