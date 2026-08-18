import { createHmac, randomBytes } from "node:crypto";

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

export type SessionPayload =
  | { role: "admin"; id: number; email: string; name: string }
  | { role: "owner"; id: number; email: string; name: string; restaurantId: number }
  | { role: "staff"; id: number; email: string; name: string; restaurantId: number; staffRole: string };

export function signSession(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  if (expected !== sig) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function randomToken() {
  return randomBytes(4).toString("hex").toUpperCase();
}
