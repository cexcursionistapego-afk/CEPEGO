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
  var lloc = document.getElementById('webcam-lloc');
  var punt = document.getElementById('webcam-punt');

  var CADA = 5 * 60 * 1000;   // la càmera puja una foto cada 5 minuts
  var VELLA = 20;             // minuts a partir dels quals es considera penjada

  /* De nit la càmera no puja res, perquè no es veuria i gastaria de bades.
     Sense saber-ho, la pàgina es passaria la nit avisant que la imatge és
     vella, com si estiguera espatllada. Les hores es posen al panell
     (data/site.json) i han de ser LES MATEIXES que tinga programades
     l'ordinador de la càmera: si es canvien ahí, cal canviar-les allà. */
  var nit = null;   // { desde: minuts, fins: minuts }

  function aMinuts(txt) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(txt || '').trim());
    if (!m) return null;
    var h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
  }

  // Els minuts del panell tornats a "08:00" per a poder ensenyar-los.
  function horaNit(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  function esDeNit() {
    if (!nit) return false;
    var ara = new Date();
    var m = ara.getHours() * 60 + ara.getMinutes();
    // La franja creua la mitjanit (21:30 → 08:00), així que no val amb un
    // simple "està entre les dos".
    return nit.desde > nit.fins ? (m >= nit.desde || m < nit.fins)
                                : (m >= nit.desde && m < nit.fins);
  }

  var es = document.documentElement.getAttribute('data-lang') === 'es';
  function t(va, txtEs) { return es ? txtEs : va; }

  // La frase de dia ja ve escrita en l'HTML, en els dos idiomes. Es guarda
  // per a poder tornar-hi quan la càmera es recupera.
  var frasePerDefecte = lloc.innerHTML;

  function diu(text) {
    lloc.innerHTML = '<span class="webcam__punt" id="webcam-punt"></span>';
    lloc.appendChild(document.createTextNode(text));
    punt = document.getElementById('webcam-punt');
  }

  function pintaEstat(iso) {
    var base = t('La Figuereta', 'La Figuereta');
    if (esDeNit()) {
      diu(base + ' · ' + t('torna a les ', 'vuelve a las ') + horaNit(nit.fins));
      punt.className = 'webcam__punt webcam__punt--nit';
      panell.classList.remove('webcam--vella');
      return;
    }
    var min = iso ? Math.round((Date.now() - new Date(iso).getTime()) / 60000) : null;
    if (min != null && min >= VELLA) {
      diu(base + ' · ' + t('sense senyal', 'sin señal'));
      punt.className = 'webcam__punt webcam__punt--vella';
      panell.classList.add('webcam--vella');
      return;
    }
    // Tot normal: la frase de sempre, tal com ve de l'HTML.
    lloc.innerHTML = frasePerDefecte;
    punt = document.getElementById('webcam-punt');
    panell.classList.remove('webcam--vella');
  }

  // El navegador es guarda la imatge en memòria; sense canviar l'adreça
  // tornaria a ensenyar la mateixa una vegada i una altra.
  function refrescaImatge() {
    img.src = '/api/webcam?t=' + Date.now();
  }

  function refrescaEdat() {
    fetch('/api/webcam?meta=1&t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { pintaEstat(d && d.ok ? d.updated : null); })
      .catch(function () { pintaEstat(null); });
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

  fetch('/data/site.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (s) {
      var d = aMinuts(s && s.webcam_nit_desde), f = aMinuts(s && s.webcam_nit_fins);
      if (d != null && f != null && d !== f) nit = { desde: d, fins: f };
    })
    .catch(function () {})
    .then(function () { refrescaImatge(); refrescaEdat(); });

  var timer = setInterval(function () { refrescaImatge(); refrescaEdat(); }, CADA);

  // Molta gent deixa la pestanya oberta i torna al cap d'una estona: sense
  // això es trobaria la foto d'abans d'anar-se'n.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { refrescaImatge(); refrescaEdat(); }
  });

  window.addEventListener('pagehide', function () { clearInterval(timer); });
})();
