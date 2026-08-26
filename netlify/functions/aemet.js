// GET /api/aemet
//
// Fa de proxy/parser servidor de la pàgina pública d'AEMET (Agència Estatal de
// Meteorologia) amb la predicció a 7 dies per al municipi de Pego (codi
// AEMET "id03102"), i retorna les dades en JSON net perquè el frontend no
// haja de carregar el seu HTML/branding complet.
//
// Calibrat contra el codi font REAL de
// https://www.aemet.es/es/eltiempo/prediccion/municipios/pego-id03102
// (capturat 26-08-2026). Estructura de la taula #tabla_prediccion:
//   - Capçalera: <th class="borde_izq_dcha_fecha" title="dimecres 26"
//     colspan="N">mié. 26</th> — un <th> per dia, el colspan indica quants
//     "períodes" (trams horaris) ocupa eixe dia a la resta de files.
//   - Icona/estat del cel: cada període té un <th class=
//     "borde_izq_dcha_estado_cielo..."> amb <div class="fuente09em">HH–HHh
//     </div> (rang horari, no sempre present als dies més llunyans) i
//     <img title="Descripció" alt="Descripció">.
//   - Probabilitat de precipitació: fila de <td class="nocomunes">N%</td>,
//     una per període (mateix nombre total que trams de la capçalera).
//   - Temperatura mínima i màxima: fila de <td class="alinear_texto_centro
//     no_wrap comunes" colspan="N"><span class="texto_azul">mín</span> /
//     <span class="texto_rojo">màx</span></td> — una per DIA (colspan igual
//     que el de la capçalera per a eixe dia).
// Per a cada dia es reparteixen els períodes en "matí" (06–12h o 00–12h) i
// "vesprada" (12–18h, 18–24h o 12–24h); el tram 00–06h es descarta (no és ni
// matí ni vesprada). Als dies més llunyans (un sol tram sense rang horari)
// s'assigna l'únic període disponible a "vesprada".
//   - Fila "Avisos": <td class="comunes alinear_texto_centro" colspan="N">
//     amb un <a title="Sin peligro"> (o el nom de l'avís actiu) a dins —
//     només n'hi ha per als primers 2-3 dies, la resta de cel·les venen
//     buides (fons blau, sense <a>). El colspan de cada cel·la amb avís
//     coincideix amb el d'un dia de la capçalera, així que es mapegen 1 a 1
//     en ordre (avís[0]→dia[0], avís[1]→dia[1]...).

const URL = 'https://www.aemet.es/es/eltiempo/prediccion/municipios/pego-id03102';

function res(code, obj) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' },
    body: JSON.stringify(obj),
  };
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&deg;/g, '°').replace(/&ordm;/g, 'º')
    .replace(/&oacute;/g, 'ó').replace(/&iacute;/g, 'í').replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Oacute;/g, 'Ó').replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É')
    .replace(/&iexcl;/g, '¡').replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#176;/g, '°');
}

function toNumber(raw) {
  if (raw == null) return null;
  let s = String(raw).replace(/[^0-9,.\-]/g, '');
  if (!s) return null;
  s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

exports.handler = async function () {
  let html;
  try {
    const r = await fetch(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CEPEGO-meteo/1.0; +https://cepego.com)' },
    });
    if (!r.ok) return res(200, { ok: false, error: 'fetch_failed', status: r.status });
    html = await r.text();
  } catch (e) {
    return res(200, { ok: false, error: 'exception', detail: String(e).slice(0, 200) });
  }

  try {
    const days = parseAemet(html);
    if (!days.length) return res(200, { ok: false, error: 'parse_failed' });
    return res(200, { ok: true, municipi: 'Pego', codi: '03102', font: 'AEMET', days });
  } catch (e) {
    return res(200, { ok: false, error: 'parse_exception', detail: String(e).slice(0, 200) });
  }
};

function parseAemet(rawHtml) {
  const tStart = rawHtml.indexOf('id="tabla_prediccion"');
  if (tStart === -1) return [];
  const tableEnd = rawHtml.indexOf('</table>', tStart);
  const table = rawHtml.slice(tStart, tableEnd === -1 ? undefined : tableEnd);

  // --- Capçalera: dia + colspan (nombre de períodes que ocupa) ---
  const days = [];
  {
    const re = /<th class="borde_izq_dcha_fecha" title="([^"]+)"[^>]*colspan="(\d+)"\s*>([^<]*)<\/th>/g;
    let m;
    while ((m = re.exec(table)) !== null) {
      days.push({ title: decodeEntities(m[1]).trim(), colspan: parseInt(m[2], 10), label: decodeEntities(m[3]).trim() });
    }
  }
  if (!days.length) return [];

  // --- Períodes (icona/descripció + rang horari), en ordre, dins la primera fila de dades ---
  const periods = [];
  {
    const niv2Start = table.indexOf('cabecera_loc_niv2');
    const niv2End = niv2Start === -1 ? -1 : table.indexOf('</tr>', niv2Start);
    const niv2 = niv2Start === -1 ? '' : table.slice(niv2Start, niv2End);
    const thRe = /<th class="borde_izq_dcha_estado_cielo no_wrap">([\s\S]*?)<\/th>/g;
    let m;
    while ((m = thRe.exec(niv2)) !== null) {
      const block = m[1];
      const hourM = /<div class="fuente09em">([^<]*)<\/div>/.exec(block);
      const iconM = /title="([^"]*)"\s+alt="[^"]*"\s*\/>/.exec(block);
      periods.push({
        hour: hourM ? decodeEntities(hourM[1]).replace(/\s+/g, '') : null,
        desc: iconM ? decodeEntities(iconM[1]) : null,
      });
    }
  }

  // --- Probabilitat de precipitació: un valor per període ---
  const precipVals = [];
  {
    const secStart = table.indexOf('Probabilidad de precipitaci');
    const rowStart = secStart === -1 ? -1 : table.indexOf('<tr>', secStart);
    const rowEnd = rowStart === -1 ? -1 : table.indexOf('</tr>', rowStart);
    if (rowStart !== -1) {
      const row = table.slice(rowStart, rowEnd);
      const re = /<td class="nocomunes">([^<]*)<\/td>/g;
      let m;
      while ((m = re.exec(row)) !== null) precipVals.push(toNumber(m[1]));
    }
  }

  // --- Temperatura mínima i màxima: un parell per dia (colspan) ---
  const tempPairs = [];
  {
    const secStart = table.indexOf('Temperatura m');
    const rowStart = secStart === -1 ? -1 : table.indexOf('<tr>', secStart);
    const rowEnd = rowStart === -1 ? -1 : table.indexOf('</tr>', rowStart);
    if (rowStart !== -1) {
      const row = table.slice(rowStart, rowEnd);
      const re = /<td class="alinear_texto_centro no_wrap comunes"(?:\s+colspan="(\d+)")?\s*><span class="texto_azul">([^<]*)<\/span>[^<]*<span class="texto_rojo">([^<]*)<\/span><\/td>/g;
      let m;
      while ((m = re.exec(row)) !== null) {
        tempPairs.push({ min: toNumber(m[2]), max: toNumber(m[3]) });
      }
    }
  }

  // --- Avisos: un <a title="..."> per cel·la amb avís, només als primers dies ---
  const alerts = [];
  {
    const secStart = table.indexOf('Avisos');
    const rowStart = secStart === -1 ? -1 : table.indexOf('<tr>', secStart);
    const rowEnd = rowStart === -1 ? -1 : table.indexOf('</tr>', rowStart);
    if (rowStart !== -1) {
      const row = table.slice(rowStart, rowEnd);
      const re = /<td class="comunes alinear_texto_centro"[^>]*>\s*<a[^>]*title="([^"]*)"/g;
      let m;
      while ((m = re.exec(row)) !== null) alerts.push(decodeEntities(m[1]).trim());
    }
  }

  function bucket(hour) {
    if (hour === '06–12h' || hour === '00–12h') return 'mati';
    if (hour === '12–18h' || hour === '18–24h' || hour === '12–24h') return 'vesprada';
    return null;
  }

  // --- Assemblar per dia, agrupant períodes/precipitació pel colspan de la capçalera ---
  let idx = 0;
  return days.map((d, i) => {
    const group = periods.slice(idx, idx + d.colspan);
    const precipGroup = precipVals.slice(idx, idx + d.colspan);
    idx += d.colspan;
    // Dies amb un sol tram (la majoria dels dies més llunyans): encara que
    // eixe tram porte un rang horari que casualment case amb el patró de
    // "vesprada" (ex. "12–24h", que en realitat cobreix mig dia sencer), no
    // es pot dir que siga només de vesprada — es deixa com a previsió
    // general sense etiqueta. Només als dies amb 2+ trams (on sí que hi ha
    // una separació real matí/vesprada) es fa la distinció.
    let mati = null, vesprada = null, general = null;
    if (group.length > 1) {
      mati = group.find((p) => bucket(p.hour) === 'mati');
      vesprada = group.find((p) => bucket(p.hour) === 'vesprada');
      if (!mati && !vesprada) general = group[0].desc || null;
    } else if (group.length === 1) {
      general = group[0].desc || null;
    }
    const precipDefined = precipGroup.filter((v) => v != null);
    return {
      label: d.label,
      date_title: d.title,
      desc_mati: (mati && mati.desc) || null,
      desc_vesprada: (vesprada && vesprada.desc) || null,
      desc_general: general,
      precip_max: precipDefined.length ? Math.max(...precipDefined) : null,
      temp_min: tempPairs[i] ? tempPairs[i].min : null,
      temp_max: tempPairs[i] ? tempPairs[i].max : null,
      alert: alerts[i] || null,
    };
  });
}
