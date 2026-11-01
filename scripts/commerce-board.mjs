import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs/promises';
const out = 'docs/qa/revision-eight',
  skill =
    '/Users/jacobrothenberg/.codex/plugins/cache/openai-curated-remote/app-69fdb9081018819193707354f21b366e/1.5.0/skills/redesign-screen';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rects = {};
for (const [side, base] of [
  ['before', 'https://parfumairecanada.sugiweb.com'],
  ['after', 'http://127.0.0.1:4323'],
]) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  await page.goto(base + '/products/la-tour-scent-diffuser/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const target = page.locator('.product-info');
  const measured = await target.evaluate((e) => {
    const r = e.getBoundingClientRect(),
      a = e.querySelector('.variant-field').getBoundingClientRect(),
      b = e.querySelector('#product-enquiry').getBoundingClientRect(),
      end = (
        e.querySelector('.selection-panel') || e.querySelector('.privacy-small')
      ).getBoundingClientRect();
    const height = end.bottom - r.y + 12;
    return {
      crop: { x: r.x, y: r.y + scrollY, width: r.width, height },
      rect: {
        x: (100 * (Math.min(a.x, b.x) - r.x)) / r.width,
        y: (100 * (a.y - r.y)) / height,
        w: (100 * Math.max(a.width, b.width)) / r.width,
        h: (100 * (b.bottom - a.y)) / height,
      },
    };
  });
  const shot = await page.screenshot({ fullPage: true });
  const c = measured.crop;
  await sharp(shot)
    .extract({
      left: Math.round(c.x * 2),
      top: Math.round(c.y * 2),
      width: Math.round(c.width * 2),
      height: Math.round(c.height * 2),
    })
    .toFile(`${out}/product-panel-${side}.png`);
  rects[side] = measured.rect;
  await page.close();
}
let template = await fs.readFile(skill + '/assets/board.html', 'utf8');
const data = {
  theme: 'light',
  meta: 'Mobile product selection · 1 change · 2 references',
  panes: { before: 'product-panel-before.png', after: 'product-panel-after.png' },
  moves: [
    {
      n: 1,
      lead: 'The selection and quote action sit together.',
      line: 'A framed panel groups finish, quantity and the quote button, with larger controls for touch.',
      refs: [
        { app: 'Apple', url: 'https://mobbin.com/screens/83a6d574-bd21-463e-9379-d1e2a43f7f1a' },
        {
          app: 'lululemon',
          url: 'https://mobbin.com/screens/013f6a05-d050-4f9d-a225-2cebc8560981',
        },
      ],
      before: rects.before,
      after: rects.after,
    },
  ],
};
template = template.replace(
  /(<script type="application\/json" id="board-data">)[\s\S]*?(<\/script>)/,
  `$1\n${JSON.stringify(data, null, 2)}\n$2`,
);
await fs.writeFile(out + '/product-comparison.html', template);
await fs.writeFile(out + '/comparison-measurements.json', JSON.stringify(rects, null, 2));
const board = await browser.newPage({
  viewport: { width: 1200, height: 1000 },
  deviceScaleFactor: 2,
});
await board.goto('file://' + process.cwd() + '/' + out + '/product-comparison.html');
await board
  .waitForFunction(
    () =>
      document.querySelectorAll('.move').length > 0 || document.querySelectorAll('.row').length > 0,
    {},
    { timeout: 3000 },
  )
  .catch(() => {});
await board.evaluate(() => document.fonts.ready);
await board.waitForTimeout(300);
await board.locator('.board').screenshot({ path: out + '/product-comparison.png' });
await browser.close();
