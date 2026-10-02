import { esc, nobr } from '../assets/js/render.mjs';
import { field, select, check, honeypot, captcha, formStatus } from './ui.mjs';

export function booking(ctx) {
  const { t, url, cfg, site } = ctx;
  const b = t.booking, f = t.forms;
  const steps = ['party', 'date', 'time', 'menu', 'details'];
  const stepHead = (id, i) => `<header class="step-head"><p class="eyebrow num">${esc(b.stepWord)} ${String(i + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}</p><h2 class="step-title" tabindex="-1">${esc(b.steps[id])}</h2></header>`;
  const consent = check({ name: 'consentPrivacy', required: true, html: f.consent.replace('{privacy}', url('privacy')) });

  const body = `
<header class="page-head page-head-compact wrap">
  <p class="eyebrow">${esc(site.name)}</p>
  <h1 class="page-title">${esc(b.title)}</h1>
  <p class="lead page-lead">${nobr(b.lead)}</p>
</header>
<section class="booking wrap" data-booking>
  <aside class="booking-summary" aria-label="${esc(b.title)}">
    <p class="sentence" data-sentence aria-live="polite">
      <span class="sentence-fixed">${esc(b.sentence.table)}</span>
      <button type="button" class="sentence-part" data-goto="party" data-part="party" disabled>—</button>
      <button type="button" class="sentence-part" data-goto="date" data-part="date" disabled>—</button>
      <span class="sentence-fixed">${esc(b.sentence.at)}</span>
      <button type="button" class="sentence-part" data-goto="time" data-part="time" disabled>—</button>
      <span class="sentence-menu" data-menu-wrap hidden><span class="sentence-fixed">· ${esc(b.sentence.menu)}</span>
      <button type="button" class="sentence-part" data-goto="menu" data-part="menu" disabled>—</button></span>
    </p>
    <p class="booking-policy small muted" data-policy>${esc(b.policy.replace('{h}', cfg.booking.cancellationHours))}</p>
  </aside>

  <div class="booking-steps">
    <div class="steps-progress" aria-hidden="true"><span data-progress></span></div>

    <section class="step" data-step="party" aria-labelledby="st-party">
      ${stepHead('party', 0).replace('class="step-title"', 'class="step-title" id="st-party"')}
      <div class="party-grid" role="radiogroup" aria-labelledby="st-party" data-party-grid></div>
      <p class="small muted step-foot" data-large-group></p>
    </section>

    <section class="step" data-step="date" aria-labelledby="st-date" hidden>
      ${stepHead('date', 1).replace('class="step-title"', 'class="step-title" id="st-date"')}
      <div class="calendar" data-calendar>
        <div class="calendar-head">
          <button type="button" class="icon-btn" data-cal-prev aria-label="${esc(b.prevMonth)}">←</button>
          <p class="calendar-month" data-cal-month aria-live="polite"></p>
          <button type="button" class="icon-btn" data-cal-next aria-label="${esc(b.nextMonth)}">→</button>
        </div>
        <div class="calendar-grid" role="grid" data-cal-grid></div>
        <ul class="calendar-legend small">
          <li><span class="lg lg-open"></span>${esc(b.legend.open)}</li>
          <li><span class="lg lg-few"></span>${esc(b.legend.few)}</li>
          <li><span class="lg lg-full"></span>${esc(b.legend.full)}</li>
          <li><span class="lg lg-closed"></span>${esc(b.legend.closed)}</li>
        </ul>
      </div>
      <div class="step-nav"><button type="button" class="btn btn-ghost" data-back>${esc(b.back)}</button></div>
    </section>

    <section class="step" data-step="time" aria-labelledby="st-time" hidden>
      ${stepHead('time', 2).replace('class="step-title"', 'class="step-title" id="st-time"')}
      <div class="services" data-services></div>
      <div class="waitlist" data-waitlist hidden>
        <h3 class="waitlist-title">${esc(b.waitlistTitle)}</h3>
        <p class="small muted">${esc(b.waitlistText)}</p>
        <form class="form" data-waitlist-form novalidate>
          ${field({ name: 'name', id: 'w-name', label: f.name, required: true, autocomplete: 'name' })}
          <div class="form-row form-row-2">
            ${field({ name: 'email', id: 'w-email', label: f.email, type: 'email', required: true, autocomplete: 'email' })}
            ${field({ name: 'phone', id: 'w-phone', label: f.phone, type: 'tel', required: true, autocomplete: 'tel' })}
          </div>
          ${select({ name: 'service', id: 'w-service', label: b.steps.time, options: [['any', b.waitlistAny], ...cfg.services.map((s) => [s.id, s.label[ctx.lang]])] })}
          ${check({ name: 'consentPrivacy', required: true, html: f.consent.replace('{privacy}', url('privacy')) }).replace('name="consentPrivacy"', 'name="consentPrivacy" id="w-consent"')}
          ${honeypot()}${captcha()}
          <div class="form-actions"><button class="btn" type="submit" data-label="${esc(b.waitlistCta)}" data-busy="${esc(f.sending)}">${esc(b.waitlistCta)}</button></div>
          ${formStatus()}
        </form>
      </div>
      <div class="step-nav"><button type="button" class="btn btn-ghost" data-back>${esc(b.back)}</button></div>
    </section>

    <section class="step" data-step="menu" aria-labelledby="st-menu" hidden>
      ${stepHead('menu', 3).replace('class="step-title"', 'class="step-title" id="st-menu"')}
      <div class="menu-choices" data-menu-choices role="radiogroup" aria-labelledby="st-menu"></div>
      <div class="step-nav">
        <button type="button" class="btn btn-ghost" data-back>${esc(b.back)}</button>
        <button type="button" class="btn" data-next-menu>${esc(b.next)}</button>
      </div>
    </section>

    <section class="step" data-step="details" aria-labelledby="st-details" hidden>
      ${stepHead('details', 4).replace('class="step-title"', 'class="step-title" id="st-details"')}
      <form class="form" data-booking-form novalidate>
        ${field({ name: 'name', label: f.name, required: true, autocomplete: 'name' })}
        <div class="form-row form-row-2">
          ${field({ name: 'email', label: f.email, type: 'email', required: true, autocomplete: 'email' })}
          ${field({ name: 'phone', label: f.phone, type: 'tel', required: true, autocomplete: 'tel', attrs: 'inputmode="tel"', hint: b.smsHint }).replace('class="field-hint"', 'class="field-hint" data-sms-hint hidden')}
        </div>
        <fieldset class="field chips-field">
          <legend>${esc(b.dietary)}</legend>
          <div class="chips">${Object.entries(b.dietaryOptions).map(([k, v]) => `<label class="chip"><input type="checkbox" name="dietary" value="${k}"><span>${esc(v)}</span></label>`).join('')}</div>
        </fieldset>
        ${field({ name: 'allergies', label: b.allergies, type: 'textarea', hint: b.allergiesHint })}
        <div class="form-row form-row-2">
          ${select({ name: 'occasion', label: b.occasion, options: Object.entries(b.occasionOptions) })}
          ${field({ name: 'notes', label: b.notes })}
        </div>
        ${consent}
        ${check({ name: 'consentMarketing', html: esc(f.marketing) })}
        ${honeypot()}${captcha()}
        <div class="form-actions step-nav">
          <button type="button" class="btn btn-ghost" data-back>${esc(b.back)}</button>
          <button class="btn btn-lg" type="submit" data-label="${esc(b.submit)}" data-label-request="${esc(b.submitRequest)}" data-busy="${esc(b.submitting)}">${esc(b.submit)}</button>
        </div>
        ${formStatus()}
      </form>
    </section>

    <section class="step step-done" data-step="done" aria-labelledby="st-done" hidden>
      <div class="done-mark" aria-hidden="true"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28"/><path d="M18 31l8 8 16-18"/></svg></div>
      <h2 class="step-title" id="st-done" tabindex="-1" data-done-title></h2>
      <p class="lead" data-done-text></p>
      <dl class="done-details" data-done-details></dl>
      <div class="done-actions">
        <a class="btn" data-done-manage href="#">${esc(b.manage)}</a>
        <a class="btn btn-ghost" data-done-google target="_blank" rel="noopener" href="#">${esc(b.google)}</a>
        <button type="button" class="btn btn-ghost" data-done-ics>${esc(b.ics)}</button>
      </div>
      <p><button type="button" class="link-arrow link-button" data-restart>${esc(b.another)}</button></p>
    </section>
  </div>
</section>
<noscript><div class="wrap"><p class="lead">${esc(b.errors.unavailable)} <a href="tel:${site.phone.replace(/\s/g, '')}">${esc(site.phone)}</a></p></div></noscript>`;
  return { id: 'booking', title: b.title, description: b.lead, body, scripts: ['/assets/js/booking.js'] };
}

export function manage(ctx) {
  const { t } = ctx;
  const m = t.manage;
  const body = `
<header class="page-head page-head-compact wrap">
  <p class="eyebrow">${esc(t.booking.title)}</p>
  <h1 class="page-title" data-manage-title>${esc(m.title)}</h1>
</header>
<section class="wrap manage" data-manage>
  <div class="manage-view" data-manage-view hidden>
    <p class="manage-status" data-manage-status></p>
    <dl class="done-details" data-manage-details></dl>
    <p class="small muted" data-manage-note></p>
    <div class="done-actions" data-manage-actions>
      <button type="button" class="btn" data-cancel>${esc(m.cancel)}</button>
    </div>
    ${formStatus()}
  </div>
  <form class="form manage-lookup" data-lookup novalidate hidden>
    <h2 class="section-title">${esc(m.lookupTitle)}</h2>
    <p class="muted">${esc(m.lookupText)}</p>
    <div class="form-row form-row-2">
      ${field({ name: 'code', label: m.code, required: true, attrs: 'autocapitalize="characters" maxlength="8" spellcheck="false"' })}
      ${field({ name: 'email', label: m.email, type: 'email', required: true, autocomplete: 'email' })}
    </div>
    <div class="form-actions"><button class="btn" type="submit" data-label="${esc(m.find)}" data-busy="${esc(t.forms.sending)}">${esc(m.find)}</button></div>
    ${formStatus()}
  </form>
</section>`;
  return { id: 'manage', title: m.title, body, noindex: true, scripts: ['/assets/js/manage.js'] };
}

export function notFound(ctx) {
  const { t, url } = ctx;
  const n = t.notFound;
  const body = `
<section class="not-found wrap">
  <p class="eyebrow num">404</p>
  <h1 class="page-title">${esc(n.title)}</h1>
  <p class="lead">${esc(n.text)}</p>
  <p><a class="btn" href="${url('home')}">${esc(n.home)}</a></p>
</section>`;
  return { id: 'notFound', title: n.title, body, noindex: true, noAlternate: true };
}
