const root = document.querySelector<HTMLElement>('[data-atmosphere]');
if (root) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const sticky = root.querySelector<HTMLElement>('.atmosphere-sticky')!;
  const main = root.querySelector<HTMLElement>('.atmosphere-main')!;
  const product = root.querySelector<HTMLElement>('.atmosphere-product')!;
  const shadow = root.querySelector<HTMLElement>('.atmosphere-product-shadow')!;
  const rooms = [...root.querySelectorAll<HTMLElement>('[data-room]')];
  const chapters = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-scene]')];
  const toggle = root.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const stops = [0, 0.25, 0.5, 0.75, 1];
  const transitions = [0.09, 0.34, 0.59, 0.84];
  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const smooth = (value: number) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };
  let manual = preference.matches;
  let progress = 0;
  let scheduled = false;
  let start = 0,
    range = 1;

  function geometry() {
    start =
      root!.getBoundingClientRect().top +
      scrollY -
      (manual ? 0 : parseFloat(getComputedStyle(sticky).top));
    range = Math.max(1, root!.offsetHeight - sticky.offsetHeight);
  }
  function draw(value: number) {
    progress = clamp(value);
    const open = smooth(progress / 0.14);
    const landed = smooth((progress - 0.08) / 0.12);
    root!.style.setProperty('--scene-open', String(open));
    root!.style.setProperty('--word-opacity', String(1 - open));
    root!.style.setProperty('--story-progress', String(progress));
    let current = 0;
    let surfaceY = 0.68;
    rooms.forEach((room, i) => {
      const reveal = smooth((progress - transitions[i]) / 0.09);
      // A single reveal, with no blended rooms or intermediate video frames.
      room.style.clipPath = `inset(0 0 0 ${(1 - reveal) * 100}%)`;
      if (i === 1) surfaceY += 0.04 * reveal;
      if (reveal > 0.5) current = i + 1;
    });
    root!.dataset.scene = String(current);
    chapters.forEach((chapter, i) => {
      chapter.classList.toggle('is-current', i === current);
      chapter.setAttribute('aria-hidden', String(i !== current));
    });
    buttons.forEach((button, i) => {
      if (i === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    // Match the feet to the photographed console, including its cover crop.
    const width = main.clientWidth,
      height = main.clientHeight;
    const mobile = innerWidth <= 700;
    const scale = Math.max(width / 2688, height / 1520);
    const imageLeft = (width - 2688 * scale) * (mobile ? 0.72 : 0.5);
    const imageTop = (height - 1520 * scale) / 2;
    const footX = Math.min(imageLeft + 2688 * scale * 0.75, width * (mobile ? 0.67 : 0.85));
    const footY = imageTop + 1520 * scale * surfaceY;
    const initialHeight = height * (mobile ? 0.6 : 0.78);
    const finalHeight = height * (mobile ? 0.46 : 0.58);
    const productHeight = initialHeight + (finalHeight - initialHeight) * landed;
    const initialX = width * (mobile ? 0.65 : 0.7);
    const initialY = height * (mobile ? (height < 560 ? 0.64 : 0.58) : 0.43);
    const finalY = footY - finalHeight * 0.448;
    product.style.width = `${productHeight * 0.72}px`;
    product.style.height = `${productHeight}px`;
    product.style.left = `${initialX + (footX - initialX) * landed}px`;
    product.style.top = `${initialY + (finalY - initialY) * landed}px`;
    product.dataset.landed = String(landed);
    shadow.style.left = `${footX}px`;
    shadow.style.top = `${footY}px`;
    shadow.style.width = `${finalHeight * 0.4}px`;
    shadow.style.opacity = String(landed * 0.3);
  }
  function update() {
    scheduled = false;
    if (!manual) draw((scrollY - start) / range);
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }
  function mode() {
    root!.classList.toggle('motion-active', !manual);
    root!.classList.toggle('motion-paused', manual);
    document.documentElement.classList.toggle('motion-paused', manual);
    toggle.setAttribute('aria-pressed', String(manual));
    toggle.setAttribute(
      'aria-label',
      manual ? 'Enable animated effects' : 'Pause animated effects',
    );
    toggle.innerHTML = manual
      ? 'Play motion <span aria-hidden="true">▷</span>'
      : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    document.dispatchEvent(new CustomEvent('parfumaire:motion', { detail: manual }));
    geometry();
    draw(progress);
  }
  toggle.addEventListener('click', () => {
    const oldProgress = progress;
    manual = !manual;
    mode();
    scrollTo({ top: manual ? start : start + range * oldProgress, behavior: 'instant' });
    draw(oldProgress);
  });
  buttons.forEach((button, i) =>
    button.addEventListener('click', () => {
      if (manual) draw(stops[i]);
      else scrollTo({ top: start + range * stops[i], behavior: 'smooth' });
    }),
  );
  preference.addEventListener('change', () => {
    manual = preference.matches;
    mode();
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => {
    geometry();
    draw(progress);
    schedule();
  });
  new ResizeObserver(() => draw(progress)).observe(main);
  mode();
  update();
}
