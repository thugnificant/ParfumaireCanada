import { flightAt } from '../lib/flight';
import { businessPlacement, businessScene } from '../lib/business-scene';
import { onMotionFrame, requestMotionFrame } from '../lib/motion-clock';
import { scrollAnimations, motionKeyframes, motionViewportHeight } from '../lib/scroll-animation';
const root = document.querySelector<HTMLElement>('[data-business-story]');
if (root) {
  const origin = root.querySelector<HTMLElement>('[data-business-origin]')!;
  const scene = root.querySelector<HTMLElement>('.business-scene')!;
  const room = scene.querySelector<HTMLElement>('.business-room')!;
  const photo = scene.querySelector<HTMLElement>('.business-photo')!;
  const product = root.querySelector<HTMLElement>('.business-flight')!;
  let paused =
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('motion-paused');
  const tracks = scrollAnimations();
  let lastProgress = -1;
  let path = { x0: 0, y0: 0, x1: 0, y1: 0, corridor: 0, h: 0, scale: 1, start: 0, end: 1 };
  const ease = (value: number) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  function transformAt(p: number) {
    const pose = flightAt(p),
      zoom = paused ? 1 : pose.roomZoom;
    // The phone grid puts La Tour last. Its narrow right-side corridor clears
    // the product labels and collection button before turning into the room.
    const x =
      innerWidth <= 700
        ? path.x0 +
          (path.corridor - path.x0) * ease(p / 0.16) +
          (path.x1 - path.corridor) * ease((p - 0.63) / 0.35)
        : path.x0 + (path.x1 - path.x0) * pose.travel;
    const y =
      path.y0 + (path.y1 - path.h * businessScene.footOffset * (zoom - 1) - path.y0) * pose.drop;
    const scale = 1 + (path.scale * zoom - 1) * pose.depth;
    return `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale})`;
  }
  function draw(_time: number, scroll: number) {
    const p = paused
      ? 0
      : Math.max(0, Math.min(1, (scroll - path.start) / Math.max(1, path.end - path.start)));
    if (p === lastProgress) return;
    lastProgress = p;
    const pose = flightAt(p);
    if (!tracks.native) {
      photo.style.transform = `scale(${paused ? 1 : pose.roomZoom})`;
      product.style.transform = transformAt(p);
    }
    product.dataset.flight = String(p);
    product.dataset.landed = String(pose.contact);
    root!.dataset.progress = p.toFixed(4);
    scene.classList.toggle('has-arrived', paused || p > 0.96);
  }
  function measure() {
    const bounds = root!.getBoundingClientRect(),
      from = origin.getBoundingClientRect(),
      to = room.getBoundingClientRect();
    const target = businessPlacement(to.width, to.height);
    const viewportHeight = motionViewportHeight();
    product.style.width = `${from.height}px`;
    product.style.height = `${from.height}px`;
    room.style.setProperty('--business-x', `${target.x}px`);
    room.style.setProperty('--business-y', `${target.y}px`);
    room.style.setProperty('--business-height', `${target.height}px`);
    photo.style.transformOrigin = `${target.x}px ${target.y}px`;
    path = {
      x0: from.left + from.width / 2 - bounds.left,
      y0: from.top + from.height / 2 - bounds.top,
      x1: to.left - bounds.left + target.x,
      y1: to.top - bounds.top + target.y - target.height * businessScene.footOffset,
      // Include the tilted tower's visible width, not only its center point.
      corridor: to.right - bounds.left - Math.max(30, from.height * 0.18),
      h: target.height,
      scale: target.height / from.height,
      start: from.top + scrollY - Math.min(viewportHeight * 0.3, 240),
      end: to.top + scrollY + target.y - viewportHeight * 0.83,
    };
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
      ],
      !paused,
    );
    root!.dataset.motionDriver = tracks.native ? 'compositor' : 'raf';
    lastProgress = -1;
    draw(performance.now(), Math.max(0, scrollY));
    requestMotionFrame();
  }
  function mode() {
    root!.classList.toggle('business-motion', !paused);
    measure();
  }
  onMotionFrame('update', draw);
  document.addEventListener('parfumaire:motion', (e) => {
    paused = (e as CustomEvent<boolean>).detail;
    mode();
  });
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', () => {
    paused = preference.matches;
    mode();
  });
  new ResizeObserver(measure).observe(root);
  document.fonts.ready.then(measure);
  photo.addEventListener('load', measure);
  mode();
}
