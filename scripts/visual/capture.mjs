import { chromium } from "playwright";

const STORIES = [
  ["atoms-input--default", "input-default"],
  ["atoms-input--filled", "input-filled"],
  ["atoms-input--with-error", "input-with-error"],
  ["atoms-input--disabled", "input-disabled"],
  ["atoms-input--stack", "input-stack"],
  ["atoms-input--type-url", "input-type-url"],
  ["atoms-label--default", "label-default"],
  ["atoms-label--for-input", "label-for-input"],
  ["molecules-formfield--default", "formfield-default"],
  ["molecules-formfield--with-error", "formfield-with-error"],
  ["molecules-formfield--form", "formfield-form"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 600, height: 400 }, deviceScaleFactor: 2 });

for (const [id, name] of STORIES) {
  const page = await ctx.newPage();
  const url = `http://localhost:6006/iframe.html?id=${id}&viewMode=story`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(400);
    const root = page.locator("#storybook-root");
    await root.screenshot({ path: `/tmp/feedflow-screenshots/${name}.png` });
    console.log(`OK ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`);
  }
  await page.close();
}

await browser.close();
