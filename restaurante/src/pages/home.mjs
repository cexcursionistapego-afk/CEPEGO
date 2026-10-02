import { esc, nobr, menuCardsHTML, hoursBlock, menusHash } from '../assets/js/render.mjs';
import { plateSVG } from '../assets/js/plate.mjs';
import { sectionHead, producersList } from './ui.mjs';

export default function home(ctx) {
  const { t, site, url, lang, cfg } = ctx;
  const h = t.home;
  const letters = [...site.name].map((c, i) => `<span style="--i:${i}">${esc(c)}</span>`).join('');
  const a = site.address;

  const body = `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-plate" aria-hidden="true">${plateSVG('hero · tomate, azafrán, hinojo', { type: 2 })}</div>
  <div class="wrap hero-inner">
    <p class="hero-meta eyebrow">${h.meta.map((m) => `<span>${esc(m)}</span>`).join('')}</p>
    <h1 class="hero-title" id="hero-title"><span class="sr-only">${esc(site.name)} — ${esc(h.title)}</span><span class="hero-word" aria-hidden="true">${letters}</span></h1>
    <div class="hero-foot">
      <p class="hero-lede">${nobr(h.lede)}</p>
      <div class="hero-actions">
        <a class="btn btn-lg" href="${url('booking')}">${esc(h.cta)}</a>
        <a class="live" href="${url('booking')}" data-live aria-live="polite"><span class="live-dot" aria-hidden="true"></span><span data-live-text>${esc(t.live.loading)}</span></a>
      </div>
    </div>
  </div>
</section>

<section class="section manifesto" aria-label="${esc(h.manifestoEyebrow)}">
  <div class="wrap">
    ${sectionHead(h.manifestoEyebrow, '')}
    <div class="manifesto-body">
      <p class="manifesto-text" data-reveal>${h.manifesto}</p>
      <a class="link-arrow" href="${url('philosophy')}" data-reveal>${esc(h.manifestoLink)}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="menus-title">
  <div class="wrap">
    ${sectionHead(h.menusEyebrow, `<span id="menus-title">${esc(h.menusTitle)}</span>`)}
    <div class="menu-cards" data-menu-cards data-hash="${menusHash(cfg.menus)}">${menuCardsHTML(cfg.menus, lang, { menus: url('menus') })}</div>
    <p class="section-more"><a class="link-arrow" href="${url('menus')}">${esc(h.menusLink)}</a></p>
  </div>
</section>

<section class="section chef" aria-label="${esc(h.chefEyebrow)}">
  <div class="wrap">
    ${sectionHead(h.chefEyebrow, '')}
    <div class="chef-intro" data-reveal>
      <h2 class="chef-intro-name">${esc(site.chef)}</h2>
      <div>
        <p class="eyebrow">${esc(h.chefRole)}</p>
        <p class="chef-intro-text">${nobr(t.philosophy.chefBio)}</p>
        <a class="link-arrow" href="${url('philosophy')}">${esc(h.manifestoLink)}</a>
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="producers-title">
  <div class="wrap">
    ${sectionHead(h.producersEyebrow, `<span id="producers-title">${esc(h.producersTitle)}</span>`)}
    ${producersList(t.producers)}
  </div>
</section>

<section class="section visit" aria-labelledby="visit-title">
  <div class="wrap">
    ${sectionHead(h.visitEyebrow, '')}
    <div class="visit-grid">
      <h2 class="visit-title" id="visit-title" data-reveal>${h.visitTitle}</h2>
      <div class="visit-info" data-reveal>
        <p>${nobr(h.visitText)}</p>
        <div class="visit-cols">
          <address>${esc(a.street)}<br>${esc(a.postalCode)} ${esc(a.city)}</address>
          ${hoursBlock(cfg.services, lang, t.footer.closed)}
        </div>
        <a class="btn btn-lg" href="${url('booking')}">${esc(h.cta)}</a>
      </div>
    </div>
  </div>
</section>`;

  return { id: 'home', title: h.title, body, jsonld: true, scripts: [] };
}
