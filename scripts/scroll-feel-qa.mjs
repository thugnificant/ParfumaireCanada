import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = process.env.QA_OUT || 'docs/qa/revision-five';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (e) => {
  if (/context lost|too many active webgl/i.test(e.text())) errors.push(e.text());
});
await page.goto(base, { waitUntil: 'networkidle' });
await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
assert(await page.locator('html.lenis').count(), 'Lenis is running');
await page.mouse.move(900, 500);
await page.evaluate(() => {
  window.wheelFrames = [];
  window.actualWheel = 0;
  addEventListener(
    'wheel',
    (e) => {
      window.actualWheel += e.deltaY;
    },
    { passive: true, once: true },
  );
  const started = performance.now();
  function sample(now) {
    const r = document.querySelector('.atmosphere-product').getBoundingClientRect();
    window.wheelFrames.push({
      t: now - started,
      y: scrollY,
      productY: r.top,
      progress: +document.querySelector('[data-atmosphere]').dataset.progress,
    });
    if (now - started < 2000) requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
});
await page.mouse.wheel(0, 800);
await page.waitForTimeout(2100);
const frames = await page.evaluate(() => window.wheelFrames);
const deliveredDelta = await page.evaluate(() => window.actualWheel);
const moving = frames.filter((f) => f.y > 1 && f.y < deliveredDelta - 2);
assert(moving.length > 10, 'Wheel input eases across multiple frames');
assert(moving[0].y < 200, 'Wheel does not jump directly to its destination');
assert(Math.abs(frames.at(-1).y - deliveredDelta) < 2, 'Wheel settles at the requested distance');
assert(
  frames.every((f, i) => !i || f.y >= frames[i - 1].y),
  'No scroll oscillation',
);
const intervals = frames
  .slice(1)
  .map((f, i) => f.t - frames[i].t)
  .sort((a, b) => a - b);
const cadence = {
  frames: frames.length,
  medianMs: intervals[Math.floor(intervals.length * 0.5)],
  p95Ms: intervals[Math.floor(intervals.length * 0.95)],
  over50ms: intervals.filter((t) => t > 50).length,
};
await page.mouse.wheel(0, -800);
await page.waitForTimeout(1800);
assert(await page.evaluate(() => scrollY < 2), 'Reverse wheel returns to the same origin');

// Traverse every product with motion enabled. This used to risk exceeding the
// browser's 16-context limit; all cards now use one offscreen WebGL renderer.
await page.goto(base + '/collections/all/', { waitUntil: 'networkidle' });
const views = await page.locator('.product-card [data-product-view]').all();
assert.equal(views.length, 21);
for (const view of views) {
  await view.scrollIntoViewIfNeeded();
  await page.waitForFunction((e) => e.dataset.model === 'ready', await view.elementHandle());
}
await views[0].scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
assert.equal(await page.locator('[data-product-view][data-model="ready"]').count(), 21);
assert.equal(errors.length, 0);
await page.goto(base + '/products/cozyair-max-scent-diffuser/?variant=41466755514554');
assert(await page.getByLabel('White', { exact: true }).isChecked());
assert.match(await page.locator('#variant-price').textContent(), /599/);
assert.match(await page.locator('#product-enquiry').getAttribute('href'), /41466755514554/);
await context.close();
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
await mobile.goto(base, { waitUntil: 'networkidle' });
for (const y of [0, 200, 400, 600, 850, 1000, 1200]) {
  await mobile.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  await mobile.waitForTimeout(60);
  assert(
    await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    `No overflow at scroll ${y}`,
  );
}
await browser.close();
const report = {
  at: new Date().toISOString(),
  base,
  deliveredDelta,
  cadence,
  checks: [
    'Real wheel input eased through continuous frames',
    'Reverse wheel restores origin',
    'All 21 live 3D models loaded without context loss',
    'No phone overflow throughout descent',
  ],
  errors,
};
await fs.writeFile(`${out}/scroll-feel.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
