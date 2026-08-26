// GET /api/meteo?station=figuereta|pego
//
// Fa de proxy/parser servidor de la pàgina pública d'AVAMET (xarxa d'estacions
// meteorològiques valenciana) per a les dues estacions del club, i retorna les
// dades en JSON net perquè el frontend no haja de carregar el seu iframe/branding.
//
// ============================================================================
// AVÍS IMPORTANT — CODI NO PROVAT CONTRA HTML REAL
// ============================================================================
// Aquest fitxer es va escriure sense accés de xarxa a avamet.org (bloquejat en
// aquest entorn de desenvolupament). Tot el que sabem de l'estructura de la
// pàgina prové d'una captura de pantalla del mòbil (només text renderitzat),
// NO del HTML/DOM real. Per tant:
//
//   - No sabem els noms de classes/ids reals que fa servir AVAMET.
//   - No sabem si les dades vénen inline al HTML, per JS/AJAX (en aquest cas
//     aquest fetch simple NO les veuria, i caldria trobar l'endpoint JSON/XML
//     intern que AVAMET use per a refrescar la pàgina), o generades per
//     plantilla al servidor (cas en què aquest enfocament SÍ funcionaria).
//   - Totes les regex de sota son heurístiques basades en el text visible
//     ("Actualització:", "amplitud tèrmica", "humitat relativa", "direcció",
//     "pressió relativa", "ràfega màxima", "precipitació hui"/"prec. mes"/
//     "prec. any") i asumeixen que el HTML té una etiqueta amb eixe text
//     seguida, en algun punt proper, pel valor numèric — potser separats per
//     tags <span>/<td>/<div>, &nbsp;, o salts de línia. És una suposició
//     raonable per a pàgines PHP "clàssiques" com aquesta, però NO verificada.
//   - El format numèric (coma decimal "27,1", graus "°", unitats "km/h",
//     "hPa", "mm") ve directament de la captura, per tant és fiable, però la
//     seua posició exacta dins del HTML és una suposició.
//
// TODO: recalibrar contra el codi font real de la pàgina en quan estiga
// disponible (ideal: guardar `curl` o "Veure codi font" de les dues URLs i
// ajustar les regexs de PATTERNS de sota una a una, comprovant amb
// `node -e` contra el HTML real abans de desplegar).
// ============================================================================

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

// Normalitza "27,1" / "27,1°" / "27,1 °C" → 27.1 (Number) o null.
// GUESSED: assumeix separador decimal coma (locale ca/es), com es veu a la
// captura de pantalla ("27,1°", "26,6°", "27,8°").
function toNumber(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/&nbsp;| /g, ' ').trim();
  if (!s || /^-+$/.test(s)) return null; // AVAMET sembla usar "-" o "- mm" per a "sense dada"
  const cleaned = s.replace(/,/g, '.').replace(/[^0-9.+-]/g, '');
  if (!cleaned || cleaned === '.' || cleaned === '-') return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Neteja tags HTML i entitats bàsiques d'un fragment abans d'aplicar-li regex numèrica.
function stripTags(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Busca una etiqueta de text (label) dins d'un text JA NETEJAT DE TAGS
// (vore stripTags) i intenta capturar el primer número (amb coma o punt
// decimal opcional) que apareix "a prop" darrere. Es treballa sobre text
// pla (no HTML cru) perquè el label mateix podria vindre partit per tags
// al HTML real (p.ex. "humitat <b>relativa</b>") — stripTags ho normalitza
// abans que la regex del label hi busque. GUESSED: la finestra de cerca de
// 120 caràcters és arbitrària — pot ser massa curta o massa llarga segons
// el HTML real; a recalibrar.
function findNumberNear(text, labelPattern, opts) {
  opts = opts || {};
  const window = opts.window || 120;
  const re = new RegExp(labelPattern, 'i');
  const m = re.exec(text);
  if (!m) return null;
  const start = m.index + m[0].length;
  const chunk = text.slice(start, start + window);
  // Si just darrere del label ve un guionet solt ("-", "- mm"...) és el codi
  // d'AVAMET per a "sense dada"/zero — cal aturar-se ací i NO seguir buscant
  // cap avant, perquè si no acabaríem agafant per error el número del SEGÜENT
  // camp (p.ex. "prec. mes - mm prec. any 713,0 mm" faria que "prec. mes"
  // retornara 713 en compte de null). GUESSED que el guionet és sempre just
  // darrere del label sense cap altre número pel mig.
  if (/^\s*-(?!\d)/.test(chunk)) return null;
  // primer número (enter o decimal, amb signe opcional) al text netejat
  const numMatch = /(-?\d+(?:[.,]\d+)?)/.exec(chunk);
  if (!numMatch) return null;
  return toNumber(numMatch[1]);
}

// Igual que findNumberNear però retorna el primer TOKEN de text (no numèric),
// útil per a la direcció del vent (p.ex. "SO", "NE"...). `text` ha d'estar
// ja net de tags (vore stripTags).
function findTokenNear(text, labelPattern, tokenList, opts) {
  opts = opts || {};
  const window = opts.window || 80;
  const re = new RegExp(labelPattern, 'i');
  const m = re.exec(text);
  if (!m) return null;
  const start = m.index + m[0].length;
  const chunk = text.slice(start, start + window).toUpperCase();
  for (const tok of tokenList) {
    const re2 = new RegExp('\\b' + tok + '\\b');
    if (re2.test(chunk)) return tok;
  }
  return null;
}

exports.handler = async function (event) {
  const q = (event.queryStringParameters || {});
  const stationKey = (q.station || '').toLowerCase();
  const station = STATIONS[stationKey];
  if (!station) return res(400, { ok: false, error: 'station' });

  let html;
  try {
    const r = await fetch(station.url, {
      headers: {
        // GUESSED: alguns servidors PHP antics bloquegen fetches sense
        // User-Agent "de navegador". No verificat contra AVAMET concretament.
        'User-Agent': 'Mozilla/5.0 (compatible; CEPEGO-meteo/1.0; +https://cepego.org)',
      },
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

// ----------------------------------------------------------------------------
// PARSER — TOT EL DE SOTA ÉS ESPECULATIU (vore l'avís de dalt del fitxer).
// Llista explícita de patrons "adivinats" que caldrà verificar/ajustar:
//
//   1. TEMP ACTUAL: se cerca el primer número gran amb "°" que aparega en
//      el document (fora de "mín"/"màx"). GUESSED que és el primer "N,N°"
//      del body sense anar precedit per "mín"/"màx"/"amplitud".
//   2. TEMP MIN/MAX: es busquen literalment "mín" i "màx" seguits d'un
//      número amb "°". GUESSED que AVAMET usa eixes paraules exactes (amb
//      accent) i no "min"/"max" sense accent o en castellà.
//   3. ACTUALITZACIÓ (updated): regex per a "Actualització" seguit de
//      "DD-MM-YYYY HH:MM". GUESSED el format exacte de data i que la zona
//      horària és sempre Europe/Madrid (+01:00 hivern / +02:00 estiu) — es
//      calcula ací manualment perquè el HTML probablement no done offset.
//   4. HUMITAT: cerca "humitat relativa" seguit d'un número + "%".
//   5. VENT (velocitat): cerca "vent" seguit d'un número + "km/h". RISC:
//      "vent" també podria aparèixer en "ràfega màxima del vent" o similar,
//      pot capturar el número equivocat si l'ordre real del HTML difereix
//      del text vist a la captura.
//   6. DIRECCIÓ: cerca "direcció" seguida d'un dels tokens de compàs
//      (N/NE/E/SE/S/SO/O/NO). GUESSED que AVAMET usa abreviatures catalanes
//      (SO en compte de SW). Si AVAMET usa castellà podria ser "SO" (sud-oest
//      en castellà també és SO, però "O" (oest) podria ser "O" o "W").
//   7. PRESSIÓ: cerca "pressió relativa" seguida d'un número + "hPa".
//   8. RÀFEGA MÀXIMA: cerca "ràfega màxima" seguida d'un número + "km/h".
//   9. PRECIPITACIÓ: cerca "precipitació hui"/"avui", "prec. mes"/"mensual",
//      "prec. any"/"anual" seguides d'un número + "mm", tractant "-" o
//      "- mm" com a null (sense dada / zero visual). GUESSED els diferents
//      textos possibles per a cada etiqueta ja que la captura només mostra
//      versions abreujades ("prec. mes", "prec. any").
//
// Cap d'aquests patrons s'ha pogut contrastar amb el HTML real. Qualsevol
// camp que no case amb prou confiança es deixa en `null` deliberadament.
// ----------------------------------------------------------------------------
function parseAvamet(html, stationName) {
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

  // Versió del document sense tags/entitats, per a fer les cerques de label
  // més tolerants a com AVAMET puga trencar el text amb <span>/<b>/&nbsp;/etc.
  // (vore avís de dalt: no sabem si açò és necessari, però és més segur que
  // buscar directament sobre HTML cru).
  const text = stripTags(html);

  // --- Actualització: "Actualització: 26-08-2026 00:40" (GUESSED format) ---
  {
    const m = /Actualitzaci[oó]\s*:?[\s\S]{0,40}?(\d{2})-(\d{2})-(\d{4})[\s\S]{0,15}?(\d{2}):(\d{2})/i.exec(text);
    if (m) {
      const [, dd, mm, yyyy, hh, min] = m;
      // Zona horària Europe/Madrid: CEST (+02:00) aprox. finals de març a
      // finals d'octubre, CET (+01:00) la resta de l'any. Aproximació simple
      // per mes (no calcula el diumenge exacte de canvi d'hora, GUESSED que
      // n'hi ha prou precisió per a mostrar l'hora al frontend).
      const monthNum = parseInt(mm, 10);
      const offset = (monthNum > 3 && monthNum < 11) ? '+02:00' : '+01:00';
      out.updated = `${yyyy}-${mm}-${dd}T${hh}:${min}:00${offset}`;
    }
  }

  // --- Temperatura actual: primer "N,N°" que no vaja precedit de mín/màx ---
  {
    // Cerca totes les ocurrències de número+° (tolerant espais/tags pel mig,
    // ja que treballem sobre `text` netejat) i descarta les que van justet
    // darrere de "mín"/"màx"/"amplitud" (per no confondre amb eixos valors).
    const re = /(-?\d{1,3}(?:[.,]\d)?)\s*°/g;
    let m;
    let candidate = null;
    while ((m = re.exec(text)) !== null) {
      const precedingCtx = text.slice(Math.max(0, m.index - 30), m.index).toLowerCase();
      if (/m[ií]n|m[àa]x|amplitud/.test(precedingCtx)) continue;
      candidate = m[1];
      break;
    }
    out.temp = toNumber(candidate);
  }

  // --- Mín / Màx ---
  out.temp_min = (function () {
    const m = /m[ií]n[^0-9\-]{0,30}(-?\d{1,3}(?:[.,]\d)?)\s*°/i.exec(text);
    return m ? toNumber(m[1]) : null;
  })();
  out.temp_max = (function () {
    const m = /m[àa]x[^0-9\-]{0,30}(-?\d{1,3}(?:[.,]\d)?)\s*°/i.exec(text);
    return m ? toNumber(m[1]) : null;
  })();

  // --- Humitat relativa (%) ---
  out.humidity = findNumberNear(text, 'humitat\\s*relativa');

  // --- Vent (velocitat, km/h) ---
  // GUESSED: cerca "vent" NO seguit immediatament de "ràfega" al mateix bloc;
  // com no podem provar-ho, simplement agafem la primera coincidència de
  // "vent" que no siga part de "direcció del vent" o "ràfega màxima".
  out.wind_speed = (function () {
    const re = /\bvent\b(?!\s*:?\s*(?:m[àa]xim|ràfega))/gi;
    let m;
    while ((m = re.exec(text)) !== null) {
      const chunk = text.slice(m.index, m.index + 80);
      const nm = /(-?\d+(?:[.,]\d+)?)\s*km\s*\/?\s*h/i.exec(chunk);
      if (nm) return toNumber(nm[1]);
    }
    return null;
  })();

  // --- Direcció del vent (compàs) ---
  out.wind_dir = findTokenNear(text, 'direcci[oó]', ['NNE', 'NNO', 'NNW', 'ENE', 'ESE', 'SSE', 'SSO', 'SSW', 'WSW', 'WNW', 'NE', 'NO', 'NW', 'SE', 'SO', 'SW', 'N', 'E', 'S', 'O', 'W']);

  // --- Pressió (hPa) ---
  // GUESSED label: "pressió relativa" ve de la captura de pantalla, però una
  // cerca web d'altres pàgines mxo-i.php d'AVAMET va trobar el text "pressió
  // al nivell de la mar" en alguna estació — per tant s'admeten totes dues
  // variants (i "pressió absoluta" per si de cas) fins que es puga confirmar
  // quina fa servir exactament aquesta estació.
  out.pressure = findNumberNear(text, 'pressi[oó]\\s*(?:relativa|al\\s*nivell\\s*de\\s*la\\s*mar|absoluta)');

  // --- Ràfega màxima (km/h) ---
  out.wind_gust_max = findNumberNear(text, 'r[àa]fega\\s*m[àa]xima');

  // --- Precipitació (mm) ---
  out.precip_today = findNumberNear(text, 'precipitaci[oó]\\s*(?:hui|avui|hoy)');
  out.precip_month = findNumberNear(text, 'prec\\.?\\s*mes|precipitaci[oó]\\s*mensual');
  out.precip_year = findNumberNear(text, 'prec\\.?\\s*any|precipitaci[oó]\\s*anual');

  return out;
}
