// Comportamiento común a todas las páginas.

import { i18n, getPublic } from './api.mjs';
import { observeReveal } from './reveal.mjs';
import { esc, hoursHTML, menuCardsHTML, servicesHash, menusHash, fmtDate } from './render.mjs';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Cabecera: fondo al hacer scroll y se oculta al bajar ───────────────────
const header = document.querySelector('[data-header]');
let lastY = scrollY;
function onScroll() {
  const y = scrollY;
  header.classList.toggle('is-scrolled', y > 8);
  const menuOpen = document.body.classList.contains('menu-open');
  header.classList.toggle('is-hidden', !menuOpen && y > 480 && y > lastY + 2);
  if (y < lastY - 2 || y < 480) header.classList.remove('is-hidden');
  lastY = y;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Menú móvil ───────────────────────────────────────────────────────────
const toggle = document.querySelector('[data-menu-toggle]');
const mobile = document.getElementById('mobile-nav');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  const label = toggle.querySelector('.menu-toggle-label');
  label.textContent = open ? label.dataset.close : label.dataset.open;
  document.body.classList.toggle('menu-open', open);
  if (open) {
    mobile.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => mobile.classList.add('is-open')));
    mobile.querySelector('a')?.focus({ preventScroll: true });
  } else {
    mobile.classList.remove('is-open');
    setTimeout(() => { if (!mobile.classList.contains('is-open')) mobile.hidden = true; }, reduced ? 0 : 400);
  }
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); toggle.focus(); } });
mobile?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

// ── Aparición al entrar en pantalla ─────────────────────────────────────
observeReveal();

// ── Luz: automática / día / noche ───────────────────────────────────────
const switchBtns = document.querySelectorAll('[data-theme-set]');
function paintSwitch() {
  const pref = root.dataset.themePref || 'auto';
  switchBtns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.themeSet === pref)));
}
switchBtns.forEach((b) => b.addEventListener('click', () => {
  const pref = b.dataset.themeSet;
  try { pref === 'auto' ? localStorage.removeItem('theme') : localStorage.setItem('theme', pref); } catch { /* sin almacenamiento */ }
  root.dataset.themePref = pref;
  root.dataset.theme = window.__theme ? window.__theme(pref) : pref === 'night' ? 'night' : 'day';
  paintSwitch();
}));
paintSwitch();
// En modo automático, si la sala «anochece» con la página abierta, cambia sola.
setInterval(() => {
  if ((root.dataset.themePref || 'auto') === 'auto' && window.__theme) root.dataset.theme = window.__theme('auto');
}, 60000);

// ── Disponibilidad de hoy en directo (portada) ───────────────────────────
const live = document.querySelector('[data-live]');
if (live) {
  const text = live.querySelector('[data-live-text]');
  getPublic().then(({ today, next }) => {
    const L = i18n.live;
    const bookingUrl = (date) => `${i18n.routes.booking}?party=2&date=${date}`;
    if (today.status === 'open') {
      const parts = today.services.map((s) => `${esc(s.label[i18n.lang] || s.label.es)}: <strong>${s.full ? L.full : s.few ? L.few : L.open}</strong>`);
      live.dataset.state = today.services.some((s) => !s.full && !s.few) ? 'open' : 'few';
      text.innerHTML = `${L.today} · ${parts.join(' · ')}`;
      live.href = bookingUrl(today.date);
    } else if (next) {
      live.dataset.state = 'open';
      text.innerHTML = `${L.next}: <strong>${fmtDate(next.date, i18n.lang)}</strong>`;
      live.href = bookingUrl(next.date);
    } else {
      live.dataset.state = 'closed';
      text.textContent = `${L.today} · ${today.status === 'closed' ? L.closed : L.full}`;
    }
  }).catch(() => { live.hidden = true; });
}

// ── Contenido editable desde el panel (horarios y menús) ─────────────────
const hoursEls = document.querySelectorAll('[data-hours]');
const cards = document.querySelector('[data-menu-cards]');
if (hoursEls.length || cards) {
  getPublic().then(({ config }) => {
    const sh = servicesHash(config.services);
    hoursEls.forEach((el) => {
      if (el.dataset.hash !== sh) el.innerHTML = hoursHTML(config.services, i18n.lang, { closed: i18n.closed });
    });
    if (cards && cards.dataset.hash !== menusHash(config.menus)) {
      cards.innerHTML = menuCardsHTML(config.menus, i18n.lang, { menus: i18n.routes.menus });
      cards.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    }
  }).catch(() => { /* se queda la versión estática */ });
}

root.setAttribute('data-ready', '');
