const base = process.argv[2];
const browser = (await import("playwright-core")).chromium;
const b = await browser.launch({ executablePath: "/Users/mac/Library/Caches/ms-playwright/chromium_headless_shell-1148/chrome-mac/headless_shell" });
const page = await (await b.newContext()).newPage();
for (const path of ["/", "/owner/login", "/admin/login"]) {
  await page.goto(base + path, { waitUntil: "domcontentloaded" }).catch(e => console.log(path, "NAV-ERR", String(e).slice(0,80)));
  await page.waitForTimeout(1200);
  const scripts = await page.locator("script[src]").count();
  console.log(path.padEnd(15), "scripts:", scripts);
}
await b.close();
