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
  var G = [
    { c: 'green',  va: 'Sense tempesta',   es: 'Sin tormenta',
      dVa: 'El camp magnètic de la Terra està tranquil. Res a tindre en compte.',
      dEs: 'El campo magnético de la Tierra está tranquilo. Nada a tener en cuenta.' },
    { c: 'yellow', va: 'Tempesta menor',   es: 'Tormenta menor',
      dVa: 'Pot haver-hi xicotetes errades de GPS i la ràdio HF va una miqueta pitjor. Aurores només a latituds molt altes.',
      dEs: 'Puede haber pequeños fallos de GPS y la radio HF va algo peor. Auroras solo en latitudes muy altas.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'fluctuacions dèbils.', 'fluctuaciones débiles.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'afecció menor.', 'afección menor.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'ja se’n ressenten a partir d’este nivell.', 'ya se resienten a partir de este nivel.']
      ] },
    { c: 'orange', va: 'Tempesta moderada', es: 'Tormenta moderada',
      dVa: 'El GPS pot perdre precisió a estones i la ràdio HF falla a latituds altes.',
      dEs: 'El GPS puede perder precisión a ratos y la radio HF falla en latitudes altas.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'avisos de tensió a latituds altes.', 'avisos de tensión en latitudes altas.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'pot caldre corregir l’orientació dels satèl·lits.', 'puede hacer falta corregir la orientación de los satélites.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'afectats. Aurores visibles més al sud.', 'afectados. Auroras visibles más al sur.']
      ] },
    { c: 'orange', va: 'Tempesta forta',   es: 'Tormenta fuerte',
      dVa: 'El GPS pot fallar durant hores i la ràdio HF queda tocada. Si tires de navegador a la muntanya, porta mapa i brúixola.',
      dEs: 'El GPS puede fallar durante horas y la radio HF queda tocada. Si tiras de navegador en la montaña, lleva mapa y brújula.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'cal corregir tensions i salten falses alarmes.', 'hay que corregir tensiones y saltan falsas alarmas.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'navegació per satèl·lit intermitent.', 'navegación por satélite intermitente.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'afectats. Aurores encara més al sud.', 'afectados. Auroras aún más al sur.']
      ] },
    { c: 'red',    va: 'Tempesta severa',  es: 'Tormenta severa',
      dVa: 'GPS i ràdio HF poc fiables durant hores. No et refies del mòbil ni del rellotge GPS per a orientar-te.',
      dEs: 'GPS y radio HF poco fiables durante horas. No te fíes del móvil ni del reloj GPS para orientarte.',
      imp: [
        ['Xarxa elèctrica', 'Red eléctrica', 'problemes estesos de control de tensió.', 'problemas extendidos de control de tensión.'],
        ['Satèl·lits i GPS', 'Satélites y GPS', 'navegació degradada durant hores.', 'navegación degradada durante horas.'],
        ['Aus i animals migratoris', 'Aves y animales migratorios', 'afectats. Aurores a latituds mitjanes.', 'afectados. Auroras en latitudes medias.']
      ] },
    { c: 'red',    va: 'Tempesta extrema', es: 'Tormenta extrema',
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
    var info = gInfo(n);
    var color = info ? info.c : 'green';
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

  function nowHTML(a, vent) {
    var info = gInfo(a.g);
    var color = info ? info.c : 'green';
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
        secondary(a) +
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
  function secondary(a) {
    function pill(lletra, n, quiVa, quiEs, beVa, beEs, malVa, malEs) {
      var txt = n == null
        ? bi('sense dades', 'sin datos')
        : (n > 0 ? bi(malVa + ' ' + lletra + n, malEs + ' ' + lletra + n) : bi(beVa, beEs));
      return '<span class="solar-mini" title="' + esc(lletra + (n == null ? '?' : n) + ' · escala NOAA') + '">' +
        bi(quiVa, quiEs) + ' <b>' + txt + '</b></span>';
    }
    return '<span class="solar-minis">' +
      pill('R', a.r, 'Ràdio HF:', 'Radio HF:', 'sense apagades', 'sin apagones', 'apagades', 'apagones') +
      pill('S', a.s, 'Radiació solar:', 'Radiación solar:', 'normal', 'normal', 'tempesta', 'tormenta') +
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
      '<div class="solar-days__t">' + bi('Pròxims dies', 'Próximos días') + '</div>' +
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

  function msgHTML(va, es) { return '<p class="fc-msg">' + bi(va, es) + '</p>'; }

  el.innerHTML = msgHTML('Carregant l’activitat solar…', 'Cargando la actividad solar…');

  var src = el.getAttribute('data-solar-src') || '/api/solar';
  fetch(src, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (json) {
      if (!json || json.ok === false || !json.actual) throw new Error('bad response');
      el.innerHTML = nowHTML(json.actual, json.vent) + daysHTML(json.dies || []);
    })
    .catch(function () {
      el.innerHTML = msgHTML(
        'No s’ha pogut carregar l’activitat solar ara mateix.',
        'No se ha podido cargar la actividad solar ahora mismo.'
      );
    });
})();
