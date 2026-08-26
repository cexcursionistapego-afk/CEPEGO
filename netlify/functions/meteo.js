// GET /api/meteo?station=figuereta|pego
//
// Fa de proxy/parser servidor de la pàgina pública d'AVAMET (xarxa d'estacions
// meteorològiques valenciana) per a les dues estacions del club, i retorna les
// dades en JSON net perquè el frontend no haja de carregar el seu iframe/branding.
//
// Calibrat contra el codi font REAL de la pàgina de l'estació de Pego
// (mxo-i.php?id=c30m102e14, capturat 26-08-2026). L'estructura és plantilla
// PHP clàssica amb els valors ja renderitzats al HTML (no calen JS/AJAX):
//   - Nom/coordenades: <h1>/<h3>, no cal parsejar-los (fem servir STATIONS[].name)
//   - Actualització: <h4>Actualització: <b>DD-MM-YYYY HH:MM</b></h4>
//   - Temp actual: <div id="mobVTemp">26<span class=decimal>,4°</span>...
//   - Mín/màx: <span class="mobTT">mín</span>24,6° (i "màx")
//   - Resta de valors: taula <table class="mobTaula"> amb parelles
//     <td class="mobVTT">ETIQUETA<br>...</td><td class="mobVTV[r]">VALOR<span class=unitats>UNITAT</span></td>
// No s'ha pogut verificar la pàgina de La Figuereta (c30m135e02) directament,
// però fa servir el mateix motor mxo-i.php, per tant s'assumeix idèntica
// plantilla — a confirmar si mai dona parse_failed per a eixa estació.
// El HTML ve amb entitats numèriques/nomenades (&deg;, &oacute;, &egrave;...)
// en compte d'UTF-8 directe, per això es decodifiquen abans de parsejar.

const STATIONS = {
  figuereta: {
    url: 'https://www.avamet.org/mxo-i.php?id=c30m135e02',
    name: 'Refugi La Figuereta',
  },
  pego: {
    url: 'https://www.avamet.org/mxo-i.php?id=c30m102e14',
    name: 'Pego',
  },
};

function res(code, obj) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    body: JSON.stringify(obj),
  };
}

// Decodifica les entitats HTML que AVAMET fa servir al seu HTML clàssic.
function decodeEntities(s) {
  return String(s || '')
    .replace(/&deg;/g, '°')
    .replace(/&oacute;/g, 'ó')
    .replace(/&iacute;/g, 'í')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&uacute;/g, 'ú')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&igrave;/g, 'ì')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

// "1.019" (punt = separador de milers) → 1019 ; "10,3" (coma = decimal) → 10.3
// Aplicat directament sobre un fragment amb tags/unitats: qualsevol caràcter
// que no siga dígit/coma/punt/signe es descarta primer, així "24<span
// class=unitats>km/h</span>" ja queda reduït a "24" sense parsejar tags a part.
function toNumber(raw) {
  if (raw == null) return null;
  let s = String(raw).replace(/[^0-9,.\-]/g, '');
  if (!s || /^-+$/.test(s)) return null;
  s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function cleanLabel(raw) {
  return decodeEntities(raw)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function cleanText(raw) {
  return decodeEntities(raw).replace(/<[^>]+>/g, '').trim();
}

exports.handler = async function (event) {
  const q = (event.queryStringParameters || {});
  const stationKey = (q.station || '').toLowerCase();
  const station = STATIONS[stationKey];
  if (!station) return res(400, { ok: false, error: 'station' });

  let html;
  try {
    const r = await fetch(station.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CEPEGO-meteo/1.0; +https://cepego.com)' },
    });
    if (!r.ok) return res(200, { ok: false, error: 'fetch_failed', status: r.status });
    html = await r.text();
  } catch (e) {
    return res(200, { ok: false, error: 'exception', detail: String(e).slice(0, 200) });
  }

  try {
    const data = parseAvamet(html, station.name);
    if (data.temp == null) {
      // El camp més essencial no s'ha pogut extraure: millor fallar net que
      // retornar un objecte gairebé buit que confonga el frontend.
      return res(200, { ok: false, error: 'parse_failed' });
    }
    return res(200, Object.assign({ ok: true }, data));
  } catch (e) {
    return res(200, { ok: false, error: 'parse_exception', detail: String(e).slice(0, 200) });
  }
};

function parseAvamet(rawHtml, stationName) {
  const html = decodeEntities(rawHtml);
  const out = {
    station_name: stationName,
    updated: null,
    temp: null,
    temp_min: null,
    temp_max: null,
    humidity: null,
    wind_speed: null,
    wind_dir: null,
    wind_gust_max: null,
    pressure: null,
    precip_today: null,
    precip_month: null,
    precip_year: null,
  };

  // --- Actualització: "Actualització: 26-08-2026 09:25" ---
  {
    const m = /Actualitzaci[oó]\s*:\s*<b>\s*(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\s*<\/b>/i.exec(html);
    if (m) {
      const [, dd, mm, yyyy, hh, min] = m;
      // Zona horària Europe/Madrid: aproximació per mes (CEST finals de març a
      // finals d'octubre, CET la resta de l'any) — prou precís per a mostrar
      // l'hora, no calcula el diumenge exacte de canvi d'hora.
      const monthNum = parseInt(mm, 10);
      const offset = (monthNum > 3 && monthNum < 11) ? '+02:00' : '+01:00';
      out.updated = `${yyyy}-${mm}-${dd}T${hh}:${min}:00${offset}`;
    }
  }

  // --- Temp actual: <div id="mobVTemp">26<span class=decimal>,4°</span> ---
  // (amb fallback per si alguna estació no porta el <span class=decimal>, p.ex.
  // temperatura sencera sense decimals — no verificat, per precaució)
  {
    const m = /<div id="mobVTemp">\s*(-?\d+)\s*<span class=decimal>\s*,?(\d+)?\s*°/i.exec(html);
    if (m) {
      out.temp = toNumber(m[2] ? `${m[1]},${m[2]}` : m[1]);
    } else {
      const m2 = /<div id="mobVTemp">\s*(-?[\d,.]+)\s*°/i.exec(html);
      if (m2) out.temp = toNumber(m2[1]);
    }
  }

  // --- Mín / Màx: <span class="mobTT">mín</span>24,6° ---
  {
    const mn = /<span class="mobTT">m[ií]n<\/span>\s*(-?[\d,.]+)\s*°/i.exec(html);
    out.temp_min = mn ? toNumber(mn[1]) : null;
    const mx = /<span class="mobTT">m[àa]x<\/span>\s*(-?[\d,.]+)\s*°/i.exec(html);
    out.temp_max = mx ? toNumber(mx[1]) : null;
  }

  // --- Taula de dades: parells <td class="mobVTT">etiqueta</td><td class="mobVTV[r]">valor</td> ---
  const map = {};
  {
    const re = /<td class="mobVTT">([\s\S]*?)<\/td>\s*<td class="mobVTVr?">([\s\S]*?)<\/td>/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      map[cleanLabel(m[1])] = m[2];
    }
  }

  out.humidity = toNumber(map['humitat relativa']);
  out.pressure = toNumber(map['pressió relativa'] != null ? map['pressió relativa'] : (map['pressió al nivell de la mar'] != null ? map['pressió al nivell de la mar'] : map['pressió absoluta']));
  out.wind_speed = toNumber(map['vent']);
  out.wind_gust_max = toNumber(map['ràfega màxima']);
  out.precip_today = toNumber(map['precipitació hui']);
  out.precip_month = toNumber(map['prec. mes']);
  out.precip_year = toNumber(map['prec. any']);
  out.wind_dir = map['direcció'] != null ? cleanText(map['direcció']).toUpperCase() || null : null;

  return out;
}
