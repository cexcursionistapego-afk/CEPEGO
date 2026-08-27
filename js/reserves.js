/* CEPEGO — Reserves del refugi: calendari de disponibilitat + formulari.
   Llig els dies OCUPATS de /api/disponibilitat (registres RESERVAT a Airtable)
   i envia la sol·licitud a /api/reserva (entra com PENDENT GESTIONAR). */
(function () {
  var cal = document.getElementById('reserva-cal');
  if (!cal) return;

  var MESOS = {
    va: ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'],
    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  };
  var DIES = { va: ['Dl','Dt','Dc','Dj','Dv','Ds','Dg'], es: ['Lu','Ma','Mi','Ju','Vi','Sá','Do'] };
  function lang(){ return document.documentElement.getAttribute('data-lang') === 'es' ? 'es' : 'va'; }
  function pad(n){ return (n<10?'0':'')+n; }
  function iso(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function parse(s){ var p=s.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }
  function addDays(s,n){ var d=parse(s); d.setDate(d.getDate()+n); return iso(d); }

  var today = new Date(); today.setHours(0,0,0,0);
  var todayStr = iso(today);
  var view = new Date(today.getFullYear(), today.getMonth(), 1);
  var busy = {};                // 'YYYY-MM-DD' -> true (dies RESERVAT o tancament estiu)
  var selStart = null, selEnd = null;
  var loaded = false;

  // Blackout: May 31 – Sep 30 (tancament d'estiu) i la nit del 31 de desembre (mai es lloga). Cada any.
  function isSummer(ds) {
    var md = ds.slice(5); // 'MM-DD'
    if (md >= '05-31' && md < '10-01') return true;
    if (md === '12-31') return true;
    return false;
  }

  var grid = document.createElement('div'); grid.className='rcal';
  var legend = document.createElement('div'); legend.className='rcal-legend';
  cal.appendChild(grid);
  cal.appendChild(legend);

  // hidden inputs / resum
  var fEntrada = document.getElementById('r-entrada');
  var fSalida  = document.getElementById('r-salida');
  var resum    = document.getElementById('r-resum');
  var submitBtn= document.getElementById('r-submit');

  function expand(reserves){
    busy = {};
    (reserves||[]).forEach(function(r){
      if(!r.start||!r.end) return;
      var d=r.start, guard=0;
      while(d<=r.end && guard<400){ busy[d]=true; d=addDays(d,1); guard++; }
    });
  }
  function rangeHasBusy(a,b){ var d=a,guard=0; while(d<=b&&guard<400){ if(busy[d]||isSummer(d)) return true; d=addDays(d,1); guard++; } return false; }

  function onDay(ds){
    if(busy[ds] || isSummer(ds) || ds < todayStr) return;
    if(!selStart || (selStart && selEnd)){ selStart=ds; selEnd=null; }
    else if(ds <= selStart){ selStart=ds; selEnd=null; }
    else { if(rangeHasBusy(selStart, ds)){ selStart=ds; selEnd=null; } else { selEnd=ds; } }
    sync(); render();
  }

  function sync(){
    var l=lang();
    if(selStart && selEnd){
      var nits = Math.round((parse(selEnd)-parse(selStart))/86400000);
      if(fEntrada) fEntrada.value=selStart;
      if(fSalida) fSalida.value=selEnd;
      var preu = nits===1?'190 €':nits===2?'250 €':nits===3?'350 €':(l==='es'?'a consultar':'a consultar');
      if(resum) resum.innerHTML = (l==='es'
        ? '<b>Entrada:</b> '+fmt(selStart)+' · <b>Salida:</b> '+fmt(selEnd)+' · <b>'+nits+'</b> noche'+(nits>1?'s':'')+' · <b>'+preu+'</b>'
        : '<b>Entrada:</b> '+fmt(selStart)+' · <b>Eixida:</b> '+fmt(selEnd)+' · <b>'+nits+'</b> nit'+(nits>1?'s':'')+' · <b>'+preu+'</b>');
      if(submitBtn) submitBtn.disabled=false;
    } else {
      if(fEntrada) fEntrada.value=selStart||'';
      if(fSalida) fSalida.value='';
      if(resum) resum.textContent = selStart
        ? (l==='es'?'Ahora elige el día de salida':'Ara tria el dia d\'eixida')
        : (l==='es'?'Elige el día de entrada en el calendario':'Tria el dia d\'entrada al calendari');
      if(submitBtn) submitBtn.disabled=true;
    }
  }
  function fmt(ds){ var d=parse(ds); return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear(); }

  function monthHTML(base, mobileLabel){
    var l=lang();
    var y=base.getFullYear(), m=base.getMonth();
    var first=new Date(y,m,1); var startDow=(first.getDay()+6)%7; // Dl=0
    var days=new Date(y,m+1,0).getDate();
    var h='<div class="rcal-m">'+(mobileLabel?'<div class="rcal-m-title">'+mobileLabel+'</div>':'')+'<div class="rcal-w">';
    DIES[l].forEach(function(d){ h+='<span>'+d+'</span>'; });
    h+='</div><div class="rcal-d">';
    for(var i=0;i<startDow;i++) h+='<span class="e"></span>';
    for(var day=1; day<=days; day++){
      var ds=y+'-'+pad(m+1)+'-'+pad(day);
      var cls=[];
      var isBlocked = busy[ds] || isSummer(ds);
      if(ds<todayStr) cls.push('past');
      else if(isBlocked) cls.push('busy');
      else cls.push('free');
      if(ds===selStart||ds===selEnd) cls.push('sel');
      else if(selStart&&selEnd&&ds>selStart&&ds<selEnd) cls.push('inrange');
      h+='<button type="button" class="'+cls.join(' ')+'" data-d="'+ds+'" '+((ds<todayStr||isBlocked)?'disabled':'')+'>'+day+'</button>';
    }
    h+='</div></div>';
    return h;
  }

  function render(){
    var l=lang();
    var m2=new Date(view.getFullYear(), view.getMonth()+1, 1);
    var canPrev = (view.getFullYear()>today.getFullYear())||(view.getFullYear()===today.getFullYear()&&view.getMonth()>today.getMonth());
    var label1=MESOS[l][view.getMonth()]+' '+view.getFullYear();
    var label2=MESOS[l][m2.getMonth()]+' '+m2.getFullYear();
    function navHTML(prevId,nextId,l1,l2){
      var mid=l1?'<span class="rcal-nav-months"><span>'+l1+'</span><span class="rcal-nav-months__2">'+l2+'</span></span>':'';
      return '<div class="rcal-nav"><button type="button" id="'+prevId+'" '+(canPrev?'':'disabled')+' aria-label="Anterior">‹</button>'+
      mid+
      '<button type="button" id="'+nextId+'" aria-label="Següent">›</button></div>';
    }
    grid.innerHTML =
      navHTML('rcal-prev','rcal-next',label1,label2)+
      '<div class="rcal-grid">'+monthHTML(view)+monthHTML(m2,label2)+'</div>'+
      navHTML('rcal-prev-b','rcal-next-b');
    legend.innerHTML =
      '<span><i class="lg free"></i>'+(l==='es'?'Libre':'Lliure')+'</span>'+
      '<span><i class="lg busy"></i>'+(l==='es'?'Reservado':'Reservat')+'</span>'+
      '<span><i class="lg sel"></i>'+(l==='es'?'Tu selección':'La teua selecció')+'</span>'+
      (loaded?'':' <span class="rcal-load">'+(l==='es'?'cargando…':'carregant…')+'</span>');
    function goPrev(){ if(canPrev){ view=new Date(view.getFullYear(),view.getMonth()-1,1); render(); } }
    function goNext(){ view=new Date(view.getFullYear(),view.getMonth()+1,1); render(); }
    grid.querySelector('#rcal-prev').addEventListener('click',goPrev);
    grid.querySelector('#rcal-next').addEventListener('click',goNext);
    grid.querySelector('#rcal-prev-b').addEventListener('click',goPrev);
    grid.querySelector('#rcal-next-b').addEventListener('click',goNext);
    grid.querySelectorAll('.rcal-d button').forEach(function(b){ b.addEventListener('click',function(){ onDay(b.getAttribute('data-d')); }); });
  }

  render(); sync();
  fetch('/api/disponibilitat',{cache:'no-store'})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(d){ loaded=true; if(d&&d.reserves) expand(d.reserves); render(); })
    .catch(function(){ loaded=true; render(); });
  document.addEventListener('click',function(e){ if(e.target.closest('[data-lang-btn]')){ setTimeout(function(){ sync(); render(); },0); } });

  /* -------- formulari -------- */
  var form = document.getElementById('reserva-form');
  var msg = document.getElementById('r-msg');
  var personesInput = document.getElementById('r-persones');
  var personesMsg = document.getElementById('r-persones-msg');
  function checkPersones(){
    if(!personesInput) return true;
    var l=lang();
    var v = parseInt(personesInput.value,10);
    if(personesInput.value!=='' && v>21){
      personesInput.value='21';
      if(personesMsg) personesMsg.textContent = l==='es' ? 'Máximo 21 personas (capacidad del refugio).' : 'Màxim 21 persones (capacitat del refugi).';
      return false;
    }
    if(personesMsg) personesMsg.textContent='';
    return true;
  }
  if(personesInput){
    personesInput.addEventListener('input',checkPersones);
    personesInput.addEventListener('change',checkPersones);
  }
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var l=lang();
      if(!checkPersones()){ return; }
      if(!fEntrada.value||!fSalida.value){ show(l==='es'?'Elige las fechas en el calendario.':'Tria les dates al calendari.','err'); return; }
      var fd=new FormData(form); var body={};
      fd.forEach(function(v,k){ body[k]=v; });
      body.entrada=fEntrada.value; body.salida=fSalida.value;
      submitBtn.disabled=true; show(l==='es'?'Enviando…':'Enviant…','');
      fetch('/api/reserva',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(r){ return r.json().catch(function(){return{ok:false};}); })
        .then(function(res){
          if(res && res.ok){
            form.reset(); selStart=selEnd=null; sync(); render();
            show(l==='es'
              ? '¡Solicitud enviada! La revisaremos y nos pondremos en contacto contigo por correo electrónico para confirmar la fecha y el pago de la señal (50 €).'
              : 'Sol·licitud enviada! La revisarem i ens posarem en contacte amb tu per correu electrònic per confirmar la data i el pagament de la senyal (50 €).','ok');
          } else {
            submitBtn.disabled=false;
            show(l==='es'?'No se ha podido enviar. Inténtalo de nuevo o escríbenos por email.':'No s\'ha pogut enviar. Torna-ho a provar o escriu-nos per correu.','err');
          }
        })
        .catch(function(){ submitBtn.disabled=false; show(l==='es'?'Error de conexión.':'Error de connexió.','err'); });
    });
  }
  function show(t,cls){ if(!msg) return; msg.textContent=t; msg.className='r-msg '+(cls||''); }
})();
