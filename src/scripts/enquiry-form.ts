import { deliverEnquiry, formatEnquiry, type Enquiry } from '../lib/enquiry';
const form = document.querySelector<HTMLFormElement>('.enquiry-form')!;
const config = JSON.parse(form.dataset.config!);
const products = JSON.parse(form.dataset.products!);
const params = new URLSearchParams(location.search);
const product = products.find((p: { handle: string }) => p.handle === params.get('product'));
const variant =
  product?.variants.find((v: { id: string }) => v.id === params.get('variant')) ||
  product?.variants[0];
const quantity = Math.min(999, Math.max(1, Math.floor(Number(params.get('quantity')) || 1)));
const interest = document.querySelector<HTMLSelectElement>('#interest')!;
const status = document.querySelector<HTMLElement>('#form-status')!;
const fields = document.querySelector<HTMLElement>('#quote-fields')!;
const review = document.querySelector<HTMLElement>('#quote-review')!;
const confirm = document.querySelector<HTMLButtonElement>('#enquiry-confirm')!;
const submit = document.querySelector<HTMLButtonElement>('#enquiry-submit')!;
let context = '';
if (product && variant) {
  const finish = variant.title === 'Default Title' ? 'Black' : variant.title;
  context = `${product.title} · ${finish} · Quantity: ${quantity}\nHandle: ${product.handle}${variant.sku ? ' · SKU: ' + variant.sku : ''}\nVariant ID: ${variant.id}\nProduct: ${location.origin}/products/${product.handle}/`;
  document.querySelector<HTMLElement>('#enquiry-context')!.hidden = false;
  document.querySelector<HTMLImageElement>('#quote-product-image')!.src = product.image;
  document.querySelector('#quote-product-name')!.textContent = product.title;
  document.querySelector('#quote-product-option')!.textContent = `${finish} · Quantity ${quantity}`;
  document.querySelector<HTMLAnchorElement>('#quote-product-link')!.href =
    `/products/${product.handle}/?variant=${variant.id}`;
  interest.value = 'product';
} else if (['business', 'custom'].includes(params.get('interest') || ''))
  interest.value = params.get('interest')!;
function business() {
  const active = ['business', 'custom'].includes(interest.value);
  document.querySelector<HTMLElement>('#business-field')!.hidden = !active;
  document.querySelector<HTMLInputElement>('#business')!.disabled = !active;
}
interest.addEventListener('change', business);
business();
function data(): Enquiry {
  const f = new FormData(form);
  return {
    name: String(f.get('name') || '').trim(),
    email: String(f.get('email') || '').trim(),
    phone: String(f.get('phone') || '').trim(),
    interest: String(f.get('interest') || ''),
    business: String(f.get('business') || '').trim(),
    message: String(f.get('message') || '').trim(),
    context,
  };
}
function step(index: number) {
  document.querySelectorAll('.quote-steps li').forEach((li, i) => {
    if (i === index) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const input = data();
  if (!input.name || input.message.length < 5) {
    status.textContent = 'Please enter your name and a message of at least five characters.';
    status.classList.add('form-error');
    status.focus();
    return;
  }
  const details = document.querySelector('#review-details')!;
  details.replaceChildren();
  for (const [label, value] of [
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Interested in', interest.selectedOptions[0].text],
    ['Business or space', input.business],
    ['Message', input.message],
  ]) {
    if (!value) continue;
    const dt = document.createElement('dt'),
      dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    details.append(dt, dd);
  }
  status.textContent = '';
  fields.hidden = true;
  review.hidden = false;
  step(1);
  document.querySelector<HTMLElement>('#review-heading')!.focus();
});
document.querySelector('#enquiry-edit')!.addEventListener('click', () => {
  review.hidden = true;
  fields.hidden = false;
  step(0);
  document.querySelector<HTMLInputElement>('#name')!.focus();
});
if (config.enquiry.mode === 'mailto') confirm.textContent = 'Open email draft';
else if (config.enquiry.mode === 'endpoint') confirm.textContent = 'Submit enquiry';
confirm.addEventListener('click', async () => {
  const input = data();
  confirm.disabled = true;
  const label = confirm.textContent;
  confirm.textContent =
    config.enquiry.mode === 'preview' ? 'Finishing preview…' : 'Preparing enquiry…';
  status.classList.remove('form-error');
  try {
    const result = await deliverEnquiry(input, config);
    status.textContent = result.message;
    if (result.mailto) location.href = result.mailto;
    document.querySelector<HTMLElement>('#copy-enquiry')!.hidden = false;
    if (config.enquiry.mode === 'preview') {
      form.reset();
      document.querySelector('#review-details')!.replaceChildren();
      review.hidden = true;
      document.querySelector<HTMLElement>('#quote-complete')!.hidden = false;
    }
    status.focus();
  } catch {
    status.textContent =
      'Your enquiry could not be accepted. Your details are still here. Try again or copy them.';
    status.classList.add('form-error');
    document.querySelector<HTMLElement>('#copy-enquiry')!.hidden = false;
    status.focus();
  } finally {
    confirm.disabled = false;
    confirm.textContent = label;
    business();
  }
});
submit.disabled = false;
document.querySelector('#copy-enquiry')!.addEventListener('click', async () => {
  const value =
    config.enquiry.mode === 'preview'
      ? context || 'General Parfumaire Canada enquiry preview. No personal information retained.'
      : formatEnquiry(data());
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = 'Enquiry details copied. Nothing has been sent.';
  } catch {
    status.textContent = `Copy these details manually: ${value}`;
  }
});
