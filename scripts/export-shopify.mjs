import fs from 'node:fs/promises';
import { site } from '../src/data/site.mjs';
const products = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
const args = process.argv.slice(2);
const currency = args.find((x) => x.startsWith('--store-currency='))?.split('=')[1];
if (currency !== 'USD')
  throw Error(
    'This export contains source USD prices. Pass --store-currency=USD only for a USD staging store. For a CAD store, approve Canadian pricing and update the exporter first. No conversion is inferred.',
  );
const assetBase = args.find((x) => x.startsWith('--asset-base='))?.split('=')[1] || site.demoUrl;
if (!assetBase.startsWith('https://')) throw Error('Public HTTPS asset base required');
const headers = [
  'Title',
  'URL handle',
  'Description',
  'Vendor',
  'Type',
  'Tags',
  'Published on online store',
  'Status',
  'Option1 name',
  'Option1 value',
  'Option2 name',
  'Option2 value',
  'Option3 name',
  'Option3 value',
  'SKU',
  'Price',
  'Compare-at price',
  'Requires shipping',
  'Weight value (grams)',
  'Product image URL',
  'Image position',
  'Image alt text',
  'Variant image URL',
  'SEO title',
  'SEO description',
];
const rows = [];
const sidecar = [];
for (const p of products) {
  const count = Math.max(p.variants.length, p.images.length);
  for (let i = 0; i < count; i++) {
    const v = p.variants[i],
      im = p.images[i];
    const row = { 'URL handle': p.handle };
    if (i === 0)
      Object.assign(row, {
        Title: p.title,
        Description: p.descriptionHtml,
        Vendor: p.vendor,
        Type: p.sourceType,
        Tags: p.tags.join(','),
        'Published on online store': 'false',
        Status: 'draft',
        'SEO title': p.title,
        'SEO description': `Explore ${p.title}, product details and fragrance options from Parfumaire.`,
      });
    if (v) {
      Object.assign(row, {
        'Option1 name': p.options[0]?.name || 'Title',
        'Option1 value': v.options[0] || 'Default Title',
        'Option2 name': p.options[1]?.name || '',
        'Option2 value': v.options[1] || '',
        'Option3 name': p.options[2]?.name || '',
        'Option3 value': v.options[2] || '',
        SKU: v.sku || '',
        Price: (v.priceMinor / 100).toFixed(2),
        'Compare-at price': v.compareAtMinor ? (v.compareAtMinor / 100).toFixed(2) : '',
        'Requires shipping': String(v.requiresShipping),
        'Weight value (grams)': v.grams,
      });
      const vi = p.images.find((x) => x.sourceImageId === v.featuredImageId);
      if (vi) row['Variant image URL'] = assetBase + vi.path;
      sidecar.push({
        handle: p.handle,
        sourceProductId: p.id,
        sourceVariantId: v.id,
        sku: v.sku,
        sourceAvailable: v.sourceAvailable,
        sourceCurrency: p.sourceCurrency,
        sourcePriceMinor: v.priceMinor,
        canadianPriceMinor: null,
        notes: p.notes,
        sourceUrl: p.sourceUrl,
      });
    }
    if (im)
      Object.assign(row, {
        'Product image URL': assetBase + im.path,
        'Image position': im.position,
        'Image alt text': im.alt,
      });
    rows.push(headers.map((h) => row[h] ?? ''));
  }
}
const quote = (v) => '"' + String(v).replaceAll('"', '""') + '"';
await fs.mkdir('exports', { recursive: true });
await fs.writeFile(
  'exports/shopify-products-USD-draft.csv',
  [headers, ...rows].map((row) => row.map(quote).join(',')).join('\n') + '\n',
);
await fs.writeFile('exports/shopify-source-metafields.json', JSON.stringify(sidecar, null, 2));
console.log(
  `Exported ${products.length} draft products, ${sidecar.length} variants and ${rows.length} rows. Public demo image URLs; recheck CSV columns and upload originals for the eventual migration.`,
);
