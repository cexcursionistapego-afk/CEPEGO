// Utilidades de fecha y hora. Todo el sistema trabaja con fechas locales del
// restaurante ('YYYY-MM-DD' y 'HH:MM') para no depender de la zona horaria del
// servidor, que en Netlify es UTC.

const pad = (n) => String(n).padStart(2, '0');

export const isISODate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
export const isTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const isMonth = (s) => typeof s === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

/** Partes de fecha/hora de un instante en una zona horaria IANA. */
export function zonedParts(instant, tz) {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  const p = Object.fromEntries(fmt.formatToParts(instant).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, second: +p.second };
}

/** 'YYYY-MM-DD HH:MM' local del restaurante para un instante dado. */
export function localStamp(instant, tz) {
  const p = zonedParts(instant, tz);
  return `${p.date} ${p.time}`;
}

export function todayIn(tz, now = new Date()) {
  return zonedParts(now, tz).date;
}

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso, n) {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado */
export function weekday(iso) {
  return parseISO(iso).getUTCDay();
}

export function daysBetween(a, b) {
  return Math.round((parseISO(b) - parseISO(a)) / 86400000);
}

export function monthDays(month) {
  const [y, m] = month.split('-').map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${month}-${pad(i + 1)}`);
}

export function minutesOf(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function timeOf(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Instante UTC correspondiente a una fecha y hora locales de la zona `tz`. */
export function zonedToUtc(date, time, tz) {
  const [y, mo, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offsetAt = (ms) => {
    const p = zonedParts(new Date(ms), tz);
    const asUtc = Date.parse(`${p.date}T${p.time}:00Z`) + p.second * 1000;
    return asUtc - ms;
  };
  let ts = guess - offsetAt(guess);
  // Segunda pasada por si el cambio de horario cae entre medias.
  ts = guess - offsetAt(ts);
  return new Date(ts);
}
