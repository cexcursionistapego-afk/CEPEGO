// Utilitats de seguretat compartides pels endpoints que escriuen a Airtable.

// Comprova que la petició vinga del propi lloc. Els navegadors sempre
// envien Origin en peticions fetch POST amb cos, així que això talla el
// típic CSRF "cec" (una pàgina externa que envia el formulari sense que
// l'usuari ho note). Si no hi ha Origin ni Referer (proxies, extensions de
// privacitat) es deixa passar per no bloquejar usuaris legítims — només es
// rebutja quan es veu clarament un origen d'un altre lloc.
const ALLOWED_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*(cepego\.com|netlify\.app)(:\d+)?(\/|$)/i;

function isAllowedOrigin(event) {
  const h = event.headers || {};
  const origin = h.origin || h.Origin;
  const referer = h.referer || h.Referer;
  const source = origin || referer;
  if (!source) return true;
  return ALLOWED_ORIGIN.test(source);
}

// Mida màxima d'una imatge en base64 (4MB de fitxer original, com al client).
const MAX_FILE_BYTES = 4 * 1024 * 1024;

function base64SizeExceeds(b64, maxBytes) {
  if (!b64) return false;
  // Mida aproximada del binari original a partir de la longitud en base64.
  const bytes = Math.floor((b64.length * 3) / 4);
  return bytes > (maxBytes || MAX_FILE_BYTES);
}

// Verificació del testimoni de Cloudflare Turnstile (anti-bots).
// Si TURNSTILE_SECRET_KEY no està configurada encara a Netlify, es deixa
// passar: així el formulari mai es queda trencat mentre s'acaba de muntar.
// Si Cloudflare no respon (caiguda del seu servei), també es deixa passar —
// val més acceptar alguna sol·licitud de més que deixar el club sense
// formularis; l'honeypot i la comprovació d'Origin continuen actives.
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// fetch amb temps màxim. Netlify talla la funció als 10 s i, si passa, el
// navegador rep un error en HTML en compte de la nostra resposta: cada pas
// que depén d'un servei de fora ha de tindre un límit més curt.
async function fetchAmbTemps(url, opts, ms) {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
  } finally {
    clearTimeout(tm);
  }
}

async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  // Un testimoni de Turnstile no passa de 2048 caràcters.
  if (!token || String(token).length > 2048) return { ok: false, error: 'captcha' };
  const form = new URLSearchParams({ secret: secret, response: String(token) });
  if (remoteIp) form.append('remoteip', remoteIp);
  let r;
  try {
    r = await fetchAmbTemps(SITEVERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    }, 4000);
  } catch (e) {
    // Cloudflare no respon o tarda més de 4 s: es deixa passar (vegeu dalt).
    return { ok: true, skipped: true };
  }
  // Només una caiguda seua (5xx) obri la porta. Qualsevol altra resposta que
  // no siga un "success" clar compta com a captcha fallat.
  if (r.status >= 500) return { ok: true, skipped: true };
  try {
    const data = await r.json();
    return data && data.success ? { ok: true } : { ok: false, error: 'captcha' };
  } catch (e) {
    return { ok: false, error: 'captcha' };
  }
}

function clientIp(event) {
  const h = event.headers || {};
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || undefined;
}

module.exports = { isAllowedOrigin, base64SizeExceeds, MAX_FILE_BYTES, verifyTurnstile, clientIp, fetchAmbTemps };
