import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { adminUsers, ads, mailSettings, marketingCampaigns, marketingRules, marketingSegments, marketingTemplates, menuCategories, menuItems, restaurants, restaurantOwners, reservations, areas, staffUsers, tables, whatsappMessages, campaignLogs } from "../../db/schema.js";
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

/** Activity journal — fire-and-forget, never blocks the operation. */
async function logAdmin(action: string, details?: string) {
  try {
    const s = await requireSession();
    if (!s || s.role !== "admin") return;
    const { adminLogs } = await import("../../db/schema.js");
    await db.insert(adminLogs).values({ adminId: s.id, adminEmail: s.email, action, details: details ?? null });
  } catch { /* journaling must never break an operation */ }
}

/** Any admin may call, but module-scoped features require the privilege (super bypasses). */
async function requireAdminWithModule(module: string) {
  const session = await requireAdmin();
  if (session.adminRole !== "super" && !(session.permissions ?? []).includes(module)) {
    const err = new Error("FORBIDDEN_MODULE");
    (err as Error & { code?: string }).code = "FORBIDDEN_MODULE";
    throw err;
  }
  return session;
}

export const listAllRestaurants = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  return db.select().from(restaurants).orderBy(restaurants.id);
});

export const getPlatformAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const c = sql<number>`count(*)::int`;
  // Aggregated in SQL — scales to millions of reservations.
  const [restRows, countRows] = await Promise.all([
    db.select({ id: restaurants.id, name: restaurants.name, status: restaurants.status }).from(restaurants).orderBy(restaurants.id),
    db
      .select({ rid: reservations.restaurantId, c })
      .from(reservations)
      .groupBy(reservations.restaurantId),
  ]);

  const countMap = new Map(countRows.map((r) => [r.rid, r.c]));
  const byRestaurant: Record<string, number> = {};
  let totalBookings = 0;
  for (const r of restRows) {
    const n = countMap.get(r.id) ?? 0;
    byRestaurant[r.name] = n;
    totalBookings += n;
  }

  return {
    totalRestaurants: restRows.length,
    activeRestaurants: restRows.filter((r) => r.status === "active").length,
    pendingRestaurants: restRows.filter((r) => r.status === "pending").length,
    totalBookings,
    byRestaurant,
  };
});

export const approveRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(restaurants).set({ status: "active" }).where(eq(restaurants.id, data.id));
    await logAdmin("restaurant.approve", `restaurant #${data.id}`);
    return { success: true };
  });

export const suspendRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.update(restaurants).set({ status: "suspended" }).where(eq(restaurants.id, data.id));
    await logAdmin("restaurant.suspend", `restaurant #${data.id}`);
    return { success: true };
  });

export const deleteRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; confirmName: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const [row] = await db.select().from(restaurants).where(eq(restaurants.id, data.id));
    if (!row) return { error: "Restaurant introuvable." };
    // Second confirmation, enforced server-side: the typed name must match.
    if (data.confirmName.trim().toLowerCase() !== row.name.trim().toLowerCase()) {
      return { error: "Le nom saisi ne correspond pas — suppression annulée." };
    }

    // Permanent deletion: every child row, in FK-safe order.
    await db.delete(campaignLogs).where(eq(campaignLogs.restaurantId, data.id));
    await db.delete(marketingCampaigns).where(eq(marketingCampaigns.restaurantId, data.id));
    await db.delete(marketingRules).where(eq(marketingRules.restaurantId, data.id));
    await db.delete(marketingTemplates).where(eq(marketingTemplates.restaurantId, data.id));
    await db.delete(marketingSegments).where(eq(marketingSegments.restaurantId, data.id));
    await db.delete(whatsappMessages).where(eq(whatsappMessages.restaurantId, data.id));
    await db.delete(ads).where(eq(ads.restaurantId, data.id));
    await db.delete(staffUsers).where(eq(staffUsers.restaurantId, data.id));
    await db.delete(menuItems).where(eq(menuItems.restaurantId, data.id));
    await db.delete(menuCategories).where(eq(menuCategories.restaurantId, data.id));
    await db.delete(tables).where(eq(tables.restaurantId, data.id));
    await db.delete(reservations).where(eq(reservations.restaurantId, data.id));
    await db.delete(restaurantOwners).where(eq(restaurantOwners.restaurantId, data.id));
    await db.delete(areas).where(eq(areas.restaurantId, data.id));
    await db.delete(restaurants).where(eq(restaurants.id, data.id));

    await logAdmin("restaurant.delete", `${row.name} (supprimé définitivement)`);
    return { success: true };
  });

export const setSubscriptionTier = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; tier: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('subscriptions');
    if (!["basic", "premium"].includes(data.tier)) return { error: "Formule invalide." };
    const [row] = await db.select().from(restaurants).where(eq(restaurants.id, data.id));
    if (!row) return { error: "Restaurant introuvable." };
    await db.update(restaurants).set({ subscriptionTier: data.tier }).where(eq(restaurants.id, data.id));
    await appendSubscriptionHistory(data.id, {
      start: row.subscriptionStart,
      end: row.subscriptionEnd,
      tier: data.tier,
    });
    await logAdmin("subscription.tier", `${data.tier} — restaurant #${data.id}`);
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
    await requireAdminWithModule('onboard');
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
        subscriptionTier: "basic",
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

    // Welcome e-mail with the owner's credentials (best-effort, never blocks).
    try {
      const { sendMail, brandedEmail } = await import("./mail.server.js");
      const base = process.env.PUBLIC_APP_URL ?? "https://nreservi.online";
      await sendMail({
        to: data.ownerEmail,
        subject: `Votre restaurant ${restaurant.name} est en ligne sur nreservi.online`,
        kind: "welcome",
        html: brandedEmail("Bienvenue sur nreservi.online 🎉", [
          `Bonjour ${data.ownerName},`,
          `Votre établissement <strong>${restaurant.name}</strong> est maintenant en ligne. Voici vos accès à l'espace professionnel :`,
          `E-mail : <strong>${data.ownerEmail}</strong><br/>Mot de passe : <strong>${data.ownerPassword}</strong>`,
          "Pensez à changer votre mot de passe après votre première connexion.",
        ], { label: "Accéder à mon espace", url: `${base}/owner/login` }),
      });
    } catch { /* l'e-mail ne doit jamais bloquer la création */ }

    await logAdmin("restaurant.onboard", `${restaurant.name} (${restaurant.slug})`);
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
    await logAdmin("restaurant.impersonate", String(data.restaurantId));
    return { success: true };
  });

// ---------- Admin accounts (multiple admins supported) ----------

export const listAdmins = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireAdmin();
  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      adminRole: adminUsers.role,
      permissions: adminUsers.permissions,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(adminUsers.id);
  // Only the super admin manages other admins.
  return { admins: rows, viewerIsSuper: session.adminRole === "super" };
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; email: string; password: string; adminRole: "admin" | "super"; permissions: string[] }) => data)
  .handler(async ({ data }) => {
    const session = await requireAdmin();
    if (session.adminRole !== "super") return { error: "Seul le super administrateur peut créer des comptes." };
    if (data.adminRole === "super") return { error: "Créez un compte administrateur standard, puis ajustez ses privilèges." };
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    if (!name) return { error: "Le nom est requis." };
    if (!EMAIL_RE.test(email)) return { error: "Adresse e-mail invalide." };
    if (data.password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };

    const [dup] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, email));
    if (dup) return { error: "Cet e-mail est déjà utilisé par un administrateur." };

    const validModules = new Set(["onboard", "subscriptions", "emails", "ads", "mail"]);
    const permissions = (data.permissions ?? []).filter((p) => validModules.has(p));

    const [admin] = await db
      .insert(adminUsers)
      .values({ name, email, passwordHash: hashPassword(data.password), role: "admin", permissions })
      .returning({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, createdAt: adminUsers.createdAt });
    await logAdmin("admin.create", email);
    return { admin };
  });

export const updateAdminAccess = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; permissions: string[] }) => data)
  .handler(async ({ data }) => {
    const session = await requireAdmin();
    if (session.adminRole !== "super") return { error: "Seul le super administrateur peut modifier les privilèges." };
    if (data.id === session.id) return { error: "Vous ne pouvez pas modifier vos propres privilèges." };
    const validModules = new Set(["onboard", "subscriptions", "emails", "ads", "mail"]);
    const permissions = (data.permissions ?? []).filter((p) => validModules.has(p));
    await db.update(adminUsers).set({ permissions }).where(eq(adminUsers.id, data.id));
    await logAdmin("admin.permissions", `admin #${data.id} : [${permissions.join(", ")}]`);
    return { success: true as const };
  });

export const deleteAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const session = await requireAdmin();
    if (session.adminRole !== "super") return { error: "Seul le super administrateur peut supprimer des comptes." };
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
    await logAdmin("admin.delete", String(data.id));
    return { success: true };
  });

// ---------- Inline ads management ----------

export const listAds = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminWithModule('ads');
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
    await requireAdminWithModule('ads');
    if (data.imageUrl && data.imageUrl.length > 3_000_000) {
      return { error: "Image trop volumineuse (max ~2 Mo)." };
    }
    const values = normalizeAdInput(data);
    if (!values.title) return { error: "Le titre est requis." };
    if (values.linkUrl && !/^https?:\/\//.test(values.linkUrl)) {
      return { error: "Le lien doit commencer par http:// ou https://" };
    }
    await db.insert(ads).values(values);
    await logAdmin("ad.create", data.title);
    return { success: true as const };
  });

export const updateAd = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: number; title: string; body: string; imageUrl: string; linkUrl: string; ctaLabel: string; sortOrder: number; durationSeconds: number; restaurantId: number | null }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdminWithModule('ads');
    if (data.imageUrl && data.imageUrl.length > 3_000_000) {
      return { error: "Image trop volumineuse (max ~2 Mo)." };
    }
    const values = normalizeAdInput(data);
    if (!values.title) return { error: "Le titre est requis." };
    if (values.linkUrl && !/^https?:\/\//.test(values.linkUrl)) {
      return { error: "Le lien doit commencer par http:// ou https://" };
    }
    await db.update(ads).set(values).where(eq(ads.id, data.id));
    await logAdmin("ad.update", data.title);
    return { success: true as const };
  });

/** Activate/deactivate — a deactivated ad is hidden from all pages but kept for later reuse. */
export const setAdActive = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; active: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('ads');
    await db.update(ads).set({ active: data.active }).where(eq(ads.id, data.id));
    await logAdmin("ad.toggle", `annonce #${data.id} → ${data.active ? "visible" : "masquée"}`);
    return { success: true as const };
  });

export const deleteAd = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('ads');
    await db.delete(ads).where(eq(ads.id, data.id));
    await logAdmin("ad.delete", String(data.id));
    return { success: true as const };
  });

// ---------- Subscription management (spec §17–21) ----------

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Flips every active-but-expired restaurant to suspended. Cheap; run on admin dashboard load and via cron. */
export const syncExpiredSubscriptions = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdminWithModule('subscriptions');
  return { suspended: await syncExpiredSubscriptionsInternal() };
});

export const listSubscriptions = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminWithModule('subscriptions');
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
    await requireAdminWithModule('subscriptions');
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
    await logAdmin("subscription.dates", `restaurant #${data.id} : ${data.start ?? '?'} → ${data.end ?? '?'}`);
    return { success: true as const };
  });

/** Renewal shortcut: extends by N months from the later of (today, current end). */
export const renewSubscription = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; months: number; amountDA?: string | null; discountPercent?: number | null }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('subscriptions');
    if (!(data.months >= 1 && data.months <= 36)) return { error: "Durée invalide (1–36 mois)." };
    const [row] = await db.select().from(restaurants).where(eq(restaurants.id, data.id));
    if (!row) return { error: "Restaurant introuvable." };

    const today = todayISO();
    const base = row.subscriptionEnd && row.subscriptionEnd > today ? row.subscriptionEnd : today;
    const [y, m, d] = base.split("-").map(Number);
    const endISO = new Date(Date.UTC(y, m - 1 + data.months, d) - 1).toISOString().slice(0, 10);
    const amount = data.amountDA?.trim() || null;
    const discount = data.discountPercent != null && data.discountPercent > 0 && data.discountPercent < 100
      ? Math.round(data.discountPercent)
      : null;
    const finalDA = amount && discount != null
      ? String(Math.round(Number(amount) * (1 - discount / 100)))
      : amount;

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
      amount,
      discount,
    });

    // Reçu PDF joint, envoyé aux comptes propriétaires (best-effort).
    try {
      const owners = await db
        .select({ email: restaurantOwners.email })
        .from(restaurantOwners)
        .where(eq(restaurantOwners.restaurantId, data.id));
      if (owners.length > 0) {
        const { generateReceiptPdf } = await import("./receipt.server.js");
        const { sendMail, brandedEmail } = await import("./mail.server.js");
        const number = `REC-${Date.now().toString(36).toUpperCase()}`;
        const pdf = await generateReceiptPdf({
          number,
          restaurantName: row.name,
          tier: row.subscriptionTier,
          start: row.subscriptionStart ?? today,
          end: endISO,
          amountDA: finalDA,
          discountPercent: discount,
          issuedAt: new Date(),
        });
        for (const owner of owners) {
          await sendMail({
            to: owner.email,
            subject: `Reçu de renouvellement — ${row.name} (${endISO})`,
            kind: "receipt",
            html: brandedEmail("Votre abonnement a été renouvelé", [
              `Le restaurant <strong>${row.name}</strong> est abonné jusqu'au <strong>${endISO}</strong>.`,
              amount ? `Prix : <strong>${amount} DA</strong>.` : "",
              discount ? `Remise : <strong>${discount} %</strong> — Prix final : <strong>${finalDA} DA</strong>.` : "",
              "Le reçu PDF est joint à cet e-mail.",
            ]),
            attachments: [{ filename: `recu-${number}.pdf`, content: pdf }],
          });
        }
      }
    } catch {
      // l'envoi ne doit jamais bloquer le renouvellement
    }
    await logAdmin("subscription.renew", `restaurant #${data.id} : +${data.months} mois${amount ? ` (${amount} DA)` : ""}`);
    return { success: true as const, newEnd: endISO };
  });

// ---------- Visitor analytics ----------

export const getVisitStats = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const today = todayISO();
  const from30 = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

  const counts = await db.execute(sql`
    SELECT slug, SUM(count)::int AS visits
    FROM visit_counts
    WHERE day >= ${from30}
    GROUP BY slug
  `);
  const rows = (counts as any).rows ?? counts ?? [];
  const global30 = rows.filter((r: any) => r.slug === "").reduce((a: number, r: any) => a + Number(r.visits), 0);
  const todayRows = await db.execute(sql`
    SELECT COALESCE(SUM(count), 0)::int AS visits
    FROM visit_counts
    WHERE day = ${today} AND slug = ''
  `);
  const todayRowsArr = (todayRows as any).rows ?? todayRows ?? [];
  const todayVisits = Number(todayRowsArr[0]?.visits ?? 0);

  const perRestaurantRaw = rows.filter((r: any) => r.slug !== "");
  const named = await Promise.all(perRestaurantRaw.map(async (r: any) => {
    const [rest] = await db.select({ name: restaurants.name }).from(restaurants).where(eq(restaurants.slug, r.slug));
    return { slug: r.slug as string, name: rest?.name ?? r.slug, visits: Number(r.visits) };
  }));
  named.sort((a, b) => b.visits - a.visits);

  return { today: todayVisits, last30Days: global30, perRestaurant: named.slice(0, 10) };
});

// ---------- Mail server (SMTP) — configured by the super-admin ----------

export const getMailSettings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminWithModule('mail');
  const [cfg] = await db.select().from(mailSettings).where(eq(mailSettings.id, 1));
  if (!cfg) {
    return {
      enabled: false, smtpHost: "", smtpPort: 587, smtpSecure: false,
      smtpUser: "", hasPassword: false, fromName: "nreservi.online", fromEmail: "",
    };
  }
  // The password never leaves the server — the UI only knows that one exists.
  return {
    enabled: cfg.enabled,
    smtpHost: cfg.smtpHost,
    smtpPort: cfg.smtpPort,
    smtpSecure: cfg.smtpSecure,
    smtpUser: cfg.smtpUser,
    hasPassword: Boolean(cfg.smtpPass),
    fromName: cfg.fromName,
    fromEmail: cfg.fromEmail,
  };
});

export const saveMailSettings = createServerFn({ method: "POST" })
  .inputValidator((data: {
    enabled: boolean; smtpHost: string; smtpPort: number; smtpSecure: boolean;
    smtpUser: string; smtpPass?: string; fromName: string; fromEmail: string;
  }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('mail');
    if (!data.smtpHost.trim()) return { error: "L'hôte SMTP est requis." };
    if (!data.fromEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.fromEmail.trim())) {
      return { error: "L'e-mail expéditeur est requis et doit être valide." };
    }
    if (!(data.smtpPort >= 1 && data.smtpPort <= 65535)) return { error: "Port invalide." };

    const [existing] = await db.select().from(mailSettings).where(eq(mailSettings.id, 1));
    // Empty password field = keep the stored one.
    const smtpPass = data.smtpPass && data.smtpPass.length > 0 ? data.smtpPass : existing?.smtpPass ?? "";
    if (!smtpPass) return { error: "Le mot de passe SMTP est requis (au moins lors de la première configuration)." };

    const values = {
      enabled: data.enabled,
      smtpHost: data.smtpHost.trim(),
      smtpPort: data.smtpPort,
      smtpSecure: data.smtpSecure,
      smtpUser: data.smtpUser.trim(),
      smtpPass,
      fromName: data.fromName.trim() || "nreservi.online",
      fromEmail: data.fromEmail.trim(),
      updatedAt: new Date(),
    };
    await db
      .insert(mailSettings)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: mailSettings.id, set: values });
    await logAdmin("mail.config", data.smtpHost);
    return { success: true as const };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { to: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('mail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.to.trim())) return { error: "Adresse e-mail invalide." };
    const { sendMail, brandedEmail } = await import("./mail.server.js");
    const result = await sendMail({
      to: data.to.trim(),
      subject: "nreservi.online — e-mail de test",
      kind: "test",
      html: brandedEmail("Configuration réussie 🎉", [
        "Le serveur d'e-mails de nreservi.online est correctement configuré.",
        "Les restaurants recevront leurs notifications (bienvenue, abonnement, expiration) sur cette base.",
      ]),
    });
    return result.ok ? { success: true as const } : { error: result.error };
  });

/** Sends an email to every owner account of one restaurant (admin-composed). */
export const emailRestaurant = createServerFn({ method: "POST" })
  .inputValidator((data: { restaurantId: number; subject: string; body: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('mail');
    const subject = data.subject.trim();
    const body = data.body.trim().replace(/\n/g, "<br/>");
    if (!subject) return { error: "L'objet est requis." };
    if (!body) return { error: "Le message est requis." };

    const owners = await db
      .select({ email: restaurantOwners.email })
      .from(restaurantOwners)
      .where(eq(restaurantOwners.restaurantId, data.restaurantId));
    if (owners.length === 0) return { error: "Ce restaurant n'a pas de compte propriétaire." };

    const { sendMail, brandedEmail } = await import("./mail.server.js");
    let sent = 0;
    let lastError: string | null = null;
    for (const owner of owners) {
      const result = await sendMail({
        to: owner.email,
        subject,
        kind: "custom",
        html: brandedEmail(subject, [body]),
      });
      if (result.ok) sent++;
      else lastError = result.error;
    }
    return sent > 0 ? { success: true as const, sent } : { error: lastError ?? "Échec de l'envoi." };
  });

export const listMailLog = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminWithModule('mail');
  const { mailLog } = await import("../../db/schema.js");
  return db.select().from(mailLog).orderBy(sql`created_at desc`).limit(30);
});

/** Group/template email: personalized per owner ({{restaurant_name}}, {{owner_name}}). */
export const emailRestaurants = createServerFn({ method: "POST" })
  .inputValidator((data: { ids: number[]; subject: string; body: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('emails');
    if (data.ids.length === 0) return { error: "Sélectionnez au moins un restaurant." };
    const subject = data.subject.trim();
    const body = data.body.trim();
    if (!subject) return { error: "L'objet est requis." };
    if (!body) return { error: "Le message est requis." };

    const { sendMail, brandedEmail } = await import("./mail.server.js");
    let sent = 0;
    let failed = 0;
    let lastError: string | null = null;
    for (const id of data.ids) {
      const [r] = await db.select({ name: restaurants.name }).from(restaurants).where(eq(restaurants.id, id));
      if (!r) continue;
      const owners = await db
        .select({ email: restaurantOwners.email, name: restaurantOwners.name })
        .from(restaurantOwners)
        .where(eq(restaurantOwners.restaurantId, id));
      for (const o of owners) {
        const personalized = body
          .replace(/\{\{restaurant_name\}\}/g, r.name)
          .replace(/\{\{owner_name\}\}/g, o.name ?? "cher partenaire")
          .replace(/\n/g, "<br/>");
        const result = await sendMail({
          to: o.email,
          subject,
          kind: "custom",
          html: brandedEmail(subject, [personalized]),
        });
        if (result.ok) sent++;
        else { failed++; lastError = result.error; }
      }
    }
    if (sent === 0 && failed > 0) return { error: lastError ?? "Échec de l'envoi." };
    return { success: true as const, sent, failed };
  });

// ---------- Mail contacts (companies / advertisers) ----------

export const listMailContacts = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminWithModule('emails');
  const { mailContacts } = await import("../../db/schema.js");
  return db.select().from(mailContacts).orderBy(mailContacts.company, mailContacts.name);
});

export const addMailContact = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; company: string; email: string; note?: string }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('emails');
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    if (!name) return { error: "Le nom du contact est requis." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse e-mail invalide." };
    const { mailContacts } = await import("../../db/schema.js");
    const [contact] = await db
      .insert(mailContacts)
      .values({ name, company: data.company.trim(), email, note: data.note?.trim() ?? "" })
      .returning();
    return { contact };
  });

export const deleteMailContact = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('emails');
    const { mailContacts } = await import("../../db/schema.js");
    await db.delete(mailContacts).where(eq(mailContacts.id, data.id));
    return { success: true };
  });

/** Sends a composed email to selected companies (e.g. advertisers) — optional PDF invoice attached. */
export const emailContacts = createServerFn({ method: "POST" })
  .inputValidator((data: { ids: number[]; subject: string; body: string; amountDA?: string | null }) => data)
  .handler(async ({ data }) => {
    await requireAdminWithModule('emails');
    if (data.ids.length === 0) return { error: "Sélectionnez au moins un contact." };
    const subject = data.subject.trim();
    const body = data.body.trim();
    if (!subject) return { error: "L'objet est requis." };
    if (!body) return { error: "Le message est requis." };

    const { mailContacts } = await import("../../db/schema.js");
    const { sendMail, brandedEmail } = await import("./mail.server.js");

    const amount = data.amountDA?.trim() || null;
    let pdf: Buffer | null = null;
    const number = `FACT-${Date.now().toString(36).toUpperCase()}`;
    if (amount) {
      const { generateReceiptPdf } = await import("./receipt.server.js");
      pdf = await generateReceiptPdf({
        number,
        restaurantName: "Partenaire publicitaire",
        tier: "publicité",
        start: todayISO(),
        end: todayISO(),
        amountDA: amount,
        issuedAt: new Date(),
      });
    }

    let sent = 0;
    let failed = 0;
    let lastError: string | null = null;
    for (const id of data.ids) {
      const [contact] = await db.select().from(mailContacts).where(eq(mailContacts.id, id));
      if (!contact) continue;
      const personalized = body
        .replace(/\{\{contact_name\}\}/g, contact.name)
        .replace(/\{\{company\}\}/g, contact.company || contact.name)
        .replace(/\n/g, "<br/>");
      const result = await sendMail({
        to: contact.email,
        subject,
        kind: amount ? "invoice" : "custom",
        html: brandedEmail(subject, [personalized]),
        attachments: pdf ? [{ filename: `${number}.pdf`, content: pdf }] : undefined,
      });
      if (result.ok) sent++;
      else { failed++; lastError = result.error; }
    }
    if (sent === 0 && failed > 0) return { error: lastError ?? "Échec de l'envoi." };
    return { success: true as const, sent, failed };
  });


export const listAdminLogs = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireAdmin();
  if (session.adminRole !== "super") return [];
  const { adminLogs } = await import("../../db/schema.js");
  return db.select().from(adminLogs).orderBy(sql`created_at desc`).limit(100);
});

// ---------- Public landing page content (/about) ----------

const DEFAULT_PACKAGES = [
  {
    name: "Basique",
    price: "0 DA",
    period: "par mois",
    features: ["Fiche restaurant publique", "Menu en ligne", "Espaces & tables (vue)"],
    kind: "subscription",
    popular: false,
  },
  {
    name: "Premium",
    price: "2 500 DA",
    period: "par mois",
    features: ["Module de réservation en ligne", "Chaises bébé & options", "Marketing WhatsApp", "Statistiques avancées"],
    kind: "subscription",
    popular: true,
  },
  {
    name: "Publicité",
    price: "à partir de 5 000 DA",
    period: "par mois",
    features: ["Carte mise en avant sur les pages restaurants", "Carrousel 2 emplacements", "Audience ciblée par établissement"],
    kind: "ads",
    popular: false,
  },
];

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { siteContent } = await import("../../db/schema.js");
  const [row] = await db.select().from(siteContent).where(eq(siteContent.id, 1));
  if (!row) {
    return {
      about: "nreservi.online est une solution digitale algérienne de réservation de table en ligne. Nous simplifions la relation entre les restaurants et leurs clients : réservation en temps réel, confirmation par WhatsApp et gestion complète pour les professionnels.",
      contactEmail: "",
      contactPhone: "",
      homeHeroImageUrl: null,
      packages: DEFAULT_PACKAGES,
    };
  }
  return {
    about: row.about,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    homeHeroImageUrl: row.homeHeroImageUrl,
    packages: (row.packages as unknown[]) ?? DEFAULT_PACKAGES,
  };
});

export const saveSiteContent = createServerFn({ method: "POST" })
  .inputValidator((data: {
    about: string
    contactEmail: string
    contactPhone: string
    homeHeroImageUrl?: string | null
    packages: { name: string; price: string; period?: string; features: string[]; kind: string; popular?: boolean }[]
  }) => data)
  .handler(async ({ data }) => {
    const session = await requireAdmin();
    if (session.adminRole !== "super") return { error: "Seul le super administrateur peut modifier la page de présentation." };

    const packages = (data.packages ?? [])
      .filter((p) => p.name?.trim())
      .map((p) => ({
        name: p.name.trim(),
        price: p.price?.trim() ?? "",
        period: p.period?.trim() ?? "",
        features: (p.features ?? []).filter((f) => f.trim()),
        kind: p.kind === "ads" ? "ads" : "subscription",
        popular: Boolean(p.popular),
      }));

    const values = {
      about: data.about.trim(),
      contactEmail: data.contactEmail.trim(),
      contactPhone: data.contactPhone.trim(),
      homeHeroImageUrl: data.homeHeroImageUrl?.trim() || null,
      packages,
      updatedAt: new Date(),
    };
    const { siteContent } = await import("../../db/schema.js");
    await db
      .insert(siteContent)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: siteContent.id, set: values });
    await logAdmin("landing.update", "Page de présentation mise à jour");
    return { success: true as const };
  });

// ---------- Event themes (per restaurant or all) ----------

export const setEventTheme = createServerFn({ method: "POST" })
  .inputValidator((data: { theme: string; ids: number[] | null }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const { EVENT_THEME_KEYS } = await import("../services/event-themes.js");
    const theme = (EVENT_THEME_KEYS as string[]).includes(data.theme) ? data.theme : "";

    if (data.ids === null) {
      const updated = await db.update(restaurants).set({ eventTheme: theme }).returning({ id: restaurants.id });
      await logAdmin("event.theme", `Thème « ${theme || "aucun"} » appliqué à TOUS les restaurants (${updated.length})`);
      return { success: true as const, updated: updated.length };
    }
    for (const id of data.ids) {
      await db.update(restaurants).set({ eventTheme: theme }).where(eq(restaurants.id, id));
    }
    await logAdmin("event.theme", `Thème « ${theme || "aucun"} » appliqué à ${data.ids.length} restaurant(s)`);
    return { success: true as const, updated: data.ids.length };
  });

export const listEventThemes = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { EVENT_THEMES } = await import("../services/event-themes.js");
  const rows = await db.select({ id: restaurants.id, name: restaurants.name, eventTheme: restaurants.eventTheme }).from(restaurants).orderBy(restaurants.name);
  return { themes: EVENT_THEMES, restaurants: rows };
});
