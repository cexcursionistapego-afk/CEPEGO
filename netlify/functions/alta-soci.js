// POST /api/alta-soci
// Crea una sol·licitud d'alta de soci a la taula CONTACTE d'Airtable.

const BASE  = process.env.AIRTABLE_BASE  || 'appkuKVxHSMyDElfh';
const TABLE = process.env.AIRTABLE_TABLE || 'tblAD8ZeIKmNwNRm9';

function res(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return res(405, { ok: false, error: 'method' });
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return res(200, { ok: false, error: 'config', message: 'Servei no configurat.' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return res(400, { ok: false, error: 'json' }); }

  if (b.website) return res(200, { ok: true }); // honeypot

  const nom = (b.nom || '').trim();
  const email = (b.email || '').trim();
  if (!nom || !email) return res(400, { ok: false, error: 'camps' });

  const fields = {
    'NOMBRE Y APELLIDOS': nom,
    'EMAIL': email,
    'TIPO DE CONSULTA': 'ALTA DE SOCI',
    'ESTADO': 'PENDENT GESTIONAR',
  };
  if (b.telefon) fields['TELÉFONO'] = String(b.telefon).trim();
  if (b.poblacio) fields['POBLACIÓN'] = String(b.poblacio).trim();
  if (b.missatge) fields['MENSAJE'] = String(b.missatge).trim();

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
