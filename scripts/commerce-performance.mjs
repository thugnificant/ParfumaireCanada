import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.addInitScript(() => {
  window.performanceSample = { longTasks: [], frames: [] };
  new PerformanceObserver((l) =>
    window.performanceSample.longTasks.push(
      ...l.getEntries().map((e) => ({ start: e.startTime, duration: e.duration })),
    ),
  ).observe({ type: 'longtask', buffered: true });
  let previous = 0;
  function frame(t) {
    if (previous) window.performanceSample.frames.push(t - previous);
    previous = t;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
await page.goto(
  (process.env.QA_URL || 'http://127.0.0.1:4323') +
    (process.env.QA_PATH || '/products/la-tour-scent-diffuser/'),
  { waitUntil: 'networkidle' },
);
await page.waitForTimeout(1000);
await page.evaluate(() => {
  window.performanceSample.longTasks = [];
  window.performanceSample.frames = [];
});
for (let i = 0; i < 6; i++) {
  await cdp.send('Input.synthesizeScrollGesture', {
    x: 190,
    y: 650,
    yDistance: -440,
    speed: 600,
    gestureSourceType: 'touch',
  });
  await page.waitForTimeout(150);
}
const result = await page.evaluate(() => {
  let f = window.performanceSample.frames.sort((a, b) => a - b);
  return {
    url: location.pathname,
    viewport: innerWidth,
    throttle: 4,
    frames: f.length,
    p95FrameMs: f[Math.floor(f.length * 0.95)],
    longTasks: window.performanceSample.longTasks,
    liveModels: document.querySelectorAll('[data-model="ready"]').length,
    threeLoaded: performance
      .getEntriesByType('resource')
      .filter((x) => x.name.includes('product-view'))
      .map((x) => ({ url: x.name, bytes: x.transferSize })),
    downloadBytes: performance.getEntriesByType('resource').reduce((n, e) => n + e.transferSize, 0),
  };
});
await fs.writeFile(
  process.env.QA_OUT || 'docs/qa/revision-eight/performance-before.json',
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result));
await browser.close();
