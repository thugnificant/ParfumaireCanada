import { chromium, webkit } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = 'docs/qa/revision-nine';
await fs.mkdir(out, { recursive: true });
const results = [];
const overflow = async (page, label) =>
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), label);
for (const [engine, type] of [
  ['chromium', chromium],
  ['webkit', webkit],
]) {
  const browser = await type.launch(
    engine === 'chromium' ? { channel: 'chrome', headless: true } : { headless: true },
  );
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [430, 932],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const errors = [],
      failures = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 400 && new URL(r.url()).origin === base) failures.push(r.url());
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await overflow(page, `${engine} ${width} home overflow`);
    const native = await page.locator('html.lenis').count();
    assert.equal(native, 0, 'Touch uses native scrolling');
    const hero = await page.locator('.atmosphere-product').getAttribute('data-model');
    await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
    assert(await page.locator('.mobile-menu').evaluate((e) => e.open));
    const menuIssues = await new AxeBuilder({ page }).include('.mobile-menu').analyze();
    assert.equal(
      menuIssues.violations.length,
      0,
      JSON.stringify(menuIssues.violations.map((v) => v.id)),
    );
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      assert(
        await page.evaluate(() =>
          document.querySelector('.mobile-menu').contains(document.activeElement),
        ),
        'Native dialog contains keyboard focus',
      );
    }
    const before = await page.evaluate(() => scrollY);
    if (engine === 'chromium') {
      await page.mouse.move(2, height - 3);
      await page.mouse.wheel(0, 260);
    } else {
      assert.equal(
        await page.locator('html').evaluate((e) => getComputedStyle(e).overflowY),
        'hidden',
      );
    }
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => scrollY), before, 'Menu locks background scroll');
    await page.locator('.menu-close').tap();
    assert(await page.locator('.mobile-menu').isHidden());
    assert(!(await page.locator('html').getAttribute('class'))?.includes('menu-open'));
    for (const [name, selector, dot] of [
      ['office', '.office-scene', '.office-hotspot'],
      ['business', '.business-scene', '.business-hotspot'],
    ]) {
      await page
        .locator(selector)
        .evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - 95));
      await page.waitForTimeout(220);
      await page.locator(`${dot} .hotspot-trigger`).tap();
      const card = page.locator(`${dot} .hotspot-card`);
      assert(await card.isVisible(), `${name} tap label`);
      const rect = await card.boundingBox();
      assert(rect.x >= 0 && rect.x + rect.width <= width + 1, `${name} label fits phone`);
      await page.keyboard.press('Escape');
      assert(await card.isHidden(), `${name} label closes in touch browsers`);
      await page.screenshot({ path: `${out}/${engine}-${name}-${width}.webp` });
    }
    // Rotation retains the correct source-photo floor contact and usable navigation.
    await page.setViewportSize({ width: height, height: width });
    await overflow(page, 'Landscape page overflow');
    await page.setViewportSize({ width, height });
    await page.goto(base + '/products/cozyair-max-scent-diffuser/', { waitUntil: 'networkidle' });
    await overflow(page, 'Product page overflow');
    const title = await page.locator('h1').boundingBox(),
      gallery = await page.locator('.gallery-main').boundingBox();
    assert(title.y < gallery.y, 'Product name is above the phone gallery');
    assert(
      await page.locator('.mobile-product-action').isVisible(),
      'Options action is present on entry',
    );
    await page.locator('#mobile-enquiry').tap();
    await page.waitForTimeout(450);
    assert(
      await page
        .locator('#product-options')
        .evaluate(
          (el) =>
            el.getBoundingClientRect().top >= 80 && el.getBoundingClientRect().top < innerHeight,
        ),
      'Options action lands below sticky header',
    );
    await page.getByLabel('Black', { exact: true }).check();
    await page.locator('#product-quantity').fill('2');
    await page.locator('#product-enquiry').tap();
    await page.waitForURL('**/contact/**');
    assert.match(await page.locator('#enquiry-context').textContent(), /Black.*Quantity 2/s);
    assert(
      (await page.locator('#name').boundingBox()).y < Math.max(height, 800),
      'Quote field follows a compact product summary',
    );
    const posts = [];
    page.on('request', (r) => {
      if (r.method() === 'POST') posts.push(r.url());
    });
    await page.locator('#name').fill('Mobile QA');
    await page.locator('#email').fill('qa@example.com');
    await page.locator('#message').fill('Please confirm the diffuser selection for our office.');
    await page.locator('#enquiry-submit').tap();
    assert(await page.locator('#quote-review').isVisible());
    await page.locator('#enquiry-edit').tap();
    assert.equal(await page.locator('#name').inputValue(), 'Mobile QA');
    await page.locator('#enquiry-submit').tap();
    await page.locator('#enquiry-confirm').tap();
    assert(await page.locator('#quote-complete').isVisible());
    assert.equal(posts.length, 0);
    await page.goto(base + '/collections/scents/', { waitUntil: 'networkidle' });
    await page.locator('#family-filter').selectOption('Woody & musky');
    assert((await page.locator('.catalog-item:visible').count()) > 0);
    await overflow(page, 'Catalog overflow');
    const sort = await page.locator('#sort').boundingBox(),
      family = await page.locator('#family-filter').boundingBox();
    assert(Math.abs(sort.y - family.y) < 1, 'Filters align on phone');
    assert.equal(errors.length, 0, JSON.stringify(errors));
    assert.equal(failures.length, 0, JSON.stringify(failures));
    results.push({
      engine,
      width,
      height,
      hero,
      menuAxe: menuIssues.violations.length,
      errors,
      failures,
      checks: [
        'native scroll',
        'menu focus and scroll lock',
        'tap labels',
        'rotation',
        'phone product ordering',
        'options action',
        'quote context and review',
        'no submission',
        'catalog controls',
      ],
    });
    console.log(`${engine} ${width}×${height} passed`);
    await context.close();
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(
    await page.locator('[data-atmosphere].flight-enabled').count(),
    0,
    'Reduced motion has static placements',
  );
  await page.locator('.business-scene').scrollIntoViewIfNeeded();
  assert(await page.locator('.business-rest').isVisible());
  await browser.close();
}
await fs.writeFile(
  `${out}/mobile-checks.json`,
  JSON.stringify({ base, at: new Date().toISOString(), results }, null, 2),
);
