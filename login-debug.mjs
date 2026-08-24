import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/mac/Library/Caches/ms-playwright/chromium_headless_shell-1148/chrome-mac/headless_shell" });
const page = await (await browser.newContext()).newPage();
page.on("response", async r => {
  if (r.url().includes("/_serverFn/")) console.log("RPC:", r.status(), (await r.text().catch(()=>"")).slice(0, 200));
});
await page.goto("https://nreservi.online/owner/login", { waitUntil: "domcontentloaded" });
await page.locator("input").nth(0).fill("owner@olivetable.dev");
await page.locator('input[type="password"]').fill("owner123");
await page.locator("button").first().click();
await page.waitForTimeout(3000);
console.log("URL:", page.url());
const errs = await page.locator(".text-red-600, .text-red-400").allTextContents();
console.log("error shown:", errs);
await browser.close();
