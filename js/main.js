/* CEPEGO — idioma, navegació, calendari, galeria i micro-interaccions */
(function(){
  var root = document.documentElement;

  /* ---------- IDIOMA: Valencià per defecte, opció Español ---------- */
  var saved=null; try{ saved=localStorage.getItem('cepego-lang'); }catch(e){}
  setLang(saved==='es'?'es':'va');
  function setLang(l){
    root.setAttribute('data-lang',l);
    root.setAttribute('lang', l==='es'?'es':'ca-valencia');
    try{ localStorage.setItem('cepego-lang',l); }catch(e){}
    document.querySelectorAll('[data-lang-btn]').forEach(function(b){
      b.textContent = (l==='va')?'ES':'VA';
      b.setAttribute('aria-label',(l==='va')?'Cambiar a Español':'Canviar a Valencià');
      b.classList.toggle('flag-es', l==='va');
      b.classList.toggle('flag-va', l==='es');
    });
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-lang-btn]');
    if(b){
      setLang(root.getAttribute('data-lang')==='va'?'es':'va');
      var openNav=document.querySelector('.nav.open');
      if(openNav && openNav.contains(b)) openNav.classList.remove('open');
    }
  });

  /* ---------- MENÚ MÒBIL ---------- */
  var toggle=document.querySelector('.nav-toggle'), nav=document.querySelector('.nav');
  if(toggle&&nav){
    toggle.addEventListener('click',function(){ nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ nav.classList.remove('open'); }); });
  }

  /* ---------- HEADER en scroll ---------- */
  var hdr=document.getElementById('hdr');
  if(hdr){ var onScroll=function(){ hdr.classList.toggle('scrolled', window.scrollY>10); }; onScroll(); window.addEventListener('scroll',onScroll,{passive:true}); }

  /* ---------- ANY ---------- */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent=new Date().getFullYear(); });

  /* ---------- AJUSTOS DEL CLUB (data/site.json) ---------- */
  fetch('data/site.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(s){
    if(!s) return;
    document.querySelectorAll('[data-cms]').forEach(function(el){ var k=el.getAttribute('data-cms'); if(s[k]!=null&&s[k]!=='') el.textContent=s[k]; });
    document.querySelectorAll('[data-cms-href]').forEach(function(el){ var k=el.getAttribute('data-cms-href'),v=s[k]; if(v==null||v==='')return;
      if(k==='email') el.setAttribute('href','mailto:'+v);
      else if(k==='telefon') el.setAttribute('href','tel:'+String(v).replace(/\s+/g,''));
      else el.setAttribute('href',v); });
  }).catch(function(){});

  /* ---------- AVÍS (data/avis.json) ---------- */
  var avisBox=document.getElementById('avis');
  if(avisBox){ fetch('data/avis.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(a){
    if(!a||!a.actiu) return; var va=a.text_va||'',es=a.text_es||''; if(!va&&!es) return;
    avisBox.innerHTML='<div class="avis"><span class="va">'+(va||es)+'</span><span class="es">'+(es||va)+'</span><button class="avis__x" aria-label="Tancar">&times;</button></div>';
    avisBox.querySelector('.avis__x').addEventListener('click',function(){ avisBox.style.display='none'; });
  }).catch(function(){}); }

  /* ---------- LIGHTBOX ---------- */
  var lb,lbImg,items=[],idx=0;
  function ensureLB(){ if(lb) return;
    lb=document.createElement('div'); lb.className='lb';
    lb.innerHTML='<button class="lb__close" aria-label="Tancar">&times;</button><button class="lb__nav lb__prev" aria-label="Anterior">&#8249;</button><img alt=""><button class="lb__nav lb__next" aria-label="Següent">&#8250;</button>';
    document.body.appendChild(lb); lbImg=lb.querySelector('img');
    lb.querySelector('.lb__close').addEventListener('click',close);
    lb.querySelector('.lb__prev').addEventListener('click',function(e){e.stopPropagation();show(idx-1);});
    lb.querySelector('.lb__next').addEventListener('click',function(e){e.stopPropagation();show(idx+1);});
    lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
    document.addEventListener('keydown',function(e){ if(!lb.classList.contains('open'))return;
      if(e.key==='Escape')close(); if(e.key==='ArrowLeft')show(idx-1); if(e.key==='ArrowRight')show(idx+1); });
    var tx=0,ty=0;
    lb.addEventListener('touchstart',function(e){ tx=e.changedTouches[0].clientX; ty=e.changedTouches[0].clientY; },{passive:true});
    lb.addEventListener('touchend',function(e){
      var dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
      if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){ if(dx<0) show(idx+1); else show(idx-1); }
    },{passive:true});
  }
  function show(i){ idx=(i+items.length)%items.length; lbImg.src=items[idx].getAttribute('href'); }
  function close(){ lb.classList.remove('open'); }
  var GALLERY_SEL='.gallery a, .cal-featured a, .cal-archive a, .topos a, .senders-gallery a';
  function bindGalleries(){
    items=Array.prototype.slice.call(document.querySelectorAll(GALLERY_SEL));
    if(!items.length) return; ensureLB();
    items.forEach(function(a){ if(a.dataset.lb) return; a.dataset.lb='1';
      a.addEventListener('click',function(e){ e.preventDefault();
        var group=a.closest('.senders-gallery');
        items = group
          ? Array.prototype.slice.call(group.querySelectorAll('a'))
          : Array.prototype.slice.call(document.querySelectorAll(GALLERY_SEL));
        idx=items.indexOf(a); show(idx); lb.classList.add('open'); }); });
  }

  /* ---------- CALENDARI (data/calendari.json): 1 principal + arxiu ---------- */
  var feat=document.getElementById('cal-featured'), arch=document.getElementById('cal-archive');
  if(feat){ fetch('data/calendari.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():{fotos:[]};}).then(function(d){
    var f=(d&&d.fotos)||[];
    if(!f.length){ feat.innerHTML='<p class="note">Encara no hi ha calendaris publicats.</p>'; return; }
    var vigent = !!(d&&d.vigent);
    var main = vigent ? f[0] : null;
    var rest = vigent ? f.slice(1) : f;
    if(main){
      feat.innerHTML='<a href="'+main.image+'"><img loading="lazy" src="'+main.image+'" alt="'+(main.caption||'Calendari actual').replace(/"/g,'&quot;')+'"></a>'+
        '<div class="prose"><div class="kicker"><span class="va">Enguany</span><span class="es">Este año</span></div>'+
        '<h2>'+ (main.caption? main.caption.replace(/</g,'&lt;') : '<span class="va">Calendari actual</span><span class="es">Calendario actual</span>') +'</h2>'+
        '<p class="lead"><span class="va">El nostre calendari d\'activitats. Fes clic per ampliar-lo.</span><span class="es">Nuestro calendario de actividades. Haz clic para ampliarlo.</span></p></div>';
    } else {
      feat.innerHTML='<div class="prose"><div class="kicker"><span class="va">Molt prompte</span><span class="es">Muy pronto</span></div>'+
        '<h2><span class="va">El pròxim calendari està en camí</span><span class="es">El próximo calendario está en camino</span></h2>'+
        '<p class="lead"><span class="va">Ja hem completat l\'últim calendari d\'activitats i estem preparant el pròxim. Mentrestant, pots consultar els calendaris anteriors ací baix.</span><span class="es">Ya hemos completado el último calendario de actividades y estamos preparando el próximo. Mientras tanto, puedes consultar los calendarios anteriores aquí abajo.</span></p></div>';
    }
    if(rest.length){
      var head=document.getElementById('cal-archive-head'); if(head) head.style.display='';
      arch.innerHTML=rest.map(function(x){return '<a href="'+x.image+'"><img loading="lazy" src="'+x.image+'" alt="'+(x.caption||'').replace(/"/g,'&quot;')+'"></a>';}).join('');
    }
    bindGalleries();
  }).catch(function(){ feat.innerHTML='<p class="note">No s\'ha pogut carregar el calendari.</p>'; }); }

  bindGalleries();

  /* ---------- REVEAL en scroll ---------- */
  var rev=document.querySelectorAll('.reveal');
  if(rev.length && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }); },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    rev.forEach(function(el){ io.observe(el); });
  } else { rev.forEach(function(el){ el.classList.add('in'); }); }
})();
