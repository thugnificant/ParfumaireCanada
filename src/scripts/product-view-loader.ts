// Phone catalogs use sharp pre-rendered posters. The GPU is reserved for the
// homepage's continuous choreography, or an intentional desktop interaction.
let engine: Promise<unknown> | undefined;
const load = () => (engine ||= import('./product-view'));
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const continuous = document.querySelectorAll<HTMLElement>('[data-render-mode="continuous"]');
if (!reduced.matches && continuous.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        void load();
        observer.disconnect();
      }
    },
    { rootMargin: '200px' },
  );
  continuous.forEach((e) => observer.observe(e));
}
document.querySelectorAll<HTMLElement>('[data-render-mode="interactive"]').forEach((element) => {
  const target = element.closest('a') || element;
  const start = () => {
    if (!fine.matches || reduced.matches) return;
    element.dataset.active = 'true';
    void load().then(() =>
      document.dispatchEvent(new CustomEvent('parfumaire:activate', { detail: element })),
    );
  };
  const stop = () => {
    element.dataset.active = 'false';
    document.dispatchEvent(new CustomEvent('parfumaire:activate', { detail: element }));
  };
  target.addEventListener('pointerenter', start);
  target.addEventListener('focusin', start);
  target.addEventListener('pointerleave', stop);
  target.addEventListener('focusout', stop);
});
document.addEventListener('parfumaire:motion', (event) => {
  if (!(event as CustomEvent<boolean>).detail && continuous.length) void load();
});
