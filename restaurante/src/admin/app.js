// Panel de gestión: arranque, acceso y navegación.

import { ctx, api, esc, icon, route, toast, setUnauthorizedHandler, closeDrawer } from './core.js';
import { openBookingForm } from './booking-form.js';
import * as service from './views/service.js';
import * as calendar from './views/calendar.js';
import * as bookings from './views/bookings.js';
import * as guests from './views/guests.js';
import * as requests from './views/requests.js';
import * as settings from './views/settings.js';

const app = document.getElementById('app');
const VIEWS = {
  '/servicio': { view: service, label: 'Servicio', icon: 'service' },
  '/calendario': { view: calendar, label: 'Calendario', icon: 'calendar' },
  '/reservas': { view: bookings, label: 'Reservas', icon: 'list' },
  '/clientes': { view: guests, label: 'Clientes', icon: 'users' },
  '/solicitudes': { view: requests, label: 'Solicitudes', icon: 'inbox' },
  '/ajustes': { view: settings, label: 'Ajustes', icon: 'settings' },
};

let pollTimer = null;
let lastSignature = '';
let pendingRequests = 0;

// ── Acceso ──────────────────────────────────────────────────────────────

function showLogin(message = '') {
  clearInterval(pollTimer);
  closeDrawer(true);
  document.title = `Acceso · ${ctx.name}`;
  app.innerHTML = `
  <main class="login">
    <form class="login-card" novalidate>
      <h1 class="login-brand">${esc(ctx.name)}<span>Gestión de reservas</span></h1>
      ${message ? `<p class="notice notice-warn">${esc(message)}</p>` : ''}
      <label class="f"><span>Usuario</span><input name="username" autocomplete="username" required autocapitalize="none" spellcheck="false"></label>
      <label class="f"><span>Contraseña</span><input name="password" type="password" autocomplete="current-password" required></label>
      <p class="notice notice-danger" data-error hidden></p>
      <button class="btn btn-primary btn-lg">Entrar</button>
    </form>
  </main>`;
  const form = app.querySelector('form');
  form.username.focus();
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = form.querySelector('[data-error]');
    err.hidden = true;
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      await api('/api/admin/login', { method: 'POST', body: { username: form.username.value, password: form.password.value } });
      await boot();
    } catch (e2) {
      err.textContent = e2.message;
      err.hidden = false;
      form.password.select();
    } finally {
      button.disabled = false;
    }
  });
}

setUnauthorizedHandler(() => showLogin('Tu sesión ha caducado. Vuelve a entrar.'));

// ── Estructura ──────────────────────────────────────────────────────────

function navLinks(cls) {
  return Object.entries(VIEWS).filter(([, v]) => !v.hidden).map(([path, v]) =>
    `<a href="#${path}" data-path="${path}" class="${cls}">${icon(v.icon)}<span>${v.label}</span>${path === '/solicitudes' && pendingRequests ? `<span class="badge">${pendingRequests}</span>` : ''}</a>`).join('');
}

function shell() {
  app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div class="sb-brand">${esc(ctx.name)}<span>Gestión</span></div>
      <button class="btn btn-primary btn-lg sb-new" data-new>${icon('plus')} Nueva reserva</button>
      <nav class="sb-nav" aria-label="Secciones" data-nav>${navLinks('')}</nav>
      <div class="sb-foot">
        <div class="sb-user"><strong>${esc(ctx.me.name)}</strong><span class="muted">${ctx.me.role === 'admin' ? 'Administración' : 'Sala'}</span></div>
        <div class="sb-row">
          <a class="btn btn-sm" href="/" target="_blank" rel="noopener">${icon('external')} Ver web</a>
          <button class="btn btn-sm btn-icon" data-theme-toggle aria-label="Cambiar a modo oscuro o claro">${icon('moon')}</button>
          <button class="btn btn-sm" data-logout>${icon('logout')} Salir</button>
        </div>
      </div>
    </aside>
    <main class="main" id="view" tabindex="-1"></main>
  </div>
  <nav class="mobile-bar" aria-label="Secciones" data-mobile-nav>${navLinks('')}</nav>
  <button class="fab" data-new aria-label="Nueva reserva">${icon('plus')}</button>`;

  app.querySelectorAll('[data-new]').forEach((b) => b.addEventListener('click', () => {
    const { path, params } = route();
    openBookingForm({ date: path === '/servicio' && params.date ? params.date : ctx.today });
  }));
  app.querySelector('[data-logout]').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
    showLogin();
  });
  app.querySelector('[data-theme-toggle]').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('admin-theme', next); } catch { /* sin almacenamiento */ }
  });
  // En móvil, la quinta pestaña («Más») agrupa Solicitudes, Ajustes y la sesión.
  const mobile = app.querySelector('[data-mobile-nav]');
  mobile.querySelector('[data-path="/ajustes"]').remove();
  const req = mobile.querySelector('[data-path="/solicitudes"]');
  req.dataset.path = '/mas';
  req.href = '#/mas';
  req.querySelector('span').textContent = 'Más';
}

const more = {
  async render(el) {
    el.innerHTML = `
    <div class="topbar"><h1 class="page-title"><small>${esc(ctx.me.name)}</small>Más</h1></div>
    <div class="settings">
      <a class="card card-pad" href="#/solicitudes" style="text-decoration:none;display:flex;gap:12px;align-items:center">${icon('inbox')} <strong>Solicitudes</strong>${pendingRequests ? `<span class="badge">${pendingRequests}</span>` : ''}</a>
      <a class="card card-pad" href="#/ajustes" style="text-decoration:none;display:flex;gap:12px;align-items:center">${icon('settings')} <strong>Ajustes</strong></a>
      <a class="card card-pad" href="/" target="_blank" rel="noopener" style="text-decoration:none;display:flex;gap:12px;align-items:center">${icon('external')} <strong>Ver la web</strong></a>
      <div class="toolbar"><button class="btn" data-theme-m>${icon('moon')} Modo claro / oscuro</button><button class="btn" data-logout-m>${icon('logout')} Salir</button></div>
    </div>`;
    el.querySelector('[data-theme-m]').addEventListener('click', () => app.querySelector('[data-theme-toggle]').click());
    el.querySelector('[data-logout-m]').addEventListener('click', () => app.querySelector('[data-logout]').click());
    return {};
  },
};
VIEWS['/mas'] = { view: more, label: 'Más', icon: 'list', hidden: true };

function markNav(path) {
  app.querySelectorAll('[data-path]').forEach((a) => {
    const match = a.dataset.path === path || (a.dataset.path === '/mas' && (path === '/solicitudes' || path === '/ajustes'));
    if (match) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

async function updateBadges() {
  try {
    const { requests: list } = await api('/api/admin/requests');
    pendingRequests = list.filter((r) => r.status === 'new').length;
    app.querySelectorAll('[data-path="/solicitudes"]').forEach((a) => {
      a.querySelector('.badge')?.remove();
      if (pendingRequests) a.insertAdjacentHTML('beforeend', `<span class="badge">${pendingRequests}</span>`);
    });
  } catch { /* sin conexión */ }
}

let renderSeq = 0;
async function renderView({ silent = false, fromPoll = false } = {}) {
  const { path, params } = route();
  const entry = VIEWS[path] || VIEWS['/servicio'];
  const view = document.getElementById('view');
  if (!view) return;
  markNav(VIEWS[path] ? path : '/servicio');
  document.title = `${entry.label} · ${ctx.name}`;
  clearInterval(pollTimer);
  const seq = ++renderSeq;
  // Cada pintado usa un contenedor nuevo: así los manejadores de eventos de la
  // vista anterior desaparecen con ella y nunca se duplican.
  const host = document.createElement('div');
  if (!silent) view.replaceChildren(Object.assign(document.createElement('p'), { className: 'loading', textContent: 'Cargando…' }));
  try {
    const scrollY = window.scrollY;
    const result = (await entry.view.render(host, params)) || {};
    if (seq !== renderSeq) return; // llegó otra navegación mientras tanto
    view.replaceChildren(host);
    if (silent) window.scrollTo(0, scrollY);
    else view.focus({ preventScroll: true });
    if (fromPoll && result.signature && lastSignature && result.signature !== lastSignature) toast('Hay cambios en las reservas');
    lastSignature = result.signature || '';
    if (result.poll) {
      pollTimer = setInterval(() => {
        if (document.hidden || document.querySelector('.drawer, .dialog-backdrop') || document.activeElement?.matches('input, textarea, select')) return;
        renderView({ silent: true, fromPoll: true });
      }, result.poll);
    }
  } catch (err) {
    if (err.status === 401 || seq !== renderSeq) return;
    view.innerHTML = `<div class="card empty"><span class="serif">No se pudo cargar</span>${esc(err.message)}<p style="margin-top:14px"><button class="btn" data-retry>Reintentar</button></p></div>`;
    view.querySelector('[data-retry]').addEventListener('click', () => renderView());
  }
}

async function boot() {
  let me;
  try {
    me = await api('/api/admin/me');
  } catch (err) {
    if (err.status === 401) return showLogin();
    app.innerHTML = `<div class="login"><div class="card empty"><span class="serif">Sin conexión</span>${esc(err.message)}</div></div>`;
    return;
  }
  Object.assign(ctx, { me: me.user, today: me.today, timezone: me.timezone, services: me.services, menus: me.menus, booking: me.booking, mail: me.mail, sms: me.sms });
  shell();
  await renderView();
  updateBadges();
}

window.addEventListener('hashchange', () => { if (ctx.me) { closeDrawer(true); renderView(); } });
window.addEventListener('admin:refresh', () => { renderView({ silent: true }); updateBadges(); });
boot();
