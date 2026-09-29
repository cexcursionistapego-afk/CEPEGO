// GET /api/webcam        -> la imatge de la webcam del refugi
// GET /api/webcam?meta=1 -> JSON amb quan es va pujar de veritat
//
// La foto pot vindre de dos llocs, i es mira en este ordre:
//
//   1. Netlify Blobs, on la deixa /api/webcam-upload. És el camí normal:
//      l'ordinador del club puja la foto cada 5 minuts directament ací.
//   2. La variable d'entorn WEBCAM_URL, si algun dia la càmera té adreça
//      pròpia a internet i es vol llegir d'allà sense passar per l'ordinador.
//
// Per què la imatge passa per una funció en compte d'anar al <img> directa:
// la Content-Security-Policy de les pàgines és img-src 'self' data:, així que
// una imatge d'un altre domini quedaria bloquejada pel navegador. Passant per
// ací, per al navegador és una imatge del propi lloc i no cal tocar la CSP.
//
// Si no hi ha ni l'una ni l'altra, es respon que no està configurada i la
// pàgina simplement no ensenya la webcam.

const { magatzem } = require('./_blobs');

// La foto canvia cada 5 minuts, així que no té sentit anar a buscar-la més
// sovint: es deixa que la caché de Netlify la servisca 4 minuts. Això és el
// que evita que cada visitant gaste una crida de funció — amb la caché, mil
// visites en 4 minuts són una sola crida.
const CACHE = 'public, max-age=240, stale-while-revalidate=120';

function json(code, obj, cache) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache || 'no-store' },
    body: JSON.stringify(obj),
  };
}

function imatge(buf, tipus) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': tipus || 'image/jpeg', 'Cache-Control': CACHE },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  };
}

function edat(updated) {
  if (!updated) return null;
  const q = new Date(updated);
  return isNaN(q) ? null : Math.round((Date.now() - q.getTime()) / 60000);
}

// 1) La que puja l'ordinador del club.
async function desDelMagatzem() {
  try {
    const r = await magatzem().getWithMetadata('figuereta', { type: 'arrayBuffer' });
    if (!r || !r.data) return null;
    const m = r.metadata || {};
    return { buf: Buffer.from(r.data), tipus: m.type, updated: m.updated || null };
  } catch (e) {
    return null;
  }
}

// 2) La càmera amb adreça pròpia, si mai es fa servir.
async function desDeLaXarxa(url) {
  let r;
  try {
    r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch (e) {
    return { error: 'exception', detail: String(e).slice(0, 200) };
  }
  if (!r.ok) return { error: 'fetch_failed', status: r.status };
  const lastMod = r.headers.get('last-modified');
  const q = lastMod ? new Date(lastMod) : null;
  return {
    buf: Buffer.from(await r.arrayBuffer()),
    tipus: r.headers.get('content-type') || 'image/jpeg',
    updated: q && !isNaN(q) ? q.toISOString() : null,
  };
}

exports.handler = async function (event) {
  const meta = ((event.queryStringParameters || {}).meta || '') === '1';

  let foto = await desDelMagatzem();

  if (!foto) {
    const url = process.env.WEBCAM_URL;
    if (!url) return json(200, {
      ok: false,
      error: 'sense-imatge',
      message: 'La funció va bé; encara no s\'ha pujat cap foto.',
    });
    const r = await desDeLaXarxa(url);
    if (r.error) return json(200, Object.assign({ ok: false }, r));
    foto = r;
  }

  if (meta) return json(200, { ok: true, updated: foto.updated, age_min: edat(foto.updated) }, CACHE);
  return imatge(foto.buf, foto.tipus);
};
