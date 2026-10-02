// Correos transaccionales. Se envían con Resend (https://resend.com, plan
// gratuito de 3.000 correos/mes) si existe RESEND_API_KEY. Sin esa variable el
// sistema funciona igual y simplemente no envía correos.
//
//   RESEND_API_KEY  clave de la API
//   MAIL_FROM       remitente verificado, p. ej. «Bagatge <reservas@dominio.com>»
//   STAFF_EMAIL     a quién avisar de reservas y solicitudes nuevas

import site from '../site.config.mjs';
import { bookingIcs } from './ics.mjs';
import { routeFor } from './routes.mjs';

const T = {
  va: {
    confirmedSubject: (b) => `Reserva confirmada · ${fmtDate(b.date, 'va')} · ${b.time}`,
    pendingSubject: () => `Hem rebut la teua sol·licitud de reserva`,
    cancelledSubject: () => `Reserva cancel·lada`,
    reminderSubject: (b) => `T’esperem ${relDay(b, 'va')} a les ${b.time}`,
    confirmedTitle: 'La teua taula està reservada',
    pendingTitle: 'Sol·licitud rebuda',
    pendingText: 'Revisarem la disponibilitat i et confirmarem la reserva per correu en les pròximes hores.',
    cancelledTitle: 'La teua reserva s’ha cancel·lat',
    cancelledText: 'Esperem vore’t una altra vegada.',
    reminderTitle: 'Ens veiem prompte',
    reminderText: 'Si no pots vindre, avisa’ns com més prompte millor: algú de la llista d’espera t’agrairà la taula.',
    date: 'Data', time: 'Hora', party: 'Comensals', code: 'Localitzador', menu: 'Menú',
    manage: 'Gestionar la reserva',
    policy: (h) => `Pots cancel·lar sense cost fins a ${h} hores abans. Si tens al·lèrgies o intoleràncies que no ens hages indicat, respon a este correu.`,
    persons: (n) => `${n} ${n === 1 ? 'persona' : 'persones'}`,
  },
  es: {
    confirmedSubject: (b) => `Reserva confirmada · ${fmtDate(b.date, 'es')} · ${b.time}`,
    pendingSubject: () => `Hemos recibido tu solicitud de reserva`,
    cancelledSubject: () => `Reserva cancelada`,
    reminderSubject: (b) => `Te esperamos ${relDay(b, 'es')} a las ${b.time}`,
    confirmedTitle: 'Tu mesa está reservada',
    pendingTitle: 'Solicitud recibida',
    pendingText: 'Revisaremos la disponibilidad y te confirmaremos la reserva por email en las próximas horas.',
    cancelledTitle: 'Tu reserva se ha cancelado',
    cancelledText: 'Esperamos verte en otra ocasión.',
    reminderTitle: 'Nos vemos pronto',
    reminderText: 'Si no puedes venir, avísanos cuanto antes: alguien de la lista de espera agradecerá tu mesa.',
    date: 'Fecha', time: 'Hora', party: 'Comensales', code: 'Localizador', menu: 'Menú',
    manage: 'Gestionar reserva',
    policy: (h) => `Puedes cancelar sin coste hasta ${h} horas antes. Si tienes alergias o intolerancias que no nos hayas indicado, responde a este correo.`,
    persons: (n) => `${n} ${n === 1 ? 'persona' : 'personas'}`,
  },
  en: {
    confirmedSubject: (b) => `Booking confirmed · ${fmtDate(b.date, 'en')} · ${b.time}`,
    pendingSubject: () => `We have received your booking request`,
    cancelledSubject: () => `Booking cancelled`,
    reminderSubject: (b) => `See you ${relDay(b, 'en')} at ${b.time}`,
    confirmedTitle: 'Your table is booked',
    pendingTitle: 'Request received',
    pendingText: 'We will check availability and confirm your booking by email within a few hours.',
    cancelledTitle: 'Your booking has been cancelled',
    cancelledText: 'We hope to welcome you another time.',
    reminderTitle: 'See you soon',
    reminderText: 'If you can no longer come, please let us know as soon as possible — someone on the waiting list will be grateful.',
    date: 'Date', time: 'Time', party: 'Guests', code: 'Reference', menu: 'Menu',
    manage: 'Manage booking',
    policy: (h) => `Free cancellation up to ${h} hours before. If you have allergies or intolerances you have not told us about, just reply to this email.`,
    persons: (n) => `${n} ${n === 1 ? 'guest' : 'guests'}`,
  },
};

export function fmtDate(iso, lang = 'es') {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat({ va: 'ca-ES', en: 'en-GB' }[lang] || 'es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function relDay(b, lang) {
  return lang === 'en' ? `on ${fmtDate(b.date, 'en')}` : `el ${fmtDate(b.date, lang)}`;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function layout({ title, intro, rows = [], button, foot }) {
  const a = site.address;
  const rowsHtml = rows.map(([k, v]) => `
      <tr><td style="padding:10px 0;border-top:1px solid #dfe2dc;color:#676d66;font-size:12px;letter-spacing:.12em;text-transform:uppercase;width:42%">${esc(k)}</td>
      <td style="padding:10px 0;border-top:1px solid #dfe2dc;color:#121412;font-size:15px">${esc(v)}</td></tr>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#f4f5f2;font-family:Helvetica,Arial,sans-serif;color:#121412">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f2"><tr><td align="center" style="padding:48px 20px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
    <tr><td style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:28px;letter-spacing:-.03em;padding-bottom:40px">${esc(site.name)}</td></tr>
    <tr><td style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:700;font-size:24px;line-height:1.2;letter-spacing:-.02em;padding-bottom:16px">${esc(title)}</td></tr>
    ${intro ? `<tr><td style="font-size:15px;line-height:1.6;color:#363b36;padding-bottom:28px">${esc(intro)}</td></tr>` : ''}
    ${rows.length ? `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table></td></tr>` : ''}
    ${button ? `<tr><td style="padding-top:32px"><a href="${esc(button.href)}" style="display:inline-block;background:#121412;color:#f4f5f2;text-decoration:none;padding:14px 26px;border-radius:6px;font-size:14px">${esc(button.label)}</a></td></tr>` : ''}
    ${foot ? `<tr><td style="font-size:13px;line-height:1.6;color:#676d66;padding-top:32px">${esc(foot)}</td></tr>` : ''}
    <tr><td style="font-size:12px;line-height:1.7;color:#676d66;padding-top:48px;border-top:1px solid #dfe2dc;margin-top:40px">
      ${esc(site.name)} · ${esc(a.street)} · ${esc(a.postalCode)} ${esc(a.city)}<br>${esc(site.phone)} · ${esc(site.email)}
    </td></tr>
  </table></td></tr></table></body></html>`;
}

function toText({ title, intro, rows = [], button, foot }) {
  return [site.name, '', title, intro || '', '', ...rows.map(([k, v]) => `${k}: ${v}`), '', button ? `${button.label}: ${button.href}` : '', foot || ''].join('\n');
}

export function configured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export async function sendMail({ to, subject, html, text, replyTo, attachments }) {
  if (!configured() || !to) return { sent: false, reason: 'not_configured' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject, html, text,
        reply_to: replyTo || process.env.STAFF_EMAIL || site.email,
        attachments,
      }),
    });
    if (!r.ok) {
      console.error('mail error', r.status, await r.text());
      return { sent: false, reason: 'provider' };
    }
    return { sent: true };
  } catch (e) {
    console.error('mail error', e);
    return { sent: false, reason: 'network' };
  }
}

function bookingRows(b, cfg, t, lang) {
  const menu = cfg.menus.find((m) => m.id === b.menu);
  const rows = [
    [t.date, fmtDate(b.date, lang)],
    [t.time, b.time],
    [t.party, t.persons(b.party)],
  ];
  if (menu) rows.push([t.menu, menu.name[lang] || menu.name.es]);
  rows.push([t.code, b.code]);
  return rows;
}

export function manageUrl(b, token) {
  const base = site.url.replace(/\/$/, '');
  const path = routeFor('manage', b.lang);
  return `${base}${path}?c=${encodeURIComponent(b.code)}&t=${encodeURIComponent(token)}`;
}

export async function sendBookingMail(kind, b, cfg, token) {
  const lang = T[b.lang] ? b.lang : 'va';
  const t = T[lang];
  const service = cfg.services.find((s) => s.id === b.service);
  const content = {
    confirmed: { subject: t.confirmedSubject(b), title: t.confirmedTitle, intro: '', foot: t.policy(cfg.booking.cancellationHours) },
    pending: { subject: t.pendingSubject(b), title: t.pendingTitle, intro: t.pendingText, foot: '' },
    cancelled: { subject: t.cancelledSubject(b), title: t.cancelledTitle, intro: t.cancelledText, foot: '' },
    reminder: { subject: t.reminderSubject(b), title: t.reminderTitle, intro: t.reminderText, foot: t.policy(cfg.booking.cancellationHours) },
  }[kind];
  const parts = {
    title: content.title,
    intro: content.intro,
    rows: bookingRows(b, cfg, t, lang),
    button: kind === 'cancelled' ? null : { label: t.manage, href: manageUrl(b, token) },
    foot: content.foot,
  };
  const attachments = kind === 'confirmed'
    ? [{ filename: 'reserva.ics', content: Buffer.from(bookingIcs(b, service?.duration)).toString('base64') }]
    : undefined;
  return sendMail({ to: b.email, subject: content.subject, html: layout(parts), text: toText(parts), attachments });
}

/** Aviso interno al equipo. */
export async function notifyStaff(subject, lines) {
  const to = process.env.STAFF_EMAIL;
  if (!to) return { sent: false, reason: 'no_staff_email' };
  const rows = lines.filter(([, v]) => v !== undefined && v !== '' && v !== null).map(([k, v]) => [k, String(v)]);
  const parts = { title: subject, rows, button: { label: 'Abrir panel', href: site.url.replace(/\/$/, '') + '/admin/' } };
  return sendMail({ to, subject: `[${site.name}] ${subject}`, html: layout(parts), text: toText(parts) });
}
