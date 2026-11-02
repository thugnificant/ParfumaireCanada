const dots = [...document.querySelectorAll<HTMLElement>('[data-hotspot]')];
for (const root of dots) {
  const button = root.querySelector<HTMLButtonElement>('.hotspot-trigger')!;
  const card = root.querySelector<HTMLElement>('.hotspot-card')!;
  let pinned = false;
  let timer: ReturnType<typeof setTimeout>;
  const topLayer = typeof card.showPopover === 'function';
  if (topLayer) card.popover = 'manual';
  const position = () => {
    if (card.hidden || !topLayer) return;
    const anchor = button.getBoundingClientRect();
    if (
      anchor.bottom < 80 ||
      anchor.top > innerHeight ||
      getComputedStyle(button).visibility === 'hidden'
    ) {
      pinned = false;
      set(false);
      return;
    }
    const width = card.offsetWidth,
      height = card.offsetHeight;
    const left = Math.max(
      12,
      Math.min(innerWidth - width - 12, anchor.x + anchor.width / 2 - width / 2),
    );
    const below = anchor.top - height - 12 < 85;
    const top = below ? anchor.bottom + 12 : anchor.top - height - 12;
    card.style.setProperty('--popover-x', `${left}px`);
    card.style.setProperty('--popover-y', `${top}px`);
    card.style.setProperty(
      '--popover-arrow',
      `${Math.max(16, Math.min(width - 28, anchor.x + anchor.width / 2 - left - 6))}px`,
    );
    card.dataset.side = below ? 'below' : 'above';
  };
  const set = (open: boolean) => {
    clearTimeout(timer);
    button.setAttribute('aria-expanded', String(open));
    if (!open && topLayer && card.matches(':popover-open')) card.hidePopover();
    card.hidden = !open;
    root.classList.toggle('is-open', open);
    if (open && topLayer) {
      if (!card.matches(':popover-open')) card.showPopover();
      position();
    }
  };
  let frame = 0;
  const follow = () => {
    if (card.hidden || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      position();
    });
  };
  addEventListener('scroll', follow, { passive: true });
  addEventListener('resize', follow);
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
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !card.hidden) {
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
