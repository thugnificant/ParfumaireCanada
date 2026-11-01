import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { officeScene, officePlacement } from '../src/lib/office-scene.ts';

const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = process.env.QA_OUT || 'docs/qa/revision-seven';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, at: new Date().toISOString(), views: [], errors: [] };
const geometry = (page, selector) =>
  page.locator(selector).evaluate((e, offset) => {
    const r = e.getBoundingClientRect();
    const scene = document.querySelector('.office-scene').getBoundingClientRect();
    return {
      x: r.x + r.width / 2 - scene.x,
      y: r.y + r.height * (0.5 + offset) - scene.y,
      height: r.height,
      sceneWidth: scene.width,
      sceneHeight: scene.height,
    };
  }, officeScene.footOffset);
async function frame(page) {
  await page
    .locator('.office-scene')
    .evaluate((e) =>
      scrollTo({ top: e.getBoundingClientRect().top + scrollY - 120, behavior: 'instant' }),
    );
  await page.waitForTimeout(250);
}
for (const width of [1440, 1024, 768, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 1000 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
  const source = await page.locator('.landing-photo').evaluate(async (e) => {
    await e.decode();
    const original = new Image();
    original.src = e.currentSrc;
    await original.decode();
    return { src: e.currentSrc, width: original.naturalWidth, height: original.naturalHeight };
  });
  assert(source.width >= 1600, 'Native high-resolution office plate');
  await frame(page);
  assert.equal(await page.locator('[data-atmosphere]').getAttribute('data-progress'), '1.0000');
  const live = await geometry(page, '.atmosphere-product');
  const expected = officePlacement(live.sceneWidth, live.sceneHeight);
  for (const axis of ['x', 'y', 'height']) {
    assert(
      Math.abs(live[axis] - expected[axis]) < 0.1,
      `${width}: model stays in its source-photo bay (${axis})`,
    );
  }
  const copy = await page.locator('.landing-copy').evaluate((e) => ({
    bottom: e.getBoundingClientRect().bottom,
    opacity: getComputedStyle(e).opacity,
  }));
  const productTop = await page
    .locator('.atmosphere-product')
    .evaluate((e) => e.getBoundingClientRect().top);
  assert.equal(copy.opacity, '1');
  assert(copy.bottom < productTop, 'Caption clears the diffuser and its airflow');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await sharp(await page.screenshot())
    .webp({ quality: 90 })
    .toFile(`${out}/office-${width}.webp`);
  await page.locator('.motion-toggle').click();
  await page.locator('.landing-fallback[data-model="ready"]').waitFor();
  await frame(page);
  const fixed = await geometry(page, '.landing-fallback');
  for (const axis of ['x', 'y', 'height']) {
    assert(
      Math.abs(fixed[axis] - live[axis]) < 0.1,
      `${width}: static and animated floor contact agree (${axis})`,
    );
  }
  report.views.push({
    width,
    source,
    live,
    fixed,
    checks: ['photo anchor', 'static parity', 'caption clearance', 'no overflow'],
  });
  await context.close();
}
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  javaScriptEnabled: false,
});
const page = await context.newPage();
await page.goto(base, { waitUntil: 'networkidle' });
await frame(page);
const noJs = await geometry(page, '.landing-fallback');
const expected = officePlacement(noJs.sceneWidth, noJs.sceneHeight);
for (const axis of ['x', 'y', 'height']) assert(Math.abs(noJs[axis] - expected[axis]) < 0.1);
await page.locator('.landing-fallback img').evaluate((e) => e.decode());
await sharp(await page.screenshot())
  .webp({ quality: 90 })
  .toFile(`${out}/office-no-js.webp`);
await context.close();
await browser.close();
assert.equal(report.errors.length, 0);
await fs.writeFile(`${out}/office-placement.json`, JSON.stringify(report, null, 2));
console.log(
  'Office placement passed: 4 viewport sizes, native image resolution, exact floor anchor, static/no-JS parity, caption clearance.',
);
