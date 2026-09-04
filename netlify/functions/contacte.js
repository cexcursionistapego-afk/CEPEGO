// POST /api/contacte
// Crea una consulta general a la taula CONTACTE amb TIPO DE CONSULTA = "DUBTES I SUGGERÈNCIES"
// i ESTADO = "PENDENT GESTIONAR". El club la revisa a Airtable.

const { isAllowedOrigin } = require('./_security');

const BASE  = process.env.AIRTABLE_BASE  || 'appkuKVxHSMyDElfh';
const TABLE = process.env.AIRTABLE_TABLE || 'tblAD8ZeIKmNwNRm9';
const NEW_STATE = process.env.AIRTABLE_NEW_STATE || 'PENDENT GESTIONAR';
const TIPO_CONSULTA = 'DUBTES I SUGGERÈNCIES';

function res(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim()); }

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return res(405, { ok: false, error: 'method' });
  if (!isAllowedOrigin(event)) return res(403, { ok: false, error: 'origin' });
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return res(200, { ok: false, error: 'config', message: 'Servei no configurat encara.' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return res(400, { ok: false, error: 'json' }); }

  // honeypot anti-spam: si el camp ocult ve ple, ignorem silenciosament
  if (b.website) return res(200, { ok: true });

  const nom = (b.nom || '').trim();
  const email = (b.email || '').trim();
  const missatge = (b.missatge || '').trim();
  if (!nom || !isValidEmail(email) || !missatge) return res(400, { ok: false, error: 'camps' });

  const fields = {
    'NOMBRE Y APELLIDOS': nom,
    'EMAIL': email,
    'MENSAJE': missatge,
    'TIPO DE CONSULTA': TIPO_CONSULTA,
    'ESTADO': NEW_STATE,
  };
  if (b.telefon) fields['TELÉFONO'] = String(b.telefon).trim();

  try {
    const r = await fetch(`https://api.airtable.com/v0/${BASE}/${TABLE}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return res(200, { ok: false, error: 'airtable', detail: txt.slice(0, 300) });
    }
    return res(200, { ok: true });
  } catch (e) {
    return res(200, { ok: false, error: 'exception', detail: String(e).slice(0, 200) });
  }
};
