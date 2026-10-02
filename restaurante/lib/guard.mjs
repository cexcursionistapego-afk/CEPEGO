// Defensas de los formularios públicos: honeypot, Cloudflare Turnstile
// (opcional) y un límite de envíos por IP.

import { HttpError } from './http.mjs';
import { readJSON, update } from './store.mjs';

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyCaptcha(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // sin configurar → no se exige
  if (!token) throw new HttpError(400, 'captcha', 'Completa la verificación anti-spam.');
  try {
    const form = new URLSearchParams({ secret, response: String(token) });
    if (ip && ip !== 'local') form.append('remoteip', ip);
    const r = await fetch(SITEVERIFY, { method: 'POST', body: form });
    const data = await r.json();
    if (!data.success) throw new HttpError(400, 'captcha', 'La verificación anti-spam ha fallado. Inténtalo de nuevo.');
    return true;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    return true; // si Cloudflare no responde, no bloqueamos a clientes reales
  }
}

/** Devuelve true si la petición parece de un bot (campo trampa relleno). */
export function isHoneypot(body) {
  return Boolean(body && (body.website || body.url_hp));
}

export async function rateLimit(ip, bucket, max, windowMs) {
  const key = `ratelimit/${bucket}-${String(ip).replace(/[^a-zA-Z0-9.:-]/g, '_')}`;
  const cur = await readJSON(key, null);
  const now = Date.now();
  if (cur && now - cur.since < windowMs && cur.count >= max) {
    throw new HttpError(429, 'rate_limit', 'Demasiadas solicitudes seguidas. Inténtalo más tarde.');
  }
  await update(key, (r) => (!r.since || now - r.since > windowMs ? { since: now, count: 1 } : { ...r, count: r.count + 1 }), {});
}
