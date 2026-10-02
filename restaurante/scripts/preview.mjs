// Genera una vista previa estática y navegable (sin servidor) en la carpeta
// indicada: rutas relativas, y la API simulada de preview/ para que el
// asistente de reservas funcione. No se usa en producción.
//
//   node scripts/preview.mjs <carpeta>

import { execSync } from 'node:child_process';
import { mkdir, readFile, writeFile, readdir, rm, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import site from '../site.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '.preview'));
const SKIP = new Set(['admin', '_headers', 'robots.txt', 'sitemap.xml', 'site.webmanifest', '.well-known']);

execSync('node scripts/build.mjs', { cwd: ROOT, stdio: 'inherit', env: { ...process.env, NOINDEX: '1' } });
await rm(OUT, { recursive: true, force: true });

// '/va/menus/' visto desde 'va/' → 'menus/index.html'
function rel(fromDir, target) {
  const [p, q = ''] = target.split(/(?=[?#])/);
  let file = p.replace(/^\//, '');
  if (file === '' ) file = 'va/index.html';
  else if (file.endsWith('/')) file += 'index.html';
  const r = path.posix.relative('/' + fromDir, '/' + file) || 'index.html';
  return r + q;
}

function rewriteHtml(html, fromDir) {
  html = html.replace(/(href|src)="(\/(?!\/)[^"]*)"/g, (_, attr, url) => `${attr}="${rel(fromDir, url)}"`);
  html = html.replace(/(<script type="application\/json" id="i18n">)([\s\S]*?)(<\/script>)/, (_, a, json, b) => {
    const data = JSON.parse(json.replace(/\\u003c/g, '<'));
    for (const k of Object.keys(data.routes)) data.routes[k] = rel(fromDir, data.routes[k]);
    return a + JSON.stringify(data).replace(/</g, '\\u003c') + b;
  });
  html = html.replace(/(<script src="[^"]*assets\/js\/theme\.js[^"]*"><\/script>)/, `$1\n<script src="${rel(fromDir, '/assets/preview/preview.js')}"></script>`);
  html = html.replace(/<link rel="(manifest|canonical)"[^>]*>\n?/g, '');
  return html;
}

const files = [];
async function walk(dir) {
  for (const e of await readdir(path.join(DIST, dir), { withFileTypes: true })) {
    const relPath = path.posix.join(dir, e.name);
    if (!dir && SKIP.has(e.name)) continue;
    if (e.isDirectory()) { await walk(relPath); continue; }
    const out = path.join(OUT, relPath);
    await mkdir(path.dirname(out), { recursive: true });
    if (e.name.endsWith('.html')) {
      await writeFile(out, rewriteHtml(await readFile(path.join(DIST, relPath), 'utf8'), path.posix.dirname(relPath) === '.' ? '' : path.posix.dirname(relPath)));
    } else if (relPath === 'assets/css/site.css') {
      await writeFile(out, (await readFile(path.join(DIST, relPath), 'utf8')).replaceAll("url('/assets/", "url('../"));
    } else {
      await copyFile(path.join(DIST, relPath), out);
    }
    files.push(relPath);
  }
}
await walk('');

// Motor real de disponibilidad + API simulada
await mkdir(path.join(OUT, 'assets/lib'), { recursive: true });
await mkdir(path.join(OUT, 'assets/preview'), { recursive: true });
for (const f of ['availability.mjs', 'defaults.mjs', 'time.mjs', 'http.mjs']) {
  await copyFile(path.join(ROOT, 'lib', f), path.join(OUT, 'assets/lib', f));
  files.push(`assets/lib/${f}`);
}
for (const f of ['preview.js', 'mock-api.mjs']) {
  await copyFile(path.join(ROOT, 'preview', f), path.join(OUT, 'assets/preview', f));
  files.push(`assets/preview/${f}`);
}

// Página de entrada: la portada en valenciano, sin el esqueleto del documento.
let entry = rewriteHtml(await readFile(path.join(DIST, 'va/index.html'), 'utf8'), '');
const title = entry.match(/<title>[\s\S]*?<\/title>/)[0];
entry = entry.replace(title, '')
  .replace(/<!doctype html>\s*/i, '')
  .replace(/<html[^>]*>\s*/, '').replace(/<\/html>\s*/, '')
  .replace(/<head>\s*/, '').replace(/<\/head>\s*/, '')
  .replace(/<body[^>]*>\s*/, '').replace(/<\/body>\s*/, '')
  .replace(/<meta charset="utf-8">\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '');
entry = `<title>${site.name}</title>\n<script>document.documentElement.lang = 'ca-valencia';</script>\n${entry}`;
await writeFile(path.join(OUT, 'entry.html'), entry);

await writeFile(path.join(OUT, 'files.json'), JSON.stringify(files.filter((f) => f !== 'index.html'), null, 1));
console.log(`✓ vista previa en ${OUT}: ${files.length} ficheros + entry.html`);
