// POST /api/reserva
// Crea una sol·licitud de reserva a la taula CONTACTE amb ESTADO = "PENDENT GESTIONAR".
// El club la revisa a Airtable i, si la confirma, la passa a "RESERVAT" (i llavors
// bloqueja el calendari web). Cap número de compte s'exposa a la web.

const BASE  = process.env.AIRTABLE_BASE  || 'appkuKVxHSMyDElfh';
const TABLE = process.env.AIRTABLE_TABLE || 'tblAD8ZeIKmNwNRm9';
const NEW_STATE = process.env.AIRTABLE_NEW_STATE || 'PENDENT GESTIONAR';

function res(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
function isDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || ''); }

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return res(405, { ok: false, error: 'method' });
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return res(200, { ok: false, error: 'config', message: 'Servei no configurat encara.' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return res(400, { ok: false, error: 'json' }); }

  // honeypot anti-spam: si el camp ocult ve ple, ignorem silenciosament
  if (b.website) return res(200, { ok: true });

  const nom = (b.nom || '').trim();
  const email = (b.email || '').trim();
  const entrada = (b.entrada || '').trim();
  const salida = (b.salida || '').trim();
  if (!nom || !email || !isDate(entrada) || !isDate(salida)) return res(400, { ok: false, error: 'camps' });
  if (salida < entrada) return res(400, { ok: false, error: 'dates' });

  const persones = parseInt(b.persones, 10);
  const soci = (b.soci === 'Si' || b.soci === 'No') ? b.soci : undefined;
  const internet = (b.internet === 'Si' || b.internet === 'No') ? b.internet : undefined;

  const fields = {
    'NOMBRE Y APELLIDOS': nom,
    'EMAIL': email,
    'DIA DE ENTRADA': entrada,
    'DIA DE SALIDA': salida,
    'TIPO DE CONSULTA': 'RESERVAR LA FIGUERETA',
    'ESTADO': NEW_STATE,
  };
  if (b.telefon) fields['TELÉFONO'] = String(b.telefon).trim();
  if (b.poblacio) fields['POBLACIÓN'] = String(b.poblacio).trim();
  if (!isNaN(persones) && persones > 0) fields['NÚMERO DE PERSONAS'] = persones;
  if (b.missatge) fields['MENSAJE'] = String(b.missatge).trim();
  if (soci) fields['Sóc soci/a'] = soci;
  if (internet) fields['INTERNET'] = internet;

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
