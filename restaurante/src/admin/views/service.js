// Vista «Servicio»: la hoja de sala del día, por servicio y por turno.

import {
  ctx, api, esc, icon, toast, ask, navigate, refresh, addDays, fmtDate, relDay, cap,
  statusPill, SOURCE, OCCASION, DIETARY, menuLabel,
} from '../core.js';
import { openBookingForm } from '../booking-form.js';

const ACTIVE = ['pending', 'confirmed', 'seated', 'completed'];

function ratioClass(v) { return v >= 1 ? 'is-full' : v >= 0.8 ? 'is-high' : ''; }
function bar(v) { return `<div class="bar ${ratioClass(v)}" style="--v:${Math.min(1, v).toFixed(3)}"><span></span></div>`; }

function actions(b) {
  const btn = (status, label, cls = '') => `<button class="btn btn-sm ${cls}" data-act="${status}" data-id="${b.id}">${label}</button>`;
  const list = [];
  if (b.status === 'pending') list.push(btn('confirmed', 'Confirmar', 'btn-ok'), btn('cancelled', 'Rechazar', 'btn-danger'));
  if (b.status === 'confirmed') list.push(btn('seated', 'Ha llegado', 'btn-ok'), btn('no_show', 'No vino', 'btn-danger'));
  if (b.status === 'seated') list.push(btn('completed', 'Terminada'));
  if (b.status === 'no_show' || b.status === 'cancelled') list.push(btn('confirmed', 'Reactivar'));
  list.push(`<button class="btn btn-sm btn-ghost" data-edit="${b.id}" aria-label="Editar reserva de ${esc(b.name)}">${icon('edit')}</button>`);
  return list.join('');
}

function notifIcons(b) {
  const n = b.notifications || [];
  const last = (ch) => [...n].reverse().find((x) => x.channel === ch);
  return ['email', 'sms'].map((ch) => {
    const x = last(ch);
    if (!x) return '';
    return `<span class="${x.ok ? 'ok' : 'fail'}" title="${ch === 'sms' ? 'SMS' : 'Email'}: ${x.kind} ${x.ok ? 'enviado' : 'falló'}">${icon(ch === 'sms' ? 'sms' : 'mail')}</span>`;
  }).join('');
}

export function bookingRow(b, { showDate = false } = {}) {
  const g = b.guest;
  const tags = [];
  for (const t of g?.tags || []) tags.push(`<span class="tag ${/vip/i.test(t) ? 'tag-vip' : 'tag-accent'}">${esc(t)}</span>`);
  if (g && g.visits > 0) tags.push(`<span class="tag">${g.visits + 1}ª visita</span>`);
  else tags.push('<span class="tag tag-info">Nuevo</span>');
  if (g?.noShows) tags.push(`<span class="tag tag-danger">${g.noShows} no-show</span>`);
  if (b.occasion) tags.push(`<span class="tag tag-accent">${icon('star')}${esc(OCCASION[b.occasion] || b.occasion)}</span>`);
  const meta = [
    showDate ? `<strong>${esc(cap(fmtDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })))} · ${esc(b.time)}</strong>` : '',
    b.phone ? `<a href="tel:${esc(b.phone)}">${icon('phone')} ${esc(b.phone)}</a>` : '',
    b.email ? `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : '',
    menuLabel(b) ? `<span>${esc(menuLabel(b))}</span>` : '',
    `<span class="muted">${esc(SOURCE[b.source] || b.source)} · ${esc(b.code)}</span>`,
  ].filter(Boolean).join('');
  const alerts = [b.allergies, ...(b.dietary || []).map((d) => DIETARY[d] || d)].filter(Boolean);
  return `<article class="bk" data-status="${b.status}" data-id="${b.id}">
    <div class="bk-party num">${b.party}<small>pax</small></div>
    <div class="bk-main">
      <div class="bk-name"><button type="button" data-edit="${b.id}">${esc(b.name)}</button>${tags.join('')}</div>
      <div class="bk-meta">${meta}</div>
      ${alerts.length ? `<div class="bk-alert">${icon('alert')}<span>${esc(alerts.join(' · '))}</span></div>` : ''}
      ${b.notes ? `<div class="bk-note">“${esc(b.notes)}”</div>` : ''}
      ${b.internalNotes ? `<div class="bk-note internal">${esc(b.internalNotes)}</div>` : ''}
      ${g?.notes ? `<div class="bk-note internal">Ficha: ${esc(g.notes)}</div>` : ''}
    </div>
    <div class="bk-side">
      <input class="bk-table" value="${esc(b.table || '')}" placeholder="Mesa" aria-label="Mesa de ${esc(b.name)}" data-table="${b.id}">
      ${statusPill(b.status)}
      <div class="bk-notif">${notifIcons(b)}</div>
      <div class="bk-actions">${actions(b)}</div>
    </div>
  </article>`;
}

export async function updateStatus(b, status) {
  let notify = false;
  if (status === 'cancelled' || status === 'no_show') {
    const r = await ask(status === 'cancelled' ? `¿Cancelar la reserva de ${b.name}?` : `¿Marcar a ${b.name} como no presentado?`, {
      confirm: status === 'cancelled' ? 'Cancelar reserva' : 'Marcar no-show',
      danger: true,
      checkbox: status === 'cancelled' && (b.email || b.phone) ? { label: 'Avisar al cliente de la cancelación', checked: true } : null,
    });
    if (!r.ok) return false;
    notify = r.checked;
  }
  if (b.status === 'pending' && status === 'confirmed') notify = true;
  await api('/api/admin/bookings', { method: 'PATCH', body: { date: b.date, id: b.id, patch: { status }, notify, override: b.status === 'cancelled' || b.status === 'no_show' ? false : undefined } });
  toast({ confirmed: 'Confirmada', seated: 'En sala', completed: 'Terminada', no_show: 'Marcada como no-show', cancelled: 'Cancelada' }[status] || 'Guardado');
  return true;
}

export function bindBookingList(root, bookings) {
  const byId = new Map(bookings.map((b) => [b.id, b]));
  root.addEventListener('click', async (e) => {
    const edit = e.target.closest('[data-edit]');
    if (edit) return openBookingForm({ booking: byId.get(edit.dataset.edit) });
    const act = e.target.closest('[data-act]');
    if (act) {
      act.disabled = true;
      try { if (await updateStatus(byId.get(act.dataset.id), act.dataset.act)) refresh(); }
      catch (err) { toast(err.message, 'error'); }
      finally { act.disabled = false; }
    }
  });
  root.addEventListener('change', async (e) => {
    const input = e.target.closest('[data-table]');
    if (!input) return;
    const b = byId.get(input.dataset.table);
    try {
      await api('/api/admin/bookings', { method: 'PATCH', body: { date: b.date, id: b.id, patch: { table: input.value.trim() } } });
      b.table = input.value.trim();
      toast(`Mesa ${b.table || '—'} · ${b.name}`);
    } catch (err) { toast(err.message, 'error'); }
  });
}

export async function render(el, params) {
  const date = params.date || ctx.today;
  const data = await api(`/api/admin/day?date=${date}`);
  const svcs = ctx.services;
  const active = data.bookings.filter((b) => ACTIVE.includes(b.status));
  const covers = active.reduce((n, b) => n + b.party, 0);
  const capacity = data.summary.services.filter((s) => s.open).reduce((n, s) => n + s.capacity, 0);
  const pending = data.bookings.filter((b) => b.status === 'pending').length;
  const arrived = data.bookings.filter((b) => b.status === 'seated' || b.status === 'completed').reduce((n, b) => n + b.party, 0);
  const waitlist = data.waitlist.filter((w) => w.status === 'waiting');
  const allergies = active.filter((b) => b.allergies || b.dietary?.length).length;
  const rel = relDay(date);

  const serviceBlocks = svcs.map((s) => {
    const sum = data.summary.services.find((x) => x.id === s.id);
    const list = data.bookings.filter((b) => b.service === s.id);
    const act = list.filter((b) => ACTIVE.includes(b.status));
    const inactive = list.filter((b) => !ACTIVE.includes(b.status));
    if (!sum.open && !list.length) return '';
    const occ = data.occupancy[s.id] || { bySlot: {} };
    const busy = [...new Set(act.map((b) => b.time))].sort();
    const free = s.slots.filter((t) => !busy.includes(t));
    const groups = busy.map((t) => {
      const items = act.filter((b) => b.time === t);
      const inSlot = occ.bySlot[t] || 0;
      const isSlot = s.slots.includes(t);
      return `<div class="slot-group">
        <div class="slot-label"><strong class="num">${t}</strong>${isSlot ? `${bar(inSlot / s.slotCapacity)}<small class="num">${inSlot}/${s.slotCapacity}</small>` : '<small>fuera de turno</small>'}</div>
        <div class="slot-items">${items.map((b) => bookingRow(b)).join('')}</div>
      </div>`;
    }).join('') + (free.length && sum.open ? `<div class="slot-free"><span class="muted">${busy.length ? 'Turnos libres' : 'Sin reservas · turnos libres'}</span>${free.map((t) => `<button type="button" class="btn btn-sm" data-new-at="${s.id}|${t}" title="Añadir reserva a las ${t}">${t}</button>`).join('')}</div>` : '');
    return `<section class="card service-block">
      <header class="service-head">
        <h2>${esc(s.label.es)}</h2>
        ${sum.open ? '' : '<span class="tag tag-danger">Cerrado</span>'}
        <span class="num">${sum.covers}/${s.capacity}</span><span class="muted">comensales · ${sum.bookings} mesas</span>
        ${bar(sum.covers / s.capacity)}
        <button class="btn btn-sm no-print" data-new-in="${s.id}">${icon('plus')} Añadir</button>
      </header>
      ${groups}
      ${inactive.length ? `<details class="inactive"><summary>Canceladas y no presentadas (${inactive.length})</summary>${inactive.map((b) => bookingRow(b)).join('')}</details>` : ''}
    </section>`;
  }).join('');

  const waitHtml = waitlist.length ? `<section class="card service-block">
    <header class="service-head"><h2>Lista de espera</h2><span class="muted">${waitlist.length} en espera</span></header>
    ${waitlist.map((w) => `<div class="waitlist-item">
      <div><strong>${esc(w.name)}</strong> · ${w.party} pax · ${esc(w.service === 'any' ? 'cualquier servicio' : (svcs.find((s) => s.id === w.service)?.label.es || w.service))}<br>
      <span class="muted"><a href="tel:${esc(w.phone)}">${esc(w.phone)}</a> · ${esc(w.email)}${w.notes ? ` · “${esc(w.notes)}”` : ''}</span></div>
      <div class="bk-actions"><button class="btn btn-sm btn-ok" data-wl-book="${w.id}">Dar mesa</button><button class="btn btn-sm" data-wl="${w.id}" data-st="contacted">Contactado</button><button class="btn btn-sm btn-ghost" data-wl="${w.id}" data-st="dismissed" aria-label="Descartar">${icon('x')}</button></div>
    </div>`).join('')}
  </section>` : '';

  el.innerHTML = `
  <div class="topbar">
    <h1 class="page-title"><small>${esc(rel ? `${rel} · ` : '')}Servicio</small>${esc(cap(fmtDate(date)))}</h1>
    <div class="toolbar">
      <div class="date-nav">
        <button class="btn btn-icon" data-day="${addDays(date, -1)}" aria-label="Día anterior">${icon('left')}</button>
        <input type="date" value="${date}" data-date aria-label="Elegir fecha">
        <button class="btn btn-icon" data-day="${addDays(date, 1)}" aria-label="Día siguiente">${icon('right')}</button>
      </div>
      ${date !== ctx.today ? `<button class="btn" data-day="${ctx.today}">Hoy</button>` : ''}
      <button class="btn" data-print>${icon('print')} Imprimir</button>
    </div>
  </div>
  ${data.summary.closed ? `<p class="notice notice-warn day-closed">Día cerrado${data.summary.closure ? `: ${esc(data.summary.closure)}` : ''}. Las reservas web no están disponibles.</p>` : ''}
  <div class="kpis">
    <div class="card kpi"><p class="section-label">Comensales</p><p class="kpi-n num">${covers}<small> / ${capacity}</small></p>${bar(capacity ? covers / capacity : 0)}</div>
    <div class="card kpi"><p class="section-label">Mesas</p><p class="kpi-n num">${active.length}</p><p class="muted">${arrived} comensales ya en sala</p></div>
    <div class="card kpi"><p class="section-label">Pendientes</p><p class="kpi-n num">${pending}</p><p class="muted">${pending ? 'por confirmar' : 'todo confirmado'}</p></div>
    <div class="card kpi"><p class="section-label">Alergias / dietas</p><p class="kpi-n num">${allergies}</p><p class="muted">mesas con avisos</p></div>
    <div class="card kpi"><p class="section-label">Lista de espera</p><p class="kpi-n num">${waitlist.length}</p><p class="muted">${waitlist.reduce((n, w) => n + w.party, 0)} comensales</p></div>
  </div>
  ${serviceBlocks || '<div class="card empty"><span class="serif">Sin servicio</span>Este día no hay servicios abiertos ni reservas.</div>'}
  ${waitHtml}`;

  bindBookingList(el, data.bookings);
  el.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => navigate('/servicio', { date: b.dataset.day })));
  el.querySelector('[data-date]').addEventListener('change', (e) => e.target.value && navigate('/servicio', { date: e.target.value }));
  el.querySelector('[data-print]').addEventListener('click', () => print());
  el.querySelectorAll('[data-new-in]').forEach((b) => b.addEventListener('click', () => openBookingForm({ date, service: b.dataset.newIn })));
  el.querySelectorAll('[data-new-at]').forEach((b) => b.addEventListener('click', () => {
    const [service, time] = b.dataset.newAt.split('|');
    openBookingForm({ date, service, time });
  }));
  el.querySelectorAll('[data-wl]').forEach((b) => b.addEventListener('click', async () => {
    try {
      await api('/api/admin/waitlist', { method: 'PATCH', body: { date, id: b.dataset.wl, status: b.dataset.st } });
      refresh();
    } catch (err) { toast(err.message, 'error'); }
  }));
  el.querySelectorAll('[data-wl-book]').forEach((b) => b.addEventListener('click', () => {
    const w = waitlist.find((x) => x.id === b.dataset.wlBook);
    openBookingForm({
      date, service: w.service !== 'any' ? w.service : undefined,
      prefill: { party: w.party, name: w.name, email: w.email, phone: w.phone, lang: w.lang, notes: w.notes, source: 'phone' },
      fromWaitlist: { date, id: w.id },
    });
  }));

  // Auto-actualización cada minuto si se está mirando hoy (entran reservas web).
  return { poll: date === ctx.today || date === addDays(ctx.today, 1) ? 60000 : 0, signature: data.bookings.map((b) => b.id + b.status + b.updatedAt).join() };
}
