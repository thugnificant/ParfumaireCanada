import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const width of [1440, 390]) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    isMobile: width < 700,
    hasTouch: width < 700,
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:4323/');
  await page.waitForTimeout(1400);
  const scene = page.locator('.business-scene');
  await scene.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `docs/qa/revision-eight/business-${width}.webp` });
  console.log(
    width,
    await page.locator('[data-business-story]').getAttribute('data-progress'),
    await page.locator('.business-flight').getAttribute('data-model'),
    errors,
  );
  await page.goto('http://127.0.0.1:4323/products/la-tour-scent-diffuser/');
  await page.waitForTimeout(700);
  await page.screenshot({
    path: `docs/qa/revision-eight/after-product-${width}.webp`,
    fullPage: true,
  });
  await page.goto('http://127.0.0.1:4323/contact/?product=la-tour-scent-diffuser&quantity=1');
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `docs/qa/revision-eight/after-quote-${width}.webp`,
    fullPage: true,
  });
  await page.close();
}
await browser.close();
