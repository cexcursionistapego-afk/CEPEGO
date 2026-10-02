// Utilidades del navegador: textos, llamadas a la API, formularios y captcha.

export const i18n = (() => {
  try { return JSON.parse(document.getElementById('i18n')?.textContent || '{}'); } catch { return {}; }
})();

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: body ? { 'content-type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    const err = new Error(i18n.forms?.network || 'Network error');
    err.code = 'network';
    throw err;
  }
  let data = null;
  try { data = await res.json(); } catch { /* respuesta no JSON */ }
  if (!res.ok || !data || data.ok === false) {
    const err = new Error(data?.message || i18n.forms?.error || 'Error');
    err.status = res.status;
    err.code = data?.error || 'http';
    err.field = data?.field;
    throw err;
  }
  return data;
}

let publicData;
export function getPublic() {
  publicData ||= api('/api/public').catch((e) => { publicData = null; throw e; });
  return publicData;
}

export const fmt = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));

// ── Formularios ──────────────────────────────────────────────────────────

export function formData(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name || el.disabled) continue;
    if (el.type === 'checkbox') {
      const group = form.querySelectorAll(`input[type=checkbox][name="${el.name}"]`);
      if (group.length > 1) {
        out[el.name] ||= [];
        if (el.checked) out[el.name].push(el.value);
      } else {
        out[el.name] = el.checked;
      }
    } else if (el.type === 'radio') {
      if (el.checked) out[el.name] = el.value;
    } else if (el.tagName !== 'BUTTON') {
      out[el.name] = el.value.trim();
    }
  }
  return out;
}

function fieldOf(form, name) {
  return form.querySelector(`[data-field="${name}"]`);
}

export function setFieldError(form, name, message) {
  const field = fieldOf(form, name);
  if (!field) return false;
  field.classList.add('has-error');
  const p = field.querySelector('.field-error');
  if (p) { p.textContent = message; p.hidden = false; }
  const input = field.querySelector('input, textarea, select');
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    if (p) { p.id ||= `${input.id || name}-err`; input.setAttribute('aria-describedby', p.id); }
  }
  return true;
}

export function clearErrors(form) {
  form.querySelectorAll('.has-error').forEach((f) => f.classList.remove('has-error'));
  form.querySelectorAll('.field-error').forEach((p) => { p.hidden = true; p.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach((i) => i.removeAttribute('aria-invalid'));
  setStatus(form, '');
}

export function validate(form) {
  clearErrors(form);
  let first = null;
  for (const el of form.querySelectorAll('input, textarea, select')) {
    if (!el.name || el.closest('.hp') || el.checkValidity()) continue;
    const msg = el.validity.valueMissing ? i18n.forms.required : el.validationMessage;
    setFieldError(form, el.name, msg);
    first ||= el;
  }
  if (first) first.focus();
  return !first;
}

/** Borra el aviso de error de un campo en cuanto se corrige. */
export function liveClear(form) {
  const clear = (e) => {
    const field = e.target.closest('.field');
    if (!field?.classList.contains('has-error')) return;
    field.classList.remove('has-error');
    const p = field.querySelector('.field-error');
    if (p) p.hidden = true;
    e.target.removeAttribute('aria-invalid');
  };
  form.addEventListener('input', clear);
  form.addEventListener('change', clear);
}

export function setStatus(form, message, kind = '') {
  const p = form.querySelector(':scope > .form-status') || form.querySelector('.form-status');
  if (!p) return;
  p.textContent = message;
  p.hidden = !message;
  p.classList.toggle('is-error', kind === 'error');
  p.classList.toggle('is-ok', kind === 'ok');
}

export function setBusy(button, busy) {
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? button.dataset.busy : button.dataset.label;
}

export function showApiError(form, err) {
  if (err.field && setFieldError(form, err.field, err.message)) {
    fieldOf(form, err.field)?.querySelector('input, textarea, select')?.focus();
    return;
  }
  setStatus(form, err.message || i18n.forms.error, 'error');
}

// ── Cloudflare Turnstile (solo si está configurado en el servidor) ─────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function mountCaptcha(form) {
  const box = form.querySelector('[data-captcha]');
  if (!box) return;
  let key;
  try { key = (await getPublic()).config.turnstileSiteKey; } catch { return; }
  if (!key) return;
  await loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit');
  const wait = () => (window.turnstile ? Promise.resolve() : new Promise((r) => setTimeout(() => r(wait()), 50)));
  await wait();
  box.hidden = false;
  const id = window.turnstile.render(box, { sitekey: key, language: i18n.lang, theme: document.documentElement.dataset.theme === 'night' ? 'dark' : 'light' });
  form.captcha = () => window.turnstile.getResponse(id);
  form.captchaReset = () => window.turnstile.reset(id);
}
