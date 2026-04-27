import { chromium } from "playwright";

const PAGES = [
  ["/", "page-feed"],
  ["/stories", "page-stories"],
  ["/categories", "page-categories"],
  ["/sources", "page-sources"],
  ["/admin", "page-admin"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const [path, name] of PAGES) {
  try {
    await page.goto(`http://localhost:3001${path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `C:/tmp/feedflow-screenshots/${name}.png`, fullPage: false });
    console.log(`OK ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`);
  }
}

await browser.close();
