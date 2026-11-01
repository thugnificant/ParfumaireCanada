const root = document.querySelector<HTMLElement>('[data-atmosphere]');
if (root) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const product = root.querySelector<HTMLElement>('.atmosphere-product')!;
  const origin = root.querySelector<HTMLElement>('.flight-origin')!;
  const landing = root.querySelector<HTMLElement>('.atmosphere-landing')!;
  const photo = root.querySelector<HTMLImageElement>('.landing-photo')!;
  const shadow = root.querySelector<HTMLElement>('.landing-shadow')!;
  const toggle = document.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  let paused = preference.matches;
  let scheduled = false;
  let path = { x0: 0, y0: 0, x1: 0, y1: 0, scale: 1, start: 0, end: 1 };

  function measure() {
    const bounds = root!.getBoundingClientRect();
    const from = origin.getBoundingClientRect();
    const scene = landing.getBoundingClientRect();
    // The marker follows the photograph's object-fit crop at every viewport size.
    // The foot is at 82% down / 31% across the source desk photograph.
    const cropScale = Math.max(scene.width / 6000, scene.height / 4000);
    const imageW = 6000 * cropScale;
    const imageH = 4000 * cropScale;
    const mobile = innerWidth <= 700;
    const footX = (scene.width - imageW) * (mobile ? 0.26 : 0.5) + imageW * 0.31;
    const footY = (scene.height - imageH) * 0.6 + imageH * 0.82;
    const targetHeight = imageH * 0.32;
    const originHeight = from.height;
    product.style.width = `${originHeight * 0.72}px`;
    product.style.height = `${originHeight}px`;
    landing.style.setProperty('--foot-x', `${footX}px`);
    landing.style.setProperty('--foot-y', `${footY}px`);
    landing.style.setProperty('--landed-height', `${targetHeight}px`);
    shadow.style.width = `${targetHeight * 0.46}px`;
    path = {
      x0: from.left + from.width / 2 - bounds.left,
      y0: from.top + from.height / 2 - bounds.top,
      x1: scene.left - bounds.left + footX,
      y1: scene.top - bounds.top + footY - targetHeight * 0.448,
      scale: targetHeight / originHeight,
      start: bounds.top + scrollY - 110,
      // Arrive while the whole desk surface is in view, before normal scroll carries it away.
      end: scene.top + scrollY + footY - innerHeight * (mobile ? 0.8 : 0.77),
    };
    draw();
  }
  function draw() {
    scheduled = false;
    const p = paused ? 0 : clamp((scrollY - path.start) / Math.max(1, path.end - path.start));
    // A single reversible, scroll-linked path. No pinning, delayed catches or scene swaps.
    const eased = p * p * (3 - 2 * p);
    const x = path.x0 + (path.x1 - path.x0) * eased;
    const y = path.y0 + (path.y1 - path.y0) * eased;
    const scale = 1 + (path.scale - 1) * eased;
    product.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
    product.dataset.flight = String(eased);
    product.dataset.landed = String(eased);
    shadow.style.opacity = paused ? '0.23' : String(clamp((p - 0.78) / 0.22) * 0.23);
    shadow.style.transform = `translate(-50%,-50%) scale(${1.35 - 0.35 * eased})`;
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
  const resize = new ResizeObserver(measure);
  resize.observe(root);
  photo.addEventListener('load', measure);
  document.fonts.ready.then(measure);
  mode();
}
