import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const DEV_FALLBACK_SECRET = "dev-insecure-secret-change-me";

// Fail fast in production when the secret is missing instead of silently
// signing sessions with a publicly known value.
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.CONTEXT === "production" || process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return DEV_FALLBACK_SECRET;
}

export type SessionPayload =
  | { role: "admin"; id: number; email: string; name: string }
  | { role: "owner"; id: number; email: string; name: string; restaurantId: number }
  | { role: "staff"; id: number; email: string; name: string; restaurantId: number; staffRole: string };

const SESSION_TTL_MS = 60 * 60 * 24 * 7; // must match cookie maxAge

type SignedPayload = SessionPayload & { exp: number };

export function signSession(payload: SessionPayload): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + SESSION_TTL_MS } satisfies SignedPayload),
  ).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", getSecret()).update(body).digest();
  const provided = Buffer.from(sig);
  // Constant-time comparison — a plain === leaks the signature byte by byte
  // through response timing.
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedPayload;
    // Tokens issued before exp existed have no exp — treat them as expired so
    // everyone rotates onto bounded-lifetime sessions.
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Public confirmation codes. 6 bytes = 48 bits of entropy, enough that the
// unique constraint never becomes a collision generator.
export function randomToken() {
  return randomBytes(6).toString("hex").toUpperCase();
}
