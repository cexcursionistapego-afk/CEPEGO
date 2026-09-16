/* CEPEGO — Activitat solar (NOAA SWPC) dins de <div id="solar-now">.
   Llig /api/solar (contracte JSON fix, vore netlify/functions/solar.js).

   El protagonista és l'escala G (tempestes geomagnètiques), que és la que
   es nota ací baix: GPS, ràdio i aurores. Les escales R (apagades de ràdio)
   i S (tempesta de radiació) van com a dada secundària, i el vent solar com
   a peu de dades, igual que ho presenta NOAA.

   Els colors són els mateixos quatre escalons que la llegenda d'avisos
   d'AEMET de la mateixa pàgina (verd / groc / taronja / roig), en lloc dels
   sis de NOAA: així les dos seccions parlen el mateix idioma visual. */
(function () {
  var el = document.getElementById('solar-now');
  if (!el) return;

  function bi(va, es) { return '<span class="va">' + va + '</span><span class="es">' + es + '</span>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  /* --------------------------------------------------------- escala G
     NOAA dona G0..G5. Ací cada nivell porta el nom, el color (un dels
     quatre de la pàgina) i què implica per a qui va a la muntanya. */
  // imp: els efectes que descriu la mateixa NOAA per a cada nivell
  // (swpc.noaa.gov/noaa-scales-explanation), resumits: [etiqueta va, es,
  // text va, text es]. A partir de G1 els animals migratoris ja se'n
  // ressenten, que és de les coses que més cride l'atenció de l'escala.
  // El color va pel número de nivell i val per a les tres escales: 1 groc,
  // 2-3 taronja, 4-5 roig. Són els quatre de la llegenda d'avisos d'AEMET.
  var COLORS = ['green', 'yellow', 'orange', 'orange', 'red', 'red'];
  function colorOf(n) { return (n != null && COLORS[n]) ? COLORS[n] : 'green'; }

  var G = [
    { va: 'Sense tempesta',   es: 'Sin tormenta',
      dVa: 'El camp magnètic de la Terra està tranquil. Res a tindre en compte.',
      dEs: 'El campo magnético de la Tierra está tranquilo. Nada a tener en cuenta.' },
    { va: 'Tempesta menor',   es: 'Tormenta menor',
      dVa: 'Pot haver-hi xicotetes errades de GPS i la ràdio HF va una miqueta pitjor. Aurores només a latituds molt altes.',
      dEs: 'Puede haber pequeños fallos de GPS y la radio HF va algo peor. Auroras solo en latitudes muy altas.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'fluctuacions dèbils.', 'fluctuaciones débiles.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'afecció menor.', 'afección menor.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'ja se’n ressenten a partir d’este nivell.', 'ya se resienten a partir de este nivel.']
      ] },
    { va: 'Tempesta moderada', es: 'Tormenta moderada',
      dVa: 'El GPS pot perdre precisió a estones i la ràdio HF falla a latituds altes.',
      dEs: 'El GPS puede perder precisión a ratos y la radio HF falla en latitudes altas.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'avisos de tensió a latituds altes.', 'avisos de tensión en latitudes altas.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'pot caldre corregir l’orientació dels satèl·lits.', 'puede hacer falta corregir la orientación de los satélites.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'afectats. Aurores visibles més al sud.', 'afectados. Auroras visibles más al sur.']
      ] },
    { va: 'Tempesta forta',   es: 'Tormenta fuerte',
      dVa: 'El GPS pot fallar durant hores i la ràdio HF queda tocada. Si tires de navegador a la muntanya, porta mapa i brúixola.',
      dEs: 'El GPS puede fallar durante horas y la radio HF queda tocada. Si tiras de navegador en la montaña, lleva mapa y brújula.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'cal corregir tensions i salten falses alarmes.', 'hay que corregir tensiones y saltan falsas alarmas.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'navegació per satèl·lit intermitent.', 'navegación por satélite intermitente.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'afectats. Aurores encara més al sud.', 'afectados. Auroras aún más al sur.']
      ] },
    { va: 'Tempesta severa',  es: 'Tormenta severa',
      dVa: 'GPS i ràdio HF poc fiables durant hores. No et refies del mòbil ni del rellotge GPS per a orientar-te.',
      dEs: 'GPS y radio HF poco fiables durante horas. No te fíes del móvil ni del reloj GPS para orientarte.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'problemes estesos de control de tensió.', 'problemas extendidos de control de tensión.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'navegació degradada durant hores.', 'navegación degradada durante horas.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'afectats. Aurores a latituds mitjanes.', 'afectados. Auroras en latitudes medias.']
      ] },
    { va: 'Tempesta extrema', es: 'Tormenta extrema',
      dVa: 'Situació excepcional: GPS i ràdio poden estar caiguts, i fins i tot la xarxa elèctrica se\'n pot ressentir.',
      dEs: 'Situación excepcional: GPS y radio pueden estar caídos, e incluso la red eléctrica puede resentirse.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'apagades generals i danys als transformadors.', 'apagones generales y daños en los transformadores.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'navegació degradada durant dies.', 'navegación degradada durante días.'],
        ['Ràdio HF', 'Radio HF', 'pot ser impossible durant un o dos dies.', 'puede ser imposible durante uno o dos días.']
      ] }
  ];
  function gInfo(n) { return (n != null && G[n]) ? G[n] : null; }
  function gLabel(n) { return n ? 'G' + n : 'G'; }

  /* ------------------------------------------- escales R i S (nivells 1-5)
     Les altres dos escales de NOAA. No es noten ací baix com la G, però van
     a la llegenda per a que es puga entendre què són quan ixen a la targeta.
     R: apagades de ràdio HF per fulguracions solars (entre parèntesis, la
     classe de la fulguració que marca el nivell). S: tempesta de radiació,
     que afecta sobretot satèl·lits, vols polars i astronautes. */
  var R = [
    { va: 'Apagada menor', es: 'Apagón menor',
      dVa: 'Fulguració de classe M1. La ràdio HF es degrada a la cara de dia i es pot perdre el contacte uns minuts.',
      dEs: 'Fulguración de clase M1. La radio HF se degrada en la cara de día y se puede perder el contacto unos minutos.' },
    { va: 'Apagada moderada', es: 'Apagón moderado',
      dVa: 'Classe M5. Apagada de ràdio HF limitada a la cara de dia, amb pèrdues de contacte de desenes de minuts.',
      dEs: 'Clase M5. Apagón de radio HF limitado en la cara de día, con pérdidas de contacto de decenas de minutos.' },
    { va: 'Apagada forta', es: 'Apagón fuerte',
      dVa: 'Classe X1. Apagada de ràdio HF d\'aproximadament una hora en tota la cara de dia.',
      dEs: 'Clase X1. Apagón de radio HF de aproximadamente una hora en toda la cara de día.' },
    { va: 'Apagada severa', es: 'Apagón severo',
      dVa: 'Classe X10. Apagada de ràdio HF d\'una a dues hores i errades de navegació durant hores.',
      dEs: 'Clase X10. Apagón de radio HF de una a dos horas y fallos de navegación durante horas.' },
    { va: 'Apagada extrema', es: 'Apagón extremo',
      dVa: 'Classe X20. Apagada total de ràdio HF en tota la cara de dia durant hores.',
      dEs: 'Clase X20. Apagón total de radio HF en toda la cara de día durante horas.' }
  ];
  var S = [
    { va: 'Radiació menor', es: 'Radiación menor',
      dVa: 'Sense efectes biològics. Alguna interferència xicoteta en la ràdio HF de les zones polars.',
      dEs: 'Sin efectos biológicos. Alguna interferencia pequeña en la radio HF de las zonas polares.' },
    { va: 'Radiació moderada', es: 'Radiación moderada',
      dVa: 'Risc baix d\'exposició extra per als passatgers i la tripulació dels vols polars.',
      dEs: 'Riesgo bajo de exposición extra para los pasajeros y la tripulación de los vuelos polares.' },
    { va: 'Radiació forta', es: 'Radiación fuerte',
      dVa: 'Ja es desvien vols polars i els astronautes de l\'ISS es refugien a la zona blindada. Els satèl·lits acumulen soroll i errades de memòria.',
      dEs: 'Ya se desvían vuelos polares y los astronautas de la ISS se refugian en la zona blindada. Los satélites acumulan ruido y fallos de memoria.' },
    { va: 'Radiació severa', es: 'Radiación severa',
      dVa: 'Dany real a l\'electrònica dels satèl·lits i risc de radiació sever per als astronautes.',
      dEs: 'Daño real a la electrónica de los satélites y riesgo de radiación severo para los astronautas.' },
    { va: 'Radiació extrema', es: 'Radiación extrema',
      dVa: 'Astronautes en perill greu, satèl·lits inutilitzables i apagada de ràdio HF a les zones polars durant dies.',
      dEs: 'Astronautas en peligro grave, satélites inutilizables y apagón de radio HF en las zonas polares durante días.' }
  ];

  /* ------------------------------------------------------------ dates
     NOAA dona la data com "2026-09-15". El dia de la setmana es munta ací
     per a que isca en l'idioma de la pàgina i no en anglés. */
  var DOW_VA = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];
  var DOW_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  function dayLabel(ds) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(ds || ''));
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (isNaN(d.getTime())) return null;
    var hui = new Date();
    var esHui = d.getDate() === hui.getDate() && d.getMonth() === hui.getMonth() && d.getFullYear() === hui.getFullYear();
    return {
      va: esHui ? 'Hui' : DOW_VA[d.getDay()] + '. ' + d.getDate(),
      es: esHui ? 'Hoy' : DOW_ES[d.getDay()] + '. ' + d.getDate()
    };
  }

  function badge(n, mida) {
    var color = colorOf(n);
    return '<span class="solar-badge solar-badge--' + color + (mida ? ' solar-badge--' + mida : '') + '">' +
      esc(gLabel(n)) + '</span>';
  }

  // NOAA marca l'hora en UTC. Ací es passa a l'hora del rellotge de qui
  // mira la pàgina, que en estiu va dos hores per davant d'UTC i en hivern
  // una: fent-ho amb Date, el canvi d'hora ja se'l menja el navegador.
  function localTime(data, hora) {
    var d = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(data || ''));
    var h = /^(\d{1,2}):(\d{2})/.exec(String(hora || ''));
    if (!d || !h) return null;
    var t = new Date(Date.UTC(+d[1], +d[2] - 1, +d[3], +h[1], +h[2]));
    if (isNaN(t.getTime())) return null;
    return ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2);
  }

  function nowHTML(a, vent, max24h) {
    var info = gInfo(a.g);
    var color = colorOf(a.g);
    var hora = localTime(a.data, a.hora);
    return '<div class="solar-now solar-now--' + color + '">' +
      '<div class="solar-now__head">' +
        badge(a.g, 'big') +
        '<div>' +
          '<div class="solar-now__kicker">' + bi('Ara mateix', 'Ahora mismo') + '</div>' +
          '<div class="solar-now__level">' + (info ? bi(info.va, info.es) : bi('Sense dades', 'Sin datos')) + '</div>' +
        '</div>' +
      '</div>' +
      (info ? '<p class="solar-now__desc">' + bi(info.dVa, info.dEs) + '</p>' : '') +
      impactsHTML(info) +
      '<div class="solar-now__meta">' +
        secondary(a, max24h) +
        (hora ? '<span class="solar-now__time">' + bi('Dada de les ', 'Dato de las ') + esc(hora) + ' h</span>' : '') +
      '</div>' +
      windHTML(vent) +
      '</div>';
  }

  // Els efectes que descriu NOAA per al nivell que hi ha ara mateix. Amb
  // G0 no se'n pinta cap: no hi ha res a contar i la targeta queda neta.
  function impactsHTML(info) {
    if (!info || !info.imp || !info.imp.length) return '';
    return '<ul class="solar-imp">' + info.imp.map(function (x) {
      return '<li><b>' + bi(x[0], x[1]) + ':</b> ' + bi(x[2], x[3]) + '</li>';
    }).join('') +
      '<li class="solar-imp__more"><a href="https://www.swpc.noaa.gov/noaa-scales-explanation" target="_blank" rel="noopener">' +
      bi('Què vol dir cada nivell (NOAA)', 'Qué significa cada nivel (NOAA)') + '</a></li></ul>';
  }

  // R i S no es noten ací baix tant com la G, però completen l'escala de
  // NOAA. Es diu la cosa i com està ("Ràdio HF: sense apagades"), no el codi
  // a seques: "R0" tot sol no li diu res a ningú. El codi queda al title.
  function secondary(a, max24h) {
    function pill(lletra, n, quiVa, quiEs, beVa, beEs, malVa, malEs) {
      var txt = n == null
        ? bi('sense dades', 'sin datos')
        : (n > 0 ? bi(malVa + ' ' + lletra + n, malEs + ' ' + lletra + n) : bi(beVa, beEs));
      return '<span class="solar-mini" title="' + esc(lletra + (n == null ? '?' : n) + ' · escala NOAA') + '">' +
        bi(quiVa, quiEs) + ' <b>' + txt + '</b></span>';
    }
    // El màxim de les últimes 24 h és el que aclarix si una tempesta que
    // figura a la previsió d'hui ja ha passat mentre ara està tot tranquil.
    var maxG = max24h ? max24h.g : null;
    var maxPill = maxG == null ? '' :
      '<span class="solar-mini">' + bi('Màxim últimes 24 h:', 'Máximo últimas 24 h:') +
      ' <b>' + (maxG > 0 ? esc('G' + maxG) : bi('cap', 'ninguna')) + '</b></span>';
    return '<span class="solar-minis">' +
      pill('R', a.r, 'Ràdio HF:', 'Radio HF:', 'sense apagades', 'sin apagones', 'apagades', 'apagones') +
      pill('S', a.s, 'Radiació solar:', 'Radiación solar:', 'normal', 'normal', 'tempesta', 'tormenta') +
      maxPill +
      '</span>';
  }

  function windHTML(v) {
    if (!v) return '';
    var items = [];
    if (v.velocitat != null) items.push({ v: Math.round(v.velocitat) + ' km/s', va: 'Vent solar', es: 'Viento solar' });
    if (v.bt != null && v.bz != null) items.push({ v: 'Bt ' + Math.round(v.bt) + ' · Bz ' + Math.round(v.bz) + ' nT', va: 'Camp magnètic', es: 'Campo magnético' });
    if (v.flux != null) items.push({ v: Math.round(v.flux) + ' sfu', va: 'Flux 10,7 cm', es: 'Flujo 10,7 cm' });
    if (!items.length) return '';
    return '<div class="solar-wind">' + items.map(function (x) {
      return '<div class="solar-wind__i"><div class="solar-wind__v">' + esc(x.v) + '</div>' +
        '<div class="solar-wind__l">' + bi(x.va, x.es) + '</div></div>';
    }).join('') + '</div>';
  }

  function daysHTML(dies) {
    if (!dies.length) return '';
    return '<div class="solar-days">' +
      '<div class="solar-days__t">' + bi('Pròxims dies', 'Próximos días') +
        '<span class="solar-days__s">' +
        bi('màxim previst per a cada dia, a qualsevol hora', 'máximo previsto para cada día, a cualquier hora') +
        '</span></div>' +
      '<ol class="solar-days__l">' + dies.map(function (d) {
        var lb = dayLabel(d.data);
        var info = gInfo(d.g);
        var probs = [];
        if (d.r_minor != null) probs.push({ k: 'R1-R2', v: d.r_minor });
        if (d.s_prob != null) probs.push({ k: 'S1+', v: d.s_prob });
        return '<li class="solar-day">' +
          '<div class="solar-day__d">' + (lb ? bi(esc(lb.va), esc(lb.es)) : '') + '</div>' +
          badge(d.g) +
          '<div class="solar-day__n">' + (info ? bi(info.va, info.es) : bi('Sense dades', 'Sin datos')) + '</div>' +
          (probs.length ? '<div class="solar-day__p">' + probs.map(function (p) {
            return '<span>' + esc(p.k) + ' <b>' + esc(p.v) + '%</b></span>';
          }).join('') + '</div>' : '') +
          '</li>';
      }).join('') + '</ol></div>';
  }

  // Llegenda de les tres escales de NOAA, de nivell 1 a 5 (el 0 no es
  // llista: vol dir que no passa res). Els noms i les descripcions ixen de
  // les mateixes taules que fa servir la targeta, així només estan escrits
  // en un lloc. La G va oberta, que és la que es nota ací; R i S van
  // plegades per a no soltar un mur de text a qui només vullga vore l'estat.
  function scaleBlock(lletra, titolVa, titolEs, subVa, subEs, taula, obert) {
    return '<details class="solar-scale__g"' + (obert ? ' open' : '') + '>' +
      '<summary><b>' + bi(titolVa, titolEs) + ' (' + lletra + ')</b>' +
      '<span>' + bi(subVa, subEs) + '</span></summary>' +
      '<ul class="solar-scale__l">' + taula.map(function (info, i) {
        var c = colorOf(i + 1);
        return '<li class="solar-scale__i solar-scale__i--' + c + '">' +
          '<span class="solar-badge solar-badge--' + c + '">' + lletra + (i + 1) + '</span>' +
          '<div><b>' + bi(info.va, info.es) + '</b>' +
          '<span>' + bi(info.dVa, info.dEs) + '</span></div></li>';
      }).join('') + '</ul></details>';
  }

  function scaleHTML() {
    return '<div class="solar-scale">' +
      '<div class="solar-days__t">' + bi('Què vol dir cada nivell', 'Qué significa cada nivel') + '</div>' +
      scaleBlock('G', 'Tempestes geomagnètiques', 'Tormentas geomagnéticas',
        'el que es nota ací baix: GPS, ràdio i aurores', 'lo que se nota aquí abajo: GPS, radio y auroras',
        G.slice(1), true) +
      scaleBlock('R', 'Apagades de ràdio', 'Apagones de radio',
        'fulguracions solars que tomben la ràdio HF', 'fulguraciones solares que tumban la radio HF',
        R, false) +
      scaleBlock('S', 'Tempestes de radiació solar', 'Tormentas de radiación solar',
        'satèl·lits, vols polars i astronautes', 'satélites, vuelos polares y astronautas',
        S, false) +
      '</div>';
  }

  function msgHTML(va, es) { return '<p class="fc-msg">' + bi(va, es) + '</p>'; }

  el.innerHTML = msgHTML('Carregant l’activitat solar…', 'Cargando la actividad solar…');

  var src = el.getAttribute('data-solar-src') || '/api/solar';
  fetch(src, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (json) {
      if (!json || json.ok === false || !json.actual) throw new Error('bad response');
      el.innerHTML = nowHTML(json.actual, json.vent, json.max24h) + daysHTML(json.dies || []) + scaleHTML();
    })
    .catch(function () {
      el.innerHTML = msgHTML(
        'No s’ha pogut carregar l’activitat solar ara mateix.',
        'No se ha podido cargar la actividad solar ahora mismo.'
      );
    });
})();
