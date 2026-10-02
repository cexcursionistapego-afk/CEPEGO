// Enlace corto de los SMS: /r/CODIGO-token → página «gestionar mi reserva».

import { findByCode } from '../../lib/bookings.mjs';
import { checkSmsToken, bookingToken } from '../../lib/auth.mjs';
import { rateLimit } from '../../lib/guard.mjs';
import { clientIp } from '../../lib/http.mjs';
import { routeFor } from '../../lib/routes.mjs';

const redirect = (location) => new Response(null, { status: 302, headers: { location, 'cache-control': 'no-store' } });

export default async (req, context) => {
  const ref = new URL(req.url).pathname.split('/').filter(Boolean)[1] || '';
  // El localizador nunca lleva guion, pero el token (base64url) sí puede.
  const cut = ref.indexOf('-');
  const code = cut > 0 ? ref.slice(0, cut) : '';
  const token = cut > 0 ? ref.slice(cut + 1) : '';
  try {
    await rateLimit(clientIp(req, context), 'shortlink', 60, 3600 * 1000);
    const b = await findByCode(code);
    if (b && (await checkSmsToken(b.id, token))) {
      const path = routeFor('manage', b.lang);
      return redirect(`${path}?c=${encodeURIComponent(b.code)}&t=${encodeURIComponent(await bookingToken(b.id))}`);
    }
  } catch (e) {
    if (!e.status) console.error(e);
  }
  return redirect(routeFor('manage', 'va'));
};

export const config = { path: '/r/*' };
