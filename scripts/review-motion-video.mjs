import http from 'node:http';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
const directory = process.argv[2] || 'docs/qa/revision-three';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const names = process.argv[3] ? [process.argv[3]] : ['desktop', 'mobile'];
const times = (process.argv[4] || '1,3,5,7,9,11').split(',').map(Number);
for (const name of names) {
  const file = await fs.readFile(`${directory}/${name}-scroll.webm`);
  const server = http.createServer((req, res) => {
    if (req.url !== '/clip.webm') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        '<video id="clip" src="/clip.webm" muted preload="auto"></video><canvas id="frame"></canvas>',
      );
      return;
    }
    const match = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = Number(match[1]),
        end = match[2] ? Math.min(Number(match[2]), file.length - 1) : file.length - 1;
      res.writeHead(206, {
        'Content-Type': 'video/webm',
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Content-Length': end - start + 1,
      });
      res.end(file.subarray(start, end + 1));
    } else {
      res.writeHead(200, {
        'Content-Type': 'video/webm',
        'Accept-Ranges': 'bytes',
        'Content-Length': file.length,
      });
      res.end(file);
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  const duration = await page.locator('video').evaluate((v) => v.duration);
  const frames = [];
  for (const t of times) {
    const data = await page.evaluate(
      async (time) => {
        const v = document.querySelector('video'),
          c = document.querySelector('canvas');
        if (Math.abs(v.currentTime - time) > 0.01)
          await new Promise((resolve) => {
            v.requestVideoFrameCallback(resolve);
            v.currentTime = time;
          });
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        c.getContext('2d').drawImage(v, 0, 0);
        return c.toDataURL('image/png').split(',')[1];
      },
      Math.min(t, duration - 0.05),
    );
    const width = name === 'desktop' ? 640 : 260,
      height = name === 'desktop' ? 445 : 563;
    frames.push(
      await sharp(Buffer.from(data, 'base64'))
        .resize(width, height, { fit: 'contain', background: '#efeee6' })
        .png()
        .toBuffer(),
    );
  }
  const width = name === 'desktop' ? 640 : 260,
    height = name === 'desktop' ? 445 : 563;
  await sharp({
    create: {
      width: width * 3,
      height: height * Math.ceil(times.length / 3),
      channels: 3,
      background: '#efeee6',
    },
  })
    .composite(
      frames.map((input, i) => ({ input, left: (i % 3) * width, top: Math.floor(i / 3) * height })),
    )
    .webp({ quality: 90 })
    .toFile(`${directory}/${name}-recording-review.webp`);
  console.log(`${name}: reviewed frames at ${times.join(', ')} seconds of ${duration.toFixed(1)}s`);
  await page.close();
  await new Promise((resolve) => server.close(resolve));
}
await browser.close();
