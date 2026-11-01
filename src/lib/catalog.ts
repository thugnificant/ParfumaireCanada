import { price } from './pricing';
import data from '../data/catalog.json';
import renderData from '../data/renders.json';
const renders = renderData as Record<
  string,
  {
    path: string;
    small: string;
    full: string;
    width: number;
    height: number;
    alt: string;
    sourceImageId: number;
    variantIds: number[];
  }
>;
export const products = data.map((product) => {
  const render = renders[product.handle];
  return render
    ? {
        ...product,
        images: [
          { ...product.images[product.category === 'scents' ? 2 : 0], ...render, rendered: true },
          ...product.images,
        ],
      }
    : product;
});
export type Product = (typeof products)[number];
export const byHandle = (handle: string) => products.find((p) => p.handle === handle)!;
export { price } from './pricing';
export function priceLabel(p: Product) {
  const values = p.variants.map((v) => v.priceMinor);
  return `${Math.min(...values) !== Math.max(...values) ? 'From ' : ''}${price(Math.min(...values))}`;
}
export const productPath = (p: Product) => `/products/${p.handle}/`;
export function notesText(p: Product) {
  return Object.values(p.notes).flat().filter(Boolean).join(' · ');
}
export function family(p: Product) {
  const n = notesText(p).toLowerCase();
  if (/orange|lemon|mandarin|grapefruit|bergamot|citrus/.test(n)) return 'Citrus & fresh';
  if (/rose|jasmine|flower|peony|iris/.test(n)) return 'Floral & soft';
  if (/saffron|cinnamon|clove|cumin|incense/.test(n)) return 'Warm & spicy';
  return 'Woody & musky';
}
