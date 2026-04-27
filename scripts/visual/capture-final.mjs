import { chromium } from "playwright";

const browser = await chromium.launch();

// Storybook stories — confirm new card-link variant + external icon
const STORIES = [
  ["http://localhost:6006/iframe.html?id=atoms-card--link&viewMode=story", "card-link", { width: 500, height: 220 }],
  ["http://localhost:6006/iframe.html?id=atoms-icon--gallery&viewMode=story", "icon-gallery-final", { width: 480, height: 320 }],
];

for (const [url, name, viewport] of STORIES) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(400);
    await page.locator("#storybook-root").screenshot({ path: `C:/tmp/feedflow-screenshots/${name}.png` });
    console.log(`OK ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`);
  }
  await ctx.close();
}

// Live feed page after refactor
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
try {
  await page.goto("http://localhost:3002/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "C:/tmp/feedflow-screenshots/page-feed-final.png", fullPage: false });
  console.log("OK page-feed-final");
} catch (e) {
  console.log(`FAIL page-feed-final: ${e.message}`);
}

await browser.close();
