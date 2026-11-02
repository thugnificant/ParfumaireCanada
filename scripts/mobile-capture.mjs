import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const phase = process.env.QA_PHASE || 'before';
const dir = `docs/qa/revision-nine/${phase}`;
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const width of [390, 430, 320, 1440]) {
  const mobile = width < 700;
  const page = await browser.newPage({
    viewport: { width, height: mobile ? 844 : 900 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
  });
  await page.goto('http://127.0.0.1:4323/');
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${dir}/hero-${width}.webp` });
  for (const [name, selector] of [
    ['office', '.office-scene'],
    ['collection', '.featured'],
    ['business', '.business-scene'],
    ['feature', '.editorial-feature'],
  ]) {
    await page
      .locator(selector)
      .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${dir}/${name}-${width}.webp` });
  }
  if (width === 390) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.menu-toggle').click();
    await page.screenshot({ path: `${dir}/menu-${width}.webp` });
    for (const [name, route] of [
      ['product', 'products/la-tour-scent-diffuser/'],
      ['quote', 'contact/?product=la-tour-scent-diffuser&quantity=1'],
      ['catalog', 'collections/scent-diffusers/'],
    ]) {
      await page.goto(`http://127.0.0.1:4323/${route}`);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${dir}/${name}-${width}.webp`, fullPage: true });
    }
  }
  await page.close();
}
await browser.close();
console.log(dir);
