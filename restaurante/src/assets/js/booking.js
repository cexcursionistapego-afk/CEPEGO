// Asistente de reservas. La reserva se construye como una frase
// («Mesa para 2 · jueves 15 de octubre · a las 21:00 · Menú Origen») que se
// completa paso a paso y permite volver a cualquier parte tocándola.

import { i18n, api, getPublic, fmt, formData, validate, setBusy, setStatus, showApiError, mountCaptcha, liveClear } from './api.mjs';
import { esc, fmtDate, price, zonedToUtc, locale } from './render.mjs';
import { plateSVG } from './plate.mjs';

const T = i18n.booking;
const lang = i18n.lang;
const root = document.querySelector('[data-booking]');
const STEPS = ['party', 'date', 'time', 'menu', 'details'];
const $ = (sel, scope = root) => scope.querySelector(sel);

const state = { party: null, date: null, service: null, time: null, menu: null, pairing: '', month: null };
let cfg, today, lastMonth, current = 'party', result = null;
const monthCache = new Map();

const pad = (n) => String(n).padStart(2, '0');
const monthOf = (iso) => iso.slice(0, 7);
function addMonths(month, n) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}
function addDaysISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
const people = (n) => `${n} ${n === 1 ? T.sentence.one : T.sentence.other}`;
const serviceOf = (id) => cfg.services.find((s) => s.id === id);
const menuOf = (id) => cfg.menus.find((m) => m.id === id);
const hasMenuStep = () => cfg.menus.length > 0;

// ── Navegación entre pasos ───────────────────────────────────────────────

function go(step, { focus = true } = {}) {
  current = step;
  root.querySelectorAll('[data-step]').forEach((s) => { s.hidden = s.dataset.step !== step; });
  const idx = step === 'done' ? STEPS.length : STEPS.indexOf(step);
  $('[data-progress]').style.setProperty('--p', String(idx / STEPS.length));
  paintSentence();
  if (step === 'date') loadMonth(state.month);
  if (step === 'time') loadDay();
  if (step === 'menu') paintMenus();
  if (focus) {
    const title = $(`[data-step="${step}"] .step-title`);
    const top = root.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    title?.focus({ preventScroll: true });
  }
  const url = new URL(location.href);
  for (const k of ['party', 'date']) state[k] ? url.searchParams.set(k, state[k]) : url.searchParams.delete(k);
  history.replaceState(null, '', url);
}

function previous() {
  const order = hasMenuStep() ? STEPS : STEPS.filter((s) => s !== 'menu');
  const i = order.indexOf(current);
  if (i > 0) go(order[i - 1]);
}

function paintSentence() {
  const parts = {
    party: state.party ? people(state.party) : null,
    date: state.date ? fmtDate(state.date, lang) : null,
    time: state.time,
    menu: state.menu === '' ? T.menuUndecided.toLowerCase() : state.menu ? (menuOf(state.menu)?.name[lang] || state.menu) : null,
  };
  for (const [k, v] of Object.entries(parts)) {
    const btn = $(`[data-part="${k}"]`);
    if (!btn) continue;
    const text = v || '—';
    if (btn.textContent !== text) {
      btn.textContent = text;
      btn.classList.remove('is-filled');
      if (v) { void btn.offsetWidth; btn.classList.add('is-filled'); }
    }
    btn.disabled = !v || current === 'done';
    btn.classList.toggle('is-empty', !v);
    btn.setAttribute('aria-label', `${T.change}: ${text}`);
  }
  $('[data-menu-wrap]').hidden = !parts.menu;
}

// ── Paso 1: comensales ───────────────────────────────────────────────────

function paintParty() {
  const grid = $('[data-party-grid]');
  const { minParty, maxParty } = cfg.booking;
  grid.innerHTML = Array.from({ length: maxParty - minParty + 1 }, (_, i) => {
    const n = minParty + i;
    return `<button type="button" class="party-btn" role="radio" aria-checked="${state.party === n}" aria-label="${esc(people(n))}" data-party="${n}">${n}</button>`;
  }).join('');
  $('[data-large-group]').innerHTML = fmt(T.largeGroup, { n: maxParty, events: i18n.routes.events });
}

root.addEventListener('click', (e) => {
  const p = e.target.closest('[data-party]');
  if (p) {
    const n = Number(p.dataset.party);
    if (state.party !== n) { state.party = n; state.time = null; state.service = null; }
    root.querySelectorAll('[data-party]').forEach((b) => b.setAttribute('aria-checked', String(b === p)));
    go('date');
  }
});

// ── Paso 2: fecha ───────────────────────────────────────────────────────

async function loadMonth(month) {
  const grid = $('[data-cal-grid]');
  const label = $('[data-cal-month]');
  const [y, m] = month.split('-').map(Number);
  const monthName = new Intl.DateTimeFormat(locale(lang), { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)));
  label.textContent = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${y}`;
  $('[data-cal-prev]').disabled = month <= monthOf(today);
  $('[data-cal-next]').disabled = month >= lastMonth;

  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const offset = (first + 6) % 7;
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const head = T.weekdays.map((d) => `<div class="cal-wd" role="columnheader" aria-hidden="true">${d}</div>`).join('');
  const blanks = '<div></div>'.repeat(offset);
  const cell = (d, status = 'loading') => {
    const iso = `${month}-${pad(d)}`;
    const enabled = ['open', 'few', 'full'].includes(status);
    const label2 = `${fmtDate(iso, lang)}${status === 'full' ? ` — ${T.legend.full}` : status === 'few' ? ` — ${T.legend.few}` : ''}`;
    return `<button type="button" class="cal-day${status === 'loading' ? ' is-loading' : ''}${iso === today ? ' is-today' : ''}" data-day="${iso}" data-status="${status}" aria-pressed="${state.date === iso}" aria-label="${esc(label2)}" ${enabled ? '' : 'disabled'}>${d}</button>`;
  };
  grid.innerHTML = head + blanks + Array.from({ length: count }, (_, i) => cell(i + 1)).join('');

  const key = `${month}|${state.party}`;
  try {
    if (!monthCache.has(key)) monthCache.set(key, api(`/api/availability?month=${month}&party=${state.party}`));
    const data = await monthCache.get(key);
    if (state.month !== month || current !== 'date') return;
    grid.innerHTML = head + blanks + data.days.map((d) => cell(Number(d.date.slice(8)), d.status === 'open' && d.few ? 'few' : d.status)).join('');
  } catch (err) {
    monthCache.delete(key);
    grid.innerHTML = head + `<p class="small muted" style="grid-column:1/-1">${esc(T.errors.unavailable)}</p>`;
  }
}

$('[data-cal-prev]').addEventListener('click', () => { state.month = addMonths(state.month, -1); loadMonth(state.month); });
$('[data-cal-next]').addEventListener('click', () => { state.month = addMonths(state.month, 1); loadMonth(state.month); });
root.addEventListener('click', (e) => {
  const d = e.target.closest('[data-day]');
  if (d && !d.disabled) {
    if (state.date !== d.dataset.day) { state.time = null; state.service = null; }
    state.date = d.dataset.day;
    go('time');
  }
});

// ── Paso 3: hora ────────────────────────────────────────────────────────

async function loadDay() {
  const box = $('[data-services]');
  const wait = $('[data-waitlist]');
  wait.hidden = true;
  box.innerHTML = `<p class="muted">${esc(T.loading)}</p>`;
  let data;
  try {
    data = await api(`/api/availability?date=${state.date}&party=${state.party}`);
  } catch {
    box.innerHTML = `<p class="services-empty">${esc(T.errors.unavailable)}</p>`;
    return;
  }
  if (current !== 'time') return;
  const anyFull = data.services.some((s) => s.full);
  let html = data.services.map((s) => `
    <div class="service">
      <div class="service-head">
        <h3 class="service-name">${esc(s.label[lang] || s.label.es)}</h3>
        ${s.full ? `<span class="service-tag">${esc(T.serviceFull)}</span>` : s.few ? `<span class="service-tag">${esc(T.fewLeft)}</span>` : ''}
      </div>
      <div class="slots" role="radiogroup" aria-label="${esc(s.label[lang] || s.label.es)}">
        ${s.slots.map((x) => `<button type="button" class="slot num" role="radio" data-service="${s.id}" data-time="${x.time}" aria-checked="${state.service === s.id && state.time === x.time}" ${x.available ? '' : 'disabled'}>${x.time}</button>`).join('')}
      </div>
    </div>`).join('');
  if (!data.services.length || data.status !== 'open') html = `<p class="services-empty">${esc(T.noSlots)}</p>` + html;
  if (anyFull && cfg.booking.waitlist) html += `<p><button type="button" class="link-arrow link-button" data-show-waitlist>${esc(T.waitlistCta)}</button></p>`;
  box.innerHTML = html;
  if (data.status === 'full' && cfg.booking.waitlist) showWaitlist(false);
}

function showWaitlist(scroll = true) {
  const wait = $('[data-waitlist]');
  wait.hidden = false;
  const form = $('[data-waitlist-form]');
  mountCaptcha(form).catch(() => {});
  if (scroll) wait.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

root.addEventListener('click', (e) => {
  if (e.target.closest('[data-show-waitlist]')) return showWaitlist();
  const s = e.target.closest('[data-time]');
  if (s && !s.disabled) {
    state.service = s.dataset.service;
    state.time = s.dataset.time;
    go(hasMenuStep() ? 'menu' : 'details');
  }
});

$('[data-waitlist-form]').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!validate(form)) return;
  const button = form.querySelector('button[type=submit]');
  setBusy(button, true);
  try {
    await api('/api/waitlist', { method: 'POST', body: { ...formData(form), date: state.date, party: state.party, lang, captcha: form.captcha?.() } });
    form.querySelectorAll('.field, .form-row, .form-actions, .captcha').forEach((el) => { el.hidden = true; });
    setStatus(form, T.waitlistDone, 'ok');
  } catch (err) {
    showApiError(form, err);
    form.captchaReset?.();
  } finally {
    setBusy(button, false);
  }
});

// ── Paso 4: menú ────────────────────────────────────────────────────────

function paintMenus() {
  const box = $('[data-menu-choices]');
  const cards = cfg.menus.map((m) => {
    const checked = state.menu === m.id;
    const pairings = checked && m.pairing.length ? `<div class="pairing-choice chips" role="radiogroup" aria-label="${esc(i18n.forms.pairing)}">
      ${[{ id: '', name: { es: T.pairingNone, en: T.pairingNone }, price: 0 }, ...m.pairing].map((p) => `<label class="chip"><input type="radio" name="pairing" value="${p.id}" ${state.pairing === p.id ? 'checked' : ''}><span>${esc(p.name[lang] || p.name.es)}${p.price ? ` · +${price(p.price, lang)}` : ''}</span></label>`).join('')}
    </div>` : '';
    return `<button type="button" class="menu-choice" role="radio" aria-checked="${checked}" data-menu="${m.id}">
      ${plateSVG(m.courses[Math.min(4, m.courses.length - 1)]?.es || m.id)}
      <span><span class="menu-choice-name">${esc(m.name[lang] || m.name.es)}</span><span class="menu-choice-meta">${m.courses.length} ${esc(T.courses)} · ${esc(T.perPerson)}</span></span>
      <span class="menu-choice-price num">${price(m.price, lang)}</span>
    </button>${pairings}`;
  }).join('');
  const undecided = cfg.booking.requireMenuChoice ? '' : `<button type="button" class="menu-choice menu-choice-undecided" role="radio" aria-checked="${state.menu === ''}" data-menu="">
      <span><span class="menu-choice-name">${esc(T.menuUndecided)}</span><span class="menu-choice-meta">${esc(T.menuUndecidedText)}</span></span>
    </button>`;
  box.innerHTML = cards + undecided;
  $('[data-next-menu]').disabled = state.menu === null;
}

root.addEventListener('click', (e) => {
  const m = e.target.closest('[data-menu]');
  if (m) {
    if (state.menu !== m.dataset.menu) state.pairing = '';
    state.menu = m.dataset.menu;
    paintMenus();
    paintSentence();
    root.querySelector(`[data-menu="${CSS.escape(state.menu)}"]`)?.focus();
  }
});
root.addEventListener('change', (e) => {
  if (e.target.name === 'pairing' && e.target.closest('[data-menu-choices]')) state.pairing = e.target.value;
});
$('[data-next-menu]').addEventListener('click', () => { if (state.menu !== null) go('details'); });

// ── Paso 5: datos y confirmación ─────────────────────────────────────────

const form = $('[data-booking-form]');
liveClear(form);
liveClear($('[data-waitlist-form]'));
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate(form)) return;
  const button = form.querySelector('button[type=submit]');
  setBusy(button, true);
  const body = {
    ...formData(form),
    party: state.party, date: state.date, service: state.service, time: state.time,
    menu: state.menu || '', pairing: state.pairing || '', lang, captcha: form.captcha?.(),
  };
  try {
    result = await api('/api/bookings', { method: 'POST', body });
    monthCache.clear();
    paintDone();
    go('done');
  } catch (err) {
    form.captchaReset?.();
    if (err.code === 'full' || err.code === 'window' || err.code === 'closed') {
      monthCache.clear();
      state.time = null;
      go('time');
      const box = $('[data-services]');
      box.insertAdjacentHTML('beforebegin', `<p class="form-status is-error" role="alert">${esc(T.errors.full)}</p>`);
      setTimeout(() => root.querySelector('[data-step="time"] > .form-status')?.remove(), 6000);
    } else if (err.code === 'duplicate') {
      setStatus(form, T.errors.duplicate, 'error');
    } else {
      showApiError(form, err);
    }
  } finally {
    setBusy(button, false);
  }
});

function calendarData() {
  const b = result.booking;
  const service = serviceOf(b.service);
  const start = zonedToUtc(b.date, b.time, cfg.timezone);
  const end = new Date(start.getTime() + (service?.duration || 150) * 60000);
  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const title = fmt(T.calendarTitle, { name: i18n.name });
  const details = `${T.code}: ${b.code} · ${people(b.party)}\n${result.manageUrl}`;
  return { start, end, stamp, title, details, b };
}

function paintDone() {
  const b = result.booking;
  const pending = b.status === 'pending';
  $('[data-done-title]').textContent = pending ? T.pendingTitle : T.successTitle;
  $('[data-done-text]').textContent = pending ? T.pendingText : cfg.sms && b.phone ? T.successTextSms : T.successText;
  const menu = menuOf(b.menu);
  const rows = [
    [i18n.manage.details.date, fmtDate(b.date, lang)],
    [i18n.manage.details.time, b.time],
    [i18n.manage.details.party, people(b.party)],
    ...(menu ? [[i18n.manage.details.menu, menu.name[lang] || menu.name.es]] : []),
    [T.code, `<span class="code num">${esc(b.code)}</span>`],
  ];
  $('[data-done-details]').innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v.startsWith('<span') ? v : esc(v)}</dd></div>`).join('');
  $('[data-done-manage]').href = result.manageUrl.replace(/^https?:\/\/[^/]+/, '');
  const c = calendarData();
  const g = new URL('https://calendar.google.com/calendar/render');
  g.searchParams.set('action', 'TEMPLATE');
  g.searchParams.set('text', c.title);
  g.searchParams.set('dates', `${c.stamp(c.start)}/${c.stamp(c.end)}`);
  g.searchParams.set('details', c.details);
  g.searchParams.set('location', `${i18n.name}, ${i18n.address}`);
  $('[data-done-google]').href = g.toString();
}

$('[data-done-ics]').addEventListener('click', () => {
  const c = calendarData();
  const esc2 = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${i18n.name}//Reservas//ES`, 'BEGIN:VEVENT',
    `UID:${c.b.code}-${c.stamp(c.start)}@reservas`, `DTSTAMP:${c.stamp(new Date())}`,
    `DTSTART:${c.stamp(c.start)}`, `DTEND:${c.stamp(c.end)}`, `SUMMARY:${esc2(c.title)}`,
    `DESCRIPTION:${esc2(c.details)}`, `LOCATION:${esc2(`${i18n.name}, ${i18n.address}`)}`,
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `reserva-${c.b.code}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$('[data-restart]').addEventListener('click', () => {
  Object.assign(state, { date: null, service: null, time: null, menu: null, pairing: '' });
  result = null;
  form.reset();
  go('party');
});

// ── Arranque ────────────────────────────────────────────────────────────

root.addEventListener('click', (e) => {
  if (e.target.closest('[data-back]')) previous();
  const part = e.target.closest('[data-goto]');
  if (part && !part.disabled) go(part.dataset.goto);
});

(async function init() {
  try {
    const data = await getPublic();
    cfg = data.config;
  } catch {
    $('[data-party-grid]').innerHTML = `<p class="lead">${esc(T.errors.unavailable)} <a href="tel:${esc(i18n.phone.replace(/\s/g, ''))}">${esc(i18n.phone)}</a></p>`;
    return;
  }
  const data = await getPublic();
  today = data.now.slice(0, 10);
  lastMonth = monthOf(addDaysISO(today, cfg.booking.windowDays));
  $('[data-policy]').textContent = fmt(T.policy, { h: cfg.booking.cancellationHours });
  if (!cfg.booking.autoConfirm) {
    const btn = form.querySelector('button[type=submit]');
    btn.dataset.label = btn.dataset.labelRequest;
    btn.textContent = btn.dataset.label;
  }
  mountCaptcha(form).catch(() => {});
  if (cfg.sms) $('[data-sms-hint]').hidden = false;

  const params = new URLSearchParams(location.search);
  const party = Number.parseInt(params.get('party'), 10);
  const date = params.get('date');
  const menu = params.get('menu');
  if (menu && menuOf(menu)) state.menu = menu;
  state.month = monthOf(today);
  paintParty();
  if (party >= cfg.booking.minParty && party <= cfg.booking.maxParty) {
    state.party = party;
    paintParty();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date || '') && date >= today) {
      state.date = date;
      state.month = monthOf(date);
      return go('time', { focus: false });
    }
    return go('date', { focus: false });
  }
  go('party', { focus: false });
})();
