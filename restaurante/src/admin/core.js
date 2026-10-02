// Núcleo del panel: API, estado compartido, utilidades de interfaz.

export const ctx = { me: null, today: null, services: [], menus: [], booking: {}, mail: false, sms: false, name: document.getElementById('app')?.dataset.name || '' };

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method, credentials: 'same-origin',
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const e = new Error('Sin conexión con el servidor.');
    e.code = 'network';
    throw e;
  }
  let data = null;
  try { data = await res.json(); } catch { /* no JSON */ }
  if (res.status === 401 && !path.endsWith('/login')) {
    onUnauthorized();
  }
  if (!res.ok || !data || data.ok === false) {
    const e = new Error(data?.message || `Error ${res.status}`);
    e.status = res.status; e.code = data?.error; e.field = data?.field;
    throw e;
  }
  return data;
}

// ── Fechas ───────────────────────────────────────────────────────────────

export const pad = (n) => String(n).padStart(2, '0');
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
export function fmtDate(iso, opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}
export const fmtShort = (iso) => fmtDate(iso, { weekday: 'short', day: 'numeric', month: 'short' });
export function fmtStamp(isoStamp) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: ctx.timezone || 'Europe/Madrid' }).format(new Date(isoStamp));
}
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function relDay(iso) {
  if (iso === ctx.today) return 'Hoy';
  if (iso === addDays(ctx.today, 1)) return 'Mañana';
  if (iso === addDays(ctx.today, -1)) return 'Ayer';
  return '';
}

// ── Etiquetas ───────────────────────────────────────────────────────────

export const STATUS = {
  pending: 'Pendiente', confirmed: 'Confirmada', seated: 'En sala', completed: 'Terminada', no_show: 'No presentada', cancelled: 'Cancelada',
};
export const SOURCE = { web: 'Web', phone: 'Teléfono', walkin: 'Presencial', email: 'Email', admin: 'Panel' };
export const OCCASION = { cumpleanos: 'Cumpleaños', aniversario: 'Aniversario', negocios: 'Negocios', celebracion: 'Celebración', primera: 'Primera visita' };
export const DIETARY = { vegetariano: 'Vegetariana', 'sin-gluten': 'Sin gluten', 'sin-lactosa': 'Sin lactosa', marisco: 'Sin marisco', 'frutos-secos': 'Sin frutos secos', embarazo: 'Embarazo' };
export const statusPill = (s) => `<span class="pill st-${s}">${STATUS[s] || s}</span>`;
export const serviceLabel = (id) => ctx.services.find((s) => s.id === id)?.label.es || id;
export const menuOf = (id) => ctx.menus.find((m) => m.id === id);
export function menuLabel(b) {
  const m = menuOf(b.menu);
  if (!m) return '';
  const p = m.pairing.find((x) => x.id === b.pairing);
  return m.name.es + (p ? ` + ${p.name.es.toLowerCase()}` : '');
}
export const people = (n) => `${n} ${n === 1 ? 'persona' : 'personas'}`;

// ── Iconos (línea) ─────────────────────────────────────────────────────

const PATHS = {
  service: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.2 2.6 3.5 5.5"/>',
  inbox: '<path d="M3.5 13.5 6 5h12l2.5 8.5V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  sms: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
  print: '<path d="M7 9V3.5h10V9M7 17H4.5V9h15v8H17"/><rect x="7" y="14" width="10" height="7"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11" rx="1"/><path d="M12 9v11M3.5 13h17M12 9C10 4 6 5 7 7.5S12 9 12 9s4-1 5-1.5S14 4 12 9"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
};
export const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${PATHS[name] || ''}</svg>`;

// ── Avisos ───────────────────────────────────────────────────────────────

export function toast(message, kind = '') {
  let box = document.querySelector('.toasts');
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.textContent = message;
  box.appendChild(t);
  setTimeout(() => t.remove(), kind === 'error' ? 6000 : 3200);
}

/** Diálogo de confirmación. Devuelve { ok, checked } */
export function ask(message, { confirm = 'Confirmar', danger = false, checkbox = null } = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'dialog-backdrop';
    wrap.innerHTML = `<div class="dialog card" role="alertdialog" aria-modal="true" aria-label="${esc(message)}">
      <p>${esc(message)}</p>
      ${checkbox ? `<label class="checkline"><input type="checkbox" data-check ${checkbox.checked ? 'checked' : ''}> ${esc(checkbox.label)}</label>` : ''}
      <div class="form-actions"><button class="btn" data-no>Volver</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(confirm)}</button></div>
    </div>`;
    const done = (ok) => {
      const checked = wrap.querySelector('[data-check]')?.checked || false;
      wrap.remove();
      document.removeEventListener('keydown', onKey);
      resolve({ ok, checked });
    };
    const onKey = (e) => { if (e.key === 'Escape') done(false); };
    wrap.addEventListener('click', (e) => {
      if (e.target === wrap || e.target.closest('[data-no]')) done(false);
      if (e.target.closest('[data-yes]')) done(true);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    wrap.querySelector('[data-yes]').focus();
  });
}

// ── Panel lateral ───────────────────────────────────────────────────────

let drawerState = null;
export function openDrawer(title, html, onMount) {
  closeDrawer(true);
  const back = document.createElement('div');
  back.className = 'drawer-backdrop';
  const d = document.createElement('aside');
  d.className = 'drawer';
  d.setAttribute('role', 'dialog');
  d.setAttribute('aria-modal', 'true');
  d.setAttribute('aria-label', title);
  d.innerHTML = `<div class="drawer-head"><h2>${esc(title)}</h2><button class="btn btn-icon btn-ghost" data-close aria-label="Cerrar">${icon('x')}</button></div><div class="drawer-body">${html}</div>`;
  document.body.append(back, d);
  const prevFocus = document.activeElement;
  const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.dialog-backdrop')) closeDrawer(); };
  back.addEventListener('click', () => closeDrawer());
  d.querySelector('[data-close]').addEventListener('click', () => closeDrawer());
  document.addEventListener('keydown', onKey);
  drawerState = { back, d, onKey, prevFocus };
  requestAnimationFrame(() => { back.classList.add('is-open'); d.classList.add('is-open'); });
  onMount?.(d.querySelector('.drawer-body'), d);
  setTimeout(() => d.querySelector('input, select, textarea, button:not([data-close])')?.focus({ preventScroll: true }), 50);
  return d;
}
export function closeDrawer(immediate = false) {
  if (!drawerState) return;
  const { back, d, onKey, prevFocus } = drawerState;
  drawerState = null;
  document.removeEventListener('keydown', onKey);
  back.classList.remove('is-open');
  d.classList.remove('is-open');
  setTimeout(() => { back.remove(); d.remove(); }, immediate ? 0 : 300);
  prevFocus?.focus?.({ preventScroll: true });
}

// ── Navegación ───────────────────────────────────────────────────────────

export function route() {
  const [path, query] = location.hash.replace(/^#/, '').split('?');
  return { path: path || '/servicio', params: Object.fromEntries(new URLSearchParams(query || '')) };
}
export function navigate(path, params = {}) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')).toString();
  location.hash = `#${path}${q ? `?${q}` : ''}`;
}
/** Vuelve a pintar la vista actual (tras guardar algo). */
export function refresh() { window.dispatchEvent(new Event('admin:refresh')); }

export function formToObject(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;
    if (el.type === 'checkbox') {
      const group = form.querySelectorAll(`input[type=checkbox][name="${el.name}"]`);
      if (group.length > 1) { out[el.name] ||= []; if (el.checked) out[el.name].push(el.value); }
      else out[el.name] = el.checked;
    } else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
    else if (el.tagName !== 'BUTTON') out[el.name] = el.value;
  }
  return out;
}

export function fieldError(form, name, message) {
  form.querySelectorAll('.f.has-error').forEach((f) => { f.classList.remove('has-error'); f.querySelector('.err')?.remove(); });
  const input = form.elements[name];
  const f = input?.closest?.('.f') || input?.[0]?.closest?.('.f');
  if (!f) return false;
  f.classList.add('has-error');
  f.insertAdjacentHTML('beforeend', `<span class="err">${esc(message)}</span>`);
  (input.focus ? input : input[0])?.focus();
  return true;
}
