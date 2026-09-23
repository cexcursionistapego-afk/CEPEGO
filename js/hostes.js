/* CEPEGO — Registre de viatgers del refugi (R.D. 933/2021).

   Formulari públic i sense llistat: cadascú envia les seues dades i prou. La
   comprovació de debò la fa netlify/functions/registre-viatgers.js; ací es
   valida el mateix abans d'enviar per a que la gent veja l'error de seguida i
   no per a confiar-hi.

   Ací hi ha quatre idiomes i la resta del lloc en té dos: al refugi ve gent de
   fora. L'idioma es canvia al vol tocant data-lang, i el CSS ensenya els
   <span> que toquen. El que està escrit en HTML ja va en els quatre; ací es
   munta el que no pot anar-hi: els <option> (dins d'un <option> no valen
   etiquetes), els missatges d'error i el calendari de les dates. */
(function () {
  var form = document.getElementById('viatger-form');
  if (!form) return;

  var msg = document.getElementById('viatger-msg');
  var btn = document.getElementById('viatger-submit');
  var selSexe = document.getElementById('v-sexo');
  var selTipus = document.getElementById('v-tipus');
  var MAX_FILE = 4 * 1024 * 1024;
  var root = document.documentElement;

  var IDIOMES = ['va', 'es', 'en', 'fr'];
  function lang() {
    var l = root.getAttribute('data-lang');
    return IDIOMES.indexOf(l) === -1 ? 'va' : l;
  }
  // Cada text es passa en l'ordre va, es, en, fr.
  function t(va, es, en, fr) {
    var l = lang();
    if (l === 'es') return es;
    if (l === 'en') return en;
    if (l === 'fr') return fr;
    return va;
  }

  function show(text, cls) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'r-msg' + (cls ? ' ' + cls : '');
  }

  /* ================= calendari propi =================
     No es fa servir <input type="date"> perquè eixe calendari el pinta el
     navegador i ix en l'idioma del navegador, no en el que s'ha triat ací.
     Este es pinta a mà, així els mesos i els dies van sempre en l'idioma de
     la pàgina. El valor viatja en un <input type="hidden"> en format ISO
     (AAAA-MM-DD), que és el que espera Airtable. */
  var MESOS = {
    va: ['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre'],
    es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    fr: ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  };
  // Les setmanes comencen en dilluns, com ací.
  var DIES = {
    va: ['Dl','Dt','Dc','Dj','Dv','Ds','Dg'],
    es: ['Lu','Ma','Mi','Ju','Vi','Sá','Do'],
    en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
    fr: ['Lu','Ma','Me','Je','Ve','Sa','Di']
  };

  function iso(d) {
    var m = String(d.getMonth() + 1), dia = String(d.getDate());
    return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (dia.length < 2 ? '0' + dia : dia);
  }
  function desIso(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }
  // En valencià va "d'octubre" i no "de octubre" davant de vocal.
  function escrita(d) {
    var l = lang(), mes = MESOS[l][d.getMonth()], dia = d.getDate(), any = d.getFullYear();
    if (l === 'es') return dia + ' de ' + mes + ' de ' + any;
    if (l === 'en') return dia + ' ' + mes + ' ' + any;
    if (l === 'fr') return dia + ' ' + mes + ' ' + any;
    return dia + (/^[aeiouàèéíòóú]/i.test(mes) ? " d'" : ' de ') + mes + ' de ' + any;
  }

  function Calendari(arrel) {
    var hidden = arrel.querySelector('input[type="hidden"]');
    var boto = arrel.querySelector('.dp__camp');
    var txt = arrel.querySelector('.dp__txt');
    var pop = document.createElement('div');
    pop.className = 'dp__pop';
    pop.setAttribute('role', 'dialog');
    pop.hidden = true;
    arrel.appendChild(pop);

    var vista = new Date(); vista.setDate(1);
    var obert = false;

    function pinta() {
      var l = lang();
      var any = vista.getFullYear(), mes = vista.getMonth();
      var triat = desIso(hidden.value);
      var hui = new Date(); hui.setHours(0, 0, 0, 0);

      var caps = DIES[l].map(function (d) { return '<span class="dp__dia-cap">' + d + '</span>'; }).join('');

      // getDay() torna 0 per al diumenge; ací la setmana comença en dilluns.
      var primer = new Date(any, mes, 1);
      var buits = (primer.getDay() + 6) % 7;
      var total = new Date(any, mes + 1, 0).getDate();

      var cel = '';
      for (var i = 0; i < buits; i++) cel += '<span class="dp__buit"></span>';
      for (var dia = 1; dia <= total; dia++) {
        var d = new Date(any, mes, dia);
        var cls = 'dp__dia';
        if (triat && d.getTime() === triat.getTime()) cls += ' dp__dia--triat';
        if (d.getTime() === hui.getTime()) cls += ' dp__dia--hui';
        // Cap dia va bloquejat: l'hoste posa l'entrada i l'eixida i ja està.
        // Si les posa al revés, el missatge d'error de baix ja li ho diu.
        cel += '<button type="button" class="' + cls + '" data-dia="' + iso(d) + '">' + dia + '</button>';
      }

      pop.innerHTML =
        '<div class="dp__cap">' +
          '<button type="button" class="dp__nav" data-mou="-1" aria-label="' +
            t('Mes anterior', 'Mes anterior', 'Previous month', 'Mois précédent') + '">&#8249;</button>' +
          '<span class="dp__mes">' + MESOS[l][mes] + ' ' + any + '</span>' +
          '<button type="button" class="dp__nav" data-mou="1" aria-label="' +
            t('Mes següent', 'Mes siguiente', 'Next month', 'Mois suivant') + '">&#8250;</button>' +
        '</div>' +
        '<div class="dp__graella">' + caps + cel + '</div>';
    }

    function etiqueta() {
      var d = desIso(hidden.value);
      txt.textContent = d ? escrita(d) : t('Tria una data', 'Elige una fecha', 'Choose a date', 'Choisissez une date');
      txt.classList.toggle('dp__txt--buit', !d);
    }

    function obri() {
      if (obert) return;
      // S'obri pel mes de la data ja triada; si encara no n'hi ha, pel d'ara.
      var d = desIso(hidden.value) || new Date();
      vista = new Date(d.getFullYear(), d.getMonth(), 1);
      pinta();
      pop.hidden = false; obert = true;
      boto.setAttribute('aria-expanded', 'true');
    }
    function tanca() {
      if (!obert) return;
      pop.hidden = true; obert = false;
      boto.setAttribute('aria-expanded', 'false');
    }

    boto.addEventListener('click', function (e) {
      e.stopPropagation();
      obert ? tanca() : obri();
    });
    pop.addEventListener('click', function (e) {
      e.stopPropagation();
      var nav = e.target.closest('[data-mou]');
      if (nav) { vista.setMonth(vista.getMonth() + (+nav.getAttribute('data-mou'))); pinta(); return; }
      var dia = e.target.closest('[data-dia]');
      if (dia) {
        hidden.value = dia.getAttribute('data-dia');
        etiqueta();
        tanca();
      }
    });
    document.addEventListener('click', tanca);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tanca(); });

    etiqueta();

    return {
      refresca: function () { etiqueta(); if (obert) pinta(); },
      buida: function () { hidden.value = ''; etiqueta(); }
    };
  }

  var calEntrada = Calendari(document.querySelector('[data-dp="entrada"]'));
  var calSalida  = Calendari(document.querySelector('[data-dp="salida"]'));

  /* ---------- desplegables ---------- */
  function omple(sel, opcions) {
    sel.innerHTML = opcions.map(function (o) {
      return '<option value="' + o[0] + '">' + o[1] + '</option>';
    }).join('');
  }
  // Es tornen a pintar en canviar d'idioma, però guardant el que ja estiguera
  // triat: qui ompli mig formulari i canvia d'idioma no ha de tornar a triar.
  function pintaSelects() {
    var sexe = selSexe.value, tipus = selTipus.value;
    var tria = t('Tria una opció', 'Elige una opción', 'Choose an option', 'Choisissez une option');
    omple(selSexe, [
      ['', tria],
      ['Masculino', t('Home', 'Hombre', 'Male', 'Homme')],
      ['Femenino', t('Dona', 'Mujer', 'Female', 'Femme')],
      ['Trans', t('Trans', 'Trans', 'Trans', 'Trans')],
      ['No binario', t('No binari', 'No binario', 'Non-binary', 'Non binaire')]
    ]);
    omple(selTipus, [
      ['', tria],
      ['DNI', t('DNI o NIE', 'DNI o NIE', 'DNI or NIE (Spanish ID)', 'DNI ou NIE (pièce d\'identité espagnole)')],
      ['PASSAPORTE', t('Passaport', 'Pasaporte', 'Passport', 'Passeport')],
      ['TIE', t('TIE (targeta d\'estranger)', 'TIE (tarjeta de extranjero)', 'TIE (foreigner ID card)', 'TIE (titre de séjour)')]
    ]);
    selSexe.value = sexe; selTipus.value = tipus;
  }
  pintaSelects();

  var botons = [].slice.call(document.querySelectorAll('[data-set-lang]'));
  function marcaBotons() {
    botons.forEach(function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-set-lang') === lang() ? 'true' : 'false');
    });
  }
  botons.forEach(function (b) {
    b.addEventListener('click', function () {
      root.setAttribute('data-lang', b.getAttribute('data-set-lang'));
      marcaBotons();
      pintaSelects();
      calEntrada.refresca();
      calSalida.refresca();
      // El missatge d'error es quedaria en l'idioma anterior i confondria.
      show('', '');
    });
  });
  marcaBotons();

  /* ---------- el camp del número canvia segons el document ---------- */
  var CAMPS = {
    'DNI': { camp: document.getElementById('v-camp-dni'), input: form.querySelector('[name="dni"]') },
    'PASSAPORTE': { camp: document.getElementById('v-camp-pasaporte'), input: form.querySelector('[name="pasaporte"]') },
    'TIE': { camp: document.getElementById('v-camp-tie'), input: form.querySelector('[name="tie"]') }
  };
  function mostraCamp() {
    var tipus = selTipus.value;
    Object.keys(CAMPS).forEach(function (k) {
      var visible = (k === tipus);
      CAMPS[k].camp.hidden = !visible;
      // Els camps amagats es buiden: si algú escriu el DNI, canvia a passaport
      // i envia, no volem que el número antic viatge amagat amb la resta.
      if (!visible) CAMPS[k].input.value = '';
    });
  }
  selTipus.addEventListener('change', mostraCamp);
  mostraCamp();

  /* ---------- validacions ---------- */
  // La lletra del DNI ix del número: no és una comprovació de format, és el
  // dígit de control de veritat, així que caça les errades de teclejat.
  var LLETRES = 'TRWAGMYFPDXBNJZSQVHLCKE';
  function normDoc(v) { return (v || '').replace(/[\s-]/g, '').toUpperCase(); }

  // Noms, municipis, províncies i països: lletres de qualsevol idioma (ací ve
  // gent de fora), espais, guions, apòstrofs i punts. El que es vol caçar és
  // el camp amb números o deixat a mitges, no imposar cap alfabet.
  var NOM_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'’\-.]*$/u;
  function validaNom(v) {
    var t8 = (v || '').trim();
    return t8.length >= 2 && t8.length <= 80 && NOM_RE.test(t8);
  }
  // L'adreça sí que porta números, així que només es mira que tinga cos i
  // alguna lletra: un carrer que siga només "33" està mal copiat.
  function validaAdreca(v) {
    var t8 = (v || '').trim();
    return t8.length >= 4 && t8.length <= 120 && /\p{L}/u.test(t8);
  }

  function validaDniNie(v) {
    var t8 = normDoc(v);
    var m = /^([0-9]{8})([A-Z])$/.exec(t8);
    if (m) return LLETRES.charAt(parseInt(m[1], 10) % 23) === m[2];
    // NIE: la X, Y o Z compta com a 0, 1 o 2 davant dels set dígits.
    var n = /^([XYZ])([0-9]{7})([A-Z])$/.exec(t8);
    if (n) {
      var num = String('XYZ'.indexOf(n[1])) + n[2];
      return LLETRES.charAt(parseInt(num, 10) % 23) === n[3];
    }
    return false;
  }
  // Del passaport no es pot comprovar cap dígit de control perquè cada país
  // el fa a la seua manera: es mira que tinga una pinta raonable i que no siga
  // un camp omplit a la babalà ("00000000", "AAAAA").
  function validaPassaport(v) {
    var t8 = normDoc(v);
    if (!/^[A-Z0-9]{5,20}$/.test(t8)) return false;
    return !/^(.)\1+$/.test(t8);
  }
  // La TIE porta el NIE darrere, així que si en té forma es comprova de debò;
  // si no, s'accepta el format de la targeta (lletra + dígits).
  function validaTie(v) {
    var t8 = normDoc(v);
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(t8)) return validaDniNie(t8);
    return /^[A-Z][0-9]{6,9}[A-Z]?$/.test(t8);
  }
  // El telèfon no es pot comprovar contra el patró espanyol: ací hi ha gent de
  // fora amb prefix propi. Es demana que siguen només dígits (amb un + davant
  // si de cas) i una llargària de número real.
  function validaTelefon(v) {
    var t8 = (v || '').replace(/[\s.\-()]/g, '');
    if (!/^\+?\d+$/.test(t8)) return false;
    var d = t8.replace(/\D/g, '');
    return d.length >= 6 && d.length <= 15;
  }
  var MAX_NITS = 31;

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result.split(',')[1]); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fd = new FormData(form);
    var body = {};
    fd.forEach(function (v, k) { if (!(v instanceof File)) body[k] = v; });
    body.acepto = !!form.querySelector('[name="acepto"]').checked;

    var obligatoris = ['entrada', 'salida', 'nombre', 'apellidos', 'sexo',
                       'tipo_doc', 'calle', 'municipio', 'provincia', 'pais', 'telefono'];
    for (var i = 0; i < obligatoris.length; i++) {
      if (!(body[obligatoris[i]] || '').trim()) {
        show(t('Falten camps obligatoris (*).', 'Faltan campos obligatorios (*).',
               'Some required fields (*) are missing.', 'Des champs obligatoires (*) sont manquants.'), 'err');
        return;
      }
    }

    var NOMS = [
      ['nombre',    t('El nom no és vàlid.', 'El nombre no es válido.', 'The first name is not valid.', "Le prénom n'est pas valide.")],
      ['apellidos', t('Els cognoms no són vàlids.', 'Los apellidos no son válidos.', 'The surname is not valid.', "Le nom n'est pas valide.")],
      ['municipio', t('El municipi no és vàlid.', 'El municipio no es válido.', 'The town or city is not valid.', "La commune n'est pas valide.")],
      ['provincia', t('La província no és vàlida.', 'La provincia no es válida.', 'The province or region is not valid.', "La province ou région n'est pas valide.")],
      ['pais',      t('El país no és vàlid.', 'El país no es válido.', 'The country is not valid.', "Le pays n'est pas valide.")]
    ];
    for (var j = 0; j < NOMS.length; j++) {
      if (!validaNom(body[NOMS[j][0]])) { show(NOMS[j][1], 'err'); return; }
    }
    if (!validaAdreca(body.calle)) {
      show(t("L'adreça no és vàlida: posa el carrer i el número.",
             'La dirección no es válida: pon la calle y el número.',
             'The address is not valid: enter the street and number.',
             "L'adresse n'est pas valide : indiquez la rue et le numéro."), 'err');
      return;
    }

    var entrada = desIso(body.entrada), salida = desIso(body.salida);
    if (!entrada || !salida) {
      show(t('Les dates no són vàlides.', 'Las fechas no son válidas.',
             'The dates are not valid.', 'Les dates ne sont pas valides.'), 'err');
      return;
    }
    if (salida <= entrada) {
      show(t("El dia d'eixida ha de ser posterior al d'entrada.",
             'El día de salida debe ser posterior al de entrada.',
             'The check-out date must be after the check-in date.',
             "La date de départ doit être postérieure à la date d'arrivée."), 'err');
      return;
    }
    // Una estada llarguíssima quasi sempre és un any mal teclejat.
    if (Math.round((salida - entrada) / 86400000) > MAX_NITS) {
      show(t("L'estada és massa llarga. Comprova les dates.",
             'La estancia es demasiado larga. Comprueba las fechas.',
             'That stay is too long. Please check the dates.',
             'Ce séjour est trop long. Vérifiez les dates.'), 'err');
      return;
    }

    var tipus = body.tipo_doc, numero = '';
    if (tipus === 'DNI') {
      numero = normDoc(body.dni);
      if (!validaDniNie(numero)) {
        show(t('El DNI o NIE no és vàlid. Comprova el número i la lletra.',
               'El DNI o NIE no es válido. Comprueba el número y la letra.',
               'The DNI or NIE is not valid. Check the number and the letter.',
               "Le DNI ou NIE n'est pas valide. Vérifiez le numéro et la lettre."), 'err');
        return;
      }
      body.dni = numero;
    } else if (tipus === 'PASSAPORTE') {
      numero = normDoc(body.pasaporte);
      if (!validaPassaport(numero)) {
        show(t('El número de passaport no és vàlid.', 'El número de pasaporte no es válido.',
               'The passport number is not valid.', "Le numéro de passeport n'est pas valide."), 'err');
        return;
      }
      body.pasaporte = numero;
    } else if (tipus === 'TIE') {
      numero = normDoc(body.tie);
      if (!validaTie(numero)) {
        show(t('El número de TIE no és vàlid.', 'El número de TIE no es válido.',
               'The TIE number is not valid.', "Le numéro de TIE n'est pas valide."), 'err');
        return;
      }
      body.tie = numero;
    }

    if (!validaTelefon(body.telefono)) {
      show(t('El telèfon no és vàlid.', 'El teléfono no es válido.',
             'The phone number is not valid.', "Le numéro de téléphone n'est pas valide."), 'err');
      return;
    }

    if (!body.acepto) {
      show(t('Cal acceptar les condicions per a poder enviar el registre.',
             'Hay que aceptar las condiciones para poder enviar el registro.',
             'You must accept the conditions to submit the record.',
             "Vous devez accepter les conditions pour envoyer l'enregistrement."), 'err');
      return;
    }

    var foto = form.querySelector('[name="doc_foto"]').files[0];
    if (!foto) {
      show(t('Falta la foto del document.', 'Falta la foto del documento.',
             'The photo of the document is missing.', 'La photo du document est manquante.'), 'err');
      return;
    }
    if (foto.size > MAX_FILE) {
      show(t('La foto ha de pesar menys de 4MB.', 'La foto debe pesar menos de 4MB.',
             'The photo must be smaller than 4MB.', 'La photo doit peser moins de 4 Mo.'), 'err');
      return;
    }
    if (!/^image\//.test(foto.type || '')) {
      show(t('El document ha de ser una imatge (foto o captura).',
             'El documento debe ser una imagen (foto o captura).',
             'The document must be an image (photo or screenshot).',
             "Le document doit être une image (photo ou capture d'écran)."), 'err');
      return;
    }

    btn.disabled = true;
    show(t('Enviant…', 'Enviando…', 'Sending…', 'Envoi en cours…'), '');

    fileToBase64(foto).then(function (b64) {
      body.doc_foto_b64 = b64;
      body.doc_foto_type = foto.type || 'image/jpeg';
      body.doc_foto_name = foto.name || 'document.jpg';
      return fetch('/api/registre-viatgers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }).then(function (r) {
      return r.json();
    }).then(function (d) {
      if (d && d.ok) {
        form.reset();
        // form.reset() buida els <input type="hidden"> però no toca el text
        // que es veu, així que els calendaris es tornen a posar a zero ací.
        calEntrada.buida(); calSalida.buida();
        mostraCamp();
        show(t('Registre enviat. Gràcies, ja està tot en regla: bona estada al refugi!',
               'Registro enviado. Gracias, ya está todo en regla: ¡buena estancia en el refugio!',
               'Record submitted. Thank you, everything is in order: enjoy your stay!',
               "Enregistrement envoyé. Merci, tout est en règle : bon séjour au refuge !"), 'ok');
        if (window.turnstile) { try { window.turnstile.reset(); } catch (err) {} }
      } else {
        show(t("No s'ha pogut enviar el registre. Torna-ho a provar en uns minuts.",
               'No se ha podido enviar el registro. Inténtalo de nuevo en unos minutos.',
               'The record could not be sent. Please try again in a few minutes.',
               "L'enregistrement n'a pas pu être envoyé. Réessayez dans quelques minutes."), 'err');
      }
      btn.disabled = false;
    }).catch(function () {
      show(t("No s'ha pogut enviar el registre. Comprova la connexió.",
             'No se ha podido enviar el registro. Comprueba la conexión.',
             'The record could not be sent. Please check your connection.',
             "L'enregistrement n'a pas pu être envoyé. Vérifiez votre connexion."), 'err');
      btn.disabled = false;
    });
  });
})();
