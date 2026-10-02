// Genera la imagen para redes sociales (og.png) y los iconos a partir del
// nombre y los platos generativos. Necesita Playwright (solo en local):
//   npx -y playwright@1 install chromium   (si no lo tienes)
//   node scripts/images.mjs
// Vuelve a ejecutarlo cuando cambie el nombre del restaurante.

import { createRequire } from 'node:module';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import site from '../site.config.mjs';
import { plateSVG } from '../src/assets/js/plate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/assets/img');
const font = (f) => pathToFileURL(path.join(ROOT, 'src/assets/fonts', f)).href;

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* sin dependencia local */ }
  const require = createRequire(import.meta.url);
  return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const css = `
@font-face { font-family: S; src: url(${font('schibsted-grotesk-latin-wght-normal.woff2')}); font-weight: 400 900; }
@font-face { font-family: T; src: url(${font('schibsted-grotesk-latin-wght-normal.woff2')}); font-weight: 400 900; }
* { margin: 0; box-sizing: border-box; }
body { --plate: #ffffff; --plate-line: rgba(18,20,18,.16); background: #f4f5f2; color: #121412; overflow: hidden; }
`;

const og = `<!doctype html><html><head><style>${css}
.og { width: 1200px; height: 630px; position: relative; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
.plate-wrap { position: absolute; width: 400px; height: 400px; right: 64px; top: 115px; filter: drop-shadow(0 24px 40px rgba(20,32,26,.14)); }
.meta { font: 500 19px T; color: #676d66; display: flex; gap: 32px; position: relative; }
.name { font: 740 176px/0.86 S; letter-spacing: -.06em; margin-left: -8px; position: relative; }
.foot { display: flex; justify-content: space-between; align-items: end; position: relative; }
.lede { font: 450 34px/1.15 S; letter-spacing: -.015em; max-width: 620px; }
.url { font: 500 19px T; color: #676d66; }
</style></head><body><div class="og">
  <div class="plate-wrap">${plateSVG('hero · tomate, azafrán, hinojo', { type: 2 })}</div>
  <div class="meta"><span>${site.tagline.va}</span><span>${site.address.city} · ${site.address.region}</span></div>
  <div class="name">${site.name}</div>
  <div class="foot"><p class="lede">${site.tagline.va} · ${site.tagline.es}</p><p class="url">${site.address.city}</p></div>
</div></body></html>`;

const icon = (size, padding) => `<!doctype html><html><head><style>${css}
.i { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: #1e5a43; }
.p { width: ${size - padding * 2}px; height: ${size - padding * 2}px; }
</style></head><body><div class="i"><div class="p">${plateSVG('icono · gamba roja, azafrán', { type: 1 })}</div></div></body></html>`;

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
// Se carga desde un fichero (no about:blank) para que las fuentes locales se apliquen.
const tmp = await mkdtemp(path.join(tmpdir(), 'og-'));
const shot = async (html, w, h, file) => {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const htmlFile = path.join(tmp, file + '.html');
  await writeFile(htmlFile, html);
  await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, file) });
  await page.close();
};
await shot(og, 1200, 630, 'og.png');
await shot(icon(512, 40), 512, 512, 'icon-512.png');
await shot(icon(192, 14), 192, 192, 'icon-192.png');
await shot(icon(180, 14), 180, 180, 'apple-touch-icon.png');
await shot(icon(32, 1), 32, 32, 'favicon-32.png');
await browser.close();
await rm(tmp, { recursive: true, force: true });
console.log('✓ og.png e iconos generados en src/assets/img/');
