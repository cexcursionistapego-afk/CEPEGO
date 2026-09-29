// POST /api/webcam-upload
//
// Per ací puja la foto l'ordinador del club que té la càmera. Va directe a
// cepego.com, sense passar per cap servei de tercers.
//
// Per què no és FTP: Netlify no té cap màquina encesa on posar un servidor
// FTP. Açò fa el mateix paper, però per HTTPS i amb una clau.
//
// La foto NO es guarda al repositori ni entra en cap desplegament. Va a
// Netlify Blobs, que és emmagatzematge a banda. Si anara al repositori, cada
// publicació del panell /juansa —que passa cada vegada que algú toca el
// calendari o una notícia— tornaria a deixar el lloc com està al git i la
// foto desapareixeria fins a la següent.
//
// La clau viu a la variable d'entorn WEBCAM_UPLOAD_KEY de Netlify, mai al
// repositori. Només serveix per a pujar esta foto: qui la tinga no pot fer
// res més. Això és a propòsit i és la diferència amb un token de Netlify, que
// obriria el compte sencer.
//
// Ull: canviar la variable a Netlify no té efecte fins que hi ha un
// desplegament nou.

const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');

const MAX_BYTES = 4 * 1024 * 1024;
const TIPUS_OK = /^image\/(jpeg|png|webp)$/i;

function res(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

// Comparació de temps constant: amb un === es podria endevinar la clau lletra
// a lletra mirant quant tarda a respondre.
function clauCorrecta(rebuda, bona) {
  const a = Buffer.from(String(rebuda || ''));
  const b = Buffer.from(String(bona));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return res(405, { ok: false, error: 'method' });

  const clau = process.env.WEBCAM_UPLOAD_KEY;
  // Sense clau configurada NO es deixa passar. Ací no es falla en obert com
  // amb el captcha: allò era per a no deixar el club sense formularis, però
  // un endpoint d'escriptura obert és una invitació a que t'ompliguen el lloc
  // del que vulguen.
  if (!clau) return res(503, {
    ok: false,
    error: 'falta-clau-al-servidor',
    message: "WEBCAM_UPLOAD_KEY no li arriba a la funció. Posa-la a Netlify i fes un desplegament nou: sense redesplegar, la variable no s'aplica.",
  });

  const h = event.headers || {};
  const rebuda = String(h.authorization || h.Authorization || '').replace(/^Bearer\s+/i, '');
  if (!clauCorrecta(rebuda, clau)) return res(401, { ok: false, error: 'clau' });

  const tipus = String(h['content-type'] || h['Content-Type'] || '').split(';')[0].trim();
  if (!TIPUS_OK.test(tipus)) return res(400, { ok: false, error: 'tipus', message: 'Ha de ser una imatge JPEG, PNG o WEBP.' });

  if (!event.body) return res(400, { ok: false, error: 'buit' });
  const dades = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body, 'binary');
  if (!dades.length) return res(400, { ok: false, error: 'buit' });
  if (dades.length > MAX_BYTES) return res(413, { ok: false, error: 'massa-gran', message: 'La foto ha de pesar menys de 4MB.' });

  try {
    const store = getStore('webcam');
    await store.set('figuereta', dades, {
      metadata: { updated: new Date().toISOString(), type: tipus, bytes: dades.length },
    });
  } catch (e) {
    return res(500, { ok: false, error: 'store', detail: String(e).slice(0, 200) });
  }

  return res(200, { ok: true, bytes: dades.length });
};
