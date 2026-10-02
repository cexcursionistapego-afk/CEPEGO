import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.USE_FILE_STORE = '1';
process.env.DATA_DIR = await mkdtemp(path.join(tmpdir(), 'reservas-'));
process.env.ADMIN_PASSWORD = 'contraseña-de-prueba';

const { DEFAULT_CONFIG } = await import('../lib/defaults.mjs');
const { dayAvailability, assertBookable } = await import('../lib/availability.mjs');
const { createBooking, updateBooking, getDay, findByCode, addToWaitlist, getGuests, eraseGuest, purgeInactiveGuests } = await import('../lib/bookings.mjs');
const { createRequest, listRequests } = await import('../lib/requests.mjs');
const { zonedToUtc, localStamp, addDays, weekday } = await import('../lib/time.mjs');
const { saveConfig } = await import('../lib/config.mjs');
const { bookingToken, checkBookingToken, hashPassword, checkPassword, sign, verify } = await import('../lib/auth.mjs');

const cfg = { ...structuredClone(DEFAULT_CONFIG), timezone: 'Europe/Madrid' };
// Un miércoles cualquiera a las 10:00 en Madrid como «ahora».
const NOW = zonedToUtc('2030-01-02', '10:00', 'Europe/Madrid');
const WED = '2030-01-02';
const THU = '2030-01-03';
const MON = '2030-01-07';

const guest = (over = {}) => ({
  date: THU, service: 'cena', time: '21:00', party: 2, name: 'Ana Pérez',
  email: 'ana@example.com', phone: '600123123', consentPrivacy: true, ...over,
});

test('zona horaria: conversiones locales en invierno y verano', () => {
  assert.equal(zonedToUtc('2030-01-15', '21:00', 'Europe/Madrid').toISOString(), '2030-01-15T20:00:00.000Z');
  assert.equal(zonedToUtc('2030-07-15', '21:00', 'Europe/Madrid').toISOString(), '2030-07-15T19:00:00.000Z');
  assert.equal(localStamp(new Date('2030-07-15T19:00:00Z'), 'Europe/Madrid'), '2030-07-15 21:00');
  assert.equal(addDays('2030-12-31', 1), '2031-01-01');
  assert.equal(weekday(WED), 3);
});

test('disponibilidad: lunes cerrado, miércoles abierto, pasado y fuera de ventana', () => {
  assert.equal(dayAvailability(cfg, MON, null, 2, NOW).status, 'closed');
  const wed = dayAvailability(cfg, WED, null, 2, NOW);
  assert.equal(wed.status, 'open');
  assert.deepEqual(wed.services.map((s) => s.id), ['comida', 'cena']);
  assert.equal(dayAvailability(cfg, '2029-12-31', null, 2, NOW).status, 'past');
  assert.equal(dayAvailability(cfg, addDays(WED, 61), null, 2, NOW).status, 'beyond');
});

test('disponibilidad: antelación mínima de 2 horas en el mismo día', () => {
  const late = zonedToUtc(WED, '12:00', 'Europe/Madrid');
  const comida = dayAvailability(cfg, WED, null, 2, late).services.find((s) => s.id === 'comida');
  // 12:00 + 2 h = 14:00 → 13:30 y 13:45 ya no se ofrecen
  assert.deepEqual(comida.slots.filter((s) => s.available).map((s) => s.time), ['14:00', '14:15', '14:30']);
});

test('disponibilidad: ritmo por turno y aforo total', () => {
  const day = { bookings: [
    { service: 'cena', time: '21:00', party: 6, status: 'confirmed' },
    { service: 'cena', time: '20:30', party: 8, status: 'confirmed' },
    { service: 'cena', time: '20:45', party: 8, status: 'cancelled' },
  ] };
  const cena = dayAvailability(cfg, THU, day, 2, NOW).services.find((s) => s.id === 'cena');
  const at = (t) => cena.slots.find((s) => s.time === t).available;
  assert.equal(at('20:30'), false); // turno lleno
  assert.equal(at('20:45'), true); // la cancelada no cuenta
  assert.equal(at('21:00'), true); // 6 + 2 = 8 cabe justo
  const cena3 = dayAvailability(cfg, THU, day, 3, NOW).services.find((s) => s.id === 'cena');
  assert.equal(cena3.slots.find((s) => s.time === '21:00').available, false);
  // aforo total: 24 - 14 = 10 libres → un grupo de 6 cabe en 21:15, pero no si ya hay 20
  day.bookings.push({ service: 'cena', time: '21:30', party: 6, status: 'confirmed' });
  const cena6 = dayAvailability(cfg, THU, day, 6, NOW).services.find((s) => s.id === 'cena');
  assert.equal(cena6.full, true);
});

test('assertBookable: límites de grupo y servicio cerrado', () => {
  assert.throws(() => assertBookable(cfg, null, { date: THU, service: 'cena', time: '21:00', party: 9 }, NOW), /personas/);
  assert.throws(() => assertBookable(cfg, null, { date: MON, service: 'cena', time: '21:00', party: 2 }, NOW), /cerrado/);
  assert.ok(assertBookable(cfg, null, { date: MON, service: 'cena', time: '23:00', party: 12 }, NOW, { override: true }));
});

test('reservas: crear, localizar, evitar duplicados y sobreventa', async () => {
  const b = await createBooking(guest(), { now: NOW });
  assert.equal(b.status, 'confirmed');
  assert.match(b.code, /^[A-Z2-9]{6}$/);
  assert.equal(b.phone, '600123123');
  const found = await findByCode(b.code.toLowerCase());
  assert.equal(found.id, b.id);
  await assert.rejects(createBooking(guest(), { now: NOW }), (e) => e.code === 'duplicate');

  // Llenar el turno de las 21:00 con reservas simultáneas: solo deben entrar 3 de 2 personas (2+2+2+2 = 8).
  const attempts = await Promise.allSettled(Array.from({ length: 6 }, (_, i) =>
    createBooking(guest({ email: `c${i}@example.com`, phone: `61100000${i}` }), { now: NOW })));
  assert.equal(attempts.filter((r) => r.status === 'fulfilled').length, 3);
  assert.ok(attempts.filter((r) => r.status === 'rejected').every((r) => r.reason.code === 'full'));
  const day = await getDay(THU);
  assert.equal(day.bookings.filter((x) => x.time === '21:00').reduce((n, x) => n + x.party, 0), 8);
});

test('reservas: validaciones de datos', async () => {
  await assert.rejects(createBooking(guest({ email: 'no-es-email' }), { now: NOW }), (e) => e.extra?.field === 'email');
  await assert.rejects(createBooking(guest({ phone: '12' }), { now: NOW }), (e) => e.extra?.field === 'phone');
  await assert.rejects(createBooking(guest({ consentPrivacy: false, email: 'x@example.com' }), { now: NOW }), (e) => e.extra?.field === 'consentPrivacy');
  await assert.rejects(createBooking(guest({ name: 'A' }), { now: NOW }), (e) => e.extra?.field === 'name');
});

test('panel: reserva telefónica fuera de turno, forzar aforo y mover de día', async () => {
  const actor = { id: 'admin', name: 'Sala' };
  await assert.rejects(createBooking(guest({ time: '21:00', email: '', phone: '622222222' }), { actor, source: 'phone', now: NOW }), (e) => e.code === 'full');
  const forced = await createBooking(guest({ time: '21:00', email: '', phone: '622222222' }), { actor, source: 'phone', override: true, now: NOW });
  assert.equal(forced.source, 'phone');
  const odd = await createBooking(guest({ date: WED, service: 'comida', time: '15:10', email: '', phone: '633333333', name: 'Luis' }), { actor, now: NOW });
  assert.equal(odd.time, '15:10');

  const moved = await updateBooking(WED, odd.id, { date: '2030-01-04', time: '14:00' }, { actor, now: NOW });
  assert.equal(moved.date, '2030-01-04');
  assert.equal((await getDay(WED)).bookings.some((b) => b.id === odd.id), false);
  assert.equal((await findByCode(odd.code)).date, '2030-01-04');
  const done = await updateBooking('2030-01-04', odd.id, { status: 'no_show' }, { actor, now: NOW });
  assert.equal(done.status, 'no_show');
  assert.ok(done.history.length >= 3);
});

test('cliente: cancelación libera la plaza y la ficha acumula historial', async () => {
  const b = await createBooking(guest({ date: '2030-01-05', time: '20:30', party: 6, email: 'grupo@example.com', phone: '644444444' }), { now: NOW });
  await assert.rejects(createBooking(guest({ date: '2030-01-05', time: '20:30', party: 3, email: 'otro@example.com', phone: '655555555' }), { now: NOW }), (e) => e.code === 'full');
  await updateBooking(b.date, b.id, { status: 'cancelled' }, { byGuest: true, now: NOW });
  const ok = await createBooking(guest({ date: '2030-01-05', time: '20:30', party: 3, email: 'otro@example.com', phone: '655555555' }), { now: NOW });
  assert.equal(ok.status, 'confirmed');
  const guests = await getGuests();
  assert.equal(guests['grupo@example.com'].refs[0].status, 'cancelled');
  assert.equal(guests['ana@example.com'].refs.length, 1);
});

test('cliente: puede cancelar desde el SMS una reserva telefónica sin email', async () => {
  const b = await createBooking(guest({ date: '2030-01-10', time: '13:30', service: 'comida', email: '', phone: '677000111', name: 'Sense Correu' }), { actor: { id: 'admin', name: 'Sala' }, now: NOW });
  const c = await updateBooking(b.date, b.id, { status: 'cancelled' }, { byGuest: true, now: NOW });
  assert.equal(c.status, 'cancelled');
});

test('lista de espera', async () => {
  const w = await addToWaitlist({ date: THU, service: 'cena', party: 2, name: 'Marta', email: 'marta@example.com', phone: '666777888', consentPrivacy: true });
  assert.equal(w.status, 'waiting');
  await assert.rejects(addToWaitlist({ date: THU, service: 'cena', party: 2, name: 'Marta', email: 'marta@example.com', phone: '666777888', consentPrivacy: true }), (e) => e.code === 'duplicate');
});

test('ajustes: validación y cierres', async () => {
  const saved = await saveConfig({ closures: [{ from: '2030-01-10', to: '2030-01-12', service: 'all', note: 'Vacaciones' }] });
  assert.equal(saved.closures.length, 1);
  await assert.rejects(saveConfig({ closures: [{ from: '2030-01-12', to: '2030-01-10' }] }), /antes de empezar/);
  await assert.rejects(saveConfig({ services: [{ id: 'x', label: { es: 'X' }, slots: [], days: [1], slotCapacity: 4, capacity: 8 }] }), /horas válidas/);
  await saveConfig({ closures: [] });
});

test('seguridad: firmas, tokens y contraseñas', async () => {
  const tok = await bookingToken('abc');
  assert.equal(await checkBookingToken('abc', tok), true);
  assert.equal(await checkBookingToken('abd', tok), false);
  const s = await sign({ id: 'u', exp: Date.now() + 1000 });
  assert.equal((await verify(s)).id, 'u');
  assert.equal(await verify(s.slice(0, -2) + 'xx'), null);
  assert.equal(await verify(await sign({ id: 'u', exp: Date.now() - 1 })), null);
  const h = await hashPassword('una contraseña larga');
  assert.equal(await checkPassword('una contraseña larga', h), true);
  assert.equal(await checkPassword('otra', h), false);
});

test('RGPD: supresión de un cliente y caducidad de fichas', async () => {
  const b = await createBooking(guest({ date: '2030-01-09', time: '20:45', email: 'borrar@example.com', phone: '699888777', allergies: 'nueces', name: 'Pepa Borrar' }), { now: NOW });
  await createRequest({ type: 'contacto', name: 'Pepa Borrar', email: 'borrar@example.com', message: 'Hola', consentPrivacy: true });
  const r = await eraseGuest('borrar@example.com');
  assert.equal(r.bookings, 1);
  const anon = await findByCode(b.code);
  assert.equal(anon.name, 'Datos eliminados');
  assert.equal(anon.email, '');
  assert.equal(anon.allergies, '');
  assert.equal(anon.party, 2); // las cifras se conservan
  assert.equal((await getGuests())['borrar@example.com'], undefined);
  assert.ok((await listRequests()).every((x) => x.email !== 'borrar@example.com'));
  // Fichas sin actividad en 2 años
  const removed = await purgeInactiveGuests('2033-01-01');
  assert.ok(removed >= 1);
});
