// Mantenimiento diario: borra contadores antiguos del límite de peticiones y
// las fichas de cliente sin actividad en dos años (lo que promete la política
// de privacidad).

import { getConfig } from '../../lib/config.mjs';
import { purgeInactiveGuests } from '../../lib/bookings.mjs';
import { getStore } from '../../lib/store.mjs';
import { todayIn } from '../../lib/time.mjs';

export async function runMaintenance(now = new Date()) {
  const store = await getStore();
  let rate = 0;
  for (const key of await store.list('ratelimit/')) {
    const r = await store.getJSON(key);
    if (!r || now.getTime() - (r.data.since || 0) > 86400000) {
      await store.delete(key);
      rate++;
    }
  }
  const cfg = await getConfig();
  const guests = await purgeInactiveGuests(todayIn(cfg.timezone, now));
  return { rateLimitKeys: rate, guests };
}

export default async () => {
  const result = await runMaintenance();
  console.log('maintenance', result);
  return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
};

export const config = { schedule: '30 2 * * *' };
