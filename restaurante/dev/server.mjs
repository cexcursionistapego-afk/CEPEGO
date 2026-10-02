// Servidor local que imita a Netlify: sirve dist/ y ejecuta las funciones de
// netlify/functions con almacenamiento en ficheros (.data/).
//
//   npm run dev  →  http://localhost:8888   (panel: /admin, usuario admin)

import http from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 8888);

process.env.USE_FILE_STORE = '1';
process.env.DATA_DIR ||= path.join(ROOT, '.data');
process.env.ADMIN_PASSWORD ||= 'admin-local-2026';
process.env.SITE_URL ||= `http://localhost:${PORT}`;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};

const functions = [];
for (const f of await readdir(path.join(ROOT, 'netlify/functions'))) {
  if (!f.endsWith('.mjs')) continue;
  const mod = await import(pathToFileURL(path.join(ROOT, 'netlify/functions', f)));
  const paths = [mod.config?.path].flat().filter(Boolean);
  if (paths.length) functions.push({ name: f, handler: mod.default, paths });
}

function matches(pattern, pathname) {
  if (pattern.endsWith('/*')) return pathname.startsWith(pattern.slice(0, -1)) || pathname === pattern.slice(0, -2);
  return pathname === pattern || pathname === pattern + '/';
}

async function toRequest(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  return new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
  });
}

async function sendResponse(res, response) {
  const headers = {};
  response.headers.forEach((v, k) => { headers[k] = v; });
  res.writeHead(response.status, headers);
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function serveStatic(req, res, pathname) {
  let file = path.join(DIST, decodeURIComponent(pathname));
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { location: pathname + '/' }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    return res.end(data);
  } catch {
    try {
      const prefix = pathname.match(/^\/(es|en)\//)?.[1];
      const html = await readFile(path.join(DIST, prefix ? `${prefix}/404.html` : '404.html'));
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      return res.end(html);
    } catch {
      res.writeHead(404); return res.end('404');
    }
  }
}

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  // Igual que netlify.toml: la raíz lleva al idioma por defecto (valenciano).
  if (pathname === '/') { res.writeHead(301, { location: '/va/' }); return res.end(); }
  const fn = functions.find((f) => f.paths.some((p) => matches(p, pathname)));
  try {
    if (fn) {
      const response = await fn.handler(await toRequest(req), { ip: req.socket.remoteAddress });
      return sendResponse(res, response);
    }
    return serveStatic(req, res, pathname);
  } catch (e) {
    console.error(e);
    res.writeHead(500); res.end('error');
  }
}).listen(PORT, () => {
  console.log(`\n  ▸ Web:   http://localhost:${PORT}\n  ▸ Panel: http://localhost:${PORT}/admin  (admin / ${process.env.ADMIN_PASSWORD})\n`);
});
