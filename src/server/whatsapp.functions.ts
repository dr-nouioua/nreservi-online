import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { restaurants, whatsappTemplates, whatsappMessages, reservations } from "../../db/schema.js";
import { requireRestaurantId } from "./owner.functions.js";
import {
  DEFAULT_WHATSAPP_TEMPLATES,
  WHATSAPP_TEMPLATE_KINDS,
  normalizePhoneNumber,
  type WhatsappTemplateKind,
} from "../services/whatsapp.js";

const VALID_KINDS = new Set<string>(WHATSAPP_TEMPLATE_KINDS.map((t) => t.kind));

function assertKind(kind: string): WhatsappTemplateKind {
  if (!VALID_KINDS.has(kind)) throw new Error("Unknown template kind");
  return kind as WhatsappTemplateKind;
}

export type OwnerWhatsappSettings = {
  businessName: string;
  whatsappNumber: string | null;
  templates: {
    kind: WhatsappTemplateKind;
    body: string;
    enabled: boolean;
    customized: boolean;
    isDefault: boolean;
  }[];
};

/**
 * The restaurant's own WhatsApp number plus its templates, with code defaults filled in
 * for every kind the owner hasn't customized yet.
 */
export const getWhatsappSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<OwnerWhatsappSettings> => {
    const restaurantId = await requireRestaurantId();
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId));
    const stored = await db
      .select()
      .from(whatsappTemplates)
      .where(eq(whatsappTemplates.restaurantId, restaurantId));

    return {
      businessName: restaurant?.name ?? "",
      whatsappNumber: restaurant?.whatsappNumber ?? null,
      templates: WHATSAPP_TEMPLATE_KINDS.map(({ kind }) => {
        const row = stored.find((t) => t.kind === kind);
        const body = row?.body ?? DEFAULT_WHATSAPP_TEMPLATES[kind];
        return {
          kind,
          body,
          enabled: row?.enabled ?? true,
          customized: Boolean(row),
          isDefault: body === DEFAULT_WHATSAPP_TEMPLATES[kind],
        };
      }),
    };
  },
);

/** Validates and normalizes to E.164 before storing. Empty input clears the number. */
export const saveWhatsappNumber = createServerFn({ method: "POST" })
  .inputValidator((data: { number: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const raw = (data.number ?? "").trim();

    if (!raw) {
      await db.update(restaurants).set({ whatsappNumber: null }).where(eq(restaurants.id, restaurantId));
      return { success: true as const, whatsappNumber: null };
    }

    const normalized = normalizePhoneNumber(raw);
    if (!normalized.ok) return { success: false as const, error: normalized.error };

    await db
      .update(restaurants)
      .set({ whatsappNumber: normalized.e164 })
      .where(eq(restaurants.id, restaurantId));
    return { success: true as const, whatsappNumber: normalized.e164 };
  });

export const saveWhatsappTemplate = createServerFn({ method: "POST" })
  .inputValidator((data: { kind: string; body: string; enabled: boolean }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const kind = assertKind(data.kind);
    const body = (data.body ?? "").trim();
    if (!body) return { success: false as const, error: "Le message ne peut pas être vide." };
    if (body.length > 4000) return { success: false as const, error: "Le message est trop long (4000 caractères max)." };

    await db
      .insert(whatsappTemplates)
      .values({ restaurantId, kind, body, enabled: data.enabled })
      .onConflictDoUpdate({
        target: [whatsappTemplates.restaurantId, whatsappTemplates.kind],
        set: { body, enabled: data.enabled, updatedAt: new Date() },
      });

    return { success: true as const };
  });

/** Restores the French default by dropping the override row. */
export const resetWhatsappTemplate = createServerFn({ method: "POST" })
  .inputValidator((data: { kind: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const kind = assertKind(data.kind);
    await db
      .delete(whatsappTemplates)
      .where(and(eq(whatsappTemplates.restaurantId, restaurantId), eq(whatsappTemplates.kind, kind)));
    return { success: true as const, body: DEFAULT_WHATSAPP_TEMPLATES[kind] };
  });

/**
 * Records that the owner opened WhatsApp for a reservation. Status is "prepared", never
 * "sent" — the platform cannot know whether the owner pressed Send. This is also the hook
 * a V2 Business API implementation would replace with a real send.
 */
export const logWhatsappHandoff = createServerFn({ method: "POST" })
  .inputValidator((data: { reservationId: number; kind: string; body: string }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const kind = assertKind(data.kind);
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.id, data.reservationId), eq(reservations.restaurantId, restaurantId)));
    if (!reservation) throw new Error("Reservation not found");

    await db.insert(whatsappMessages).values({
      restaurantId,
      customerId: reservation.customerId,
      direction: "outbound",
      kind: kind === "request_received" ? "confirmation" : kind,
      body: data.body.slice(0, 4000),
      status: "prepared",
    });
    return { success: true as const };
  });
