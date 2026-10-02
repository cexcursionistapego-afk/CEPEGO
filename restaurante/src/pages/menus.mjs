import { esc, nobr, menuDetailHTML, menusHash } from '../assets/js/render.mjs';

export default function menus(ctx) {
  const { t, url, lang, cfg, season } = ctx;
  const m = t.menus;
  const body = `
<header class="page-head wrap">
  <p class="eyebrow">${esc(season)}</p>
  <h1 class="page-title">${esc(m.title)}</h1>
  <p class="lead page-lead">${nobr(m.lead)}</p>
  <p class="score-hint muted">${esc(m.hint)}</p>
</header>
<div class="wrap" data-menu-detail data-hash="${menusHash(cfg.menus)}">
  ${menuDetailHTML(cfg.menus, lang, { booking: url('booking') })}
</div>
<section class="section notes" aria-labelledby="notes-title">
  <div class="wrap notes-grid">
    <h2 class="eyebrow" id="notes-title">${esc(m.notesTitle)}</h2>
    <ul class="notes-list">${m.notes.map((n) => `<li data-reveal>${esc(n)}</li>`).join('')}</ul>
    <p class="muted small notes-illustration">${esc(m.illustration)}</p>
  </div>
</section>`;
  return { id: 'menus', title: m.title, description: m.lead, body, jsonld: true, scripts: ['/assets/js/menus.js'] };
}
