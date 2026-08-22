// Minimal in-memory rate limiter, keyed per server isolate. Good enough to
// blunt credential stuffing and phone-number enumeration on a prototype;
// swap for a durable store (Redis/Netlify Blobs) when scaling horizontally.

const buckets = new Map<string, { count: number; resetAt: number }>();

function prune() {
  if (buckets.size < 10_000) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

/** Returns true when the action is allowed under `limit` events per windowMs. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  prune();
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}
