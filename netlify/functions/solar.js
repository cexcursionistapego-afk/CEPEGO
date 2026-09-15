// GET /api/solar
//
// Proxy de les dades d'activitat solar del NOAA Space Weather Prediction
// Center (SWPC) per a la secció solar de meteo.html. Cal que passe pel
// servidor: la CSP del lloc porta "connect-src 'self'" (vore CSP a
// build/gen.py), així que el navegador no pot cridar NOAA directament.
//
// Fonts (les mateixes que fa servir el bloc "Space Weather Conditions" de
// spaceweather.gov, vore /modules/custom/swx_noaa_scales/ i /swpc_summary/):
//
//   products/noaa-scales.json  → escales R/S/G. Claus:
//        "-1" màxims observats en les últimes 24 h
//        "0"  última observació
//        "1","2","3" predicció per als tres pròxims dies
//      Cada una porta DateStamp/TimeStamp i els objectes R, S i G amb
//      Scale ("0".."5" o null) i Text. R porta a més MinorProb/MajorProb
//      (probabilitat d'R1-R2 i R3-R5) i S porta Prob (S1 o superior).
//   products/summary/solar-wind-speed.json    → WindSpeed
//   products/summary/solar-wind-mag-field.json → Bt, Bz
//   products/summary/10cm-flux.json            → Flux
//
// Del Text en anglés de NOAA no se'n fa res: el nivell es tradueix al
// navegador a partir del número d'escala (vore js/solar.js), així ix sempre
// en l'idioma de la pàgina.

const SCALES_URL = 'https://services.swpc.noaa.gov/products/noaa-scales.json';
const WIND_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json';
const MAG_URL = 'https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json';
const FLUX_URL = 'https://services.swpc.noaa.gov/products/summary/10cm-flux.json';

const UA = 'Mozilla/5.0 (compatible; CEPEGO-meteo/1.0; +https://cepego.com)';

function res(code, obj) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900' },
    body: JSON.stringify(obj),
  };
}

async function getJson(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}

// NOAA torna els números com a cadena ("1", "10", "414.0") i deixa en null
// el que no aplica (p. ex. l'escala d'un dia de predicció sense avís).
function num(v) {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function scaleOf(block) {
  return block ? num(block.Scale) : null;
}

exports.handler = async function () {
  const [scales, wind, mag, flux] = await Promise.all([
    getJson(SCALES_URL), getJson(WIND_URL), getJson(MAG_URL), getJson(FLUX_URL),
  ]);

  if (!scales || typeof scales !== 'object') return res(200, { ok: false, error: 'fetch_failed' });

  const day = (k) => {
    const d = scales[k];
    if (!d) return null;
    return {
      data: d.DateStamp || null,
      hora: d.TimeStamp || null,
      r: scaleOf(d.R),
      s: scaleOf(d.S),
      g: scaleOf(d.G),
      r_minor: d.R ? num(d.R.MinorProb) : null,
      r_major: d.R ? num(d.R.MajorProb) : null,
      s_prob: d.S ? num(d.S.Prob) : null,
    };
  };

  const actual = day('0');
  const dies = ['1', '2', '3'].map(day).filter(Boolean);
  if (!actual && !dies.length) return res(200, { ok: false, error: 'parse_failed' });

  return res(200, {
    ok: true,
    font: 'NOAA SWPC',
    actual,
    max24h: day('-1'),
    dies,
    vent: {
      velocitat: wind ? num(wind.WindSpeed) : null,
      bt: mag ? num(mag.Bt) : null,
      bz: mag ? num(mag.Bz) : null,
      flux: flux ? num(flux.Flux) : null,
    },
  });
};
