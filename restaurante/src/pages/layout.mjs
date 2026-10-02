import { esc, hoursBlock } from '../assets/js/render.mjs';

const NAV = ['menus', 'philosophy', 'events', 'gift', 'contact'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const OG_LOCALE = { va: 'ca_ES', es: 'es_ES', en: 'en_GB' };

function restaurantLd(ctx) {
  const { site, cfg, lang, abs, url } = ctx;
  return {
    '@type': 'Restaurant',
    '@id': abs('/#restaurant'),
    name: site.name,
    description: site.description[lang],
    url: abs(url('home')),
    telephone: site.phone,
    email: site.email,
    image: abs('/assets/img/og.png'),
    logo: abs('/assets/img/icon-512.png'),
    servesCuisine: { va: ['Cuina d’autor', 'Mediterrània'], es: ['Cocina de autor', 'Mediterránea'], en: ['Contemporary', 'Mediterranean'] }[lang],
    priceRange: site.priceRange,
    currenciesAccepted: site.currency,
    acceptsReservations: abs(url('booking')),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: cfg.services.map((s) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: s.days.map((d) => `https://schema.org/${DAYS[d]}`),
      opens: s.slots[0],
      closes: s.slots.at(-1),
    })),
    hasMenu: abs(url('menus')),
    sameAs: Object.values(site.social).filter(Boolean),
  };
}

function menuLd(ctx) {
  const { cfg, lang, abs, url, site } = ctx;
  return {
    '@type': 'Menu',
    name: `${site.name} — ${ctx.t.menus.title}`,
    url: abs(url('menus')),
    inLanguage: ctx.t.htmlLang,
    hasMenuSection: cfg.menus.filter((m) => m.active).map((m) => ({
      '@type': 'MenuSection',
      name: m.name[lang] || m.name.es,
      description: m.summary[lang] || m.summary.es,
      offers: { '@type': 'Offer', price: m.price, priceCurrency: site.currency },
      hasMenuItem: m.courses.map((c) => ({ '@type': 'MenuItem', name: c[lang] || c.es })),
    })),
  };
}

function jsonLd(ctx, page) {
  const { abs, url, site } = ctx;
  const graph = [];
  if (page.id === 'home') {
    graph.push({ '@type': 'WebSite', '@id': abs('/#website'), name: site.name, url: abs(url('home')), inLanguage: ctx.langs.map((l) => l.htmlLang) });
  }
  if (page.jsonld) graph.push(restaurantLd(ctx));
  if (page.id === 'menus') graph.push(menuLd(ctx));
  if (page.id !== 'home' && page.id !== 'notFound') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.name, item: abs(url('home')) },
        { '@type': 'ListItem', position: 2, name: page.title, item: abs(url(page.id)) },
      ],
    });
  }
  if (!graph.length) return '';
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

function clientStrings(ctx) {
  const { t, lang, routes, site } = ctx;
  const data = {
    lang,
    name: site.name,
    phone: site.phone,
    timezone: site.timezone,
    address: `${site.address.street}, ${site.address.postalCode} ${site.address.city}`,
    routes: Object.fromEntries(Object.entries(routes).map(([k, v]) => [k, v[lang]])),
    closed: t.footer.closed, live: t.live, theme: t.theme, forms: t.forms, booking: t.booking, manage: t.manage, gift: t.gift,
  };
  return `<script type="application/json" id="i18n">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function langSwitch(ctx, page, cls, long = false) {
  return `<ul class="${cls}" aria-label="${esc(ctx.t.nav.languages)}">${ctx.langs.map((l) => (l.code === ctx.lang
    ? `<li><span aria-current="true" title="${esc(l.name)}">${esc(long ? l.name : l.short)}</span></li>`
    : `<li><a href="${ctx.url(page.id, l.code)}" hreflang="${l.hreflang}" lang="${l.htmlLang}" title="${esc(l.name)}">${esc(long ? l.name : l.short)}</a></li>`)).join('')}</ul>`;
}

export function layout(ctx, page) {
  const { t, lang, site, url, abs, asset } = ctx;
  const title = page.id === 'home' ? `${site.name} — ${page.title}` : `${page.title} · ${site.name}`;
  const desc = page.description || site.description[lang];
  const canonical = abs(url(page.id));
  const robots = ctx.indexable && !page.noindex ? 'index, follow, max-image-preview:large' : 'noindex, nofollow';
  const navLinks = NAV.map((id) => `<li><a href="${url(id)}"${id === page.id ? ' aria-current="page"' : ''}>${esc(t.nav[id])}</a></li>`).join('');
  const mobileLinks = ['home', ...NAV, 'booking'].map((id, i) =>
    `<li><a href="${url(id)}"${id === page.id ? ' aria-current="page"' : ''}><span class="num">${String(i).padStart(2, '0')}</span>${esc(id === 'home' ? site.name : t.nav[id])}</a></li>`).join('');
  const a = site.address;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${a.street} ${a.postalCode} ${a.city}`)}`;
  const alternates = page.noAlternate ? '' : [
    ...ctx.langs.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${abs(url(page.id, l.code))}">`),
    `<link rel="alternate" hreflang="x-default" href="${abs(url(page.id, ctx.defaultLang))}">`,
  ].join('\n');
  const ogAlt = ctx.langs.filter((l) => l.code !== lang).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l.code]}">`).join('\n');

  return `<!doctype html>
<html lang="${t.htmlLang}" data-theme="day">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${robots}">
${page.id === 'notFound' ? '' : `<link rel="canonical" href="${canonical}">`}
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs('/assets/img/og.png')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} — ${esc(site.tagline[lang])}">
<meta property="og:locale" content="${t.locale}">
${ogAlt}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f2eee6">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/instrument-serif-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-tight-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset('/assets/css/site.css')}">
<script src="${asset('/assets/js/theme.js')}"></script>
${jsonLd(ctx, page)}
</head>
<body class="page-${page.id}">
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header" data-header>
  <div class="header-inner">
    <a class="brand" href="${url('home')}">${esc(site.name)}</a>
    <nav class="nav" aria-label="${esc(t.nav.primary)}"><ul>${navLinks}</ul></nav>
    <div class="header-actions">
      ${langSwitch(ctx, page, 'lang-links')}
      <a class="btn btn-sm header-book" href="${url('booking')}">${esc(t.nav.booking)}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" data-menu-toggle>
        <span class="menu-toggle-label" data-open="${esc(t.nav.open)}" data-close="${esc(t.nav.close)}">${esc(t.nav.open)}</span>
        <span class="menu-toggle-icon" aria-hidden="true"><span></span><span></span></span>
      </button>
    </div>
  </div>
</header>
<div class="mobile-nav" id="mobile-nav" hidden>
  <nav aria-label="${esc(t.nav.primary)}"><ol>${mobileLinks}</ol></nav>
  <div class="mobile-nav-foot">
    <p>${esc(a.street)}<br>${esc(a.postalCode)} ${esc(a.city)}</p>
    <p><a href="tel:${site.phone.replace(/\s/g, '')}">${esc(site.phone)}</a></p>
    ${langSwitch(ctx, page, 'mobile-langs', true)}
  </div>
</div>

<main id="main">
${page.body}
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <h2 class="eyebrow">${esc(t.footer.visit)}</h2>
        <address>${esc(site.name)}<br>${esc(a.street)}<br>${esc(a.postalCode)} ${esc(a.city)} (${esc(a.region)})</address>
        <a class="link-arrow" href="${maps}" target="_blank" rel="noopener">${esc(t.footer.directions)}</a>
      </div>
      <div>
        <h2 class="eyebrow">${esc(t.footer.hours)}</h2>
        ${hoursBlock(ctx.cfg.services, lang, t.footer.closed)}
      </div>
      <div>
        <h2 class="eyebrow">${esc(t.footer.contact)}</h2>
        <p><a href="tel:${site.phone.replace(/\s/g, '')}">${esc(site.phone)}</a><br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
        ${site.social.instagram ? `<p><a href="${esc(site.social.instagram)}" target="_blank" rel="noopener">Instagram</a></p>` : ''}
      </div>
      <div>
        <h2 class="eyebrow">${esc(t.footer.explore)}</h2>
        <ul class="footer-links">${NAV.map((id) => `<li><a href="${url(id)}">${esc(t.nav[id])}</a></li>`).join('')}<li><a href="${url('manage')}">${esc(t.footer.manage)}</a></li></ul>
      </div>
    </div>
    <p class="footer-name" aria-hidden="true">${esc(site.name)}</p>
    <div class="footer-bottom">
      <p>© ${ctx.year} ${esc(site.name)}</p>
      <ul class="footer-legal">
        <li><a href="${url('legal')}">${esc(t.footer.legal)}</a></li>
        <li><a href="${url('privacy')}">${esc(t.footer.privacy)}</a></li>
        <li><a href="${url('cookies')}">${esc(t.footer.cookies)}</a></li>
      </ul>
      ${langSwitch(ctx, page, 'lang-links footer-langs')}
      <div class="theme-switch" role="radiogroup" aria-label="${esc(t.theme.label)}" title="${esc(t.theme.hint)}">
        <span class="theme-switch-label">${esc(t.theme.label)}</span>
        <button type="button" role="radio" data-theme-set="auto">${esc(t.theme.auto)}</button>
        <button type="button" role="radio" data-theme-set="day">${esc(t.theme.day)}</button>
        <button type="button" role="radio" data-theme-set="night">${esc(t.theme.night)}</button>
      </div>
    </div>
  </div>
</footer>
${clientStrings(ctx)}
<script type="module" src="${asset('/assets/js/site.js')}"></script>
${(page.scripts || []).map((s) => `<script type="module" src="${asset(s)}"></script>`).join('\n')}
</body>
</html>
`;
}
