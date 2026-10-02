// Avisos al cliente por email y SMS, con registro en la propia reserva.

import site from '../site.config.mjs';
import { bookingToken, smsToken } from './auth.mjs';
import { sendBookingMail } from './mail.mjs';
import { sendSms, bookingSmsText, smsConfigured, toE164 } from './sms.mjs';
import { recordNotifications } from './bookings.mjs';

export async function shortLink(b) {
  return `${site.url.replace(/\/$/, '')}/r/${b.code}-${await smsToken(b.id)}`;
}

function smsWanted(kind, cfg) {
  const n = cfg.notifications || {};
  return { confirmed: n.smsConfirm, reminder: n.smsReminder, cancelled: n.smsCancel }[kind] || false;
}

/**
 * Envía el aviso `kind` (confirmed | pending | cancelled | reminder).
 * channels: qué canales intentar; por defecto ambos.
 * Devuelve [{ channel, kind, ok, reason }] y lo guarda en la reserva.
 */
export async function notifyGuest(kind, b, cfg, { channels = ['email', 'sms'], extra = {} } = {}) {
  const at = new Date().toISOString();
  const log = [];
  const jobs = [];
  if (channels.includes('email') && b.email) {
    jobs.push((async () => {
      const r = await sendBookingMail(kind, b, cfg, await bookingToken(b.id));
      if (r.reason !== 'not_configured') log.push({ channel: 'email', kind, ok: r.sent, at, ...(r.sent ? {} : { reason: r.reason }) });
    })());
  }
  if (channels.includes('sms') && b.phone && smsConfigured() && smsWanted(kind, cfg) && toE164(b.phone)) {
    jobs.push((async () => {
      const r = await sendSms(b.phone, bookingSmsText(kind, b, await shortLink(b)));
      log.push({ channel: 'sms', kind, ok: r.sent, at, ...(r.sent ? {} : { reason: r.reason }) });
    })());
  }
  await Promise.all(jobs);
  await recordNotifications(b.date, b.id, log, extra).catch((e) => console.error('notify log', e));
  return log;
}
