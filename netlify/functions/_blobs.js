// Accés al magatzem de la webcam (Netlify Blobs).
//
// Normalment Netlify injecta tot sol el siteID i el token a les funcions i
// n'hi ha prou amb getStore('webcam'). Quan no ho fa, la llibreria llança
// MissingBlobsEnvironmentError, que és el que ens va passar en muntar-ho.
//
// Per això ací es miren abans dos variables d'entorn. Si hi són, s'usen; si
// no, es deixa que Netlify faça la seua. Així funciona en els dos casos i, si
// algun dia Netlify torna a injectar-ho sol, no cal tocar res: només llevar
// les variables.
//
//   BLOBS_SITE_ID  — Site settings > General > Site details > Site ID
//   BLOBS_TOKEN    — un token personal de Netlify (User settings >
//                    Applications > New access token)
//
// Ull amb el token: és una clau ampla del compte de Netlify. Ací es queda
// dins de Netlify, com AIRTABLE_TOKEN, i no ix mai cap a l'ordinador del
// club — eixe només té la clau de pujar la foto, que no serveix per a res
// més. La diferència importa.

const { getStore } = require('@netlify/blobs');

const NOM = 'webcam';

function magatzem() {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) return getStore({ name: NOM, siteID: siteID, token: token });
  return getStore(NOM);
}

// Les dos funcions han d'explicar igual el mateix problema, que si no es
// perd una hora buscant on està l'error.
function explicaError(e) {
  const txt = String((e && e.message) || e);
  if (/MissingBlobsEnvironment/i.test(txt) || /has not been configured/i.test(txt)) {
    return {
      error: 'blobs-sense-configurar',
      message: 'Netlify no li dona el context de Blobs a la funció. Posa BLOBS_SITE_ID i BLOBS_TOKEN a les variables del lloc i fes un desplegament nou.',
    };
  }
  return { error: 'store', message: txt.slice(0, 200) };
}

module.exports = { magatzem, explicaError };
