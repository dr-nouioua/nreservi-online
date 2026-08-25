import { and, eq, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { restaurants, restaurantOwners } from "../../db/schema.js";

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
    .returning({ id: restaurants.id, name: restaurants.name });

  // Best-effort notice to each newly suspended restaurant's owners.
  if (updated.length > 0) {
    try {
      const { sendMail, brandedEmail } = await import("./mail.server.js");
      for (const r of updated) {
        const owners = await db
          .select({ email: restaurantOwners.email })
          .from(restaurantOwners)
          .where(eq(restaurantOwners.restaurantId, r.id));
        for (const owner of owners) {
          await sendMail({
            to: owner.email,
            subject: "Votre abonnement nreservi.online a expiré",
            kind: "expiry_notice",
            html: brandedEmail("Votre abonnement a expiré", [
              `L'abonnement du restaurant <strong>${r.name}</strong> a expiré.`,
              "L'accès à l'espace professionnel est suspendu. Contactez l'administration nreservi.online pour le renouveler — vos données sont conservées.",
            ]),
          });
        }
      }
    } catch { /* jamais bloquant */ }
  }
  return updated.length;
}

const WARNING_WINDOW_DAYS = 14;

/** Cron (daily): warns owners 14 days before their subscription ends. Sends once per period. */
export async function sendSubscriptionWarningsInternal(): Promise<{ sent: number }> {
  const today = todayISO();
  const rows = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      end: restaurants.subscriptionEnd,
      warnedFor: restaurants.expiryWarningSentFor,
    })
    .from(restaurants)
    .where(and(eq(restaurants.status, "active"), lt(restaurants.subscriptionEnd, today)));

  const { sendMail, brandedEmail } = await import("./mail.server.js");
  let sent = 0;
  for (const row of rows) {
    if (!row.end) continue;
    const daysLeft = Math.ceil((Date.parse(row.end) - Date.parse(today)) / 86_400_000);
    if (daysLeft > WARNING_WINDOW_DAYS || daysLeft < 0) continue;
    // One warning per period: re-armed automatically when the end date changes.
    if (row.warnedFor === row.end) continue;

    const owners = await db
      .select({ email: restaurantOwners.email })
      .from(restaurantOwners)
      .where(eq(restaurantOwners.restaurantId, row.id));
    for (const owner of owners) {
      const result = await sendMail({
        to: owner.email,
        subject: `Plus que ${daysLeft} jour${daysLeft > 1 ? "s" : ""} — renouvelez votre abonnement nreservi.online`,
        kind: "expiry_warning",
        html: brandedEmail(`Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`, [
          `Bonjour, l'abonnement du restaurant <strong>${row.name}</strong> prend fin le <strong>${row.end}</strong>.`,
          "Passé cette date, l'accès à l'espace professionnel sera suspendu (vos données sont conservées).",
          "Contactez l'administration nreservi.online pour renouveler dès maintenant.",
        ]),
      });
      if (result.ok) sent++;
    }
    await db.update(restaurants).set({ expiryWarningSentFor: row.end }).where(eq(restaurants.id, row.id));
  }
  return { sent };
}

export async function appendSubscriptionHistory(restaurantId: number, entry: {
  start: string | null;
  end: string | null;
  tier: string;
  amount?: string | null;
  discount?: number | null;
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
