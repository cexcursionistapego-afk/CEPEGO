// Páginas con formulario de solicitud: eventos privados, tarjeta regalo y contacto.

import { esc, nobr, price, hoursBlock } from '../assets/js/render.mjs';
import { floorPlanSVG, plateSVG } from '../assets/js/plate.mjs';
import { field, select, check, honeypot, captcha, formStatus } from './ui.mjs';

function consent(ctx) {
  return check({ name: 'consentPrivacy', required: true, html: ctx.t.forms.consent.replace('{privacy}', ctx.url('privacy')) });
}

function contactFields(f, { phoneRequired = false } = {}) {
  return `<div class="form-row">
    ${field({ name: 'name', label: f.name, required: true, autocomplete: 'name' })}
  </div>
  <div class="form-row form-row-2">
    ${field({ name: 'email', label: f.email, type: 'email', required: true, autocomplete: 'email' })}
    ${field({ name: 'phone', label: f.phone, type: 'tel', required: phoneRequired, autocomplete: 'tel', attrs: 'inputmode="tel"' })}
  </div>`;
}

export function events(ctx) {
  const { t, lang } = ctx;
  const e = t.events, f = t.forms;
  const body = `
<header class="page-head wrap">
  <p class="eyebrow">${esc(t.nav.events)}</p>
  <h1 class="page-title">${esc(e.title)}</h1>
  <p class="lead page-lead">${nobr(e.lead)}</p>
</header>
<section class="section">
  <div class="wrap options">
    ${e.options.map(([title, cap, text], i) => `
    <article class="option" data-reveal>
      <p class="eyebrow num">${String(i + 1).padStart(2, '0')} — ${esc(cap)}</p>
      <h2 class="option-title">${esc(title)}</h2>
      <p>${esc(text)}</p>
    </article>`).join('')}
  </div>
</section>
<section class="section" aria-labelledby="event-form-title">
  <div class="wrap split-grid">
    <div>
      <h2 class="section-title" id="event-form-title" data-reveal>${esc(e.formTitle)}</h2>
      <p class="muted" data-reveal>${esc(e.formText)}</p>
      <figure class="plan-figure plan-small" data-reveal data-draw>${floorPlanSVG({ label: e.planLabel, kitchen: t.philosophy.kitchen })}</figure>
    </div>
    <form class="form" data-request-form="evento" novalidate>
      ${contactFields(f, { phoneRequired: true })}
      <div class="form-row form-row-2">
        ${field({ name: 'company', label: f.company, autocomplete: 'organization' })}
        ${field({ name: 'date', label: f.date, type: 'date' })}
      </div>
      <div class="form-row form-row-2">
        ${field({ name: 'guests', label: f.guests, type: 'number', required: true, attrs: 'min="2" max="200" inputmode="numeric"' })}
        ${select({ name: 'eventType', label: f.eventType, options: e.types.map((x) => [x, x]), placeholder: f.select })}
      </div>
      ${select({ name: 'budget', label: f.budget, options: e.budgets.map((x) => [x, x]), placeholder: f.select })}
      ${field({ name: 'message', label: f.message, type: 'textarea' })}
      ${consent(ctx)}
      ${honeypot()}${captcha()}
      <div class="form-actions"><button class="btn btn-lg" type="submit" data-label="${esc(f.send)}" data-busy="${esc(f.sending)}">${esc(f.send)}</button></div>
      ${formStatus()}
    </form>
  </div>
</section>`;
  return { id: 'events', title: e.title, description: e.lead, body, scripts: ['/assets/js/forms.js'] };
}

export function gift(ctx) {
  const { t, lang, cfg, site } = ctx;
  const g = t.gift, f = t.forms;
  const menus = cfg.menus.filter((m) => m.active);
  const first = menus[0];
  const menuOptions = menus.map((m) => [m.id, `${m.name[lang]} · ${price(m.price, lang)}`]);
  const pairingOptions = [['', g.noPairing], ...(first?.pairing || []).map((p) => [p.id, `${p.name[lang]} · +${price(p.price, lang)}`])];
  const body = `
<header class="page-head wrap">
  <p class="eyebrow">${esc(t.nav.gift)}</p>
  <h1 class="page-title">${esc(g.title)}</h1>
  <p class="lead page-lead">${nobr(g.lead)}</p>
</header>
<section class="section">
  <div class="wrap options">
    ${g.steps.map(([title, text], i) => `
    <article class="option" data-reveal>
      <p class="eyebrow num">${String(i + 1).padStart(2, '0')}</p>
      <h2 class="option-title">${esc(title)}</h2>
      <p>${esc(text)}</p>
    </article>`).join('')}
  </div>
</section>
<section class="section" aria-labelledby="gift-form-title">
  <div class="wrap split-grid gift-grid">
    <div class="gift-visual">
      <div class="gift-card" data-gift-card aria-hidden="true">
        <div class="gift-card-top"><span class="gift-card-brand">${esc(site.name)}</span><span class="eyebrow">${esc(g.cardValid)}</span></div>
        <div class="gift-card-plate">${plateSVG('regalo · naranja, aceite de oliva, leche de oveja')}</div>
        <div class="gift-card-bottom">
          <div><span class="eyebrow">${esc(g.cardFor)}</span><span class="gift-card-to" data-gift-to>—</span></div>
          <div class="gift-card-menu"><span data-gift-menu>${esc(first?.name[lang] || '')}</span><span class="num" data-gift-total></span></div>
        </div>
      </div>
    </div>
    <form class="form" data-request-form="regalo" novalidate>
      <h2 class="form-title" id="gift-form-title">${esc(g.formTitle)}</h2>
      <div class="form-row form-row-2">
        ${select({ name: 'menu', label: f.menu, options: menuOptions, required: true })}
        ${select({ name: 'pairing', label: f.pairing, options: pairingOptions })}
      </div>
      <div class="form-row form-row-2">
        ${field({ name: 'guests', label: f.diners, type: 'number', required: true, value: '2', attrs: 'min="1" max="12" inputmode="numeric"' })}
        <div class="field gift-total"><span class="label">${esc(g.total)}</span><output class="num" data-gift-amount>—</output></div>
      </div>
      ${field({ name: 'recipient', label: f.recipient, required: true })}
      ${field({ name: 'recipientEmail', label: f.recipientEmail, type: 'email' })}
      ${field({ name: 'dedication', label: f.dedication, type: 'textarea' })}
      ${select({ name: 'delivery', label: f.delivery, options: [['email', g.delivery.email], ['print', g.delivery.print]] })}
      <p class="form-sub eyebrow">${esc(f.buyer)}</p>
      ${contactFields(f, { phoneRequired: true })}
      ${consent(ctx)}
      ${honeypot()}${captcha()}
      <input type="hidden" name="amount" value="">
      <div class="form-actions"><button class="btn btn-lg" type="submit" data-label="${esc(f.send)}" data-busy="${esc(f.sending)}">${esc(f.send)}</button></div>
      ${formStatus()}
    </form>
  </div>
</section>
<script type="application/json" id="gift-menus">${JSON.stringify(menus.map((m) => ({ id: m.id, name: m.name, price: m.price, pairing: m.pairing }))).replace(/</g, '\\u003c')}</script>`;
  return { id: 'gift', title: g.title, description: g.lead, body, scripts: ['/assets/js/forms.js'] };
}

export function contact(ctx) {
  const { t, site, lang, cfg } = ctx;
  const c = t.contact, f = t.forms;
  const a = site.address;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${a.street} ${a.postalCode} ${a.city}`)}`;
  const body = `
<header class="page-head wrap">
  <p class="eyebrow">${esc(site.name)}</p>
  <h1 class="page-title">${esc(c.title)}</h1>
  <p class="lead page-lead">${nobr(c.lead)}</p>
</header>
<section class="section">
  <div class="wrap info-grid">
    <div data-reveal><h2 class="eyebrow">${esc(c.address)}</h2><address>${esc(a.street)}<br>${esc(a.postalCode)} ${esc(a.city)}<br>${esc(a.region)}, ${esc(a.countryName[lang])}</address><a class="link-arrow" href="${maps}" target="_blank" rel="noopener">${esc(t.footer.directions)}</a></div>
    <div data-reveal><h2 class="eyebrow">${esc(c.phone)}</h2><p class="info-big"><a href="tel:${site.phone.replace(/\s/g, '')}">${esc(site.phone)}</a></p><h2 class="eyebrow">${esc(c.email)}</h2><p class="info-big"><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p></div>
    <div data-reveal><h2 class="eyebrow">${esc(c.hours)}</h2>${hoursBlock(cfg.services, lang, t.footer.closed)}</div>
    <div data-reveal><h2 class="eyebrow">${esc(c.access)}</h2><p>${esc(c.accessText)}</p><h2 class="eyebrow">${esc(c.parking)}</h2><p>${esc(c.parkingText)}</p></div>
  </div>
</section>
<section class="section" aria-labelledby="contact-form-title">
  <div class="wrap split-grid">
    <h2 class="section-title" id="contact-form-title" data-reveal>${esc(c.formTitle)}</h2>
    <form class="form" data-request-form="contacto" novalidate>
      ${contactFields(f)}
      ${field({ name: 'subject', label: f.subject })}
      ${field({ name: 'message', label: f.message, type: 'textarea', required: true })}
      ${consent(ctx)}
      ${honeypot()}${captcha()}
      <div class="form-actions"><button class="btn btn-lg" type="submit" data-label="${esc(f.send)}" data-busy="${esc(f.sending)}">${esc(f.send)}</button></div>
      ${formStatus()}
    </form>
  </div>
</section>`;
  return { id: 'contact', title: c.title, description: c.lead, body, jsonld: true, scripts: ['/assets/js/forms.js'] };
}
