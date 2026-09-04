/* CEPEGO — Netlify Identity: en iniciar sessió des de la portada, porta
   directament al panell d'administració. Estava en línia dins de l'HTML;
   s'ha tret a un fitxer propi perquè la Content-Security-Policy puga
   prohibir els scripts en línia (la defensa principal contra XSS). */
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', function (u) {
    if (!u) {
      window.netlifyIdentity.on('login', function () {
        document.location.href = '/juansa/';
      });
    }
  });
}
