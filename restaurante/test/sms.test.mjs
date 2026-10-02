import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.USE_FILE_STORE = '1';
process.env.DATA_DIR = await mkdtemp(path.join(tmpdir(), 'sms-'));
process.env.SITE_URL = 'https://bagatge-demo.netlify.app';
process.env.TWILIO_ACCOUNT_SID = 'AC_test';
process.env.TWILIO_AUTH_TOKEN = 'secret';
process.env.TWILIO_FROM = 'Bagatge';

const { toE164, toGsm, bookingSmsText, sendSms } = await import('../lib/sms.mjs');
const { createBooking, findByCode } = await import('../lib/bookings.mjs');
const { getConfig } = await import('../lib/config.mjs');
const { notifyGuest, shortLink } = await import('../lib/notify.mjs');
const { zonedToUtc } = await import('../lib/time.mjs');
const short = (await import('../netlify/functions/short.mjs')).default;

const sent = [];
globalThis.fetch = async (url, opts) => {
  sent.push({ url: String(url), body: new URLSearchParams(String(opts.body)), auth: opts.headers.authorization });
  return new Response(JSON.stringify({ sid: 'SM1', status: 'queued' }), { status: 201 });
};

test('números: móviles españoles en E.164, fijos descartados', () => {
  assert.equal(toE164('600123123'), '+34600123123');
  assert.equal(toE164('+34 711 222 333'), '+34711222333');
  assert.equal(toE164('0034600123123'), '+34600123123');
  assert.equal(toE164('965000000'), null); // fijo
  assert.equal(toE164('+447700900123'), '+447700900123');
  assert.equal(toE164(''), null);
});

test('texto: alfabeto GSM-7 y un solo SMS', () => {
  assert.equal(toGsm('Mediodía, jamón, café, niño — «sí»'), 'Mediodia, jamon, café, niño - "si"');
  const b = { code: 'K7M2QX', date: '2030-10-17', time: '21:00', party: 2, lang: 'es' };
  const text = bookingSmsText('confirmed', b, 'https://bagatge-demo.netlify.app/r/K7M2QX-abcdefghij');
  assert.match(text, /^Bagatge: mesa confirmada, 2 pers\., jue 17 oct, 21:00\. Loc\. K7M2QX\. Gestionar: https:/);
  assert.ok(text.length <= 160, `largo ${text.length}`);
  const en = bookingSmsText('reminder', { ...b, lang: 'en' }, 'https://x.app/r/K');
  assert.match(en, /see you tomorrow, Thu 17 Oct, 21:00 \(2 guests\)/);
  const va = bookingSmsText('reminder', { ...b, lang: 'va' }, 'https://x.app/r/K');
  assert.match(va, /t'esperem demà, dj 17 d'oct, 21:00 \(2 pers\.\)\. No pots vindre\? Cancel\.la aci:/);
  for (const ch of bookingSmsText('reminder', b, 'https://x')) assert.ok(toGsm(ch) === ch);
});

test('envío con Twilio y registro en la reserva', async () => {
  const now = zonedToUtc('2030-10-16', '10:00', 'Europe/Madrid');
  const b = await createBooking({
    date: '2030-10-17', service: 'cena', time: '21:00', party: 2, name: 'Ana', email: '', phone: '600123123',
    consentPrivacy: true,
  }, { actor: { id: 'admin', name: 'Sala' }, now });
  const cfg = await getConfig();
  const log = await notifyGuest('confirmed', b, cfg);
  assert.deepEqual(log.map((l) => [l.channel, l.ok]), [['sms', true]]);
  const req = sent.at(-1);
  assert.match(req.url, /Accounts\/AC_test\/Messages\.json$/);
  assert.equal(req.body.get('To'), '+34600123123');
  assert.equal(req.body.get('From'), 'Bagatge');
  assert.match(req.body.get('Body'), /Loc\. [A-Z2-9]{6}/);
  assert.equal(req.auth, 'Basic ' + Buffer.from('AC_test:secret').toString('base64'));
  const stored = await findByCode(b.code);
  assert.equal(stored.notifications[0].channel, 'sms');

  // La cancelación por SMS está desactivada por defecto
  assert.deepEqual(await notifyGuest('cancelled', b, cfg), []);

  // El enlace corto lleva a «gestionar» con el token completo
  const link = await shortLink(b);
  const res = await short(new Request(link), { ip: '1.2.3.4' });
  assert.equal(res.status, 302);
  assert.match(res.headers.get('location'), new RegExp(`^/va/reserves/gestionar/\\?c=${b.code}&t=`));
  const bad = await short(new Request(link.slice(0, -1) + 'x'), { ip: '1.2.3.4' });
  assert.equal(bad.headers.get('location'), '/va/reserves/gestionar/');
  // En castellano, el enlace lleva a /es/
  const es = await createBooking({ date: '2030-10-17', service: 'cena', time: '21:15', party: 2, name: 'Luis', phone: '611222333', lang: 'es', consentPrivacy: true }, { actor: { id: 'admin', name: 'Sala' }, now });
  const resEs = await short(new Request(await shortLink(es)), { ip: '1.2.3.4' });
  assert.match(resEs.headers.get('location'), /^\/es\/reservas\/gestionar\/\?c=/);
});

test('enlace corto: funciona aunque el token contenga guiones', async () => {
  const { createBooking: cb } = await import('../lib/bookings.mjs');
  const now = zonedToUtc('2030-10-16', '10:00', 'Europe/Madrid');
  for (let i = 0; i < 25; i++) {
    const b = await cb({ date: '2030-11-07', service: 'cena', time: '21:00', party: 1, name: `Prova ${i}`, phone: `6000000${String(i).padStart(2, '0')}`, consentPrivacy: true }, { actor: { id: 'admin', name: 'Sala' }, now, override: true });
    const res = await short(new Request(await shortLink(b)), { ip: `10.0.0.${i}` });
    assert.match(res.headers.get('location'), new RegExp(`\\?c=${b.code}&t=`), `fallo con ${await shortLink(b)}`);
  }
});

test('sin credenciales no se envía nada', async () => {
  const saved = process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_AUTH_TOKEN;
  assert.equal((await sendSms('600123123', 'hola')).reason, 'not_configured');
  process.env.TWILIO_AUTH_TOKEN = saved;
});
