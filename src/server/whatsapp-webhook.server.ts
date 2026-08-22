import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, gte, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { customers, reservations, whatsappMessages } from "../../db/schema.js";

/**
 * Inbound WhatsApp webhook handler. On a VPS this is mounted by
 * server/index.mts at POST /api/whatsapp-webhook — point your provider's
 * webhook URL there.
 *
 * When WHATSAPP_APP_SECRET is configured, requests must carry Meta's
 * X-Hub-Signature-256 header (HMAC-SHA256 of the raw body) or they are
 * rejected. Without the secret (mock/prototype mode) everything is accepted.
 */
export async function handleWhatsappWebhook(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();

  const secret = process.env.WHATSAPP_APP_SECRET;
  if (secret) {
    const provided = req.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept both the simple shape used in the prototype and Meta Cloud API's
  // entry[0].changes[0].value.messages[0] shape.
  const from: string | undefined =
    payload?.from ??
    payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
  const body: string | undefined =
    payload?.body ??
    payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;

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
    // Target the customer's SOONEST upcoming actionable reservation — never a
    // past or already-cancelled one.
    const today = new Date().toISOString().slice(0, 10);
    const [upcoming] = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.customerId, customer.id),
          gte(reservations.date, today),
          inArray(reservations.status, ["pending", "confirmed"]),
        ),
      )
      .orderBy(reservations.date, reservations.time)
      .limit(1);

    if (upcoming) {
      await db
        .update(reservations)
        .set({ status: text === "CANCEL" ? "cancelled" : "confirmed", updatedAt: new Date() })
        .where(eq(reservations.id, upcoming.id));
      return Response.json({ handled: text.toLowerCase() });
    }
  }

  return Response.json({ handled: "logged" });
}
