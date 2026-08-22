// Pure subscription logic — safe to import from client and server bundles
// (no database access here; see subscription.server.ts for the gated parts).

export type SubscriptionStatus =
  | "pending" // admin has not approved the restaurant yet
  | "active"
  | "expiring_soon" // active but ends within SUBSCRIPTION_WARNING_DAYS
  | "expired" // past end date — access blocked automatically
  | "suspended"; // manually suspended by an administrator

/** A restaurant whose subscription ends within this many days shows "Expiring Soon". */
export const SUBSCRIPTION_WARNING_DAYS = 30;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateISO: string | null | undefined): number | null {
  if (!dateISO) return null;
  const diff = Date.parse(`${dateISO}T00:00:00Z`) - Date.parse(`${todayISO()}T00:00:00Z`);
  return Math.round(diff / 86_400_000);
}

/**
 * The one source of truth for a restaurant's effective subscription status.
 * Expiration is derived from dates at call time, so access cuts off instantly
 * without needing a cron job; syncExpiredSubscriptionsInternal() additionally
 * materialises it into `status` so admin listings stay accurate.
 */
export function computeSubscriptionStatus(row: {
  status: string;
  subscriptionEnd: string | null;
}): SubscriptionStatus {
  if (row.status === "pending") return "pending";
  if (row.status === "suspended") return "suspended";
  if (!row.subscriptionEnd) return "active"; // grandfathered: no expiry set
  if (row.subscriptionEnd < todayISO()) return "expired";
  const left = daysUntil(row.subscriptionEnd) ?? Infinity;
  return left <= SUBSCRIPTION_WARNING_DAYS ? "expiring_soon" : "active";
}

/** Whether the restaurant may use protected owner features right now. */
export function isSubscriptionValid(row: { status: string; subscriptionEnd: string | null }): boolean {
  const status = computeSubscriptionStatus(row);
  return status === "active" || status === "expiring_soon";
}
