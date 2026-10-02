// «Gestionar mi reserva»: ver los datos y cancelar con el enlace del email,
// o recuperar ese enlace con localizador + email.

import { i18n, api, getPublic, fmt, formData, validate, setBusy, setStatus, showApiError, liveClear } from './api.mjs';
import { esc, fmtDate } from './render.mjs';

const M = i18n.manage;
const lang = i18n.lang;
const root = document.querySelector('[data-manage]');
const view = root.querySelector('[data-manage-view]');
const lookup = root.querySelector('[data-lookup]');
liveClear(lookup);
const params = new URLSearchParams(location.search);
const c = params.get('c');
const t = params.get('t');

function people(n) {
  return `${n} ${n === 1 ? i18n.booking.sentence.one : i18n.booking.sentence.other}`;
}

async function render(data) {
  const b = data.booking;
  let menus = [];
  let hours = 48;
  try {
    const { config } = await getPublic();
    menus = config.menus;
    hours = config.booking.cancellationHours;
  } catch { /* datos genéricos */ }
  const menu = menus.find((m) => m.id === b.menu);
  const status = root.querySelector('[data-manage-status]');
  status.textContent = M.status[b.status] || b.status;
  status.dataset.status = b.status;
  const rows = [
    [M.details.name, b.name],
    [M.details.date, fmtDate(b.date, lang)],
    [M.details.time, b.time],
    [M.details.party, people(b.party)],
    ...(menu ? [[M.details.menu, menu.name[lang] || menu.name.es]] : []),
    [M.code, b.code],
    ...(b.allergies ? [[M.details.allergies, b.allergies]] : []),
  ];
  root.querySelector('[data-manage-details]').innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  const note = root.querySelector('[data-manage-note]');
  const actions = root.querySelector('[data-manage-actions]');
  actions.hidden = !data.canCancel;
  if (!data.canCancel) note.textContent = b.status === 'cancelled' ? M.cancelled : M.cannotCancel;
  else if (data.late) note.textContent = fmt(M.cancelLate, { h: hours });
  else note.textContent = M.change;
  view.hidden = false;
}

if (c && t) {
  api(`/api/booking?c=${encodeURIComponent(c)}&t=${encodeURIComponent(t)}`)
    .then(render)
    .catch(() => {
      lookup.hidden = false;
      setStatus(lookup, M.notFound, 'error');
    });
} else {
  lookup.hidden = false;
}

root.querySelector('[data-cancel]').addEventListener('click', async (e) => {
  if (!confirm(M.cancelConfirm)) return;
  const button = e.currentTarget;
  button.disabled = true;
  try {
    const data = await api('/api/booking/cancel', { method: 'POST', body: { c, t } });
    await render({ booking: data.booking, canCancel: false });
    setStatus(view, M.cancelled, 'ok');
  } catch (err) {
    setStatus(view, err.message, 'error');
  } finally {
    button.disabled = false;
  }
});

lookup.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate(lookup)) return;
  const button = lookup.querySelector('button[type=submit]');
  setBusy(button, true);
  try {
    const data = await api('/api/booking/lookup', { method: 'POST', body: formData(lookup) });
    location.search = `?c=${encodeURIComponent(data.c)}&t=${encodeURIComponent(data.t)}`;
  } catch (err) {
    if (err.status === 404) setStatus(lookup, M.notFound, 'error');
    else showApiError(lookup, err);
  } finally {
    setBusy(button, false);
  }
});
