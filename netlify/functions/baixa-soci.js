// POST /api/baixa-soci
// Envia una sol·licitud de baixa a la taula BAIXES CENTRE EXCURSIONISTA PEGO.

const BASE  = process.env.AIRTABLE_BASE  || 'appkuKVxHSMyDElfh';
const TABLE = 'tblGeQzo49FyjBQJs'; // BAIXES CENTRE EXCURSIONISTA PEGO

function res(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
function s(v) { return (v || '').trim(); }

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return res(405, { ok: false, error: 'method' });
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return res(200, { ok: false, error: 'config', message: 'Servei no configurat.' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return res(400, { ok: false, error: 'json' }); }

  if (b.website) return res(200, { ok: true }); // honeypot

  const nom     = s(b.nom);
  const cognoms = s(b.cognoms);
  const dni     = s(b.dni);
  const email   = s(b.email);

  if (!nom || !cognoms || !dni || !email)
    return res(400, { ok: false, error: 'camps', message: 'Falten camps obligatoris.' });

  const fields = {
    'NOM':     nom,
    'COGNOMS': cognoms,
    'DNI':     dni,
    'EMAIL':   email,
  };
  if (s(b.telefon)) fields['TELÈFON']        = s(b.telefon);
  if (s(b.iban))    fields['BANC DEVOLUCIÓ'] = s(b.iban);
  if (s(b.missatge))fields['NOTAS']          = s(b.missatge);

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
