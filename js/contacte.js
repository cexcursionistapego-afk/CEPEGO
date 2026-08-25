/* CEPEGO — Formulari de contacte (dubtes i suggerències) */
(function () {
  function lang() { return document.documentElement.getAttribute('data-lang') === 'es' ? 'es' : 'va'; }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim()); }

  var form = document.getElementById('contacte-form');
  var msg = document.getElementById('c-msg');
  var btn = document.getElementById('c-submit');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var l = lang();
    var fd = new FormData(form);
    var body = {};
    fd.forEach(function (v, k) { body[k] = v; });

    if (!(body.nom || '').trim() || !(body.missatge || '').trim()) {
      show(l === 'es' ? 'Faltan campos obligatorios (*).' : 'Falten camps obligatoris (*).', 'err');
      return;
    }
    if (!isValidEmail(body.email)) {
      show(l === 'es' ? 'El correo electrónico no es válido.' : 'El correu electrònic no és vàlid.', 'err');
      return;
    }

    btn.disabled = true;
    show(l === 'es' ? 'Enviando…' : 'Enviant…', '');

    fetch('/api/contacte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (res) {
        if (res && res.ok) {
          form.reset();
          show(l === 'es'
            ? '¡Mensaje enviado! Te responderemos lo antes posible.'
            : 'Missatge enviat! Et respondrem al més aviat possible.', 'ok');
        } else {
          btn.disabled = false;
          show(l === 'es'
            ? 'No se ha podido enviar. Escríbenos a cexcursionistapego@gmail.com'
            : 'No s\'ha pogut enviar. Escriu-nos a cexcursionistapego@gmail.com', 'err');
        }
      })
      .catch(function () {
        btn.disabled = false;
        show(l === 'es' ? 'Error de conexión.' : 'Error de connexió.', 'err');
      });
  });

  function show(text, cls) {
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'r-msg ' + (cls || '');
  }
})();
