/* CEPEGO — Previsió AEMET a 7 dies per al municipi de Pego (codi 03102).
   Llig /api/aemet (contracte JSON fix, vore netlify/functions/aemet.js) i
   munta una taula de previsió dins de <div id="aemet-forecast">.

   FORMA DE LA TAULA — per què és una fila per dia i no una targeta per dia:
   AEMET no dona el mateix detall per a tots els dies. Els primers porten
   matí / vesprada / nit per separat; el dia en curs pot haver perdut ja el
   matí; i els dies més llunyans només porten una previsió general per a tot
   el dia. Amb targetes verticals això es veia desigual (unes amb tres blocs
   i altres amb un). Amb files i columnes fixes, cada tram cau sempre davall
   de la mateixa capçalera, els trams que falten es marquen amb un guionet i
   els dies que només tenen previsió general ocupen les tres columnes amb
   l'etiqueta "Tot el dia". */
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
  function splitDayLabel(label) {
    var s = String(label || '').trim();
    var m = /^([a-záéíóúñ]+)\.?\s*(\d+)$/i.exec(s);
    if (!m) return { dowVa: s, dowEs: s, num: '' };
    var dow = m[1].toLowerCase();
    return {
      dowVa: (DOW_VA[dow] || m[1]) + '.',
      dowEs: m[1] + '.',
      num: m[2].replace(/^0+(?=\d)/, ''),
    };
  }

  /* ---------------------------------------------------------------- icones
     Icones SVG pròpies en lloc d'emoji: els emoji els dibuixa cada sistema
     operatiu a la seua manera (a Windows, Android i iOS no s'assemblen), no
     es poden acolorir i desentonen amb la tipografia de la web. Estes es
     veuen igual en tots els dispositius i fan servir els colors de la marca.
     Totes estan dibuixades sobre una graella de 32×32. */
  var C = { sun:'#E2A03C', moon:'#C9A24A', cloud:'#C6CEDA', cloudMid:'#AAB6C7', cloudDark:'#7E8CA4', rain:'#4470B4', bolt:'#E2A03C', snow:'#8FB4D8', fog:'#AEB7C4' };

  function svg(inner) {
    return '<svg class="wi" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }
  // Núvol massís, muntat amb dos cercles i un rectangle arrodonit que se
  // solapen: amb un únic color de farciment la silueta ix neta i no depén
  // de cap corba de Bézier escrita a mà.
  function cloud(fill, tx, ty, sc) {
    var g = (tx || ty || sc) ? '<g transform="translate(' + (tx || 0) + ',' + (ty || 0) + ') scale(' + (sc || 1) + ')">' : '<g>';
    return g + '<g fill="' + fill + '">' +
      '<circle cx="12" cy="17.5" r="5.2"/>' +
      '<circle cx="19.8" cy="15.6" r="6.6"/>' +
      '<rect x="6.8" y="17" width="18.6" height="7" rx="3.5"/>' +
      '</g></g>';
  }
  function sun(cx, cy, r, rayIn, rayOut) {
    var out = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + C.sun + '"/>';
    var rays = '';
    for (var i = 0; i < 8; i++) {
      var a = (Math.PI / 4) * i;
      var x1 = (cx + Math.cos(a) * rayIn).toFixed(2), y1 = (cy + Math.sin(a) * rayIn).toFixed(2);
      var x2 = (cx + Math.cos(a) * rayOut).toFixed(2), y2 = (cy + Math.sin(a) * rayOut).toFixed(2);
      rays += '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '"/>';
    }
    return out + '<g stroke="' + C.sun + '" stroke-width="2.1" stroke-linecap="round">' + rays + '</g>';
  }
  // Lluna creixent (path de Feather, dibuixat sobre 24 i escalat a 32).
  function moon(tx, ty, sc) {
    return '<g transform="translate(' + (tx || 0) + ',' + (ty || 0) + ') scale(' + (sc || 1.3333) + ')" fill="' + C.moon + '">' +
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></g>';
  }
  function drops(n) {
    var xs = n === 2 ? [13.2, 19.6] : [11, 16.4, 21.8];
    var d = '';
    for (var i = 0; i < xs.length; i++) d += '<path d="M' + xs[i] + ' 23.4l-1.7 4.4"/>';
    return '<g stroke="' + C.rain + '" stroke-width="2.5" stroke-linecap="round">' + d + '</g>';
  }
  function bolt() {
    return '<path fill="' + C.bolt + '" d="M18.8 19.6 12.4 27.4h3.2l-1.3 4 5.9-8.2h-3.3z"/>';
  }
  function flakes() {
    var g = '';
    [[11.6, 25.4], [20.4, 25.4], [16, 29.4]].forEach(function (p) {
      g += '<g transform="translate(' + p[0] + ',' + p[1] + ')">' +
        '<path d="M0 -2.5V2.5M-2.2 -1.25 2.2 1.25M-2.2 1.25 2.2 -1.25"/></g>';
    });
    return '<g stroke="' + C.snow + '" stroke-width="1.7" stroke-linecap="round">' + g + '</g>';
  }
  function fogLines() {
    return '<g stroke="' + C.fog + '" stroke-width="2.5" stroke-linecap="round">' +
      '<path d="M7.5 20.5h17"/><path d="M10 25h12.5"/><path d="M12.5 29.5h7.5"/></g>';
  }

  var ICONS = {
    clear_day:   function () { return svg(sun(16, 16, 6.4, 9.4, 13)); },
    clear_night: function () { return svg(moon(3.5, 3.5, 1.12)); },
    few_day:     function () { return svg(sun(11.5, 11, 4.6, 7, 9.6) + cloud(C.cloud, 5.5, 6.5, 0.76)); },
    few_night:   function () { return svg(moon(1, 0.5, 0.82) + cloud(C.cloud, 5.5, 6.5, 0.76)); },
    part_day:    function () { return svg(sun(11, 10.5, 4.4, 6.8, 9.2) + cloud(C.cloud, 3, 5, 0.86)); },
    part_night:  function () { return svg(moon(0.5, 0, 0.78) + cloud(C.cloud, 3, 5, 0.86)); },
    cloudy:      function () { return svg(cloud(C.cloudMid, 0, 1.5, 1)); },
    overcast:    function () { return svg(cloud(C.cloudDark, 0, 1.5, 1)); },
    showers:     function () { return svg(cloud(C.cloudMid, 0, -3, 0.9) + drops(2)); },
    rain:        function () { return svg(cloud(C.cloudDark, 0, -3, 0.9) + drops(3)); },
    storm:       function () { return svg(cloud(C.cloudDark, 0, -3.5, 0.88) + bolt()); },
    snow:        function () { return svg(cloud(C.cloudMid, 0, -3, 0.9) + flakes()); },
    fog:         function () { return svg(cloud(C.cloudMid, 0, -3.5, 0.8) + fogLines()); },
    unknown:     function () { return svg(cloud(C.cloudMid, 0, 1.5, 1)); },
  };

  // Descripció d'AEMET (sempre en castellà) → nom d'icona. AEMET fa servir
  // el mateix text de dia i de nit, així que la variant nocturna la decidim
  // ací a partir del tram horari.
  function iconName(desc, night) {
    var d = (desc || '').toLowerCase();
    if (!d) return 'unknown';
    if (d.indexOf('tormenta') !== -1) return 'storm';
    if (d.indexOf('nieve') !== -1 || d.indexOf('granizo') !== -1) return 'snow';
    if (d.indexOf('niebla') !== -1 || d.indexOf('bruma') !== -1 || d.indexOf('calima') !== -1) return 'fog';
    if (d.indexOf('lluvia escasa') !== -1 || d.indexOf('chubasco') !== -1) return 'showers';
    if (d.indexOf('lluvia') !== -1) return 'rain';
    if (d.indexOf('muy nuboso') !== -1 || d.indexOf('cubierto') !== -1) return 'overcast';
    // "poco nuboso" ha d'anar ABANS que la comprovació genèrica de "nuboso",
    // que altrament la capturaria primer (és una subcadena de "poco nuboso").
    if (d.indexOf('poco nuboso') !== -1) return night ? 'few_night' : 'few_day';
    if (d.indexOf('nubes altas') !== -1) return night ? 'few_night' : 'few_day';
    if (d.indexOf('intervalos nubosos') !== -1) return night ? 'part_night' : 'part_day';
    if (d.indexOf('nuboso') !== -1 || d.indexOf('nublado') !== -1 || d.indexOf('nubes') !== -1) return 'cloudy';
    if (d.indexOf('despejado') !== -1) return night ? 'clear_night' : 'clear_day';
    return 'unknown';
  }
  function icon(desc, night) { return (ICONS[iconName(desc, night)] || ICONS.unknown)(); }

  /* ------------------------------------------------------------ temperatura
     Escala de color per graus, amb els tons de la marca: blau fred → sage →
     ambre → ember. Serveix per a pintar la barra de rang de cada dia. */
  var SCALE = [[0,[92,127,191]], [10,[111,160,181]], [18,[156,168,106]], [26,[221,161,60]], [34,[195,74,34]], [40,[180,18,27]]];
  function tempColor(t) {
    if (t == null) return 'rgb(150,150,150)';
    if (t <= SCALE[0][0]) return 'rgb(' + SCALE[0][1].join(',') + ')';
    for (var i = 1; i < SCALE.length; i++) {
      if (t <= SCALE[i][0]) {
        var a = SCALE[i - 1], b = SCALE[i];
        var k = (t - a[0]) / (b[0] - a[0]);
        var c = [0, 1, 2].map(function (j) { return Math.round(a[1][j] + (b[1][j] - a[1][j]) * k); });
        return 'rgb(' + c.join(',') + ')';
      }
    }
    return 'rgb(' + SCALE[SCALE.length - 1][1].join(',') + ')';
  }

  /* ---------------------------------------------------------------- avisos */
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

  // Enllaç a la pàgina d'avisos d'AEMET, que és on estan les hores exactes de
  // començament i final de cada avís. La pàgina de predicció municipal, d'on
  // ixen estes dades, només dona el nivell i el fenomen.
  //
  // Els paràmetres són els que fa servir la mateixa pàgina de Pego als seus
  // enllaços d'avisos: ?w=hoy / mna / pmna per als tres primers dies (els
  // únics per als quals AEMET dona avisos) i l=770301, que és el codi de la
  // ZONA D'AVISOS de Pego. Amb el codi, el mapa d'AEMET s'obri ja centrat en
  // la zona; sense ell, s'obri a tota Espanya.
  //
  // OJO amb la zona: Pego és "Litoral nord d'Alacant" (770301), i el refugi
  // de la Vall d'Ebo cau a "Interior d'Alacant" (770302). Els avisos que es
  // pinten ací són els del poble, no els de la muntanya. Si algun dia es vol
  // canviar, ho diu la mateixa pàgina d'AEMET en el camp "Zona de avisos".
  var AVISOS_BASE = 'https://www.aemet.es/es/eltiempo/prediccion/avisos';
  var AVISOS_ZONA = '770301';
  var AVISOS_W = ['hoy', 'mna', 'pmna'];
  var AVISOS_TITLE = "Avís d'AEMET per a la zona Litoral nord d'Alacant. Obri la pàgina d'avisos, on estan les hores. · " +
    "Aviso de AEMET para la zona Litoral norte de Alicante. Abre la página de avisos, donde están las horas.";
  function avisosUrl(idx) {
    var w = AVISOS_W[idx];
    return AVISOS_BASE + (w ? '?w=' + w + '&l=' + AVISOS_ZONA : '');
  }

  /* ------------------------------------------------------------- muntatge */

  // Una cel·la de tram. `desc` buit vol dir que AEMET no dona eixe tram
  // (típic del dia en curs, que ja ha perdut el matí): es deixa un guionet
  // perquè les columnes seguisquen quadrant.
  function periodCell(desc, precip, night, span, labelVa, labelEs) {
    var cls = 'fc-p' + (span ? ' fc-p--all' : '');
    if (!desc) return '<div class="fc-p fc-p--empty" aria-hidden="true">–</div>';
    var pr = (precip != null && precip > 0)
      ? '<span class="fc-p__pr">' + Math.round(precip) + '%</span>' : '';
    return '<div class="' + cls + '" title="' + esc(desc) + '">' +
      icon(desc, night) +
      (labelVa ? '<span class="fc-p__lb">' + bi(labelVa, labelEs) + '</span>' : '') +
      pr + '</div>';
  }

  function rowHTML(d, range, todayNum, idx) {
    var lb = splitDayLabel(d.label);
    var isToday = todayNum != null && lb.num !== '' && parseInt(lb.num, 10) === todayNum;

    var hasSplit = !!(d.desc_mati || d.desc_vesprada || d.desc_nit);
    var periods = hasSplit
      ? periodCell(d.desc_mati, d.precip_mati, false) +
        periodCell(d.desc_vesprada, d.precip_vesprada, false) +
        periodCell(d.desc_nit, d.precip_nit, true)
      : periodCell(d.desc_general, d.precip_max, false, true, 'Tot el dia', 'Todo el día');

    // Barra de rang: on cau la mínima i la màxima del dia dins del rang de
    // tota la setmana. Deixa vore d'un colp d'ull quins dies refresquen.
    var bar = '';
    if (d.temp_min != null && d.temp_max != null && range.span > 0) {
      var left = ((d.temp_min - range.lo) / range.span) * 100;
      var width = Math.max(((d.temp_max - d.temp_min) / range.span) * 100, 6);
      if (left + width > 100) left = Math.max(0, 100 - width);
      bar = '<span class="fc-bar"><span class="fc-bar__f" style="left:' + left.toFixed(1) + '%;width:' + width.toFixed(1) +
        '%;background-image:linear-gradient(90deg,' + tempColor(d.temp_min) + ',' + tempColor(d.temp_max) + ')"></span></span>';
    } else {
      bar = '<span class="fc-bar"></span>';
    }

    var color = d.alert ? alertColor(d.alert) : null;
    var alertRow = '';
    // Només es pinta l'avís quan n'hi ha un de real. AEMET marca "Sin
    // peligro" la major part dels dies i repetir-ho set vegades només fa
    // soroll: si no ix res, és que no hi ha avís.
    if (color && color !== 'green') {
      var tr = translateAlert(d.alert);
      alertRow = '<a class="fc-alert fc-alert--' + color + '" href="' + esc(avisosUrl(idx)) + '" ' +
        'target="_blank" rel="noopener" title="' + esc(AVISOS_TITLE) + '">' +
        '<svg class="fc-alert__i" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.2 15.2 14H.8zM7.1 6v4h1.8V6zm0 5.2v1.6h1.8v-1.6z"/></svg>' +
        '<span>' + bi(esc(tr.va), esc(tr.es)) + '</span>' +
        '<span class="fc-alert__go" aria-hidden="true">&rsaquo;</span></a>';
    }

    return '<li class="fc-row' + (isToday ? ' fc-row--today' : '') + (color && color !== 'green' ? ' fc-row--alert fc-row--' + color : '') + '">' +
      '<div class="fc-day">' +
        (isToday
          ? '<span class="fc-day__today">' + bi('Hui', 'Hoy') + '</span>'
          : '<span class="fc-day__dow">' + bi(esc(lb.dowVa), esc(lb.dowEs)) + '</span>') +
        '<span class="fc-day__n">' + esc(lb.num) + '</span>' +
      '</div>' +
      '<div class="fc-periods">' + periods + '</div>' +
      '<div class="fc-temps">' +
        '<span class="fc-t fc-t--min">' + (d.temp_min != null ? Math.round(d.temp_min) + '°' : '') + '</span>' +
        bar +
        '<span class="fc-t fc-t--max">' + (d.temp_max != null ? Math.round(d.temp_max) + '°' : '') + '</span>' +
      '</div>' +
      alertRow +
      '</li>';
  }

  function tableHTML(days) {
    // Rang de temperatures de tota la setmana, per a escalar les barres.
    var mins = [], maxs = [];
    days.forEach(function (d) {
      if (d.temp_min != null) mins.push(d.temp_min);
      if (d.temp_max != null) maxs.push(d.temp_max);
    });
    var lo = mins.length ? Math.min.apply(null, mins) : 0;
    var hi = maxs.length ? Math.max.apply(null, maxs) : 0;
    var range = { lo: lo, span: hi - lo };
    var todayNum = new Date().getDate();

    return '<div class="fc-card">' +
      '<div class="fc-head" aria-hidden="true">' +
        '<div class="fc-day"></div>' +
        '<div class="fc-periods">' +
          colHead('Matí', 'Mañana', 'Matí', 'Mañ.') +
          colHead('Vesprada', 'Tarde', 'Vesp.', 'Tarde') +
          colHead('Nit', 'Noche', 'Nit', 'Noche') +
        '</div>' +
        '<div class="fc-temps"><span class="fc-h">' + bi('Mín / Màx', 'Mín / Máx') + '</span></div>' +
      '</div>' +
      '<ol class="fc-list">' + days.map(function (d, i) { return rowHTML(d, range, todayNum, i); }).join('') + '</ol>' +
      '</div>';
  }

  // Capçalera de columna amb dos versions del text: en pantalles molt
  // estretes "Vesprada" i "Mañana" no caben i s'ajuntaven amb la columna del
  // costat, així que allí es mostra la forma abreujada (ho decideix el CSS).
  function colHead(va, es, shortVa, shortEs) {
    return '<div class="fc-h">' +
      '<span class="fc-h__l">' + bi(va, es) + '</span>' +
      '<span class="fc-h__s">' + bi(shortVa, shortEs) + '</span></div>';
  }

  function msgHTML(va, es) { return '<p class="fc-msg">' + bi(va, es) + '</p>'; }

  el.className = (el.className ? el.className + ' ' : '') + 'aemet-fc';
  el.innerHTML = msgHTML('Carregant la previsió…', 'Cargando la previsión…');

  var src = el.getAttribute('data-aemet-src') || '/api/aemet';
  fetch(src, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (json) {
      if (!json || json.ok === false || !json.days || !json.days.length) throw new Error('bad response');
      el.innerHTML = tableHTML(json.days);
    })
    .catch(function () {
      el.innerHTML = msgHTML(
        'No s’ha pogut carregar la previsió d’AEMET ara mateix.',
        'No se ha podido cargar la previsión de AEMET ahora mismo.'
      );
    });
})();
