import type { Config } from "@netlify/functions";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { reservations, customers, restaurants, whatsappMessages } from "../../db/schema.js";

/**
 * Scheduled function that sends WhatsApp reminders a few hours before a
 * reservation. Runs hourly. Uses the same mock WhatsApp logger as the rest
 * of the app — swap in the real WhatsApp Business Platform call here for
 * production, keeping the delivery-status webhook (whatsapp-webhook.mts) in
 * sync with the provider's message IDs.
 */
export default async () => {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const today = now.toISOString().slice(0, 10);

  const upcoming = await db
    .select({ reservation: reservations, customer: customers, restaurant: restaurants })
    .from(reservations)
    .innerJoin(customers, eq(reservations.customerId, customers.id))
    .innerJoin(restaurants, eq(reservations.restaurantId, restaurants.id))
    .where(and(eq(reservations.date, today), eq(reservations.status, "confirmed"), eq(customers.whatsappOptIn, true)));

  let sent = 0;
  for (const row of upcoming) {
    const [h, m] = row.reservation.time.split(":").map(Number);
    const resTime = new Date(now);
    resTime.setHours(h, m, 0, 0);
    if (resTime >= windowStart && resTime <= windowEnd) {
      await db.insert(whatsappMessages).values({
        restaurantId: row.reservation.restaurantId,
        customerId: row.customer.id,
        direction: "outbound",
        kind: "reminder",
        body: `Reminder: your table for ${row.reservation.partySize} at ${row.restaurant.name} is today at ${row.reservation.time.slice(0, 5)}. Reply CANCEL if you can't make it.`,
        status: "sent",
      });
      sent++;
    }
  }

  return Response.json({ sent });
};

export const config: Config = {
  schedule: "0 * * * *",
};
