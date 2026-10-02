// Capa de almacenamiento. En Netlify usa Netlify Blobs (persistente, sin base de
// datos externa ni coste). En local usa ficheros JSON en .data/ con la misma
// interfaz, incluidas las escrituras condicionales por ETag que evitan que dos
// reservas simultáneas pisen el mismo hueco.

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const STORE_NAME = process.env.STORE_NAME || 'restaurante';

function onNetlify() {
  if (process.env.USE_FILE_STORE) return false;
  return Boolean(globalThis.Netlify || process.env.NETLIFY_BLOBS_CONTEXT || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

class BlobStore {
  constructor(store) { this.store = store; }
  async getJSON(key) {
    const r = await this.store.getWithMetadata(key, { type: 'json' });
    return r ? { data: r.data, etag: r.etag } : null;
  }
  async setJSON(key, data, { etag, onlyIfNew } = {}) {
    const opts = etag ? { onlyIfMatch: etag } : onlyIfNew ? { onlyIfNew: true } : {};
    const r = await this.store.setJSON(key, data, opts);
    return r ? r.modified !== false : true;
  }
  async list(prefix) {
    const { blobs } = await this.store.list({ prefix });
    return blobs.map((b) => b.key);
  }
  async delete(key) { await this.store.delete(key); }
}

class FileStore {
  constructor(dir) { this.dir = dir; this.locks = new Map(); }
  file(key) { return path.join(this.dir, encodeURIComponent(key) + '.json'); }
  async getJSON(key) {
    try {
      const raw = await readFile(this.file(key), 'utf8');
      return { data: JSON.parse(raw), etag: createHash('sha1').update(raw).digest('hex') };
    } catch (e) {
      if (e.code === 'ENOENT') return null;
      throw e;
    }
  }
  async setJSON(key, data, { etag, onlyIfNew } = {}) {
    // Serializa escrituras sobre la misma clave dentro del proceso.
    const prev = this.locks.get(key) || Promise.resolve();
    let release;
    const next = new Promise((r) => (release = r));
    this.locks.set(key, prev.then(() => next));
    await prev;
    try {
      const current = await this.getJSON(key);
      if (onlyIfNew && current) return false;
      if (etag && (!current || current.etag !== etag)) return false;
      await mkdir(this.dir, { recursive: true });
      const tmp = this.file(key) + '.' + randomUUID() + '.tmp';
      await writeFile(tmp, JSON.stringify(data));
      await rename(tmp, this.file(key));
      return true;
    } finally {
      release();
    }
  }
  async list(prefix) {
    try {
      const files = await readdir(this.dir);
      return files
        .filter((f) => f.endsWith('.json'))
        .map((f) => decodeURIComponent(f.slice(0, -5)))
        .filter((k) => k.startsWith(prefix || ''));
    } catch (e) {
      if (e.code === 'ENOENT') return [];
      throw e;
    }
  }
  async delete(key) { await rm(this.file(key), { force: true }); }
}

let cached;
export async function getStore() {
  if (cached) return cached;
  if (onNetlify()) {
    const { getStore: netlifyStore } = await import('@netlify/blobs');
    cached = new BlobStore(netlifyStore({ name: STORE_NAME, consistency: 'strong' }));
  } else {
    const dir = process.env.DATA_DIR || path.resolve(process.cwd(), '.data');
    cached = new FileStore(dir);
  }
  return cached;
}

/** Sustituye el almacén (tests). */
export function setStore(store) { cached = store; }
export function createFileStore(dir) { return new FileStore(dir); }

export async function readJSON(key, fallback = null) {
  const store = await getStore();
  const r = await store.getJSON(key);
  return r ? r.data : fallback;
}

export async function writeJSON(key, data) {
  const store = await getStore();
  return store.setJSON(key, data);
}

/**
 * Lectura-modificación-escritura atómica con reintentos optimistas.
 * `fn` recibe una copia del valor actual (o `init`) y devuelve el nuevo valor;
 * si lanza una excepción, la operación se cancela y la excepción se propaga.
 */
export async function update(key, fn, init) {
  const store = await getStore();
  for (let attempt = 0; attempt < 25; attempt++) {
    const current = await store.getJSON(key);
    const base = current ? current.data : structuredClone(init);
    const result = await fn(base);
    if (result === undefined) return base;
    const ok = await store.setJSON(key, result, current ? { etag: current.etag } : { onlyIfNew: true });
    if (ok) return result;
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 40 * Math.min(attempt + 1, 6)));
  }
  const err = new Error('Conflicto de escritura, inténtalo de nuevo.');
  err.status = 409;
  err.code = 'conflict';
  throw err;
}
