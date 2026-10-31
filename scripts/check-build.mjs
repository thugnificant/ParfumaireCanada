import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { site } from '../src/data/site.mjs';
const origin = site.environment === 'production' ? site.productionUrl : site.demoUrl;
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const files = walk('dist').filter((x) => x.endsWith('.html'));
const failures = [];
for (const file of files) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
  const route = file.replace(/^dist/, '').replace(/index.html$/, '');
  if ($('h1').length !== 1) failures.push(`${route}: needs exactly one h1`);
  if (!site.indexing && !$('meta[name=robots]').attr('content')?.includes('noindex'))
    failures.push(`${route}: missing demo noindex`);
  if (
    !$('link[rel=canonical]')
      .attr('href')
      ?.startsWith(origin + '/')
  )
    failures.push(`${route}: bad canonical`);
  if (!$('title').text() || !$('meta[name=description]').attr('content'))
    failures.push(`${route}: missing metadata`);
  $('script[type="application/ld+json"]').each((_, e) => {
    try {
      const data = JSON.parse($(e).text());
      if (JSON.stringify(data).includes('"Offer"'))
        failures.push(`${route}: demo must not have Offers`);
    } catch {
      failures.push(`${route}: invalid JSON-LD`);
    }
  });
  $('a[href],img[src],link[href],script[src]').each((_, e) => {
    const attr = $(e).attr('href') || $(e).attr('src');
    if (!attr?.startsWith('/') || attr.startsWith('//')) return;
    const value = attr.split('?')[0].split('#')[0];
    let dest = 'dist' + value;
    if (value.endsWith('/')) dest += 'index.html';
    if (!fs.existsSync(dest)) failures.push(`${route}: missing ${value}`);
  });
  $('img').each((_, e) => {
    if ($(e).attr('alt') === undefined) failures.push(`${route}: missing alt`);
    if (!$(e).attr('width') || !$(e).attr('height'))
      failures.push(`${route}: missing image dimensions`);
  });
}
assert.equal(failures.length, 0, failures.join('\n'));
assert(fs.existsSync('dist/404.html'));
assert(!fs.readFileSync('dist/robots.txt', 'utf8').includes('Disallow: /'));
if (!site.indexing) assert(!fs.readFileSync('dist/sitemap.xml', 'utf8').includes('<url>'));
console.log(
  `Checked ${files.length} HTML pages: internal links, assets, headings, metadata, JSON-LD, demo noindex and image dimensions passed.`,
);
