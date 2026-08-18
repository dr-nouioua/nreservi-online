import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { whatsappMessages } from "../../db/schema.js";

/**
 * Mock WhatsApp sender. In production this calls the WhatsApp Business
 * Platform (Meta Cloud API) or Twilio's WhatsApp API using
 * WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID env vars. Every message is
 * logged so the owner dashboard and customer account area can show delivery
 * status, and so campaign performance tracking has real rows to read from.
 */
export async function sendWhatsappMessage(opts: {
  restaurantId: number | null;
  customerId: number | null;
  kind: "confirmation" | "reminder" | "cancellation" | "modification" | "marketing" | "inbound_reply";
  body: string;
}) {
  const [msg] = await db
    .insert(whatsappMessages)
    .values({
      restaurantId: opts.restaurantId,
      customerId: opts.customerId,
      direction: "outbound",
      kind: opts.kind,
      body: opts.body,
      status: "sent",
    })
    .returning();

  // Simulate an async delivery receipt a moment later.
  setTimeout(() => {
    db.update(whatsappMessages)
      .set({ status: "delivered" })
      .where(eq(whatsappMessages.id, msg.id))
      .catch(() => {});
  }, 5);

  return msg;
}

export function renderTemplate(body: string, vars: Record<string, string>) {
  return body.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}
