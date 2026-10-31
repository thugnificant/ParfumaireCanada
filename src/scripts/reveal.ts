const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const elements = document.querySelectorAll<HTMLElement>('[data-reveal], .product-card');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-enabled');
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.08, rootMargin: '0px 0px 15px 0px' },
  );
  elements.forEach((element, i) => {
    if (element.classList.contains('product-card'))
      element.style.transitionDelay = `${(i % 4) * 65}ms`;
    observer.observe(element);
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      document.documentElement.classList.remove('motion-enabled');
      observer.disconnect();
    }
  });
}
