// Se carga en <head> antes de pintar: fija la «luz» de la web según la hora
// en la sala (día / noche) o la preferencia guardada por la persona.
(function () {
  var d = document.documentElement;
  var pref = 'auto';
  try { pref = localStorage.getItem('theme') || 'auto'; } catch (e) {}
  // Amanecer y anochecer aproximados en la sala, por mes (horas decimales, hora local).
  var RISE = [8.3, 8, 7.5, 7.4, 6.9, 6.7, 6.9, 7.3, 7.6, 8, 7.6, 8.1];
  var SET = [17.9, 18.4, 18.9, 20.4, 20.9, 21.4, 21.5, 21, 20.3, 19.5, 17.9, 17.6];
  function resolve(p) {
    if (p === 'day' || p === 'night') return p;
    var now = new Date(), h, m;
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', month: 'numeric', hourCycle: 'h23' }).formatToParts(now);
      var o = {};
      for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
      h = +o.hour + (+o.minute) / 60; m = +o.month - 1;
    } catch (e) { h = now.getHours() + now.getMinutes() / 60; m = now.getMonth(); }
    return h >= SET[m] || h < RISE[m] ? 'night' : 'day';
  }
  d.setAttribute('data-theme', resolve(pref));
  d.setAttribute('data-theme-pref', pref);
  d.className += ' js';
  window.__theme = resolve;
  // Si el JS principal no llega a cargar, no dejamos contenido oculto.
  setTimeout(function () { if (!d.hasAttribute('data-ready')) d.classList.remove('js'); }, 3000);
})();
