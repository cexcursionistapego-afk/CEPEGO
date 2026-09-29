// GET /api/webcam        -> la imatge de la webcam del refugi
// GET /api/webcam?meta=1 -> JSON amb quan es va actualitzar de veritat
//
// La càmera deixa una foto nova cada 5 minuts en un ordinador del club, que la
// puja per FTP al servidor sempre amb el mateix nom. Ací es fa de pont en lloc
// d'enllaçar-la directament al <img> per dos motius:
//
//   1. La Content-Security-Policy de les pàgines és 'img-src self data:'. Si
//      la imatge vinguera d'un altre domini, el navegador la bloquejaria i
//      caldria obrir la CSP a eixe domini. Passant per ací, per al navegador
//      és una imatge del propi lloc i no cal tocar res.
//   2. L'adreça del servidor de la càmera no queda escrita al repositori.
//
// L'adreça va a la variable d'entorn WEBCAM_URL de Netlify. Si no està
// configurada, açò respon que no ho està i la pàgina simplement no ensenya la
// webcam: val més que no hi siga que no un buit trencat.
//
// Ull: canviar la variable a Netlify no té efecte fins que hi ha un
// desplegament nou.

const CACHE = 'public, max-age=60, stale-while-revalidate=240';

function json(code, obj, cache) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache || 'no-store' },
    body: JSON.stringify(obj),
  };
}

exports.handler = async function (event) {
  const url = process.env.WEBCAM_URL;
  const meta = ((event.queryStringParameters || {}).meta || '') === '1';

  if (!url) return json(200, { ok: false, error: 'no-config' });

  let r;
  try {
    r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch (e) {
    return json(200, { ok: false, error: 'exception', detail: String(e).slice(0, 200) });
  }
  if (!r.ok) return json(200, { ok: false, error: 'fetch_failed', status: r.status });

  // Quan es va pujar la foto de veritat. És el que permet distingir "la càmera
  // va bé" de "la càmera s'ha quedat penjada i estem ensenyant una foto de fa
  // hores": sense això, una imatge vella pareix igual de fresca que una nova.
  const lastMod = r.headers.get('last-modified');
  const quan = lastMod ? new Date(lastMod) : null;
  const updated = quan && !isNaN(quan) ? quan.toISOString() : null;

  if (meta) {
    const minuts = updated ? Math.round((Date.now() - new Date(updated).getTime()) / 60000) : null;
    return json(200, { ok: true, updated: updated, age_min: minuts }, CACHE);
  }

  const buf = Buffer.from(await r.arrayBuffer());
  return {
    statusCode: 200,
    headers: {
      'Content-Type': r.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': CACHE,
    },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  };
};
