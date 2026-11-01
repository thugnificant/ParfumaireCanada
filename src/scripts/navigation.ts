const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#mobile-nav');
const explore = document.querySelector<HTMLButtonElement>('.explore-toggle');
const menu = document.querySelector<HTMLElement>('#explore-menu');
const header = document.querySelector<HTMLElement>('.site-header');
let closeTimer: ReturnType<typeof setTimeout>;
let openedByHover = false;
function closeMobile() {
  if (nav) nav.hidden = true;
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-label', 'Open menu');
}
function setExplore(open: boolean) {
  clearTimeout(closeTimer);
  explore?.setAttribute('aria-expanded', String(open));
  if (menu) menu.hidden = !open;
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (nav) nav.hidden = !open;
  setExplore(false);
});
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
