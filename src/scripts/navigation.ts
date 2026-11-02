const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#mobile-nav');
const mobileMenu = document.querySelector<HTMLDialogElement>('.mobile-menu');
const explore = document.querySelector<HTMLButtonElement>('.explore-toggle');
const menu = document.querySelector<HTMLElement>('#explore-menu');
const header = document.querySelector<HTMLElement>('.site-header');
let closeTimer: ReturnType<typeof setTimeout>;
let openedByHover = false;
function closeMobile() {
  const wasOpen = mobileMenu?.open;
  mobileMenu?.close();
  document.documentElement.classList.remove('menu-open');
  if (nav) nav.hidden = true;
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open menu');
  if (wasOpen) toggle?.focus({ preventScroll: true });
}
function setExplore(open: boolean) {
  clearTimeout(closeTimer);
  if (open && header) {
    const baseHeight =
      header.getBoundingClientRect().height -
      parseFloat(getComputedStyle(header).paddingBottom) +
      13;
    header.style.setProperty('--nav-height', `${baseHeight}px`);
  }
  explore?.setAttribute('aria-expanded', String(open));
  if (menu) menu.hidden = !open;
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (nav) nav.hidden = !open;
  if (open) {
    document.documentElement.classList.add('menu-open');
    mobileMenu?.showModal();
  } else closeMobile();
  setExplore(false);
});
document.querySelector('.menu-close')?.addEventListener('click', closeMobile);
mobileMenu?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeMobile();
});
mobileMenu?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const items = [
    ...mobileMenu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
  ].filter((item) => item.getClientRects().length);
  if (!items.length) return;
  // Safari's default Tab preference skips links. Make every menu destination
  // reachable consistently, while keeping focus inside this modal.
  const index = items.indexOf(document.activeElement as HTMLElement);
  const next = (index + (event.shiftKey ? -1 : 1) + items.length) % items.length;
  event.preventDefault();
  items[next].focus();
});
mobileMenu?.addEventListener('click', (event) => {
  if (event.target !== mobileMenu) return;
  const bounds = mobileMenu.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    closeMobile();
});
nav?.addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('a')) closeMobile();
});
// Restore the page after back/forward navigation, including Safari's page cache.
addEventListener('pageshow', closeMobile);
explore?.addEventListener('click', (event) => {
  if (!(openedByHover && event.detail > 0))
    setExplore(explore.getAttribute('aria-expanded') !== 'true');
  openedByHover = false;
});
explore?.addEventListener('pointerenter', (e) => {
  if (e.pointerType === 'mouse') {
    openedByHover = true;
    setExplore(true);
  }
});
menu?.addEventListener('pointerenter', () => clearTimeout(closeTimer));
const deferClose = () => {
  closeTimer = setTimeout(() => setExplore(false), 180);
};
explore?.addEventListener('pointerleave', deferClose);
menu?.addEventListener('pointerleave', deferClose);
explore?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setExplore(true);
    menu?.querySelector('a')?.focus();
  }
});
menu?.addEventListener('keydown', (e) => {
  const links = [...menu.querySelectorAll('a')];
  const index = links.indexOf(document.activeElement as HTMLAnchorElement);
  const next =
    e.key === 'ArrowRight'
      ? (index + 1) % links.length
      : e.key === 'ArrowLeft'
        ? (index + links.length - 1) % links.length
        : -1;
  if (next >= 0) {
    e.preventDefault();
    links[next].focus();
  }
});
header?.addEventListener('focusout', () => {
  setTimeout(() => {
    if (!header.contains(document.activeElement)) setExplore(false);
  }, 0);
});
document.addEventListener('pointerdown', (e) => {
  if (header && !header.contains(e.target as Node)) {
    setExplore(false);
    closeMobile();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (menu && !menu.hidden) {
    setExplore(false);
    explore?.focus();
  }
  if (nav && !nav.hidden) {
    closeMobile();
    toggle?.focus();
  }
});
matchMedia('(max-width: 850px)').addEventListener('change', () => {
  setExplore(false);
  closeMobile();
});
