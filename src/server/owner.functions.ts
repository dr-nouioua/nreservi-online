import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  reservations,
  tables,
  areas,
  restaurants,
  menuCategories,
  menuItems,
  customers,
  marketingSegments,
  marketingTemplates,
  marketingRules,
  campaignLogs,
  whatsappMessages,
} from "../../db/schema.js";
import { requireSession } from "./auth.functions.js";
import { sendWhatsappMessage, renderTemplate } from "./whatsapp.server.js";
import { randomToken } from "./session.server.js";

export async function requireRestaurantId(): Promise<number> {
  const session = await requireSession();
  if (!session || (session.role !== "owner" && session.role !== "staff")) {
    throw new Error("Not authorized");
  }
  return session.restaurantId;
}

export const getOwnerOverview = createServerFn({ method: "GET" }).handler(async () => {
  const restaurantId = await requireRestaurantId();
  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId));
  const areaRows = await db.select().from(areas).where(eq(areas.restaurantId, restaurantId));
  const tableRows = await db.select().from(tables).where(eq(tables.restaurantId, restaurantId));
  return { restaurant, areas: areaRows, tables: tableRows };
});

export const listReservationsForDate = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const rows = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.restaurantId, restaurantId), eq(reservations.date, data.date)))
      .orderBy(reservations.time);
    return rows;
  });

export const updateReservationStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; status: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db
      .update(reservations)
      .set({ status: data.status, updatedAt: new Date() })
      .where(and(eq(reservations.id, data.id), eq(reservations.restaurantId, restaurantId)));
    return { success: true };
  });

export const updateReservationNotes = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; notes: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db
      .update(reservations)
      .set({ notes: data.notes, updatedAt: new Date() })
      .where(and(eq(reservations.id, data.id), eq(reservations.restaurantId, restaurantId)));
    return { success: true };
  });

export const createWalkIn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      guestName: string;
      guestPhone: string;
      partySize: number;
      date: string;
      time: string;
      tableId: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [table] = await db.select().from(tables).where(eq(tables.id, data.tableId));
    const [reservation] = await db
      .insert(reservations)
      .values({
        restaurantId,
        tableId: data.tableId,
        areaId: table?.areaId,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        partySize: data.partySize,
        date: data.date,
        time: `${data.time}:00`,
        status: "seated",
        source: "walk_in",
        confirmationCode: randomToken(),
      })
      .returning();
    return reservation;
  });

export const getAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const restaurantId = await requireRestaurantId();
  const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId));
  const allRes = await db.select().from(reservations).where(eq(reservations.restaurantId, restaurantId));
  const tableRows = await db.select().from(tables).where(eq(tables.restaurantId, restaurantId));

  const total = allRes.length;
  const noShows = allRes.filter((r) => r.status === "no_show").length;
  const cancelled = allRes.filter((r) => r.status === "cancelled").length;
  const completed = allRes.filter((r) => r.status === "completed" || r.status === "seated").length;

  const byHour: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const byArea: Record<number, number> = {};
  const customerVisits: Record<string, number> = {};

  for (const r of allRes) {
    const hour = r.time.slice(0, 2);
    byHour[hour] = (byHour[hour] ?? 0) + 1;
    const weekday = new Date(r.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
    byDay[weekday] = (byDay[weekday] ?? 0) + 1;
    if (r.areaId) byArea[r.areaId] = (byArea[r.areaId] ?? 0) + 1;
    customerVisits[r.guestPhone] = (customerVisits[r.guestPhone] ?? 0) + 1;
  }

  const repeatCustomers = Object.values(customerVisits).filter((v) => v > 1).length;
  const newCustomers = Object.values(customerVisits).filter((v) => v === 1).length;

  const occupancyRate = tableRows.length > 0 ? Math.min(100, Math.round((total / (tableRows.length * 7)) * 100)) : 0;
  const revenueEstimate = completed * Number(restaurant?.avgTicketPrice ?? 0);

  const areaRows = await db.select().from(areas).where(eq(areas.restaurantId, restaurantId));

  return {
    total,
    noShowRate: total ? Math.round((noShows / total) * 100) : 0,
    cancellationRate: total ? Math.round((cancelled / total) * 100) : 0,
    occupancyRate,
    revenueEstimate,
    repeatCustomers,
    newCustomers,
    byHour,
    byDay,
    byArea: Object.fromEntries(
      Object.entries(byArea).map(([areaId, count]) => [
        areaRows.find((a) => a.id === Number(areaId))?.name ?? areaId,
        count,
      ]),
    ),
  };
});

export const updateRestaurantSettings = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      name: string;
      description: string;
      logoUrl: string;
      coverImageUrl: string;
      avgTicketPrice: string;
      openingHours: Record<string, { open: string; close: string }[]>;
    }) => data,
  )
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db
      .update(restaurants)
      .set({
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl || null,
        coverImageUrl: data.coverImageUrl || null,
        avgTicketPrice: data.avgTicketPrice,
        openingHours: data.openingHours,
      })
      .where(eq(restaurants.id, restaurantId));
    return { success: true };
  });

export const setShowMenuImages = createServerFn({ method: "POST" })
  .inputValidator((data: { enabled: boolean }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db.update(restaurants).set({ showMenuImages: data.enabled }).where(eq(restaurants.id, restaurantId));
    return { success: true };
  });

export const addArea = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [area] = await db.insert(areas).values({ restaurantId, name: data.name }).returning();
    return area;
  });

export const addTable = createServerFn({ method: "POST" })
  .inputValidator((data: { areaId: number; label: string; capacity: number; shape: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [table] = await db
      .insert(tables)
      .values({
        restaurantId,
        areaId: data.areaId,
        label: data.label,
        capacity: data.capacity,
        shape: data.shape,
        posX: Math.floor(Math.random() * 300),
        posY: Math.floor(Math.random() * 200),
      })
      .returning();
    return table;
  });

export const deleteTable = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db.delete(tables).where(and(eq(tables.id, data.id), eq(tables.restaurantId, restaurantId)));
    return { success: true };
  });

export const getMenu = createServerFn({ method: "GET" }).handler(async () => {
  const restaurantId = await requireRestaurantId();
  const [cats, items, rows] = await Promise.all([
    db.select().from(menuCategories).where(eq(menuCategories.restaurantId, restaurantId)),
    db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)),
    db.select({ showMenuImages: restaurants.showMenuImages }).from(restaurants).where(eq(restaurants.id, restaurantId)),
  ]);
  return {
    showMenuImages: rows[0]?.showMenuImages ?? true,
    categories: cats.map((c) => ({ ...c, items: items.filter((i) => i.categoryId === c.id) })),
  };
});

export const addMenuCategory = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [cat] = await db.insert(menuCategories).values({ restaurantId, name: data.name }).returning();
    return cat;
  });

export const addMenuItem = createServerFn({ method: "POST" })
  .inputValidator((data: { categoryId: number; name: string; description: string; price: string; photoUrl?: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [item] = await db
      .insert(menuItems)
      .values({
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        photoUrl: data.photoUrl || null,
        available: true,
      })
      .returning();
    return item;
  });

export const updateMenuItem = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: number; categoryId?: number; name: string; description: string; price: string; photoUrl?: string | null }) => data,
  )
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    // A forged categoryId must not point at another tenant's category.
    if (data.categoryId != null) {
      const [cat] = await db
        .select({ id: menuCategories.id })
        .from(menuCategories)
        .where(and(eq(menuCategories.id, data.categoryId), eq(menuCategories.restaurantId, restaurantId)));
      if (!cat) throw new Error("Invalid category");
    }
    await db
      .update(menuItems)
      .set({
        ...(data.categoryId != null ? { categoryId: data.categoryId } : {}),
        name: data.name,
        description: data.description,
        price: data.price,
        photoUrl: data.photoUrl || null,
      })
      .where(and(eq(menuItems.id, data.id), eq(menuItems.restaurantId, restaurantId)));
    return { success: true };
  });

export const deleteMenuItem = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db.delete(menuItems).where(and(eq(menuItems.id, data.id), eq(menuItems.restaurantId, restaurantId)));
    return { success: true };
  });

export const deleteMenuCategory = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    // Items first — there is no ON DELETE cascade between menu_items and menu_categories.
    await db.delete(menuItems).where(and(eq(menuItems.categoryId, data.id), eq(menuItems.restaurantId, restaurantId)));
    await db.delete(menuCategories).where(and(eq(menuCategories.id, data.id), eq(menuCategories.restaurantId, restaurantId)));
    return { success: true };
  });

export const toggleMenuItemAvailability = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; available: boolean }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db
      .update(menuItems)
      .set({ available: data.available })
      .where(and(eq(menuItems.id, data.id), eq(menuItems.restaurantId, restaurantId)));
    return { success: true };
  });

export const getMarketing = createServerFn({ method: "GET" }).handler(async () => {
  const restaurantId = await requireRestaurantId();
  const segments = await db.select().from(marketingSegments).where(eq(marketingSegments.restaurantId, restaurantId));
  const templates = await db.select().from(marketingTemplates).where(eq(marketingTemplates.restaurantId, restaurantId));
  const rules = await db.select().from(marketingRules).where(eq(marketingRules.restaurantId, restaurantId));
  const logs = await db
    .select({ log: campaignLogs, customer: customers, template: marketingTemplates })
    .from(campaignLogs)
    .innerJoin(customers, eq(campaignLogs.customerId, customers.id))
    .leftJoin(marketingTemplates, eq(campaignLogs.templateId, marketingTemplates.id))
    .where(eq(campaignLogs.restaurantId, restaurantId));

  const perf = {
    sent: logs.length,
    delivered: logs.filter((l) => ["delivered", "read", "booked"].includes(l.log.status)).length,
    read: logs.filter((l) => ["read", "booked"].includes(l.log.status)).length,
    booked: logs.filter((l) => l.log.status === "booked").length,
  };

  return { segments, templates, rules, logs, perf };
});

export const addMarketingTemplate = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; body: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [tpl] = await db
      .insert(marketingTemplates)
      .values({ restaurantId, name: data.name, body: data.body })
      .returning();
    return tpl;
  });

export const toggleMarketingRule = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number; active: boolean }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    await db
      .update(marketingRules)
      .set({ active: data.active })
      .where(and(eq(marketingRules.id, data.id), eq(marketingRules.restaurantId, restaurantId)));
    return { success: true };
  });

export const addMarketingRule = createServerFn({ method: "POST" })
  .inputValidator((data: { segmentId: number; templateId: number }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [rule] = await db
      .insert(marketingRules)
      .values({ restaurantId, segmentId: data.segmentId, templateId: data.templateId, active: true })
      .returning();
    return rule;
  });

// Runs each active rule against its segment's matching customers and sends
// the WhatsApp template to everyone who is opted in. In production this
// would be triggered by a scheduled function (see netlify/functions/marketing-cron.ts).
export const runMarketingRuleNow = createServerFn({ method: "POST" })
  .inputValidator((data: { ruleId: number }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const [rule] = await db.select().from(marketingRules).where(eq(marketingRules.id, data.ruleId));
    if (!rule || rule.restaurantId !== restaurantId) throw new Error("Rule not found");
    const [template] = await db.select().from(marketingTemplates).where(eq(marketingTemplates.id, rule.templateId));
    if (!template) throw new Error("Template not found");

    const restRes = await db
      .select({ reservation: reservations, customer: customers })
      .from(reservations)
      .innerJoin(customers, eq(reservations.customerId, customers.id))
      .where(and(eq(reservations.restaurantId, restaurantId), eq(customers.whatsappOptIn, true)));

    const uniqueCustomers = new Map<number, { id: number; name: string | null; phone: string; lastVisit: string }>();
    for (const row of restRes) {
      const existing = uniqueCustomers.get(row.customer.id);
      if (!existing || row.reservation.date > existing.lastVisit) {
        uniqueCustomers.set(row.customer.id, {
          id: row.customer.id,
          name: row.customer.name,
          phone: row.customer.phone,
          lastVisit: row.reservation.date,
        });
      }
    }

    const targets = Array.from(uniqueCustomers.values()).slice(0, 10);
    let sent = 0;
    for (const target of targets) {
      const offerCode = `SAVE${Math.floor(Math.random() * 900 + 100)}`;
      const body = renderTemplate(template.body, {
        name: target.name ?? "there",
        last_visit_date: target.lastVisit,
        offer_code: offerCode,
      });
      await sendWhatsappMessage({ restaurantId, customerId: target.id, kind: "marketing", body });
      await db.insert(campaignLogs).values({
        restaurantId,
        ruleId: rule.id,
        customerId: target.id,
        templateId: template.id,
        status: "sent",
      });
      sent++;
    }

    return { sent };
  });

export const getWhatsappLog = createServerFn({ method: "GET" }).handler(async () => {
  const restaurantId = await requireRestaurantId();
  return db.select().from(whatsappMessages).where(eq(whatsappMessages.restaurantId, restaurantId)).orderBy(sql`created_at desc`).limit(50);
});
