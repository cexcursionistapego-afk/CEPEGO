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
