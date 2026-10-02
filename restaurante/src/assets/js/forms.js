// Formularios de eventos privados, tarjeta regalo y contacto.

import { i18n, api, formData, validate, setBusy, setStatus, showApiError, mountCaptcha, clearErrors, liveClear } from './api.mjs';
import { price } from './render.mjs';

function giftPreview(form) {
  const menus = JSON.parse(document.getElementById('gift-menus')?.textContent || '[]');
  const card = document.querySelector('[data-gift-card]');
  const lang = i18n.lang;
  const sel = (n) => form.elements[n];
  const out = form.querySelector('[data-gift-amount]');

  function fillPairings(menu) {
    const current = sel('pairing').value;
    sel('pairing').innerHTML = `<option value="">${i18n.gift.noPairing}</option>` +
      (menu?.pairing || []).map((p) => `<option value="${p.id}">${p.name[lang] || p.name.es} · +${price(p.price, lang)}</option>`).join('');
    if ([...sel('pairing').options].some((o) => o.value === current)) sel('pairing').value = current;
  }

  function update() {
    const menu = menus.find((m) => m.id === sel('menu').value) || menus[0];
    const pairing = menu?.pairing.find((p) => p.id === sel('pairing').value);
    const guests = Math.min(Math.max(Number.parseInt(sel('guests').value, 10) || 0, 0), 12);
    const total = menu ? (menu.price + (pairing?.price || 0)) * guests : 0;
    out.textContent = total ? price(total, lang) : '—';
    sel('amount').value = String(total || '');
    if (card) {
      card.querySelector('[data-gift-to]').textContent = sel('recipient').value.trim() || '—';
      card.querySelector('[data-gift-menu]').textContent = menu ? `${menu.name[lang] || menu.name.es}${pairing ? ' + ' + (pairing.name[lang] || pairing.name.es).toLowerCase() : ''}` : '';
      card.querySelector('[data-gift-total]').textContent = total ? ` · ${price(total, lang)}` : '';
    }
  }

  sel('menu').addEventListener('change', () => { fillPairings(menus.find((m) => m.id === sel('menu').value)); update(); });
  ['pairing', 'guests', 'recipient'].forEach((n) => sel(n).addEventListener('input', update));
  update();
}

document.querySelectorAll('[data-request-form]').forEach((form) => {
  const type = form.dataset.requestForm;
  if (type === 'regalo') giftPreview(form);
  mountCaptcha(form).catch(() => {});

  liveClear(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const button = form.querySelector('button[type=submit]');
    const body = { ...formData(form), type, lang: i18n.lang, captcha: form.captcha?.() };
    setBusy(button, true);
    try {
      await api('/api/requests', { method: 'POST', body });
      clearErrors(form);
      form.querySelectorAll('.field, .form-row, .form-actions, .form-sub, .captcha').forEach((el) => { el.hidden = true; });
      setStatus(form, type === 'regalo' ? i18n.forms.sentGift : i18n.forms.sent, 'ok');
      form.querySelector('.form-status').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      showApiError(form, err);
      form.captchaReset?.();
    } finally {
      setBusy(button, false);
    }
  });
});
