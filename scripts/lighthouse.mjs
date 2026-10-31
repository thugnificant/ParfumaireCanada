import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'node:fs/promises';
const origin = process.env.QA_URL || 'http://127.0.0.1:4322';
const results = [];
for (const [name, route] of [
  ['home', '/'],
  ['product', '/products/la-tour-scent-diffuser/'],
]) {
  const chrome = await launch({
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    chromeFlags: ['--headless', '--no-sandbox'],
  });
  try {
    const r = await lighthouse(origin + route, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
    });
    await fs.writeFile(`docs/qa/lighthouse-${name}.json`, r.report);
    results.push({
      name,
      url: origin + route,
      scores: Object.fromEntries(
        Object.entries(r.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
      ),
      LCP: r.lhr.audits['largest-contentful-paint'].numericValue,
      CLS: r.lhr.audits['cumulative-layout-shift'].numericValue,
      TBT: r.lhr.audits['total-blocking-time'].numericValue,
      failed: Object.entries(r.lhr.audits)
        .filter(([, a]) => a.score !== null && a.score < 0.9)
        .map(([id, a]) => ({ id, title: a.title, score: a.score })),
    });
  } finally {
    await chrome.kill();
  }
}
await fs.writeFile('docs/qa/lighthouse-summary.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
