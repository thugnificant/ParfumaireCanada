import { flightAt } from '../lib/flight';
import { officePlacement, officeScene } from '../lib/office-scene';
import { onMotionFrame, requestMotionFrame } from '../lib/motion-clock';
import { scrollAnimations, motionKeyframes } from '../lib/scroll-animation';
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
  const tracks = scrollAnimations();
  let lastProgress = -1;
  let path = { x0: 0, y0: 0, x1: 0, y1: 0, height: 0, scale: 1, start: 0, end: 1 };

  function measure() {
    const bounds = root!.getBoundingClientRect();
    const from = origin.getBoundingClientRect();
    const scene = landing.getBoundingClientRect();
    // The floor bay is authored into the photograph. Cover cropping, the live
    // model and the static fallback all use this same source-image anchor.
    const { x: footX, y: footY, height: targetHeight } = officePlacement(scene.width, scene.height);
    const mobile = innerWidth <= 700;
    const originHeight = from.height;
    product.style.width = `${originHeight * 1.3}px`;
    product.style.height = `${originHeight}px`;
    landing.style.setProperty('--foot-x', `${footX}px`);
    landing.style.setProperty('--foot-y', `${footY}px`);
    landing.style.setProperty('--landed-height', `${targetHeight}px`);
    photo.style.transformOrigin = `${footX}px ${footY}px`;
    path = {
      x0: from.left + from.width / 2 - bounds.left,
      y0: from.top + from.height / 2 - bounds.top,
      x1: scene.left - bounds.left + footX,
      y1: scene.top - bounds.top + footY - targetHeight * officeScene.footOffset,
      height: targetHeight,
      scale: targetHeight / originHeight,
      start: mobile ? Math.max(0, bounds.top + scrollY - 110) : bounds.top + scrollY - 110,
      // Arrive while the floor contact is in view, before normal scroll carries it away.
      end: scene.top + scrollY + footY - innerHeight * (mobile ? 0.68 : 0.9),
    };
    const copy = root!.querySelector<HTMLElement>('.landing-copy')!;
    // Retain a correct underlying pose while the browser arms the native tracks.
    if (!tracks.native) {
      lastProgress = -1;
      draw(performance.now(), Math.max(0, scrollY));
    }
    tracks.bind(
      path.start,
      path.end,
      [
        { element: product, frames: motionKeyframes((p) => ({ transform: transformAt(p) })) },
        {
          element: photo,
          frames: motionKeyframes((p) => ({ transform: `scale(${flightAt(p).roomZoom})` })),
        },
        { element: copy, frames: motionKeyframes((p) => ({ opacity: arrivalAt(p) })) },
      ],
      !paused,
    );
    root!.dataset.motionDriver = tracks.native ? 'compositor' : 'raf';
    lastProgress = -1;
    draw(performance.now(), Math.max(0, scrollY));
    requestMotionFrame();
  }
  function arrivalAt(p: number) {
    const arrival = clamp((p - 0.58) / 0.25);
    return arrival * arrival * (3 - 2 * arrival);
  }
  function transformAt(p: number) {
    const pose = flightAt(p);
    // Ease the room out around the floor contact. The same zoom changes the
    // product scale and its center, so the feet never slide across the stone.
    const zoom = paused ? 1 : pose.roomZoom;
    const x = path.x0 + (path.x1 - path.x0) * pose.travel;
    const targetY = path.y1 - path.height * officeScene.footOffset * (zoom - 1);
    const y = path.y0 + (targetY - path.y0) * pose.drop;
    const scale = 1 + (path.scale * zoom - 1) * pose.depth;
    return `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
  }
  function draw(_time: number, scroll: number) {
    const p = paused ? 0 : clamp((scroll - path.start) / Math.max(1, path.end - path.start));
    if (p === lastProgress) return;
    lastProgress = p;
    const pose = flightAt(p);
    if (!tracks.native) {
      photo.style.transform = `scale(${paused ? 1 : pose.roomZoom})`;
      landing.style.setProperty('--arrival-opacity', String(arrivalAt(p)));
      product.style.transform = transformAt(p);
    }
    product.dataset.flight = String(p);
    product.dataset.landed = String(pose.contact);
    root!.dataset.progress = p.toFixed(4);
    root!.classList.toggle('is-travelling', p > 0.05);
    landing.classList.toggle('has-arrived', paused || p > 0.96);
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
  onMotionFrame('update', draw);
  const resize = new ResizeObserver(measure);
  resize.observe(root);
  resize.observe(document.querySelector<HTMLElement>('.site-header')!);
  photo.addEventListener('load', measure);
  document.fonts.ready.then(measure);
  mode();
}
