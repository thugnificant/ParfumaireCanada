import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';
const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = 'docs/qa/motion';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = {
  base,
  at: new Date().toISOString(),
  checks: [],
  errors: [],
  failedRequests: [],
  frames: [],
};
const hashCanvas = async (page) =>
  crypto
    .createHash('sha256')
    .update(await page.locator('canvas').evaluate((c) => c.toDataURL()))
    .digest('hex');
for (const width of [1440, 390]) {
  const height = width === 390 ? 844 : 1000;
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: 'no-preference',
    recordVideo: { dir: `${out}/recordings`, size: { width, height } },
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) report.failedRequests.push({ url: r.url(), status: r.status() });
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.atmosphere-canvas.is-ready').waitFor();
  const geometry = await page.locator('[data-atmosphere]').evaluate((root) => ({
    start: root.offsetTop - parseFloat(getComputedStyle(root.firstElementChild).top),
    range: root.offsetHeight - root.firstElementChild.offsetHeight,
  }));
  const hashes = [];
  const snapshots = [];
  for (const [i, progress] of [0, 0.28, 0.51, 0.72, 0.98].entries()) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: 'instant' }),
      geometry.start + geometry.range * progress,
    );
    await page.waitForTimeout(900);
    await page.locator(`[data-scene="${i}"][aria-current="step"]`).waitFor();
    await page.waitForFunction(
      (n) => document.querySelector('canvas').dataset.frame === String(n),
      Math.round(progress * 143),
    );
    hashes.push(await hashCanvas(page));
    snapshots.push(await page.locator('canvas').evaluate((c) => c.toDataURL()));
    await page.screenshot({ path: `${out}/scene-${width}-${i}.png` });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `Overflow at ${width}`,
    );
  }
  assert.equal(new Set(hashes).size, 5, `All five scenes should visually differ at ${width}`);
  await page.locator('[data-scene="1"]').click();
  await page.waitForTimeout(1200);
  await page.locator('[data-scene="1"][aria-current="step"]').waitFor();
  await page.waitForFunction(() => document.querySelector('canvas').dataset.frame === '40');
  const returned = await page.locator('canvas').evaluate((c) => c.toDataURL());
  const expectedPixels = await sharp(Buffer.from(snapshots[1].split(',')[1], 'base64'))
    .raw()
    .toBuffer();
  const returnedPixels = await sharp(Buffer.from(returned.split(',')[1], 'base64'))
    .raw()
    .toBuffer();
  assert.equal(returnedPixels.length, expectedPixels.length);
  // Canvas/GPU rasterization can differ by one color level in a pixel across redraws.
  let difference = 0,
    largestDifference = 0;
  for (let i = 0; i < expectedPixels.length; i++) {
    const delta = Math.abs(expectedPixels[i] - returnedPixels[i]);
    difference += delta;
    largestDifference = Math.max(largestDifference, delta);
  }
  assert(
    difference / expectedPixels.length < 0.01 && largestDifference <= 2,
    'Backward navigation restores the same visible office frame',
  );
  await page.getByRole('button', { name: 'Pause animated effects', exact: true }).click();
  await page.locator('[data-atmosphere].motion-paused').waitFor();
  assert(
    await page.locator('.atmosphere-main').evaluate((el) => {
      const box = el.getBoundingClientRect();
      return box.top >= 0 && box.top < innerHeight / 2;
    }),
    'Pausing keeps the current hero in view',
  );
  await page.locator('[data-scene="3"]').click();
  await page.waitForTimeout(350);
  await page.locator('[data-scene="3"][aria-current="step"]').waitFor();
  await page.getByRole('button', { name: 'Enable animated effects', exact: true }).click();
  await page.locator('[data-atmosphere].motion-active').waitFor();
  // Record an uninterrupted full scroll with every frame available from HTTP cache.
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(250);
  for (let y = 0; y <= geometry.start + geometry.range + height * 2.5; y += 22) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(45);
  }
  const video = page.video();
  await context.close();
  await video.saveAs(`${out}/${width === 390 ? 'mobile' : 'desktop'}-scroll.webm`);
  report.frames.push({ width, distinctScenes: new Set(hashes).size });
  report.checks.push(
    `${width}px: five distinct scenes, forward/back navigation, pause/resume, overflow, recorded full scroll`,
  );
}
const reduced = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: 'reduce',
});
const page = await reduced.newPage();
const motionRequests = [];
page.on('request', (r) => {
  if (/\/motion\/(desktop|mobile)\//.test(r.url())) motionRequests.push(r.url());
});
await page.goto(base, { waitUntil: 'networkidle' });
assert.equal(motionRequests.length, 0, 'Reduced motion should not download an animation sequence');
assert(await page.locator('[data-atmosphere]').evaluate((el) => el.offsetHeight < innerHeight));
await page.locator('[data-scene="4"]').click();
await page.locator('.atmosphere-canvas.is-ready').waitFor();
assert.equal(motionRequests.length, 1, 'Reduced motion loads only the chosen still');
await page.screenshot({ path: `${out}/reduced-motion-mobile.png` });
await reduced.close();
const noJS = await browser.newContext({
  javaScriptEnabled: false,
  viewport: { width: 1440, height: 1000 },
});
const plain = await noJS.newPage();
await plain.goto(base);
assert(
  await plain.locator('[data-atmosphere]').evaluate((el) => el.offsetHeight < innerHeight),
  'No-JS hero has no long empty scroll',
);
assert(await plain.getByRole('link', { name: 'Find your diffuser', exact: true }).isVisible());
await noJS.close();
report.checks.push(
  'Reduced-motion skips frame downloads; one-click still navigation; no-JS static hero and working links',
);
await browser.close();
await fs.writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0);
assert.equal(report.failedRequests.length, 0);
