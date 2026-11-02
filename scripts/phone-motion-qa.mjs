import { chromium, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = process.env.QA_OUT || 'docs/qa/revision-ten/phone-motion';
await fs.mkdir(out, { recursive: true });
const report = [];
const positions = [
  0, 130, 280, 410, 575, 700, 1100, 1450, 1600, 1750, 1950, 2220, 1750, 580, 280, 0,
];
for (const [name, engine] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await engine.launch(
    name === 'chromium' ? { channel: 'chrome', headless: true } : { headless: true },
  );
  const modes = {};
  for (const native of [true, false]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (e) => {
      if (e.type() === 'error') errors.push(e.text());
    });
    if (!native)
      await page.addInitScript(() =>
        Object.defineProperty(window, 'ScrollTimeline', { value: undefined, configurable: true }),
      );
    await page.goto(base, { waitUntil: 'networkidle' });
    for (const selector of ['.atmosphere-product', '.business-flight']) {
      await page.locator(`${selector}[data-model="ready"]`).waitFor();
      assert.equal(await page.locator(selector).getAttribute('data-renderer'), 'direct');
      assert(
        await page.locator(`${selector} canvas`).evaluate((c) => c.getContext('2d') === null),
        'Phone draws into the visible WebGL canvas',
      );
    }
    assert.deepEqual(
      await page
        .locator('[data-motion-driver]')
        .evaluateAll((els) => els.map((e) => e.dataset.motionDriver)),
      [native ? 'compositor' : 'raf', native ? 'compositor' : 'raf'],
    );
    await page.evaluate(() => {
      window.transformWrites = 0;
      const observer = new MutationObserver((records) => {
        window.transformWrites += records.length;
      });
      for (const e of document.querySelectorAll(
        '.atmosphere-product,.business-flight,.landing-photo,.business-photo',
      ))
        observer.observe(e, { attributes: true, attributeFilter: ['style'] });
    });
    const samples = [];
    for (const top of positions) {
      await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), top);
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      samples.push(
        await page.locator('.atmosphere-product,.business-flight').evaluateAll((els) =>
          els.map((e) => {
            const r = e.getBoundingClientRect(),
              c = e.querySelector('canvas');
            return {
              x: r.x,
              y: r.y + scrollY,
              width: r.width,
              height: r.height,
              canvasWidth: c.width,
              canvasHeight: c.height,
              progress: +e.dataset.flight,
            };
          }),
        ),
      );
      if (native && [280, 700, 1950].includes(top))
        await page.screenshot({ path: `${out}/${name}-${top}.webp` });
    }
    const writes = await page.evaluate(() => window.transformWrites);
    if (native)
      assert.equal(
        writes,
        0,
        'Native scrolling does not rewrite product/photo styles on the main thread',
      );
    else assert(writes > 0, 'Older-browser fallback runs the same trajectory');
    for (let i = 0; i < 2; i++) {
      assert.deepEqual(
        samples.at(-1)[i],
        samples[0][i],
        'Reversal restores the exact starting position',
      );
      assert(
        samples.every(
          (s) =>
            s[i].canvasWidth === samples[0][i].canvasWidth &&
            s[i].canvasHeight === samples[0][i].canvasHeight,
        ),
        'Scroll never reallocates a canvas',
      );
    }
    modes[native ? 'native' : 'fallback'] = { samples, writes };
    await page.locator('.landing-copy a').evaluate((e) => e.focus({ preventScroll: true }));
    // WebKit commits a focus override of a compositor animation on the next frame.
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector('.landing-copy')).opacity === '1',
    );
    assert.equal(
      await page.locator('.landing-copy').evaluate((e) => getComputedStyle(e).opacity),
      '1',
      'Focused actions remain visible over a scroll-driven fade',
    );
    await page.locator('.landing-copy a').evaluate((e) => e.blur());
    await page.locator('.motion-toggle').evaluate((e) => e.click());
    assert.equal(
      await page
        .locator('.atmosphere-product,.business-flight,.landing-photo,.business-photo')
        .evaluateAll((els) => els.reduce((n, e) => n + e.getAnimations().length, 0)),
      0,
      'Pause cancels compositor tracks',
    );
    await page.locator('.motion-toggle').evaluate((e) => e.click());
    assert.equal(
      await page.locator('[data-atmosphere]').getAttribute('data-motion-driver'),
      native ? 'compositor' : 'raf',
    );
    assert.equal(errors.length, 0, JSON.stringify(errors));
    await context.close();
  }
  let largestDelta = 0;
  modes.native.samples.forEach((sample, i) =>
    sample.forEach((product, j) => {
      for (const key of ['x', 'y', 'width', 'height']) {
        const delta = Math.abs(product[key] - modes.fallback.samples[i][j][key]);
        largestDelta = Math.max(delta, largestDelta);
        assert(
          delta < 0.25,
          `${name} native/fallback geometry agrees at ${positions[i]}px: ${key} delta ${delta}`,
        );
      }
    }),
  );
  report.push({
    engine: name,
    version: browser.version(),
    largestDelta,
    nativeStyleWrites: modes.native.writes,
    fallbackStyleWrites: modes.fallback.writes,
    samples: positions.length,
    checks: [
      'visible WebGL, no 2D copy',
      'prewarmed second scene',
      'compositor/fallback parity',
      'reversal',
      'stable canvas size',
      'pause/resume',
      'no shader or page errors',
    ],
  });
  console.log(report.at(-1));
  await browser.close();
}
await fs.writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
