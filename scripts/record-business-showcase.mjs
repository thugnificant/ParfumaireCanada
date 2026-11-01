import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.QA_URL || 'http://127.0.0.1:4323',
  out = process.env.QA_OUT || 'docs/qa/revision-eight/showcase';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const width of [1440, 390]) {
  const height = width < 700 ? 844 : 1000,
    context = await browser.newContext({
      viewport: { width, height },
      isMobile: width < 700,
      hasTouch: width < 700,
      recordVideo: { dir: out + '/recordings', size: { width, height } },
    });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  const path = await page.evaluate(() => {
    const source = document.querySelector('[data-business-origin]').getBoundingClientRect(),
      scene = document.querySelector('.business-scene').getBoundingClientRect();
    return {
      start: source.y + scrollY - Math.min(innerHeight * 0.3, 240) - 20,
      end: scene.y + scrollY - 110,
    };
  });
  await page.evaluate((y) => scrollTo({ top: y, behavior: 'instant' }), path.start);
  await page.waitForFunction(
    () => document.querySelector('.business-flight').dataset.model === 'ready',
  );
  await page.waitForTimeout(600);
  await page.mouse.move(width * 0.92, height * 0.6);
  await page.evaluate(() => {
    window.delta = 0;
    addEventListener('wheel', (e) => (window.delta = e.deltaY), { once: true });
  });
  await page.mouse.wheel(0, 50);
  await page.waitForFunction(() => window.delta > 0);
  const delivered = await page.evaluate(() => window.delta),
    factor = 50 / delivered;
  for (let i = 0; i < 36; i++) {
    await page.mouse.wheel(0, ((path.end - path.start - delivered) * factor) / 36);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/business-landed-${width}.webp` });
  const dot = page.locator('.business-hotspot .hotspot-trigger');
  if (width < 700) await dot.tap();
  else await dot.hover();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${out}/business-label-${width}.webp` });
  await page.mouse.move(width * 0.92, height * 0.85);
  await dot.focus();
  await page.keyboard.press('Escape');
  await page.mouse.click(8, height * 0.85);
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, (-(path.end - path.start) * factor) / 30);
    await page.waitForTimeout(75);
  }
  await page.waitForTimeout(800);
  const video = page.video();
  await context.close();
  await video.saveAs(`${out}/${width < 700 ? 'mobile' : 'desktop'}-scroll.webm`);
}
await browser.close();
