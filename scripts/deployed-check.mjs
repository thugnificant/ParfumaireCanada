import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = process.env.QA_URL || 'https://parfumairecanada.sugiweb.com';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const results = { url: origin, checkedAt: new Date().toISOString(), routes: [], errors: [] };
page.on('pageerror', (e) => results.errors.push(e.message));
try {
  for (const route of [
    '/',
    '/collections/all/',
    '/collections/scents/',
    '/products/la-tour-scent-diffuser/',
    '/products/cozyair-max-scent-diffuser/',
    '/contact/',
    '/business-scenting/',
    '/fragrance-finder/',
  ]) {
    const r = await page.goto(origin + route);
    assert.equal(r.status(), 200);
    assert.match(await page.title(), /Parfumaire Canada/);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex,follow');
    results.routes.push({ route, status: r.status() });
  }
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto(origin);
    await page.locator('img').evaluateAll((imgs) => imgs.forEach((i) => (i.loading = 'eager')));
    await page.waitForFunction(() =>
      [...document.images].every((i) => i.complete && i.naturalWidth > 0),
    );
    await page.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())));
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `docs/qa/screenshots/deployed-${width}.png`, fullPage: true });
  }
  await page.goto(origin + '/products/cozyair-max-scent-diffuser/');
  await page.getByLabel('Black', { exact: true }).check();
  assert.match(await page.locator('#variant-price').textContent(), /799/);
  await page.locator('#product-enquiry').click();
  assert.match(await page.locator('#enquiry-context').textContent(), /CozyAir Max.*Black/s);
  const response = await page.goto(origin + '/not-a-real-parfumaire-page/');
  assert.equal(response.status(), 404);
  assert.equal(results.errors.length, 0);
  results.notFoundStatus = 404;
  results.verified = true;
  const nojs = await browser.newContext({ javaScriptEnabled: false });
  const nojsPage = await nojs.newPage();
  await nojsPage.goto(origin + '/contact/');
  assert(await nojsPage.locator('#enquiry-submit').isDisabled());
  assert.equal(await nojsPage.locator('.enquiry-form').getAttribute('method'), 'post');
  results.noJavaScriptFormSafe = true;
  await nojs.close();
  await fs.writeFile('docs/qa/deployed-results.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
