const root = document.querySelector<HTMLElement>('[data-atmosphere]');
if (root) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d', { alpha: false });
  const poster = root.querySelector<HTMLImageElement>('.atmosphere-poster')!;
  const chapters = [...root.querySelectorAll<HTMLElement>('[data-chapter]')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-scene]')];
  const toggle = root.querySelector<HTMLButtonElement>('.motion-toggle')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  let paused = reduced.matches || Boolean(connection?.saveData);
  let currentChapter = 0;
  let frame = 0;
  let target = 0;
  let raf = 0;
  let width = 0;
  let height = 0;
  let loadedFrame = -1;
  let active = true;
  const total = 144;
  const sticky = root.querySelector<HTMLElement>('.atmosphere-sticky')!;
  const topOffset = () =>
    parseFloat(getComputedStyle(sticky).top) || (innerWidth <= 700 ? 86 : 108);
  const frames = new Map<number, HTMLImageElement>();
  const failed = new Set<number>();
  const queued = new Set<number>();
  let inFlight = 0;
  const requestQueue: number[] = [];
  const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const mobile = matchMedia('(max-width: 700px)').matches;
  const format = (index: number) =>
    `/motion/${mobile ? 'mobile' : 'desktop'}/${String(index).padStart(3, '0')}.webp`;

  function draw(index: number) {
    if (!ctx) return;
    let resolved = index;
    let image = frames.get(index);
    if (!image?.complete || !image.naturalWidth) {
      const closest = [...frames.keys()]
        .filter((k) => frames.get(k)?.naturalWidth)
        .sort((a, b) => Math.abs(a - index) - Math.abs(b - index))[0];
      resolved = closest;
      image = frames.get(closest);
    }
    if (!image?.naturalWidth) return;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    const focus = mobile ? 0.72 : 0.58;
    ctx.drawImage(image, (width - dw) * focus, (height - dh) * 0.5, dw, dh);
    canvas.classList.add('is-ready');
    loadedFrame = resolved;
    canvas.dataset.frame = String(resolved);
  }
  function pump() {
    while (inFlight < 4 && requestQueue.length) {
      const index = requestQueue.shift()!;
      if (frames.has(index) || failed.has(index)) continue;
      inFlight++;
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        frames.set(index, image);
        queued.delete(index);
        inFlight--;
        // Bound decoded image memory on long scrolls, especially on mobile Safari.
        if (frames.size > 32) {
          const farthest = [...frames.keys()].sort(
            (a, b) => Math.abs(b - frame) - Math.abs(a - frame),
          )[0];
          frames.delete(farthest);
        }
        if (Math.abs(index - Math.round(frame)) < 8) draw(Math.round(frame));
        pump();
      };
      image.onerror = () => {
        failed.add(index);
        inFlight--;
        pump();
      };
      image.src = format(index);
    }
  }
  function requestFrame(index: number, urgent = false) {
    index = Math.round(clamp(index, 0, total - 1));
    if (frames.has(index) || failed.has(index)) return;
    if (queued.has(index)) {
      if (urgent) {
        const position = requestQueue.indexOf(index);
        if (position >= 0) {
          requestQueue.splice(position, 1);
          requestQueue.unshift(index);
        }
      }
      return;
    }
    queued.add(index);
    urgent ? requestQueue.unshift(index) : requestQueue.push(index);
  }
  function warm(index: number) {
    requestFrame(index, true);
    for (let i = 1; i <= (paused ? 0 : 10); i++) {
      requestFrame(index + i);
      requestFrame(index - i);
    }
    pump();
  }
  function updateCopy(progress: number) {
    // Chapter boundaries follow the verified generated sequence.
    const chapter =
      progress < 0.18 ? 0 : progress < 0.4 ? 1 : progress < 0.62 ? 2 : progress < 0.82 ? 3 : 4;
    if (chapter !== currentChapter) {
      currentChapter = chapter;
      chapters.forEach((el, i) => {
        el.classList.toggle('is-current', i === chapter);
        el.setAttribute('aria-hidden', String(i !== chapter));
      });
      buttons.forEach((el, i) =>
        i === chapter
          ? el.setAttribute('aria-current', 'step')
          : el.removeAttribute('aria-current'),
      );
    }
    root!.style.setProperty('--story-progress', String(progress));
    root!.style.setProperty('--scene-open', String(clamp(progress / 0.15)));
    root!.style.setProperty('--word-opacity', String(1 - clamp(progress / 0.13)));
  }
  function tick() {
    raf = 0;
    if (!active || paused) return;
    frame += (target - frame) * 0.18;
    if (Math.abs(target - frame) < 0.08) frame = target;
    const index = Math.round(frame);
    warm(index);
    if (index !== loadedFrame) draw(index);
    updateCopy(frame / (total - 1));
    if (frame !== target) raf = requestAnimationFrame(tick);
  }
  function onScroll() {
    if (paused || !active) return;
    const start = root!.getBoundingClientRect().top + scrollY - topOffset();
    const range =
      root!.offsetHeight - root!.querySelector<HTMLElement>('.atmosphere-sticky')!.offsetHeight;
    target = clamp((scrollY - start) / Math.max(1, range)) * (total - 1);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 1.5);
    width = Math.round(bounds.width * dpr);
    height = Math.round(bounds.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      loadedFrame = -1;
      draw(Math.round(frame));
    }
    onScroll();
  }
  function setPaused(value: boolean, fromControl = false) {
    const progress = frame / (total - 1);
    const start = root!.getBoundingClientRect().top + scrollY - topOffset();
    paused = value;
    root!.classList.toggle('motion-paused', value);
    root!.classList.toggle('motion-active', !value);
    root!.querySelector('.atmosphere-hint')!.innerHTML = value
      ? 'CHOOSE A SPACE BELOW <span aria-hidden="true">↓</span>'
      : 'SCROLL TO CHANGE THE ATMOSPHERE <span aria-hidden="true">↓</span>';
    document.documentElement.classList.toggle('motion-paused', value);
    toggle.setAttribute('aria-pressed', String(value));
    toggle.setAttribute('aria-label', value ? 'Enable animated effects' : 'Pause animated effects');
    toggle.innerHTML = value
      ? 'Enable motion <span aria-hidden="true">▷</span>'
      : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (fromControl) {
      const range = root!.offsetHeight - sticky.offsetHeight;
      scrollTo({ top: Math.max(0, start + (value ? 0 : progress * range)), behavior: 'instant' });
    }
    if (!value) onScroll();
  }
  toggle.addEventListener('click', () => setPaused(!paused, true));
  reduced.addEventListener('change', () => setPaused(reduced.matches));
  buttons.forEach((button, index) =>
    button.addEventListener('click', () => {
      const points = [0, 0.28, 0.51, 0.72, 1];
      if (paused) {
        frame = target = points[index] * (total - 1);
        warm(Math.round(frame));
        draw(Math.round(frame));
        updateCopy(points[index]);
      } else {
        const start = root!.getBoundingClientRect().top + scrollY - topOffset();
        const range =
          root!.offsetHeight - root!.querySelector<HTMLElement>('.atmosphere-sticky')!.offsetHeight;
        scrollTo({ top: start + points[index] * range, behavior: 'smooth' });
      }
    }),
  );
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      if (active) onScroll();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { rootMargin: '200px' },
  ).observe(root);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', resize, { passive: true });
  setPaused(paused);
  if (!paused) {
    warm(0);
    // Load sparse checkpoints first. Fine frames are requested near the scroll position.
    for (let i = 0; i < total; i += 8) requestFrame(i);
    pump();
  }
  poster.addEventListener('load', resize);
  resize();
}
