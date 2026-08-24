/* CEPEGO — Racó del soci: formularis d'alta i baixa de soci */
(function () {
  function lang() { return document.documentElement.getAttribute('data-lang') === 'es' ? 'es' : 'va'; }

  /* ---- Alta de soci ---- */
  var altaForm = document.getElementById('alta-form');
  var altaMsg  = document.getElementById('alta-msg');
  var altaBtn  = document.getElementById('alta-submit');
  var MAX_FILE = 4 * 1024 * 1024; // 4MB
  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result.split(',')[1]); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (altaForm) {
    altaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var l = lang();
      var fd = new FormData(altaForm);
      var body = {};
      fd.forEach(function (v, k) { if (!(v instanceof File)) body[k] = v; });
      body.sala = altaForm.querySelector('[name="sala"]').checked;
      body.difusio = altaForm.querySelector('[name="difusio"]').checked;

      // Client-side required validation
      var required = ['nom', 'cognoms', 'dni', 'naixement', 'telefon', 'email', 'localitat', 'iban'];
      for (var i = 0; i < required.length; i++) {
        if (!(body[required[i]] || '').trim()) {
          show(altaMsg, l === 'es' ? 'Faltan campos obligatorios (*).' : 'Falten camps obligatoris (*).', 'err');
          return;
        }
      }

      var fAnvers = altaForm.querySelector('[name="dni_anvers"]').files[0];
      var fRevers = altaForm.querySelector('[name="dni_revers"]').files[0];
      if (!fAnvers || !fRevers) {
        show(altaMsg, l === 'es' ? 'Faltan las fotos del DNI.' : 'Falten les fotos del DNI.', 'err');
        return;
      }
      if (fAnvers.size > MAX_FILE || fRevers.size > MAX_FILE) {
        show(altaMsg, l === 'es' ? 'Cada foto debe pesar menos de 4MB.' : 'Cada foto ha de pesar menys de 4MB.', 'err');
        return;
      }

      altaBtn.disabled = true;
      show(altaMsg, l === 'es' ? 'Enviando…' : 'Enviant…', '');

      Promise.all([fileToBase64(fAnvers), fileToBase64(fRevers)])
        .then(function (b64) {
          body.dni_anvers_b64 = b64[0];
          body.dni_anvers_type = fAnvers.type || 'image/jpeg';
          body.dni_anvers_name = fAnvers.name || 'dni-anvers.jpg';
          body.dni_revers_b64 = b64[1];
          body.dni_revers_type = fRevers.type || 'image/jpeg';
          body.dni_revers_name = fRevers.name || 'dni-revers.jpg';

          return fetch('/api/alta-soci', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
        })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            altaForm.reset();
            show(altaMsg, l === 'es'
              ? '¡Solicitud de alta enviada! Te contactaremos por correo electrónico para confirmar el alta e indicarte el pago de la cuota anual (35 €).'
              : 'Sol·licitud d\'alta enviada! Et contactarem per correu electrònic per confirmar-te l\'alta i indicar-te el pagament de la quota anual (35 €).',
              'ok');
          } else {
            altaBtn.disabled = false;
            show(altaMsg, l === 'es'
              ? 'No se ha podido enviar. Inténtalo de nuevo o escríbenos a cexcursionistapego@gmail.com'
              : 'No s\'ha pogut enviar. Torna-ho a provar o escriu-nos a cexcursionistapego@gmail.com', 'err');
          }
        })
        .catch(function () {
          altaBtn.disabled = false;
          show(altaMsg, l === 'es' ? 'Error de conexión.' : 'Error de connexió.', 'err');
        });
    });
  }

  /* ---- Baixa de soci ---- */
  var baixaForm = document.getElementById('baixa-form');
  var baixaMsg  = document.getElementById('baixa-msg');
  var baixaBtn  = document.getElementById('baixa-submit');
  if (baixaForm) {
    baixaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var l = lang();
      var fd = new FormData(baixaForm);
      var body = {};
      fd.forEach(function (v, k) { body[k] = v; });

      var requiredB = ['nom', 'cognoms', 'dni', 'email'];
      for (var j = 0; j < requiredB.length; j++) {
        if (!(body[requiredB[j]] || '').trim()) {
          show(baixaMsg, l === 'es' ? 'Falten camps obligatoris (*).' : 'Falten camps obligatoris (*).', 'err');
          return;
        }
      }

      baixaBtn.disabled = true;
      show(baixaMsg, l === 'es' ? 'Enviando…' : 'Enviant…', '');

      fetch('/api/baixa-soci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            baixaForm.reset();
            show(baixaMsg, l === 'es'
              ? 'Solicitud de baja enviada. La procesaremos y te confirmaremos por correo electrónico.'
              : 'Sol·licitud de baixa enviada. La processarem i et confirmarem per correu electrònic.',
              'ok');
          } else {
            baixaBtn.disabled = false;
            show(baixaMsg, l === 'es'
              ? 'No se ha podido enviar. Escríbenos a cexcursionistapego@gmail.com'
              : 'No s\'ha pogut enviar. Escriu-nos a cexcursionistapego@gmail.com', 'err');
          }
        })
        .catch(function () {
          baixaBtn.disabled = false;
          show(baixaMsg, l === 'es' ? 'Error de conexión.' : 'Error de connexió.', 'err');
        });
    });
  }

  function show(el, text, cls) {
    if (!el) return;
    el.textContent = text;
    el.className = 'r-msg ' + (cls || '');
  }
})();
