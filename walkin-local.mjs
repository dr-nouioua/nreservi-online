import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/mac/Library/Caches/ms-playwright/chromium_headless_shell-1148/chrome-mac/headless_shell" });
const page = await (await browser.newContext()).newPage();
page.on("console", m => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 250)); });
page.on("pageerror", e => console.log("PAGEERROR:", String(e).slice(0, 300)));
let walkinRpc = null;
page.on("response", async r => {
  if (r.url().includes("/_serverFn/")) {
    const b = await r.text().catch(()=>"");
    if (b.includes("walk_in") || b.includes("assignedTableId")) walkinRpc = r.status() + " " + b.slice(0, 150);
  }
});
await page.goto("http://127.0.0.1:3000/owner/login", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => { const el = document.querySelector('input'); return el && Object.keys(el).some(k => k.startsWith('__reactProps')); }, null, { timeout: 15000 });
await page.locator("input").nth(0).fill("owner@olivetable.dev");
await page.locator('input[type="password"]').fill("owner123");
await page.locator("button").first().click();
await page.waitForFunction(() => !window.location.pathname.includes("login"), null, { timeout: 15000 }).catch(() => {});
console.log("url:", page.url());
console.log("walk-in count:", await page.locator('text=Walk-in').count());
await page.waitForTimeout(2500);
await page.click("text=Show Error").catch(()=>{});
await page.waitForTimeout(500);
console.log("ERROR DETAILS:", (await page.locator("body").textContent()).slice(0, 400));
await page.setViewportSize({ width: 1280, height: 800 });
await page.locator('text=Walk-in').first().click();
await page.waitForTimeout(500);
await page.fill('input[placeholder="Nom du client"]', "Walk-in Test Local");
await page.fill('input[placeholder="Téléphone"]', "0555 44 33 22");
await page.locator("text=Ajouter").click();
await page.waitForTimeout(3000);
console.log("modal open:", await page.locator("text=Nouvelle arrivée").count() > 0);
console.log("walk-in on board:", await page.locator("text=Walk-in Test Local").count() > 0);
console.log("walk-in RPC:", walkinRpc ?? "none captured");
await browser.close();
