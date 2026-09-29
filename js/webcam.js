/* CEPEGO — Webcam del refugi a la pàgina de meteo.

   La càmera deixa una foto nova cada 5 minuts; ací es refresca al mateix
   ritme. El panell ix amagat de l'HTML i només es desplega si /api/webcam
   respon amb una imatge: si la càmera encara no està muntada o està caiguda,
   no ix res, que val més que un buit trencat.

   Es demanen dos coses: la imatge i, a banda, quan es va pujar de veritat
   (?meta=1). Això últim és el que permet avisar quan la càmera s'ha quedat
   penjada — una foto de fa sis hores es veu igual de nítida que una d'ara, i
   sense la data ningú se n'adonaria. */
(function () {
  var panell = document.getElementById('webcam');
  if (!panell) return;

  var img = document.getElementById('webcam-img');
  var quan = document.getElementById('webcam-quan');
  var punt = document.getElementById('webcam-punt');

  var CADA = 5 * 60 * 1000;   // la càmera puja una foto cada 5 minuts
  var VELLA = 20;             // minuts a partir dels quals es considera penjada

  var es = document.documentElement.getAttribute('data-lang') === 'es';
  function t(va, txtEs) { return es ? txtEs : va; }

  function textEdat(min) {
    if (min == null) return '';
    if (min < 1) return t('ara mateix', 'ahora mismo');
    if (min === 1) return t('fa 1 minut', 'hace 1 minuto');
    if (min < 60) return t('fa ' + min + ' minuts', 'hace ' + min + ' minutos');
    var h = Math.floor(min / 60);
    if (h === 1) return t('fa 1 hora', 'hace 1 hora');
    if (h < 24) return t('fa ' + h + ' hores', 'hace ' + h + ' horas');
    var d = Math.floor(h / 24);
    return d === 1 ? t('fa 1 dia', 'hace 1 día') : t('fa ' + d + ' dies', 'hace ' + d + ' días');
  }

  // L'hora es pinta en l'horari del qui mira, no en el del servidor: el
  // navegador ja sap en quin fus està i toLocaleTimeString ho resol sol.
  function hora(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleTimeString(es ? 'es-ES' : 'ca-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function pintaEdat(iso) {
    if (!iso) { quan.textContent = ''; punt.className = 'webcam__punt'; return; }
    // El compte es fa ací i no al servidor: la resposta pot vindre de la
    // caché, i si el número vinguera fet, es quedaria congelat fins a 4
    // minuts i l'hora no quadraria.
    var min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    var vella = min >= VELLA;
    var h = hora(iso);
    quan.textContent = (vella ? t('última imatge', 'última imagen') : t('actualitzada', 'actualizada'))
      + (h ? ' ' + t('a les ', 'a las ') + h : '')
      + ' · ' + textEdat(min);
    punt.className = 'webcam__punt' + (vella ? ' webcam__punt--vella' : '');
    panell.classList.toggle('webcam--vella', vella);
  }

  // El navegador es guarda la imatge en memòria; sense canviar l'adreça
  // tornaria a ensenyar la mateixa una vegada i una altra.
  function refrescaImatge() {
    img.src = '/api/webcam?t=' + Date.now();
  }

  function refrescaEdat() {
    fetch('/api/webcam?meta=1&t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { pintaEdat(d && d.ok ? d.updated : null); })
      .catch(function () { pintaEdat(null); });
  }

  img.addEventListener('load', function () {
    panell.hidden = false;
    panell.classList.add('in');
    // No estirar la foto més enllà del que fa de veritat: si la càmera envia
    // 640 px i ací l'amplem a 1.100, es veu borrosa. Millor xicoteta i
    // nítida, centrada, que gran i desenfocada.
    if (img.naturalWidth) img.style.maxWidth = img.naturalWidth + 'px';
  });
  // Si la càmera no respon, el panell es queda amagat i la pàgina segueix
  // igual que abans, amb les dos estacions i res més.
  img.addEventListener('error', function () { panell.hidden = true; });

  refrescaImatge();
  refrescaEdat();

  var timer = setInterval(function () { refrescaImatge(); refrescaEdat(); }, CADA);

  // Molta gent deixa la pestanya oberta i torna al cap d'una estona: sense
  // això es trobaria la foto d'abans d'anar-se'n.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { refrescaImatge(); refrescaEdat(); }
  });

  window.addEventListener('pagehide', function () { clearInterval(timer); });
})();
