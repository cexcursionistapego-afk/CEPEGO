// GET /api/avisos
// Avisos oficials d'AEMET (Meteoalerta) per a la zona de Pego, tret de
// l'API OpenData. Són els mateixos que ensenya l'app d'AEMET: la fila
// "Avisos" de la taula municipal (aemet.js) és un resum que de vegades diu
// "Bajo" quan la zona està en roig.
//
// Necessita la variable AEMET_API_KEY a Netlify (la clau gratuïta
// d'opendata.aemet.es). Sense ella torna {ok:false, error:'no-key'} i la web
// es queda amb els avisos de la taula municipal, com abans.
//
// Com funciona l'API:
//   1. /avisos_cap/ultimoelaborado/area/77 (77 = Comunitat Valenciana) torna
//      un JSON amb "datos": una URL temporal.
//   2. Eixa URL dona un fitxer .tar (de vegades comprimit en gzip) amb un
//      XML en format CAP per cada avís.
//   3. De cada XML es llig el bloc en castellà (<info> amb es-ES): zona,
//      nivell, fenomen i franja horària. Només es queden els de la zona.
//
// No s'usen dependències: el tar es llig a mà (capçaleres de 512 bytes) i
// el gzip amb zlib, que ve amb Node.

const zlib = require('zlib');

const AREA = process.env.AEMET_AREA || '77';
const ZONA = (process.env.AEMET_ZONA || 'Litoral norte de Alicante').toLowerCase();
const API = 'https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/';

function res(status, body, cache) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache || 'public, max-age=600' },
    body: JSON.stringify(body),
  };
}

async function fetchAmbTemps(url, opts, ms) {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
  } finally {
    clearTimeout(tm);
  }
}

// Fitxers d'un .tar: capçalera de 512 bytes (nom als bytes 0-99, mida en
// octal als 124-135) seguida del contingut arrodonit a 512.
function llegirTar(buf) {
  const fitxers = [];
  let pos = 0;
  while (pos + 512 <= buf.length) {
    const cap = buf.slice(pos, pos + 512);
    if (cap.every((b) => b === 0)) break;
    const nom = cap.slice(0, 100).toString('utf8').replace(/\0.*$/, '');
    const mida = parseInt(cap.slice(124, 136).toString('utf8').replace(/\0.*$/, '').trim(), 8) || 0;
    const tipus = String.fromCharCode(cap[156] || 48);
    pos += 512;
    if ((tipus === '0' || tipus === '\0') && mida > 0) fitxers.push({ nom, dades: buf.slice(pos, pos + mida) });
    pos += Math.ceil(mida / 512) * 512;
  }
  return fitxers;
}

function desempaquetar(buf) {
  if (buf[0] === 0x1f && buf[1] === 0x8b) buf = zlib.gunzipSync(buf);
  // Un tar porta "ustar" a la posició 257; si no, és un XML solt.
  if (buf.slice(257, 262).toString() === 'ustar') return llegirTar(buf).map((f) => f.dades.toString('utf8'));
  return [buf.toString('utf8')];
}

function tag(xml, nom) {
  const m = new RegExp('<' + nom + '>([\\s\\S]*?)</' + nom + '>').exec(xml);
  return m ? m[1].trim() : null;
}

function parametre(info, nom) {
  const re = /<parameter>([\s\S]*?)<\/parameter>/g;
  let m;
  while ((m = re.exec(info)) !== null) {
    if ((tag(m[1], 'valueName') || '').toLowerCase() === nom.toLowerCase()) return tag(m[1], 'value');
  }
  return null;
}

const NIVELLS = { amarillo: 'Amarillo', naranja: 'Naranja', rojo: 'Rojo' };

// Un XML CAP -> avisos de la zona (pot haver-hi més d'una àrea per fitxer).
function avisosDe(xml) {
  const out = [];
  const reInfo = /<info>([\s\S]*?)<\/info>/g;
  let m;
  while ((m = reInfo.exec(xml)) !== null) {
    const info = m[1];
    if ((tag(info, 'language') || '').toLowerCase().indexOf('es') !== 0) continue;
    const nivell = (parametre(info, 'AEMET-Meteoalerta nivel') || '').toLowerCase().trim();
    if (!NIVELLS[nivell]) continue; // verd o desconegut
    const fen = parametre(info, 'AEMET-Meteoalerta fenomeno') || '';
    // "PR;Precipitación" -> "Precipitación". Si no hi és, del títol:
    // "Aviso de lluvias de nivel rojo" -> "lluvias".
    let fenomen = fen.indexOf(';') !== -1 ? fen.split(';').slice(1).join(';').trim() : fen.trim();
    if (!fenomen) {
      const ev = /aviso de (.+?) de nivel/i.exec(tag(info, 'event') || '');
      fenomen = ev ? ev[1] : (tag(info, 'event') || 'Aviso');
    }
    fenomen = fenomen.charAt(0).toUpperCase() + fenomen.slice(1);
    const reArea = /<area>([\s\S]*?)<\/area>/g;
    let a;
    while ((a = reArea.exec(info)) !== null) {
      const zona = tag(a[1], 'areaDesc') || '';
      if (zona.toLowerCase().indexOf(ZONA) === -1) continue;
      out.push({
        nivell: NIVELLS[nivell],
        fenomen: fenomen,
        titol: NIVELLS[nivell] + ' - ' + fenomen,
        inici: tag(info, 'onset') || tag(info, 'effective'),
        fi: tag(info, 'expires'),
        zona: zona,
      });
    }
  }
  return out;
}

exports.handler = async function () {
  const key = process.env.AEMET_API_KEY;
  if (!key) return res(200, { ok: false, error: 'no-key' }, 'public, max-age=300');
  try {
    const r1 = await fetchAmbTemps(API + AREA, { headers: { api_key: key, Accept: 'application/json' } }, 6000);
    const j = await r1.json().catch(() => null);
    if (!j || !j.datos) {
      console.error('avisos: resposta sense "datos"', r1.status, j && j.descripcion);
      return res(200, { ok: false, error: 'api', status: (j && j.estado) || r1.status }, 'public, max-age=300');
    }
    const r2 = await fetchAmbTemps(j.datos, {}, 6000);
    if (!r2.ok) return res(200, { ok: false, error: 'datos', status: r2.status }, 'public, max-age=300');
    const buf = Buffer.from(await r2.arrayBuffer());
    const avisos = [];
    const vist = {};
    desempaquetar(buf).forEach((xml) => {
      avisosDe(xml).forEach((a) => {
        const clau = a.titol + '|' + a.inici + '|' + a.fi;
        if (!vist[clau]) { vist[clau] = 1; avisos.push(a); }
      });
    });
    return res(200, { ok: true, zona: ZONA, avisos: avisos });
  } catch (e) {
    console.error('avisos:', e);
    return res(200, { ok: false, error: 'exception' }, 'public, max-age=300');
  }
};

// Per a les proves en Node.
exports._intern = { llegirTar, desempaquetar, avisosDe };
