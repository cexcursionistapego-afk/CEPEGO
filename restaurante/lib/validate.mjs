import { HttpError } from './http.mjs';

export const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
export const cleanText = (v, max = 1000) => String(v ?? '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);

export const isEmail = (s) => typeof s === 'string' && s.length <= 254 && /^[^\s@"'<>()[\]\\,;:]+@[^\s@"'<>()[\]\\,;:]+\.[a-z]{2,}$/i.test(s);

export function normalizePhone(s) {
  const raw = clean(s, 30);
  if (!raw) return '';
  const plus = raw.startsWith('+') || raw.startsWith('00');
  const digits = raw.replace(/\D/g, '').replace(/^00/, '');
  if (digits.length < 9 || digits.length > 15) return null;
  return (plus ? '+' : '') + digits;
}

export function required(value, field, message) {
  if (value === undefined || value === null || value === '') throw new HttpError(400, 'invalid', message, { field });
  return value;
}

export function oneOf(value, list, fallback = '') {
  return list.includes(value) ? value : fallback;
}

export const LANGS = ['va', 'es', 'en'];
export function lang(v) {
  return LANGS.includes(v) ? v : 'va';
}
