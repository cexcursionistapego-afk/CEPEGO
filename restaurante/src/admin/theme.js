// Tema del panel: claro u oscuro según el sistema o la última elección.
(function () {
  var t = null;
  try { t = localStorage.getItem('admin-theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
})();
