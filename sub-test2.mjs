import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/mac/Library/Caches/ms-playwright/chromium_headless_shell-1148/chrome-mac/headless_shell" });
const page = await (await browser.newContext()).newPage();
page.on("response", async r => { if (r.url().includes("/_serverFn/")) console.log("RPC:", r.status(), (await r.text().catch(()=>"")).slice(0, 120)); });
await page.goto("http://127.0.0.1:3000/admin/login", { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => { const el = document.querySelector('input'); return el && Object.keys(el).some(k => k.startsWith('__reactProps')); }, null, { timeout: 15000 });
await page.locator("input").nth(0).fill("admin@platform.dev");
await page.locator('input[type="password"]').fill("admin123");
await page.locator("button").first().click();
await page.waitForFunction(() => !window.location.pathname.includes("login"), null, { timeout: 10000 }).catch(() => {});
await page.goto("http://127.0.0.1:3000/admin/subscriptions", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
// renewal: 3 months on the first card
await page.locator("select").nth(1).selectOption("3");
await page.locator("text=Renouveler").first().click();
await page.waitForTimeout(2500);
console.log("after renewal, end dates:", (await page.locator("text=/\\d{2}\\/\\d{2}\\/\\d{4}/").allTextContents()).slice(0, 3));
await browser.close();
