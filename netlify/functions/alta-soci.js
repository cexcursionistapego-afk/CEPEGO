// POST /api/alta-soci
// Crea una sol·licitud d'alta de soci a la taula SOCIS CENTRE EXCURSIONISTA PEGO
// d'Airtable, replicant els camps del "FORMULARI D'ALTA" oficial (incloent
// les fotos del DNI, pujades com a adjunts després de crear el registre).

const BASE  = process.env.AIRTABLE_BASE || 'appkuKVxHSMyDElfh';
const TABLE = 'tblNm2FZG9KCdiCDq'; // SOCIS CENTRE EXCURSIONISTA PEGO

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
  const cognoms   = s(b.cognoms);
  const dni       = s(b.dni);
  const naixement = s(b.naixement);
  const telefon   = s(b.telefon);
  const email     = s(b.email);
  const localitat = s(b.localitat);
  const iban      = s(b.iban);

  if (!nom || !cognoms || !dni || !naixement || !telefon || !email || !localitat || !iban)
    return res(400, { ok: false, error: 'camps', message: 'Falten camps obligatoris.' });

  if (!b.dni_anvers_b64 || !b.dni_revers_b64)
    return res(400, { ok: false, error: 'documents', message: 'Falten les fotos del DNI.' });

  const fields = {
    'NOM': nom,
    'COGNOMS': cognoms,
    'DNI': dni,
    'DATA NAIXEMENT': naixement,
    'TELÈFON': telefon,
    'EMAIL': email,
    'LOCALITAT': localitat,
    'CONTER CORRENT (IBAN)': iban,
    'DONAR DE ALTA': true,
    "ÚS DE LA SALA D'ENTRENAMENT": !!b.sala,
    'GRUP DIFUSIÓ': !!b.difusio,
  };
  if (s(b.notas)) fields['NOTAS'] = s(b.notas);

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
    const data = await r.json();
    const recordId = data.records && data.records[0] && data.records[0].id;

    if (recordId) {
      const uploads = [
        { field: 'DNI ANVERS', b64: b.dni_anvers_b64, type: b.dni_anvers_type || 'image/jpeg', name: b.dni_anvers_name || 'dni-anvers.jpg' },
        { field: 'DNI REVERS', b64: b.dni_revers_b64, type: b.dni_revers_type || 'image/jpeg', name: b.dni_revers_name || 'dni-revers.jpg' },
      ];
      for (const u of uploads) {
        try {
          await fetch(`https://content.airtable.com/v0/${BASE}/${recordId}/${encodeURIComponent(u.field)}/uploadAttachment`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentType: u.type, file: u.b64, filename: u.name }),
          });
        } catch (e) { /* la sol·licitud ja s'ha creat; l'adjunt es pot pujar manualment si falla */ }
      }
    }

    return res(200, { ok: true });
  } catch (e) {
    return res(200, { ok: false, error: 'exception', detail: String(e).slice(0, 200) });
  }
};
