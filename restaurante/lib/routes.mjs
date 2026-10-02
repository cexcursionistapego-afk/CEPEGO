// Rutas de la web en cada idioma: valenciano en /val/ (idioma predeterminado:
// la raíz / redirige allí), castellano en /es/ e inglés en /en/. Las usan el
// build, los correos, los SMS y los enlaces de gestión de reservas.

export const LANG_META = {
  va: { name: 'Valencià', short: 'VAL', hreflang: 'ca', htmlLang: 'ca-valencia' },
  es: { name: 'Castellano', short: 'ES', hreflang: 'es', htmlLang: 'es' },
  en: { name: 'English', short: 'EN', hreflang: 'en', htmlLang: 'en' },
};

export const ROUTES = {
  home: { va: '/val/', es: '/es/', en: '/en/' },
  menus: { va: '/val/menus/', es: '/es/menus/', en: '/en/menus/' },
  philosophy: { va: '/val/filosofia/', es: '/es/filosofia/', en: '/en/philosophy/' },
  events: { va: '/val/esdeveniments/', es: '/es/eventos/', en: '/en/private-dining/' },
  gift: { va: '/val/regal/', es: '/es/regalo/', en: '/en/gift/' },
  contact: { va: '/val/contacte/', es: '/es/contacto/', en: '/en/contact/' },
  booking: { va: '/val/reserves/', es: '/es/reservas/', en: '/en/reservations/' },
  manage: { va: '/val/reserves/gestionar/', es: '/es/reservas/gestionar/', en: '/en/reservations/manage/' },
  legal: { va: '/val/avis-legal/', es: '/es/aviso-legal/', en: '/en/legal-notice/' },
  privacy: { va: '/val/privacitat/', es: '/es/privacidad/', en: '/en/privacy/' },
  cookies: { va: '/val/galetes/', es: '/es/cookies/', en: '/en/cookies/' },
  // La 404 en valenciano va en la raíz: Netlify la usa para cualquier ruta inexistente.
  notFound: { va: '/404.html', es: '/es/404.html', en: '/en/404.html' },
};

export const routeFor = (id, lang) => ROUTES[id][lang] || ROUTES[id].va;
