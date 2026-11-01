import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { businessPlacement, businessScene } from '../src/lib/business-scene.ts';
const base = process.env.QA_URL || 'http://127.0.0.1:4323',
  out = process.env.QA_OUT || 'docs/qa/revision-eight';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { base, at: new Date().toISOString(), views: [], errors: [], checks: [] };
const jump = async (page, y) => {
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), y);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
};
const geometry = (page) =>
  page.locator('.business-flight').evaluate((e, offset) => {
    const r = e.getBoundingClientRect(),
      s = document.querySelector('.business-room').getBoundingClientRect();
    return {
      x: r.x + r.width / 2 - s.x,
      y: r.y + r.height * (0.5 + offset) - s.y,
      height: r.height,
      documentY: r.y + scrollY,
      width: s.width,
      sceneHeight: s.height,
    };
  }, businessScene.footOffset);
for (const width of [1440, 1024, 768, 390, 360]) {
  const height = width < 700 ? 844 : 1000;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: width < 700,
    hasTouch: width < 700,
    recordVideo:
      width === 1440 || width === 390
        ? { dir: `${out}/recordings`, size: { width, height } }
        : undefined,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => report.errors.push(e.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  const positions = await page.evaluate(() => {
    const a = document.querySelector('[data-business-origin]').getBoundingClientRect(),
      b = document.querySelector('.business-room').getBoundingClientRect();
    return {
      start: a.y + scrollY - Math.min(innerHeight * 0.3, 240),
      end: b.y + scrollY + b.height - 150,
      roomTop: b.y + scrollY,
    };
  });
  await jump(page, positions.start);
  await page.waitForFunction(
    () => document.querySelector('.business-flight').dataset.model === 'ready',
  );
  const initial = await geometry(page);
  const canvas = await page.locator('.business-flight canvas').elementHandle();
  const samples = [];
  for (let i = 0; i <= 60; i++) {
    await jump(page, positions.start + ((positions.end - positions.start) * i) / 60);
    samples.push(await geometry(page));
  }
  assert(
    samples.every((s, i) => !i || s.documentY >= samples[i - 1].documentY - 0.1),
    'Tower descends without jumping upward',
  );
  assert.equal(
    await canvas.evaluate((c) => c === document.querySelector('.business-flight canvas')),
    true,
    'One persistent tower canvas',
  );
  assert.equal(await page.locator('[data-business-story]').getAttribute('data-progress'), '1.0000');
  const final = await geometry(page),
    expected = businessPlacement(final.width, final.sceneHeight);
  for (const k of ['x', 'y', 'height'])
    assert(Math.abs(final[k] - expected[k]) < 0.15, `${width}px anchored ${k}`);
  await jump(page, positions.end + 160);
  const further = await geometry(page);
  assert(Math.abs(final.documentY - further.documentY) < 0.1, 'Floor does not slide');
  await jump(page, positions.start);
  const reverse = await geometry(page);
  assert(Math.abs(initial.documentY - reverse.documentY) < 0.1, 'Reversible landing');
  await jump(page, positions.roomTop - 220);
  await page.waitForTimeout(200);
  const hotspot = page.locator('.business-hotspot .hotspot-trigger');
  await hotspot.scrollIntoViewIfNeeded();
  if (width < 700) await hotspot.tap();
  else await hotspot.hover();
  assert(await page.locator('#business-product').isVisible(), 'Product label opens');
  const pop = await page.locator('#business-product').boundingBox();
  assert(pop.x >= 0 && pop.x + pop.width <= width, 'Label stays on screen');
  assert.match(await page.locator('#business-product').textContent(), /La Tour/);
  await page.keyboard.press('Escape'); // Hover-only has no focused root: press after focusing the trigger.
  await hotspot.focus();
  await page.keyboard.press('Escape');
  assert(await page.locator('#business-product').isHidden());
  await page.screenshot({ path: `${out}/business-${width}.webp` });
  await page.locator('.motion-toggle').click();
  const staticBounds = await page.locator('.business-rest').evaluate((e) => {
    const r = e.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height * 0.979, height: r.height };
  });
  const room = await page.locator('.business-room').boundingBox();
  assert(Math.abs(staticBounds.x - room.x - expected.x) < 0.15);
  assert(
    Math.abs(staticBounds.y - room.y - expected.y) < 0.15,
    'Paused tower shares floor contact',
  );
  assert(await page.locator('.business-flight').isHidden());
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    'No horizontal overflow',
  );
  report.views.push({ width, final, staticBounds });
  if (width === 390) {
    await page.goto(base + '/products/la-tour-scent-diffuser/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html.lenis').count(), 0, 'Native phone scroll');
    assert.equal(await page.locator('[data-model="ready"]').count(), 0, 'No mobile product GPU');
    assert(
      !(await page.evaluate(() =>
        performance.getEntriesByType('resource').some((r) => /product-view\./.test(r.name)),
      )),
      '3D engine not downloaded',
    );
    const before = await page.locator('#product-image').getAttribute('src');
    const cdp = await context.newCDPSession(page);
    const imageBox = await page.locator('#product-image').boundingBox();
    const y = Math.max(180, imageBox.y + imageBox.height * 0.5);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 300, y }],
    });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: 100, y: y + 3 }],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(
      (old) => document.querySelector('#product-image').getAttribute('src') !== old,
      before,
    );
    await page
      .locator('#product-enquiry')
      .evaluate((e) =>
        scrollTo({ top: scrollY + e.getBoundingClientRect().bottom + 30, behavior: 'instant' }),
      );
    await page.waitForTimeout(150);
    assert(
      await page.locator('.mobile-product-action').isVisible(),
      'Quote action stays reachable',
    );
    await page.locator('#mobile-enquiry').click();
    await page.waitForURL('**/contact/**');
    assert.match(await page.locator('#enquiry-context').textContent(), /La Tour/);
    await page.locator('#name').fill('QA Mobile');
    await page.locator('#email').fill('mobile@example.com');
    await page.locator('#message').fill('Please help me choose a diffuser for our reception.');
    await page.locator('#enquiry-submit').click();
    assert(await page.locator('#quote-review').isVisible());
    await page.screenshot({ path: `${out}/quote-review-mobile.webp`, fullPage: true });
    await page.locator('#enquiry-edit').click();
    assert.equal(await page.locator('#name').inputValue(), 'QA Mobile');
    await page.locator('#enquiry-submit').click();
    await page.locator('#enquiry-confirm').click();
    assert(await page.locator('#quote-complete').isVisible());
    assert.equal(await page.locator('#review-details').textContent(), '');
    report.checks.push(
      'Phone native scroll, no 3D bundle/GPU, swipe gallery, persistent quote action, product context, review/edit/complete and PII removal',
    );
  }
  const video = page.video();
  await context.close();
  if (video)
    await video.saveAs(`${out}/${width === 390 ? 'mobile' : 'desktop'}-business-scroll.webm`);
}
for (const js of [false, true]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: js,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(base);
  await page.locator('.business-scene').scrollIntoViewIfNeeded();
  const pos = await page.locator('.business-rest').evaluate((e) => {
    const r = e.getBoundingClientRect(),
      s = document.querySelector('.business-room').getBoundingClientRect();
    return {
      x: r.x + r.width / 2 - s.x,
      y: r.y + r.height * 0.979 - s.y,
      h: r.height,
      w: s.width,
      sh: s.height,
    };
  });
  const expected = businessPlacement(pos.w, pos.sh);
  assert(
    Math.abs(pos.x - expected.x) < 0.2 &&
      Math.abs(pos.y - expected.y) < 0.2 &&
      Math.abs(pos.h - expected.height) < 0.2,
    'No-JS/reduced endpoint parity',
  );
  await page.locator('.business-rest img').evaluate((im) => im.decode());
  await page.screenshot({ path: `${out}/business-${js ? 'reduced' : 'no-js'}.webp` });
  await context.close();
}
report.checks.push(
  'Five viewport sizes; continuous reversible drop; exact floor contact; pause; touch/hover/keyboard labels; reduced-motion/no-JS parity',
);
assert.equal(report.errors.length, 0);
await fs.writeFile(`${out}/business-commerce.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report.checks));
