// Rutas de la web en cada idioma. El valenciano (predeterminado) va en la raíz;
// el castellano en /es/ y el inglés en /en/. Las usan el build, los correos,
// los SMS y los enlaces de gestión de reservas.

export const LANG_META = {
  va: { name: 'Valencià', short: 'VAL', hreflang: 'ca', htmlLang: 'ca-valencia' },
  es: { name: 'Castellano', short: 'ES', hreflang: 'es', htmlLang: 'es' },
  en: { name: 'English', short: 'EN', hreflang: 'en', htmlLang: 'en' },
};

export const ROUTES = {
  home: { va: '/', es: '/es/', en: '/en/' },
  menus: { va: '/menus/', es: '/es/menus/', en: '/en/menus/' },
  philosophy: { va: '/filosofia/', es: '/es/filosofia/', en: '/en/philosophy/' },
  events: { va: '/esdeveniments/', es: '/es/eventos/', en: '/en/private-dining/' },
  gift: { va: '/regal/', es: '/es/regalo/', en: '/en/gift/' },
  contact: { va: '/contacte/', es: '/es/contacto/', en: '/en/contact/' },
  booking: { va: '/reserves/', es: '/es/reservas/', en: '/en/reservations/' },
  manage: { va: '/reserves/gestionar/', es: '/es/reservas/gestionar/', en: '/en/reservations/manage/' },
  legal: { va: '/avis-legal/', es: '/es/aviso-legal/', en: '/en/legal-notice/' },
  privacy: { va: '/privacitat/', es: '/es/privacidad/', en: '/en/privacy/' },
  cookies: { va: '/galetes/', es: '/es/cookies/', en: '/en/cookies/' },
  notFound: { va: '/404.html', es: '/es/404.html', en: '/en/404.html' },
};

export const routeFor = (id, lang) => ROUTES[id][lang] || ROUTES[id].va;
