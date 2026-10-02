// API simulada para la vista previa estática. Reutiliza el motor real de
// disponibilidad (lib/availability.mjs) y guarda los datos en localStorage.

import { DEFAULT_CONFIG } from '../lib/defaults.mjs';
import { dayAvailability, assertBookable, servicesOn, windowFor } from '../lib/availability.mjs';
import { localStamp, addDays, isISODate, isMonth, monthDays, zonedToUtc, weekday } from '../lib/time.mjs';

const cfg = { ...structuredClone(DEFAULT_CONFIG), timezone: 'Europe/Madrid' };
const KEY = 'restaurant-preview-v1';
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
let db = null;

const rand = (n, a = ALPHABET) => Array.from(crypto.getRandomValues(new Uint32Array(n)), (x) => a[x % a.length]).join('');

// Ocupación de ejemplo para que el calendario muestre días con pocas mesas o completos.
function seed() {
  const days = {};
  const today = windowFor(cfg).today;
  for (let i = 0; i <= 45; i++) {
    const date = addDays(today, i);
    const open = servicesOn(cfg, date);
    if (!open.length) continue;
    const wd = weekday(date);
    const bookings = [];
    for (const s of open) {
      let target = (i * 7 + s.slots.length * 3) % 15;
      if (wd === 6 && s.id === 'cena' && i < 20) target = s.capacity; // sábados noche, completos
      if (wd === 0 && s.id === 'comida') target = s.capacity - 4; // domingos, últimas mesas
      let slot = 0;
      while (target > 0) {
        const party = Math.min(target, target >= 4 && i % 2 ? 4 : 2);
        const time = s.slots[slot % s.slots.length];
        const used = bookings.filter((b) => b.service === s.id && b.time === time).reduce((n, b) => n + b.party, 0);
        if (used + party <= s.slotCapacity) {
          bookings.push({ id: rand(12), code: rand(6), service: s.id, time, party, status: 'confirmed', demo: true });
          target -= party;
        }
        slot++;
        if (slot > 60) break;
      }
    }
    days[date] = { bookings, waitlist: [] };
  }
  return { days, requests: [] };
}

function load() {
  if (db) return db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
  if (!db || !db.days) db = seed();
  return db;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* sin almacenamiento: queda en memoria */ }
}
const day = (date) => (load().days[date] ||= { bookings: [], waitlist: [] });

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
function fail(status, error, message, field) {
  return reply({ ok: false, error, message, ...(field ? { field } : {}) }, status);
}

function routes() {
  try { return JSON.parse(document.getElementById('i18n').textContent).routes; } catch { return {}; }
}

function publicBooking(b) {
  const { code, date, time, service, party, menu, pairing, name, status, lang, allergies, dietary, occasion, notes } = b;
  return { code, date, time, service, party, menu, pairing, name, status, lang, allergies, dietary, occasion, notes };
}

function find(code) {
  for (const [date, d] of Object.entries(load().days)) {
    const b = d.bookings.find((x) => x.code === String(code || '').toUpperCase() && !x.demo);
    if (b) return { b, date };
  }
  return null;
}

function cancelInfo(b) {
  const start = zonedToUtc(b.date, b.time, cfg.timezone).getTime();
  const canCancel = ['pending', 'confirmed'].includes(b.status) && start > Date.now();
  return { canCancel, late: canCancel && start - Date.now() < cfg.booking.cancellationHours * 3600000 };
}

function validContact(body) {
  if (String(body.name || '').trim().length < 2) return ['name', 'Indica tu nombre.'];
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(body.email || '').trim())) return ['email', 'El email no parece válido.'];
  if (String(body.phone || '').replace(/\D/g, '').length < 9) return ['phone', 'El teléfono no parece válido.'];
  if (!body.consentPrivacy) return ['consentPrivacy', 'Debes aceptar la política de privacidad.'];
  return null;
}

export async function handle(input, init) {
  const url = new URL(input, 'https://preview.local');
  const method = (init.method || 'GET').toUpperCase();
  let body = {};
  try { body = init.body ? JSON.parse(init.body) : {}; } catch { /* vacío */ }
  const now = new Date();
  const route = `${method} ${url.pathname.replace(/\/+$/, '')}`;
  const pub = {
    timezone: cfg.timezone,
    booking: (({ minParty, maxParty, windowDays, cancellationHours, requireMenuChoice, waitlist, autoConfirm }) =>
      ({ minParty, maxParty, windowDays, cancellationHours, requireMenuChoice, waitlist, autoConfirm }))(cfg.booking),
    services: cfg.services.map((s) => ({ id: s.id, label: s.label, days: s.days, slots: s.slots, duration: s.duration })),
    menus: cfg.menus.filter((m) => m.active),
    sms: true,
    turnstileSiteKey: null,
  };

  switch (route) {
    case 'GET /api/public': {
      const today = windowFor(cfg, now).today;
      const avail = dayAvailability(cfg, today, day(today), 2, now);
      let next = null;
      for (let i = 1; i <= 21 && !next && avail.status !== 'open'; i++) {
        const d = addDays(today, i);
        const a = dayAvailability(cfg, d, day(d), 2, now);
        if (a.status === 'open') next = { date: d, services: a.services.filter((s) => !s.full).map((s) => s.id) };
      }
      return reply({
        ok: true, config: pub, now: localStamp(now, cfg.timezone), next,
        today: { date: today, status: avail.status, services: avail.services.map((s) => ({ id: s.id, label: s.label, full: s.full, few: s.few })) },
      });
    }
    case 'GET /api/availability': {
      const party = Math.min(Math.max(Number.parseInt(url.searchParams.get('party'), 10) || 2, 1), cfg.booking.maxParty);
      const date = url.searchParams.get('date');
      const month = url.searchParams.get('month');
      if (date && isISODate(date)) return reply({ ok: true, party, ...dayAvailability(cfg, date, day(date), party, now) });
      if (!isMonth(month)) return fail(400, 'invalid', 'Mes no válido.');
      return reply({
        ok: true, party, month,
        days: monthDays(month).map((d) => {
          const r = dayAvailability(cfg, d, day(d), party, now);
          return { date: d, status: r.status, few: r.services.some((s) => s.few && !s.full) };
        }),
      });
    }
    case 'POST /api/bookings': {
      const bad = validContact(body);
      if (bad) return fail(400, 'invalid', bad[1], bad[0]);
      const b = {
        id: rand(16), code: rand(6), token: rand(24, 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'),
        date: body.date, service: body.service, time: body.time, party: Number(body.party),
        menu: body.menu || '', pairing: body.pairing || '', name: String(body.name).trim(), email: body.email, phone: body.phone,
        lang: body.lang, allergies: body.allergies || '', dietary: body.dietary || [], occasion: body.occasion || '', notes: body.notes || '',
        status: cfg.booking.autoConfirm ? 'confirmed' : 'pending', createdAt: now.toISOString(),
      };
      const d = day(b.date);
      try {
        assertBookable(cfg, d, b, now);
      } catch (e) {
        return fail(e.status || 400, e.code || 'invalid', e.message);
      }
      d.bookings.push(b);
      load().days[b.date] = d;
      save();
      return reply({ ok: true, booking: publicBooking(b), token: b.token, manageUrl: `${routes().manage || ''}?c=${b.code}&t=${b.token}` }, 201);
    }
    case 'GET /api/booking': {
      const f = find(url.searchParams.get('c'));
      if (!f || f.b.token !== url.searchParams.get('t')) return fail(404, 'not_found', 'No encontramos esa reserva.');
      return reply({ ok: true, booking: publicBooking(f.b), ...cancelInfo(f.b) });
    }
    case 'POST /api/booking/cancel': {
      const f = find(body.c);
      if (!f || f.b.token !== body.t) return fail(404, 'not_found', 'No encontramos esa reserva.');
      if (!cancelInfo(f.b).canCancel) return fail(409, 'not_cancellable', 'Esta reserva ya no se puede cancelar online.');
      f.b.status = 'cancelled';
      save();
      return reply({ ok: true, booking: publicBooking(f.b) });
    }
    case 'POST /api/booking/lookup': {
      const f = find(body.code);
      if (!f || f.b.email.toLowerCase() !== String(body.email || '').trim().toLowerCase()) return fail(404, 'not_found', 'No encontramos ninguna reserva con esos datos.');
      return reply({ ok: true, c: f.b.code, t: f.b.token });
    }
    case 'POST /api/waitlist':
    case 'POST /api/requests': {
      const bad = validContact({ ...body, phone: body.phone || '000000000' });
      if (bad) return fail(400, 'invalid', bad[1], bad[0]);
      if (route.endsWith('waitlist')) day(body.date).waitlist.push({ ...body, createdAt: now.toISOString() });
      else load().requests.push({ ...body, createdAt: now.toISOString() });
      save();
      return reply({ ok: true }, 201);
    }
    default:
      return fail(404, 'not_found', 'No disponible en la vista previa.');
  }
}
