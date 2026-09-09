// POST /api/whatsapp-reserva
// Envia un WhatsApp (plantilla aprovada per Meta) quan el club marca ESTADO =
// "EMAIL PER RESERVAR ENVIAT" a la taula CONTACTE. Pensat per ser cridat des
// d'un pas "Run a script" de l'automatització d'Airtable (no des del navegador):
// per això exigeix WHATSAPP_WEBHOOK_SECRET en lloc de validar només l'origen.

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';

function res(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

// Normalitza un telèfon espanyol (9 dígits, o amb prefix 34) a E.164 sense '+'.
function toE164(v) {
  const d = (v || '').replace(/\D/g, '');
  if (d.length === 11 && d.slice(0, 2) === '34') return d;
  if (d.length === 9 && /^[6789]/.test(d)) return '34' + d;
  return null;
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return res(405, { ok: false, error: 'method' });

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || 'es';
  const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (!token || !phoneId || !templateName || !webhookSecret) {
    return res(200, { ok: false, error: 'config', message: 'Servei de WhatsApp no configurat encara.' });
  }

  const headers = event.headers || {};
  const secret = headers['x-webhook-secret'] || headers['X-Webhook-Secret'];
  if (secret !== webhookSecret) return res(401, { ok: false, error: 'unauthorized' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return res(400, { ok: false, error: 'json' }); }

  const nom = (b.nombre || '').trim();
  const entrada = (b.entrada || '').trim();
  const salida = (b.salida || '').trim();
  const phone = toE164(b.telefon);
  if (!nom || !phone) return res(400, { ok: false, error: 'camps' });

  // L'ordre i el nombre de "parameters" ha de coincidir exactament amb les
  // variables {{1}}, {{2}}, {{3}}... de la plantilla aprovada a Meta.
  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: templateLang },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: nom },
            { type: 'text', text: entrada || '-' },
            { type: 'text', text: salida || '-' },
          ],
        },
      ],
    },
  };

  try {
    const r = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const txt = await r.text();
      return res(200, { ok: false, error: 'whatsapp', detail: txt.slice(0, 300) });
    }
    return res(200, { ok: true });
  } catch (e) {
    return res(200, { ok: false, error: 'exception', detail: String(e).slice(0, 200) });
  }
};
