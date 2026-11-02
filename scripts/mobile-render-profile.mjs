import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const out = process.env.QA_OUT || 'docs/qa/revision-ten/render-before.json';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await page.addInitScript(() => {
  window.renderProfile = { copies: 0, copiedPixels: 0, draws: 0, contexts: [], longTasks: [] };
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    const context = get.call(this, type, ...args);
    if (context && (type === 'webgl2' || type === 'webgl') && !context.__profiled) {
      context.__profiled = true;
      window.renderProfile.contexts.push({ canvas: this, type });
      for (const method of [
        'drawElements',
        'drawArrays',
        'drawElementsInstanced',
        'drawArraysInstanced',
      ]) {
        const original = context[method];
        if (original)
          context[method] = function (...args) {
            window.renderProfile.draws++;
            return original.apply(this, args);
          };
      }
    }
    return context;
  };
  const copy = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    if (source instanceof HTMLCanvasElement && source.width >= 1024) {
      window.renderProfile.copies++;
      window.renderProfile.copiedPixels +=
        args.length === 8 ? args[2] * args[3] : source.width * source.height;
    }
    return copy.call(this, source, ...args);
  };
  new PerformanceObserver((list) =>
    window.renderProfile.longTasks.push(
      ...list.getEntries().map((e) => ({ start: e.startTime, duration: e.duration })),
    ),
  ).observe({ type: 'longtask', buffered: true });
});
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
await page.goto(process.env.QA_URL || 'http://127.0.0.1:4323/', { waitUntil: 'networkidle' });
await page.locator('.atmosphere-product[data-model="ready"]').waitFor();
await page.evaluate(() => {
  Object.assign(window.renderProfile, { copies: 0, copiedPixels: 0, draws: 0, longTasks: [] });
});
for (const distance of [190, 190, 220, -330, 350, 390, 400, 400, -350, 350]) {
  await cdp.send('Input.synthesizeScrollGesture', {
    x: 190,
    y: distance > 0 ? 620 : 230,
    yDistance: -distance,
    speed: 600,
    gestureSourceType: 'touch',
  });
}
const result = await page.evaluate(() => ({
  ...window.renderProfile,
  contexts: window.renderProfile.contexts.map(({ canvas, type }) => ({
    type,
    attached: canvas.isConnected,
    width: canvas.width,
    height: canvas.height,
  })),
  longTasks: window.renderProfile.longTasks,
  viewport: innerWidth,
  dpr: devicePixelRatio,
  drivers: [...document.querySelectorAll('[data-atmosphere],[data-business-story]')].map((e) => ({
    driver: e.dataset.motionDriver || 'scroll-events',
  })),
}));
await fs.mkdir(out.slice(0, out.lastIndexOf('/')), { recursive: true });
await fs.writeFile(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close();
