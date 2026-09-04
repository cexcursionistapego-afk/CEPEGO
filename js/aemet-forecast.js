/* CEPEGO — Previsió AEMET a 7 dies per al municipi de Pego (codi 03102).
   Llig /api/aemet (contracte JSON fix, vore netlify/functions/aemet.js) i
   munta targetes senzilles dins de <div id="aemet-forecast">. */
(function () {
  var el = document.getElementById('aemet-forecast');
  if (!el) return;

  function bi(va, es) { return '<span class="va">' + va + '</span><span class="es">' + es + '</span>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  // AEMET sempre torna l'etiqueta del dia en castellà ("mié. 26", "jue. 27"…).
  // Es tradueix l'abreviatura del dia de la setmana per a la versió valenciana.
  var DOW_VA = { 'lun':'Dl', 'mar':'Dt', 'mié':'Dc', 'mie':'Dc', 'jue':'Dj', 'vie':'Dv', 'sáb':'Ds', 'sab':'Ds', 'dom':'Dg' };
  function translateDayLabel(label) {
    var s = String(label || '').trim();
    var m = /^([a-záéíóúñ]+)\.\s*(\d+)$/i.exec(s);
    if (!m || !DOW_VA[m[1].toLowerCase()]) return { va: s, es: s };
    return { va: DOW_VA[m[1].toLowerCase()] + '. ' + m[2], es: s };
  }

  // Icona segons paraules clau de la descripció d'AEMET (independent de
  // dia/nit: AEMET fa servir el mateix text per als dos, només canvia l'icona
  // pròpia que no reutilitzem ací).
  function emoji(desc) {
    var d = (desc || '').toLowerCase();
    if (d.indexOf('tormenta') !== -1) return '⛈️';
    if (d.indexOf('nieve') !== -1 || d.indexOf('granizo') !== -1) return '❄️';
    if (d.indexOf('niebla') !== -1 || d.indexOf('bruma') !== -1 || d.indexOf('calima') !== -1) return '🌫️';
    if (d.indexOf('lluvia escasa') !== -1 || d.indexOf('chubasco') !== -1) return '🌦️';
    if (d.indexOf('lluvia') !== -1) return '🌧️';
    if (d.indexOf('muy nuboso') !== -1 || d.indexOf('cubierto') !== -1) return '☁️';
    // "poco nuboso" ha d'anar ABANS que la comprovació genèrica de "nuboso",
    // que altrament la capturaria primer (és una subcadena de "poco nuboso").
    if (d.indexOf('poco nuboso') !== -1) return '🌤️';
    if (d.indexOf('nubes altas') !== -1) return '🌥️';
    if (d.indexOf('intervalos nubosos') !== -1 || d.indexOf('nuboso') !== -1 || d.indexOf('nublado') !== -1 || d.indexOf('nubes') !== -1) return '⛅';
    if (d.indexOf('despejado') !== -1) return '☀️';
    // Descripció d'AEMET no prevista: millor un cel genèric que un termòmetre
    // que no diu res sobre si fa sol, núvols, tempesta o boira.
    return d ? '⛅' : '🌡️';
  }

  // Nivell d'avís AEMET → color. El text pot vindre com a color explícit
  // ("Aviso amarillo por...") o com a nivell de risc ("Bajo - Temperaturas
  // máximas", "Moderado - ...", "Alto - ...", "Extremo - ..."), que és el
  // format real que fa servir la pàgina de predicció municipal.
  function alertColor(text) {
    var t = (text || '').toLowerCase();
    var nivell = t.split(' - ')[0].trim();
    if (nivell === 'rojo' || nivell === 'alto' || nivell === 'extremo') return 'red';
    if (nivell === 'naranja' || nivell === 'moderado' || nivell === 'importante') return 'orange';
    if (nivell === 'amarillo' || nivell === 'bajo') return 'yellow';
    if (t.indexOf('rojo') !== -1 || t.indexOf('extremo') !== -1) return 'red';
    if (t.indexOf('naranja') !== -1 || t.indexOf('moderado') !== -1) return 'orange';
    if (t.indexOf('amarillo') !== -1) return 'yellow';
    return 'green';
  }

  // AEMET sempre torna el text de l'avís en castellà; ací es tradueix el
  // cas més comú ("Sin peligro") i alguns termes freqüents dels avisos
  // actius. Si no es reconeix cap patró, es mostra el text original (en
  // castellà) també per a la versió valenciana, millor que no mostrar res.
  function translateAlert(text) {
    var t = String(text || '').trim();
    if (/^sin peligro$/i.test(t)) return { va: 'Sense perill', es: 'Sin peligro' };
    var va = t
      .replace(/Aviso amarillo/i, 'Avís groc')
      .replace(/Aviso naranja/i, 'Avís taronja')
      .replace(/Aviso rojo/i, 'Avís roig')
      // Format "Nivell - Fenomen" (p.ex. "Bajo - Temperaturas máximas"),
      // que és el que fa servir realment la pàgina de predicció municipal.
      .replace(/^Bajo\b/i, 'Baix')
      .replace(/^Moderado\b/i, 'Moderat')
      .replace(/^Alto\b/i, 'Alt')
      .replace(/^Extremo\b/i, 'Extrem')
      .replace(/por tormentas?/i, 'per tempestes')
      .replace(/por calor/i, 'per calor')
      .replace(/por fr[ií]o/i, 'per fred')
      .replace(/por lluvias?/i, 'per pluges')
      .replace(/por precipitaciones/i, 'per precipitacions')
      .replace(/por viento/i, 'per vent')
      .replace(/por nieve/i, 'per neu')
      .replace(/por niebla/i, 'per boira')
      .replace(/Temperaturas m[aá]ximas/i, 'Temperatures màximes')
      .replace(/Temperaturas m[ií]nimas/i, 'Temperatures mínimes')
      .replace(/Tormentas?/i, 'Tempestes')
      .replace(/Lluvias?/i, 'Pluges')
      .replace(/Precipitaciones/i, 'Precipitacions')
      .replace(/Viento/i, 'Vent')
      .replace(/Nieve/i, 'Neu')
      .replace(/Niebla/i, 'Boira')
      .replace(/Costeros?/i, 'Costaner');
    return { va: va, es: t };
  }

  function periodHTML(cls, labelVa, labelEs, desc, precip) {
    if (!desc) return '';
    return '' +
      '<div class="aemet-day__period ' + cls + '">' +
        (labelVa ? '<div class="aemet-day__period-l">' + bi(labelVa, labelEs) + '</div>' : '') +
        '<div class="aemet-day__ic" title="' + esc(desc) + '">' + emoji(desc) + '</div>' +
        (precip != null ? '<div class="aemet-day__period-precip">💧 ' + precip + '%</div>' : '') +
      '</div>';
  }

  function dayHTML(d) {
    var periods = (d.desc_mati || d.desc_vesprada || d.desc_nit)
      ? periodHTML('mati', 'Matí', 'Mañana', d.desc_mati, d.precip_mati) +
        periodHTML('vesprada', 'Vesprada', 'Tarde', d.desc_vesprada, d.precip_vesprada) +
        periodHTML('nit', 'Nit', 'Noche', d.desc_nit, d.precip_nit)
      : periodHTML('general', '', '', d.desc_general, d.precip_max);
    return '' +
      '<div class="aemet-day">' +
        '<div class="aemet-day__label">' + (function(tr){ return bi(esc(tr.va), esc(tr.es)); })(translateDayLabel(d.label)) + '</div>' +
        (d.alert ? '<div class="aemet-day__alert aemet-day__alert--' + alertColor(d.alert) + '">' + (function(tr){ return bi(esc(tr.va), esc(tr.es)); })(translateAlert(d.alert)) + '</div>' : '') +
        periods +
        '<div class="aemet-day__temps">' +
          (d.temp_max != null ? '<span class="mx">' + Math.round(d.temp_max) + '°</span>' : '') +
          (d.temp_min != null ? '<span class="mn">' + Math.round(d.temp_min) + '°</span>' : '') +
        '</div>' +
      '</div>';
  }

  function loadingHTML() {
    return '<p class="aemet-forecast__msg">' + bi('Carregant la previsió…', 'Cargando la previsión…') + '</p>';
  }
  function errorHTML() {
    return '<p class="aemet-forecast__msg">' + bi(
      'No s’ha pogut carregar la previsió d’AEMET ara mateix.',
      'No se ha podido cargar la previsión de AEMET ahora mismo.'
    ) + '</p>';
  }

  el.className = (el.className ? el.className + ' ' : '') + 'aemet-forecast';
  el.innerHTML = loadingHTML();

  var src = el.getAttribute('data-aemet-src') || '/api/aemet';
  fetch(src, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (json) {
      if (!json || json.ok === false || !json.days || !json.days.length) throw new Error('bad response');
      el.innerHTML = json.days.map(dayHTML).join('');
    })
    .catch(function () {
      el.innerHTML = errorHTML();
    });
})();
