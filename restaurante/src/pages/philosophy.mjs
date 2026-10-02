import { esc, nobr } from '../assets/js/render.mjs';
import { floorPlanSVG } from '../assets/js/plate.mjs';
import { producersList } from './ui.mjs';

export default function philosophy(ctx) {
  const { t, site, lang } = ctx;
  const p = t.philosophy;
  const body = `
<header class="page-head wrap">
  <p class="eyebrow">${esc(site.tagline[lang])}</p>
  <h1 class="page-title">${esc(p.title)}</h1>
  <p class="lead page-lead">${nobr(p.lead)}</p>
</header>

<section class="section" aria-label="${esc(p.title)}">
  <div class="wrap pillars">
    ${p.pillars.map(([title, text]) => `
    <article class="pillar" data-reveal>
      <h2 class="pillar-title">${esc(title)}</h2>
      <p>${esc(text)}</p>
    </article>`).join('')}
  </div>
</section>

<section class="section split" aria-labelledby="chef-title">
  <div class="wrap split-grid">
    <div data-reveal>
      <p class="eyebrow">${esc(p.chefTitle)}</p>
      <h2 class="section-title" id="chef-title">${esc(site.chef)}</h2>
    </div>
    <div data-reveal>
      <p class="lead">${esc(p.chefBio)}</p>
      <blockquote class="pull"><p>${esc(t.home.quote)}</p></blockquote>
    </div>
  </div>
</section>

<section class="section split" aria-labelledby="room-title">
  <div class="wrap split-grid">
    <div data-reveal>
      <p class="eyebrow">${esc(p.roomTitle)}</p>
      <h2 class="section-title" id="room-title">24</h2>
      <p>${esc(p.roomText)}</p>
    </div>
    <figure class="plan-figure" data-reveal data-draw>${floorPlanSVG({ label: t.events.planLabel, kitchen: t.philosophy.kitchen })}</figure>
  </div>
</section>

<section class="section" aria-labelledby="team-title">
  <div class="wrap split-grid">
    <h2 class="eyebrow" id="team-title">${esc(p.teamTitle)}</h2>
    <ul class="team">${p.team.map(([area, name, role]) => `<li data-reveal><span class="muted">${esc(area)}</span><span class="team-name">${esc(name)}</span><span>${esc(role)}</span></li>`).join('')}</ul>
  </div>
</section>

<section class="section" aria-labelledby="prod-title">
  <div class="wrap split-grid">
    <h2 class="eyebrow" id="prod-title">${esc(p.producersTitle)}</h2>
    ${producersList(t.producers)}
  </div>
</section>`;
  return { id: 'philosophy', title: p.title, description: p.lead, body };
}
