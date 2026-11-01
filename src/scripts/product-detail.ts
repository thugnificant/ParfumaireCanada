import { price } from '../lib/pricing';
const root = document.querySelector<HTMLElement>('[data-product]')!;
const p = JSON.parse(root.dataset.product!);
const requestedVariant = new URLSearchParams(location.search).get('variant');
let selected =
  p.variants.find((v: { id: string }) => v.id === requestedVariant) ||
  p.variants.find((v: { id: string }) => v.id === p.initialVariantId) ||
  p.variants[0];
const img = document.querySelector<HTMLImageElement>('#product-image')!;
const zoom = document.querySelector<HTMLImageElement>('#zoomed-image')!;
const dialog = document.querySelector<HTMLDialogElement>('#image-dialog')!;
let currentIndex = 0,
  request = 0;
async function showImage(index: number) {
  const im = p.images[index];
  if (!im) return;
  const sequence = ++request;
  const next = new Image();
  next.src = im.path;
  try {
    await next.decode();
  } catch {
    return;
  }
  if (sequence !== request) return;
  currentIndex = index;
  img.src = im.path;
  img.alt = im.alt;
  zoom.dataset.src = im.full || im.path;
  zoom.alt = im.alt;
  document.querySelector('#gallery-counter')!.textContent = `${index + 1} / ${p.images.length}`;
  document
    .querySelectorAll<HTMLElement>('[data-gallery-index]')
    .forEach((b) =>
      b.setAttribute('aria-pressed', String(Number(b.dataset.galleryIndex) === index)),
    );
}
document
  .querySelectorAll<HTMLElement>('[data-gallery-index]')
  .forEach((b) =>
    b.addEventListener('click', () => void showImage(Number(b.dataset.galleryIndex))),
  );
// Horizontal swipes change the photograph; vertical movement remains native scrolling.
let touch: { x: number; y: number } | undefined;
img.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length === 1) touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  },
  { passive: true },
);
img.addEventListener(
  'touchend',
  (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x,
      dy = e.changedTouches[0].clientY - touch.y;
    touch = undefined;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5)
      void showImage((currentIndex + (dx < 0 ? 1 : -1) + p.images.length) % p.images.length);
  },
  { passive: true },
);
const quantity = document.querySelector<HTMLInputElement>('#product-quantity')!;
function update() {
  const amount = Math.min(999, Math.max(1, Math.floor(Number(quantity.value) || 1)));
  const url = new URL('/contact/', location.origin);
  url.searchParams.set('product', p.handle);
  url.searchParams.set('variant', selected.id);
  url.searchParams.set('quantity', String(amount));
  for (const id of ['#product-enquiry', '#mobile-enquiry'])
    document.querySelector<HTMLAnchorElement>(id)!.href = url.pathname + url.search;
  document.querySelector('#variant-price')!.textContent = price(selected.priceMinor);
  document.querySelector('#mobile-selection')!.textContent =
    `${selected.title === 'Default Title' ? 'Black' : selected.title} · Qty ${amount}`;
  document.querySelector<HTMLButtonElement>('[data-quantity-step="-1"]')!.disabled = amount <= 1;
  document.querySelector<HTMLButtonElement>('[data-quantity-step="1"]')!.disabled = amount >= 999;
}
function selectImage() {
  const index = p.images.findIndex(
    (im: { sourceImageId: number; variantIds: number[] }) =>
      im.sourceImageId === selected.featuredImageId || im.variantIds.includes(Number(selected.id)),
  );
  if (index >= 0) void showImage(index);
}
document.querySelectorAll<HTMLInputElement>('input[name=variant]').forEach((r) =>
  r.addEventListener('change', () => {
    selected = p.variants.find((v: { id: string }) => v.id === r.value);
    selectImage();
    update();
  }),
);
quantity.addEventListener('input', update);
quantity.addEventListener('blur', () => {
  quantity.value = String(Math.min(999, Math.max(1, Math.floor(Number(quantity.value) || 1))));
  update();
});
document.querySelectorAll<HTMLElement>('[data-quantity-step]').forEach((b) =>
  b.addEventListener('click', () => {
    quantity.value = String(
      Math.min(999, Math.max(1, (Number(quantity.value) || 1) + Number(b.dataset.quantityStep))),
    );
    update();
  }),
);
if (requestedVariant && selected.id === requestedVariant) {
  const radio = document.querySelector<HTMLInputElement>(
    `input[name=variant][value="${selected.id}"]`,
  );
  if (radio) radio.checked = true;
  selectImage();
}
update();
const bar = document.querySelector<HTMLElement>('.mobile-product-action')!;
const quote = document.querySelector<HTMLElement>('#product-enquiry')!;
let actionFrame = 0;
function positionAction() {
  actionFrame = 0;
  bar.hidden = innerWidth > 700 || quote.getBoundingClientRect().bottom >= 100;
}
// Fast flings can skip the primary button entirely between observer callbacks.
// Read its current position once per scroll frame so the action still appears.
function scheduleAction() {
  if (!actionFrame) actionFrame = requestAnimationFrame(positionAction);
}
addEventListener('scroll', scheduleAction, { passive: true });
addEventListener('resize', scheduleAction);
positionAction();
document.querySelector('#zoom-image')!.addEventListener('click', () => {
  zoom.src = zoom.dataset.src!;
  dialog.showModal();
});
document.querySelector('.close-dialog')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});
