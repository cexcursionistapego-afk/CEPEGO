// Plantillas compartidas entre el build (HTML estático) y el navegador (que las
// vuelve a pintar si desde el panel se han cambiado menús u horarios).

import { plateSVG, hash } from './plate.mjs';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Escapa y evita que palabras compuestas con guion («vint-i-quatre») se partan. */
export const nobr = (s) => esc(s).replace(/([\p{L}\d]+(?:-[\p{L}\d]+)+)/gu, '<span class="nw">$1</span>');

const LOCALE = { va: 'ca-ES', es: 'es-ES', en: 'en-GB' };
export const locale = (lang) => LOCALE[lang] || 'es-ES';

export function price(n, lang = 'es') {
  return new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export function fmtDate(iso, lang = 'es', opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale(lang), { ...opts, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}

const DAY_NAMES = {
  va: ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'],
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
const ORDER = [1, 2, 3, 4, 5, 6, 0];

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function daysLabel(days, lang = 'es') {
  const names = DAY_NAMES[lang];
  const idx = ORDER.filter((d) => days.includes(d)).map((d) => ORDER.indexOf(d));
  if (!idx.length) return '';
  const W = { va: ['Cada dia', 'De', 'a', 'i'], es: ['Todos los días', 'De', 'a', 'y'], en: ['Every day', '', 'to', 'and'] }[lang] || [];
  if (idx.length === 7) return W[0];
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (consecutive && idx.length > 2) {
    const a = names[ORDER[idx[0]]], b = names[ORDER[idx.at(-1)]];
    return cap(`${W[1] ? W[1] + ' ' : ''}${a} ${W[2]} ${b}`);
  }
  const list = idx.map((i) => names[ORDER[i]]);
  const joined = list.length > 1 ? `${list.slice(0, -1).join(', ')} ${W[3]} ${list.at(-1)}` : list[0];
  return cap(joined);
}

/** Filas de horario: [{ days, service, from, to }] + días cerrados. */
export function hoursRows(services, lang = 'es') {
  const rows = services.map((s) => ({
    days: daysLabel(s.days, lang),
    service: s.label[lang] || s.label.es,
    from: s.slots[0],
    to: s.slots.at(-1),
  }));
  const open = new Set(services.flatMap((s) => s.days));
  const closed = ORDER.filter((d) => !open.has(d));
  return { rows, closed: closed.length ? daysLabel(closed, lang) : '' };
}

export function hoursHTML(services, lang = 'es', t = {}) {
  const { rows, closed } = hoursRows(services, lang);
  const closedLabel = t.closed || { va: 'Tancat', es: 'Cerrado', en: 'Closed' }[lang];
  return `<dl class="hours">${rows.map((r) => `<div><dt>${esc(r.service)}</dt><dd>${esc(r.days)}<br><span class="num">${esc(r.from)}–${esc(r.to)}</span></dd></div>`).join('')}${closed ? `<div><dt>${esc(closedLabel)}</dt><dd>${esc(closed)}</dd></div>` : ''}</dl>`;
}

const publicServices = (services) => services.map(({ id, label, days, slots }) => ({ id, label, days, slots }));
export const servicesHash = (services) => String(hash(JSON.stringify(publicServices(services))));
export const menusHash = (menus) => String(hash(JSON.stringify(menus.filter((m) => m.active !== false))));

/** Bloque de horario con huella para que el navegador lo actualice si cambia. */
export function hoursBlock(services, lang, closedLabel) {
  return `<div data-hours data-hash="${servicesHash(services)}">${hoursHTML(publicServices(services), lang, { closed: closedLabel })}</div>`;
}

const L = {
  va: { courses: (n) => `${n} passos`, pairing: 'Maridatges', perPerson: 'per persona', see: 'Vore el menú', book: 'Reservar' },
  es: { courses: (n) => `${n} tiempos`, pairing: 'Maridajes', perPerson: 'por persona', see: 'Ver el menú', book: 'Reservar' },
  en: { courses: (n) => `${n} courses`, pairing: 'Pairings', perPerson: 'per guest', see: 'See the menu', book: 'Book' },
};

/** Tarjetas resumen de menús (portada). */
export function menuCardsHTML(menus, lang, links) {
  const l = L[lang] || L.es;
  return menus.filter((m) => m.active !== false).map((m, i) => `
    <article class="menu-card" data-reveal>
      <div class="menu-card-plate">${plateSVG(m.courses[Math.min(4, m.courses.length - 1)]?.es || m.id)}</div>
      <div class="menu-card-body">
        <p class="eyebrow">${esc(l.courses(m.courses.length))}</p>
        <h3 class="menu-card-title">${esc(m.name[lang] || m.name.es)}</h3>
        <p class="menu-card-summary">${esc(m.summary[lang] || m.summary.es)}</p>
        <p class="menu-card-price"><span class="num">${price(m.price, lang)}</span> <span class="muted">${l.perPerson}</span></p>
        <a class="link-arrow" href="${links.menus}#${esc(m.id)}">${l.see}</a>
      </div>
    </article>`).join('');
}

/** Menú completo con su «partitura» de tiempos (página de menús). */
export function menuDetailHTML(menus, lang, links) {
  const l = L[lang] || L.es;
  return menus.filter((m) => m.active !== false).map((m, mi) => `
    <section class="menu-detail" id="${esc(m.id)}" aria-labelledby="menu-${esc(m.id)}">
      <header class="menu-detail-head" data-reveal>
        <p class="eyebrow">${esc(l.courses(m.courses.length))}</p>
        <h2 class="menu-detail-title" id="menu-${esc(m.id)}">${esc(m.name[lang] || m.name.es)}</h2>
        <p class="lead">${esc(m.summary[lang] || m.summary.es)}</p>
        <div class="menu-detail-prices">
          <p><span class="price-big num">${price(m.price, lang)}</span><span class="muted"> ${l.perPerson}</span></p>
          ${m.pairing?.length ? `<ul class="pairings">${m.pairing.map((p) => `<li><span>${esc(p.name[lang] || p.name.es)}</span><span class="num">+${price(p.price, lang)}</span></li>`).join('')}</ul>` : ''}
          <a class="btn" href="${links.booking}?menu=${encodeURIComponent(m.id)}">${l.book}</a>
        </div>
      </header>
      <div class="score">
        <ol class="score-list">
          ${m.courses.map((c, i) => `
          <li class="course" data-reveal tabindex="0" data-course="${i}">
            <span class="course-name">${esc(c[lang] || c.es)}</span>
            <span class="course-plate">${plateSVG(c.es, { rim: false })}</span>
          </li>`).join('')}
        </ol>
        <div class="score-stage" aria-hidden="true">
          ${m.courses.map((c, i) => `<div class="stage-plate${i === 0 ? ' is-active' : ''}" data-stage="${i}">${plateSVG(c.es)}<p class="stage-caption">${esc(c[lang] || c.es)}</p></div>`).join('')}
        </div>
      </div>
    </section>`).join('');
}

/** Instante UTC de una hora local del restaurante (para calendarios). */
export function zonedToUtc(date, time, tz) {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (ms) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
  };
  let ts = guess - offsetAt(guess);
  ts = guess - offsetAt(ts);
  return new Date(ts);
}
