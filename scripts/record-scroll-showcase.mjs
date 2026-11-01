import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.QA_URL || 'http://127.0.0.1:4323';
const out = process.env.QA_OUT || 'docs/qa/revision-five/showcase';
await fs.mkdir(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const width of [1440, 390]) {
  const height = width === 390 ? 844 : 1000;
  const context = await b.newContext({
    viewport: { width, height },
    recordVideo: { dir: `${out}/recordings`, size: { width, height } },
  });
  const p = await context.newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.locator('.atmosphere-product[data-model="ready"]').waitFor();
  await p.waitForTimeout(700);
  await p.mouse.move(width * 0.8, height * 0.6);
  // Calibrate the OS wheel multiplier, then finish with the complete room in
  // view at both viewport sizes. A fixed wheel distance could stop mid-flight.
  const finishY = await p
    .locator('.office-scene')
    .evaluate((e) => e.getBoundingClientRect().top + scrollY - 120);
  await p.evaluate(() => {
    window.showcaseDelta = 0;
    addEventListener(
      'wheel',
      (e) => {
        window.showcaseDelta = e.deltaY;
      },
      { once: true },
    );
  });
  await p.mouse.wheel(0, 80);
  await p.waitForFunction(() => window.showcaseDelta > 0);
  const delivered = await p.evaluate(() => window.showcaseDelta);
  const multiplier = 80 / delivered;
  for (let i = 0; i < 16; i++) {
    await p.mouse.wheel(0, ((finishY - delivered) * multiplier) / 16);
    await p.waitForTimeout(75);
  }
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `${out}/finished-floor-${width}.png` });
  await p.mouse.wheel(0, 180 * multiplier);
  await p.waitForTimeout(1800);
  await p.mouse.wheel(0, -(finishY + 180) * multiplier);
  await p.waitForTimeout(1800);
  if (width === 1440) {
    await p.locator('.explore-toggle').hover();
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${out}/finished-menu.png` });
    await p.waitForTimeout(500);
  } else await p.screenshot({ path: `${out}/finished-hero-mobile.png` });
  const video = p.video();
  await context.close();
  await video.saveAs(`${out}/${width === 1440 ? 'desktop' : 'mobile'}-scroll.webm`);
}
await b.close();
