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

module.exports = { isAllowedOrigin, base64SizeExceeds, MAX_FILE_BYTES };
