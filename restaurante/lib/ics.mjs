import site from '../site.config.mjs';
import { zonedToUtc } from './time.mjs';

const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

export function bookingIcs(b, durationMin = 150) {
  const start = zonedToUtc(b.date, b.time, site.timezone);
  const end = new Date(start.getTime() + durationMin * 60000);
  const a = site.address;
  const title = { va: `Taula a ${site.name}`, en: `Table at ${site.name}` }[b.lang] || `Mesa en ${site.name}`;
  const desc = { va: `Reserva ${b.code} · ${b.party} persones`, en: `Booking ${b.code} · ${b.party} guests` }[b.lang] ||
    `Reserva ${b.code} · ${b.party} personas`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + site.name + '//Reservas//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.id}@${site.name.toLowerCase().replace(/\W+/g, '')}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(desc)}`,
    `LOCATION:${esc(`${site.name}, ${a.street}, ${a.postalCode} ${a.city}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
