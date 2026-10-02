// Solo en la vista previa estática (sin servidor): las llamadas a /api/ las
// contesta mock-api.mjs, que usa el mismo motor de disponibilidad que el
// servidor real y guarda las reservas de prueba en este navegador.
(function () {
  var base = document.currentScript.src;
  var realFetch = window.fetch.bind(window);
  var mock;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : input.url;
    if (/^\/api\//.test(url)) {
      mock = mock || import(new URL('mock-api.mjs', base).href);
      return mock.then(function (m) { return m.handle(url, init || {}); });
    }
    return realFetch(input, init);
  };

  var TEXT = {
    va: 'Vista prèvia · Les reserves de prova només es guarden en este navegador.',
    es: 'Vista previa · Las reservas de prueba solo se guardan en este navegador.',
    en: 'Preview · Test bookings are only stored in this browser.',
  };
  document.addEventListener('DOMContentLoaded', function () {
    var lang = (document.documentElement.lang || 'ca').slice(0, 2);
    var text = TEXT[lang === 'ca' ? 'va' : lang] || TEXT.va;
    var style = document.createElement('style');
    style.textContent = '.preview-note{position:fixed;left:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:120;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:9px 10px 9px 16px;border-radius:999px;background:var(--ink);color:var(--paper);font:500 12.5px/1.35 var(--sans);box-shadow:0 10px 30px -10px rgba(0,0,0,.4)}' +
      '.preview-note button{flex:none;width:26px;height:26px;border-radius:50%;border:0;background:transparent;color:inherit;cursor:pointer;font-size:16px;line-height:1}' +
      '[data-done-ics]{display:none!important}';
    document.head.appendChild(style);
    var note = document.createElement('div');
    note.className = 'preview-note';
    note.setAttribute('role', 'note');
    note.innerHTML = '<span></span><button type="button" aria-label="×">×</button>';
    note.firstChild.textContent = text;
    note.lastChild.addEventListener('click', function () { note.remove(); });
    document.body.appendChild(note);
  });
})();
