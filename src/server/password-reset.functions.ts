import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { adminUsers, passwordResets, restaurantOwners, staffUsers } from "../../db/schema.js";
import { hashPassword } from "./crypto.server.js";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function appBase(): string {
  return (process.env.PUBLIC_APP_URL ?? "https://nreservi.online").replace(/\/$/, "");
}

type Account = { role: "admin" | "owner" | "staff"; userId: number };

async function findAccountsByEmail(email: string): Promise<Account[]> {
  const accounts: Account[] = [];
  const [admin] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email));
  if (admin) accounts.push({ role: "admin", userId: admin.id });
  const [owner] = await db.select({ id: restaurantOwners.id }).from(restaurantOwners).where(eq(restaurantOwners.email, email));
  if (owner) accounts.push({ role: "owner", userId: owner.id });
  const [staff] = await db.select({ id: staffUsers.id }).from(staffUsers).where(eq(staffUsers.email, email));
  if (staff) accounts.push({ role: "staff", userId: staff.id });
  return accounts;
}

/**
 * Always returns success — the response never reveals whether the address
 * exists (no account enumeration). Sends one reset link per matching account.
 */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: true as const };

    const accounts = await findAccountsByEmail(email);
    if (accounts.length > 0) {
      const { sendMail, brandedEmail } = await import("./mail.server.js");
      for (const account of accounts) {
        const token = randomBytes(32).toString("hex");
        await db.insert(passwordResets).values({
          role: account.role,
          userId: account.userId,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        });
        await sendMail({
          to: email,
          subject: "nreservi.online — réinitialisation de votre mot de passe",
          kind: "password_reset",
          html: brandedEmail("Réinitialisation du mot de passe", [
            "Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
            "Ce lien est valable <strong>1 heure</strong> et ne peut être utilisé qu'une seule fois.",
            "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
          ], { label: "Choisir un nouveau mot de passe", url: `${appBase()}/reset-password?token=${token}` }),
        });
      }
    }
    return { success: true as const };
  });

export const validateResetToken = createServerFn({ method: "GET" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const [row] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.tokenHash, hashToken(data.token)),
          isNull(passwordResets.usedAt),
          gt(passwordResets.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return { valid: Boolean(row), role: row?.role ?? null };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string; newPassword: string; confirmPassword: string }) => data)
  .handler(async ({ data }) => {
    if (data.newPassword.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
    if (data.newPassword !== data.confirmPassword) return { error: "Les mots de passe ne correspondent pas." };

    const hash = hashToken(data.token);
    const [row] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.tokenHash, hash),
          isNull(passwordResets.usedAt),
          gt(passwordResets.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!row) return { error: "Ce lien est invalide ou a expiré. Faites une nouvelle demande." };

    const newPasswordHash = hashPassword(data.newPassword);
    if (row.role === "admin") {
      await db.update(adminUsers).set({ passwordHash: newPasswordHash }).where(eq(adminUsers.id, row.userId));
    } else if (row.role === "staff") {
      await db.update(staffUsers).set({ passwordHash: newPasswordHash }).where(eq(staffUsers.id, row.userId));
    } else {
      await db.update(restaurantOwners).set({ passwordHash: newPasswordHash }).where(eq(restaurantOwners.id, row.userId));
    }
    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, row.id));
    return { success: true as const };
  });
