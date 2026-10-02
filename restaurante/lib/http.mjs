export class HttpError extends Error {
  constructor(status, code, message, extra) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...BASE_HEADERS, ...headers } });
}

export function errorResponse(err) {
  if (err instanceof HttpError || (err && err.status && err.code)) {
    return json({ ok: false, error: err.code, message: err.message, ...(err.extra || {}) }, err.status);
  }
  console.error(err);
  return json({ ok: false, error: 'server', message: 'Error interno. Inténtalo de nuevo en unos minutos.' }, 500);
}

export async function readBody(req, maxBytes = 32 * 1024) {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, 'too_large', 'Petición demasiado grande.');
  if (!text) return {};
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    throw new HttpError(400, 'json', 'Formato no válido.');
  }
}

/**
 * Bloquea peticiones que modifican datos desde otro sitio (CSRF). Los
 * navegadores siempre envían Origin en un fetch POST/PATCH/DELETE.
 */
export function assertSameOrigin(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return;
  const origin = req.headers.get('origin');
  if (!origin) return; // clientes sin navegador (curl); el resto de defensas sigue activo
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
  let originHost;
  try { originHost = new URL(origin).host; } catch { originHost = ''; }
  const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (originHost === host || extra.includes(origin)) return;
  throw new HttpError(403, 'origin', 'Origen no permitido.');
}

export function clientIp(req, context) {
  return (context && context.ip) || req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
}

export function isHttps(req) {
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) return proto === 'https';
  return new URL(req.url).protocol === 'https:';
}

export function getCookie(req, name) {
  const raw = req.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

// Los correos nunca hacen fallar una operación ya guardada. Si la plataforma
// permite terminar trabajo tras responder (waitUntil), no se espera al envío.
export async function background(context, promise) {
  const p = promise.catch((e) => console.error('background', e));
  if (context && typeof context.waitUntil === 'function') context.waitUntil(p);
  else await p;
}
