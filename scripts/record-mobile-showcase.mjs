import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const out = 'docs/qa/revision-nine/showcase';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  recordVideo: { dir: out + '/recordings', size: { width: 390, height: 844 } },
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await page.goto('http://127.0.0.1:4323/', { waitUntil: 'networkidle' });
await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
const swipe = async (distance, speed = 260) => {
  await cdp.send('Input.synthesizeScrollGesture', {
    x: 190,
    y: distance > 0 ? 650 : 230,
    yDistance: -distance,
    speed,
    gestureSourceType: 'touch',
  });
};
await page.waitForTimeout(600);
for (let i = 0; i < 4; i++) {
  await swipe(180);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(500);
await page.locator('.office-hotspot .hotspot-trigger').tap();
await page.waitForTimeout(900);
await page.keyboard.press('Escape');
await page.screenshot({ path: `${out}/phone-office.webp` });
await swipe(-350, 420);
await swipe(350, 420);
await page.waitForTimeout(300);
for (let i = 0; i < 6; i++) {
  await swipe(190, 300);
  await page.waitForTimeout(80);
}
await page.locator('.business-hotspot .hotspot-trigger').tap();
await page.waitForTimeout(800);
await page.keyboard.press('Escape');
await page.screenshot({ path: `${out}/phone-business.webp` });
await swipe(-360, 360);
await swipe(360, 360);
await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/phone-menu.webp` });
await page.locator('#mobile-nav').getByRole('link', { name: 'Scent diffusers', exact: true }).tap();
await page.waitForURL('**/collections/scent-diffusers/');
await page.locator('a[aria-label="Explore La Tour Scent Diffuser"]').tap();
await page.waitForURL('**/products/la-tour-scent-diffuser/');
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/phone-product.webp` });
await page.locator('#mobile-enquiry').tap();
await page.waitForTimeout(800);
await page.locator('#product-enquiry').tap();
await page.waitForURL('**/contact/**');
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/phone-quote.webp` });
const video = page.video();
await context.close();
await video.saveAs(`${out}/phone-tour.webm`);
await browser.close();
console.log(`${out}/phone-tour.webm`);
