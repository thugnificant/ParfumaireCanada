import { chromium } from '@playwright/test';
import sharp from 'sharp';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:4323/');
await page.locator('.business-scene').scrollIntoViewIfNeeded();
await page.waitForFunction(
  () => document.querySelector('.business-flight').dataset.model === 'ready',
);
await page.evaluate(() => {
  const el = document.querySelector('.business-flight');
  el.style.width = '1024px';
  el.style.height = '1024px';
  el.dataset.landed = '1';
  el.dataset.flight = '1';
});
await page.waitForTimeout(500);
const data = await page
  .locator('.business-flight canvas')
  .evaluate((c) => c.toDataURL('image/png'));
await sharp(Buffer.from(data.split(',')[1], 'base64'))
  .webp({ quality: 95, alphaQuality: 100 })
  .toFile('public/images/models/business-tour-rest.webp');
await browser.close();
// Final resting renders use the same photographed floor coordinates as the live scenes.
for (const [stem, poster, w, h, x, y, size, offset, ratio] of [
  ['business-reception', 'business-tour-rest', 2752, 1536, 0.604, 0.775, 0.34, 0.479, 1],
  ['corporate-reception', 'corporate-max-rest', 2752, 1536, 0.603, 0.762, 0.14, 0.463, 1.3],
]) {
  const ph = Math.round(h * size),
    pw = Math.round(ph * ratio);
  const model = await sharp(`public/images/models/${poster}.webp`).resize(pw, ph).toBuffer();
  const final = await sharp(`public/images/photography/${stem}-2752.webp`)
    .composite([
      {
        input: model,
        left: Math.round(w * x - pw / 2),
        top: Math.round(h * y - ph * offset - ph / 2),
      },
    ])
    .toBuffer();
  for (const width of [1280, 2528])
    await sharp(final)
      .resize({ width })
      .webp({ quality: 93 })
      .toFile(`public/images/photography/${stem}-product-${width}.webp`);
}
