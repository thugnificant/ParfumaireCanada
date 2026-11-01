const dots = [...document.querySelectorAll<HTMLElement>('[data-hotspot]')];
for (const root of dots) {
  const button = root.querySelector<HTMLButtonElement>('.hotspot-trigger')!;
  const card = root.querySelector<HTMLElement>('.hotspot-card')!;
  let pinned = false;
  let timer: ReturnType<typeof setTimeout>;
  const set = (open: boolean) => {
    clearTimeout(timer);
    button.setAttribute('aria-expanded', String(open));
    card.hidden = !open;
    root.classList.toggle('is-open', open);
  };
  button.addEventListener('click', () => {
    pinned = !pinned;
    set(pinned);
  });
  root.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') set(true);
  });
  root.addEventListener('pointerleave', () => {
    if (!pinned && !root.contains(document.activeElement))
      timer = setTimeout(() => set(false), 150);
  });
  root.addEventListener('focusin', () => set(true));
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget as Node)) {
      pinned = false;
      set(false);
    }
  });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      pinned = false;
      button.focus();
      set(false);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!root.contains(event.target as Node)) {
      pinned = false;
      set(false);
    }
  });
}
