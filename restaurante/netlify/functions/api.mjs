// API pública: disponibilidad, reservas, lista de espera y solicitudes.

import site from '../../site.config.mjs';
import { getConfig, publicConfig } from '../../lib/config.mjs';
import { dayAvailability, servicesOn, windowFor } from '../../lib/availability.mjs';
import { createBooking, updateBooking, findByCode, getDay, addToWaitlist } from '../../lib/bookings.mjs';
import { createRequest } from '../../lib/requests.mjs';
import { bookingToken, checkBookingToken } from '../../lib/auth.mjs';
import { notifyStaff, manageUrl, fmtDate } from '../../lib/mail.mjs';
import { notifyGuest } from '../../lib/notify.mjs';
import { verifyCaptcha, isHoneypot, rateLimit } from '../../lib/guard.mjs';
import { json, errorResponse, readBody, assertSameOrigin, clientIp, background, HttpError } from '../../lib/http.mjs';
import { isISODate, isMonth, monthDays, localStamp, zonedToUtc, addDays } from '../../lib/time.mjs';

const HOUR = 3600 * 1000;
// La disponibilidad se puede cachear muy poco en la CDN: si una hora se llena
// entre medias, el servidor lo detecta al reservar y lo explica al cliente.
const AVAILABILITY_CACHE = { 'cache-control': 'no-store', 'netlify-cdn-cache-control': 'public, s-maxage=10' };

function publicBooking(b) {
  const { code, date, time, service, party, menu, pairing, name, status, lang, allergies, dietary, occasion, notes } = b;
  return { code, date, time, service, party, menu, pairing, name, status, lang, allergies, dietary, occasion, notes };
}

function cancelInfo(b, cfg, now = new Date()) {
  const start = zonedToUtc(b.date, b.time, cfg.timezone).getTime();
  const canCancel = ['pending', 'confirmed'].includes(b.status) && start > now.getTime();
  const late = canCancel && start - now.getTime() < cfg.booking.cancellationHours * HOUR;
  return { canCancel, late };
}

function parseParty(v, cfg) {
  const n = Number.parseInt(v, 10);
  return Number.isInteger(n) && n >= 1 && n <= cfg.booking.maxParty ? n : cfg.booking.minParty;
}


async function getPublic(cfg) {
  const now = new Date();
  const today = windowFor(cfg, now).today;
  const day = await getDay(today);
  const avail = dayAvailability(cfg, today, day, 2, now);
  // Si hoy ya no hay mesa, se busca la próxima fecha con disponibilidad (2 personas).
  let next = null;
  if (avail.status !== 'open') {
    const win = windowFor(cfg, now);
    const candidates = Array.from({ length: 21 }, (_, i) => addDays(today, i + 1))
      .filter((d) => d <= win.last && servicesOn(cfg, d).length);
    for (let i = 0; i < candidates.length && !next; i += 7) {
      const chunk = candidates.slice(i, i + 7);
      const days = await Promise.all(chunk.map((d) => getDay(d)));
      for (let j = 0; j < chunk.length && !next; j++) {
        const a = dayAvailability(cfg, chunk[j], days[j], 2, now);
        if (a.status === 'open') next = { date: chunk[j], services: a.services.filter((x) => !x.full).map((x) => x.id) };
      }
    }
  }
  return json({
    ok: true,
    site: { name: site.name, phone: site.phone, email: site.email },
    config: publicConfig(cfg),
    now: localStamp(now, cfg.timezone),
    today: {
      date: today,
      status: avail.status,
      services: avail.services.map((s) => ({ id: s.id, label: s.label, full: s.full, few: s.few, first: s.slots[0]?.time, last: s.slots.at(-1)?.time })),
    },
    next,
  }, 200, {
    // Sin datos personales: se puede servir desde la CDN de Netlify unos segundos.
    'cache-control': 'public, max-age=0, must-revalidate',
    'netlify-cdn-cache-control': 'public, s-maxage=30, stale-while-revalidate=120',
  });
}

async function getAvailability(url, cfg) {
  const party = parseParty(url.searchParams.get('party'), cfg);
  const date = url.searchParams.get('date');
  const month = url.searchParams.get('month');
  const now = new Date();
  if (date) {
    if (!isISODate(date)) throw new HttpError(400, 'invalid', 'Fecha no válida.');
    return json({ ok: true, party, ...dayAvailability(cfg, date, await getDay(date), party, now) }, 200, AVAILABILITY_CACHE);
  }
  if (!isMonth(month)) throw new HttpError(400, 'invalid', 'Mes no válido.');
  const win = windowFor(cfg, now);
  const days = await Promise.all(monthDays(month).map(async (d) => {
    // Solo se leen del almacén los días que pueden estar abiertos.
    if (d < win.today || d > win.last || !servicesOn(cfg, d).length) {
      const r = dayAvailability(cfg, d, null, party, now);
      return { date: d, status: r.status };
    }
    const r = dayAvailability(cfg, d, await getDay(d), party, now);
    return { date: d, status: r.status, few: r.services.some((s) => s.few && !s.full) };
  }));
  return json({ ok: true, party, month, days }, 200, AVAILABILITY_CACHE);
}

async function postBooking(req, context, cfg) {
  const body = await readBody(req);
  if (isHoneypot(body)) return json({ ok: true, booking: null });
  const ip = clientIp(req, context);
  await rateLimit(ip, 'booking', 12, HOUR);
  await verifyCaptcha(body.captcha, ip);
  const b = await createBooking(body, { source: 'web' });
  const token = await bookingToken(b.id);
  await background(context, Promise.all([
    notifyGuest(b.status === 'confirmed' ? 'confirmed' : 'pending', b, cfg),
    notifyStaff(`${b.status === 'pending' ? 'Solicitud' : 'Reserva'} · ${b.party} pax · ${fmtDate(b.date)} ${b.time}`, [
      ['Nombre', b.name], ['Teléfono', b.phone], ['Email', b.email], ['Localizador', b.code],
      ['Alergias', b.allergies], ['Notas', b.notes],
    ]),
  ]));
  return json({ ok: true, booking: publicBooking(b), token, manageUrl: manageUrl(b, token) }, 201);
}

async function bookingFromParams(c, t) {
  const b = await findByCode(c);
  if (!b || !(await checkBookingToken(b.id, t))) throw new HttpError(404, 'not_found', 'No encontramos esa reserva.');
  return b;
}

async function getBooking(url, cfg) {
  const b = await bookingFromParams(url.searchParams.get('c'), url.searchParams.get('t'));
  return json({ ok: true, booking: publicBooking(b), ...cancelInfo(b, cfg) });
}

async function cancelBooking(req, context, cfg) {
  const body = await readBody(req);
  const b = await bookingFromParams(body.c, body.t);
  if (!cancelInfo(b, cfg).canCancel) throw new HttpError(409, 'not_cancellable', 'Esta reserva ya no se puede cancelar online. Llámanos, por favor.');
  const updated = await updateBooking(b.date, b.id, { status: 'cancelled' }, { byGuest: true });
  await background(context, Promise.all([
    notifyGuest('cancelled', updated, cfg),
    notifyStaff(`Cancelación · ${updated.party} pax · ${fmtDate(updated.date)} ${updated.time}`, [
      ['Nombre', updated.name], ['Localizador', updated.code], ['Teléfono', updated.phone],
    ]),
  ]));
  return json({ ok: true, booking: publicBooking(updated) });
}

async function lookupBooking(req, context) {
  const body = await readBody(req);
  await rateLimit(clientIp(req, context), 'lookup', 20, HOUR);
  const b = await findByCode(body.code);
  const email = String(body.email || '').trim().toLowerCase();
  if (!b || !email || b.email !== email) throw new HttpError(404, 'not_found', 'No encontramos ninguna reserva con esos datos.');
  return json({ ok: true, c: b.code, t: await bookingToken(b.id) });
}

async function postWaitlist(req, context) {
  const body = await readBody(req);
  if (isHoneypot(body)) return json({ ok: true });
  const ip = clientIp(req, context);
  await rateLimit(ip, 'waitlist', 10, HOUR);
  await verifyCaptcha(body.captcha, ip);
  const w = await addToWaitlist(body);
  await background(context, notifyStaff(`Lista de espera · ${w.party} pax · ${fmtDate(w.date)}`, [
    ['Nombre', w.name], ['Teléfono', w.phone], ['Email', w.email], ['Servicio', w.service], ['Notas', w.notes],
  ]));
  return json({ ok: true }, 201);
}

async function postRequest(req, context) {
  const body = await readBody(req);
  if (isHoneypot(body)) return json({ ok: true });
  const ip = clientIp(req, context);
  await rateLimit(ip, 'request', 10, HOUR);
  await verifyCaptcha(body.captcha, ip);
  const r = await createRequest(body);
  const label = { evento: 'Evento privado', regalo: 'Tarjeta regalo', contacto: 'Contacto' }[r.type];
  await background(context, notifyStaff(`${label} · ${r.name}`, [
    ['Email', r.email], ['Teléfono', r.phone], ['Fecha', r.date], ['Invitados', r.guests], ['Para', r.recipient],
    ['Asunto', r.subject], ['Mensaje', r.message],
  ]));
  return json({ ok: true, id: r.id }, 201);
}

export default async (req, context) => {
  try {
    assertSameOrigin(req);
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const cfg = await getConfig();
    const route = `${req.method} ${path}`;
    switch (route) {
      case 'GET /api/public': return await getPublic(cfg);
      case 'GET /api/availability': return await getAvailability(url, cfg);
      case 'POST /api/bookings': return await postBooking(req, context, cfg);
      case 'GET /api/booking': return await getBooking(url, cfg);
      case 'POST /api/booking/cancel': return await cancelBooking(req, context, cfg);
      case 'POST /api/booking/lookup': return await lookupBooking(req, context);
      case 'POST /api/waitlist': return await postWaitlist(req, context);
      case 'POST /api/requests': return await postRequest(req, context);
      default: return json({ ok: false, error: 'not_found' }, 404);
    }
  } catch (e) {
    return errorResponse(e);
  }
};

export const config = {
  path: ['/api/public', '/api/availability', '/api/bookings', '/api/booking', '/api/booking/*', '/api/waitlist', '/api/requests'],
};
