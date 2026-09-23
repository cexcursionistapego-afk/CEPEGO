// POST /api/registre-viatgers
// Alta al registre de viatgers del refugi (R.D. 933/2021), taula
// "REGISTRE RESERVES R.D. 933/2021" d'Airtable.
//
// Només escriu: ací no hi ha cap GET que llegisca registres. És a propòsit —
// la pàgina /huespedes és pública i qualsevol amb l'enllaç hi entra, així que
// un endpoint de lectura seria una llista oberta de DNIs i domicilis. Les
// dades es consulten a Airtable.

const { isAllowedOrigin, base64SizeExceeds, verifyTurnstile, clientIp } = require('./_security');

const BASE  = process.env.AIRTABLE_BASE || 'appkuKVxHSMyDElfh';
const TABLE = 'tblPIgkyzam4AKvTo'; // REGISTRE RESERVES R.D. 933/2021

// Noms exactes de les opcions a Airtable. Si es canvien allà, cal canviar-los
// ací i a js/huespedes.js.
const SEXES = ['Masculino', 'Femenino', 'Trans', 'No binario'];
const TIPUS = ['DNI', 'PASSAPORTE', 'TIE'];
// El camp d'acceptació té el text sencer per nom; es guarda a part per a no
// repetir-lo i per a que es veja que és el mateix de la pàgina.
const F_ACCEPT = 'Al realizar este formulario, el usuario o club asume plenamente la responsabilidad por cualquier accidente o incidente durante el uso del espacio cedido, eximiendo a la parte cedente de cualquier responsabilidad.';
// Cada tipus de document té el seu camp de número i el seu d'adjunt.
const DOCS = {
  'DNI':        { num: 'DNI',       foto: 'FOTO DNI' },
  'PASSAPORTE': { num: 'PASAPORTE', foto: 'FOTO PASAPORTE' },
  'TIE':        { num: 'TIE',       foto: 'FOTO TIE' },
};

function res(code, obj) {
  return { statusCode: code, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}
function s(v) { return (v || '').trim(); }
function normDoc(v) { return (v || '').replace(/[\s-]/g, '').toUpperCase(); }

const LLETRES = 'TRWAGMYFPDXBNJZSQVHLCKE';
function validaDniNie(v) {
  const t = normDoc(v);
  const m = /^([0-9]{8})([A-Z])$/.exec(t);
  if (m) return LLETRES.charAt(parseInt(m[1], 10) % 23) === m[2];
  const n = /^([XYZ])([0-9]{7})([A-Z])$/.exec(t);
  if (n) return LLETRES.charAt(parseInt(String('XYZ'.indexOf(n[1])) + n[2], 10) % 23) === n[3];
  return false;
}
function validaPassaport(v) {
  const t = normDoc(v);
  if (!/^[A-Z0-9]{5,20}$/.test(t)) return false;
  return !/^(.)\1+$/.test(t); // "00000000" o "AAAAA": camp omplit a la babalà
}
function validaTie(v) {
  const t = normDoc(v);
  if (/^[XYZ][0-9]{7}[A-Z]$/.test(t)) return validaDniNie(t);
  return /^[A-Z][0-9]{6,9}[A-Z]?$/.test(t);
}
// Ací ve gent de fora, així que el telèfon no es pot mesurar amb el patró
// espanyol: només dígits (amb un + davant si de cas) i llargària de número real.
function validaTelefon(v) {
  const t = (v || '').replace(/[\s.\-()]/g, '');
  if (!/^\+?\d+$/.test(t)) return false;
  const d = t.replace(/\D/g, '');
  return d.length >= 6 && d.length <= 15;
}
// Noms, municipis, províncies i països: lletres de qualsevol idioma, espais,
// guions, apòstrofs i punts. Es busca caçar el camp amb números o a mitges.
const NOM_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'’\-.]*$/u;
function validaNom(v) {
  const t = s(v);
  return t.length >= 2 && t.length <= 80 && NOM_RE.test(t);
}
// L'adreça sí que porta números: només es mira que tinga cos i alguna lletra.
function validaAdreca(v) {
  const t = s(v);
  return t.length >= 4 && t.length <= 120 && /\p{L}/u.test(t);
}
// Data real, no només amb forma de data: "2026-02-31" no ha de colar.
function data(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s(v));
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
  return d;
}
const MAX_NITS = 31;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return res(405, { ok: false, error: 'method' });
  if (!isAllowedOrigin(event)) return res(403, { ok: false, error: 'origin' });
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return res(200, { ok: false, error: 'config', message: 'Servei no configurat.' });

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return res(400, { ok: false, error: 'json' }); }

  if (b.website) return res(200, { ok: true }); // honeypot

  const captcha = await verifyTurnstile(b['cf-turnstile-response'], clientIp(event));
  if (!captcha.ok) return res(400, { ok: false, error: 'captcha', message: 'Verificació anti-robots fallida. Torna-ho a provar.' });

  const entrada   = s(b.entrada);
  const salida    = s(b.salida);
  const nombre    = s(b.nombre);
  const apellidos = s(b.apellidos);
  const sexo      = s(b.sexo);
  const tipo      = s(b.tipo_doc);
  const calle     = s(b.calle);
  const municipio = s(b.municipio);
  const provincia = s(b.provincia);
  const pais      = s(b.pais);
  const telefono  = s(b.telefono);

  if (!entrada || !salida || !nombre || !apellidos || !sexo || !tipo ||
      !calle || !municipio || !provincia || !pais || !telefono)
    return res(400, { ok: false, error: 'camps', message: 'Falten camps obligatoris.' });

  const dEntrada = data(entrada), dSalida = data(salida);
  if (!dEntrada || !dSalida)
    return res(400, { ok: false, error: 'dates', message: 'Dates no vàlides.' });
  if (dSalida <= dEntrada)
    return res(400, { ok: false, error: 'dates', message: "El dia d'eixida ha de ser posterior al d'entrada." });
  // Una estada llarguíssima quasi sempre és un any mal teclejat.
  if (Math.round((dSalida - dEntrada) / 86400000) > MAX_NITS)
    return res(400, { ok: false, error: 'dates', message: 'Estada massa llarga. Comprova les dates.' });

  if (!validaNom(nombre) || !validaNom(apellidos))
    return res(400, { ok: false, error: 'nom', message: 'Nom o cognoms no vàlids.' });
  if (!validaNom(municipio) || !validaNom(provincia) || !validaNom(pais))
    return res(400, { ok: false, error: 'domicili', message: 'Municipi, província o país no vàlids.' });
  if (!validaAdreca(calle))
    return res(400, { ok: false, error: 'adreca', message: 'Adreça no vàlida.' });

  if (SEXES.indexOf(sexo) === -1)
    return res(400, { ok: false, error: 'sexe', message: 'Valor de sexe no vàlid.' });
  if (TIPUS.indexOf(tipo) === -1)
    return res(400, { ok: false, error: 'document', message: 'Tipus de document no vàlid.' });

  const numero = normDoc(tipo === 'DNI' ? b.dni : tipo === 'PASSAPORTE' ? b.pasaporte : b.tie);
  const valid = tipo === 'DNI' ? validaDniNie(numero)
              : tipo === 'PASSAPORTE' ? validaPassaport(numero)
              : validaTie(numero);
  if (!valid)
    return res(400, { ok: false, error: 'document', message: 'El número del document no és vàlid.' });

  if (!validaTelefon(telefono))
    return res(400, { ok: false, error: 'telefon', message: 'Telèfon no vàlid.' });

  if (!b.acepto)
    return res(400, { ok: false, error: 'acceptacio', message: 'Cal acceptar les condicions.' });

  if (!b.doc_foto_b64)
    return res(400, { ok: false, error: 'foto', message: 'Falta la foto del document.' });
  if (base64SizeExceeds(b.doc_foto_b64))
    return res(400, { ok: false, error: 'foto_gran', message: 'La foto ha de pesar menys de 4MB.' });
  if (!/^image\/(jpeg|png|webp|heic|heif|gif)$/i.test(s(b.doc_foto_type)))
    return res(400, { ok: false, error: 'foto_tipus', message: 'El document ha de ser una imatge.' });

  const fields = {
    'DÍA ENTRADA': entrada,
    'DÍA SALIDA': salida,
    'Nombre': nombre,
    'Apellidos': apellidos,
    'Sexo': sexo,
    'TIPO DOCUMENTO': tipo,
    'Calle y número': calle,
    'Municipio': municipio,
    'Provincia': provincia,
    'Pais': pais,
    'Teléfono': telefono,
  };
  fields[DOCS[tipo].num] = numero;
  fields[F_ACCEPT] = 'Acepto';

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

    // L'adjunt va després de crear el registre, al camp del document triat. Si
    // falla, el registre ja està desat: val més això que perdre'l tot per una
    // foto, i la foto sempre es pot afegir a mà.
    if (recordId) {
      try {
        await fetch(`https://content.airtable.com/v0/${BASE}/${recordId}/${encodeURIComponent(DOCS[tipo].foto)}/uploadAttachment`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType: b.doc_foto_type || 'image/jpeg',
            file: b.doc_foto_b64,
            filename: b.doc_foto_name || 'document.jpg',
          }),
        });
      } catch (e) { /* el registre ja s'ha creat */ }
    }

    return res(200, { ok: true });
  } catch (e) {
    return res(200, { ok: false, error: 'exception', detail: String(e).slice(0, 200) });
  }
};
