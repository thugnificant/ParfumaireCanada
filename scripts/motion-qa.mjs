import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';
const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = 'docs/qa/revision-two';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, at: new Date().toISOString(), checks: [], errors: [], failedRequests: [] };
const hash = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
async function assertStill(first, second, message) {
  const a = await sharp(first).raw().toBuffer();
  const b = await sharp(second).raw().toBuffer();
  assert.equal(a.length, b.length, message);
  let total = 0,
    largest = 0;
  for (let i = 0; i < a.length; i++) {
    const difference = Math.abs(a[i] - b[i]);
    total += difference;
    largest = Math.max(largest, difference);
  }
  // GPU compositing can round a few channels by one level without any motion.
  assert(total / a.length < 0.001 && largest <= 2, message);
}
const states = (page) =>
  page.locator('[data-room]').evaluateAll((rooms) =>
    rooms.map((room) => ({
      clip: room.style.clipPath,
      opacity: getComputedStyle(room).opacity,
      width: room.naturalWidth,
    })),
  );
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
  const frameRequests = [];
  page.on('request', (r) => {
    if (/\/motion\/(desktop|mobile)\//.test(r.url())) frameRequests.push(r.url());
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
  assert.equal(frameRequests.length, 0, 'No soft film frames are downloaded');
  assert(
    await page
      .locator('.atmosphere-product canvas')
      .evaluate((canvas) => canvas.width >= canvas.clientWidth * 1.95),
    'Retina product rendering',
  );
  const product = page.locator('.atmosphere-product');
  const first = hash(await product.screenshot());
  await page.waitForTimeout(1200);
  assert.notEqual(
    hash(await product.screenshot()),
    first,
    'Product and airflow animate while idle',
  );
  await page.screenshot({ path: `${out}/hero-${width}.png` });
  if (width === 1440) {
    await page.locator('.explore-toggle').click();
    assert(await page.locator('#explore-menu').isVisible(), 'Explore opens on its first click');
    assert.equal(await page.locator('#explore-menu a').count(), 5);
    const positions = await page
      .locator('#explore-menu a')
      .evaluateAll((links) => links.map((link) => link.getBoundingClientRect().top));
    assert.equal(new Set(positions).size, 1, 'Five categories form one horizontal row');
    await page.screenshot({ path: `${out}/dropdown-desktop.png` });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#explore-menu').isVisible(), false);
    await page.locator('.explore-toggle').focus();
    await page.keyboard.press('ArrowDown');
    assert(
      await page
        .locator('#explore-menu a')
        .first()
        .evaluate((el) => el === document.activeElement),
    );
    await page.keyboard.press('ArrowRight');
    assert(
      await page
        .locator('#explore-menu a')
        .nth(1)
        .evaluate((el) => el === document.activeElement),
    );
    await page.keyboard.press('Escape');
    await page.mouse.move(650, 700);
    report.checks.push(
      'Desktop dropdown: click, hover, five icons in one row, keyboard arrows and Escape',
    );
  }
  const geometry = await page.locator('[data-atmosphere]').evaluate((root) => ({
    start: root.offsetTop - parseFloat(getComputedStyle(root.firstElementChild).top),
    range: root.offsetHeight - root.firstElementChild.offsetHeight,
  }));
  const snapshots = [];
  for (const [index, progress] of [0, 0.25, 0.5, 0.75, 1].entries()) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: 'instant' }),
      geometry.start + geometry.range * progress,
    );
    await page.waitForTimeout(300);
    await page.locator(`[data-scene="${index}"][aria-current="step"]`).waitFor();
    snapshots.push(await states(page));
    assert(
      snapshots[index].every((room) => room.width === 2688 && room.opacity === '1'),
      'Original-resolution, opaque room layers',
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `${out}/scene-${width}-${index}.png` });
  }
  await page.locator('[data-scene="1"]').click();
  await page.waitForTimeout(1400);
  assert.deepEqual(
    await states(page),
    snapshots[1],
    'Reverse navigation restores exactly the same room composition',
  );
  // Fast scroll cannot display unloaded intermediate frames or blend several rooms.
  for (const progress of [0.91, 0.12, 0.78, 0.42, 0.98, 0.25]) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: 'instant' }),
      geometry.start + geometry.range * progress,
    );
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(150);
  assert.deepEqual(await states(page), snapshots[1]);
  await page.getByRole('button', { name: 'Pause animated effects', exact: true }).click();
  await page.waitForTimeout(250);
  const frozen = await product.screenshot();
  await page.waitForTimeout(700);
  await assertStill(frozen, await product.screenshot(), 'Pause freezes continuous motion');
  await page.locator('[data-scene="3"]').click();
  await page.locator('[data-scene="3"][aria-current="step"]').waitFor();
  await page.getByRole('button', { name: 'Enable animated effects', exact: true }).click();
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);
  // Capture a continuous scroll, rather than just jumping between screenshots.
  for (let y = 0; y <= geometry.start + geometry.range + height * 2.6; y += 28) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(32);
  }
  await page.locator('.featured').scrollIntoViewIfNeeded();
  await page.locator('.featured [data-product-view][data-model="ready"]').first().waitFor();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.featured [data-product-view][data-model="ready"]').count(), 3);
  assert(
    await page
      .locator('.featured .product-card')
      .evaluateAll((cards) => cards.every((card) => getComputedStyle(card).opacity === '1')),
  );
  await page.screenshot({ path: `${out}/products-${width}.png` });
  await page.waitForTimeout(1600);
  const video = page.video();
  await context.close();
  await video.saveAs(`${out}/${width === 390 ? 'mobile' : 'desktop'}-scroll.webm`);
  report.checks.push(
    `${width}px: live 3D and mist, retina canvas, five 2688px rooms, reverse and rapid scroll, pause/resume, visible product cards, recorded continuous scroll`,
  );
  console.log(`Motion checks passed at ${width}px`);
}
for (const mode of ['reduced', 'no-js']) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    javaScriptEnabled: mode !== 'no-js',
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  assert(
    await page.locator('[data-atmosphere]').evaluate((el) => el.offsetHeight < innerHeight),
    'Static mode does not leave an empty scroll region',
  );
  assert(await page.getByRole('link', { name: 'Find your diffuser', exact: true }).isVisible());
  if (mode === 'reduced') {
    await page.locator('[data-scene="4"]').click();
    await page.locator('[data-scene="4"][aria-current="step"]').waitFor();
    const product = page.locator('.atmosphere-product');
    await page.waitForTimeout(250);
    const first = await product.screenshot();
    await page.waitForTimeout(500);
    await assertStill(first, await product.screenshot(), 'Reduced-motion is static');
  }
  await page.screenshot({ path: `${out}/${mode}-mobile.png` });
  await context.close();
}
report.checks.push(
  'Reduced-motion freezes 3D, keeps manual room selection; no-JS retains sharp products and links',
);
await browser.close();
await fs.writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0);
assert.equal(report.failedRequests.length, 0);
