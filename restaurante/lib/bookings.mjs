// Operaciones sobre reservas, lista de espera y fichas de cliente.
//
// Almacenamiento:
//   days/YYYY-MM-DD  → { bookings: [...], waitlist: [...] }
//   codes/XXXXXX     → { date, id }       (localizador → reserva)
//   guests           → { [clave]: ficha }  (clave = email o tel:+34…)

import { randomUUID, randomInt } from 'node:crypto';
import { getConfig } from './config.mjs';
import { assertBookable } from './availability.mjs';
import { ACTIVE_STATUSES, STATUSES, OCCASIONS, DIETARY } from './defaults.mjs';
import { getStore, readJSON, update } from './store.mjs';
import { HttpError } from './http.mjs';
import { addDays, daysBetween, isISODate, isTime } from './time.mjs';
import { clean, cleanText, isEmail, normalizePhone, lang as cleanLang } from './validate.mjs';

const EMPTY_DAY = { bookings: [], waitlist: [] };
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const dayKey = (date) => `days/${date}`;

export async function getDay(date) {
  return readJSON(dayKey(date), structuredClone(EMPTY_DAY));
}

export async function getRange(from, to) {
  const n = daysBetween(from, to);
  if (n < 0 || n > 400) throw new HttpError(400, 'range', 'Rango de fechas no válido (máximo 400 días).');
  const dates = Array.from({ length: n + 1 }, (_, i) => addDays(from, i));
  const out = [];
  for (let i = 0; i < dates.length; i += 25) {
    const chunk = dates.slice(i, i + 25);
    out.push(...(await Promise.all(chunk.map(async (date) => ({ date, ...(await getDay(date)) })))));
  }
  return out;
}

function newCode() {
  let s = '';
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

async function reserveCode(date, id) {
  const store = await getStore();
  for (let i = 0; i < 8; i++) {
    const code = newCode();
    if (await store.setJSON(`codes/${code}`, { date, id }, { onlyIfNew: true })) return code;
  }
  throw new HttpError(500, 'code', 'No se pudo generar el localizador.');
}

export function guestKey(b) {
  if (b.email) return b.email.toLowerCase();
  if (b.phone) return 'tel:' + b.phone;
  return null;
}

/** Normaliza los datos de una reserva que llegan de la web o del panel. */
export function normalizeBooking(input, cfg, { staff = false } = {}) {
  const date = String(input.date || '');
  const time = String(input.time || '');
  if (!isISODate(date)) throw new HttpError(400, 'invalid', 'Fecha no válida.', { field: 'date' });
  if (!isTime(time)) throw new HttpError(400, 'invalid', 'Hora no válida.', { field: 'time' });
  const party = Number.parseInt(input.party, 10);
  if (!Number.isInteger(party) || party < 1 || party > 200) throw new HttpError(400, 'invalid', 'Número de comensales no válido.', { field: 'party' });
  const name = clean(input.name, 80);
  if (name.length < 2) throw new HttpError(400, 'invalid', 'Indica tu nombre.', { field: 'name' });
  const email = clean(input.email, 254).toLowerCase();
  if (email && !isEmail(email)) throw new HttpError(400, 'invalid', 'El email no parece válido.', { field: 'email' });
  const phone = normalizePhone(input.phone);
  if (phone === null) throw new HttpError(400, 'invalid', 'El teléfono no parece válido.', { field: 'phone' });
  if (!staff) {
    if (!email) throw new HttpError(400, 'invalid', 'Necesitamos un email para enviarte la confirmación.', { field: 'email' });
    if (!phone) throw new HttpError(400, 'invalid', 'Necesitamos un teléfono de contacto.', { field: 'phone' });
  }
  const menus = cfg.menus.filter((m) => m.active || staff);
  let menu = clean(input.menu, 40);
  if (menu && !menus.some((m) => m.id === menu)) menu = '';
  if (!menu && cfg.booking.requireMenuChoice && !staff) throw new HttpError(400, 'invalid', 'Elige un menú.', { field: 'menu' });
  const menuObj = menus.find((m) => m.id === menu);
  let pairing = clean(input.pairing, 40);
  if (!menuObj || !menuObj.pairing.some((p) => p.id === pairing)) pairing = '';

  return {
    date, time, party,
    service: clean(input.service, 40),
    menu, pairing, name, email, phone,
    lang: cleanLang(input.lang),
    occasion: OCCASIONS.includes(input.occasion) ? input.occasion : '',
    dietary: Array.isArray(input.dietary) ? [...new Set(input.dietary.filter((d) => DIETARY.includes(d)))] : [],
    allergies: cleanText(input.allergies, 500),
    notes: cleanText(input.notes, 800),
    consent: { privacy: Boolean(input.consentPrivacy) || staff, marketing: Boolean(input.consentMarketing) },
  };
}

export async function createBooking(input, { actor = null, source = 'web', override = false, now = new Date() } = {}) {
  const cfg = await getConfig();
  const staff = Boolean(actor);
  const data = normalizeBooking(input, cfg, { staff });
  if (!staff && !data.consent.privacy) throw new HttpError(400, 'invalid', 'Debes aceptar la política de privacidad.', { field: 'consentPrivacy' });

  const id = randomUUID();
  const code = await reserveCode(data.date, id);
  const at = new Date().toISOString();
  const status = staff
    ? (STATUSES.includes(input.status) ? input.status : 'confirmed')
    : (cfg.booking.autoConfirm ? 'confirmed' : 'pending');
  const booking = {
    id, code, ...data, status, source: staff ? (['phone', 'walkin', 'email', 'admin'].includes(source) ? source : 'admin') : 'web',
    table: staff ? clean(input.table, 20) : '',
    internalNotes: staff ? cleanText(input.internalNotes, 800) : '',
    createdAt: at, updatedAt: at,
    history: [{ at, by: actor ? actor.name : 'web', action: 'created', detail: status }],
  };

  try {
    await update(dayKey(data.date), (day) => {
      assertBookable(cfg, day, data, now, { staff, override: staff && override });
      if (!staff) {
        const dup = day.bookings.find((b) => ACTIVE_STATUSES.has(b.status) && b.service === data.service &&
          ((b.email && b.email === data.email) || (b.phone && b.phone === data.phone)));
        if (dup) throw new HttpError(409, 'duplicate', 'Ya tienes una reserva para ese servicio. Puedes gestionarla desde el email de confirmación.');
      }
      day.bookings.push(booking);
      return day;
    }, EMPTY_DAY);
  } catch (e) {
    const store = await getStore();
    await store.delete(`codes/${code}`).catch(() => {});
    throw e;
  }

  await syncGuest(booking).catch((e) => console.error('guest sync', e));
  return booking;
}

const EDITABLE = ['time', 'service', 'party', 'menu', 'pairing', 'name', 'email', 'phone', 'allergies', 'notes',
  'internalNotes', 'table', 'occasion', 'dietary', 'lang'];

/**
 * Modifica una reserva. `patch` puede incluir `date` para moverla de día y
 * `status` para cambiar su estado. El aforo se vuelve a comprobar salvo que el
 * equipo marque `override`.
 */
export async function updateBooking(date, id, patch, { actor, override = false, now = new Date(), byGuest = false } = {}) {
  const cfg = await getConfig();
  const at = new Date().toISOString();
  const day = await getDay(date);
  const current = day.bookings.find((b) => b.id === id);
  if (!current) throw new HttpError(404, 'not_found', 'Reserva no encontrada.');

  const merged = { ...current };
  for (const k of EDITABLE) if (patch[k] !== undefined) merged[k] = patch[k];
  if (patch.date !== undefined) merged.date = patch.date;
  // Al modificar se validan formatos, no se exigen datos que la reserva no
  // tenía (p. ej. una reserva telefónica sin email que se cancela desde el SMS).
  const norm = normalizeBooking({ ...merged, consentPrivacy: true }, cfg, { staff: true });
  const next = {
    ...current, ...norm,
    consent: current.consent,
    table: clean(merged.table, 20),
    internalNotes: cleanText(merged.internalNotes, 800),
    updatedAt: at,
  };
  if (patch.status !== undefined) {
    if (!STATUSES.includes(patch.status)) throw new HttpError(400, 'invalid', 'Estado no válido.');
    next.status = patch.status;
  }

  const changes = [];
  for (const k of ['date', 'time', 'service', 'party', 'status', 'menu', 'table']) {
    if (String(current[k]) !== String(next[k])) changes.push(`${k}: ${current[k] || '—'} → ${next[k] || '—'}`);
  }
  next.history = [...(current.history || []), { at, by: actor ? actor.name : 'cliente', action: 'updated', detail: changes.join(' · ') || 'datos' }].slice(-40);

  const slotChanged = next.date !== current.date || next.time !== current.time || next.service !== current.service ||
    next.party > current.party || (!ACTIVE_STATUSES.has(current.status) && ACTIVE_STATUSES.has(next.status));
  const mustCheck = slotChanged && ACTIVE_STATUSES.has(next.status) && !(override && actor);

  if (next.date === current.date) {
    await update(dayKey(date), (d) => {
      const i = d.bookings.findIndex((b) => b.id === id);
      if (i < 0) throw new HttpError(404, 'not_found', 'Reserva no encontrada.');
      if (mustCheck) {
        const others = { ...d, bookings: d.bookings.filter((b) => b.id !== id) };
        assertBookable(cfg, others, next, now, { staff: !byGuest });
      }
      d.bookings[i] = next;
      return d;
    }, EMPTY_DAY);
  } else {
    // Mover de día: primero se inserta en el nuevo (si no cabe, no se toca nada).
    await update(dayKey(next.date), (d) => {
      if (mustCheck) assertBookable(cfg, d, next, now, { staff: !byGuest });
      d.bookings = d.bookings.filter((b) => b.id !== id);
      d.bookings.push(next);
      return d;
    }, EMPTY_DAY);
    await update(dayKey(date), (d) => {
      d.bookings = d.bookings.filter((b) => b.id !== id);
      return d;
    }, EMPTY_DAY);
    const store = await getStore();
    await store.setJSON(`codes/${next.code}`, { date: next.date, id });
  }

  await syncGuest(next, current).catch((e) => console.error('guest sync', e));
  return next;
}

/** Anota en la reserva los avisos enviados (email / SMS) para verlos en el panel. */
export async function recordNotifications(date, id, entries, extra = {}) {
  if (!entries.length && !Object.keys(extra).length) return;
  await update(dayKey(date), (d) => {
    const b = d.bookings.find((x) => x.id === id);
    if (!b) return undefined;
    b.notifications = [...(b.notifications || []), ...entries].slice(-20);
    Object.assign(b, extra);
    return d;
  }, EMPTY_DAY);
}

export async function findByCode(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 6) return null;
  const ref = await readJSON(`codes/${code}`);
  if (!ref) return null;
  const day = await getDay(ref.date);
  return day.bookings.find((b) => b.id === ref.id) || null;
}

// ── Lista de espera ─────────────────────────────────────────────────────

export async function addToWaitlist(input) {
  const cfg = await getConfig();
  if (!cfg.booking.waitlist) throw new HttpError(400, 'disabled', 'La lista de espera no está activa.');
  const date = String(input.date || '');
  if (!isISODate(date)) throw new HttpError(400, 'invalid', 'Fecha no válida.');
  const party = Number.parseInt(input.party, 10);
  if (!Number.isInteger(party) || party < 1 || party > cfg.booking.maxParty) throw new HttpError(400, 'invalid', 'Número de comensales no válido.');
  const name = clean(input.name, 80);
  const email = clean(input.email, 254).toLowerCase();
  const phone = normalizePhone(input.phone);
  if (name.length < 2) throw new HttpError(400, 'invalid', 'Indica tu nombre.', { field: 'name' });
  if (!isEmail(email)) throw new HttpError(400, 'invalid', 'El email no parece válido.', { field: 'email' });
  if (!phone) throw new HttpError(400, 'invalid', 'El teléfono no parece válido.', { field: 'phone' });
  if (!input.consentPrivacy) throw new HttpError(400, 'invalid', 'Debes aceptar la política de privacidad.', { field: 'consentPrivacy' });
  const service = cfg.services.some((s) => s.id === input.service) ? input.service : 'any';
  const entry = {
    id: randomUUID(), date, service, party, name, email, phone,
    lang: cleanLang(input.lang), notes: cleanText(input.notes, 400),
    status: 'waiting', createdAt: new Date().toISOString(),
  };
  await update(dayKey(date), (d) => {
    d.waitlist = d.waitlist || [];
    if (d.waitlist.some((w) => w.status === 'waiting' && w.email === email && w.service === service)) {
      throw new HttpError(409, 'duplicate', 'Ya estás en la lista de espera para ese día.');
    }
    d.waitlist.push(entry);
    return d;
  }, EMPTY_DAY);
  return entry;
}

export async function updateWaitlist(date, id, status) {
  if (!['waiting', 'contacted', 'booked', 'dismissed'].includes(status)) throw new HttpError(400, 'invalid', 'Estado no válido.');
  let found;
  await update(dayKey(date), (d) => {
    found = (d.waitlist || []).find((w) => w.id === id);
    if (!found) throw new HttpError(404, 'not_found', 'Entrada no encontrada.');
    found.status = status;
    found.updatedAt = new Date().toISOString();
    return d;
  }, EMPTY_DAY);
  return found;
}

// ── Fichas de cliente ───────────────────────────────────────────────────

function refOf(b) {
  return { date: b.date, id: b.id, code: b.code, time: b.time, service: b.service, party: b.party, status: b.status };
}

export async function syncGuest(booking, previous) {
  const key = guestKey(booking);
  const prevKey = previous ? guestKey(previous) : null;
  if (!key && !prevKey) return;
  await update('guests', (guests) => {
    if (prevKey && prevKey !== key && guests[prevKey]) {
      guests[prevKey].refs = guests[prevKey].refs.filter((r) => r.id !== booking.id);
    }
    if (!key) return guests;
    const g = guests[key] || { key, createdAt: new Date().toISOString(), refs: [], tags: [], notes: '' };
    g.name = booking.name;
    if (booking.email) g.email = booking.email;
    if (booking.phone) g.phone = booking.phone;
    g.lang = booking.lang;
    if (booking.allergies) g.allergies = booking.allergies;
    if (booking.dietary?.length) g.dietary = booking.dietary;
    if (booking.consent?.marketing) g.marketing = true;
    g.refs = [refOf(booking), ...g.refs.filter((r) => r.id !== booking.id)]
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
      .slice(0, 200);
    g.updatedAt = new Date().toISOString();
    guests[key] = g;
    return guests;
  }, {});
}

export function guestStats(g, today) {
  const refs = g?.refs || [];
  return {
    visits: refs.filter((r) => r.status === 'completed' || r.status === 'seated' || (r.status === 'confirmed' && r.date < today)).length,
    noShows: refs.filter((r) => r.status === 'no_show').length,
    cancellations: refs.filter((r) => r.status === 'cancelled').length,
    upcoming: refs.filter((r) => r.date >= today && ACTIVE_STATUSES.has(r.status)).length,
    lastVisit: refs.find((r) => r.date < today && ACTIVE_STATUSES.has(r.status))?.date || null,
  };
}

export async function getGuests() {
  return readJSON('guests', {});
}

export async function updateGuest(key, { tags, notes }) {
  let out;
  await update('guests', (guests) => {
    const g = guests[key];
    if (!g) throw new HttpError(404, 'not_found', 'Cliente no encontrado.');
    if (Array.isArray(tags)) g.tags = [...new Set(tags.map((t) => clean(t, 24)).filter(Boolean))].slice(0, 12);
    if (notes !== undefined) g.notes = cleanText(notes, 1000);
    g.updatedAt = new Date().toISOString();
    out = g;
    return guests;
  }, {});
  return out;
}

// ── Protección de datos ────────────────────────────────────────────────

const ANON = { name: 'Datos eliminados', email: '', phone: '', allergies: '', notes: '', internalNotes: '', dietary: [], occasion: '', notifications: [] };

/**
 * Derecho de supresión (RGPD art. 17): borra la ficha y anonimiza sus reservas,
 * entradas de lista de espera y solicitudes. Las cifras (fecha, comensales,
 * estado) se conservan para las estadísticas sin identificar a nadie.
 */
export async function eraseGuest(key) {
  const guests = await getGuests();
  const g = guests[key];
  if (!g) throw new HttpError(404, 'not_found', 'Cliente no encontrado.');
  const byDate = new Map();
  for (const r of g.refs) byDate.set(r.date, [...(byDate.get(r.date) || []), r.id]);
  const matches = (x) => (g.email && x.email === g.email) || (g.phone && x.phone === g.phone);
  for (const [date, ids] of byDate) {
    await update(dayKey(date), (d) => {
      for (const b of d.bookings) if (ids.includes(b.id) || matches(b)) Object.assign(b, ANON, { anonymized: true });
      for (const w of d.waitlist || []) if (matches(w)) Object.assign(w, { name: 'Datos eliminados', email: '', phone: '', notes: '', anonymized: true });
      return d;
    }, EMPTY_DAY);
  }
  await update('requests', (list) => list.map((r) => (matches(r)
    ? { ...r, name: 'Datos eliminados', email: '', phone: '', message: '', recipient: '', recipientEmail: '', dedication: '', company: '', anonymized: true }
    : r)), []);
  await update('guests', (gs) => { delete gs[key]; return gs; }, {});
  return { bookings: g.refs.length };
}

/** Borra fichas sin actividad desde hace más de `days` días (política de privacidad). */
export async function purgeInactiveGuests(today, days = 730) {
  const limit = addDays(today, -days);
  let removed = 0;
  await update('guests', (gs) => {
    for (const [k, g] of Object.entries(gs)) {
      const last = g.refs[0]?.date || (g.createdAt || '').slice(0, 10);
      if (last && last < limit) { delete gs[k]; removed++; }
    }
    return removed ? gs : undefined;
  }, {});
  return removed;
}

