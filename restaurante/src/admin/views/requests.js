// Vista «Solicitudes»: eventos privados, tarjetas regalo y mensajes de contacto.

import { api, esc, icon, navigate, toast, fmtStamp, fmtDate, cap, menuOf } from '../core.js';

const TYPES = { evento: 'Evento privado', regalo: 'Tarjeta regalo', contacto: 'Contacto' };
const STATES = { new: 'Nueva', in_progress: 'En curso', done: 'Resuelta', archived: 'Archivada' };
const STATE_CLASS = { new: 'tag-warn', in_progress: 'tag-info', done: 'tag-ok', archived: '' };

function details(r) {
  const rows = [];
  if (r.type === 'evento') {
    rows.push(['Fecha', r.date ? cap(fmtDate(r.date)) : 'Sin fecha'], ['Invitados', r.guests], ['Tipo', r.eventType || '—'], ['Presupuesto', r.budget || '—']);
    if (r.company) rows.push(['Empresa', r.company]);
  }
  if (r.type === 'regalo') {
    const m = menuOf(r.menu);
    const p = m?.pairing.find((x) => x.id === r.pairing);
    rows.push(['Código', r.giftCode], ['Para', r.recipient], ['Menú', `${m?.name.es || r.menu}${p ? ` + ${p.name.es.toLowerCase()}` : ''}`], ['Comensales', r.guests], ['Importe', r.amount ? `${r.amount} €` : '—'], ['Entrega', r.delivery === 'print' ? 'Impresa' : 'Email']);
    if (r.recipientEmail) rows.push(['Email destinatario', r.recipientEmail]);
  }
  if (r.type === 'contacto' && r.subject) rows.push(['Asunto', r.subject]);
  rows.push(['Idioma', { va: 'Valencià', es: 'Castellano', en: 'English' }[r.lang] || r.lang]);
  return `<dl>${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
}

export async function render(el, params) {
  const type = params.type || 'all';
  const state = params.state || 'open';
  const { requests } = await api('/api/admin/requests');
  const list = requests.filter((r) => (type === 'all' || r.type === type) &&
    (state === 'all' || (state === 'open' ? ['new', 'in_progress'].includes(r.status) : r.status === state)));
  const count = (t) => requests.filter((r) => (t === 'all' || r.type === t) && ['new', 'in_progress'].includes(r.status)).length;

  el.innerHTML = `
  <div class="topbar">
    <h1 class="page-title"><small>Solicitudes</small>${type === 'all' ? 'Todas' : esc(TYPES[type])}</h1>
    <div class="toolbar">
      <div class="tabs" role="group" aria-label="Tipo">${[['all', 'Todas'], ['evento', 'Eventos'], ['regalo', 'Regalos'], ['contacto', 'Contacto']].map(([v, l]) =>
        `<button type="button" data-type="${v}" aria-pressed="${v === type}">${l}${count(v) ? ` <span class="badge">${count(v)}</span>` : ''}</button>`).join('')}</div>
      <div class="tabs" role="group" aria-label="Estado">${[['open', 'Abiertas'], ['done', 'Resueltas'], ['archived', 'Archivadas'], ['all', 'Todas']].map(([v, l]) =>
        `<button type="button" data-state="${v}" aria-pressed="${v === state}">${l}</button>`).join('')}</div>
    </div>
  </div>
  <div class="req-list">${list.length ? list.map((r) => `
    <article class="card req" data-id="${r.id}">
      <header class="req-head">
        <h3>${r.type === 'regalo' ? icon('gift') : r.type === 'evento' ? icon('star') : icon('mail')} ${esc(TYPES[r.type])} · ${esc(r.name)}</h3>
        <span><span class="tag ${STATE_CLASS[r.status]}">${STATES[r.status]}</span> <span class="muted">${esc(fmtStamp(r.createdAt))}</span></span>
      </header>
      <p>${r.email ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : ''}${r.phone ? ` · <a href="tel:${esc(r.phone)}">${esc(r.phone)}</a>` : ''}</p>
      ${details(r)}
      ${r.message ? `<p class="req-msg">${esc(r.message)}</p>` : ''}
      ${r.dedication ? `<p class="req-msg">Dedicatoria: ${esc(r.dedication)}</p>` : ''}
      <div class="req-foot">
        <select class="input" style="width:auto" data-status aria-label="Estado">${Object.entries(STATES).map(([k, l]) => `<option value="${k}"${k === r.status ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <textarea class="input" data-note rows="1" placeholder="Nota interna (seguimiento, presupuesto enviado…)">${esc(r.note || '')}</textarea>
        <button class="btn" data-save>Guardar</button>
      </div>
    </article>`).join('') : '<div class="card empty"><span class="serif">Nada pendiente</span>Las solicitudes de eventos, regalos y contacto aparecerán aquí.</div>'}
  </div>`;

  el.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => navigate('/solicitudes', { type: b.dataset.type, state })));
  el.querySelectorAll('[data-state]').forEach((b) => b.addEventListener('click', () => navigate('/solicitudes', { type, state: b.dataset.state })));
  el.querySelectorAll('.req').forEach((card) => card.querySelector('[data-save]').addEventListener('click', async () => {
    try {
      await api('/api/admin/requests', { method: 'PATCH', body: { id: card.dataset.id, status: card.querySelector('[data-status]').value, note: card.querySelector('[data-note]').value } });
      toast('Solicitud actualizada');
      window.dispatchEvent(new Event('admin:refresh'));
    } catch (err) { toast(err.message, 'error'); }
  }));
  return {};
}
