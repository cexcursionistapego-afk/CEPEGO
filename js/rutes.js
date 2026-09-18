/* CEPEGO — Filtre de la pàgina de rutes (dificultat, distància i població).

   Les fitxes ja venen pintades des del servidor amb data-dif, data-km i
   data-pobl (vore build/pages.py); ací només s'amaguen les que no casen. La
   barra ix amagada de l'HTML i es desplega des d'ací: dins d'un <option> no
   valen els <span> de va/es, així que els textos es munten en l'idioma de la
   pàgina. Si algú entra sense JS no veurà el filtre, però sí totes les rutes,
   que és el que importa. */
(function () {
  var barra = document.getElementById('rutes-filtre');
  var llista = document.getElementById('rutes-llista');
  if (!barra || !llista) return;

  var fitxes = [].slice.call(llista.querySelectorAll('.route[data-km]'));
  if (!fitxes.length) return;

  var es = document.documentElement.getAttribute('data-lang') === 'es';
  function t(va, txtEs) { return es ? txtEs : va; }

  var selDif = document.getElementById('f-dif');
  var selKm = document.getElementById('f-km');
  var selPobl = document.getElementById('f-pobl');
  var compte = document.getElementById('f-compte');
  var neteja = document.getElementById('f-neteja');
  var buit = document.getElementById('rutes-buit');

  function omple(sel, opcions) {
    sel.innerHTML = opcions.map(function (o) {
      return '<option value="' + o[0] + '">' + o[1] + '</option>';
    }).join('');
  }

  omple(selDif, [
    ['', t('Totes', 'Todas')],
    ['facil', t('Fàcil', 'Fácil')],
    ['moderada', 'Moderada'],
    ['dificil', t('Difícil', 'Difícil')]
  ]);
  // Els trams van de mínim inclòs a màxim exclòs, així una ruta de 5 km cau a
  // "5 – 10" i no a "menys de 5".
  omple(selKm, [
    ['', t('Totes', 'Todas')],
    ['0-5', t('Menys de 5 km', 'Menos de 5 km')],
    ['5-10', '5 – 10 km'],
    ['10-15', '10 – 15 km'],
    ['15-9999', t('Més de 15 km', 'Más de 15 km')]
  ]);
  // La llista de pobles ja ve del servidor; només cal posar-li el "Totes".
  selPobl.options[0].text = t('Totes', 'Todas');

  function filtra() {
    var dif = selDif.value, km = selKm.value, pobl = selPobl.value;
    var min = 0, max = Infinity;
    if (km) { var r = km.split('-'); min = +r[0]; max = +r[1]; }

    var visibles = 0;
    fitxes.forEach(function (f) {
      var d = parseFloat(f.getAttribute('data-km'));
      var cap = (!dif || f.getAttribute('data-dif') === dif) &&
                (!pobl || f.getAttribute('data-pobl') === pobl) &&
                d >= min && d < max;
      f.classList.toggle('route--off', !cap);
      // Les fitxes apareixen amb l'efecte de scroll de main.js. Si una estava
      // amagada i ara ix, pot ser que encara no haja passat per l'observador i
      // es quedaria invisible: se li marca l'estat final a mà.
      if (cap) { f.classList.add('in'); visibles++; }
    });

    var filtrant = !!(dif || km || pobl);
    compte.textContent = visibles === 1
      ? t('1 ruta', '1 ruta')
      : visibles + ' ' + t('rutes', 'rutas');
    neteja.hidden = !filtrant;
    buit.hidden = visibles > 0;
  }

  [selDif, selKm, selPobl].forEach(function (s) { s.addEventListener('change', filtra); });
  neteja.addEventListener('click', function () {
    selDif.value = ''; selKm.value = ''; selPobl.value = '';
    filtra();
  });

  barra.hidden = false;
  filtra();
})();
