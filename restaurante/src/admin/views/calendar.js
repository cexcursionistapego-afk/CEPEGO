// Vista «Calendario»: ocupación del mes por día y servicio.

import { ctx, api, esc, icon, navigate, pad, addDays, cap } from '../core.js';

const WD = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function shiftMonth(month, n) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export async function render(el, params) {
  const month = /^\d{4}-\d{2}$/.test(params.month || '') ? params.month : ctx.today.slice(0, 7);
  const [y, m] = month.split('-').map(Number);
  const first = `${month}-01`;
  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const start = addDays(first, -offset);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const end = addDays(`${month}-${pad(last)}`, (7 - ((offset + last) % 7)) % 7);
  const data = await api(`/api/admin/range?from=${start}&to=${end}`);
  const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)));

  const monthDays = data.days.filter((d) => d.date.startsWith(month));
  const covers = monthDays.reduce((n, d) => n + d.services.reduce((a, s) => a + s.covers, 0), 0);
  const capacity = monthDays.reduce((n, d) => n + d.services.filter((s) => s.open).reduce((a, s) => a + s.capacity, 0), 0);
  const pending = monthDays.reduce((n, d) => n + d.pending, 0);

  const cells = data.days.map((d) => {
    const other = !d.date.startsWith(month);
    const svcs = d.services.filter((s) => s.open || s.covers);
    return `<a class="cal-cell${other ? ' is-other' : ''}${d.date === ctx.today ? ' is-today' : ''}${d.closed ? ' is-closed' : ''}" href="#/servicio?date=${d.date}" aria-label="${esc(d.date)}">
      <span class="cal-date"><span class="num">${Number(d.date.slice(8))}</span>${d.pending ? `<span class="badge" title="Pendientes">${d.pending}</span>` : ''}${d.waitlist ? `<span class="tag tag-warn" title="Lista de espera">${d.waitlist}</span>` : ''}</span>
      ${d.closed && !svcs.length ? `<span class="muted" style="font-size:11.5px">${esc(d.closure || 'Cerrado')}</span>` : ''}
      <span class="cal-svc">${svcs.map((s) => {
        const v = s.capacity ? s.covers / s.capacity : 0;
        const svc = ctx.services.find((x) => x.id === s.id);
        return `<div><span class="lbl">${esc(svc?.label.es || s.id)}</span><span class="num">${s.covers}/${s.capacity}</span></div><div class="bar ${v >= 1 ? 'is-full' : v >= 0.8 ? 'is-high' : ''}" style="--v:${Math.min(1, v).toFixed(3)}"><span></span></div>`;
      }).join('')}</span>
    </a>`;
  }).join('');

  el.innerHTML = `
  <div class="topbar">
    <h1 class="page-title"><small>Calendario</small>${esc(cap(label))}</h1>
    <div class="toolbar">
      <button class="btn btn-icon" data-month="${shiftMonth(month, -1)}" aria-label="Mes anterior">${icon('left')}</button>
      <button class="btn" data-month="${ctx.today.slice(0, 7)}">Este mes</button>
      <button class="btn btn-icon" data-month="${shiftMonth(month, 1)}" aria-label="Mes siguiente">${icon('right')}</button>
    </div>
  </div>
  <div class="kpis">
    <div class="card kpi"><p class="section-label">Comensales del mes</p><p class="kpi-n num">${covers}<small> / ${capacity}</small></p><div class="bar" style="--v:${capacity ? Math.min(1, covers / capacity).toFixed(3) : 0}"><span></span></div></div>
    <div class="card kpi"><p class="section-label">Ocupación</p><p class="kpi-n num">${capacity ? Math.round((covers / capacity) * 100) : 0}<small> %</small></p><p class="muted">sobre los servicios abiertos</p></div>
    <div class="card kpi"><p class="section-label">Pendientes</p><p class="kpi-n num">${pending}</p><p class="muted">solicitudes por confirmar</p></div>
  </div>
  <div class="cal">${WD.map((d) => `<div class="cal-wd">${d}</div>`).join('')}${cells}</div>`;

  el.querySelectorAll('[data-month]').forEach((b) => b.addEventListener('click', () => navigate('/calendario', { month: b.dataset.month })));
  return {};
}
