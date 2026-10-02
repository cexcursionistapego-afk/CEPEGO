// Identidad del restaurante. Es el ÚNICO sitio que hay que tocar cuando haya
// nombre y dominio definitivos: el build regenera todas las páginas, los
// correos y los datos estructurados a partir de aquí.
//
// Los valores marcados como PROVISIONAL son de relleno.

export default {
  name: 'Bagatge',
  // Dominio definitivo (sin barra final), p. ej. https://bagatgerestaurant.com.
  // Se define con la variable SITE_URL en Netlify; mientras no exista se usa el
  // gratuito *.netlify.app (variable URL) y la web no se indexa.
  url: process.env.SITE_URL || process.env.URL || 'http://localhost:8888',

  tagline: { va: 'Cuina d’autor', es: 'Cocina de autor', en: "Chef's table & tasting menus" },
  description: {
    va: 'Restaurant de cuina d’autor. Dos menús degustació que canvien amb la temporada, producte de proximitat i una sala de només vint-i-quatre comensals.',
    es: 'Restaurante de cocina de autor. Dos menús degustación que cambian con la temporada, producto de cercanía y una sala de solo veinticuatro comensales.',
    en: 'A chef-driven restaurant. Two seasonal tasting menus, local produce and a dining room of just twenty-four guests.',
  },

  chef: 'Joan Sastre',
  founded: 2026,

  // Localización. Teléfono y email: PROVISIONALES.
  address: {
    street: 'Carretera de les Marines, s/n',
    postalCode: '03700',
    city: 'Dénia',
    region: 'Alicante',
    country: 'ES',
    countryName: { va: 'Espanya', es: 'España', en: 'Spain' },
  },
  // Coordenadas aproximadas (Les Marines, Dénia): ajustarlas con las exactas del local.
  geo: { lat: 38.8556, lng: 0.0838 },
  phone: '+34 600 000 000',
  email: 'reservas@ejemplo.com',
  social: {
    instagram: 'https://www.instagram.com/',
  },

  // Datos fiscales para el aviso legal (PROVISIONAL).
  legal: {
    company: 'Nombre Fiscal, S.L.',
    taxId: 'B00000000',
    registry: 'Registro Mercantil de Alicante, tomo 0000, folio 00, hoja A-000000',
  },

  timezone: 'Europe/Madrid',
  currency: 'EUR',
  priceRange: '€€€€',
  // Idiomas de la web: valenciano en /va/ (predeterminado: la raíz / lleva
  // allí), castellano en /es/ e inglés en /en/. Para quitar el inglés, bórralo
  // de esta lista.
  languages: ['va', 'es', 'en'],
  defaultLanguage: 'va',
};
