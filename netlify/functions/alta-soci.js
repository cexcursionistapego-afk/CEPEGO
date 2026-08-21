// POST /api/alta-soci
// Crea una sol·licitud d'alta de soci a la taula CONTACTE d'Airtable.
// Les dades d'identitat i adreça s'inclouen en el camp MENSAJE per al club.

const BASE  = process.env.AIRTABLE_BASE  || 'appkuKVxHSMyDElfh';
const TABLE = process.env.AIRTABLE_TABLE || 'tblAD8ZeIKmNwNRm9';

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

  const nom       = s(b.nom);
  const email     = s(b.email);
  const telefon   = s(b.telefon);
  const dni       = s(b.dni);
  const naixement = s(b.naixement);

  if (!nom || !email || !telefon || !dni || !naixement)
    return res(400, { ok: false, error: 'camps', message: 'Falten camps obligatoris.' });

  // Build a structured summary to put in MENSAJE
  const lines = [
    '=== SOL·LICITUD D\'ALTA DE SOCI ===',
    `Nom: ${nom}`,
    `DNI/NIE: ${dni}`,
    `Data de naixement: ${naixement}`,
    s(b.genere)   ? `Gènere: ${s(b.genere)}`         : null,
    `Telèfon: ${telefon}`,
    `Email: ${email}`,
    '',
    '--- Adreça ---',
    s(b.adreca)   ? `Carrer: ${s(b.adreca)}`          : null,
    s(b.cp)       ? `CP: ${s(b.cp)}`                  : null,
    s(b.poblacio) ? `Localitat: ${s(b.poblacio)}`      : null,
    s(b.provincia)? `Província: ${s(b.provincia)}`     : null,
    '',
    Array.isArray(b.act) && b.act.length
      ? `Activitats d'interès: ${b.act.join(', ')}`
      : (s(b.act) ? `Activitats d'interès: ${s(b.act)}` : null),
    s(b.origen)   ? `Com ens ha conegut: ${s(b.origen)}` : null,
    s(b.missatge) ? `\nNotes: ${s(b.missatge)}`        : null,
  ].filter(x => x !== null).join('\n');

  const fields = {
    'NOMBRE Y APELLIDOS': nom,
    'EMAIL': email,
    'TELÉFONO': telefon,
    'POBLACIÓN': s(b.poblacio) || s(b.cp) || '',
    'TIPO DE CONSULTA': 'ALTA DE SOCI',
    'ESTADO': 'PENDENT GESTIONAR',
    'MENSAJE': lines,
  };

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
