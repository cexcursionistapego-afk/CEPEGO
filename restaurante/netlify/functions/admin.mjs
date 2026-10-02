// API del panel de gestión (/admin). Todas las rutas salvo /login exigen sesión.

import { getConfig, saveConfig } from '../../lib/config.mjs';
import { dayAvailability, occupancy, servicesOn, closureFor, windowFor } from '../../lib/availability.mjs';
import {
  getDay, getRange, createBooking, updateBooking, findByCode, updateWaitlist,
  getGuests, updateGuest, guestKey, guestStats, eraseGuest,
} from '../../lib/bookings.mjs';
import { listRequests, updateRequest } from '../../lib/requests.mjs';
import {
  login, logoutCookie, requireUser, listUsers, createUser, deleteUser, changePassword, bookingToken,
} from '../../lib/auth.mjs';
import { configured as mailConfigured, manageUrl } from '../../lib/mail.mjs';
import { smsConfigured } from '../../lib/sms.mjs';
import { notifyGuest } from '../../lib/notify.mjs';
import { ACTIVE_STATUSES } from '../../lib/defaults.mjs';
import { json, errorResponse, readBody, assertSameOrigin, clientIp, background, HttpError } from '../../lib/http.mjs';
import { isISODate, addDays, todayIn, daysBetween } from '../../lib/time.mjs';

const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function dateParam(url, name, fallback) {
  const v = url.searchParams.get(name);
  if (!v) return fallback;
  if (!isISODate(v)) throw new HttpError(400, 'invalid', `Fecha no válida: ${name}.`);
  return v;
}

function enrich(bookings, guests, today) {
  return bookings.map((b) => {
    const g = guests[guestKey(b)];
    return g ? { ...b, guest: { key: g.key, tags: g.tags, notes: g.notes, ...guestStats(g, today) } } : b;
  });
}

function summarizeDay(cfg, date, day) {
  const open = servicesOn(cfg, date).map((s) => s.id);
  return {
    date,
    closed: !open.length,
    closure: closureFor(cfg, date, 'all')?.note || '',
    services: cfg.services.map((s) => {
      const occ = occupancy(day, s.id);
      const list = day.bookings.filter((b) => b.service === s.id && ACTIVE_STATUSES.has(b.status));
      return { id: s.id, open: open.includes(s.id), covers: occ.total, bookings: list.length, capacity: s.capacity };
    }),
    pending: day.bookings.filter((b) => b.status === 'pending').length,
    waitlist: (day.waitlist || []).filter((w) => w.status === 'waiting').length,
  };
}

async function dayView(url, cfg) {
  const today = todayIn(cfg.timezone);
  const date = dateParam(url, 'date', today);
  const [day, guests] = await Promise.all([getDay(date), getGuests()]);
  const occ = Object.fromEntries(cfg.services.map((s) => [s.id, occupancy(day, s.id)]));
  return json({
    ok: true,
    date,
    summary: summarizeDay(cfg, date, day),
    occupancy: occ,
    availability: dayAvailability(cfg, date, day, 2, new Date()),
    bookings: enrich(day.bookings, guests, today).sort((a, b) => (a.time + a.name).localeCompare(b.time + b.name)),
    waitlist: day.waitlist || [],
  });
}

async function rangeView(url, cfg) {
  const today = todayIn(cfg.timezone);
  const from = dateParam(url, 'from', today);
  const to = dateParam(url, 'to', addDays(from, 30));
  const full = url.searchParams.get('full') === '1';
  if (full && daysBetween(from, to) > 186) throw new HttpError(400, 'range', 'Para listados, el rango máximo es de 6 meses.');
  const days = await getRange(from, to);
  const out = { ok: true, from, to, days: days.map((d) => summarizeDay(cfg, d.date, d)) };
  if (full) {
    const guests = await getGuests();
    out.bookings = enrich(days.flatMap((d) => d.bookings), guests, today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }
  return json(out);
}

async function search(url, cfg) {
  const q = fold(url.searchParams.get('q')).trim();
  if (q.length < 2) return json({ ok: true, bookings: [] });
  const today = todayIn(cfg.timezone);
  const found = new Map();
  const byCode = await findByCode(q);
  if (byCode) found.set(byCode.id, byCode);
  const guests = await getGuests();
  const digits = q.replace(/\D/g, '');
  const matches = Object.values(guests).filter((g) =>
    fold(g.name).includes(q) || fold(g.email).includes(q) || (digits.length >= 4 && (g.phone || '').includes(digits)));
  const refs = matches.flatMap((g) => g.refs).slice(0, 80);
  const dates = [...new Set(refs.map((r) => r.date))];
  const days = await Promise.all(dates.map(async (d) => [d, await getDay(d)]));
  const dayMap = new Map(days);
  for (const r of refs) {
    const b = dayMap.get(r.date)?.bookings.find((x) => x.id === r.id);
    if (b) found.set(b.id, b);
  }
  const list = enrich([...found.values()], guests, today).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  return json({ ok: true, bookings: list });
}

async function notify(context, kind, booking, cfg) {
  await background(context, notifyGuest(kind, booking, cfg));
}

async function postBooking(req, context, cfg, user) {
  const body = await readBody(req);
  const b = await createBooking(body, { actor: user, source: body.source, override: Boolean(body.override) });
  if (body.notify && b.status === 'confirmed') await notify(context, 'confirmed', b, cfg);
  return json({ ok: true, booking: b, manageUrl: manageUrl(b, await bookingToken(b.id)) }, 201);
}

async function patchBooking(req, context, cfg, user) {
  const body = await readBody(req);
  if (!isISODate(body.date) || !body.id) throw new HttpError(400, 'invalid', 'Falta la reserva.');
  const before = (await getDay(body.date)).bookings.find((b) => b.id === body.id);
  const b = await updateBooking(body.date, body.id, body.patch || {}, { actor: user, override: Boolean(body.override) });
  if (body.notify && before) {
    if (before.status === 'pending' && b.status === 'confirmed') await notify(context, 'confirmed', b, cfg);
    else if (before.status !== 'cancelled' && b.status === 'cancelled') await notify(context, 'cancelled', b, cfg);
    else if (b.status === 'confirmed' && (before.date !== b.date || before.time !== b.time || before.party !== b.party)) await notify(context, 'confirmed', b, cfg);
  }
  return json({ ok: true, booking: b });
}

async function guestsView(url, cfg) {
  const q = fold(url.searchParams.get('q')).trim();
  const today = todayIn(cfg.timezone);
  const guests = Object.values(await getGuests())
    .filter((g) => !q || fold(g.name).includes(q) || fold(g.email).includes(q) || (g.phone || '').includes(q.replace(/\D/g, '') || '§') ||
      (g.tags || []).some((t) => fold(t).includes(q)))
    .map((g) => ({ ...g, refs: g.refs.slice(0, 20), stats: guestStats(g, today) }))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 300);
  return json({ ok: true, guests });
}

const CSV_COLUMNS = [
  ['Fecha', 'date'], ['Hora', 'time'], ['Servicio', 'service'], ['Comensales', 'party'], ['Nombre', 'name'],
  ['Teléfono', 'phone'], ['Email', 'email'], ['Estado', 'status'], ['Menú', 'menu'], ['Maridaje', 'pairing'],
  ['Alergias', 'allergies'], ['Dieta', (b) => (b.dietary || []).join(', ')], ['Ocasión', 'occasion'], ['Notas', 'notes'],
  ['Notas internas', 'internalNotes'], ['Mesa', 'table'], ['Origen', 'source'], ['Idioma', 'lang'],
  ['Localizador', 'code'], ['Creada', 'createdAt'],
];

function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // evita fórmulas al abrir en Excel
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function exportCsv(url, cfg) {
  const today = todayIn(cfg.timezone);
  const from = dateParam(url, 'from', addDays(today, -30));
  const to = dateParam(url, 'to', addDays(today, 60));
  if (daysBetween(from, to) > 400) throw new HttpError(400, 'range', 'Rango máximo: 400 días.');
  const days = await getRange(from, to);
  const rows = days.flatMap((d) => d.bookings).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const lines = [CSV_COLUMNS.map(([h]) => h).join(';')];
  for (const b of rows) lines.push(CSV_COLUMNS.map(([, k]) => csvCell(typeof k === 'function' ? k(b) : b[k])).join(';'));
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="reservas_${from}_${to}.csv"`,
      'cache-control': 'no-store',
    },
  });
}

async function route(req, context) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '').replace(/^\/api\/admin/, '') || '/';
  const m = req.method;

  if (m === 'POST' && path === '/login') {
    const body = await readBody(req);
    const { user, cookie } = await login(req, clientIp(req, context), body);
    return json({ ok: true, user }, 200, { 'set-cookie': cookie });
  }
  if (m === 'POST' && path === '/logout') return json({ ok: true }, 200, { 'set-cookie': logoutCookie(req) });

  const user = await requireUser(req);
  const cfg = await getConfig();
  const admin = () => { if (user.role !== 'admin') throw new HttpError(403, 'forbidden', 'Solo administración puede hacer esto.'); };

  switch (`${m} ${path}`) {
    case 'GET /me':
      return json({
        ok: true, user, mail: mailConfigured(), sms: smsConfigured(), timezone: cfg.timezone, today: todayIn(cfg.timezone),
        window: windowFor(cfg),
        services: cfg.services, menus: cfg.menus, booking: cfg.booking,
      });
    case 'GET /day': return dayView(url, cfg);
    case 'GET /range': return rangeView(url, cfg);
    case 'GET /search': return search(url, cfg);
    case 'GET /export': return exportCsv(url, cfg);
    case 'POST /bookings': return postBooking(req, context, cfg, user);
    case 'PATCH /bookings': return patchBooking(req, context, cfg, user);
    case 'PATCH /waitlist': {
      const body = await readBody(req);
      return json({ ok: true, entry: await updateWaitlist(body.date, body.id, body.status) });
    }
    case 'GET /requests': return json({ ok: true, requests: await listRequests() });
    case 'PATCH /requests': {
      const body = await readBody(req);
      return json({ ok: true, request: await updateRequest(body.id, body) });
    }
    case 'GET /guests': return guestsView(url, cfg);
    case 'PATCH /guests': {
      const body = await readBody(req);
      return json({ ok: true, guest: await updateGuest(body.key, body) });
    }
    case 'DELETE /guests': {
      admin();
      const key = url.searchParams.get('key');
      if (!key) throw new HttpError(400, 'invalid', 'Falta el cliente.');
      return json({ ok: true, ...(await eraseGuest(key)) });
    }
    case 'GET /config': return json({ ok: true, config: cfg });
    case 'PUT /config': {
      admin();
      return json({ ok: true, config: await saveConfig(await readBody(req, 128 * 1024)) });
    }
    case 'GET /users': admin(); return json({ ok: true, users: await listUsers() });
    case 'POST /users': {
      admin();
      await createUser(await readBody(req));
      return json({ ok: true, users: await listUsers() }, 201);
    }
    case 'DELETE /users': {
      admin();
      const id = url.searchParams.get('id');
      if (!id || id === 'admin') throw new HttpError(400, 'invalid', 'Ese usuario no se puede borrar.');
      if (id === user.id) throw new HttpError(400, 'invalid', 'No puedes borrar tu propio usuario.');
      await deleteUser(id);
      return json({ ok: true, users: await listUsers() });
    }
    case 'POST /users/password': {
      const body = await readBody(req);
      const target = body.id || user.id;
      if (target !== user.id) admin();
      if (target === 'admin') throw new HttpError(400, 'invalid', 'La contraseña de «admin» se cambia en la variable ADMIN_PASSWORD.');
      await changePassword(target, body.password);
      return json({ ok: true });
    }
    default:
      return json({ ok: false, error: 'not_found' }, 404);
  }
}

export default async (req, context) => {
  try {
    assertSameOrigin(req);
    return await route(req, context);
  } catch (e) {
    return errorResponse(e);
  }
};

export const config = { path: '/api/admin/*' };
