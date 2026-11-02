import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { onMotionFrame, requestMotionFrame } from '../lib/motion-clock';

// Bella uses Lenis' default 0.1 interpolation. Touch stays native.
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let lenis: Lenis | undefined;
function setMotion(paused: boolean) {
  lenis?.destroy();
  lenis = undefined;
  if (
    !paused &&
    matchMedia('(hover: hover) and (pointer: fine)').matches &&
    document.querySelector('[data-atmosphere]')
  ) {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.1,
      smoothWheel: true,
      anchors: { offset: -110 },
      prevent: (node) => !!node.closest('[data-lenis-prevent], dialog, .mobile-nav'),
    });
    lenis.on('scroll', () => document.dispatchEvent(new Event('parfumaire:scroll')));
    requestMotionFrame();
  }
}
onMotionFrame('input', (time) => {
  lenis?.raf(time);
  return lenis?.isScrolling === 'smooth';
});
setMotion(preference.matches);
preference.addEventListener('change', () => setMotion(preference.matches));
document.addEventListener('parfumaire:motion', (event) => {
  setMotion((event as CustomEvent<boolean>).detail);
});
addEventListener('pagehide', (event) => {
  if (!(event as PageTransitionEvent).persisted) lenis?.destroy();
});
