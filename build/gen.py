#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Generador del sitio CEPEGO — rediseño editorial (VA + ES)
import os
OUT="/home/user/CEPEGO"

# ---------- enllaços externs reals ----------
ALTA  = "https://airtable.com/appkuKVxHSMyDElfh/shrePFFh2FtSgKhAY"
BAIXA = "https://airtable.com/appkuKVxHSMyDElfh/shrZGPPFiEixpHQ62"
RESERVA = "https://airtable.com/appkuKVxHSMyDElfh/pagsRVRH1Oa9zgKka/form"
GCAL = ("https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff"
        "&ctz=Europe%2FMadrid&mode=MONTH&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0"
        "&src=NWxxOWptcDJva3Z1YjVkOTZjMGxlcDNhZThAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23B4121B")
METEO = "https://www.avamet.org/mxo_i.php?id=c30m135e02"
IG = "https://www.instagram.com/refugifiguereta"
FB = "https://www.facebook.com/share/17fdDSFxDx"
FEMECV="https://www.femecv.com/va"; AJPEGO="https://www.pego.org/"; PIV="https://www.pegoilesvalls.es/"

IMG="img/"
HERO_BENCS = IMG+"bb9bb0_fa8879e4ce8d4035b0588d0d1be17435~mv2.jpeg"
L1 = IMG+"bb9bb0_215ca88e66b746a4bb297d1714c6ccc1~mv2_d_2048_1371_s_2.jpg"
L2 = IMG+"bb9bb0_83fc4a39cac54e4086907766e7327e78~mv2_d_2048_1371_s_2.jpg"
CREST = IMG+"bb9bb0_42f6ed7c6336433e83f81bfbd39aaf56~mv2.png"
CREST_BW = IMG+"bb9bb0_adf7f0669ac24f07b323f93d8f79508e~mv2.png"

REFUGI=[IMG+x for x in [
 "bb9bb0_b04771a1130c4e5e90a119181141fb72~mv2.jpg","bb9bb0_a2ce80027c5a41e283c411a4d6aadbd8~mv2.jpg",
 "bb9bb0_3e06a8681970407a9a99439169cba9c3~mv2.jpg","bb9bb0_0264650fe7984448ac9dad7857dca807~mv2.jpg",
 "bb9bb0_a0e563ab5d99450ea75f1ee2d1973540~mv2.jpg","bb9bb0_e907fb62c0034175905798bce3ea432c~mv2.jpg",
 "bb9bb0_0e8f156719df4d38ae6c85098ec2f198~mv2.jpg","bb9bb0_497dab15c5f64b25bc3e35359d3c0a54~mv2.jpg",
 "bb9bb0_d3e335c0600a45ea91891e67cab2e858~mv2.jpg","bb9bb0_80c717276f16429da7a2ff0aee4b2bc5~mv2.jpg",
 "bb9bb0_2d45b0eab4794a76a9c22e3e3b9c7155~mv2.jpeg","bb9bb0_dd4b5c48aab64d6fa0f2f034dfbaf7e1~mv2.jpeg",
 "bb9bb0_83fc4a39cac54e4086907766e7327e78~mv2_d_2048_1371_s_2.jpg"]]

NAV=[("index.html",'<span class="va">Inici</span><span class="es">Inicio</span>',"inici"),
 ("__figuereta__","La Figuereta","fig"),
 ("__activitats__",'<span class="va">Activitats</span><span class="es">Actividades</span>',"act"),
 ("calendari.html",'<span class="va">Calendari</span><span class="es">Calendario</span>',"calendari"),
 ("contacte.html",'<span class="va">Contacte</span><span class="es">Contacto</span>',"contacte")]

FIG_SUB=[("refugi.html","La Figuereta",'<span class="va">El refugi de muntanya</span><span class="es">El refugio de montaña</span>',"refugi"),
 ("reservar.html","Reservar",'<span class="va">Disponibilitat i reserva</span><span class="es">Disponibilidad y reserva</span>',"reservar"),
 ("meteo.html",'<span class="va">El temps</span><span class="es">Meteo</span>','<span class="va">Estació al refugi</span><span class="es">Estación en el refugio</span>',"meteo")]
ACT_SUB=[("rutes.html",'<span class="va">Rutes i entorn</span><span class="es">Rutas y entorno</span>','<span class="va">Senderisme per Pego</span><span class="es">Senderismo por Pego</span>',"rutes"),
 ("escalada.html","Escalada",'<span class="va">Escola del Calvari</span><span class="es">Escuela del Calvari</span>',"escalada"),
 ("espeleo.html","Espeleologia",'<span class="va">Avencs i coves</span><span class="es">Avencos y cuevas</span>',"espeleo"),
 ("barrancs.html",'<span class="va">Barrancs</span><span class="es">Barrancos</span>','<span class="va">Descens de barrancs</span><span class="es">Descenso de barrancos</span>',"barrancs")]

def header(active):
    fig_open = active in ("refugi","reservar","meteo")
    act_open = active in ("rutes","escalada","espeleo","barrancs")
    def sub(items):
        r=""
        for href,label,desc,key in items:
            ac=' active' if key==active else ''
            r+=f'          <a href="{href}" class="{ac.strip()}"><b>{label}</b><span class="desc">{desc}</span></a>\n'
        return r
    figcls=' active' if fig_open else ''
    actcls=' active' if act_open else ''
    inici_ac=' active' if active=='inici' else ''
    cal_ac=' active' if active=='calendari' else ''
    con_ac=' active' if active=='contacte' else ''
    return f'''<header class="site-header" id="hdr">
  <div class="wrap">
    <a class="brand" href="index.html">
      <img src="{IMG}favicon.png" alt="Escut CEPEGO">
      <span><b>Centre Excursionista</b><small>Pego · 1973</small></span>
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
      <a href="calendari.html" class="{cal_ac.strip()}"><span class="va">Calendari</span><span class="es">Calendario</span></a>
      <a href="contacte.html" class="{con_ac.strip()}"><span class="va">Contacte</span><span class="es">Contacto</span></a>
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
    return f'''<footer class="footer">
  <div class="footer__top">
    <div class="wrap footer__grid">
      <div>
        <div class="footer__brand">
          <img src="{IMG}crest-white.png" alt="Escut CEPEGO">
          <span><b>Centre Excursionista<br>de Pego</b><small>Des de 1973</small></span>
        </div>
        <p class="footer__desc"><span class="va">Club de muntanya sense ànim de lucre. Senderisme, escalada, barranquisme, espeleologia i alta muntanya, amb base al refugi La Figuereta.</span><span class="es">Club de montaña sin ánimo de lucro. Senderismo, escalada, barranquismo, espeleología y alta montaña, con base en el refugio La Figuereta.</span></p>
        <div class="social">
          <a href="{IG}" target="_blank" rel="noopener" aria-label="Instagram">{IG_SVG}</a>
          <a href="{FB}" target="_blank" rel="noopener" aria-label="Facebook">{FB_SVG}</a>
          <a data-cms-href="email" href="mailto:cexcursionistapego@gmail.com" aria-label="Correu">{MAIL_SVG}</a>
        </div>
      </div>
      <div>
        <h4><span class="va">El club</span><span class="es">El club</span></h4>
        <ul>
          <li><a href="refugi.html">La Figuereta</a></li>
          <li><a href="rutes.html"><span class="va">Rutes i entorn</span><span class="es">Rutas y entorno</span></a></li>
          <li><a href="escalada.html">Escalada</a></li>
          <li><a href="espeleo.html">Espeleologia</a></li>
          <li><a href="barrancs.html"><span class="va">Barrancs</span><span class="es">Barrancos</span></a></li>
          <li><a href="calendari.html"><span class="va">Calendari</span><span class="es">Calendario</span></a></li>
        </ul>
      </div>
      <div>
        <h4><span class="va">El refugi</span><span class="es">El refugio</span></h4>
        <ul>
          <li><a href="reservar.html"><span class="va">Disponibilitat</span><span class="es">Disponibilidad</span></a></li>
          <li><a href="reservar.html"><span class="va">Reservar</span><span class="es">Reservar</span></a></li>
          <li><a href="meteo.html"><span class="va">El temps al refugi</span><span class="es">Meteo</span></a></li>
          <li><a href="{ALTA}" target="_blank" rel="noopener"><span class="va">Fes-te soci</span><span class="es">Hazte socio</span></a></li>
        </ul>
      </div>
      <div>
        <h4><span class="va">Contacte</span><span class="es">Contacto</span></h4>
        <ul>
          <li><span class="va">Carrer Llavador, s/n</span><span class="es">Calle Llavador, s/n</span><br>03780 Pego</li>
          <li><a data-cms-href="email" href="mailto:cexcursionistapego@gmail.com"><span data-cms="email">cexcursionistapego@gmail.com</span></a></li>
          <li><a data-cms-href="telefon" href="tel:686090511"><span data-cms="telefon">686 090 511</span></a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer__partners">
      <span><span class="va">Amb el suport de</span><span class="es">Con el apoyo de</span></span>
      <a href="{FEMECV}" target="_blank" rel="noopener"><img src="{IMG}bb9bb0_7802a963683f424da28ee87c97bdaa72~mv2.png" alt="FEMECV"></a>
      <a href="{AJPEGO}" target="_blank" rel="noopener"><img src="{IMG}bb9bb0_9fc7a34e8e324d0fb392ad3102b3900a~mv2.png" alt="Ajuntament de Pego"></a>
      <a href="{PIV}" target="_blank" rel="noopener"><img src="{IMG}bb9bb0_42618edbc822455d95eb8f934e2b0f13~mv2.png" alt="Pego i les Valls"></a>
      <img src="{IMG}bb9bb0_fb25ea68ebd444d79d92311d8dd0561f~mv2.png" alt="Refugi La Figuereta">
    </div>
  </div>
  <div class="wrap footer__bar">
    <span>© <span data-year></span> Centre Excursionista de Pego</span>
    <span><span class="va">Fet amb estima a la muntanya</span><span class="es">Hecho con cariño a la montaña</span></span>
  </div>
</footer>'''

def doc(title, desc, body, identity=False, extra_js=None):
    idw='<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>\n' if identity else ''
    idredirect=('<script>if(window.netlifyIdentity){window.netlifyIdentity.on("init",function(u){if(!u){window.netlifyIdentity.on("login",function(){document.location.href="/admin/";});}});}</script>\n' if identity else '')
    return f'''<!DOCTYPE html>
<html lang="ca-valencia" data-lang="va">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" type="image/png" href="{IMG}favicon.png">
<link rel="apple-touch-icon" href="{IMG}favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
{idw}</head>
<body>
<div id="avis"></div>
{body}
<script src="js/main.js"></script>
{('<script src="'+extra_js+'"></script>'+chr(10)) if extra_js else ''}{idredirect}</body>
</html>
'''

def subhero(bg, kicker, h1va, h1es, pva, pes):
    return f'''<section class="subhero">
  <div class="subhero__bg" style="background-image:url('{bg}')"></div>
  <div class="subhero__scrim"></div>
  <div class="wrap subhero__inner">
    <div class="kicker on-photo">{kicker}</div>
    <h1><span class="va">{h1va}</span><span class="es">{h1es}</span></h1>
    <p><span class="va">{pva}</span><span class="es">{pes}</span></p>
  </div>
</section>'''

def write(fn, html):
    open(os.path.join(OUT,fn),"w",encoding="utf-8").write(html)
    print("·",fn,f"{len(html)//1024}KB")

# ======================================================= build pages in a separate module
import pages
pages.build(globals())
print("OK")
