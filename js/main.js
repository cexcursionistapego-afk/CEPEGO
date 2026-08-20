/* CEPEGO — navegació, idioma (Valencià/Español), calendari dinàmic i galeria */
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

  /* ---------- AJUSTOS EDITABLES DEL CLUB (data/site.json) ---------- */
  fetch('data/site.json', {cache:'no-store'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(s){
      if(!s) return;
      document.querySelectorAll('[data-cms]').forEach(function(el){
        var k = el.getAttribute('data-cms');
        if(s[k] != null && s[k] !== '') el.textContent = s[k];
      });
      document.querySelectorAll('[data-cms-href]').forEach(function(el){
        var k = el.getAttribute('data-cms-href'); var v = s[k];
        if(v == null || v === '') return;
        if(k === 'email') el.setAttribute('href', 'mailto:'+v);
        else if(k === 'telefon') el.setAttribute('href', 'tel:'+String(v).replace(/\s+/g,''));
        else el.setAttribute('href', v);
      });
    }).catch(function(){});

  /* ---------- AVÍS / NOVETAT A LA PORTADA (data/avis.json) ---------- */
  var avisBox = document.getElementById('avis');
  if(avisBox){
    fetch('data/avis.json', {cache:'no-store'})
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(a){
        if(!a || !a.actiu) return;
        var va = a.text_va || '', es = a.text_es || '';
        if(!va && !es) return;
        avisBox.innerHTML = '<div class="avis"><span class="va">'+(va||es)+'</span><span class="es">'+(es||va)+'</span>'+
          '<button class="avis__x" aria-label="Tancar">&times;</button></div>';
        avisBox.querySelector('.avis__x').addEventListener('click', function(){ avisBox.style.display='none'; });
      }).catch(function(){});
  }

  /* ---------- LIGHTBOX ---------- */
  var lb, lbImg, items = [], idx = 0;
  function ensureLightbox(){
    if(lb) return;
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.innerHTML = '<button class="lb__close" aria-label="Tancar">&times;</button>'+
      '<button class="lb__nav lb__prev" aria-label="Anterior">&#8249;</button>'+
      '<img alt="">'+
      '<button class="lb__nav lb__next" aria-label="Següent">&#8250;</button>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
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
  function show(i){ idx = (i+items.length)%items.length; lbImg.src = items[idx].getAttribute('href'); }
  function close(){ lb.classList.remove('open'); }

  /* Enllaça (o torna a enllaçar) totes les galeries de la pàgina */
  function initGalleries(){
    items = Array.prototype.slice.call(document.querySelectorAll('.gallery a'));
    if(!items.length) return;
    ensureLightbox();
    items.forEach(function(a, i){
      if(a.dataset.lbBound) return;
      a.dataset.lbBound = '1';
      a.addEventListener('click', function(e){
        e.preventDefault();
        items = Array.prototype.slice.call(document.querySelectorAll('.gallery a'));
        idx = items.indexOf(a);
        show(idx);
        lb.classList.add('open');
      });
    });
  }

  /* ---------- CALENDARI DINÀMIC (des de data/calendari.json) ---------- */
  var calBox = document.getElementById('cal-gallery');
  if(calBox){
    fetch('data/calendari.json', {cache:'no-store'})
      .then(function(r){ return r.ok ? r.json() : {fotos:[]}; })
      .then(function(d){
        var fotos = (d && d.fotos) || [];
        if(!fotos.length){ calBox.innerHTML = '<p class="note">Encara no hi ha cartells publicats.</p>'; return; }
        calBox.innerHTML = fotos.map(function(f){
          var src = f.image;
          var alt = f.caption ? f.caption.replace(/"/g,'&quot;') : '';
          return '<a href="'+src+'"><img loading="lazy" src="'+src+'" alt="'+alt+'"></a>';
        }).join('');
        initGalleries();
      })
      .catch(function(){ calBox.innerHTML = '<p class="note">No s\'ha pogut carregar el calendari.</p>'; });
  }

  /* galeries estàtiques (refugi, escalada, etc.) */
  initGalleries();
})();
