import site from '../site.config.mjs';
import { DEFAULT_CONFIG } from './defaults.mjs';
import { readJSON, update } from './store.mjs';
import { isISODate, isTime } from './time.mjs';
import { HttpError } from './http.mjs';
import { smsConfigured } from './sms.mjs';

const KEY = 'config';

export async function getConfig() {
  const stored = await readJSON(KEY);
  const cfg = structuredClone(DEFAULT_CONFIG);
  if (stored) {
    for (const k of ['services', 'closures', 'menus']) if (Array.isArray(stored[k])) cfg[k] = stored[k];
    if (stored.booking) cfg.booking = { ...cfg.booking, ...stored.booking };
    if (stored.notifications) cfg.notifications = { ...cfg.notifications, ...stored.notifications };
  }
  cfg.timezone = site.timezone;
  return cfg;
}

const str = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const longStr = (v, max = 1200) => String(v ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, max);
const int = (v, min, max, label) => {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(400, 'config', `${label}: valor entre ${min} y ${max}.`);
  return n;
};
const slug = (v) => str(v, 40).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Textos en los tres idiomas; si falta uno, se usa el castellano.
const i18n = (v, max) => {
  const va = str(v?.va, max), es = str(v?.es, max), en = str(v?.en, max);
  return { va: va || es, es: es || va, en: en || es || va };
};
const i18nLong = (v) => {
  const va = longStr(v?.va), es = longStr(v?.es), en = longStr(v?.en);
  return { va: va || es, es: es || va, en: en || es || va };
};

function cleanBooking(b) {
  const out = {
    minParty: int(b.minParty, 1, 20, 'Mínimo de comensales'),
    maxParty: int(b.maxParty, 1, 40, 'Máximo de comensales'),
    windowDays: int(b.windowDays, 1, 365, 'Antelación máxima'),
    minAdvanceMinutes: int(b.minAdvanceMinutes, 0, 7 * 24 * 60, 'Antelación mínima'),
    autoConfirm: Boolean(b.autoConfirm),
    cancellationHours: int(b.cancellationHours, 0, 14 * 24, 'Plazo de cancelación'),
    requireMenuChoice: Boolean(b.requireMenuChoice),
    waitlist: Boolean(b.waitlist),
  };
  if (out.minParty > out.maxParty) throw new HttpError(400, 'config', 'El mínimo de comensales supera al máximo.');
  return out;
}

function cleanServices(list) {
  if (!Array.isArray(list) || !list.length) throw new HttpError(400, 'config', 'Debe haber al menos un servicio.');
  const ids = new Set();
  return list.map((s) => {
    const id = slug(s.id || s.label?.va || s.label?.es);
    if (!id || ids.has(id)) throw new HttpError(400, 'config', 'Cada servicio necesita un identificador único.');
    ids.add(id);
    const slots = [...new Set((s.slots || []).map((x) => str(x, 5)))].filter(isTime).sort();
    if (!slots.length) throw new HttpError(400, 'config', `El servicio «${s.label?.es || id}» no tiene horas válidas.`);
    const days = [...new Set((s.days || []).map(Number))].filter((d) => d >= 0 && d <= 6);
    return {
      id,
      label: i18n(s.label, 40),
      days,
      slots,
      slotCapacity: int(s.slotCapacity, 1, 500, 'Plazas por turno'),
      capacity: int(s.capacity, 1, 1000, 'Plazas por servicio'),
      duration: int(s.duration ?? 150, 30, 600, 'Duración'),
    };
  });
}

function cleanClosures(list) {
  if (!Array.isArray(list)) return [];
  return list.map((c) => {
    if (!isISODate(c.from) || !isISODate(c.to || c.from)) throw new HttpError(400, 'config', 'Fecha de cierre no válida.');
    const to = c.to || c.from;
    if (to < c.from) throw new HttpError(400, 'config', 'Un cierre termina antes de empezar.');
    return { from: c.from, to, service: str(c.service || 'all', 40), note: str(c.note, 120) };
  }).sort((a, b) => a.from.localeCompare(b.from));
}

function cleanMenus(list) {
  if (!Array.isArray(list)) return [];
  const ids = new Set();
  return list.map((m) => {
    const id = slug(m.id || m.name?.va || m.name?.es);
    if (!id || ids.has(id)) throw new HttpError(400, 'config', 'Cada menú necesita un identificador único.');
    ids.add(id);
    const price = Number(m.price);
    if (!Number.isFinite(price) || price < 0 || price > 10000) throw new HttpError(400, 'config', 'Precio de menú no válido.');
    return {
      id,
      active: m.active !== false,
      name: i18n(m.name, 60),
      summary: i18nLong(m.summary),
      price,
      pairing: (m.pairing || []).map((p) => ({
        id: slug(p.id || p.name?.es || p.name?.va) || 'maridaje',
        name: i18n(p.name, 60),
        price: Math.max(0, Number(p.price) || 0),
      })).filter((p) => p.name.es),

      courses: (m.courses || []).map((c) => i18n(c, 160)).filter((c) => c.es).slice(0, 40),
    };
  });
}

function cleanNotifications(n) {
  return {
    emailReminder: Boolean(n.emailReminder),
    smsConfirm: Boolean(n.smsConfirm),
    smsReminder: Boolean(n.smsReminder),
    smsCancel: Boolean(n.smsCancel),
  };
}

export async function saveConfig(input) {
  const clean = {};
  if (input.booking) clean.booking = cleanBooking(input.booking);
  if (input.services) clean.services = cleanServices(input.services);
  if (input.closures) clean.closures = cleanClosures(input.closures);
  if (input.menus) clean.menus = cleanMenus(input.menus);
  if (input.notifications) clean.notifications = cleanNotifications(input.notifications);
  await update(KEY, (cur) => ({ ...cur, ...clean, updatedAt: new Date().toISOString() }), {});
  return getConfig();
}

/** Lo que la web pública necesita saber (sin datos internos). */
export function publicConfig(cfg) {
  return {
    timezone: cfg.timezone,
    booking: {
      minParty: cfg.booking.minParty,
      maxParty: cfg.booking.maxParty,
      windowDays: cfg.booking.windowDays,
      cancellationHours: cfg.booking.cancellationHours,
      requireMenuChoice: cfg.booking.requireMenuChoice,
      waitlist: cfg.booking.waitlist,
      autoConfirm: cfg.booking.autoConfirm,
    },
    services: cfg.services.map((s) => ({ id: s.id, label: s.label, days: s.days, slots: s.slots, duration: s.duration })),
    menus: cfg.menus.filter((m) => m.active),
    sms: smsConfigured() && cfg.notifications.smsConfirm,
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  };
}
