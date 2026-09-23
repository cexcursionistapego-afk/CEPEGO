/* CEPEGO — Registre de viatgers del refugi (R.D. 933/2021).

   Formulari públic i sense llistat: cadascú envia les seues dades i prou. La
   comprovació de debò la fa netlify/functions/registre-viatgers.js; ací es
   valida el mateix abans d'enviar per a que la gent veja l'error de seguida i
   no per a confiar-hi.

   Dins d'un <option> no valen els <span> de va/es, així que els desplegables
   es munten des d'ací en l'idioma de la pàgina. El VALOR sempre és el nom
   exacte de l'opció a Airtable ("Masculino", "PASSAPORTE"...): si algun dia es
   canvia allà, cal canviar-lo també ací. */
(function () {
  var form = document.getElementById('viatger-form');
  if (!form) return;

  var msg = document.getElementById('viatger-msg');
  var btn = document.getElementById('viatger-submit');
  var selSexe = document.getElementById('v-sexo');
  var selTipus = document.getElementById('v-tipus');
  var MAX_FILE = 4 * 1024 * 1024;

  var es = document.documentElement.getAttribute('data-lang') === 'es';
  function t(va, txtEs) { return es ? txtEs : va; }

  function show(text, cls) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'r-msg' + (cls ? ' ' + cls : '');
  }

  /* ---------- desplegables ---------- */
  function omple(sel, opcions) {
    sel.innerHTML = opcions.map(function (o) {
      return '<option value="' + o[0] + '">' + o[1] + '</option>';
    }).join('');
  }
  omple(selSexe, [
    ['', t('Tria una opció', 'Elige una opción')],
    ['Masculino', t('Home', 'Hombre')],
    ['Femenino', t('Dona', 'Mujer')],
    ['Trans', 'Trans'],
    ['No binario', t('No binari', 'No binario')]
  ]);
  omple(selTipus, [
    ['', t('Tria una opció', 'Elige una opción')],
    ['DNI', t('DNI o NIE', 'DNI o NIE')],
    ['PASSAPORTE', t('Passaport', 'Pasaporte')],
    ['TIE', t('TIE (targeta d\'estranger)', 'TIE (tarjeta de extranjero)')]
  ]);

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
    var t = (v || '').trim();
    return t.length >= 2 && t.length <= 80 && NOM_RE.test(t);
  }
  // L'adreça sí que porta números, així que només es mira que tinga cos i
  // alguna lletra: un carrer que siga només "33" està mal copiat.
  function validaAdreca(v) {
    var t = (v || '').trim();
    return t.length >= 4 && t.length <= 120 && /\p{L}/u.test(t);
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
    var t = normDoc(v);
    if (!/^[A-Z0-9]{5,20}$/.test(t)) return false;
    return !/^(.)\1+$/.test(t);
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
    var t = (v || '').replace(/[\s.\-()]/g, '');
    if (!/^\+?\d+$/.test(t)) return false;
    var d = t.replace(/\D/g, '');
    return d.length >= 6 && d.length <= 15;
  }
  // Data real, no només amb forma de data: així "2026-02-31" no cola.
  function dia(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((v || '').trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
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
        show(t('Falten camps obligatoris (*).', 'Faltan campos obligatorios (*).'), 'err');
        return;
      }
    }

    var NOMS = [
      ['nombre',    t('El nom no és vàlid.', 'El nombre no es válido.')],
      ['apellidos', t('Els cognoms no són vàlids.', 'Los apellidos no son válidos.')],
      ['municipio', t('El municipi no és vàlid.', 'El municipio no es válido.')],
      ['provincia', t('La província no és vàlida.', 'La provincia no es válida.')],
      ['pais',      t('El país no és vàlid.', 'El país no es válido.')]
    ];
    for (var j = 0; j < NOMS.length; j++) {
      if (!validaNom(body[NOMS[j][0]])) { show(NOMS[j][1], 'err'); return; }
    }
    if (!validaAdreca(body.calle)) {
      show(t('L\'adreça no és vàlida: posa el carrer i el número.',
             'La dirección no es válida: pon la calle y el número.'), 'err');
      return;
    }

    var entrada = dia(body.entrada), salida = dia(body.salida);
    if (!entrada || !salida) {
      show(t('Les dates no són vàlides.', 'Las fechas no son válidas.'), 'err');
      return;
    }
    if (salida <= entrada) {
      show(t('El dia d\'eixida ha de ser posterior al d\'entrada.',
             'El día de salida debe ser posterior al de entrada.'), 'err');
      return;
    }
    // Una estada llarguíssima quasi sempre és un any mal teclejat.
    var nits = Math.round((salida - entrada) / 86400000);
    if (nits > MAX_NITS) {
      show(t('L\'estada és massa llarga. Comprova les dates.',
             'La estancia es demasiado larga. Comprueba las fechas.'), 'err');
      return;
    }

    var tipus = body.tipo_doc, numero = '';
    if (tipus === 'DNI') {
      numero = normDoc(body.dni);
      if (!validaDniNie(numero)) {
        show(t('El DNI o NIE no és vàlid. Comprova el número i la lletra.',
               'El DNI o NIE no es válido. Comprueba el número y la letra.'), 'err');
        return;
      }
      body.dni = numero;
    } else if (tipus === 'PASSAPORTE') {
      numero = normDoc(body.pasaporte);
      if (!validaPassaport(numero)) {
        show(t('El número de passaport no és vàlid.', 'El número de pasaporte no es válido.'), 'err');
        return;
      }
      body.pasaporte = numero;
    } else if (tipus === 'TIE') {
      numero = normDoc(body.tie);
      if (!validaTie(numero)) {
        show(t('El número de TIE no és vàlid.', 'El número de TIE no es válido.'), 'err');
        return;
      }
      body.tie = numero;
    }

    if (!validaTelefon(body.telefono)) {
      show(t('El telèfon no és vàlid.', 'El teléfono no es válido.'), 'err');
      return;
    }

    if (!body.acepto) {
      show(t('Cal acceptar les condicions per a poder enviar el registre.',
             'Hay que aceptar las condiciones para poder enviar el registro.'), 'err');
      return;
    }

    var foto = form.querySelector('[name="doc_foto"]').files[0];
    if (foto && foto.size > MAX_FILE) {
      show(t('La foto ha de pesar menys de 4MB.', 'La foto debe pesar menos de 4MB.'), 'err');
      return;
    }
    if (foto && !/^image\//.test(foto.type || '')) {
      show(t('El document ha de ser una imatge (foto o captura).',
             'El documento debe ser una imagen (foto o captura).'), 'err');
      return;
    }

    btn.disabled = true;
    show(t('Enviant…', 'Enviando…'), '');

    (foto ? fileToBase64(foto) : Promise.resolve(null)).then(function (b64) {
      if (b64) {
        body.doc_foto_b64 = b64;
        body.doc_foto_type = foto.type || 'image/jpeg';
        body.doc_foto_name = foto.name || 'document.jpg';
      }
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
        mostraCamp();
        show(t('Registre enviat. Gràcies, ja està tot en regla: bona estada al refugi!',
               'Registro enviado. Gracias, ya está todo en regla: ¡buena estancia en el refugio!'), 'ok');
        if (window.turnstile) { try { window.turnstile.reset(); } catch (err) {} }
      } else {
        show(t('No s\'ha pogut enviar el registre. Torna-ho a provar en uns minuts.',
               'No se ha podido enviar el registro. Inténtalo de nuevo en unos minutos.'), 'err');
      }
      btn.disabled = false;
    }).catch(function () {
      show(t('No s\'ha pogut enviar el registre. Comprova la connexió.',
             'No se ha podido enviar el registro. Comprueba la conexión.'), 'err');
      btn.disabled = false;
    });
  });
})();
