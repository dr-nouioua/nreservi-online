import { createServerFn } from "@tanstack/react-start";
import { and, eq, ne } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  restaurants,
  areas,
  tables,
  menuCategories,
  menuItems,
  reservations,
  customers,
} from "../../db/schema.js";
import { ensureSeeded } from "./seed.server.js";
import { sendWhatsappMessage } from "./whatsapp.server.js";
import { randomToken } from "./session.server.js";

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
    const categoryRows = await db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurant.id));
    const itemRows = await db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurant.id));
    return {
      restaurant,
      areas: areaRows,
      tables: tableRows,
      menu: categoryRows.map((c) => ({ ...c, items: itemRows.filter((i) => i.categoryId === c.id) })),
    };
  });

export const getAvailability = createServerFn({ method: "GET" })
  .inputValidator((data: { restaurantId: number; date: string; partySize: number }) => data)
  .handler(async ({ data }) => {
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
    const tableRows = await db.select().from(tables).where(eq(tables.restaurantId, data.restaurantId));
    const suitable = tableRows.filter(
      (t) => t.capacity >= data.partySize && (!data.areaId || t.areaId === data.areaId),
    );

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
    const bookedTableIds = new Set(dayRes.filter((r) => r.time.slice(0, 5) === data.time).map((r) => r.tableId));
    const table = suitable.find((t) => !bookedTableIds.has(t.id));
    if (!table) {
      return { error: "No tables available for that time. Please pick another slot." };
    }

    let [customer] = await db.select().from(customers).where(eq(customers.phone, data.guestPhone));
    if (!customer) {
      [customer] = await db
        .insert(customers)
        .values({ phone: data.guestPhone, name: data.guestName })
        .returning();
    }

    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, data.restaurantId));

    const [reservation] = await db
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

    if (customer.whatsappOptIn) {
      await sendWhatsappMessage({
        restaurantId: data.restaurantId,
        customerId: customer.id,
        kind: "confirmation",
        body: `Your table for ${data.partySize} at ${restaurant?.name} on ${data.date} at ${data.time} is confirmed. Code: ${reservation.confirmationCode}. Reply CANCEL to cancel or STOP to opt out of messages.`,
      });
    }

    return { reservation, restaurant };
  });

export const lookupReservations = createServerFn({ method: "GET" })
  .inputValidator((data: { phone: string }) => data)
  .handler(async ({ data }) => {
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
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, data.id));
    if (!reservation || reservation.guestPhone !== data.phone) {
      return { error: "Reservation not found" };
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
        body: `Your reservation ${reservation.confirmationCode} on ${reservation.date} has been cancelled.`,
      });
    }
    return { success: true };
  });

export const setWhatsappOptIn = createServerFn({ method: "POST" })
  .inputValidator((data: { phone: string; optIn: boolean }) => data)
  .handler(async ({ data }) => {
    await db.update(customers).set({ whatsappOptIn: data.optIn }).where(eq(customers.phone, data.phone));
    return { success: true };
  });
