// GET /api/disponibilitat
// Retorna els rangs de dates OCUPATS del refugi: registres de la taula CONTACTE
// amb ESTADO = "RESERVAT". Les sol·licituds en "PENDENT GESTIONAR" NO es retornen.
// No exposa cap dada personal, només dates.

const BASE  = process.env.AIRTABLE_BASE  || 'appkuKVxHSMyDElfh';
const TABLE = process.env.AIRTABLE_TABLE || 'tblAD8ZeIKmNwNRm9';
const RESERVED = process.env.AIRTABLE_RESERVED_VALUE || 'RESERVAT';
const F_IN  = 'DIA DE ENTRADA';
const F_OUT = 'DIA DE SALIDA';
const F_STATE = 'ESTADO';

exports.handler = async function () {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' };
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return { statusCode: 200, headers, body: JSON.stringify({ ok: false, reserves: [], reason: 'no-token' }) };

  const formula = `AND({${F_STATE}}='${RESERVED}', {${F_IN}}!='', {${F_OUT}}!='')`;
  const params = new URLSearchParams({ filterByFormula: formula, pageSize: '100' });
  params.append('fields[]', F_IN);
  params.append('fields[]', F_OUT);
  const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?${params.toString()}`;

  try {
    const reserves = [];
    let offset;
    do {
      const u = offset ? `${url}&offset=${offset}` : url;
      const r = await fetch(u, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) {
        const txt = await r.text();
        return { statusCode: 200, headers, body: JSON.stringify({ ok: false, reserves: [], reason: 'airtable', status: r.status, detail: txt.slice(0, 300) }) };
      }
      const data = await r.json();
      (data.records || []).forEach(function (rec) {
        const start = rec.fields[F_IN], end = rec.fields[F_OUT];
        if (start && end) reserves.push({ start: String(start).slice(0, 10), end: String(end).slice(0, 10) });
      });
      offset = data.offset;
    } while (offset);

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, reserves: reserves }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: false, reserves: [], reason: 'exception', detail: String(e).slice(0, 200) }) };
  }
};
