// Vista «Reservas»: búsqueda en todo el historial, listado por fechas y
// exportación a CSV.

import { ctx, api, esc, icon, navigate, addDays, fmtShort, cap, statusPill, SOURCE, menuLabel } from '../core.js';
import { openBookingForm } from '../booking-form.js';

function table(list) {
  if (!list.length) return '<div class="empty"><span class="serif">Sin resultados</span>Prueba con otras fechas o con otro término.</div>';
  return `<div class="table-wrap"><table class="list">
    <thead><tr><th>Fecha</th><th>Hora</th><th>Pax</th><th>Nombre</th><th>Contacto</th><th>Menú</th><th>Estado</th><th>Origen</th><th>Loc.</th></tr></thead>
    <tbody>${list.map((b) => `<tr data-id="${b.id}" tabindex="0">
      <td>${esc(cap(fmtShort(b.date)))}</td><td class="num">${esc(b.time)}</td><td class="num">${b.party}</td>
      <td><strong>${esc(b.name)}</strong>${b.allergies || b.dietary?.length ? ` <span class="tag tag-danger" title="${esc(b.allergies)}">${icon('alert')}</span>` : ''}${(b.guest?.tags || []).map((t) => ` <span class="tag">${esc(t)}</span>`).join('')}</td>
      <td>${esc(b.phone || '')}<br><span class="muted">${esc(b.email || '')}</span></td>
      <td>${esc(menuLabel(b) || '—')}</td><td>${statusPill(b.status)}</td><td>${esc(SOURCE[b.source] || b.source)}</td><td class="num">${esc(b.code)}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

export async function render(el, params) {
  const q = (params.q || '').trim();
  const from = params.from || ctx.today;
  const to = params.to || addDays(from, 30);
  const status = params.status || 'active';

  el.innerHTML = `
  <div class="topbar">
    <h1 class="page-title"><small>Reservas</small>${q ? `Búsqueda: “${esc(q)}”` : 'Listado'}</h1>
    <div class="toolbar">
      <a class="btn" data-export href="#">${icon('download')} Exportar CSV</a>
    </div>
  </div>
  <form class="card card-pad toolbar" data-filters style="margin-bottom:18px;gap:12px">
    <label class="search"><span class="sr-only">Buscar</span>${icon('search')}<input class="input" name="q" value="${esc(q)}" placeholder="Nombre, email, teléfono o localizador"></label>
    <label class="f" style="grid-auto-flow:column;align-items:center;gap:8px"><span>Desde</span><input type="date" name="from" value="${esc(from)}"></label>
    <label class="f" style="grid-auto-flow:column;align-items:center;gap:8px"><span>Hasta</span><input type="date" name="to" value="${esc(to)}"></label>
    <label class="f" style="grid-auto-flow:column;align-items:center;gap:8px"><span>Estado</span><select name="status">
      ${[['active', 'Activas'], ['all', 'Todas'], ['pending', 'Pendientes'], ['cancelled', 'Canceladas'], ['no_show', 'No presentadas'], ['completed', 'Terminadas']].map(([v, l]) => `<option value="${v}"${v === status ? ' selected' : ''}>${l}</option>`).join('')}
    </select></label>
    <button class="btn btn-primary">Aplicar</button>
  </form>
  <div class="card" data-results><p class="loading">Cargando…</p></div>`;

  const form = el.querySelector('[data-filters]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    navigate('/reservas', { q: f.q.trim(), from: f.from, to: f.to, status: f.status });
  });
  el.querySelector('[data-export]').addEventListener('click', (e) => {
    e.preventDefault();
    location.href = `/api/admin/export?from=${encodeURIComponent(form.from.value)}&to=${encodeURIComponent(form.to.value)}`;
  });

  let list;
  if (q.length >= 2) {
    list = (await api(`/api/admin/search?q=${encodeURIComponent(q)}`)).bookings;
  } else {
    list = (await api(`/api/admin/range?from=${from}&to=${to}&full=1`)).bookings;
  }
  const filtered = list.filter((b) => {
    if (status === 'all') return true;
    if (status === 'active') return ['pending', 'confirmed', 'seated', 'completed'].includes(b.status);
    return b.status === status;
  });
  const box = el.querySelector('[data-results]');
  const covers = filtered.reduce((n, b) => n + b.party, 0);
  box.innerHTML = `<p class="card-pad muted" style="padding-bottom:0">${filtered.length} reservas · ${covers} comensales${q ? ' · en todo el historial' : ''}</p>${table(filtered)}`;
  const open = (id) => openBookingForm({ booking: filtered.find((b) => b.id === id) });
  box.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr) open(tr.dataset.id); });
  box.addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-id]'); if (tr && e.key === 'Enter') open(tr.dataset.id); });
  return {};
}
