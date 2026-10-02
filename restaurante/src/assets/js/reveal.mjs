// Aparición suave de elementos al entrar en pantalla.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function observeReveal(scope = document) {
  const items = scope.querySelectorAll('[data-reveal]:not(.is-in), [data-draw]:not(.is-in)');
  if (!('IntersectionObserver' in window) || reduced) { items.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    let i = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.style.transitionDelay = `${Math.min(i++, 6) * 70}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}
