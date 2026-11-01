import { flightAt } from '../lib/flight';
const root = document.querySelector<HTMLElement>('[data-atmosphere]');
if (root) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const product = root.querySelector<HTMLElement>('.atmosphere-product')!;
  const origin = root.querySelector<HTMLElement>('.flight-origin')!;
  const landing = root.querySelector<HTMLElement>('.atmosphere-landing')!;
  const photo = root.querySelector<HTMLImageElement>('.landing-photo')!;
  const copy = root.querySelector<HTMLElement>('.landing-copy')!;
  const shadow = root.querySelector<HTMLElement>('.landing-shadow')!;
  const toggle = document.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  let paused = preference.matches;
  let scheduled = false;
  let path = { x0: 0, y0: 0, x1: 0, y1: 0, scale: 1, start: 0, end: 1, height: 0, copyBottom: 0 };

  function measure() {
    const bounds = root!.getBoundingClientRect();
    const from = origin.getBoundingClientRect();
    const scene = landing.getBoundingClientRect();
    // A 46.7 cm Max stands on the rug beside the sofa. Keep its floor contact
    // attached to the same source-photo coordinate through every cover crop.
    const cropScale = Math.max(scene.width / 5616, scene.height / 3749);
    const imageW = 5616 * cropScale;
    const imageH = 3749 * cropScale;
    const mobile = innerWidth <= 700;
    const footX = (scene.width - imageW) * (mobile ? 0.66 : 0.5) + imageW * 0.62;
    const footY = (scene.height - imageH) * 0.65 + imageH * 0.925;
    const targetHeight = imageH * 0.36;
    const originHeight = from.height;
    product.style.width = `${originHeight * 0.82}px`;
    product.style.height = `${originHeight}px`;
    landing.style.setProperty('--foot-x', `${footX}px`);
    landing.style.setProperty('--foot-y', `${footY}px`);
    landing.style.setProperty('--landed-height', `${targetHeight}px`);
    shadow.style.width = `${targetHeight * 0.52}px`;
    path = {
      x0: from.left + from.width / 2 - bounds.left,
      y0: from.top + from.height / 2 - bounds.top,
      x1: scene.left - bounds.left + footX,
      y1: scene.top - bounds.top + footY - targetHeight * 0.448,
      scale: targetHeight / originHeight,
      height: originHeight,
      copyBottom: mobile ? -Infinity : copy.getBoundingClientRect().bottom - bounds.top,
      start: bounds.top + scrollY - 110,
      // Arrive while the floor contact is in view, before normal scroll carries it away.
      end: scene.top + scrollY + footY - innerHeight * (mobile ? 0.87 : 0.9),
    };
    draw();
  }
  function draw() {
    scheduled = false;
    const p = paused ? 0 : clamp((scrollY - path.start) / Math.max(1, path.end - path.start));
    const pose = flightAt(p);
    const x = path.x0 + (path.x1 - path.x0) * pose.travel;
    const y = path.y0 + (path.y1 - path.y0) * pose.drop;
    const scale = 1 + (path.scale - 1) * pose.depth;
    product.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
    product.dataset.flight = String(p);
    product.dataset.landed = String(pose.contact);
    // Reveal the room caption after the descending cabinet has cleared it.
    // On phones the caption is below the photo and stays visible throughout.
    copy.style.opacity = paused
      ? '1'
      : String(clamp((y - path.height * scale * 0.28 - path.copyBottom) / 80));
    shadow.style.opacity = paused ? '0.28' : String(clamp((p - 0.65) / 0.35) * 0.28);
    shadow.style.transform = `translate(-50%,-50%) scale(${1.7 - 0.7 * pose.contact})`;
    shadow.style.filter = `blur(${1.8 + 11 * (1 - pose.contact)}px)`;
    root!.dataset.progress = p.toFixed(4);
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(draw);
    }
  }
  function mode() {
    root!.classList.add('motion-ready');
    root!.classList.toggle('flight-enabled', !paused);
    document.documentElement.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    document.dispatchEvent(new CustomEvent('parfumaire:motion', { detail: paused }));
    measure();
  }
  toggle.addEventListener('click', () => {
    paused = !paused;
    mode();
  });
  preference.addEventListener('change', () => {
    paused = preference.matches;
    mode();
  });
  addEventListener('scroll', schedule, { passive: true });
  // Lenis fires inside its RAF, keeping the object on the very same scroll frame.
  document.addEventListener('parfumaire:scroll', draw);
  const resize = new ResizeObserver(measure);
  resize.observe(root);
  resize.observe(document.querySelector<HTMLElement>('.site-header')!);
  photo.addEventListener('load', measure);
  document.fonts.ready.then(measure);
  mode();
}
