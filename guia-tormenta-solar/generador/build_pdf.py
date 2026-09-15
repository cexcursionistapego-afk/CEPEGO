# -*- coding: utf-8 -*-
"""Monta la guia en PDF A4 para imprimir.
Doble pasada: la 1a detecta en que pagina cae cada epigrafe (marcadores fuera
de flujo), la 2a numera el indice y elimina los marcadores."""
import re, os, glob, io, json, sys, unicodedata, asyncio
import markdown

B   = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(B), "consejo")
OUT = os.path.join(B, "out")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, B)
import figure

# ───────────────────────── markdown → html ─────────────────────────
CB = "☐"
DANGER = re.compile(r"\b(nunca|jam[aá]s|peligro|aviso|atenci[oó]n|advertencia|mortal|mata|"
                    r"letal|riesgo|prohibid|ilegal|regla de hierro|no lo comes)\b", re.I)
KEY    = re.compile(r"\b(conclusi[oó]n|clave|recuerda|resumen|lo importante|regla|premisa|"
                    r"principio|en una l[ií]nea)\b", re.I)

def sev(t):
    h = re.sub(r"<[^>]+>", " ", t)[:190]
    if DANGER.search(h): return "danger"
    if KEY.search(h):    return "key"
    return "note"

def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[\s_-]+", "-", re.sub(r"[^\w\s-]", "", t).strip().lower())

def pre(md):
    md = re.sub(r"^(\s*)[-*]\s+\[[ xX]\]\s+", r"\1- " + CB + " ", md, flags=re.M)
    return md

def post(h, n):
    # Tablas: las cortas no se parten nunca; las largas se parten con cabecera repetida
    def wrap_table(m):
        tbl = m.group(0)
        rows = tbl.count("<tr>")
        cls = "tw tw--keep" if rows <= 14 else "tw tw--split"
        return '<div class="%s">%s</div>' % (cls, tbl)
    h = re.sub(r"<table>.*?</table>", wrap_table, h, flags=re.S)
    # casillas imprimibles
    h = re.sub(r"<li>\s*" + CB + r"\s*", '<li class="ck"><span class="box"></span><span>', h)
    h = re.sub(r'(<li class="ck">.*?)</li>', lambda m: m.group(1) + "</span></li>", h, flags=re.S)
    h = re.sub(r"<ul>\s*(?=<li class=\"ck\")", '<ul class="checklist">', h)
    # avisos
    h = re.sub(r"<blockquote>(.*?)</blockquote>",
               lambda m: f'<aside class="callout callout--{sev(m.group(1))}">{m.group(1)}</aside>',
               h, flags=re.S)
    # anclas + marcadores de pagina
    sub = [0]
    def hd(m):
        lvl, txt = m.group(1), m.group(3)
        bare = re.sub(r"<[^>]+>", "", txt)
        if lvl == "3":
            sub[0] += 1
            mk = f'<span class="pmk">PMK{n}S{sub[0]}Z</span>'
        else:
            mk = f'<span class="pmk">PMK{n}S0Z</span>'
        return f'<h{lvl} id="{slug(bare)}">{mk}{txt}</h{lvl}>'
    h = re.sub(r"<h([23])([^>]*)>(.*?)</h\1>", hd, h, flags=re.S)
    return h

PMK_SPAN = re.compile(r'<span class="pmk">[^<]*</span>')

def plain(x):
    """Texto limpio de un titular: fuera marcador, fuera etiquetas."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", PMK_SPAN.sub("", x))).strip()

def sections():
    md = markdown.Markdown(extensions=["tables", "attr_list", "sane_lists"])
    out, toc = [], []
    for i, p in enumerate(sorted(glob.glob(os.path.join(SRC, "0*.md"))), start=1):
        md.reset()
        h = post(md.convert(pre(io.open(p, encoding="utf-8").read())), i)
        m = re.search(r"<h2[^>]*>(.*?)</h2>", h, flags=re.S)
        title = plain(m.group(1)) if m else f"Seccion {i}"
        title = re.sub(r"^\s*\d+\.\s*", "", title).strip()
        h = re.sub(r"<h2[^>]*>.*?</h2>",
                   f'<div class="sec-head"><span class="sec-num">{i:02d}</span>'
                   f'<h2><span class="pmk">PMK{i}S0Z</span>{title}</h2></div>',
                   h, count=1, flags=re.S)
        subs = [plain(t) for t in re.findall(r"<h3[^>]*>(.*?)</h3>", h, flags=re.S)]
        toc.append({"n": i, "title": title, "subs": subs})
        h = h.replace("<p>%FIG_ZONAVITAL%</p>", figure.zona_vital_html())
        out.append(f'<section class="sec">{h}</section>')
    return out, toc

# ───────────────────────── piezas del documento ─────────────────────────
COVER = """<section class="cover">
 <div class="cover__top">
  <span><b>Manual de emergencia</b> · Revisión 1.0</span>
  <span>Ámbito España / UE</span>
 </div>
 <div class="cover__mid">
  <h1>Semanas<br>sin red</h1>
  <p class="sub">Cómo prepararse y sobrevivir a un apagón prolongado<br>provocado por una tormenta solar severa</p>
  <p class="stand">Qué hacer con las <strong>18–72 horas de aviso</strong>, cómo preparar el cuerpo
   durante los meses previos, cómo conseguir agua, calor y comida cuando la electricidad no vuelve
   el martes, y cómo proteger a los tuyos sin convertir tu casa en un búnker. Seis áreas de información que he reunido y contrastado en un solo documento
   pensado para leerse antes, no durante.</p>
  <div class="cover__illo">%ILLO%</div>
 </div>

 <div class="cover__by">
  <span class="n"><span class="lead">Creado y organizado por</span> Juan Salvador Moll Garcia</span>
  <span class="p">Medio natural, climatología y supervivencia</span>
 </div>
 <div class="cover__foot">
  <span>Documento para imprimir y guardar en papel</span>
  <span>Septiembre de 2026</span>
 </div>
</section>"""

PROLOGO = """<section class="prologo">
 <h2 style="font-family:var(--f-disp);font-weight:800;font-size:20pt;margin:0 0 3pt;letter-spacing:-.02em">Antes de empezar</h2>
 <p class="lede" style="font-size:9.6pt;color:var(--muted);margin:0 0 14pt;max-width:130mm;line-height:1.45">
  Lo que esta guía asume, lo que no, y por qué el orden de prioridades de la portada es lo único
  que deberías memorizar.</p>
 <p>Esta guía no trata del fin del mundo. Trata de un problema mucho más probable y mucho más
  aburrido: que una tormenta geomagnética severa tumbe la red eléctrica de tu región y que la
  reposición no se mida en horas sino en <strong>semanas</strong>, porque los transformadores de
  muy alta tensión que se dañan tardan entre dos y cinco años en fabricarse y no existe stock.
  Todo lo demás —el agua que deja de llegar al quinto piso, el alcantarillado que no bombea, la
  farmacia sin refrigeración, el cajero muerto— se deriva de ahí.</p>
 <p>Es una gestión de información: la he reunido, contrastado y canalizado en formato de manual,
  área por área, para que las seis partes no se contradigan entre sí. Las cifras llevan fuente y
  distinguen lo bien establecido de lo especulativo; las recomendaciones operativas son
  criterio, y el criterio se discute.</p>
 <aside class="callout callout--key">
  <p><strong>La única idea que hay que llevarse.</strong> Acumular comida es la <em>última</em>
   de tus cuatro prioridades, no la primera. Sin calefacción en invierno el plazo es de días; sin
   agua, de tres; sin comida aguantas semanas. La mayoría de la gente gasta su dinero y su
   atención exactamente al revés, y por eso las víctimas reales de los apagones largos mueren de
   frío, de monóxido de carbono y de diarrea, no de hambre.</p>
 </aside>
 <p><strong>Y de ahí sale el orden de trabajo de todo el manual.</strong> Si sólo te llevas una
  cosa de todo el manual, que sea esta tabla:</p>
 <ol class="prio">
   <li><span class="k">Prioridad 1</span><span class="v">Temperatura</span>
       <span class="d">Sin calor en invierno el plazo es de días. Es lo que de verdad mata en los apagones.</span></li>
   <li><span class="k">Prioridad 2</span><span class="v">Agua</span>
       <span class="d">Tres días. Y el saneamiento cae con ella: la diarrea es la causa histórica número uno.</span></li>
   <li><span class="k">Prioridad 3</span><span class="v">Sueño y refugio</span>
       <span class="d">El primer sistema que se degrada y el que peores decisiones te hace tomar.</span></li>
   <li><span class="k">Prioridad 4</span><span class="v">Comida</span>
       <span class="d">Semanas de margen. Es donde todo el mundo empieza y donde menos se juega.</span></li>
  </ol>
 %FIG%
</section>"""

COLOFON = """<section class="colophon">
 <h2>Cómo he hecho esto, y cómo usarlo</h2>
 <p class="lede">Seis áreas de información que he gestionado y canalizado en formato de manual.
  Trabajé cada sección por separado y la revisé después para eliminar contradicciones entre
  ellas.</p>
 <div class="council">
  <div><span class="cn">01</span><span class="ct">Clima espacial e infraestructura crítica</span></div>
  <div><span class="cn">02</span><span class="ct">Fisiología del trabajo y acondicionamiento</span></div>
  <div><span class="cn">03</span><span class="ct">Agua, energía, alimentación y salud</span></div>
  <div><span class="cn">04</span><span class="ct">Caza, pesca y conservación de alimentos</span></div>
  <div><span class="cn">05</span><span class="ct">Seguridad, sociología del desastre y comunidad</span></div>
  <div><span class="cn">06</span><span class="ct">Comunicaciones, navegación y campo</span></div>
 </div>
 <div class="notes">
  <h3>Los cuatro objetos que más riesgo cubren por euro gastado</h3>
  <p>Si sólo vas a hacer una cosa después de leer esto, haz esta: un <strong>detector de monóxido
   de carbono a pilas</strong> (25 €, y es el objeto que más vidas salva de toda la guía, porque
   la calefacción improvisada es la que mata en los apagones), <strong>agua para tres días</strong>
   por persona, una <strong>radio con manivela</strong> y una forma de <strong>mantener el calor
   en una sola habitación</strong>. Menos de 150 € en total.</p>
  <h3>Lo que esta guía no es</h3>
  <p>No sustituye a formación presencial en primeros auxilios, ni a la licencia de armas o de
   caza, ni al consejo de tu médico sobre tu medicación o sobre empezar un programa de
   entrenamiento nuevo. La sección 4 explica técnicas de trampeo y colocación del disparo que en
   España y en casi toda la UE están reguladas o directamente prohibidas fuera de una emergencia
   declarada: conocerlas no autoriza a practicarlas. La sección 5 es defensa, evitación y
   organización vecinal, no tácticas ofensivas: una crisis no es una amnistía y la
   responsabilidad penal sigue vigente.</p>
  <h3>Mantenlo vivo</h3>
  <p>Revisa las fechas de caducidad y el estado de las pilas dos veces al año, cuando cambia la
   hora. Repasa el plan familiar de comunicaciones de la sección 6 con quien viva contigo y
   asegúrate de que todos saben el punto de encuentro sin mirar el móvil. Si encuentras un error
   en estas páginas, corrígelo a mano: es un documento de trabajo, no una lápida.</p>
 </div>
 <div class="endplate">%EMBLEMA%
  <div class="t">Semanas sin red</div>
  <div class="s">Manual de emergencia ante un apagón prolongado provocado por una tormenta
   solar severa</div>
  <div class="hr"></div>
  <div class="n"><span class="lead">Creado y organizado por</span> Juan Salvador Moll Garcia</div>
  <div class="p">Medio natural, climatología y supervivencia<br>
   Revisión 1.0 · septiembre de 2026<br>
   Para imprimir a doble cara y guardar con la documentación de casa</div>
 </div>
</section>"""

def toc_html(toc, pages=None):
    def pg(k):
        if pages is None: return "00"
        return str(pages[k]) if k in pages else ""
    li = []
    for s in toc:
        n, title = s["n"], s["title"]
        parts = []
        for j, h in enumerate(s["subs"], start=1):
            parts.append('<li><span class="tt">' + h + '</span><span class="dots"></span>'
                         '<span class="pg">' + pg("PMK%dS%dZ" % (n, j)) + '</span></li>')
        subs = "".join(parts)
        li.append('<li><div class="t1"><span class="n">%02d</span>' % n
                  + '<span class="tt">' + title + '</span>'
                  + '<span class="pg">' + pg("PMK%dS0Z" % n) + '</span></div>'
                  + "<ol>" + subs + "</ol></li>")
    return ('<section class="toc"><h2>Índice</h2>'
            '<p class="lede">Seis dominios y una séptima sección de fuentes. Las tres primeras '
            'hay que leerlas antes de que pase nada; las tres siguientes se consultan cuando ya '
            'está pasando, y la última dice de dónde sale cada cifra y cuáles están sin '
            'confirmar.</p>'
            f'<ol>{"".join(li)}</ol></section>')

def document(toc, secs, pages=None):
    css = io.open(os.path.join(B, "print.css"), encoding="utf-8").read()
    fonts = io.open(os.path.join(B, "fonts.css"), encoding="utf-8").read()
    fonts = fonts.replace("url(fonts/", "url(file://" + B + "/fonts/")
    body = (COVER.replace("%ILLO%", figure.cover_illustration())
            + toc_html(toc, pages) + PROLOGO.replace("%FIG%", figure.html())
            + "".join(secs) + COLOFON.replace("%EMBLEMA%", figure.emblem()))
    if pages is not None:                       # 2a pasada: fuera los marcadores
        body = re.sub(r'<span class="pmk">PMK\d+S\d+Z</span>', "", body)
    return ("<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"utf-8\">"
            "<title>Semanas sin red</title>"
            f"<style>{fonts}</style><style>{css}</style></head><body>{body}</body></html>")

# ───────────────────────── render ─────────────────────────
FOOT = ('<div style="width:100%;font-family:Arial,Helvetica,sans-serif;font-size:7.5pt;'
        'color:#5C636C;padding:0 18mm;display:flex;justify-content:space-between;gap:8pt;">'
        '<span>Semanas sin red</span>'
        '<span>Juan Salvador Moll Garcia</span>'
        '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>')

def render(html_path, pdf_path):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=CHROME)
        pg = br.new_page()
        pg.goto("file://" + html_path, wait_until="load")
        try:
            pg.wait_for_function("document.fonts.ready.then(()=>true)", timeout=45000)
        except Exception as e:
            print("  aviso: espera de tipografias:", type(e).__name__)
        n = pg.evaluate("document.fonts.size + '/' + document.fonts.status")
        print("  tipografias cargadas:", n)
        pg.emulate_media(media="print")
        pg.pdf(path=pdf_path, prefer_css_page_size=True, print_background=True,
               display_header_footer=True, header_template="<div></div>", footer_template=FOOT)
        br.close()

def page_map(pdf_path):
    from pypdf import PdfReader
    r = PdfReader(pdf_path)
    m = {}
    for i, page in enumerate(r.pages, start=1):
        txt = re.sub(r"[^A-Z0-9]", "", (page.extract_text() or "").upper())
        for k in re.findall(r"PMK\d+S\d+Z", txt):
            m.setdefault(k, i)
    return m, len(r.pages)

if __name__ == "__main__":
    secs, toc = sections()
    h1 = os.path.join(OUT, "pass1.html"); p1 = os.path.join(OUT, "pass1.pdf")
    io.open(h1, "w", encoding="utf-8").write(document(toc, secs))
    render(h1, p1)
    pages, total = page_map(p1)
    print(f"pasada 1: {total} paginas, {len(pages)} epigrafes localizados")
    missing = [f"PMK{s['n']}S{j}Z" for s in toc for j in range(0, len(s['subs']) + 1)
               if f"PMK{s['n']}S{j}Z" not in pages]
    if missing: print("  sin localizar:", missing)

    h2 = os.path.join(OUT, "guia.html"); p2 = os.path.join(OUT, "semanas-sin-red.pdf")
    io.open(h2, "w", encoding="utf-8").write(document(toc, secs, pages))
    render(h2, p2)
    _, total2 = page_map(p2)
    print(f"pasada 2: {total2} paginas -> {p2}")
    if total2 != total: print(f"  AVISO: la paginacion cambio ({total} -> {total2})")
