import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.QA_URL || 'http://127.0.0.1:4322';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [];
const failed = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().includes('missing-qa-page'))
    failed.push({ url: r.url(), status: r.status() });
});
await fs.mkdir('docs/qa/screenshots', { recursive: true });
const results = {
  base,
  at: new Date().toISOString(),
  screenshots: [],
  accessibility: [],
  checks: [],
};
for (const width of [1440, 1024, 768, 390]) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('img').evaluateAll((imgs) => imgs.forEach((i) => (i.loading = 'eager')));
  await page.waitForFunction(() =>
    [...document.images].every((i) => !i.getAttribute('src') || i.complete),
  );
  await page
    .locator('img')
    .evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode().catch(() => {}))));
  await page.screenshot({ path: `docs/qa/screenshots/home-${width}.png`, fullPage: true });
  results.screenshots.push(`home-${width}.png`);
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    `Home overflow ${width}`,
  );
  if (width === 1440) {
    const ratio = await page
      .locator('.atmosphere-main')
      .evaluate(
        (e) => e.getBoundingClientRect().width / e.parentElement.getBoundingClientRect().width,
      );
    assert(ratio > 0.69 && ratio < 0.73, 'Hero panel ratio');
  }
  console.log(`Screenshot + overflow: ${width}px`);
}
await page.getByRole('button', { name: 'Open menu', exact: true }).click();
await page.locator('#mobile-nav').getByRole('link', { name: 'Signature scents' }).click();
await page.waitForURL('**/collections/scents/');
assert.equal(await page.locator('.catalog-item').count(), 18);
await page.locator('#catalog-search').fill('cedar');
assert((await page.locator('.catalog-item:visible').count()) > 0);
await page.locator('#catalog-search').fill('nothingscentmatches');
assert.equal(await page.locator('.catalog-item:visible').count(), 0);
await page.getByRole('button', { name: 'Clear filters' }).click();
assert.equal(await page.locator('.catalog-item:visible').count(), 18);
results.checks.push('Mobile menu, search, collection filters, no-results and reset');
await page.goto(base + '/collections/all/');
assert.equal(await page.locator('.product-card').count(), 21);
await page.locator('#sort').selectOption('high');
assert.equal(
  await page.locator('.catalog-item').first().getAttribute('data-title'),
  'CozyAir Max Scent Diffuser',
);
await page.screenshot({ path: 'docs/qa/screenshots/catalog-390.png', fullPage: true });
await page.goto(base + '/products/cozyair-max-scent-diffuser/');
await page.getByLabel('Black', { exact: true }).check();
assert.match(await page.locator('#variant-price').textContent(), /799/);
await page.locator('#product-quantity').fill('3');
await page.locator('#product-enquiry').click();
await page.locator('#enquiry-context').filter({ hasText: 'CozyAir Max' }).waitFor();
assert.match(
  await page.locator('#enquiry-context').textContent(),
  /CozyAir Max.*Black.*Quantity 3/s,
);
assert.match(page.url(), /variant=41500300247226/);
await page.getByLabel('Name', { exact: false }).fill('QA Preview');
await page.locator('#email').fill('preview@example.com');
await page.getByLabel('Your message').fill('Please help me compare fragrance options.');
const submitted = [];
page.on('request', (r) => {
  if (r.method() === 'POST') submitted.push(r.url());
});
await page.getByRole('button', { name: 'Continue to review', exact: true }).click();
await page.getByRole('button', { name: 'Edit details', exact: true }).click();
assert.equal(await page.locator('#name').inputValue(), 'QA Preview');
await page.getByRole('button', { name: 'Continue to review', exact: true }).click();
await page.getByRole('button', { name: 'Preview enquiry', exact: true }).click();
await page.getByRole('status').filter({ hasText: 'No message was sent' }).waitFor();
assert.equal(submitted.length, 0);
assert.equal(await page.locator('#name').inputValue(), '');
assert.equal(await page.locator('#email').inputValue(), '');
assert(!page.url().includes('preview%40'));
await page.screenshot({ path: 'docs/qa/screenshots/enquiry-390.png', fullPage: true });
results.checks.push(
  'Exact variant price, image selection, quantity, preserved enquiry context, zero network submission and cleared PII',
);
const sourceCatalog = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
const renders = JSON.parse(await fs.readFile('src/data/renders.json', 'utf8'));
const catalog = sourceCatalog.map((p) => ({ ...p, images: [renders[p.handle], ...p.images] }));
await page.setViewportSize({ width: 1440, height: 1000 });
for (const p of catalog) {
  await page.goto(base + `/products/${p.handle}/`);
  for (const v of p.variants) {
    await page.locator(`input[value="${v.id}"]`).check();
    assert.match(
      await page.locator('#variant-price').textContent(),
      new RegExp(String(v.priceMinor / 100)),
    );
    const url = await page.locator('#product-enquiry').getAttribute('href');
    assert(url.includes(v.id));
  }
  for (let i = 0; i < p.images.length; i++) {
    await page.locator(`[data-gallery-index="${i}"]`).click();
    await page.waitForFunction(
      (path) => document.querySelector('#product-image').getAttribute('src') === path,
      p.images[i].path,
    );
  }
  await page.waitForFunction(() => {
    const im = document.querySelector('#product-image');
    return im.complete && im.naturalWidth > 0;
  });
}
results.checks.push(
  'All 21 product pages, 59 variants, 93 gallery selections including generated renders',
);
await page.goto(base + '/products/la-tour-scent-diffuser/');
await page.getByRole('button', { name: 'Enlarge product image' }).click();
await page.getByRole('dialog').waitFor();
await page.keyboard.press('Escape');
assert.equal(await page.getByRole('dialog').count(), 0);
await page.screenshot({ path: 'docs/qa/screenshots/product-1440.png', fullPage: true });
await page.goto(base + '/fragrance-finder/');
await page.getByRole('button', { name: /Citrus & fresh/ }).click();
assert((await page.locator('[data-scent-family]:visible').count()) > 0);
await page.goto(base + '/search/');
await page.locator('#site-search').fill('La Tour');
assert.equal(await page.locator('.search-result:visible').count(), 1);
results.checks.push('Gallery modal keyboard close, scent finder and dedicated search');
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of [
    '/',
    '/collections/all/',
    '/products/213-rue-st-honore/',
    '/products/la-tour-scent-diffuser/',
    '/business-scenting/',
    '/contact/',
    '/fragrance-finder/',
  ]) {
    await page.goto(base + route);
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `Overflow ${route} at ${width}`,
    );
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    results.accessibility.push({
      route,
      width,
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    });
  }
}
const missing = await page.goto(base + '/missing-qa-page/');
assert.equal(missing.status(), 404);
results.checks.push('Real 404 status');
results.errors = errors;
results.failedRequests = failed;
await fs.writeFile('docs/qa/browser-results.json', JSON.stringify(results, null, 2));
await browser.close();
console.log(
  JSON.stringify(
    {
      checks: results.checks,
      errors,
      failedRequests: failed,
      accessibilityViolations: results.accessibility.filter((a) => a.violations.length),
    },
    null,
    2,
  ),
);
assert.equal(errors.length, 0);
assert.equal(failed.length, 0);
assert.equal(
  results.accessibility.filter((a) => a.violations.length).length,
  0,
  'Accessibility issues need review',
);
