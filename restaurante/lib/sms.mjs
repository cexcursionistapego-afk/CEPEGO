// SMS transaccionales (confirmación, recordatorio, cancelación) con Twilio.
// Sin credenciales el sistema funciona igual y no envía nada.
//
//   TWILIO_ACCOUNT_SID          AC…
//   TWILIO_AUTH_TOKEN           token de la cuenta
//   TWILIO_FROM                 número de Twilio (+34…/+1…) o remitente
//                               alfanumérico de hasta 11 caracteres («Bagatge»)
//   TWILIO_MESSAGING_SERVICE_SID  (opcional) MG…, en lugar de TWILIO_FROM
//   SMS_DEFAULT_COUNTRY         prefijo para números sin «+» (por defecto 34)

import site from '../site.config.mjs';

export function smsConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
    (process.env.TWILIO_FROM || process.env.TWILIO_MESSAGING_SERVICE_SID));
}

/** Número en formato internacional E.164, o null si no sirve para SMS. */
export function toE164(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  let e164;
  if (raw.startsWith('+')) e164 = '+' + digits;
  else if (raw.startsWith('00')) e164 = '+' + digits.slice(2);
  else e164 = '+' + (process.env.SMS_DEFAULT_COUNTRY || '34') + digits;
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) return null;
  // En España los fijos (8xx, 9xx) no reciben SMS: no gastamos el envío.
  if (e164.startsWith('+34') && !/^\+34[67]/.test(e164)) return null;
  return e164;
}

// Alfabeto GSM-7: con él un SMS admite 160 caracteres. Una sola «á» obliga a
// usar UCS-2 (70 caracteres por mensaje) y duplica el coste, así que se
// transliteran los caracteres que no están en el alfabeto.
const GSM = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
export function toGsm(text) {
  return [...String(text).replace(/[‘’]/g, "'").replace(/[“”«»]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/·/g, '.')]
    .map((ch) => (GSM.includes(ch) ? ch : ch.normalize('NFD').replace(/[̀-ͯ]/g, '')))
    .filter((ch) => GSM.includes(ch))
    .join('');
}

function shortDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  const parts = Object.fromEntries(new Intl.DateTimeFormat({ va: 'ca-ES', en: 'en-GB' }[lang] || 'es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  }).formatToParts(new Date(Date.UTC(y, m - 1, d))).map((p) => [p.type, p.value]));
  return `${parts.weekday.replace('.', '')} ${parts.day} ${parts.month.replace('.', '')}`;
}

export function bookingSmsText(kind, b, link) {
  const lang = ['va', 'es', 'en'].includes(b.lang) ? b.lang : 'va';
  const when = `${shortDate(b.date, lang)}, ${b.time}`;
  const n = lang === 'en' ? `${b.party} ${b.party === 1 ? 'guest' : 'guests'}` : `${b.party} pers.`;
  const texts = {
    va: {
      confirmed: `${site.name}: taula confirmada, ${n}, ${when}. Loc. ${b.code}. Gestionar: ${link}`,
      reminder: `${site.name}: t’esperem demà, ${when} (${n}). No pots vindre? Cancel·la ací: ${link}`,
      cancelled: `${site.name}: la teua reserva ${b.code} del ${when} s’ha cancel·lat. Esperem vore’t prompte.`,
    },
    en: {
    confirmed: `${site.name}: table confirmed, ${n}, ${when}. Ref ${b.code}. Manage: ${link}`,
    reminder: `${site.name}: see you tomorrow, ${when} (${n}). Can't make it? Cancel here: ${link}`,
    cancelled: `${site.name}: your booking ${b.code} for ${when} has been cancelled. We hope to see you soon.`,
    },
    es: {
    confirmed: `${site.name}: mesa confirmada, ${n}, ${when}. Loc. ${b.code}. Gestionar: ${link}`,
    reminder: `${site.name}: te esperamos mañana, ${when} (${n}). ¿No puedes venir? Cancela aqui: ${link}`,
    cancelled: `${site.name}: tu reserva ${b.code} del ${when} ha sido cancelada. Esperamos verte pronto.`,
    },
  };
  return toGsm(texts[lang][kind]);
}

export async function sendSms(to, body) {
  if (!smsConfigured()) return { sent: false, reason: 'not_configured' };
  const number = toE164(to);
  if (!number) return { sent: false, reason: 'not_mobile' };
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const form = new URLSearchParams({ To: number, Body: body });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) form.set('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID);
  else form.set('From', process.env.TWILIO_FROM);
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
      method: 'POST',
      headers: {
        authorization: 'Basic ' + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      console.error('sms error', r.status, err.code, err.message);
      return { sent: false, reason: 'provider', error: err.message || String(r.status) };
    }
    return { sent: true };
  } catch (e) {
    console.error('sms error', e);
    return { sent: false, reason: 'network' };
  }
}
