import { and, eq, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { restaurants } from "../../db/schema.js";

const HISTORY_LIMIT = 20;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Flips active-but-expired restaurants to suspended. No auth — call sites gate it
 *  (admin session via listSubscriptions/syncExpiredSubscriptions, CRON_SECRET via /api/cron). */
export async function syncExpiredSubscriptionsInternal(): Promise<number> {
  const updated = await db
    .update(restaurants)
    .set({ status: "suspended" })
    .where(and(eq(restaurants.status, "active"), lt(restaurants.subscriptionEnd, todayISO())))
    .returning({ id: restaurants.id });
  return updated.length;
}

export async function appendSubscriptionHistory(restaurantId: number, entry: {
  start: string | null;
  end: string | null;
  tier: string;
}) {
  const [row] = await db
    .select({ history: restaurants.subscriptionHistory })
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId));
  const list = Array.isArray(row?.history) ? [...(row.history as unknown[])] : [];
  list.unshift({ ...entry, changedAt: new Date().toISOString() });
  await db
    .update(restaurants)
    .set({ subscriptionHistory: list.slice(0, HISTORY_LIMIT) })
    .where(eq(restaurants.id, restaurantId));
}
