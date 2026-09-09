// Shared cookie configuration — used by auth.functions.ts and admin.functions.ts.

export const COOKIE_NAME = "rsv_session";
export const COOKIE_PATH = "/";

// Use COOKIE_SECURE env var — set to "true" when behind a TLS reverse proxy.
// Do NOT rely on NODE_ENV: the VPS runs NODE_ENV=production over HTTP (port 3000)
// behind Docker, and secure:true on HTTP silently drops the cookie.
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";

export function cookieOpts(maxAgeSeconds = 60 * 60 * 2) {
  return { httpOnly: true, path: COOKIE_PATH, sameSite: "lax" as const, maxAge: maxAgeSeconds, secure: COOKIE_SECURE };
}
