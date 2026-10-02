// Formulario de reserva del panel (nueva o edición), en panel lateral.

import {
  ctx, api, esc, icon, openDrawer, closeDrawer, toast, refresh, formToObject, fieldError,
  STATUS, SOURCE, OCCASION, DIETARY, fmtStamp, fmtDate, people,
} from './core.js';

const dayCache = new Map();
async function getDay(date) {
  if (!dayCache.has(date)) dayCache.set(date, api(`/api/admin/day?date=${date}`).catch((e) => { dayCache.delete(date); throw e; }));
  return dayCache.get(date);
}

function options(list, selected) {
  return list.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(selected ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('');
}

function timeOptions(serviceId, current) {
  const s = ctx.services.find((x) => x.id === serviceId);
  const slots = s ? s.slots : [];
  const isOther = current && !slots.includes(current);
  return options([...slots.map((t) => [t, t]), ['other', 'Otra hora…']], isOther ? 'other' : current || slots[0]);
}

function pairingOptions(menuId, current) {
  const m = ctx.menus.find((x) => x.id === menuId);
  return options([['', 'Sin maridaje'], ...(m?.pairing || []).map((p) => [p.id, `${p.name.es} (+${p.price} €)`])], current);
}

function notifLog(b) {
  const list = b.notifications || [];
  if (!list.length) return '';
  const kind = { confirmed: 'confirmación', pending: 'solicitud recibida', cancelled: 'cancelación', reminder: 'recordatorio' };
  return `<div><p class="section-label">Avisos enviados</p><ul class="history">${list.slice().reverse().map((n) =>
    `<li><span class="muted">${fmtStamp(n.at)}</span><span>${icon(n.channel === 'sms' ? 'sms' : 'mail')} ${n.channel === 'sms' ? 'SMS' : 'Email'} de ${kind[n.kind] || n.kind} — ${n.ok ? 'enviado' : `<span style="color:var(--danger)">falló (${esc(n.reason || 'error')})</span>`}</span></li>`).join('')}</ul></div>`;
}

function historyLog(b) {
  if (!b.history?.length) return '';
  const action = { created: 'Creada', updated: 'Modificada' };
  return `<div><p class="section-label">Historial</p><ul class="history">${b.history.slice().reverse().map((h) =>
    `<li><span class="muted">${fmtStamp(h.at)}</span><span><strong>${esc(action[h.action] || h.action)}</strong> por ${esc(h.by)}${h.detail ? ` · ${esc(h.detail)}` : ''}</span></li>`).join('')}</ul></div>`;
}

/**
 * opts: { booking, date, service, time, prefill, onSaved, fromWaitlist: { date, id } }
 */
export function openBookingForm(opts = {}) {
  const b = opts.booking || null;
  const editing = Boolean(b);
  const p = { party: 2, status: 'confirmed', source: 'phone', ...(opts.prefill || {}) };
  const v = editing ? b : {
    date: opts.date || p.date || ctx.today,
    service: opts.service || p.service || ctx.services[0]?.id,
    time: opts.time || p.time || '',
    ...p,
  };
  if (!ctx.services.some((s) => s.id === v.service)) v.service = ctx.services[0]?.id;
  const otherTime = v.time && !(ctx.services.find((s) => s.id === v.service)?.slots || []).includes(v.time) ? v.time : '';
  const guest = b?.guest;

  const html = `
  ${editing ? `<div class="toolbar" style="justify-content:space-between">
      <span>${statusPillHtml(b.status)} <span class="muted">Loc. <strong class="num">${esc(b.code)}</strong> · ${esc(SOURCE[b.source] || b.source)}</span></span>
      ${guest ? `<span class="muted">${guest.visits ? `${guest.visits}ª visita` : 'Primera visita'}${guest.noShows ? ` · <span style="color:var(--danger)">${guest.noShows} no-show</span>` : ''}</span>` : ''}
    </div>` : ''}
  <form class="bf" novalidate>
    <div class="notice avail-hint" data-avail>Comprobando disponibilidad…</div>
    <div class="form-grid">
      <label class="f"><span>Fecha</span><input type="date" name="date" required value="${esc(v.date)}"></label>
      <label class="f"><span>Comensales</span><input type="number" name="party" min="1" max="200" required value="${esc(v.party)}" inputmode="numeric"></label>
      <label class="f"><span>Servicio</span><select name="service">${options(ctx.services.map((s) => [s.id, s.label.es]), v.service)}</select></label>
      <label class="f"><span>Hora</span><select name="time">${timeOptions(v.service, v.time)}</select>
        <input type="time" name="timeOther" value="${esc(otherTime)}" ${otherTime ? '' : 'hidden'} aria-label="Otra hora"></label>
      <label class="f full"><span>Nombre</span><input name="name" required autocomplete="off" value="${esc(v.name || '')}"></label>
      <label class="f"><span>Teléfono</span><input name="phone" type="tel" inputmode="tel" value="${esc(v.phone || '')}"></label>
      <label class="f"><span>Email</span><input name="email" type="email" value="${esc(v.email || '')}"></label>
      <label class="f"><span>Menú</span><select name="menu">${options([['', 'Sin decidir'], ...ctx.menus.map((m) => [m.id, `${m.name.es} (${m.price} €)`])], v.menu)}</select></label>
      <label class="f"><span>Maridaje</span><select name="pairing">${pairingOptions(v.menu, v.pairing)}</select></label>
      <fieldset class="f full" style="border:0;padding:0;margin:0"><legend>Dieta y restricciones</legend><div class="chips">${Object.entries(DIETARY).map(([k, l]) =>
        `<label class="chip"><input type="checkbox" name="dietary" value="${k}" ${(v.dietary || []).includes(k) ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></fieldset>
      <label class="f full"><span>Alergias e intolerancias</span><textarea name="allergies" rows="2">${esc(v.allergies || '')}</textarea></label>
      <label class="f"><span>Ocasión</span><select name="occasion">${options([['', '—'], ...Object.entries(OCCASION)], v.occasion)}</select></label>
      <label class="f"><span>Mesa</span><input name="table" value="${esc(v.table || '')}" placeholder="p. ej. 4 o barra"></label>
      <label class="f full"><span>Notas del cliente</span><textarea name="notes" rows="2">${esc(v.notes || '')}</textarea></label>
      <label class="f full"><span>Notas internas (no las ve el cliente)</span><textarea name="internalNotes" rows="2">${esc(v.internalNotes || '')}</textarea></label>
      ${editing ? '' : `<label class="f"><span>Origen</span><select name="source">${options([['phone', 'Teléfono'], ['walkin', 'Presencial'], ['email', 'Email'], ['admin', 'Otro']], v.source)}</select></label>`}
      <label class="f"><span>Estado</span><select name="status">${options(Object.entries(STATUS).filter(([k]) => editing || ['confirmed', 'pending', 'seated'].includes(k)), v.status)}</select></label>
      <label class="f"><span>Idioma de los avisos</span><select name="lang">${options([['va', 'Valencià'], ['es', 'Castellano'], ['en', 'English']], v.lang || 'va')}</select></label>
    </div>
    <label class="checkline"><input type="checkbox" name="override"> Forzar aunque no quede aforo o el servicio esté cerrado</label>
    <label class="checkline"><input type="checkbox" name="notify" ${editing ? '' : 'checked'}> ${editing ? 'Avisar al cliente si se confirma, cambia o cancela' : 'Enviar confirmación al cliente'} ${ctx.mail || ctx.sms ? `<span class="muted">(${[ctx.mail && 'email', ctx.sms && 'SMS'].filter(Boolean).join(' y ')})</span>` : '<span class="muted">(email/SMS sin configurar)</span>'}</label>
    <div class="notice notice-danger" data-error hidden></div>
    <div class="form-actions">
      ${editing ? `<a class="btn btn-ghost" href="#/clientes?q=${encodeURIComponent(b.email || b.phone || b.name)}" data-close-drawer>${icon('users')} Ficha del cliente</a>` : ''}
      <button type="button" class="btn" data-cancel>Cerrar</button>
      <button class="btn btn-primary btn-lg" type="submit">${editing ? 'Guardar cambios' : 'Crear reserva'}</button>
    </div>
  </form>
  ${editing ? notifLog(b) + historyLog(b) : ''}`;

  openDrawer(editing ? b.name : 'Nueva reserva', html, (body) => {
    const form = body.querySelector('form');
    const el = form.elements;
    const hint = body.querySelector('[data-avail]');
    const err = body.querySelector('[data-error]');

    const currentTime = () => (el.time.value === 'other' ? el.timeOther.value : el.time.value);

    async function updateHint() {
      const date = el.date.value;
      if (!date) return;
      try {
        const data = await getDay(date);
        const svc = ctx.services.find((s) => s.id === el.service.value);
        if (!svc) return;
        const open = data.availability.services?.some((s) => s.id === svc.id);
        const bookings = data.bookings.filter((x) => x.service === svc.id && ['pending', 'confirmed', 'seated', 'completed'].includes(x.status) && x.id !== b?.id);
        const total = bookings.reduce((n, x) => n + x.party, 0);
        const time = currentTime();
        const inSlot = bookings.filter((x) => x.time === time).reduce((n, x) => n + x.party, 0);
        const party = Number(el.party.value) || 0;
        const left = Math.min(svc.capacity - total, (svc.slots.includes(time) ? svc.slotCapacity : Infinity) - inSlot);
        hint.className = 'notice avail-hint' + (!open || party > left ? ' notice-warn' : ' notice-ok');
        hint.innerHTML = `<strong>${esc(fmtDate(date))}</strong> · ${esc(svc.label.es)}${open ? '' : ' — <strong>cerrado ese día</strong>'}<br>
          ${total}/${svc.capacity} comensales en el servicio${svc.slots.includes(time) ? ` · ${inSlot}/${svc.slotCapacity} llegan a las ${esc(time)}` : ''}
          ${open && party > left ? `<br><strong>No hay aforo para ${people(party)}</strong> (quedan ${Math.max(0, left)}). Puedes forzarla.` : ''}`;
      } catch {
        hint.textContent = 'No se pudo comprobar la disponibilidad.';
      }
    }

    el.service.addEventListener('change', () => { el.time.innerHTML = timeOptions(el.service.value, ''); el.timeOther.hidden = true; updateHint(); });
    el.time.addEventListener('change', () => { el.timeOther.hidden = el.time.value !== 'other'; if (!el.timeOther.hidden) el.timeOther.focus(); updateHint(); });
    el.menu.addEventListener('change', () => { el.pairing.innerHTML = pairingOptions(el.menu.value, ''); });
    ['date', 'party', 'timeOther'].forEach((n) => el[n].addEventListener('change', updateHint));
    body.querySelector('[data-cancel]').addEventListener('click', () => closeDrawer());
    body.querySelector('[data-close-drawer]')?.addEventListener('click', () => closeDrawer());
    updateHint();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.hidden = true;
      if (!el.name.value.trim()) return fieldError(form, 'name', 'Indica el nombre.');
      const data = formToObject(form);
      data.time = currentTime();
      if (!data.time) return fieldError(form, 'timeOther', 'Indica la hora.');
      const { override, notify, timeOther, ...fields } = data;
      const submit = form.querySelector('button[type=submit]');
      submit.disabled = true;
      try {
        if (editing) {
          await api('/api/admin/bookings', { method: 'PATCH', body: { date: b.date, id: b.id, patch: fields, override, notify } });
          toast('Reserva actualizada');
        } else {
          const r = await api('/api/admin/bookings', { method: 'POST', body: { ...fields, override, notify } });
          toast(`Reserva creada · ${r.booking.code}`);
          if (opts.fromWaitlist) {
            await api('/api/admin/waitlist', { method: 'PATCH', body: { ...opts.fromWaitlist, status: 'booked' } }).catch(() => {});
          }
        }
        dayCache.clear();
        closeDrawer();
        refresh();
        opts.onSaved?.();
      } catch (e2) {
        if (e2.field && fieldError(form, e2.field, e2.message)) return;
        err.textContent = e2.message;
        err.hidden = false;
        if (e2.code === 'full' || e2.code === 'closed') el.override.closest('.checkline').style.fontWeight = '600';
      } finally {
        submit.disabled = false;
      }
    });
  });
}

function statusPillHtml(s) {
  return `<span class="pill st-${s}">${STATUS[s] || s}</span>`;
}

export function clearDayCache() { dayCache.clear(); }
