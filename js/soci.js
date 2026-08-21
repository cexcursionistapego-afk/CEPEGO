/* CEPEGO — Racó del soci: formularis d'alta i baixa de soci */
(function () {
  function lang() { return document.documentElement.getAttribute('data-lang') === 'es' ? 'es' : 'va'; }

  function handleForm(formId, msgId, btnId, endpoint, successVa, successEs) {
    var form = document.getElementById(formId);
    var msg  = document.getElementById(msgId);
    var btn  = document.getElementById(btnId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var l = lang();
      var fd = new FormData(form);
      var body = {};
      fd.forEach(function (v, k) { body[k] = v; });

      btn.disabled = true;
      show(msg, l === 'es' ? 'Enviando…' : 'Enviant…', '');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            form.reset();
            show(msg, l === 'es' ? successEs : successVa, 'ok');
          } else {
            btn.disabled = false;
            show(msg, l === 'es'
              ? 'No se ha podido enviar. Inténtalo de nuevo o escríbenos por email.'
              : 'No s\'ha pogut enviar. Torna-ho a provar o escriu-nos per correu.', 'err');
          }
        })
        .catch(function () {
          btn.disabled = false;
          show(msg, l === 'es' ? 'Error de conexión.' : 'Error de connexió.', 'err');
        });
    });
  }

  function show(el, text, cls) {
    if (!el) return;
    el.textContent = text;
    el.className = 'r-msg ' + (cls || '');
  }

  handleForm(
    'alta-form', 'alta-msg', 'alta-submit',
    '/api/alta-soci',
    'Sol·licitud d\'alta enviada! Et contactarem per correu electrònic per confirmar-te l\'alta i indicar-te el pagament de la quota anual (35 €).',
    '¡Solicitud de alta enviada! Te contactaremos por correo electrónico para confirmar el alta e indicarte el pago de la cuota anual (35 €).'
  );

  handleForm(
    'baixa-form', 'baixa-msg', 'baixa-submit',
    '/api/baixa-soci',
    'Sol·licitud de baixa enviada. La processarem i et confirmarem per correu electrònic.',
    'Solicitud de baja enviada. La procesaremos y te confirmaremos por correo electrónico.'
  );
})();
