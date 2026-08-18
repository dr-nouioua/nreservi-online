import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { customers, reservations, whatsappMessages } from "../../db/schema.js";

/**
 * Inbound WhatsApp webhook. In production, point the WhatsApp Business
 * Platform (Meta Cloud API) or Twilio webhook URL at
 * `/.netlify/functions/whatsapp-webhook`. This stub demonstrates the
 * "reply CANCEL/CONFIRM/STOP" behavior described in the spec by parsing the
 * inbound body and updating reservation/customer state accordingly.
 *
 * Expected payload shape (adapt to the real provider's schema):
 * { "from": "+15551234567", "body": "CANCEL" }
 */
export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await req.json().catch(() => null);
  const from: string | undefined = payload?.from;
  const body: string | undefined = payload?.body;
  if (!from || !body) {
    return Response.json({ error: "Missing from/body" }, { status: 400 });
  }

  const text = body.trim().toUpperCase();

  const [customer] = await db.select().from(customers).where(eq(customers.phone, from));

  await db.insert(whatsappMessages).values({
    restaurantId: null,
    customerId: customer?.id ?? null,
    direction: "inbound",
    kind: "inbound_reply",
    body,
    status: "delivered",
  });

  if (text === "STOP" && customer) {
    await db.update(customers).set({ whatsappOptIn: false }).where(eq(customers.id, customer.id));
    return Response.json({ handled: "opted_out" });
  }

  if ((text === "CANCEL" || text === "CONFIRM") && customer) {
    const [latest] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.customerId, customer.id))
      .orderBy(reservations.createdAt)
      .limit(1);
    if (latest) {
      await db
        .update(reservations)
        .set({ status: text === "CANCEL" ? "cancelled" : "confirmed", updatedAt: new Date() })
        .where(eq(reservations.id, latest.id));
      return Response.json({ handled: text.toLowerCase() });
    }
  }

  return Response.json({ handled: "logged" });
};

export const config: Config = {
  path: "/api/whatsapp-webhook",
};
