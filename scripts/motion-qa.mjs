import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';
const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = process.env.QA_OUT || 'docs/qa/revision-four';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, at: new Date().toISOString(), checks: [], errors: [], failedRequests: [] };
const hash = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const bounds = (page) =>
  page.locator('.atmosphere-product').evaluate((e) => {
    const r = e.getBoundingClientRect();
    return {
      x: r.x,
      y: r.y + scrollY,
      width: r.width,
      height: r.height,
      progress: Number(e.parentElement.dataset.progress),
      canvas: e.querySelector('canvas').width,
    };
  });
async function jump(page, y) {
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
async function still(a, b) {
  const first = await sharp(a).raw().toBuffer(),
    second = await sharp(b).raw().toBuffer();
  assert.equal(first.length, second.length);
  let total = 0;
  for (let i = 0; i < first.length; i++) total += Math.abs(first[i] - second[i]);
  assert(total / first.length < 0.02, 'Paused/reduced-motion canvas remains still');
}
for (const width of [1440, 390]) {
  const height = width === 390 ? 844 : 1000;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
    recordVideo: { dir: `${out}/recordings`, size: { width, height } },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) report.failedRequests.push({ url: r.url(), status: r.status() });
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  const product = page.locator('.atmosphere-product');
  await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
  assert.equal(
    await page
      .locator('[data-scene], [data-room], .atmosphere-navigation, .atmosphere-sticky')
      .count(),
    0,
    'Old pinned rooms and scene controls are gone',
  );
  assert(
    await page
      .locator('.atmosphere-layout')
      .evaluate((e) => getComputedStyle(e).position !== 'sticky'),
  );
  assert(
    await product.locator('canvas').evaluate((e) => e.width >= e.clientWidth * 1.95),
    'Retina product canvas',
  );
  const first = hash(await product.screenshot());
  await page.waitForTimeout(500);
  assert.notEqual(hash(await product.screenshot()), first, 'Airflow remains alive while idle');
  await page.screenshot({ path: `${out}/hero-${width}.png` });
  // Keep this exact canvas object all the way through the handoff.
  const canvas = await product.locator('canvas').elementHandle();
  const start = await bounds(page);
  const travel = await page
    .locator('.atmosphere-landing')
    .evaluate((e) => e.getBoundingClientRect().top + scrollY);
  const samples = [];
  for (let y = 0; y <= travel + 150; y += 12) {
    await jump(page, y);
    samples.push(await bounds(page));
    await page.waitForTimeout(24);
  }
  assert(
    samples.every((s, i) => !i || s.y >= samples[i - 1].y - 0.1),
    'Product travels monotonically down the document',
  );
  assert(
    samples.every((s, i) => !i || Math.abs(s.y - samples[i - 1].y) < 52),
    'No discontinuous jumps between frames',
  );
  assert.equal(
    await canvas.evaluate((e) => e === document.querySelector('.atmosphere-product canvas')),
    true,
  );
  assert.equal(samples.at(-1).canvas, start.canvas, 'Canvas does not resize on scroll');
  assert.equal(samples.at(-1).progress, 1, 'The diffuser finishes landing');
  await page.screenshot({ path: `${out}/landed-${width}.png` });
  const final = await bounds(page);
  await jump(page, travel + 230);
  assert.equal((await bounds(page)).y, final.y, 'Landed diffuser stays attached to the floor');
  await jump(page, 0);
  assert.deepEqual(await bounds(page), start, 'Reverse scroll restores the same starting pose');
  for (const y of [travel, 100, travel * 0.7, 50, travel + 150, travel * 0.45]) await jump(page, y);
  await page.screenshot({ path: `${out}/handoff-${width}.png` });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  if (width === 390) {
    // The new front-facing office has reserved wall space above its floor bay.
    // Verify the caption fits that space without overlapping the landed model.
    await jump(page, travel + 150);
    const copyBottom = await page
      .locator('.landing-copy')
      .evaluate((e) => e.getBoundingClientRect().bottom + scrollY);
    assert(copyBottom < (await bounds(page)).y, 'Mobile caption stays above the landed diffuser');
  }
  if (width === 1440) {
    await jump(page, 0);
    await page.locator('.explore-toggle').click();
    assert(await page.locator('#explore-menu').isVisible());
    await page.waitForFunction(
      () =>
        parseFloat(getComputedStyle(document.querySelector('.site-header')).paddingBottom) > 132.5,
    );
    assert(
      await page
        .locator('#explore-menu')
        .evaluate(
          (e) =>
            e.getBoundingClientRect().bottom <= e.parentElement.getBoundingClientRect().bottom + 1,
        ),
      'Dropdown expands within the header',
    );
    const tops = await page
      .locator('#explore-menu a')
      .evaluateAll((links) => links.map((e) => e.getBoundingClientRect().top));
    assert.equal(tops.length, 5);
    assert.equal(new Set(tops).size, 1);
    await page.screenshot({ path: `${out}/dropdown-desktop.png` });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#explore-menu').isVisible(), false);
  }
  await page.locator('.motion-toggle').click();
  await page.waitForTimeout(300);
  const fallback = page.locator('.landing-fallback');
  await page.locator('.landing-fallback[data-model="ready"]').waitFor();
  const frozen = await fallback.screenshot();
  await page.waitForTimeout(400);
  await still(frozen, await fallback.screenshot());
  await page.locator('.motion-toggle').click();
  await page.locator('.featured').scrollIntoViewIfNeeded();
  for (const view of await page.locator('.featured [data-product-view]').all()) {
    await view.scrollIntoViewIfNeeded();
    await view.locator('canvas').waitFor();
    await page.waitForFunction((e) => e.dataset.model === 'ready', await view.elementHandle());
  }
  assert.equal(await page.locator('.featured [data-product-view][data-model="ready"]').count(), 4);
  assert(
    await page
      .locator('.featured .product-card')
      .evaluateAll((cards) => cards.every((e) => getComputedStyle(e).opacity === '1')),
  );
  await page.screenshot({ path: `${out}/products-${width}.png` });
  const video = page.video();
  await context.close();
  await video.saveAs(`${out}/${width === 390 ? 'mobile' : 'desktop'}-scroll.webm`);
  report.checks.push(
    `${width}px: one persistent retina canvas; continuous downward travel; stable landing; reverse/fast scrolling; visible airflow; pause/resume; always-visible product cards; recorded scroll`,
  );
  console.log(`Motion passed ${width}px`);
}
for (const mode of ['reduced', 'no-js']) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 667 },
    reducedMotion: 'reduce',
    javaScriptEnabled: mode !== 'no-js',
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.flight-enabled').count(), 0);
  assert(await page.getByRole('link', { name: 'Find your diffuser', exact: true }).isVisible());
  await page.screenshot({ path: `${out}/${mode}-mobile.png` });
  if (mode === 'reduced') {
    await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
    const first = await page.locator('.atmosphere-product').screenshot();
    await page.waitForTimeout(500);
    await still(first, await page.locator('.atmosphere-product').screenshot());
  }
  await context.close();
}
// Touch/short viewport + CPU throttling; no sticky spacer or horizontal overflow.
const context = await browser.newContext({
  viewport: { width: 390, height: 667 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.goto(base, { waitUntil: 'networkidle' });
await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
for (const y of [0, 200, 450, 650, 800, 200, 0]) await jump(page, y);
assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
await page.screenshot({ path: `${out}/short-mobile.png` });
await context.close();
report.checks.push(
  'Reduced-motion, no-JS, short phone, 4× CPU throttling and touch viewport checked',
);
await browser.close();
await fs.writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0);
assert.equal(report.failedRequests.length, 0);
