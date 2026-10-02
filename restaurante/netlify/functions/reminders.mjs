// Tarea programada: cada mañana envía el recordatorio (email y/o SMS, según
// Ajustes) a las reservas confirmadas del día siguiente.

import { getConfig } from '../../lib/config.mjs';
import { getDay, recordNotifications } from '../../lib/bookings.mjs';
import { configured as mailConfigured } from '../../lib/mail.mjs';
import { smsConfigured } from '../../lib/sms.mjs';
import { notifyGuest } from '../../lib/notify.mjs';
import { addDays, todayIn } from '../../lib/time.mjs';

export async function sendReminders(now = new Date()) {
  const cfg = await getConfig();
  const email = mailConfigured() && cfg.notifications.emailReminder;
  const sms = smsConfigured() && cfg.notifications.smsReminder;
  if (!email && !sms) return { email: 0, sms: 0, skipped: 'disabled' };
  const date = addDays(todayIn(cfg.timezone, now), 1);
  const day = await getDay(date);
  const counts = { email: 0, sms: 0 };
  for (const b of day.bookings) {
    if (b.status !== 'confirmed') continue;
    const channels = [];
    if (email && b.email && !b.remindedAt) channels.push('email');
    if (sms && b.phone && !b.smsRemindedAt) channels.push('sms');
    if (!channels.length) continue;
    const log = await notifyGuest('reminder', b, cfg, { channels });
    const at = new Date().toISOString();
    const extra = {};
    for (const r of log) {
      if (!r.ok) continue;
      counts[r.channel]++;
      extra[r.channel === 'sms' ? 'smsRemindedAt' : 'remindedAt'] = at;
    }
    if (Object.keys(extra).length) await recordNotifications(b.date, b.id, [], extra);
  }
  return counts;
}

export default async () => {
  const result = await sendReminders();
  console.log('reminders', result);
  return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
};

// 08:00 UTC = 09:00/10:00 en Madrid según horario de invierno/verano.
export const config = { schedule: '0 8 * * *' };
