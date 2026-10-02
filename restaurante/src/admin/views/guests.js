// Vista «Clientes»: fichas con historial, etiquetas (VIP, prensa…) y notas,
// y supresión de datos a petición del cliente (RGPD).

import { ctx, api, esc, icon, navigate, openDrawer, closeDrawer, toast, ask, refresh, fmtShort, cap, statusPill, serviceLabel } from '../core.js';

const SUGGESTED = ['VIP', 'Habitual', 'Prensa', 'Amistad', 'Profesional', 'Celíaco', 'Mesa ventana'];

function openGuest(g) {
  const s = g.stats;
  openDrawer(g.name || g.key, `
    <div class="kpis" style="margin:0">
      <div class="card kpi"><p class="section-label">Visitas</p><p class="kpi-n num">${s.visits}</p></div>
      <div class="card kpi"><p class="section-label">Próximas</p><p class="kpi-n num">${s.upcoming}</p></div>
      <div class="card kpi"><p class="section-label">No-shows</p><p class="kpi-n num" style="${s.noShows ? 'color:var(--danger)' : ''}">${s.noShows}</p></div>
    </div>
    <p>${g.phone ? `<a href="tel:${esc(g.phone)}">${esc(g.phone)}</a>` : ''}${g.phone && g.email ? ' · ' : ''}${g.email ? `<a href="mailto:${esc(g.email)}">${esc(g.email)}</a>` : ''}<br>
      <span class="muted">Idioma: ${esc({ va: 'valencià', es: 'castellano', en: 'inglés' }[g.lang] || g.lang || '—')}${g.marketing ? ' · acepta comunicaciones' : ''}</span></p>
    ${g.allergies || g.dietary?.length ? `<p class="notice notice-danger">${icon('alert')} ${esc([g.allergies, ...(g.dietary || [])].filter(Boolean).join(' · '))}</p>` : ''}
    <form class="bf" data-guest-form>
      <label class="f"><span>Etiquetas (separadas por comas)</span><input name="tags" value="${esc((g.tags || []).join(', '))}" list="tag-suggest"></label>
      <datalist id="tag-suggest">${SUGGESTED.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
      <div class="chips">${SUGGESTED.map((t) => `<button type="button" class="btn btn-sm" data-add-tag="${esc(t)}">+ ${esc(t)}</button>`).join('')}</div>
      <label class="f"><span>Notas internas de la ficha</span><textarea name="notes" rows="3" placeholder="Preferencias, ocasiones, detalles a recordar…">${esc(g.notes || '')}</textarea></label>
      <div class="form-actions"><button class="btn btn-primary">Guardar ficha</button></div>
    </form>
    <div><p class="section-label">Reservas</p>
      <ul class="history">${g.refs.map((r) => `<li><span class="muted">${esc(cap(fmtShort(r.date)))} · ${esc(r.time)}</span><span>${r.party} pax · ${esc(serviceLabel(r.service))} · ${statusPill(r.status)} <a href="#/servicio?date=${r.date}" data-close-drawer>ver día</a></span></li>`).join('')}</ul>
    </div>
    ${ctx.me.role === 'admin' ? `<div class="notice"><p><strong>Protección de datos.</strong> Si el cliente lo pide, puedes eliminar sus datos personales: se borra la ficha y se anonimizan sus reservas, listas de espera y solicitudes.</p>
      <p style="margin-top:10px"><button type="button" class="btn btn-danger" data-erase>Eliminar datos del cliente</button></p></div>` : ''}`,
  (body) => {
    const form = body.querySelector('[data-guest-form]');
    body.querySelectorAll('[data-add-tag]').forEach((b) => b.addEventListener('click', () => {
      const tags = form.tags.value.split(',').map((x) => x.trim()).filter(Boolean);
      if (!tags.includes(b.dataset.addTag)) tags.push(b.dataset.addTag);
      form.tags.value = tags.join(', ');
    }));
    body.querySelectorAll('[data-close-drawer]').forEach((a) => a.addEventListener('click', () => closeDrawer()));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api('/api/admin/guests', { method: 'PATCH', body: { key: g.key, tags: form.tags.value.split(',').map((x) => x.trim()).filter(Boolean), notes: form.notes.value } });
        toast('Ficha guardada');
        closeDrawer();
        refresh();
      } catch (err) { toast(err.message, 'error'); }
    });
    body.querySelector('[data-erase]')?.addEventListener('click', async () => {
      const r = await ask(`¿Eliminar definitivamente los datos personales de ${g.name}? No se puede deshacer.`, { confirm: 'Eliminar datos', danger: true });
      if (!r.ok) return;
      try {
        await api(`/api/admin/guests?key=${encodeURIComponent(g.key)}`, { method: 'DELETE' });
        toast('Datos eliminados');
        closeDrawer();
        refresh();
      } catch (err) { toast(err.message, 'error'); }
    });
  });
}

export async function render(el, params) {
  const q = (params.q || '').trim();
  el.innerHTML = `
  <div class="topbar">
    <h1 class="page-title"><small>Clientes</small>Fichas</h1>
    <form class="toolbar" data-search><label class="search"><span class="sr-only">Buscar</span>${icon('search')}<input class="input" name="q" value="${esc(q)}" placeholder="Nombre, email, teléfono o etiqueta"></label><button class="btn">Buscar</button></form>
  </div>
  <div class="card" data-list><p class="loading">Cargando…</p></div>`;
  el.querySelector('[data-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    navigate('/clientes', { q: e.target.q.value.trim() });
  });
  const { guests } = await api(`/api/admin/guests?q=${encodeURIComponent(q)}`);
  const box = el.querySelector('[data-list]');
  box.innerHTML = guests.length ? `<div class="table-wrap"><table class="list">
    <thead><tr><th>Nombre</th><th>Contacto</th><th>Visitas</th><th>Próximas</th><th>No-shows</th><th>Última visita</th><th>Etiquetas</th></tr></thead>
    <tbody>${guests.map((g) => `<tr data-key="${esc(g.key)}" tabindex="0">
      <td><strong>${esc(g.name)}</strong>${g.allergies || g.dietary?.length ? ` <span class="tag tag-danger">${icon('alert')}</span>` : ''}</td>
      <td>${esc(g.phone || '')}<br><span class="muted">${esc(g.email || '')}</span></td>
      <td class="num">${g.stats.visits}</td><td class="num">${g.stats.upcoming}</td>
      <td class="num">${g.stats.noShows ? `<span class="tag tag-danger">${g.stats.noShows}</span>` : '0'}</td>
      <td>${g.stats.lastVisit ? esc(cap(fmtShort(g.stats.lastVisit))) : '—'}</td>
      <td>${(g.tags || []).map((t) => `<span class="tag ${/vip/i.test(t) ? 'tag-vip' : ''}">${esc(t)}</span>`).join(' ')}</td>
    </tr>`).join('')}</tbody></table></div>` : '<div class="empty"><span class="serif">Sin clientes</span>Las fichas se crean solas con cada reserva.</div>';
  const open = (key) => openGuest(guests.find((g) => g.key === key));
  box.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-key]'); if (tr) open(tr.dataset.key); });
  box.addEventListener('keydown', (e) => { const tr = e.target.closest('tr[data-key]'); if (tr && e.key === 'Enter') open(tr.dataset.key); });
  if (q && guests.length === 1) open(guests[0].key);
  return {};
}
