import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { reservations, customers, restaurants, whatsappMessages } from "../../db/schema.js";

/**
 * Sends WhatsApp reminders for confirmed reservations starting in the next
 * 2–3 hours. Idempotent per run window; call it hourly from cron:
 *
 *   0 * * * * curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" \
 *     http://127.0.0.1:3000/api/cron/reservation-reminders
 */
export async function runReservationReminders(): Promise<Response> {
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
}
