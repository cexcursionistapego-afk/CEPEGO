// Página de menús: el plato grande sigue al tiempo que se señala, y el
// contenido se actualiza si se han cambiado los menús desde el panel.

import { i18n, getPublic } from './api.mjs';
import { menuDetailHTML, menusHash } from './render.mjs';
import { observeReveal } from './reveal.mjs';

function bind(scope) {
  scope.querySelectorAll('.menu-detail').forEach((section) => {
    const stages = section.querySelectorAll('[data-stage]');
    const courses = section.querySelectorAll('.course');
    const activate = (i) => {
      courses.forEach((c) => c.classList.toggle('is-active', c.dataset.course === String(i)));
      stages.forEach((s) => s.classList.toggle('is-active', s.dataset.stage === String(i)));
    };
    courses.forEach((c) => {
      c.addEventListener('mouseenter', () => activate(c.dataset.course));
      c.addEventListener('focus', () => activate(c.dataset.course));
    });
    // Al hacer scroll, el tiempo que cruza el centro de la pantalla manda.
    if ('IntersectionObserver' in window && matchMedia('(min-width: 861px)').matches) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) activate(e.target.dataset.course);
      }, { rootMargin: '-45% 0px -45% 0px' });
      courses.forEach((c) => io.observe(c));
    }
  });
}

const container = document.querySelector('[data-menu-detail]');
if (container) {
  bind(container);
  getPublic().then(({ config }) => {
    if (container.dataset.hash === menusHash(config.menus)) return;
    container.innerHTML = menuDetailHTML(config.menus, i18n.lang, { booking: i18n.routes.booking });
    container.dataset.hash = menusHash(config.menus);
    bind(container);
    observeReveal(container);
  }).catch(() => {});
}
