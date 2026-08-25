import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

// Built by `pnpm build`: a standard Web-fetch handler (default export).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ssr: { fetch: (req: Request) => Promise<Response> } = (await import("../dist/server/server.js")).default;

import { handleWhatsappWebhook } from "../src/server/whatsapp-webhook.server.js";
import { runReservationReminders } from "../src/server/reservation-reminders.server.js";
import { sqlClient } from "../db/index.js";

const app = new Hono();

// ---- Health probe (for uptime monitors / docker healthcheck) ----
app.get("/api/health", (c) => c.json({ ok: true }));

// ---- Inbound WhatsApp webhook (replaces netlify/functions/whatsapp-webhook) ----
app.all("/api/whatsapp-webhook", (c) => handleWhatsappWebhook(c.req.raw));

// ---- Scheduled jobs endpoints, called from system cron on the VPS:
//      0 * * * * curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" \
//        http://127.0.0.1:3000/api/cron/reservation-reminders
//      30 * * * * curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" \
//        http://127.0.0.1:3000/api/cron/sync-subscriptions
app.post("/api/cron/reservation-reminders", async (c) => cronGuard(c, () => runReservationReminders()));
app.post("/api/cron/sync-subscriptions", async (c) =>
  cronGuard(c, async () => {
    const { syncExpiredSubscriptionsInternal } = await import("../src/server/subscription.server.js");
    return Response.json({ suspended: await syncExpiredSubscriptionsInternal() });
  }),
);
app.post("/api/cron/subscription-warnings", async (c) =>
  cronGuard(c, async () => {
    const { sendSubscriptionWarningsInternal } = await import("../src/server/subscription.server.js");
    return Response.json(await sendSubscriptionWarningsInternal());
  }),
);

async function cronGuard(c: { req: { header: (k: string) => string | undefined } }, run: () => Promise<Response>) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return c.json({ error: "CRON_SECRET is not configured" }, 503);
  }
  if (c.req.header("x-cron-secret") !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return run();
}

// ---- Static client assets (Vite emits them under dist/client) ----
app.use("*", serveStatic({ root: "./dist/client" }));

// ---- Visitor counting (GET pages only; "" slug = whole platform) ----
app.all("*", async (c, next) => {
  await next();
  try {
    const isHtmlGet = c.req.method === "GET"
      && !c.req.path.startsWith("/assets")
      && !c.req.path.startsWith("/api")
      && !c.req.path.startsWith("/brand")
      && (c.res.headers.get("content-type") ?? "").includes("text/html");
    if (isHtmlGet) {
      const day = new Date().toISOString().slice(0, 10);
      const slug = c.req.path.startsWith("/restaurants/") ? decodeURIComponent(c.req.path.split("/")[2] ?? "") : "";
      await sqlClient`
        INSERT INTO visit_counts (day, slug, count) VALUES (${day}, ${slug}, 1)
        ON CONFLICT (day, slug) DO UPDATE SET count = visit_counts.count + 1`;
    }
  } catch { /* counting must never break a page render */ }
  return c.res;
});

// ---- Everything else: TanStack Start SSR ----
app.all("*", async (c) => {
  const response = await ssr.fetch(c.req.raw);
  return response;
});

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST ?? "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`nreservi.online running on http://${hostname}:${info.port}`);
});

// Close DB pool cleanly on shutdown (systemd/docker stop).
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    void sqlClient.end().finally(() => process.exit(0));
  });
}
