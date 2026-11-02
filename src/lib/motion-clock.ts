type Step = (time: number, scroll: number) => boolean | void;
const phases: Record<'input' | 'update' | 'render', Set<Step>> = {
  input: new Set(),
  update: new Set(),
  render: new Set(),
};
let frame = 0;

/** Scroll position, scene transforms and the 3D pose are sampled in that order. */
function tick(time: number) {
  frame = 0;
  if (document.hidden) return;
  let continuous = false;
  for (const step of phases.input) continuous = step(time, scrollY) === true || continuous;
  const scroll = Math.max(0, scrollY);
  for (const step of phases.update) step(time, scroll);
  for (const step of phases.render) continuous = step(time, scroll) === true || continuous;
  if (continuous) requestMotionFrame();
}
export function requestMotionFrame() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
}
export function onMotionFrame(phase: keyof typeof phases, step: Step) {
  phases[phase].add(step);
  requestMotionFrame();
  return () => phases[phase].delete(step);
}
addEventListener('scroll', requestMotionFrame, { passive: true });
addEventListener('wheel', requestMotionFrame, { passive: true });
addEventListener('pageshow', requestMotionFrame);
document.addEventListener('visibilitychange', requestMotionFrame);
addEventListener('pagehide', () => {
  cancelAnimationFrame(frame);
  frame = 0;
});
