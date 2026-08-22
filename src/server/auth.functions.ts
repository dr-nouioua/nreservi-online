import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { adminUsers, restaurantOwners, staffUsers } from "../../db/schema.js";
import { hashPassword, verifyPassword } from "./crypto.server.js";
import { signSession, verifySession, type SessionPayload } from "./session.server.js";
import { rateLimit } from "./rate-limit.server.js";

const COOKIE = "rsv_session";

export const requireSession = createServerOnlyFn(async (): Promise<SessionPayload | null> => {
  const token = getCookie(COOKIE);
  return verifySession(token);
});

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  return requireSession();
});

export const loginOwner = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (!rateLimit(`login:${data.email.toLowerCase()}`, 10, 15 * 60 * 1000)) {
      return { error: "Too many attempts. Please try again in a few minutes." };
    }
    const [owner] = await db.select().from(restaurantOwners).where(eq(restaurantOwners.email, data.email));
    if (!owner || !verifyPassword(data.password, owner.passwordHash)) {
      return { error: "Invalid email or password" };
    }
    const token = signSession({
      role: "owner",
      id: owner.id,
      email: owner.email,
      name: owner.name,
      restaurantId: owner.restaurantId,
    });
    setCookie(COOKIE, token, { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  });

export const loginStaff = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (!rateLimit(`login:${data.email.toLowerCase()}`, 10, 15 * 60 * 1000)) {
      return { error: "Too many attempts. Please try again in a few minutes." };
    }
    const [staff] = await db.select().from(staffUsers).where(eq(staffUsers.email, data.email));
    if (!staff || !verifyPassword(data.password, staff.passwordHash)) {
      return { error: "Invalid email or password" };
    }
    const token = signSession({
      role: "staff",
      id: staff.id,
      email: staff.email,
      name: staff.name,
      restaurantId: staff.restaurantId,
      staffRole: staff.role,
    });
    setCookie(COOKIE, token, { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  });

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    if (!rateLimit(`login:${data.email.toLowerCase()}`, 10, 15 * 60 * 1000)) {
      return { error: "Too many attempts. Please try again in a few minutes." };
    }
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, data.email));
    if (!admin || !verifyPassword(data.password, admin.passwordHash)) {
      return { error: "Invalid email or password" };
    }
    const token = signSession({ role: "admin", id: admin.id, email: admin.email, name: admin.name });
    setCookie(COOKIE, token, { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE, { path: "/" });
  return { success: true };
});

export const changePassword = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => data,
  )
  .handler(async ({ data }) => {
    const session = await requireSession();
    if (!session) throw new Error("Not authorized");
    if (data.newPassword.length < 8) {
      return { error: "New password must be at least 8 characters." };
    }
    if (data.newPassword !== data.confirmPassword) {
      return { error: "New passwords do not match." };
    }

    if (session.role === "admin") {
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.id));
      if (!admin || !verifyPassword(data.currentPassword, admin.passwordHash)) {
        return { error: "Current password is incorrect." };
      }
      await db.update(adminUsers).set({ passwordHash: hashPassword(data.newPassword) }).where(eq(adminUsers.id, session.id));
      return { success: true };
    }

    if (session.role === "staff") {
      const [staff] = await db.select().from(staffUsers).where(eq(staffUsers.id, session.id));
      if (!staff || !verifyPassword(data.currentPassword, staff.passwordHash)) {
        return { error: "Current password is incorrect." };
      }
      await db.update(staffUsers).set({ passwordHash: hashPassword(data.newPassword) }).where(eq(staffUsers.id, session.id));
      return { success: true };
    }

    const [owner] = await db.select().from(restaurantOwners).where(eq(restaurantOwners.id, session.id));
    if (!owner || !verifyPassword(data.currentPassword, owner.passwordHash)) {
      return { error: "Current password is incorrect." };
    }
    await db.update(restaurantOwners).set({ passwordHash: hashPassword(data.newPassword) }).where(eq(restaurantOwners.id, session.id));
    return { success: true };
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lets any signed-in account (admin, owner, staff) change its login email.
// The current password must be confirmed; the session cookie is re-signed so
// the sidebar/header immediately reflects the new email without re-login.
export const updateAccountEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { newEmail: string; currentPassword: string }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession();
    if (!session) throw new Error("Not authorized");

    const newEmail = data.newEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(newEmail)) {
      return { error: "Adresse e-mail invalide." };
    }

    if (session.role === "admin") {
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, session.id));
      if (!admin || !verifyPassword(data.currentPassword, admin.passwordHash)) {
        return { error: "Mot de passe actuel incorrect." };
      }
      if (admin.email.toLowerCase() === newEmail) return { error: "Cet e-mail est déjà le vôtre." };
      const [dup] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, newEmail));
      if (dup && dup.id !== session.id) return { error: "Cet e-mail est déjà utilisé par un autre compte." };
      await db.update(adminUsers).set({ email: newEmail }).where(eq(adminUsers.id, session.id));
    } else if (session.role === "staff") {
      const [staff] = await db.select().from(staffUsers).where(eq(staffUsers.id, session.id));
      if (!staff || !verifyPassword(data.currentPassword, staff.passwordHash)) {
        return { error: "Mot de passe actuel incorrect." };
      }
      if (staff.email.toLowerCase() === newEmail) return { error: "Cet e-mail est déjà le vôtre." };
      const [dup] = await db.select({ id: staffUsers.id }).from(staffUsers).where(eq(staffUsers.email, newEmail));
      if (dup && dup.id !== session.id) return { error: "Cet e-mail est déjà utilisé par un autre compte." };
      await db.update(staffUsers).set({ email: newEmail }).where(eq(staffUsers.id, session.id));
    } else {
      const [owner] = await db.select().from(restaurantOwners).where(eq(restaurantOwners.id, session.id));
      if (!owner || !verifyPassword(data.currentPassword, owner.passwordHash)) {
        return { error: "Mot de passe actuel incorrect." };
      }
      if (owner.email.toLowerCase() === newEmail) return { error: "Cet e-mail est déjà le vôtre." };
      const [dup] = await db.select({ id: restaurantOwners.id }).from(restaurantOwners).where(eq(restaurantOwners.email, newEmail));
      if (dup && dup.id !== session.id) return { error: "Cet e-mail est déjà utilisé par un autre compte." };
      await db.update(restaurantOwners).set({ email: newEmail }).where(eq(restaurantOwners.id, session.id));
    }

    // Re-sign the session so the new email shows up everywhere right away.
    const payload =
      session.role === "admin"
        ? { role: "admin" as const, id: session.id, email: newEmail, name: session.name }
        : session.role === "staff"
          ? { role: "staff" as const, id: session.id, email: newEmail, name: session.name, restaurantId: session.restaurantId, staffRole: session.staffRole }
          : { role: "owner" as const, id: session.id, email: newEmail, name: session.name, restaurantId: session.restaurantId };
    setCookie(COOKIE, signSession(payload), { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return { success: true };
  });
