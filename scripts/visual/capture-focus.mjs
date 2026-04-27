import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 600, height: 200 }, deviceScaleFactor: 2 });

const page = await ctx.newPage();
await page.goto("http://localhost:6006/iframe.html?id=atoms-input--default&viewMode=story", {
  waitUntil: "networkidle",
});
await page.locator("input").focus();
await page.waitForTimeout(200);
await page.locator("#storybook-root").screenshot({ path: "C:/tmp/feedflow-screenshots/input-focused.png" });
console.log("OK input-focused");

await browser.close();
