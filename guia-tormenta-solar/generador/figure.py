import math
# -*- coding: utf-8 -*-
"""Figura: indice Dst de tormentas historicas. Una sola serie (magnitud);
la trama diagonal distingue lo medido de lo reconstruido, para que la
identidad no dependa del color."""
HUE="#2C4A99"; INK="#15181E"; MUT="#5C636C"; GRID="#D8D0C0"

EVENTS=[
 ("Gannon","mayo 2024",      412, False,"G5 medido. La red norteamericana aguantó: cero pérdida de suministro."),
 ("Quebec","marzo 1989",     589, False,"Colapso de la red de Hydro-Québec en 90 segundos; 6 millones de personas, 9 horas."),
 ("Carrington","septiembre 1859", 850, True,"Reconstruido a partir de registros magnéticos; las estimaciones van de −850 a −900 nT."),
 ("CME de 2012","no impactó la Tierra", 1200, True,"Cruzó la órbita terrestre una semana después de que la Tierra pasara por ese punto."),
]
MAX=1300.0; X0=182.0; X1=660.0; SCALE=(X1-X0)/MAX
ROWS=[44,86,128,170]; BH=26.0; R=4.0

def bar(x0,x1,y,h,r):
    if x1-x0 < r*2: r=max(0.0,(x1-x0)/2)
    return (f"M{x0:.1f},{y:.1f} H{x1-r:.1f} A{r:.1f},{r:.1f} 0 0 1 {x1:.1f},{y+r:.1f} "
            f"V{y+h-r:.1f} A{r:.1f},{r:.1f} 0 0 1 {x1-r:.1f},{y+h:.1f} H{x0:.1f} Z")

def svg():
    p=[]
    p.append('<svg viewBox="0 0 740 248" role="img" '
             'aria-label="Índice Dst mínimo de cuatro tormentas geomagnéticas históricas">')
    p.append(f'<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" '
             f'patternTransform="rotate(45)"><rect width="6" height="6" fill="#ffffff"/>'
             f'<line x1="0" y1="0" x2="0" y2="6" stroke="{HUE}" stroke-width="2.6"/></pattern></defs>')
    # rejilla y ticks
    for v in (0,400,800,1200):
        x=X0+v*SCALE
        p.append(f'<line x1="{x:.1f}" y1="36" x2="{x:.1f}" y2="204" stroke="{GRID}" '
                 f'stroke-width="{"1" if v else "1.4"}"/>')
        lab="0" if v==0 else f"{v:,}".replace(",",".")
        p.append(f'<text x="{x:.1f}" y="28" text-anchor="middle" font-family="JetBrains Mono,monospace" '
                 f'font-size="11" fill="{MUT}">{lab}</text>')
    # barras
    for (name,sub,val,est,note),y in zip(EVENTS,ROWS):
        xe=X0+val*SCALE
        p.append("<g>")
        p.append(f"<title>{name} ({sub}): Dst {'aprox. ' if est else ''}−{val} nT. {note}</title>")
        if est:
            p.append(f'<path d="{bar(X0,xe,y,BH,R)}" fill="url(#hatch)" stroke="{HUE}" stroke-width="1.3"/>')
        else:
            p.append(f'<path d="{bar(X0,xe,y,BH,R)}" fill="{HUE}"/>')
        p.append("</g>")
        p.append(f'<text x="170" y="{y+11:.0f}" text-anchor="end" font-family="Archivo,Arial,sans-serif" '
                 f'font-size="13" font-weight="700" fill="{INK}">{name}</text>')
        p.append(f'<text x="170" y="{y+23:.0f}" text-anchor="end" font-family="Archivo,Arial,sans-serif" '
                 f'font-size="10.5" fill="{MUT}">{sub}</text>')
        txt=("≈ " if est else "")+f"{val:,}".replace(",",".")+" nT"
        p.append(f'<text x="{xe+9:.1f}" y="{y+18:.0f}" font-family="JetBrains Mono,monospace" '
                 f'font-size="12" font-weight="700" fill="{INK}">{txt}</text>')
    p.append(f'<text x="{X0:.0f}" y="232" font-family="Archivo,Arial,sans-serif" font-size="10.5" '
             f'fill="{MUT}">Índice Dst mínimo alcanzado (nT, valor absoluto) — más alto = más intenso</text>')
    p.append("</svg>")
    return "".join(p)

def html():
    return f'''<figure><div class="fig">
<p class="fig-t">Dentro de «G5» caben tormentas muy distintas</p>
<p class="fig-s">La escala NOAA se satura en G5 (Kp&nbsp;=&nbsp;9), así que el titular «tormenta G5»
no distingue entre lo que ya hemos vivido sin consecuencias y lo que nadie ha visto nunca con una
red eléctrica moderna. El índice Dst mide la fuerza real de la perturbación geomagnética.</p>
{svg()}
<div class="fig-key">
 <span><i style="background:{HUE}"></i>Medido por instrumentos</span>
 <span><i style="background:#fff;border:1pt solid {HUE};background-image:repeating-linear-gradient(45deg,{HUE} 0 1.4pt,#fff 1.4pt 4pt)"></i>Reconstruido o estimado</span>
</div>
</div>
<figcaption>Mayo de 2024 fue un G5 real y la red aguantó. Carrington sería entre dos y tres veces
más intenso, y es el escenario para el que está escrita esta guía.</figcaption>
</figure>'''


# ─────────────────── ilustración de portada y emblema de cierre ───────────────────
INK="#15181E"; MUT="#5C636C"; EMB="#95101A"; AMB="#7E5210"
AUR="#175544"; NAV="#1E2E63"; RUL="#C9C1B2"; TNT="#F4F1EA"
AUTOR="Juan Salvador Moll Garcia"

def _sol(cx,cy,r,flares=True):
    """Disco solar asomando por el borde izquierdo, con fulguraciones."""
    p=[f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F6E4E2" stroke="{EMB}" stroke-width="2"/>']
    if flares:
        for ang in (-42,-21,0,21,42):
            a=math.radians(ang)
            x1,y1=cx+r*math.cos(a),cy+r*math.sin(a)
            x2,y2=cx+(r+26)*math.cos(a),cy+(r+26)*math.sin(a)
            p.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                     f'stroke="{EMB}" stroke-width="2.4" stroke-linecap="round"/>')
    return "".join(p)

def _tierra(cx,cy,r):
    """Tierra con magnetosfera comprimida en el lado día y cola en el lado noche."""
    return (
      f'<path d="M{cx-r-30},{cy-r-34} Q{cx-r-52},{cy} {cx-r-30},{cy+r+34}" fill="none" '
      f'stroke="{NAV}" stroke-width="1.6" stroke-dasharray="5 4"/>'
      f'<path d="M{cx-r-14},{cy-r-20} Q{cx-r-34},{cy} {cx-r-14},{cy+r+20}" fill="none" '
      f'stroke="{NAV}" stroke-width="1.6"/>'
      f'<path d="M{cx+r+6},{cy-r-16} Q{cx+r+46},{cy-r-8} {cx+r+70},{cy-r-2}" fill="none" '
      f'stroke="{NAV}" stroke-width="1.4"/>'
      f'<path d="M{cx+r+6},{cy+r+16} Q{cx+r+46},{cy+r+8} {cx+r+70},{cy+r+2}" fill="none" '
      f'stroke="{NAV}" stroke-width="1.4"/>'
      f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{NAV}"/>'
      f'<path d="M{cx-r*0.72},{cy-r*0.62} A{r},{r} 0 0 1 {cx+r*0.72},{cy-r*0.62}" fill="none" '
      f'stroke="{AUR}" stroke-width="3.4" stroke-linecap="round"/>'
      f'<path d="M{cx-r*0.72},{cy+r*0.62} A{r},{r} 0 0 0 {cx+r*0.72},{cy+r*0.62}" fill="none" '
      f'stroke="{AUR}" stroke-width="3.4" stroke-linecap="round"/>')

def cover_illustration():
    """Los tres tiempos de llegada, y la ventana de aviso que hay entre ellos."""
    SX, EX, EC = 170, 812, 812          # borde del sol, centro de la Tierra
    lanes=[(74, "Fulguración: luz y rayos X", "8 min 20 s", AMB, "none", 2.2),
           (150,"Tormenta de protones",       "15 min – horas", AMB, "2 6", 2.2),
           (232,"CME: la nube de plasma que tumba la red", "15 – 90 h", EMB, "none", 4.2)]
    p=[f'<svg viewBox="0 0 900 316" role="img" aria-label="Esquema de los tres fenómenos de una '
       f'erupción solar y sus tiempos de llegada a la Tierra: la luz en 8 minutos, los protones '
       f'en minutos a horas y la eyección de masa coronal en 15 a 90 horas, que es la ventana '
       f'de aviso disponible">']
    p.append(f'<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" '
             f'markerHeight="6.5" orient="auto-start-reverse">'
             f'<path d="M0,1 L10,5 L0,9 z" fill="context-stroke"/></marker></defs>')
    p.append(_sol(-46, 150, 172))
    for y,lab,t,col,dash,w in lanes:
        p.append(f'<line x1="{SX}" y1="{y}" x2="{EX-46}" y2="{y}" stroke="{col}" stroke-width="{w}" '
                 f'stroke-dasharray="{dash}" marker-end="url(#ah)"/>')
        p.append(f'<text x="{SX+6}" y="{y-13}" font-family="Archivo,Arial,sans-serif" '
                 f'font-size="17" font-weight="700" fill="{INK}">{lab}</text>')
        p.append(f'<text x="{SX+6}" y="{y+23}" font-family="JetBrains Mono,monospace" '
                 f'font-size="16" font-weight="700" fill="{col}">{t}</text>')
    p.append(_tierra(EC, 150, 30))
    # la ventana de aviso: entre el aviso de la fulguración y la llegada de la CME
    p.append(f'<text x="{(SX+EX-46)/2:.0f}" y="284" text-anchor="middle" '
             f'font-family="Archivo,Arial,sans-serif" font-size="16" font-weight="800" '
             f'fill="{AUR}">TU VENTANA DE AVISO: 18–72 h</text>')
    p.append(f'<path d="M{SX},292 v10 H{EX-46} v-10" fill="none" stroke="{AUR}" '
             f'stroke-width="1.6"/>')
    p.append(f'<text x="{EC}" y="212" text-anchor="middle" font-family="Archivo,Arial,sans-serif" '
             f'font-size="15" font-weight="600" fill="{MUT}">Tierra</text>')
    p.append("</svg>")
    return "".join(p)

def emblem(size=104):
    """Marca de cierre: el sol y los frentes de la CME avanzando hacia la Tierra."""
    cx, cy, r = 6.0, size/2, 26.0
    p=[f'<svg viewBox="0 0 {size} {size}" width="{size}" height="{size}" aria-hidden="true">']
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#F6E4E2" stroke="{EMB}" stroke-width="1.6"/>')
    for rad, w in ((42, 2.6), (56, 1.9), (70, 1.3)):
        a = math.radians(45)
        x1, y1 = cx + rad*math.cos(-a), cy + rad*math.sin(-a)
        x2, y2 = cx + rad*math.cos(a),  cy + rad*math.sin(a)
        p.append(f'<path d="M{x1:.1f},{y1:.1f} A{rad},{rad} 0 0 1 {x2:.1f},{y2:.1f}" fill="none" '
                 f'stroke="{EMB}" stroke-width="{w}" stroke-linecap="round"/>')
    p.append(f'<path d="M84,41 Q75.5,{cy:.0f} 84,63" fill="none" stroke="{AUR}" '
             f'stroke-width="1.9" stroke-linecap="round"/>')
    p.append(f'<circle cx="92" cy="{cy:.0f}" r="4.6" fill="{NAV}"/>')
    p.append("</svg>")
    return "".join(p)
