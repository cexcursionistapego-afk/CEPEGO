// Autenticación del panel de gestión y firma de enlaces de cliente.
//
// · Cuenta inicial «admin» con la contraseña de la variable ADMIN_PASSWORD.
// · Más usuarios (rol admin o sala) se crean desde el panel; sus contraseñas
//   se guardan con scrypt.
// · La sesión es una cookie HttpOnly firmada con HMAC (sin estado en servidor).

import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual, randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { readJSON, update, getStore } from './store.mjs';
import { HttpError, getCookie, isHttps } from './http.mjs';

const scrypt = promisify(scryptCb);
// En HTTPS la cookie lleva el prefijo __Host- (solo este dominio, ruta / y Secure).
const cookieName = (req) => (isHttps(req) ? '__Host-rs' : 'rs');
const MIN_ADMIN_PASSWORD = 12;
const adminEnvOk = () => (process.env.ADMIN_PASSWORD || '').length >= MIN_ADMIN_PASSWORD;
const SESSION_HOURS = 12;
export const ROLES = ['admin', 'sala'];

let secretCache;
export async function getSecret() {
  if (process.env.APP_SECRET && process.env.APP_SECRET.length >= 16) return process.env.APP_SECRET;
  if (secretCache) return secretCache;
  const store = await getStore();
  const existing = await store.getJSON('meta/secret');
  if (existing) return (secretCache = existing.data.value);
  const value = randomBytes(32).toString('base64url');
  const created = await store.setJSON('meta/secret', { value }, { onlyIfNew: true });
  if (created) return (secretCache = value);
  return (secretCache = (await store.getJSON('meta/secret')).data.value);
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const unb64 = (s) => Buffer.from(s, 'base64url').toString();

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function sign(payload) {
  const body = b64(JSON.stringify(payload));
  const mac = createHmac('sha256', await getSecret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export async function verify(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = createHmac('sha256', await getSecret()).update(body).digest('base64url');
  if (!safeEqual(mac, expected)) return null;
  try {
    const data = JSON.parse(unb64(body));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

/** Token del enlace «gestionar mi reserva» (no caduca; va ligado al id). */
export async function bookingToken(id) {
  return createHmac('sha256', await getSecret()).update('booking:' + id).digest('base64url').slice(0, 32);
}

/** Token corto para el enlace de los SMS (cada carácter cuenta). */
export async function smsToken(id) {
  return createHmac('sha256', await getSecret()).update('sms:' + id).digest('base64url').slice(0, 10);
}

export async function checkSmsToken(id, token) {
  return safeEqual(await smsToken(id), String(token || ''));
}

export async function checkBookingToken(id, token) {
  return safeEqual(await bookingToken(id), String(token || ''));
}

// ── Contraseñas ────────────────────────────────────────────────────────────

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function checkPassword(password, stored) {
  const [alg, salt, key] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !key) return false;
  const got = await scrypt(password, Buffer.from(salt, 'base64url'), 64);
  return timingSafeEqual(got, Buffer.from(key, 'base64url'));
}

// ── Usuarios ──────────────────────────────────────────────────────────────

export async function listUsers() {
  const users = await readJSON('users', []);
  const list = users.map(({ hash, ...u }) => u);
  if (adminEnvOk()) list.unshift({ id: 'admin', username: 'admin', name: 'Administración', role: 'admin', builtin: true });
  return list;
}

export async function createUser({ username, name, role, password }) {
  username = String(username || '').trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(username) || username === 'admin') {
    throw new HttpError(400, 'invalid', 'Usuario: 3-32 caracteres (letras, números, punto, guion).');
  }
  if (!ROLES.includes(role)) throw new HttpError(400, 'invalid', 'Rol no válido.');
  if (String(password || '').length < 10) throw new HttpError(400, 'invalid', 'La contraseña debe tener al menos 10 caracteres.');
  const hash = await hashPassword(password);
  await update('users', (users) => {
    if (users.some((u) => u.username === username)) throw new HttpError(409, 'exists', 'Ese usuario ya existe.');
    users.push({ id: randomUUID(), username, name: String(name || username).trim().slice(0, 60), role, hash, createdAt: new Date().toISOString() });
    return users;
  }, []);
}

export async function deleteUser(id) {
  await update('users', (users) => users.filter((u) => u.id !== id), []);
}

export async function changePassword(id, password) {
  if (String(password || '').length < 10) throw new HttpError(400, 'invalid', 'La contraseña debe tener al menos 10 caracteres.');
  const hash = await hashPassword(password);
  await update('users', (users) => {
    const u = users.find((x) => x.id === id);
    if (!u) throw new HttpError(404, 'not_found', 'Usuario no encontrado.');
    u.hash = hash;
    return users;
  }, []);
}

async function authenticate(username, password) {
  username = String(username || '').trim().toLowerCase();
  password = String(password || '');
  if (!username || !password) return null;
  if (username === 'admin') {
    if (adminEnvOk() && safeEqual(password, process.env.ADMIN_PASSWORD)) return { id: 'admin', username: 'admin', name: 'Administración', role: 'admin' };
    return null;
  }
  const users = await readJSON('users', []);
  const u = users.find((x) => x.username === username);
  if (u && (await checkPassword(password, u.hash))) return { id: u.id, username: u.username, name: u.name, role: u.role };
  return null;
}

// ── Límite de intentos ─────────────────────────────────────────────────────

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

async function rateCheck(ip) {
  const key = 'ratelimit/login-' + ip.replace(/[^a-zA-Z0-9.:-]/g, '_');
  const r = await readJSON(key, null);
  if (r && Date.now() - r.since < WINDOW_MS && r.count >= MAX_ATTEMPTS) {
    throw new HttpError(429, 'rate_limit', 'Demasiados intentos. Espera unos minutos.');
  }
  return key;
}

async function rateFail(key) {
  await update(key, (r) => {
    if (!r.since || Date.now() - r.since > WINDOW_MS) return { since: Date.now(), count: 1 };
    return { ...r, count: r.count + 1 };
  }, {});
}

// ── Sesión ───────────────────────────────────────────────────────────────

function cookieHeader(req, value, maxAge) {
  const parts = [`${cookieName(req)}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`];
  if (isHttps(req)) parts.push('Secure');
  return parts.join('; ');
}

export async function login(req, ip, { username, password }) {
  const key = await rateCheck(ip);
  const user = await authenticate(username, password);
  if (!user) {
    await rateFail(key);
    if (!adminEnvOk() && String(username).trim().toLowerCase() === 'admin') {
      throw new HttpError(401, 'not_configured', `Configura ADMIN_PASSWORD en las variables de entorno (mínimo ${MIN_ADMIN_PASSWORD} caracteres).`);
    }
    throw new HttpError(401, 'credentials', 'Usuario o contraseña incorrectos.');
  }
  const token = await sign({ ...user, exp: Date.now() + SESSION_HOURS * 3600 * 1000 });
  return { user, cookie: cookieHeader(req, token, SESSION_HOURS * 3600) };
}

export function logoutCookie(req) {
  return cookieHeader(req, '', 0);
}

export async function currentUser(req) {
  const data = await verify(getCookie(req, cookieName(req)));
  if (!data) return null;
  // Un usuario borrado pierde el acceso aunque su cookie siga viva.
  if (data.id !== 'admin') {
    const users = await readJSON('users', []);
    if (!users.some((u) => u.id === data.id)) return null;
  } else if (!adminEnvOk()) {
    return null;
  }
  return { id: data.id, username: data.username, name: data.name, role: data.role };
}

export async function requireUser(req, role) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'auth', 'Sesión caducada. Vuelve a entrar.');
  if (role && user.role !== role) throw new HttpError(403, 'forbidden', 'No tienes permiso para esta acción.');
  return user;
}
