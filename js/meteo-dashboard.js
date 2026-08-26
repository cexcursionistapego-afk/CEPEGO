/* CEPEGO — Dashboard meteorològic (La Figuereta + Pego)
   Substitueix l'iframe d'AVAMET per targetes pròpies, gràfiques i clares.
   Llig /api/meteo?station=figuereta i /api/meteo?station=pego (contracte JSON
   fix, vore build/pages.py). Es munta dins de <div id="meteo-dash-STATION">.
   Per a previsualitzacions/proves, cada contenidor pot dur
   data-meteo-src="ruta.json" per a llegir un fitxer local en lloc de l'API;
   si eixe fitxer és un objecte combinat {figuereta:{...},pego:{...}} també
   es reconeix automàticament. */
(function () {

  var STATIONS = {
    figuereta: {
      va: 'Refugi La Figuereta', es: 'Refugio La Figuereta',
      sub_va: 'Vall d’Ebo · 545 m alt.', sub_es: 'Vall d’Ebo · 545 m alt.',
      avamet: 'https://www.avamet.org/mxo-i.php?id=c30m135e02'
    },
    pego: {
      va: 'Pego', es: 'Pego',
      sub_va: 'Les Verdales · 89 m alt.', sub_es: 'Les Verdales · 89 m alt.',
      avamet: 'https://www.avamet.org/mxo-i.php?id=c30m102e14'
    }
  };

  var WIND_DEG = { N:0, NE:45, E:90, SE:135, S:180, SO:225, O:270, NO:315 };
  var WIND_NAME = {
    N:{va:'Nord',es:'Norte'}, NE:{va:'Nord-est',es:'Noreste'}, E:{va:'Est',es:'Este'},
    SE:{va:'Sud-est',es:'Sureste'}, S:{va:'Sud',es:'Sur'}, SO:{va:'Sud-oest',es:'Suroeste'},
    O:{va:'Oest',es:'Oeste'}, NO:{va:'Nord-oest',es:'Noroeste'}
  };

  /* ---------- utilitats ---------- */
  function bi(va, es) { return '<span class="va">' + va + '</span><span class="es">' + es + '</span>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }
  function dec(n) { return String(n).replace('.', ','); }
  function num(v, decimals, unit) {
    if (v === null || v === undefined || v === '' || isNaN(v)) return '—';
    var n = decimals ? Number(v).toFixed(decimals) : Math.round(v);
    return dec(n) + (unit ? ' ' + unit : '');
  }
  function relTime(iso) {
    if (!iso) return null;
    var d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    var mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return { va: bi('ara mateix', 'ahora mismo'), mins: 0 };
    if (mins < 60) return { va: bi('fa ' + mins + ' min', 'hace ' + mins + ' min'), mins: mins };
    var hours = Math.round(mins / 60);
    if (hours < 24) return { va: bi('fa ' + hours + ' h', 'hace ' + hours + ' h'), mins: mins };
    var days = Math.round(hours / 24);
    return { va: bi('fa ' + days + ' d', 'hace ' + days + ' d'), mins: mins };
  }
  function fullTs(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------- icones (línia, currentColor) ---------- */
  var ICON = {
    thermo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V4a2 2 0 1 0-4 0v10.76a4 4 0 1 0 4 0z"/><path d="M12 8v6"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.7 6 11a6 6 0 1 1-12 0c0-4.3 6-11 6-11z"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4M6 10l6-6 6 6"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/><path d="M12 15h.01"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.4 9.1 4 4 0 0 1 17 18H7z"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.86 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0z"/></svg>'
  };

  /* ---------- construcció de la targeta ---------- */
  function dotClass(mins) {
    if (mins === null || mins === undefined) return 'meteo-dash__dot--off';
    if (mins <= 20) return '';
    if (mins <= 180) return 'meteo-dash__dot--stale';
    return 'meteo-dash__dot--off';
  }

  function headHTML(meta, rel, fallback) {
    // fallback: { text: '<span class="va">…</span>…', dot: 'meteo-dash__dot--xxx' } used
    // while loading or on error, when there is no real "updated" timestamp yet.
    fallback = fallback || { text: bi('sense dades', 'sin datos'), dot: 'meteo-dash__dot--off' };
    return '' +
      '<div class="meteo-dash__head">' +
        '<div>' +
          '<div class="meteo-dash__name">' + bi(esc(meta.va), esc(meta.es)) + '</div>' +
          '<div class="meteo-dash__loc">' + bi(esc(meta.sub_va), esc(meta.sub_es)) + '</div>' +
        '</div>' +
        '<div class="meteo-dash__live" title="' + (rel ? esc(fullTs(rel.iso)) : '') + '">' +
          '<span class="meteo-dash__dot ' + (rel ? dotClass(rel.mins) : fallback.dot) + '"></span>' +
          '<span>' + (rel ? rel.va : fallback.text) + '</span>' +
        '</div>' +
      '</div>';
  }

  function skeletonHTML(meta) {
    return headHTML(meta, null, { text: bi('carregant…', 'cargando…'), dot: 'meteo-dash__dot--loading' }) +
      '<div class="meteo-dash__body meteo-dash__body--loading">' +
        '<div class="meteo-skel meteo-skel--temp"></div>' +
        '<div class="meteo-skel meteo-skel--row"></div>' +
        '<div class="meteo-skel meteo-skel--row"></div>' +
        '<p class="meteo-dash__loading-txt">' + bi('Carregant dades meteorològiques…', 'Cargando datos meteorológicos…') + '</p>' +
      '</div>';
  }

  function errorHTML(meta) {
    return headHTML(meta, null, { text: bi('sense connexió', 'sin conexión'), dot: 'meteo-dash__dot--off' }) +
      '<div class="meteo-dash__error">' +
        '<div class="meteo-dash__error-icon">' + ICON.warn + '</div>' +
        '<p>' + bi(
          'No s’ha pogut carregar la meteo ara mateix. Consulta-la directament a AVAMET.',
          'No se ha podido cargar el tiempo ahora mismo. Consúltalo directamente en AVAMET.'
        ) + '</p>' +
        '<a class="btn btn-outline" target="_blank" rel="noopener" href="' + esc(meta.avamet) + '">' +
          bi('Obrir a AVAMET', 'Abrir en AVAMET') + ' →' +
        '</a>' +
      '</div>';
  }

  function cardHTML(meta, d) {
    var rel = relTime(d.updated);
    if (rel) rel.iso = d.updated;
    var dir = d.wind_dir && WIND_NAME[d.wind_dir] ? d.wind_dir : null;
    var deg = dir ? WIND_DEG[dir] : null;
    var dirName = dir ? bi(WIND_NAME[dir].va, WIND_NAME[dir].es) : '—';

    return headHTML(meta, rel) +
      '<div class="meteo-dash__body">' +

        '<div class="meteo-dash__temp-row">' +
          '<div class="meteo-dash__temp-icon">' + ICON.thermo + '</div>' +
          '<div class="meteo-dash__temp-main">' + num(d.temp, 1) + '<sup>°C</sup></div>' +
          '<div class="meteo-dash__minmax">' +
            '<div><span class="v">' + num(d.temp_min, 1) + '°</span><span class="l">' + bi('Mín', 'Mín') + '</span></div>' +
            '<div><span class="v">' + num(d.temp_max, 1) + '°</span><span class="l">' + bi('Màx', 'Máx') + '</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="meteo-dash__stats">' +
          '<div class="meteo-dash__stat">' +
            '<div class="meteo-dash__stat-ic">' + ICON.drop + '</div>' +
            '<div class="v">' + num(d.humidity, 0, '%') + '</div>' +
            '<div class="l">' + bi('Humitat', 'Humedad') + '</div>' +
          '</div>' +
          '<div class="meteo-dash__stat meteo-dash__stat--wind">' +
            '<div class="meteo-dash__windrose">' +
              '<span class="meteo-dash__windrose-n">N</span>' +
              '<span class="meteo-dash__wind-arrow"' + (deg !== null ? ' style="transform:rotate(' + deg + 'deg)"' : ' style="opacity:.3"') + '>' + ICON.wind + '</span>' +
            '</div>' +
            '<div class="v">' + num(d.wind_speed, 0, 'km/h') + '</div>' +
            '<div class="l">' + bi('Vent', 'Viento') + (dir ? ' · ' + esc(dir) : '') + '</div>' +
            '<div class="sub">' + bi('Direcció', 'Dirección') + ': ' + dirName + '</div>' +
            '<div class="sub">' + bi('Ratxa màx.', 'Racha máx.') + ': ' + num(d.wind_gust_max, 0, 'km/h') + '</div>' +
          '</div>' +
          '<div class="meteo-dash__stat">' +
            '<div class="meteo-dash__stat-ic">' + ICON.gauge + '</div>' +
            '<div class="v">' + num(d.pressure, 0, 'hPa') + '</div>' +
            '<div class="l">' + bi('Pressió', 'Presión') + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="meteo-dash__precip">' +
          '<div><div class="meteo-dash__precip-ic">' + ICON.cloud + '</div><div class="v">' + num(d.precip_today, 1, 'mm') + '</div><div class="l">' + bi('Hui', 'Hoy') + '</div></div>' +
          '<div><div class="meteo-dash__precip-ic">' + ICON.cloud + '</div><div class="v">' + num(d.precip_month, 1, 'mm') + '</div><div class="l">' + bi('Este mes', 'Este mes') + '</div></div>' +
          '<div><div class="meteo-dash__precip-ic">' + ICON.cloud + '</div><div class="v">' + num(d.precip_year, 1, 'mm') + '</div><div class="l">' + bi('Enguany', 'Este año') + '</div></div>' +
        '</div>' +

      '</div>';
  }

  /* ---------- muntatge ---------- */
  function mount(id, station) {
    var el = document.getElementById(id);
    if (!el) return;
    var meta = STATIONS[station] || { va: station, es: station, sub_va: '', sub_es: '', avamet: '#' };
    el.classList.add('meteo-dash');
    el.innerHTML = skeletonHTML(meta);

    var src = el.getAttribute('data-meteo-src') || ('/api/meteo?station=' + encodeURIComponent(station));
    fetch(src, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        if (!json) throw new Error('bad response');
        var data = json;
        // suporta un fitxer mock combinat {figuereta:{...}, pego:{...}}
        if ((data.temp === undefined) && data[station]) data = data[station];
        if (data.ok === false) throw new Error('api error');
        el.innerHTML = cardHTML(meta, data);
      })
      .catch(function () {
        el.innerHTML = errorHTML(meta);
      });
  }

  function init() {
    mount('meteo-dash-figuereta', 'figuereta');
    mount('meteo-dash-pego', 'pego');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API pública mínima: útil per a muntar targetes addicionals (ex. pàgines
     de previsualització/proves) més enllà dels dos contenidors per defecte. */
  window.CepegoMeteoDash = { mount: mount, stations: STATIONS };
})();
