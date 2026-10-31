import fs from 'node:fs';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
const catalog = JSON.parse(fs.readFileSync('src/data/catalog.json', 'utf8'));
const inventory = JSON.parse(fs.readFileSync('docs/migration/source-inventory.json', 'utf8'));
const translations = [];
const pagination = [];
const sourceFile = (url) =>
  'archive/pages/' + crypto.createHash('sha256').update(url).digest('hex').slice(0, 16) + '.html';
for (const r of inventory.filter((x) => x.language === 'es')) {
  const file = sourceFile(r.source);
  if (!fs.existsSync(file)) continue;
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
  $('script,style,form,iframe,svg').remove();
  const description = $('.product__description').first().html();
  translations.push({
    source: r.source,
    language: 'es',
    title: $('h1').first().text().trim(),
    descriptionHtml: description || null,
    contentText: description ? null : $('main').text().trim(),
    status: 'Preserved source translation; Canadian publication pending editorial review',
  });
}
for (const p of catalog) {
  const $ = cheerio.load(fs.readFileSync(sourceFile(p.sourceUrl), 'utf8'));
  const paginated = $('.jdgm-paginate__last-page').length > 0;
  pagination.push({
    handle: p.handle,
    source: p.sourceUrl,
    reportedReviews: Number(
      $('.jdgm-rev-widg__summary-text').first().text().match(/\d+/)?.[0] || 0,
    ),
    lastPage: Number($('.jdgm-paginate__last-page').first().attr('data-page') || 1),
    status: paginated
      ? 'first-page-preserved; additional app pages unavailable'
      : 'available reviews preserved',
    reason: paginated
      ? 'Public reviews_for_widget request returned HTTP 404; source pagination click did not retrieve a response on 2026-10-31. Recheck on refresh; no reviews fabricated.'
      : null,
  });
}
fs.writeFileSync('source-data/translations.json', JSON.stringify(translations, null, 2));
fs.writeFileSync('docs/migration/review-pagination.json', JSON.stringify(pagination, null, 2));
console.log(
  `Preserved ${translations.length} Spanish source snapshots; recorded review pagination.`,
);
