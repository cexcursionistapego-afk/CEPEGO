// Solicitudes que no son reservas: eventos privados, tarjetas regalo y contacto.

import { randomUUID, randomInt } from 'node:crypto';
import { readJSON, update } from './store.mjs';
import { HttpError } from './http.mjs';
import { clean, cleanText, isEmail, normalizePhone, lang as cleanLang } from './validate.mjs';
import { isISODate } from './time.mjs';

export const REQUEST_TYPES = ['evento', 'regalo', 'contacto'];
export const REQUEST_STATUSES = ['new', 'in_progress', 'done', 'archived'];

function giftCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += A[randomInt(A.length)];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

export function normalizeRequest(input) {
  const type = REQUEST_TYPES.includes(input.type) ? input.type : null;
  if (!type) throw new HttpError(400, 'invalid', 'Tipo de solicitud no válido.');
  const name = clean(input.name, 80);
  const email = clean(input.email, 254).toLowerCase();
  const phone = normalizePhone(input.phone);
  if (name.length < 2) throw new HttpError(400, 'invalid', 'Indica tu nombre.', { field: 'name' });
  if (!isEmail(email)) throw new HttpError(400, 'invalid', 'El email no parece válido.', { field: 'email' });
  if (phone === null) throw new HttpError(400, 'invalid', 'El teléfono no parece válido.', { field: 'phone' });
  if (!input.consentPrivacy) throw new HttpError(400, 'invalid', 'Debes aceptar la política de privacidad.', { field: 'consentPrivacy' });
  const base = { type, name, email, phone: phone || '', lang: cleanLang(input.lang), message: cleanText(input.message, 2000) };

  if (type === 'evento') {
    const guests = Number.parseInt(input.guests, 10);
    if (!Number.isInteger(guests) || guests < 1 || guests > 500) throw new HttpError(400, 'invalid', 'Indica el número de invitados.', { field: 'guests' });
    return {
      ...base, guests,
      date: isISODate(input.date) ? input.date : '',
      eventType: clean(input.eventType, 40),
      budget: clean(input.budget, 40),
      company: clean(input.company, 80),
    };
  }
  if (type === 'regalo') {
    const recipient = clean(input.recipient, 80);
    if (recipient.length < 2) throw new HttpError(400, 'invalid', 'Indica para quién es el regalo.', { field: 'recipient' });
    return {
      ...base,
      recipient,
      recipientEmail: isEmail(clean(input.recipientEmail, 254)) ? clean(input.recipientEmail, 254).toLowerCase() : '',
      menu: clean(input.menu, 40),
      pairing: clean(input.pairing, 40),
      guests: Math.min(Math.max(Number.parseInt(input.guests, 10) || 2, 1), 12),
      amount: Math.max(0, Math.min(Number(input.amount) || 0, 5000)),
      delivery: input.delivery === 'print' ? 'print' : 'email',
      dedication: cleanText(input.dedication, 400),
    };
  }
  if (!base.message) throw new HttpError(400, 'invalid', 'Escribe tu mensaje.', { field: 'message' });
  return { ...base, subject: clean(input.subject, 120) };
}

export async function createRequest(input) {
  const data = normalizeRequest(input);
  const item = {
    id: randomUUID(), ...data, status: 'new', note: '',
    ...(data.type === 'regalo' ? { giftCode: giftCode() } : {}),
    createdAt: new Date().toISOString(),
  };
  await update('requests', (list) => [item, ...list].slice(0, 2000), []);
  return item;
}

export async function listRequests() {
  return readJSON('requests', []);
}

export async function updateRequest(id, { status, note }) {
  let out;
  await update('requests', (list) => {
    const r = list.find((x) => x.id === id);
    if (!r) throw new HttpError(404, 'not_found', 'Solicitud no encontrada.');
    if (status !== undefined) {
      if (!REQUEST_STATUSES.includes(status)) throw new HttpError(400, 'invalid', 'Estado no válido.');
      r.status = status;
    }
    if (note !== undefined) r.note = cleanText(note, 1000);
    r.updatedAt = new Date().toISOString();
    out = r;
    return list;
  }, []);
  return out;
}

