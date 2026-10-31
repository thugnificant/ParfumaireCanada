import data from '../data/catalog.json';
export const products = data;
export type Product = typeof products[number];
export const byHandle = (handle: string) => products.find(p => p.handle === handle)!;
export const price = (minor: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD', currencyDisplay: 'code', maximumFractionDigits: 0 }).format(minor / 100);
export function priceLabel(p: Product) { const values = p.variants.map(v => v.priceMinor); return `${Math.min(...values) !== Math.max(...values) ? 'From ' : ''}${price(Math.min(...values))}`; }
export const productPath = (p: Product) => `/products/${p.handle}/`;
export function notesText(p: Product) { return Object.values(p.notes).flat().filter(Boolean).join(' · '); }
export function family(p: Product) {
 const n = notesText(p).toLowerCase();
 if (/orange|lemon|mandarin|grapefruit|bergamot|citrus/.test(n)) return 'Citrus & fresh';
 if (/rose|jasmine|flower|peony|iris/.test(n)) return 'Floral & soft';
 if (/saffron|cinnamon|clove|cumin|incense/.test(n)) return 'Warm & spicy';
 return 'Woody & musky';
}
