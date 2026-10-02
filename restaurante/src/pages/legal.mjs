// Textos legales (LSSI-CE, RGPD/LOPDGDD y cookies) en los tres idiomas.
// Revisar con asesoría cuando estén los datos fiscales definitivos de
// site.config.mjs.

import { esc } from '../assets/js/render.mjs';

function page(ctx, id, title, sections) {
  const { t, updated } = ctx;
  const body = `
<header class="page-head page-head-compact wrap">
  <p class="eyebrow">${esc(t.legal.updated)}: ${esc(updated)}</p>
  <h1 class="page-title page-title-sm">${esc(title)}</h1>
</header>
<article class="wrap legal">
  ${sections.map(([h, html]) => `<section><h2>${esc(h)}</h2><div>${html}</div></section>`).join('')}
</article>`;
  return { id, title, body };
}

export function legal(ctx) {
  const { site, lang } = ctx;
  const L = site.legal, a = site.address;
  const holder = `<p><strong>${esc(L.company)}</strong> · NIF ${esc(L.taxId)}<br>${esc(a.street)}, ${esc(a.postalCode)} ${esc(a.city)} (${esc(a.region)})<br>${esc(site.email)} · ${esc(site.phone)}<br>${esc(L.registry)}</p>`;
  const T = {
    va: [
      ['Titular del lloc web', `<p>En compliment de la Llei 34/2002, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE), el titular d’este lloc web, que opera amb el nom comercial ${esc(site.name)}, és:</p>${holder}`],
      ['Objecte', '<p>Este lloc web oferix informació sobre el restaurant i permet fer reserves i enviar sol·licituds d’esdeveniments privats, targetes regal i consultes generals.</p>'],
      ['Condicions d’ús', '<p>La persona usuària es compromet a fer un ús lícit del web i a facilitar dades verídiques. Les reserves fetes amb dades falses es podran anul·lar.</p>'],
      ['Propietat intel·lectual i industrial', `<p>Tots els continguts d’este lloc (textos, disseny, il·lustracions, logotips i codi font) pertanyen a ${esc(L.company)} o s’hi utilitzen amb autorització. Queda prohibida la reproducció sense permís exprés.</p>`],
      ['Responsabilitat', '<p>Procurem mantindre la informació actualitzada (menús, preus, horaris), encara que pot canviar sense avís previ. No ens fem responsables del contingut de webs externes enllaçades des d’este lloc.</p>'],
      ['Legislació aplicable', '<p>Estes condicions es regixen per la legislació espanyola. Per a qualsevol controvèrsia seran competents els jutjats i tribunals del domicili de la persona consumidora.</p>'],
    ],
    es: [
      ['Titular del sitio web', `<p>En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), el titular de este sitio web, que opera con el nombre comercial ${esc(site.name)}, es:</p>${holder}`],
      ['Objeto', '<p>Este sitio web ofrece información sobre el restaurante y permite realizar reservas y enviar solicitudes de eventos privados, tarjetas regalo y consultas generales.</p>'],
      ['Condiciones de uso', '<p>La persona usuaria se compromete a hacer un uso lícito de la web y a facilitar datos veraces. Las reservas realizadas con datos falsos podrán ser anuladas.</p>'],
      ['Propiedad intelectual e industrial', `<p>Todos los contenidos de este sitio (textos, diseño, ilustraciones, logotipos y código fuente) pertenecen a ${esc(L.company)} o se utilizan con autorización. Queda prohibida su reproducción sin permiso expreso.</p>`],
      ['Responsabilidad', '<p>Procuramos mantener la información actualizada (menús, precios, horarios), aunque puede cambiar sin previo aviso. No nos hacemos responsables del contenido de webs externas enlazadas desde este sitio.</p>'],
      ['Legislación aplicable', '<p>Estas condiciones se rigen por la legislación española. Para cualquier controversia serán competentes los juzgados y tribunales del domicilio de la persona consumidora.</p>'],
    ],
    en: [
      ['Website owner', `<p>In accordance with Spanish Law 34/2002 on Information Society Services (LSSI-CE), the owner of this website, trading as ${esc(site.name)}, is:</p>${holder}`],
      ['Purpose', '<p>This website provides information about the restaurant and allows users to make reservations and send requests for private events, gift cards and general enquiries.</p>'],
      ['Terms of use', '<p>Users agree to use the website lawfully and to provide truthful information. Bookings made with false data may be cancelled.</p>'],
      ['Intellectual property', `<p>All content on this website (texts, design, illustrations, logos and source code) belongs to ${esc(L.company)} or is used with permission. Reproduction without express authorisation is prohibited.</p>`],
      ['Liability', '<p>We make every effort to keep the information up to date (menus, prices, opening hours), but it may change without notice. We are not responsible for the content of external websites linked from this site.</p>'],
      ['Applicable law', '<p>These terms are governed by Spanish law. For any dispute, the courts of the consumer’s domicile shall have jurisdiction.</p>'],
    ],
  };
  return page(ctx, 'legal', ctx.t.legal.title, T[lang] || T.es);
}

export function privacy(ctx) {
  const { site, lang } = ctx;
  const L = site.legal, a = site.address;
  const mail = `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
  const T = {
    va: [
      ['Responsable del tractament', `<p>${esc(L.company)} (NIF ${esc(L.taxId)}), ${esc(a.street)}, ${esc(a.postalCode)} ${esc(a.city)}. Contacte: ${mail}.</p>`],
      ['Quines dades tractem', '<ul><li>Dades identificatives i de contacte: nom, correu electrònic i telèfon (per a enviar-te la confirmació i els recordatoris de la reserva per correu i SMS).</li><li>Dades de la reserva: data, hora, nombre de comensals, menú, ocasió i observacions.</li><li>Al·lèrgies, intoleràncies i necessitats alimentàries que decidisques indicar-nos (dades de salut).</li><li>Sol·licituds d’esdeveniments privats, targetes regal o consultes.</li></ul>'],
      ['Finalitats i base jurídica', '<ul><li><strong>Gestionar la teua reserva o sol·licitud</strong> i enviar-te les comunicacions relacionades (confirmació, recordatori, canvis): execució d’un contracte o mesures precontractuals (art. 6.1.b RGPD).</li><li><strong>Adaptar el menú a les teues al·lèrgies o intoleràncies</strong>: el teu consentiment explícit en facilitar-les (art. 9.2.a RGPD). Pots retirar-lo quan vulgues; en eixe cas no podrem adaptar els plats.</li><li><strong>Recordar les teues preferències en pròximes visites</strong> (fitxa de client): interés legítim en oferir un servici personalitzat (art. 6.1.f RGPD). Pots oposar-t’hi en qualsevol moment.</li><li><strong>Enviar-te notícies ocasionals</strong>, només si marques la casella: consentiment (art. 6.1.a RGPD).</li></ul>'],
      ['Conservació', '<p>Les dades de les reserves es conserven el temps necessari per a prestar el servici i, després, durant els terminis legalment exigits. Les fitxes de client s’eliminen automàticament després de dos anys sense visites. Les dades per a comunicacions es conserven fins que retires el consentiment.</p>'],
      ['Destinataris i encarregats', '<p>No cedim ni venem les teues dades. Utilitzem proveïdors que actuen com a encarregats del tractament amb contracte: Netlify, Inc. (allotjament web i emmagatzematge), Resend (enviament de correus), Twilio (enviament de SMS) i, si està activat, Cloudflare, Inc. (verificació antispam). Estos proveïdors poden tractar dades als Estats Units a l’empara del Marc de Privacitat de Dades UE-EUA o de clàusules contractuals tipus.</p>'],
      ['Els teus drets', `<p>Pots exercir els drets d’accés, rectificació, supressió, oposició, limitació i portabilitat, i retirar el consentiment, escrivint a ${mail}. Si consideres que no s’han respectat, pots reclamar davant de l’Agència Espanyola de Protecció de Dades (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>`],
    ],
    es: [
      ['Responsable del tratamiento', `<p>${esc(L.company)} (NIF ${esc(L.taxId)}), ${esc(a.street)}, ${esc(a.postalCode)} ${esc(a.city)}. Contacto: ${mail}.</p>`],
      ['Qué datos tratamos', '<ul><li>Datos identificativos y de contacto: nombre, email y teléfono (para enviarte la confirmación y los recordatorios de la reserva por email y SMS).</li><li>Datos de la reserva: fecha, hora, número de comensales, menú, ocasión y observaciones.</li><li>Alergias, intolerancias y necesidades alimentarias que decidas indicarnos (datos de salud).</li><li>Solicitudes de eventos privados, tarjetas regalo o consultas.</li></ul>'],
      ['Finalidades y base jurídica', '<ul><li><strong>Gestionar tu reserva o solicitud</strong> y enviarte las comunicaciones relacionadas (confirmación, recordatorio, cambios): ejecución de un contrato o medidas precontractuales (art. 6.1.b RGPD).</li><li><strong>Adaptar el menú a tus alergias o intolerancias</strong>: tu consentimiento explícito al facilitarlas (art. 9.2.a RGPD). Puedes retirarlo cuando quieras; en ese caso no podremos adaptar los platos.</li><li><strong>Recordar tus preferencias en próximas visitas</strong> (ficha de cliente): interés legítimo en ofrecer un servicio personalizado (art. 6.1.f RGPD). Puedes oponerte en cualquier momento.</li><li><strong>Enviarte noticias ocasionales</strong>, solo si marcas la casilla: consentimiento (art. 6.1.a RGPD).</li></ul>'],
      ['Conservación', '<p>Los datos de las reservas se conservan el tiempo necesario para prestar el servicio y, después, durante los plazos legalmente exigidos. Las fichas de cliente se eliminan automáticamente tras dos años sin visitas. Los datos para comunicaciones se conservan hasta que retires el consentimiento.</p>'],
      ['Destinatarios y encargados', '<p>No cedemos ni vendemos tus datos. Utilizamos proveedores que actúan como encargados del tratamiento con contrato: Netlify, Inc. (alojamiento web y almacenamiento), Resend (envío de emails), Twilio (envío de SMS) y, si está activado, Cloudflare, Inc. (verificación anti-spam). Estos proveedores pueden tratar datos en Estados Unidos al amparo del Marco de Privacidad de Datos UE-EE. UU. o de cláusulas contractuales tipo.</p>'],
      ['Tus derechos', `<p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, y retirar tu consentimiento, escribiendo a ${mail}. Si consideras que no se han respetado, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>`],
    ],
    en: [
      ['Data controller', `<p>${esc(L.company)} (NIF ${esc(L.taxId)}), ${esc(a.street)}, ${esc(a.postalCode)} ${esc(a.city)}. Contact: ${mail}.</p>`],
      ['What data we process', '<ul><li>Identification and contact details: name, email and phone number (used to send booking confirmations and reminders by email and text message).</li><li>Booking details: date, time, number of guests, menu, occasion and notes.</li><li>Allergies, intolerances and dietary requirements you choose to tell us (health data).</li><li>Requests for private events, gift cards or general enquiries.</li></ul>'],
      ['Purposes and legal basis', '<ul><li><strong>Managing your booking or request</strong> and sending you related communications (confirmation, reminder, changes): performance of a contract or pre-contractual steps (art. 6.1.b GDPR).</li><li><strong>Adapting the menu to your allergies or intolerances</strong>: your explicit consent when you provide them (art. 9.2.a GDPR). You can withdraw it at any time; we will then be unable to adapt the dishes.</li><li><strong>Remembering your preferences on future visits</strong> (customer record): our legitimate interest in offering a personalised service (art. 6.1.f GDPR). You can object at any time.</li><li><strong>Sending occasional news</strong>, only if you tick the box: consent (art. 6.1.a GDPR).</li></ul>'],
      ['Retention', '<p>Booking data are kept for as long as necessary to provide the service and, afterwards, for the periods required by law. Customer records are deleted automatically after two years without visits. Marketing data are kept until you withdraw consent.</p>'],
      ['Recipients and processors', '<p>We do not sell or transfer your data. We use providers acting as data processors under contract: Netlify, Inc. (website hosting and storage), Resend (transactional email), Twilio (text messages) and, where enabled, Cloudflare, Inc. (anti-spam check). These providers may process data in the United States under the EU–US Data Privacy Framework or standard contractual clauses.</p>'],
      ['Your rights', `<p>You can exercise your rights of access, rectification, erasure, objection, restriction and portability, and withdraw your consent, by writing to ${mail}. If you consider that your rights have not been respected, you may lodge a complaint with the Spanish Data Protection Agency (<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>).</p>`],
    ],
  };
  return page(ctx, 'privacy', ctx.t.privacy.title, T[lang] || T.es);
}

export function cookies(ctx) {
  const { lang } = ctx;
  const rows = {
    va: [['theme (emmagatzematge local)', 'Recorda la teua preferència de llum si la canvies.', 'Fins que l’esborres'],
      ['__Host-rs (galeta)', 'Sessió de l’equip en el panell intern de gestió (/admin).', '12 hores'],
      ['Cloudflare Turnstile', 'Verificació antispam dels formularis, si està activada.', 'Sessió']],
    es: [['theme (almacenamiento local)', 'Recuerda tu preferencia de luz si la cambias.', 'Hasta que lo borres'],
      ['__Host-rs (cookie)', 'Sesión del equipo en el panel interno de gestión (/admin).', '12 horas'],
      ['Cloudflare Turnstile', 'Verificación anti-spam de los formularios, si está activada.', 'Sesión']],
    en: [['theme (local storage)', 'Remembers your light/dark preference if you change it.', 'Until you clear it'],
      ['__Host-rs (cookie)', 'Staff session for the internal management panel (/admin) only.', '12 hours'],
      ['Cloudflare Turnstile', 'Anti-spam check on forms, where enabled.', 'Session']],
  }[lang] || [];
  const head = { va: ['Nom', 'Finalitat', 'Duració'], es: ['Nombre', 'Finalidad', 'Duración'], en: ['Name', 'Purpose', 'Duration'] }[lang];
  const table = `<table class="legal-table"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const T = {
    va: [
      ['Què utilitzem', '<p>Este web no utilitza galetes analítiques, publicitàries ni de xarxes socials. Només fem servir l’emmagatzematge tècnic estrictament necessari que es detalla a continuació, exempt de consentiment segons l’article 22.2 de la LSSI-CE.</p>'],
      ['Detall', table],
      ['Com gestionar-les', '<p>Pots esborrar o bloquejar les galetes i l’emmagatzematge local des de la configuració del navegador. Bloquejar-les no t’impedirà navegar ni reservar.</p>'],
    ],
    es: [
      ['Qué utilizamos', '<p>Esta web no utiliza cookies analíticas, publicitarias ni de redes sociales. Solo empleamos el almacenamiento técnico estrictamente necesario que se detalla a continuación, exento de consentimiento según el artículo 22.2 de la LSSI-CE.</p>'],
      ['Detalle', table],
      ['Cómo gestionarlas', '<p>Puedes borrar o bloquear las cookies y el almacenamiento local desde la configuración de tu navegador. Bloquearlas no te impedirá navegar ni reservar.</p>'],
    ],
    en: [
      ['What we use', '<p>This website does not use analytics, advertising or social media tracking cookies. We only use the strictly necessary technical storage listed below, which is exempt from consent under article 22.2 of the LSSI-CE.</p>'],
      ['Details', table],
      ['How to manage them', '<p>You can delete or block cookies and local storage in your browser settings. Blocking them will not prevent you from browsing or booking.</p>'],
    ],
  };
  return page(ctx, 'cookies', ctx.t.cookies.title, T[lang] || T.es);
}
