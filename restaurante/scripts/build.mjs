// Genera el sitio estático en dist/: páginas en valenciano (/), castellano
// (/es/) e inglés (/en/), recursos, panel de gestión, sitemap, robots,
// cabeceras y manifest.
//
//   node scripts/build.mjs
//
// Indexación: mientras no exista SITE_URL (dominio definitivo), la web se
// publica con «noindex» para que Google no indexe el nombre y los datos
// provisionales. Al poner SITE_URL=https://dominio.com se vuelve indexable.

import { mkdir, rm, writeFile, readFile, cp, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import site from '../site.config.mjs';
import { DEFAULT_CONFIG } from '../lib/defaults.mjs';
import { ROUTES, LANG_META } from '../lib/routes.mjs';
import va from '../content/va.mjs';
import es from '../content/es.mjs';
import en from '../content/en.mjs';
import { layout } from '../src/pages/layout.mjs';
import { locale } from '../src/assets/js/render.mjs';
import home from '../src/pages/home.mjs';
import menus from '../src/pages/menus.mjs';
import philosophy from '../src/pages/philosophy.mjs';
import { events, gift, contact } from '../src/pages/forms-pages.mjs';
import { booking, manage, notFound } from '../src/pages/booking.mjs';
import { legal, privacy, cookies } from '../src/pages/legal.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const PAGES = [home, menus, philosophy, events, gift, contact, booking, manage, legal, privacy, cookies, notFound];
const DICTS = { va, es, en };
const LANGS = site.languages.filter((l) => DICTS[l]);
const DEFAULT = LANGS[0];

async function hashDir(dir) {
  const h = createHash('sha1');
  const walk = async (d) => {
    for (const e of (await readdir(d, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else h.update(e.name).update(await readFile(p));
    }
  };
  await walk(dir);
  return h.digest('hex').slice(0, 10);
}

function seasonLabel(dict, date = new Date()) {
  const m = date.getUTCMonth();
  const idx = m === 11 || m < 2 ? 0 : m < 5 ? 1 : m < 8 ? 2 : 3;
  const year = m === 11 ? `${date.getUTCFullYear()}–${String(date.getUTCFullYear() + 1).slice(2)}` : date.getUTCFullYear();
  return `${dict.seasons[idx]} ${year}`;
}

async function build() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await cp(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true });
  await cp(path.join(SRC, 'admin'), path.join(DIST, 'admin'), { recursive: true });

  const version = await hashDir(SRC);
  const base = site.url.replace(/\/$/, '');
  const indexable = Boolean(process.env.SITE_URL) && process.env.NOINDEX !== '1';
  const now = new Date();
  const indexed = new Set();

  for (const lang of LANGS) {
    const t = DICTS[lang];
    const url = (id, l = lang) => ROUTES[id][l];
    const ctx = {
      lang, t, site, cfg: DEFAULT_CONFIG, routes: ROUTES, url, indexable,
      langs: LANGS.map((code) => ({ code, ...LANG_META[code] })),
      defaultLang: DEFAULT,
      abs: (p) => (p.startsWith('http') ? p : base + p),
      asset: (p) => `${p}?v=${version}`,
      year: now.getUTCFullYear(),
      season: seasonLabel(t, now),
      updated: new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'long', year: 'numeric' }).format(now),
    };
    for (const make of PAGES) {
      const page = make(ctx);
      const route = ROUTES[page.id][lang];
      const file = route.endsWith('.html') ? path.join(DIST, route) : path.join(DIST, route, 'index.html');
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, layout(ctx, page));
      if (!page.noindex && !route.endsWith('.html')) indexed.add(page.id);
    }
  }

  // Panel de gestión: versión de recursos y nombre del restaurante
  const adminFile = path.join(DIST, 'admin', 'index.html');
  await writeFile(adminFile, (await readFile(adminFile, 'utf8')).replaceAll('{{v}}', version).replaceAll('{{name}}', site.name));

  // sitemap.xml con todas las versiones de idioma de cada página
  const alternates = (id) => [
    ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${LANG_META[l].hreflang}" href="${base}${ROUTES[id][l]}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${ROUTES[id][DEFAULT]}"/>`,
  ].join('\n');
  const lastmod = now.toISOString().slice(0, 10);
  const urls = [...indexed].flatMap((id) => LANGS.map((l) => `  <url>
    <loc>${base}${ROUTES[id][l]}</loc>
    <lastmod>${lastmod}</lastmod>
${alternates(id)}
  </url>`)).join('\n');
  await writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`);

  // robots.txt: se permite rastrear también en modo provisional para que
  // Google vea el «noindex» de cada página (un Disallow no evitaría indexar).
  const privatePaths = ['/admin/', '/api/', '/r/', ...LANGS.map((l) => ROUTES.manage[l])];
  await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\n${privatePaths.map((p) => `Disallow: ${p}`).join('\n')}\n\nSitemap: ${base}/sitemap.xml\n`);

  // Cabeceras generadas: en modo provisional, noindex en todo el sitio.
  await writeFile(path.join(DIST, '_headers'), indexable ? '' : `/*\n  X-Robots-Tag: noindex, nofollow\n`);

  // security.txt (RFC 9116): a quién avisar de un problema de seguridad
  const expires = new Date(now.getTime() + 365 * 86400000).toISOString();
  await mkdir(path.join(DIST, '.well-known'), { recursive: true });
  await writeFile(path.join(DIST, '.well-known', 'security.txt'),
    `Contact: mailto:${site.email}\nExpires: ${expires}\nPreferred-Languages: ca, es, en\nCanonical: ${base}/.well-known/security.txt\n`);

  await writeFile(path.join(DIST, 'site.webmanifest'), JSON.stringify({
    name: site.name, short_name: site.name, lang: LANG_META[DEFAULT].htmlLang, start_url: '/', display: 'standalone',
    background_color: '#f2eee6', theme_color: '#f2eee6',
    icons: [
      { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2));

  console.log(`✓ build: ${indexed.size} páginas × ${LANGS.length} idiomas (${LANGS.join(', ')}) · ${indexable ? 'indexable' : 'NOINDEX (provisional)'} · v${version} · ${base}`);
}

await build();
