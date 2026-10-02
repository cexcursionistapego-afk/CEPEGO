// Piezas de interfaz reutilizables en las plantillas.

import { esc } from '../assets/js/render.mjs';

export function field({ name, label, type = 'text', required = false, autocomplete, attrs = '', hint = '', id, value = '' }) {
  const fid = id || `f-${name}`;
  const req = required ? ' required aria-required="true"' : '';
  const ac = autocomplete ? ` autocomplete="${autocomplete}"` : '';
  const desc = hint ? ` aria-describedby="${fid}-hint"` : '';
  const control = type === 'textarea'
    ? `<textarea id="${fid}" name="${name}" rows="3"${req}${desc} ${attrs}>${esc(value)}</textarea>`
    : `<input id="${fid}" name="${name}" type="${type}"${req}${ac}${desc} ${attrs}${value ? ` value="${esc(value)}"` : ''}>`;
  return `<div class="field" data-field="${name}">
    <label for="${fid}">${esc(label)}</label>
    ${control}
    ${hint ? `<p class="field-hint" id="${fid}-hint">${esc(hint)}</p>` : ''}
    <p class="field-error" hidden></p>
  </div>`;
}

export function select({ name, label, options, required = false, id, placeholder }) {
  const fid = id || `f-${name}`;
  const opts = options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
  return `<div class="field" data-field="${name}">
    <label for="${fid}">${esc(label)}</label>
    <div class="select"><select id="${fid}" name="${name}"${required ? ' required aria-required="true"' : ''}>${placeholder ? `<option value="">${esc(placeholder)}</option>` : ''}${opts}</select></div>
    <p class="field-error" hidden></p>
  </div>`;
}

export function check({ name, html, required = false }) {
  return `<div class="field field-check" data-field="${name}">
    <label class="check"><input type="checkbox" name="${name}" value="1"${required ? ' required aria-required="true"' : ''}><span class="check-box" aria-hidden="true"></span><span class="check-label">${html}</span></label>
    <p class="field-error" hidden></p>
  </div>`;
}

export const honeypot = () => `<div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>`;

export const captcha = () => `<div class="captcha" data-captcha hidden></div>`;

export function formStatus() {
  return `<p class="form-status" role="status" aria-live="polite" hidden></p>`;
}

export function sectionHead(eyebrow, title, extra = '') {
  return `<header class="section-head" data-reveal>
    <p class="eyebrow num">${esc(eyebrow)}</p>
    <div>${title ? `<h2 class="section-title">${title}</h2>` : ''}${extra}</div>
  </header>`;
}

export function producersList(producers, opts = {}) {
  const max = 50;
  return `<ul class="producers${opts.compact ? ' producers-compact' : ''}">${producers.map(([kind, name, dist]) => {
    const km = Number.parseFloat(dist) || 0;
    return `<li data-reveal>
      <span class="producer-kind">${esc(kind)}</span>
      <span class="producer-name">${esc(name)}</span>
      <span class="producer-dist" aria-label="${esc(dist)}"><span class="producer-bar"><span style="--d:${Math.min(1, km / max).toFixed(3)}"></span></span><span class="num">${esc(dist)}</span></span>
    </li>`;
  }).join('')}</ul>`;
}
