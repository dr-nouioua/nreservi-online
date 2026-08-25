import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/mac/Library/Caches/ms-playwright/chromium_headless_shell-1148/chrome-mac/headless_shell" });
const page = await (await browser.newContext()).newPage();
page.on("pageerror", e => console.log("PAGEERROR:", String(e).slice(0, 200)));
page.on("response", async r => {
  if (r.url().includes("/_serverFn/")) {
    console.log("RPC:", r.status(), (await r.text().catch(()=>"")).slice(0, 160));
  }
});

await page.goto("http://127.0.0.1:3000/admin/login", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => {
  const el = document.querySelector('input');
  return el && Object.keys(el).some(k => k.startsWith('__reactProps'));
}, null, { timeout: 15000 });
await page.locator("input").nth(0).fill("admin@platform.dev");
await page.locator('input[type="password"]').fill("admin123");
await page.locator("button").first().click();
await page.waitForFunction(() => !window.location.pathname.includes("login"), null, { timeout: 10000 }).catch(() => {});
console.log("logged in:", page.url());

await page.goto("http://127.0.0.1:3000/admin/subscriptions", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const cards = await page.locator("text=Modifier les dates").count();
console.log("restaurant cards:", cards);

// open the first card's date editor
await page.locator("text=Modifier les dates").first().click();
await page.waitForTimeout(400);
const dateInputs = page.locator('input[type="date"]');
console.log("date inputs:", await dateInputs.count());
await dateInputs.nth(0).fill("2026-09-01");
await dateInputs.nth(1).fill("2027-02-28");
await page.click("text=Enregistrer");
await page.waitForTimeout(3000);
console.log("editor still open:", await page.locator('input[type="date"]').count() > 0);
console.log("message:", await page.locator(".text-lime-800, .text-lime-300, .text-red-600").allTextContents());

// reload and check persistence
await page.goto("http://127.0.0.1:3000/admin/subscriptions", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
console.log("dates shown:", (await page.locator('text=/0\\d\\/\\d{2}\\/\\d{4}/').allTextContents()).slice(0, 4));
await browser.close();
