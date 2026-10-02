// Datos de demostración para probar el panel en local: npm run seed
// (No usar en producción: escribe en el almacén configurado.)

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.env.USE_FILE_STORE = '1';
process.env.DATA_DIR ||= path.join(ROOT, '.data');

const { createBooking, updateBooking, addToWaitlist, updateGuest } = await import('../lib/bookings.mjs');
const { createRequest } = await import('../lib/requests.mjs');
const { getConfig } = await import('../lib/config.mjs');
const { todayIn, addDays } = await import('../lib/time.mjs');

const cfg = await getConfig();
const today = todayIn(cfg.timezone);
const staff = { id: 'admin', name: 'Demo' };
const people = [
  ['Laura Ferrer', '600111222', 'laura@example.com', 'va'], ['Joan Sendra', '611222333', 'joan@example.com', 'va'],
  ['Marta Llopis', '622333444', 'marta@example.com', 'es'], ['Pablo Ortega', '633444555', 'pablo@example.com', 'es'],
  ['Emma Clarke', '+447700900123', 'emma@example.com', 'en'], ['Vicent Mas', '644555666', 'vicent@example.com', 'va'],
  ['Lucía Gil', '655666777', 'lucia@example.com', 'es'], ['Hans Becker', '+491701234567', 'hans@example.com', 'en'],
  ['Neus Ribes', '666777888', 'neus@example.com', 'va'], ['Carlos Ruiz', '677888999', 'carlos@example.com', 'es'],
];
const plan = [
  [0, 'cena', '20:30', 2, { allergies: 'Frutos secos (anafilaxia)' }],
  [0, 'cena', '20:30', 4, { occasion: 'aniversario', menu: 'bagatge', pairing: 'vino' }],
  [0, 'cena', '20:45', 2, { menu: 'origen', dietary: ['sin-gluten'] }],
  [0, 'cena', '21:00', 3, { status: 'pending', notes: 'Si puede ser, mesa junto a la ventana' }],
  [0, 'cena', '21:15', 2, { menu: 'bagatge', pairing: 'sin' }],
  [0, 'cena', '21:30', 2, { occasion: 'cumpleanos' }],
  [1, 'comida', '13:30', 2, { menu: 'origen' }],
  [1, 'comida', '14:00', 5, { dietary: ['vegetariano'] }],
  [1, 'cena', '20:30', 2, { menu: 'bagatge', pairing: 'vino', occasion: 'negocios' }],
  [1, 'cena', '21:00', 6, { allergies: 'Marisco' }],
  [2, 'comida', '14:15', 4, {}],
  [6, 'cena', '21:00', 2, { menu: 'bagatge' }],
];
let i = 0;
for (const [d, service, time, party, extra] of plan) {
  const [name, phone, email, lang] = people[i++ % people.length];
  const date = addDays(today, d);
  try {
    await createBooking({ date, service, time, party, name, phone, email, lang, consentPrivacy: true, source: i % 3 ? 'web' : 'phone', ...extra },
      { actor: staff, source: i % 3 ? 'web' : 'phone', override: true });
  } catch (e) { console.log('omitida', date, time, e.message); }
}
const past = await createBooking({ date: addDays(today, -14), service: 'cena', time: '21:00', party: 2, name: 'Laura Ferrer', phone: '600111222', email: 'laura@example.com', lang: 'va', consentPrivacy: true }, { actor: staff, override: true });
await updateBooking(past.date, past.id, { status: 'completed' }, { actor: staff, override: true });
await updateGuest('laura@example.com', { tags: ['VIP', 'Habitual'], notes: 'Prefiere la barra. Le encanta el maridaje sin alcohol.' });
await addToWaitlist({ date: today, service: 'cena', party: 2, name: 'Andrea Soler', email: 'andrea@example.com', phone: '688999000', consentPrivacy: true, lang: 'va' }).catch(() => {});
await createRequest({ type: 'evento', name: 'Empresa Demo', email: 'eventos@example.com', phone: '699000111', guests: 18, date: addDays(today, 30), eventType: 'Empresa', budget: '150–250 € por persona', message: 'Cena de equipo con presentación de producto.', consentPrivacy: true, lang: 'es' });
await createRequest({ type: 'regalo', name: 'Sara Puig', email: 'sara@example.com', phone: '600222333', recipient: 'Mis padres', menu: 'bagatge', pairing: 'vino', guests: 2, amount: 460, delivery: 'print', dedication: 'Per molts anys!', consentPrivacy: true, lang: 'va' });
console.log(`✓ datos de demostración creados para ${today} y siguientes días`);
