/* CEPEGO — navegació, idioma (Valencià/Español) i galeria */
(function(){
  var root = document.documentElement;

  /* ---------- IDIOMA: Valencià per defecte, opció Español ---------- */
  var saved = null;
  try { saved = localStorage.getItem('cepego-lang'); } catch(e){}
  setLang(saved === 'es' ? 'es' : 'va');

  function setLang(l){
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'es' ? 'es' : 'ca-valencia');
    try { localStorage.setItem('cepego-lang', l); } catch(e){}
    document.querySelectorAll('[data-lang-btn]').forEach(function(b){
      b.textContent = (l === 'va') ? 'ES' : 'VA';
      b.setAttribute('aria-label', (l === 'va') ? 'Cambiar a Español' : 'Canviar a Valencià');
    });
  }

  document.addEventListener('click', function(e){
    var btn = e.target.closest('[data-lang-btn]');
    if(btn){ setLang(root.getAttribute('data-lang') === 'va' ? 'es' : 'va'); }
  });

  /* ---------- MENÚ MÒBIL ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){ nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('open'); });
    });
  }

  /* ---------- ANY AL PEU ---------- */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* ---------- GALERIA / LIGHTBOX ---------- */
  var imgs = Array.prototype.slice.call(document.querySelectorAll('.gallery a'));
  if(imgs.length){
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML = '<button class="lb__close" aria-label="Tancar">&times;</button>'+
      '<button class="lb__nav lb__prev" aria-label="Anterior">&#8249;</button>'+
      '<img alt="">'+
      '<button class="lb__nav lb__next" aria-label="Següent">&#8250;</button>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'); var idx = 0;
    function show(i){ idx = (i+imgs.length)%imgs.length; lbImg.src = imgs[idx].getAttribute('href'); }
    function open(i){ show(i); lb.classList.add('open'); }
    function close(){ lb.classList.remove('open'); }
    imgs.forEach(function(a,i){ a.addEventListener('click', function(e){ e.preventDefault(); open(i); }); });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__prev').addEventListener('click', function(e){ e.stopPropagation(); show(idx-1); });
    lb.querySelector('.lb__next').addEventListener('click', function(e){ e.stopPropagation(); show(idx+1); });
    lb.addEventListener('click', function(e){ if(e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowLeft') show(idx-1);
      if(e.key === 'ArrowRight') show(idx+1);
    });
  }
})();
