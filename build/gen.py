#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Generador del sitio CEPEGO — rediseño editorial (VA + ES)
import os, json
OUT="/home/user/CEPEGO"
SITE_URL="https://cepego.com"

# ---------- enllaços externs reals ----------
ALTA  = "https://airtable.com/appkuKVxHSMyDElfh/shrePFFh2FtSgKhAY"
BAIXA = "https://airtable.com/appkuKVxHSMyDElfh/shrZGPPFiEixpHQ62"
RESERVA = "https://airtable.com/appkuKVxHSMyDElfh/pagsRVRH1Oa9zgKka/form"
GCAL = ("https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff"
        "&ctz=Europe%2FMadrid&mode=MONTH&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
        "&src=NWxxOWptcDJva3Z1YjVkOTZjMGxlcDNhZThAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23B4121B")
METEO = "https://www.avamet.org/mxo-i.php?id=c30m135e02"
METEO_PEGO = "https://www.avamet.org/mxo-i.php?id=c30m102e14"
IG = "https://www.instagram.com/refugifiguereta"
FB = "https://www.facebook.com/share/17fdDSFxDx"
FEMECV="https://www.femecv.com/va"; AJPEGO="https://www.pego.org/"; PIV="https://www.pegoilesvalls.es/"

ORG_JSONLD = json.dumps({
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "Centre Excursionista de Pego",
    "alternateName": "CEPEGO",
    "url": SITE_URL + "/",
    "logo": SITE_URL + "/img/favicon.png",
    "foundingDate": "1973",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Carrer del Llavador, 83",
        "addressLocality": "Pego",
        "postalCode": "03780",
        "addressRegion": "Alacant",
        "addressCountry": "ES"
    },
    "email": "cexcursionistapego@gmail.com",
    "sameAs": [IG, FB]
}, ensure_ascii=False)

IMG="/img/"
HERO_BENCS = IMG+"bb9bb0_fa8879e4ce8d4035b0588d0d1be17435~mv2.jpeg"
L1 = IMG+"bb9bb0_215ca88e66b746a4bb297d1714c6ccc1~mv2_d_2048_1371_s_2.jpg"
L2 = IMG+"bb9bb0_83fc4a39cac54e4086907766e7327e78~mv2_d_2048_1371_s_2.jpg"
CREST = IMG+"escut-cepego.png"
CREST_BW = IMG+"bb9bb0_adf7f0669ac24f07b323f93d8f79508e~mv2.png"

REFUGI=[IMG+x for x in [
 "bb9bb0_b04771a1130c4e5e90a119181141fb72~mv2.jpg","cuina-figuereta.jpg",
 "bb9bb0_3e06a8681970407a9a99439169cba9c3~mv2.jpg","bb9bb0_0264650fe7984448ac9dad7857dca807~mv2.jpg",
 "bb9bb0_a0e563ab5d99450ea75f1ee2d1973540~mv2.jpg","bb9bb0_e907fb62c0034175905798bce3ea432c~mv2.jpg",
 "sala-estar-figuereta.jpg","bb9bb0_497dab15c5f64b25bc3e35359d3c0a54~mv2.jpg",
 "dormitori-figuereta.jpg","bb9bb0_80c717276f16429da7a2ff0aee4b2bc5~mv2.jpg",
 "bb9bb0_2d45b0eab4794a76a9c22e3e3b9c7155~mv2.jpeg","bb9bb0_dd4b5c48aab64d6fa0f2f034dfbaf7e1~mv2.jpeg",
 "bb9bb0_83fc4a39cac54e4086907766e7327e78~mv2_d_2048_1371_s_2.jpg"]]

NAV=[("index.html",'<span class="va">Inici</span><span class="es">Inicio</span>',"inici"),
 ("__figuereta__","La Figuereta","fig"),
 ("__activitats__",'<span class="va">Activitats</span><span class="es">Actividades</span>',"act"),
 ("calendari.html",'<span class="va">Calendari</span><span class="es">Calendario</span>',"calendari"),
 ("contacte.html",'<span class="va">Contacte</span><span class="es">Contacto</span>',"contacte")]

FIG_SUB=[("refugi.html","La Figuereta",'<span class="va">El refugi de muntanya</span><span class="es">El refugio de montaña</span>',"refugi"),
 ("reservar.html","Reservar",'<span class="va">Disponibilitat i reserva</span><span class="es">Disponibilidad y reserva</span>',"reservar")]
ACT_SUB=[("rutes.html",'<span class="va">Rutes i entorn</span><span class="es">Rutas y entorno</span>','<span class="va">Senderisme per Pego i les Valls</span><span class="es">Senderismo por Pego y sus valles</span>',"rutes"),
 ("escalada.html","Escalada",'<span class="va">Escola del Barranc de les Coves</span><span class="es">Escuela del Barranc de les Coves</span>',"escalada")]

def header(active):
    fig_open   = active in ("refugi","reservar")
    act_open   = active in ("rutes","escalada")
    meteo_ac   = ' active' if active=='meteo' else ''
    soci_ac=' active' if active=='soci' else ''
    def sub(items):
        r=""
        for href,label,desc,key in items:
            ac=' active' if key==active else ''
            r+=f'          <a href="{href}" class="{ac.strip()}"><b>{label}</b><span class="desc">{desc}</span></a>\n'
        return r
    figcls  =' active' if fig_open   else ''
    actcls  =' active' if act_open   else ''
    inici_ac=' active' if active=='inici' else ''
    cal_ac  =' active' if active=='calendari' else ''
    con_ac  =' active' if active=='contacte' else ''
    return f'''<header class="site-header" id="hdr">
  <div class="wrap">
    <a class="brand" href="index.html">
      <img src="{IMG}favicon.png" alt="Escut CEPEGO">
      <span class="brand__text">
        <span class="brand__name">Centre Excursionista de Pego</span>
        <span class="brand__sub">Des de 1973</span>
      </span>
    </a>
    <nav class="nav" aria-label="Menú">
      <a href="index.html" class="{inici_ac.strip()}"><span class="va">Inici</span><span class="es">Inicio</span></a>
      <div class="nav-group">
        <a href="refugi.html" class="nav-parent{figcls}">La Figuereta <i class="caret"></i></a>
        <div class="nav-sub">
{sub(FIG_SUB)}        </div>
      </div>
      <div class="nav-group">
        <a href="rutes.html" class="nav-parent{actcls}"><span class="va">Activitats</span><span class="es">Actividades</span> <i class="caret"></i></a>
        <div class="nav-sub">
{sub(ACT_SUB)}        </div>
      </div>
      <a href="meteo.html" class="{meteo_ac.strip()}"><span class="va">Meteo</span><span class="es">Meteo</span></a>
      <a href="calendari.html" class="{cal_ac.strip()}"><span class="va">Calendari</span><span class="es">Calendario</span></a>
      <a href="contacte.html" class="{con_ac.strip()}"><span class="va">Contacte</span><span class="es">Contacto</span></a>
      <a href="soci.html" class="soci-link{soci_ac}"><span class="va">Racó del soci</span><span class="es">Área del socio</span></a>
      <button class="lang-btn" data-lang-btn type="button">ES</button>
    </nav>
    <button class="nav-toggle" aria-label="Menú" type="button">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
  </div>
</header>'''

IG_SVG='<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.17.4.37 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.2-.25 1.8-.42 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.17-1 .37-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.05-1.8-.25-2.2-.42-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.17-.4-.37-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.2.25-1.8.42-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.17 1-.37 2.2-.42C8.4 2.2 8.8 2.2 12 2.2m0 2.16c-3.14 0-3.5.01-4.74.07-.9.04-1.38.2-1.7.32-.43.17-.74.36-1.06.68-.32.32-.51.63-.68 1.06-.12.32-.28.8-.32 1.7-.06 1.24-.07 1.6-.07 4.74s.01 3.5.07 4.74c.04.9.2 1.38.32 1.7.17.43.36.74.68 1.06.32.32.63.51 1.06.68.32.12.8.28 1.7.32 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.38-.2 1.7-.32.43-.17.74-.36 1.06-.68.32-.32.51-.63.68-1.06.12-.32.28-.8.32-1.7.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.2-1.38-.32-1.7a2.86 2.86 0 0 0-.68-1.06 2.86 2.86 0 0 0-1.06-.68c-.32-.12-.8-.28-1.7-.32-1.24-.06-1.6-.07-4.74-.07m0 3.67a4.97 4.97 0 1 1 0 9.94 4.97 4.97 0 0 1 0-9.94m0 8.2a3.23 3.23 0 1 0 0-6.46 3.23 3.23 0 0 0 0 6.46m6.34-8.42a1.16 1.16 0 1 1-2.32 0 1.16 1.16 0 0 1 2.32 0"/></svg>'
FB_SVG='<svg viewBox="0 0 24 24"><path d="M24 12a12 12 0 1 0-13.87 11.85v-8.38H7.08V12h3.05V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95H15.8c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12"/></svg>'
MAIL_SVG='<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1m1.4 2 7.6 5.3L19.6 7zM4 8.5V17h16V8.5l-8 5.6z"/></svg>'

def footer():
    return f'''<div class="prefooter">
  <div class="wrap">
    <div class="prefooter__text">
      <div class="kicker"><span class="va">Uneix-te a nosaltres</span><span class="es">Únete a nosotros</span></div>
      <h2><span class="va">Vine a la muntanya<br>amb el CEPEGO</span><span class="es">Ven a la montaña<br>con el CEPEGO</span></h2>
      <p><span class="va">Fes-te soci per 35 €/any i gaudeix de totes les activitats, descomptes al refugi i la comunitat del club.</span><span class="es">Hazte socio por 35 €/año y disfruta de todas las actividades, descuentos en el refugio y la comunidad del club.</span></p>
    </div>
    <div class="prefooter__cta">
      <a href="soci.html" class="btn btn-primary"><span class="va">Alta de soci</span><span class="es">Alta de socio</span></a>
      <a href="contacte.html" class="btn btn-ghost"><span class="va">Contacta'ns</span><span class="es">Contáctanos</span></a>
    </div>
  </div>
</div>
<footer class="footer">
  <div class="wrap">
    <!-- Brand strip centrat -->
    <div class="footer__head">
      <img class="logo" src="{IMG}favicon-footer.png" alt="Escut CEPEGO">
      <div class="footer__name">Centre Excursionista<span>de Pego</span><small>Des de 1973 · Pego, Alacant</small></div>
      <p class="footer__tagline"><span class="va">Club de muntanya sense ànim de lucre. Senderisme, escalada, barranquisme, espeleologia i alta muntanya des de Pego, Alacant.</span><span class="es">Club de montaña sin ánimo de lucro. Senderismo, escalada, barranquismo, espeleología y alta montaña desde Pego, Alicante.</span></p>
      <div class="social">
        <a href="{IG}" target="_blank" rel="noopener" aria-label="Instagram">{IG_SVG}</a>
        <a href="{FB}" target="_blank" rel="noopener" aria-label="Facebook">{FB_SVG}</a>
        <a data-cms-href="email" href="mailto:cexcursionistapego@gmail.com" aria-label="Correu">{MAIL_SVG}</a>
      </div>
    </div>
    <!-- 3 columns -->
    <div class="footer__grid">
      <div>
        <h4><span class="va">Activitats</span><span class="es">Actividades</span></h4>
        <ul>
          <li><a href="rutes.html"><span class="va">Senderisme i rutes</span><span class="es">Senderismo y rutas</span></a></li>
          <li><a href="escalada.html">Escalada</a></li>
          <li><a href="espeleo.html">Espeleologia</a></li>
          <li><a href="barrancs.html"><span class="va">Barrancs</span><span class="es">Barrancos</span></a></li>
          <li><a href="calendari.html"><span class="va">Calendari d'activitats</span><span class="es">Calendario de actividades</span></a></li>
        </ul>
      </div>
      <div>
        <h4>La Figuereta</h4>
        <ul>
          <li><a href="refugi.html"><span class="va">El refugi</span><span class="es">El refugio</span></a></li>
          <li><a href="reservar.html"><span class="va">Disponibilitat i reserva</span><span class="es">Disponibilidad y reserva</span></a></li>
          <li><a href="meteo.html"><span class="va">El temps al refugi</span><span class="es">El tiempo en el refugio</span></a></li>
        </ul>
      </div>
      <div>
        <h4><span class="va">Contacte</span><span class="es">Contacto</span></h4>
        <ul class="footer__contact">
          <li><span class="ic">📍</span><span><span class="va">Carrer del Llavador, 83</span><span class="es">Calle del Lavadero, 83</span><br>03780 Pego</span></li>
          <li><span class="ic">✉️</span><a data-cms-href="email" href="mailto:cexcursionistapego@gmail.com"><span data-cms="email">cexcursionistapego@gmail.com</span></a></li>
          <li><span class="ic">📷</span><a href="{IG}" target="_blank" rel="noopener">@refugifiguereta</a></li>
        </ul>
      </div>
    </div>
    <!-- Partners -->
    <div class="footer__partners">
      <div class="footer__partners-label"><span class="va">Amb el suport de</span><span class="es">Con el apoyo de</span></div>
      <div class="footer__partners-logos">
        <a href="{FEMECV}" target="_blank" rel="noopener" class="partner-card"><img src="{IMG}bb9bb0_7802a963683f424da28ee87c97bdaa72~mv2.png" alt="FEMECV"></a>
        <a href="{AJPEGO}" target="_blank" rel="noopener" class="partner-card"><img src="{IMG}bb9bb0_9fc7a34e8e324d0fb392ad3102b3900a~mv2.png" alt="Ajuntament de Pego"></a>
      </div>
    </div>
    <!-- Copyright bar -->
    <div class="footer__bar">
      <span>© <span data-year></span> Centre Excursionista de Pego</span>
      <span class="footer__legal-links">
        <a href="avis-legal.html"><span class="va">Avís legal</span><span class="es">Aviso legal</span></a> ·
        <a href="privacitat.html"><span class="va">Privacitat</span><span class="es">Privacidad</span></a> ·
        <a href="cookies.html">Cookies</a>
      </span>
      <span><span class="va">Fet amb estima a la muntanya</span><span class="es">Hecho con cariño a la montaña</span></span>
    </div>
  </div>
</footer>'''

def doc(title, desc, body, path="", identity=False, extra_js=None, image=None):
    idw='<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>\n' if identity else ''
    idredirect=('<script>if(window.netlifyIdentity){window.netlifyIdentity.on("init",function(u){if(!u){window.netlifyIdentity.on("login",function(){document.location.href="/admin/";});}});}</script>\n' if identity else '')
    extra_js_list = [extra_js] if isinstance(extra_js, str) else (extra_js or [])
    extra_js_tags = "".join(f'<script src="/{s.lstrip(chr(47))}"></script>\n' for s in extra_js_list)
    canon = SITE_URL + "/" + (path if (path and path != "index.html") else "")
    img_url = SITE_URL + (image or HERO_BENCS)
    return f'''<!DOCTYPE html>
<html lang="ca-valencia" data-lang="va">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canon}">
<link rel="icon" type="image/png" href="{IMG}favicon.png">
<link rel="apple-touch-icon" href="{IMG}favicon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Centre Excursionista de Pego">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{img_url}">
<meta property="og:locale" content="ca_ES">
<meta property="og:locale:alternate" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{img_url}">
<script type="application/ld+json">{ORG_JSONLD}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
{idw}</head>
<body>
<div id="avis"></div>
{body}
<script src="/js/main.js"></script>
{extra_js_tags}{idredirect}</body>
</html>
'''

def subhero(bg, kicker, h1va, h1es, pva, pes, pos='center'):
    return f'''<section class="subhero">
  <div class="subhero__bg" style="background-image:url('{bg}');background-position:center {pos}"></div>
  <div class="subhero__scrim"></div>
  <div class="wrap subhero__inner">
    <div class="kicker on-photo">{kicker}</div>
    <h1><span class="va">{h1va}</span><span class="es">{h1es}</span></h1>
    <p><span class="va">{pva}</span><span class="es">{pes}</span></p>
  </div>
</section>'''

def write(fn, html):
    # ---- URL-based idioma: es-net-generate una còpia en /es/ a partir de la
    # mateixa font (ambdós idiomes ja estan al HTML; CSS mostra un o altre
    # segons data-lang). Manté canonical, hreflang i og:locale correctes per còpia.
    canon_va = SITE_URL + "/" + (fn if fn != "index.html" else "")
    canon_es = SITE_URL + "/es/" + (fn if fn != "index.html" else "")
    canon_tag_va = f'<link rel="canonical" href="{canon_va}">'
    hreflang_block = (
        f'<link rel="alternate" hreflang="ca" href="{canon_va}">\n'
        f'<link rel="alternate" hreflang="es" href="{canon_es}">\n'
        f'<link rel="alternate" hreflang="x-default" href="{canon_va}">'
    )
    html = html.replace(canon_tag_va, canon_tag_va + "\n" + hreflang_block, 1)

    open(os.path.join(OUT,fn),"w",encoding="utf-8").write(html)
    print("·",fn,f"{len(html)//1024}KB")

    es_html = (html
        .replace('<html lang="ca-valencia" data-lang="va">', '<html lang="es" data-lang="es">', 1)
        .replace(canon_tag_va, f'<link rel="canonical" href="{canon_es}">', 1)
        .replace(f'<meta property="og:url" content="{canon_va}">', f'<meta property="og:url" content="{canon_es}">', 1)
        .replace('<meta property="og:locale" content="ca_ES">\n<meta property="og:locale:alternate" content="es_ES">',
                  '<meta property="og:locale" content="es_ES">\n<meta property="og:locale:alternate" content="ca_ES">', 1)
    )
    es_dir = os.path.join(OUT,"es")
    os.makedirs(es_dir, exist_ok=True)
    open(os.path.join(es_dir,fn),"w",encoding="utf-8").write(es_html)

# ======================================================= build pages in a separate module
import pages
pages.build(globals())

# ======================================================= robots.txt + sitemap.xml
PAGES = ["index.html","refugi.html","reservar.html","meteo.html",
    "rutes.html","escalada.html","espeleo.html","barrancs.html","calendari.html",
    "contacte.html","soci.html","avis-legal.html","privacitat.html","cookies.html"]

open(os.path.join(OUT,"robots.txt"),"w",encoding="utf-8").write(
    "User-agent: *\nAllow: /\nSitemap: "+SITE_URL+"/sitemap.xml\n")

from datetime import date
today = date.today().isoformat()
PRIORITY = {
    "index.html":("1.0","weekly"), "reservar.html":("0.9","weekly"), "refugi.html":("0.8","monthly"),
    "meteo.html":("0.8","daily"), "calendari.html":("0.7","weekly"),
    "rutes.html":("0.6","monthly"), "escalada.html":("0.6","monthly"),
    "espeleo.html":("0.6","monthly"), "barrancs.html":("0.6","monthly"),
    "contacte.html":("0.5","yearly"), "soci.html":("0.5","monthly"),
    "avis-legal.html":("0.1","yearly"), "privacitat.html":("0.1","yearly"), "cookies.html":("0.1","yearly"),
}
def _locs(p):
    slug = "" if p=="index.html" else p
    return SITE_URL+"/"+slug, SITE_URL+"/es/"+slug
def _url_entry(loc, p):
    loc_va, loc_es = _locs(p)
    alts = (f'<xhtml:link rel="alternate" hreflang="ca" href="{loc_va}"/>'
            f'<xhtml:link rel="alternate" hreflang="es" href="{loc_es}"/>'
            f'<xhtml:link rel="alternate" hreflang="x-default" href="{loc_va}"/>')
    return (f'  <url><loc>{loc}</loc>{alts}<lastmod>{today}</lastmod>'
            f'<changefreq>{PRIORITY[p][1]}</changefreq><priority>{PRIORITY[p][0]}</priority></url>\n')
urls = "".join(_url_entry(loc, p) for p in PAGES for loc in _locs(p))
open(os.path.join(OUT,"sitemap.xml"),"w",encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + urls + '</urlset>\n')

print("OK")
