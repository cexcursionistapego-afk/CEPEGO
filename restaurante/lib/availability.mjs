// Motor de disponibilidad. Funciones puras: reciben la configuración y las
// reservas del día y deciden qué horas se pueden ofrecer. El modelo es el de
// los restaurantes de menú degustación: un aforo total por servicio y un ritmo
// de llegadas por turno (cuántos comensales pueden entrar a la misma hora para
// que cocina y sala no se saturen).

import { ACTIVE_STATUSES } from './defaults.mjs';
import { addDays, weekday, todayIn, localStamp } from './time.mjs';
import { HttpError } from './http.mjs';

export function closureFor(cfg, date, serviceId) {
  return cfg.closures.find((c) => date >= c.from && date <= (c.to || c.from) &&
    (c.service === 'all' || !c.service || c.service === serviceId)) || null;
}

/** Servicios que abren ese día (por día de la semana y sin cierres). */
export function servicesOn(cfg, date) {
  const wd = weekday(date);
  return cfg.services.filter((s) => s.days.includes(wd) && !closureFor(cfg, date, s.id));
}

export function windowFor(cfg, now = new Date()) {
  const tz = cfg.timezone;
  const today = todayIn(tz, now);
  return {
    today,
    last: addDays(today, cfg.booking.windowDays),
    minStamp: localStamp(new Date(now.getTime() + cfg.booking.minAdvanceMinutes * 60000), tz),
  };
}

export function occupancy(day, serviceId) {
  const bySlot = {};
  let total = 0;
  for (const b of day?.bookings || []) {
    if (b.service !== serviceId || !ACTIVE_STATUSES.has(b.status)) continue;
    bySlot[b.time] = (bySlot[b.time] || 0) + b.party;
    total += b.party;
  }
  return { total, bySlot };
}

/**
 * Disponibilidad de un día para un grupo de `party` personas.
 * status: open | full | closed | past | beyond | unavailable
 */
export function dayAvailability(cfg, date, day, party, now = new Date()) {
  const win = windowFor(cfg, now);
  const base = { date, status: 'open', services: [] };
  if (date < win.today) return { ...base, status: 'past' };
  if (date > win.last) return { ...base, status: 'beyond' };
  const services = servicesOn(cfg, date);
  if (!services.length) {
    const closure = closureFor(cfg, date, 'all');
    return { ...base, status: 'closed', note: closure?.note || '' };
  }
  let anyAvailable = false;
  let anyBookableTime = false;
  for (const s of services) {
    const occ = occupancy(day, s.id);
    const serviceLeft = s.capacity - occ.total;
    const slots = s.slots.map((time) => {
      const inTime = `${date} ${time}` >= win.minStamp;
      if (inTime) anyBookableTime = true;
      const left = Math.min(s.slotCapacity - (occ.bySlot[time] || 0), serviceLeft);
      const available = inTime && party <= left;
      if (available) anyAvailable = true;
      return { time, available, reason: !inTime ? 'time' : available ? null : 'full' };
    });
    base.services.push({
      id: s.id,
      label: s.label,
      slots,
      full: !slots.some((x) => x.available),
      few: serviceLeft > 0 && serviceLeft <= Math.max(4, Math.round(s.capacity * 0.2)),
    });
  }
  base.status = anyAvailable ? 'open' : anyBookableTime ? 'full' : 'unavailable';
  return base;
}

/**
 * Comprueba que una reserva cabe. Lanza HttpError si no.
 * `opts.staff`: el equipo puede usar horas fuera de los turnos y saltarse la
 *   ventana de antelación y los límites de grupo, pero no el aforo ni los cierres.
 * `opts.override`: además ignora aforo y cierres (forzar desde el panel).
 */
export function assertBookable(cfg, day, { date, service, time, party }, now = new Date(), opts = {}) {
  const s = cfg.services.find((x) => x.id === service);
  if (!s) throw new HttpError(400, 'service', 'Servicio no válido.');
  if (opts.override) return s;
  if (!opts.staff) {
    if (!s.slots.includes(time)) throw new HttpError(400, 'slot', 'Hora no disponible.');
    if (party < cfg.booking.minParty || party > cfg.booking.maxParty) {
      throw new HttpError(400, 'party', `Reservas online de ${cfg.booking.minParty} a ${cfg.booking.maxParty} personas.`);
    }
    const win = windowFor(cfg, now);
    if (date < win.today || date > win.last || `${date} ${time}` < win.minStamp) {
      throw new HttpError(409, 'window', 'Esa fecha ya no admite reservas online.');
    }
  }
  if (!servicesOn(cfg, date).some((x) => x.id === service)) {
    throw new HttpError(409, 'closed', 'Ese día el servicio está cerrado.');
  }
  const occ = occupancy(day, service);
  const left = Math.min(s.slotCapacity - (occ.bySlot[time] || 0), s.capacity - occ.total);
  if (party > left) {
    throw new HttpError(409, 'full', opts.staff
      ? `No hay aforo: quedan ${Math.max(0, left)} plazas en esa hora. Marca «forzar» para añadirla igualmente.`
      : 'Esa hora acaba de completarse. Elige otra, por favor.');
  }
  return s;
}
