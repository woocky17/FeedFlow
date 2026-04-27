import { chromium } from "playwright";

const STORIES = [
  ["atoms-icon--gallery", "icon-gallery", { width: 480, height: 280 }],
  ["atoms-icon--default", "icon-default", { width: 200, height: 100 }],
  ["atoms-icon--filled", "icon-filled-heart", { width: 200, height: 100 }],
  ["atoms-icon--sizes", "icon-sizes", { width: 480, height: 100 }],
  ["atoms-card--default", "card-default", { width: 500, height: 240 }],
  ["atoms-card--dashed", "card-dashed", { width: 500, height: 240 }],
  ["atoms-card--interactive", "card-interactive", { width: 500, height: 140 }],
  ["atoms-card--no-padding", "card-no-padding", { width: 500, height: 360 }],
  ["atoms-toggleswitch--on", "toggle-on", { width: 200, height: 100 }],
  ["atoms-toggleswitch--off", "toggle-off", { width: 200, height: 100 }],
  ["atoms-toggleswitch--disabled", "toggle-disabled", { width: 200, height: 100 }],
  ["atoms-toggleswitch--interactive", "toggle-interactive", { width: 240, height: 100 }],
];

const browser = await chromium.launch();

for (const [id, name, viewport] of STORIES) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const url = `http://localhost:6006/iframe.html?id=${id}&viewMode=story`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(400);
    await page.locator("#storybook-root").screenshot({
      path: `C:/tmp/feedflow-screenshots/${name}.png`,
    });
    console.log(`OK ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`);
  }
  await ctx.close();
}

await browser.close();
