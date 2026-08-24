import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { adminUsers, ads, restaurants, restaurantOwners, reservations, areas } from "../../db/schema.js";
import { requireSession } from "./auth.functions.js";
import { appendSubscriptionHistory, syncExpiredSubscriptionsInternal } from "./subscription.server.js";
import { computeSubscriptionStatus, daysUntil, SUBSCRIPTION_WARNING_DAYS } from "./subscriptions.shared.js";
import { hashPassword } from "./crypto.server.js";
import { signSession } from "./session.server.js";
import { setCookie } from "@tanstack/react-start/server";

async function requireAdmin() {
  const session = await requireSession();
  if (!session || session.role !== "admin") throw new Error("Not authorized");
  return session;
}

export const listAllRestaurants = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db.select().from(restaurants).orderBy(restaurants.id);
});

export const getPlatformAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const allRestaurants = await db.select().from(restaurants);
  const allReservations = await db.select().from(reservations);
  const active = allRestaurants.filter((r) => r.status === "active").length;
  const pending = allRestaurants.filter((r) => r.status === "pending").length;
  const byRestaurant: Record<string, number> = {};
  for (const r of allReservations) {
    const name = allRestaurants.find((x) => x.id === r.restaurantId)?.name ?? "Unknown";
    byRestaurant[name] = (byRestaurant[name] ?? 0) + 1;
  }
  return {
    totalRestaurants: allRestaurants.length,
    activeRestaurants: active,
    pendingRestaurants: pending,
    totalBookings: allReservations.length,
    byRestaurant,
  };
});

export const approveRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(restaurants).set({ status: "active" }).where(eq(restaurants.id, data.id));
    return { success: true };
  });

export const suspendRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(restaurants).set({ status: "suspended" }).where(eq(restaurants.id, data.id));
    return { success: true };
  });

export const deleteRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.delete(restaurantOwners).where(eq(restaurantOwners.restaurantId, data.id));
    await db.delete(reservations).where(eq(reservations.restaurantId, data.id));
    await db.delete(areas).where(eq(areas.restaurantId, data.id));
    await db.delete(restaurants).where(eq(restaurants.id, data.id));
    return { success: true };
  });

export const setSubscriptionTier = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; tier: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(restaurants).set({ subscriptionTier: data.tier }).where(eq(restaurants.id, data.id));
    return { success: true };
  });

export const onboardRestaurant = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      name: string;
      slug: string;
      city: string;
      cuisine: string;
      address: string;
      contactEmail: string;
      contactPhone: string;
      whatsappNumber: string;
      ownerEmail: string;
      ownerPassword: string;
      ownerName: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const defaultHours = {
      mon: [{ open: "12:00", close: "22:00" }],
      tue: [{ open: "12:00", close: "22:00" }],
      wed: [{ open: "12:00", close: "22:00" }],
      thu: [{ open: "12:00", close: "22:00" }],
      fri: [{ open: "12:00", close: "23:00" }],
      sat: [{ open: "12:00", close: "23:00" }],
      sun: [{ open: "12:00", close: "21:00" }],
    };
    const [restaurant] = await db
      .insert(restaurants)
      .values({
        name: data.name,
        slug: data.slug,
        city: data.city,
        cuisine: data.cuisine,
        address: data.address,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        whatsappNumber: data.whatsappNumber || null,
        status: "active",
        subscriptionTier: "starter",
        openingHours: defaultHours,
      })
      .returning();

    await db.insert(areas).values({ restaurantId: restaurant.id, name: "Main Dining" });

    await db.insert(restaurantOwners).values({
      restaurantId: restaurant.id,
      email: data.ownerEmail,
      passwordHash: hashPassword(data.ownerPassword),
      name: data.ownerName,
    });

    return restaurant;
  });

// Support-login: lets the super-admin impersonate a restaurant's owner dashboard for troubleshooting.
export const impersonateRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { restaurantId: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const [owner] = await db.select().from(restaurantOwners).where(eq(restaurantOwners.restaurantId, data.restaurantId));
    if (!owner) throw new Error("Aucun compte propriétaire pour ce restaurant");
    const token = signSession({
      role: "owner",
      id: owner.id,
      email: owner.email,
      name: `${owner.name} (support session)`,
      restaurantId: owner.restaurantId,
    });
    setCookie("rsv_session", token, { httpOnly: true, path: "/", sameSite: "lax", maxAge: 60 * 60 });
    return { success: true };
  });

// ---------- Admin accounts (multiple admins supported) ----------

export const listAdmins = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db
    .select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, createdAt: adminUsers.createdAt })
    .from(adminUsers)
    .orderBy(adminUsers.id);
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; email: string; password: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    if (!name) return { error: "Le nom est requis." };
    if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide." };
    if (data.password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };

    const [dup] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email));
    if (dup) return { error: "Cet e-mail est déjà utilisé par un administrateur." };

    const [admin] = await db
      .insert(adminUsers)
      .values({ name, email, passwordHash: hashPassword(data.password) })
      .returning({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, createdAt: adminUsers.createdAt });
    return { admin };
  });

export const deleteAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const session = await requireAdmin();
    if (data.id === session.id) {
      return { error: "Vous ne pouvez pas supprimer votre propre compte." };
    }
    const all = await db.select({ id: adminUsers.id }).from(adminUsers);
    if (all.length <= 1) {
      return { error: "Impossible de supprimer le dernier administrateur." };
    }
    const [target] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.id, data.id));
    if (!target) return { error: "Administrateur introuvable." };
    await db.delete(adminUsers).where(eq(adminUsers.id, data.id));
    return { success: true };
  });

// ---------- Inline ads management ----------

export const listAds = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db.select().from(ads).orderBy(ads.sortOrder, ads.id);
});

function normalizeAdInput(data: { title: string; body: string; imageUrl: string; linkUrl: string; ctaLabel: string; sortOrder: number; durationSeconds: number; restaurantId: number | null }) {
  return {
    title: data.title.trim(),
    body: data.body.trim(),
    imageUrl: data.imageUrl.trim() || null,
    linkUrl: data.linkUrl.trim() || null,
    ctaLabel: data.ctaLabel.trim() || "Découvrir",
    sortOrder: Number.isFinite(data.sortOrder) ? data.sortOrder : 0,
    durationSeconds: Number.isFinite(data.durationSeconds) ? Math.min(120, Math.max(5, Math.round(data.durationSeconds))) : 15,
    restaurantId: data.restaurantId ?? null,
  };
}

export const createAd = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { title: string; body: string; imageUrl: string; linkUrl: string; ctaLabel: string; sortOrder: number; durationSeconds: number; restaurantId: number | null }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const values = normalizeAdInput(data);
    if (!values.title) return { error: "Le titre est requis." };
    if (values.linkUrl && !/^https?:\/\//.test(values.linkUrl)) {
      return { error: "Le lien doit commencer par http:// ou https://" };
    }
    await db.insert(ads).values(values);
    return { success: true as const };
  });

export const updateAd = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: number; title: string; body: string; imageUrl: string; linkUrl: string; ctaLabel: string; sortOrder: number; durationSeconds: number; restaurantId: number | null }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const values = normalizeAdInput(data);
    if (!values.title) return { error: "Le titre est requis." };
    if (values.linkUrl && !/^https?:\/\//.test(values.linkUrl)) {
      return { error: "Le lien doit commencer par http:// ou https://" };
    }
    await db.update(ads).set(values).where(eq(ads.id, data.id));
    return { success: true as const };
  });

/** Activate/deactivate — a deactivated ad is hidden from all pages but kept for later reuse. */
export const setAdActive = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; active: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(ads).set({ active: data.active }).where(eq(ads.id, data.id));
    return { success: true as const };
  });

export const deleteAd = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.delete(ads).where(eq(ads.id, data.id));
    return { success: true as const };
  });

// ---------- Subscription management (spec §17–21) ----------

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Flips every active-but-expired restaurant to suspended. Cheap; run on admin dashboard load and via cron. */
export const syncExpiredSubscriptions = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdmin();
  return { suspended: await syncExpiredSubscriptionsInternal() };
});

export const listSubscriptions = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  await syncExpiredSubscriptionsInternal();
  const rows = await db.select().from(restaurants).orderBy(restaurants.name);
  return rows.map((r) => {
    const status = computeSubscriptionStatus(r);
    return {
      id: r.id,
      name: r.name,
      city: r.city,
      tier: r.subscriptionTier,
      adminStatus: r.status,
      status,
      start: r.subscriptionStart,
      end: r.subscriptionEnd,
      daysLeft: daysUntil(r.subscriptionEnd),
      warningDays: SUBSCRIPTION_WARNING_DAYS,
      history: (r.subscriptionHistory as unknown[]) ?? [],
    };
  });
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const updateSubscriptionDates = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; start: string | null; end: string | null }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    for (const d of [data.start, data.end]) {
      if (d && !DATE_RE.test(d)) return { error: "Date invalide (format attendu AAAA-MM-JJ)." };
    }
    if (data.start && data.end && data.end <= data.start) {
      return { error: "La date de fin doit être après la date de début." };
    }
    const [row] = await db.select().from(restaurants).where(eq(restaurants.id, data.id));
    if (!row) return { error: "Restaurant introuvable." };

    // A pending restaurant stays pending; an expired/suspended one becomes
    // active again as soon as a valid period is assigned (renewal, §20).
    const wasExpired = computeSubscriptionStatus(row) === "expired";
    await db
      .update(restaurants)
      .set({
        subscriptionStart: data.start,
        subscriptionEnd: data.end,
        ...(row.status === "suspended" || wasExpired ? { status: "active" } : {}),
      })
      .where(eq(restaurants.id, data.id));
    await appendSubscriptionHistory(data.id, {
      start: data.start,
      end: data.end,
      tier: row.subscriptionTier,
    });
    return { success: true as const };
  });

/** Renewal shortcut: extends by N months from the later of (today, current end). */
export const renewSubscription = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; months: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (!(data.months >= 1 && data.months <= 36)) return { error: "Durée invalide (1–36 mois)." };
    const [row] = await db.select().from(restaurants).where(eq(restaurants.id, data.id));
    if (!row) return { error: "Restaurant introuvable." };

    const today = todayISO();
    const base = row.subscriptionEnd && row.subscriptionEnd > today ? row.subscriptionEnd : today;
    const [y, m, d] = base.split("-").map(Number);
    const endISO = new Date(Date.UTC(y, m - 1 + data.months, d) - 1).toISOString().slice(0, 10);

    await db
      .update(restaurants)
      .set({
        subscriptionStart: row.subscriptionStart ?? today,
        subscriptionEnd: endISO,
        ...(row.status !== "active" ? { status: "active" } : {}),
      })
      .where(eq(restaurants.id, data.id));
    await appendSubscriptionHistory(data.id, {
      start: row.subscriptionStart ?? today,
      end: endISO,
      tier: row.subscriptionTier,
    });
    return { success: true as const, newEnd: endISO };
  });
