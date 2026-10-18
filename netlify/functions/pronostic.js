// GET /api/pronostic
// Previsió del refugi feta amb el CONSENS de diversos models meteorològics,
// en lloc de la d'un sol servei.
//
// Per què: la taula municipal d'AEMET és la previsió de Pego poble (70 m) i
// el refugi està a la Vall d'Ebo, a 540 m i darrere de la serra: no fa el
// mateix temps. A més, qualsevol model a soles falla més que la mitjana de
// diversos — això és el que fan els serveis professionals.
//
// D'on ixen les dades: Open-Meteo (open-meteo.com), que serveix de franc i
// sense clau els models oficials de cinc organismes públics:
//   ECMWF (europeu) · NOAA/GFS (EUA) · DWD/ICON (Alemanya) ·
//   Météo-France/AROME (alta resolució) · UK Met Office.
// Webs com Windguru o Meteored mostren estos mateixos models; ací es demanen
// directament a l'origen.
//
// Com es decideix cada tram (matí 06–12, vesprada 12–18, nit 18–24):
//   - Pluja i temperatura: la MEDIANA dels models. Un model esgarrat no
//     arrossega el resultat, com passaria amb la mitjana.
//   - Vent: el més fort dels models, que és el que importa per a eixir.
//   - Cel: el codi de temps més repetit entre els models.
//   - "acord": quants models veuen el mateix (si plourà o no). Quan els
//     models es contradiuen, això és precisament el que cal saber.
//
// Torna els dies amb els mateixos camps que /api/aemet, perquè la pàgina els
// pinta igual, més 'acord' i 'models' de cada tram.

// Els dos llocs que es poden triar a la pàgina del temps. Les dos parelles
// de coordenades ixen de Google Maps; l'altura de Pego és la de l'estació
// d'AVAMET de les Verdales.
const LLOCS = {
  figuereta: {
    lat: process.env.REFUGI_LAT || '38.82086',
    lon: process.env.REFUGI_LON || '-0.14519',
    alt: process.env.REFUGI_ALT || '540',
  },
  // Pego té tres estacions d'AVAMET (Verdales, la Plana i Ambra), però la
  // previsió és una sola, la de les Verdales: estan a menys de 3 km i la
  // quadrícula dels models és més gran que això, així que calcular-ne tres
  // seria demanar-li el triple a un servei gratuït per a res.
  pego: {
    lat: process.env.PEGO_LAT || '38.83460',
    lon: process.env.PEGO_LON || '-0.11798',
    alt: process.env.PEGO_ALT || '89',
  },
};
const DIES = 7;

// Els noms dels models tal com els demana Open-Meteo.
const MODELS = [
  { id: 'ecmwf_ifs025', nom: 'ECMWF' },
  { id: 'gfs_seamless', nom: 'NOAA GFS' },
  { id: 'icon_seamless', nom: 'DWD ICON' },
  { id: 'meteofrance_seamless', nom: 'Météo-France' },
  { id: 'ukmo_seamless', nom: 'Met Office' },
];

const CAMPS = ['temperature_2m', 'precipitation_probability', 'precipitation', 'weather_code', 'wind_speed_10m', 'wind_direction_10m'];

function res(status, body, cache) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache || 'public, max-age=1800' },
    body: JSON.stringify(body),
  };
}

async function fetchAmbTemps(url, ms) {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(tm);
  }
}

function mediana(vals) {
  const v = vals.filter((x) => x != null && !isNaN(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

// Codis WMO -> el text en castellà que ja entén la pàgina (iconName()).
function descDeCodi(c) {
  if (c == null) return null;
  if (c === 0) return 'Despejado';
  if (c === 1) return 'Poco nuboso';
  if (c === 2) return 'Intervalos nubosos';
  if (c === 3) return 'Cubierto';
  if (c === 45 || c === 48) return 'Niebla';
  if (c >= 51 && c <= 57) return 'Lluvia escasa';
  if (c >= 61 && c <= 65) return 'Lluvia';
  if (c === 66 || c === 67) return 'Lluvia';
  if (c >= 71 && c <= 77) return 'Nieve';
  if (c >= 80 && c <= 82) return 'Chubascos';
  if (c === 85 || c === 86) return 'Nieve';
  if (c >= 95) return 'Tormenta';
  return null;
}

// Rumb en graus -> la rosa de 8 punts, com la que dona AEMET.
function rumb(graus) {
  if (graus == null || isNaN(graus)) return null;
  const r = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return r[Math.round((((graus % 360) + 360) % 360) / 45) % 8];
}

// Les hores vénen com "2026-10-18T07:00". Es llig el text i no new Date(),
// perquè demanem l'hora local d'Espanya i el servidor de Netlify va en UTC:
// convertir-ho col·locaria les hores en el dia que no toca.
function trosseja(hora) {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2})/.exec(String(hora || ''));
  return m ? { dia: m[1], h: parseInt(m[2], 10) } : null;
}

function tram(h) {
  if (h >= 6 && h < 12) return 'mati';
  if (h >= 12 && h < 18) return 'vesprada';
  if (h >= 18) return 'nit';
  return null; // 00–06: matinada, ja passada quan es mira la previsió
}

// Un model -> {dia: {tram: {temps, pluges, codis, vents}}}
function perTrams(hores, dades) {
  const out = {};
  (hores || []).forEach((hora, i) => {
    const t = trosseja(hora);
    if (!t) return;
    const tr = tram(t.h);
    if (!tr) return;
    if (!out[t.dia]) out[t.dia] = {};
    if (!out[t.dia][tr]) out[t.dia][tr] = { temps: [], pluges: [], mm: [], codis: [], vents: [], rumbs: [] };
    const b = out[t.dia][tr];
    const posa = (arr, v) => { if (v != null && !isNaN(v)) arr.push(v); };
    posa(b.temps, dades.temperature_2m && dades.temperature_2m[i]);
    posa(b.pluges, dades.precipitation_probability && dades.precipitation_probability[i]);
    posa(b.mm, dades.precipitation && dades.precipitation[i]);
    posa(b.codis, dades.weather_code && dades.weather_code[i]);
    posa(b.vents, dades.wind_speed_10m && dades.wind_speed_10m[i]);
    posa(b.rumbs, dades.wind_direction_10m && dades.wind_direction_10m[i]);
  });
  return out;
}

// El resum d'UN model per a UN tram.
function resumTram(b) {
  if (!b) return null;
  const codis = {};
  b.codis.forEach((c) => { codis[c] = (codis[c] || 0) + 1; });
  let codi = null, max = 0;
  Object.keys(codis).forEach((c) => { if (codis[c] > max) { max = codis[c]; codi = parseInt(c, 10); } });
  // Del tram interessa la pluja més alta (si plou dos hores de sis, plou) i
  // el vent més fort, no la mitjana, que amagaria les dos coses.
  return {
    temp: mediana(b.temps),
    pluja: b.pluges.length ? Math.max.apply(null, b.pluges) : null,
    mm: b.mm.length ? b.mm.reduce((a, c) => a + c, 0) : null,
    codi: codi,
    vent: b.vents.length ? Math.max.apply(null, b.vents) : null,
    rumb: b.rumbs.length ? b.rumbs[Math.floor(b.rumbs.length / 2)] : null,
  };
}

// Els resums de tots els models per a un tram -> el veredicte.
function consens(resums) {
  const r = resums.filter(Boolean);
  if (!r.length) return null;
  const pluja = mediana(r.map((x) => x.pluja));
  // Acord: quants models diuen el mateix sobre si plourà (llindar del 30 %).
  const mullats = r.filter((x) => x.pluja != null && x.pluja >= 30).length;
  const acord = Math.max(mullats, r.length - mullats);
  const codis = {};
  r.forEach((x) => { if (x.codi != null) codis[x.codi] = (codis[x.codi] || 0) + 1; });
  let codi = null, max = 0;
  Object.keys(codis).forEach((c) => { if (codis[c] > max) { max = codis[c]; codi = parseInt(c, 10); } });
  const vents = r.map((x) => x.vent).filter((v) => v != null);
  const rumbs = r.map((x) => x.rumb).filter((v) => v != null);
  return {
    desc: descDeCodi(codi),
    pluja: pluja == null ? null : Math.round(pluja),
    mm: mediana(r.map((x) => x.mm)),
    temp: mediana(r.map((x) => x.temp)),
    vent: vents.length ? { kmh: Math.round(Math.max.apply(null, vents)), dir: rumb(mediana(rumbs)) } : null,
    acord: acord,
    models: r.length,
  };
}

const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

// "2026-10-18" -> "dom. 18", el mateix format d'etiqueta que dona AEMET,
// perquè la pàgina el parteix igual. El dia de la setmana es calcula amb
// Date.UTC per a no dependre del fus del servidor.
function etiqueta(dia) {
  const p = dia.split('-').map(Number);
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return DOW[d.getUTCDay()] + '. ' + String(p[2]);
}

exports.handler = async function (event) {
  const q = (event && event.queryStringParameters) || {};
  // Les estacions d'un mateix lloc comparteixen previsió: "pego-plana" i
  // "pego-ambra" cauen en "pego". Si no es reconeix res, el refugi.
  var demanat = String(q.lloc || '').toLowerCase();
  if (!LLOCS[demanat]) demanat = demanat.split('-')[0];
  const clau = LLOCS[demanat] ? demanat : 'figuereta';
  const lloc = LLOCS[clau];
  const url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + encodeURIComponent(lloc.lat)
    + '&longitude=' + encodeURIComponent(lloc.lon)
    + (lloc.alt ? '&elevation=' + encodeURIComponent(lloc.alt) : '')
    + '&hourly=' + CAMPS.join(',')
    + '&models=' + MODELS.map((m) => m.id).join(',')
    + '&timezone=' + encodeURIComponent('Europe/Madrid')
    + '&forecast_days=' + DIES;

  let json;
  try {
    const r = await fetchAmbTemps(url, 7000);
    if (!r.ok) return res(200, { ok: false, error: 'fetch_failed', status: r.status }, 'public, max-age=300');
    json = await r.json();
  } catch (e) {
    console.error('pronostic:', e);
    return res(200, { ok: false, error: 'exception' }, 'public, max-age=300');
  }

  const hourly = json && json.hourly;
  if (!hourly || !hourly.time) return res(200, { ok: false, error: 'parse_failed' }, 'public, max-age=300');

  // Quan es demana més d'un model, Open-Meteo afig el nom del model al final
  // de cada camp: "temperature_2m_ecmwf_ifs025". Amb un sol model no ho fa,
  // així que es mira primer amb sufix i, si no hi és, sense.
  const perModel = [];
  const presents = [];
  MODELS.forEach((m) => {
    const dades = {};
    let cap = true;
    CAMPS.forEach((c) => {
      const v = hourly[c + '_' + m.id] || (MODELS.length === 1 ? hourly[c] : null);
      if (v) { dades[c] = v; cap = false; }
    });
    if (!cap) { perModel.push(perTrams(hourly.time, dades)); presents.push(m.nom); }
  });
  if (!perModel.length) return res(200, { ok: false, error: 'sense_models' }, 'public, max-age=300');

  // Tots els dies que apareixen en qualsevol model, en ordre.
  const dies = {};
  perModel.forEach((m) => Object.keys(m).forEach((d) => { dies[d] = 1; }));

  const days = Object.keys(dies).sort().map((dia) => {
    const tr = {};
    ['mati', 'vesprada', 'nit'].forEach((t) => {
      tr[t] = consens(perModel.map((m) => resumTram(m[dia] && m[dia][t])));
    });
    const amb = ['mati', 'vesprada', 'nit'].filter((t) => tr[t]);
    const temps = [];
    amb.forEach((t) => { if (tr[t].temp != null) temps.push(tr[t].temp); });
    const pluges = amb.map((t) => tr[t].pluja).filter((v) => v != null);
    const vents = amb.map((t) => tr[t].vent).filter(Boolean);
    const acords = amb.map((t) => tr[t].acord).filter((v) => v != null);
    return {
      label: etiqueta(dia),
      date_title: dia,
      data: dia,
      desc_mati: tr.mati && tr.mati.desc,
      desc_vesprada: tr.vesprada && tr.vesprada.desc,
      desc_nit: tr.nit && tr.nit.desc,
      desc_general: null,
      hora_general: null,
      precip_mati: tr.mati && tr.mati.pluja,
      precip_vesprada: tr.vesprada && tr.vesprada.pluja,
      precip_nit: tr.nit && tr.nit.pluja,
      precip_max: pluges.length ? Math.max.apply(null, pluges) : null,
      temp_min: temps.length ? Math.round(Math.min.apply(null, temps)) : null,
      temp_max: temps.length ? Math.round(Math.max.apply(null, temps)) : null,
      vent_mati: tr.mati && tr.mati.vent,
      vent_vesprada: tr.vesprada && tr.vesprada.vent,
      vent_nit: tr.nit && tr.nit.vent,
      vent_max: vents.length ? vents.reduce((a, b) => (b.kmh > a.kmh ? b : a)) : null,
      // El dia es queda amb el pitjor acord dels seus trams: si de vesprada
      // els models no es posen d'acord, el dia no és fiable encara que el
      // matí el vegen tots igual.
      acord: acords.length ? Math.min.apply(null, acords) : null,
      models: perModel.length,
      alerts: [],
    };
  });

  if (!days.length) return res(200, { ok: false, error: 'sense_dies' }, 'public, max-age=300');
  // 'calculat' és quan s'ha fet de veritat este càlcul. La resposta es
  // guarda 30 minuts (max-age), així que molta gent veurà esta mateixa hora:
  // és el que es vol dir, quan es va calcular i no quan s'ha mirat.
  return res(200, {
    ok: true, font: 'consens', models: presents, lloc: clau, lat: lloc.lat, lon: lloc.lon,
    calculat: new Date().toISOString(), days: days,
  });
};

exports._intern = { mediana, descDeCodi, rumb, tram, consens, etiqueta, perTrams, resumTram };
