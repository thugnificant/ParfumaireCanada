import { flightAt } from '../lib/flight';
const root = document.querySelector<HTMLElement>('[data-atmosphere]');
if (root) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const product = root.querySelector<HTMLElement>('.atmosphere-product')!;
  const origin = root.querySelector<HTMLElement>('.flight-origin')!;
  const landing = root.querySelector<HTMLElement>('.office-scene')!;
  const photo = root.querySelector<HTMLImageElement>('.landing-photo')!;
  const toggle = document.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  let paused = preference.matches;
  let scheduled = false;
  let path = { x0: 0, y0: 0, x1: 0, y1: 0, scale: 1, start: 0, end: 1 };

  function measure() {
    const bounds = root!.getBoundingClientRect();
    const from = origin.getBoundingClientRect();
    const scene = landing.getBoundingClientRect();
    // A 46.7 cm Max stands beside the office desk, below its 75 cm worktop.
    // Keep its floor contact
    // attached to the same source-photo coordinate through every cover crop.
    const cropScale = Math.max(scene.width / 3239, scene.height / 2422);
    const imageW = 3239 * cropScale;
    const imageH = 2422 * cropScale;
    const mobile = innerWidth <= 700;
    const footX = (scene.width - imageW) * (mobile ? 0.9 : 0.5) + imageW * 0.835;
    const footY = (scene.height - imageH) * 1 + imageH * 0.82;
    const targetHeight = imageH * 0.235;
    const originHeight = from.height;
    product.style.width = `${originHeight * 1.3}px`;
    product.style.height = `${originHeight}px`;
    landing.style.setProperty('--foot-x', `${footX}px`);
    landing.style.setProperty('--foot-y', `${footY}px`);
    landing.style.setProperty('--landed-height', `${targetHeight}px`);
    path = {
      x0: from.left + from.width / 2 - bounds.left,
      y0: from.top + from.height / 2 - bounds.top,
      x1: scene.left - bounds.left + footX,
      y1: scene.top - bounds.top + footY - targetHeight * 0.448,
      scale: targetHeight / originHeight,
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
