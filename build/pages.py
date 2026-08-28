# -*- coding: utf-8 -*-
# Cos de cada pàgina del sitio CEPEGO

def build(g):
    doc=g['doc']; header=g['header']; footer=g['footer']; subhero=g['subhero']; write=g['write']
    IMG=g['IMG']; REFUGI=g['REFUGI']; L1=g['L1']; L2=g['L2']; HERO=g['HERO_BENCS']; CREST=g['CREST']
    ALTA=g['ALTA']; BAIXA=g['BAIXA']; RESERVA=g['RESERVA']; GCAL=g['GCAL']; METEO=g['METEO']; METEO_PEGO=g['METEO_PEGO']
    IG=g['IG']; FB=g['FB']; IG_SVG=g['IG_SVG']
    RESERVA_EMBED="https://airtable.com/embed/appkuKVxHSMyDElfh/pagsRVRH1Oa9zgKka/form"

    def gallery_imgs(files, alt):
        return "".join(
            f'      <a href="{IMG}bb9bb0_{f}"><img loading="lazy" src="{IMG}bb9bb0_{f}" alt="{alt}"></a>\n'
            for f in files
        )

    def skyline_svg(peaks, W, baseline, min_px, max_px, vertical=False, top=40, view_top=0):
        n=len(peaks)
        left=W*0.05; right=W*0.05
        step=(W-left-right)/(n-1)
        xs=[left+i*step for i in range(n)]
        heights=[p[2] for p in peaks]
        hmin,hmax=min(heights),max(heights)
        def scale(h):
            return min_px+(h-hmin)/(hmax-hmin)*(max_px-min_px)
        pxh=[scale(h) for h in heights]
        peak_y=[baseline-p for p in pxh]

        nodes=[(0.0,float(baseline))]
        for i in range(n):
            nodes.append((xs[i],peak_y[i]))
            if i<n-1:
                sx=(xs[i]+xs[i+1])/2
                sh=min(pxh[i],pxh[i+1])*0.32
                nodes.append((sx,baseline-sh))
        nodes.append((float(W),float(baseline)))
        polyline=" ".join(f"{x:.1f},{y:.1f}" for x,y in nodes)

        if vertical:
            ly=top-5
            labels="".join(
                f'<line class="sk-lead" x1="{xs[i]:.1f}" y1="{top}" x2="{xs[i]:.1f}" y2="{peak_y[i]-5:.1f}"/>'
                f'<circle class="sk-dot" cx="{xs[i]:.1f}" cy="{peak_y[i]:.1f}" r="2.4"/>'
                f'<text class="sk-name-v" x="{xs[i]-6:.1f}" y="{ly}" text-anchor="start" transform="rotate(-90 {xs[i]-6:.1f} {ly})">{name.upper()}</text>'
                f'<text class="sk-alt-v" x="{xs[i]+6:.1f}" y="{ly}" text-anchor="start" transform="rotate(-90 {xs[i]+6:.1f} {ly})">{alt} m</text>'
                for i,(name,alt,_) in enumerate(peaks)
            )
        else:
            labels="".join(
                f'<line class="sk-lead" x1="{xs[i]:.1f}" y1="{top}" x2="{xs[i]:.1f}" y2="{peak_y[i]-6:.1f}"/>'
                f'<circle class="sk-dot" cx="{xs[i]:.1f}" cy="{peak_y[i]:.1f}" r="3"/>'
                f'<text class="sk-name" x="{xs[i]:.1f}" y="{top-30}" text-anchor="middle">{name.upper()}</text>'
                f'<text class="sk-alt" x="{xs[i]:.1f}" y="{top-15}" text-anchor="middle">{alt} m</text>'
                for i,(name,alt,_) in enumerate(peaks)
            )
        cls="skyline-chart skyline-chart--v" if vertical else "skyline-chart skyline-chart--h"
        return f'''<svg class="{cls}" viewBox="0 {view_top} {W} {baseline+10-view_top}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Skyline dels cims que envolten Pego">
      {labels}
      <polyline class="sk-ridge" points="{polyline}" fill="none"/>
      <line class="sk-base" x1="0" y1="{baseline}" x2="{W}" y2="{baseline}"/>
    </svg>'''

    PEAKS=[("Segària","509",509),("Cabal","713",713),("Penya Migdia","747",747),("Montnegre","653",653),
           ("Bodoix","556",556),("Ambra","298",298),("Xical","363",363),("Xillibre","751",751),("Mostalla","359",359)]

    # ============================================= HOME
    # (href, tva, tes, pva, pes, num)
    acts=[
     ("calendari.html","Senderisme","Senderismo",
      "Rutes tot l'any per Pego i les Valls, amb fitxes de track i distàncies.","Rutas todo el año por Pego y sus valles, con fichas de track y distancias.","01"),
     ("calendari.html","Escalada","Escalada",
      "Escola del Calvari: 28 vies equipades per a tots els nivells, des d'iniciació fins a dificultat.","Escuela del Calvari: 28 vías equipadas para todos los niveles, desde iniciación hasta dificultad.","02"),
     ("calendari.html","Espeleologia","Espeleología",
      "Avencs i coves del massís calcari de la Vall d'Ebo. Exploració subterrània en grup.","Avencos y cuevas del macizo calcáreo de la Vall d'Ebo. Exploración subterránea en grupo.","03"),
     ("calendari.html","Barrancs","Barrancos",
      "Descens de barrancs per la comarca. Corda, neoprè i aventura entre aiguamolls i cascades.","Descenso de barrancos por la comarca. Cuerda, neopreno y aventura entre parajes y cascadas.","04"),
     ("calendari.html","Alta muntanya","Alta montaña",
      "Eixides als grans cims i itineraris alpins de la temporada hivernal. Material tècnic i experiència.","Salidas a las grandes cimas e itinerarios alpinos de la temporada invernal. Material técnico y experiencia.","05"),
     ("calendari.html","Meteorologia","Meteorología",
      "Estació meteorològica professional al refugi, connectada en temps real a la xarxa AVAMET.","Estación meteorológica profesional en el refugio, conectada en tiempo real a la red AVAMET.","06"),
    ]
    act_cards=""
    for href,tva,tes,pva,pes,num in acts:
        act_cards+=f'''      <a class="act-row reveal" href="{href}">
        <div class="act-row__num">{num}</div>
        <div class="act-row__main">
          <div class="act-row__name"><span class="va">{tva}</span><span class="es">{tes}</span></div>
          <p class="act-row__desc"><span class="va">{pva}</span><span class="es">{pes}</span></p>
        </div>
        <div class="act-row__link"><span class="va">Descobrir</span><span class="es">Descubrir</span> →</div>
      </a>\n'''

    home=header("inici")+f'''
<section class="hero">
  <div class="hero__bg" style="background-image:url('{HERO}')"></div>
  <div class="hero__scrim"></div>
  <div class="wrap hero__inner">
    <img class="crest" src="{CREST}" alt="Escut CEPEGO">
    <div class="kicker on-photo"><span class="va">Pego · Alacant · Des de 1973</span><span class="es">Pego · Alicante · Desde 1973</span></div>
    <h1><span class="va">Vivim la muntanya,<br><em>compartim</em> l'aventura</span><span class="es">Vivimos la montaña,<br><em>compartimos</em> la aventura</span></h1>
    <p><span class="va">El Centre Excursionista de Pego és un club sense ànim de lucre format per gent de totes les edats unida per la natura i els esports de muntanya.</span><span class="es">El Centro Excursionista de Pego es un club sin ánimo de lucro formado por gente de todas las edades unida por la naturaleza y los deportes de montaña.</span></p>
    <div class="hero__actions">
      <a href="soci.html" class="btn btn-primary"><span class="va">Fes-te soci</span><span class="es">Hazte socio</span></a>
      <a href="refugi.html" class="btn btn-ghost"><span class="va">El refugi La Figuereta</span><span class="es">El refugio La Figuereta</span></a>
    </div>
  </div>
</section>

<section class="section" style="padding-top:clamp(48px,7vw,100px)">
  <div class="wrap">
    <div class="split reveal">
      <div class="prose">
        <div class="kicker"><span class="va">El club</span><span class="es">El club</span></div>
        <h2><span class="va">Amics units per la muntanya</span><span class="es">Amigos unidos por la montaña</span></h2>
        <p><span class="va">El CEP està format per amics de diferents generacions, amants de la natura i dels esports d'aventura. Gran part dels membres som persones de diferents edats amb una gran dedicació en tot allò que fem.</span><span class="es">El CEP está formado por amigos de diferentes generaciones, amantes de la naturaleza y de los deportes de aventura. Gran parte de los miembros somos personas de diferentes edades con una gran dedicación en todo lo que hacemos.</span></p>
        <p><span class="va">Tenim dues seccions principals: qui fa senderisme —per la zona i per terres més llunyanes, aprofitant caps de setmana i ponts— i qui es dedica a l'escalada, majoritàriament esportiva, bloc i clàssica. També fem alta muntanya, espeleologia i barranquisme.</span><span class="es">Tenemos dos secciones principales: quien hace senderismo —por la zona y por tierras más lejanas, aprovechando fines de semana y puentes— y quien se dedica a la escalada, mayoritariamente deportiva, bloque y clásica. También hacemos alta montaña, espeleología y barranquismo.</span></p>
        <a href="calendari.html" class="link-arrow"><span class="va">Descobreix les activitats</span><span class="es">Descubre las actividades</span></a>
      </div>
      <div class="split__media">
        <img src="{IMG}club-cim.jpg" alt="El club a un cim d'alta muntanya">
      </div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="center"><div class="kicker center-k"><span class="va">El nostre territori</span><span class="es">Nuestro territorio</span></div></div>
    <div class="skyline reveal">
{skyline_svg(PEAKS, W=1200, baseline=400, min_px=64, max_px=220, vertical=False, top=128, view_top=64)}
{skyline_svg(PEAKS, W=440, baseline=500, min_px=36, max_px=110, vertical=True, top=340, view_top=230)}
    </div>
  </div>
</section>

<section class="band">
  <div class="band__bg" style="background-image:url('{L2}')"></div>
  <div class="band__scrim"></div>
  <div class="wrap">
    <blockquote><span class="va">"Més de 50 anys caminant per les muntanyes."</span><span class="es">"Más de 50 años caminando por las montañas."</span>
      <cite>Centre Excursionista de Pego</cite></blockquote>
  </div>
</section>


<section class="section bg-paper2">
  <div class="wrap">
    <div class="narrow center reveal" style="margin-bottom:clamp(20px,3vw,36px)">
      <div class="kicker center-k"><span class="va">Voluntariat</span><span class="es">Voluntariado</span></div>
      <h2><span class="va">Recuperació de senders</span><span class="es">Recuperación de senderos</span></h2>
      <p class="lead"><span class="va">Cada any organitzem jornades de manteniment i senyalització dels senders de Pego i les valls, perquè la muntanya estiga sempre neta i transitable. La quota de soci ajuda a fer-ho possible.</span><span class="es">Cada año organizamos jornadas de mantenimiento y señalización de los senderos de Pego y sus valles, para que la montaña esté siempre limpia y transitable. La cuota de socio ayuda a hacerlo posible.</span></p>
    </div>
    <div class="senders-gallery reveal">
{gallery_imgs(['391b36f3ebd04e3182be56e88280aca8~mv2.jpeg','2a340796bdb14c5cacc3936de7383b74~mv2.jpeg','82b4e09447a84e64a0cbbb9b026159e5~mv2.jpeg','57ae4d984d9c48b2a32c53e3bfe3498d~mv2.jpeg','becd04976a1149d3a87a611761d3fe35~mv2.jpeg','051b66f2418a4085955891b0c0a262c5~mv2.jpeg','e3a29c2c30e74be998225d7b468bbe37~mv2.jpeg','c7bc744c47aa43e89c657194275c9132~mv2.jpg','feeaad2d5baf4e91b2f160405d5c0f55~mv2.jpeg'], "Jornada de recuperació de senders")}    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="narrow center reveal" style="margin-bottom:clamp(20px,3vw,36px)">
      <div class="kicker center-k"><span class="va">Entrenament</span><span class="es">Entrenamiento</span></div>
      <h2><span class="va">Sala d'entrenament</span><span class="es">Sala de entrenamiento</span></h2>
      <p class="lead"><span class="va">Rocòdrom amb blocs de dificultat variada, panell d'entrenament i sala amb màquines per a preparar totes les disciplines de muntanya. Accés per <strong data-cms="quota_sala">50 €</strong>/any addicionals a la quota de soci.</span><span class="es">Rocódromo con bloques de dificultad variada, panel de entrenamiento y sala con máquinas para preparar todas las disciplinas de montaña. Acceso por <strong>50 €</strong>/año adicionales a la cuota de socio.</span></p>
    </div>
    <div class="senders-gallery reveal">
{gallery_imgs(['27dddcd5086a44a0827ac05bf406df3a~mv2.jpg','f8b750629ad5479d9b83d134fca28bb2~mv2.jpg','0a8a6079eb9e4d08b920f87662ca13a0~mv2.jpg','a878841efccf4e4cbfd75fa1348c80d8~mv2.jpg','b4b6f8c3f6f144d3854112914b948cc3~mv2.jpg','61c60a6949b449169cf212140f7dfec0~mv2.jpg','8ac56ee5cd134f028578b52d80640a5c~mv2.jpg','198f57a26919421c999cdc96a0534cf5~mv2.jpg','43da4fad9c1547daa345593283911dfb~mv2.jpg'], "Sala d'entrenament del CEPEGO")}    </div>
  </div>
</section>
'''+footer()
    write("index.html", doc("Centre Excursionista de Pego | Refugi La Figuereta",
        "Club de muntanya sense ànim de lucre des de 1973 a Pego. Senderisme, escalada, barranquisme, espeleologia i el refugi La Figuereta.",
        home, path="index.html", identity=True))

    # ============================================= REFUGI
    equip=[("Una llar amb llenya per a fer foc i rostir (proporcionem les ferramentes).","Chimenea con leña para hacer fuego y asar (proporcionamos las herramientas)."),
     ("Cuina amb 4 fogons de gas (bombona de butà inclosa).","Cocina con 4 fogones de gas (bombona de butano incluida)."),
     ("Nevera amb congelador, microones i torrador de pa.","Nevera con congelador, microondas y tostador de pan."),
     ("Cafetera Nespresso: 1 € la càpsula.","Cafetera Nespresso: 1 € la cápsula."),
     ("Endolls a 220 v. a les dues plantes.","Enchufes a 220 v. en las dos plantas."),
     ("Lavabos i dutxa amb aigua calenta (moneda d'1 €, dóna per a dues persones).","Lavabos y ducha con agua caliente (moneda de 1 €, da para dos personas)."),
     ("Aigüera exterior amb punts d'aigua (NO potable).","Fregadero exterior con puntos de agua (NO potable)."),
     ("Internet de banda ampla (cal reservar-lo).","Internet de banda ancha (hay que reservarlo)."),
     ("No hi ha utensilis de cuina: porta el que necessites.","No hay utensilios de cocina: trae lo que necesites."),
     ("Lliteres amb matalàs i coixí: només cal el sac de dormir.","Literas con colchón y cojín: solo hace falta el saco de dormir."),
     ("Pantalla amb informació meteorològica de l'interior i l'exterior, i pronòstic del temps per a les pròximes hores.","Pantalla con información meteorológica del interior y el exterior, y pronóstico del tiempo para las próximas horas."),
     ("Detectors de fum i de monòxid de carboni amb alarma i avís directe al guarda del refugi (normes UNE-EN 14604 i UNE-EN 50291).","Detectores de humo y de monóxido de carbono con alarma y aviso directo al guarda del refugio (normas UNE-EN 14604 y UNE-EN 50291)."),
     ("Extintors homologats (UNE-EN 3) distribuïts pel refugi.","Extintores homologados (UNE-EN 3) distribuidos por el refugio."),
     ("Eixides d'emergència senyalitzades (norma UNE 23034).","Salidas de emergencia señalizadas (norma UNE 23034)."),
     ("Cal pujar sense calçat a la zona de dormir.","Hay que subir sin calzado a la zona de dormir."),
     ("No proporcionem tovalloles: porta la teua.","No proporcionamos toallas: trae la tuya.")]
    def eq_li(idxs):
        return "".join(f'          <li><span class="va">{equip[i][0]}</span><span class="es">{equip[i][1]}</span></li>\n' for i in idxs)
    refugi=header("refugi")+subhero(IMG+"refugi-nit.jpg",'<span class="va">Vall d\'Ebo · 540 m</span><span class="es">Vall d\'Ebo · 540 m</span>',
        "La Figuereta","La Figuereta",
        "El refugi de muntanya del Centre Excursionista de Pego.","El refugio de montaña del Centro Excursionista de Pego.",
        pos='85%')+f'''

<section class="section">
  <div class="wrap">

    <!-- Intro + heading BEFORE mosaic -->
    <div class="narrow center reveal" style="margin-bottom:clamp(32px,4.5vw,60px)">
      <p class="lead"><span class="va">La Figuereta és el refugi del Centre Excursionista de Pego, a la Vall d'Ebo, habilitat per passar uns dies en la natura fent senderisme, escalada, descens de barrancs, espeleologia o turisme rural pels pobles propers.</span><span class="es">La Figuereta es el refugio del Centro Excursionista de Pego, en la Vall d'Ebo, habilitado para pasar unos días en la naturaleza haciendo senderismo, escalada, barrancos, espeleología o turismo rural por los pueblos cercanos.</span></p>
      <div class="kicker center-k" style="margin-top:clamp(28px,4vw,52px)"><span class="va">Equipament</span><span class="es">Equipamiento</span></div>
      <h2 style="margin-top:.4em"><span class="va">Tot a punt per a 21 persones</span><span class="es">Todo listo para 21 personas</span></h2>
      <p><span class="va">Dos habitacles comunicats amb lliteres, cuina completa i tots els serveis per gaudir de la natura.</span><span class="es">Dos habitáculos comunicados con literas, cocina completa y todos los servicios para disfrutar de la naturaleza.</span></p>
    </div>

    <!-- BLOC 1: CUINA — foto esquerra en escriptori, baix en mòbil -->
    <div class="equip-block equip-block--photo-below-mobile reveal">
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[1]}" alt="Cuina del refugi">
      </div>
      <div>
        <span class="equip-tag"><span class="va">Cuina i àpats</span><span class="es">Cocina y comidas</span></span>
        <h3 style="margin-top:.5em"><span class="va">Cuina equipada per a tothom</span><span class="es">Cocina equipada para todos</span></h3>
        <ul class="equip equip-1col" style="margin-top:18px">
{eq_li([1,2,3,8])}        </ul>
      </div>
    </div>

    <!-- BLOC SALA D'ESTAR — foto dreta -->
    <div class="equip-block equip-block--rev reveal">
      <div>
        <span class="equip-tag"><span class="va">Sala d'estar</span><span class="es">Sala de estar</span></span>
        <h3 style="margin-top:.5em"><span class="va">Una sala d'estar gran</span><span class="es">Una sala de estar grande</span></h3>
        <ul class="equip equip-1col" style="margin-top:18px">
{eq_li([0,7,4,10])}        </ul>
      </div>
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[6]}" alt="Sala d'estar del refugi">
      </div>
    </div>

    <!-- FRANJA FOTOGRÀFICA -->
    <div class="photo-strip reveal">
      <img loading="lazy" src="{REFUGI[5]}" alt="Refugi La Figuereta">
      <img loading="lazy" src="{REFUGI[0]}" alt="Refugi La Figuereta">
      <img loading="lazy" src="{REFUGI[9]}" alt="Refugi La Figuereta">
    </div>

    <!-- BLOC 2: DORMIR — foto dreta amb badge -->
    <div class="equip-block equip-block--rev reveal">
      <div>
        <span class="equip-tag"><span class="va">Dormir</span><span class="es">Dormir</span></span>
        <h3 style="margin-top:.5em"><span class="va">Descansa com a casa</span><span class="es">Descansa como en casa</span></h3>
        <ul class="equip equip-1col" style="margin-top:18px">
{eq_li([9,11,12,13,14])}        </ul>
        <p style="margin-top:16px;font-size:.94rem;color:var(--muted)"><span class="va">Dos habitacles separats però comunicats. Porta sempre el teu sac de dormir.</span><span class="es">Dos habitáculos separados pero comunicados. Trae siempre tu saco de dormir.</span></p>
      </div>
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[8]}" alt="Dormitori del refugi">
        <div class="cap-badge">
          <div class="n">21</div>
          <div class="l"><span class="va">places<br>màxim</span><span class="es">plazas<br>máximo</span></div>
        </div>
      </div>
    </div>

    <!-- BLOC 3: SERVEIS — foto esquerra en escriptori, baix en mòbil -->
    <div class="equip-block equip-block--photo-below-mobile reveal">
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[2]}" alt="Punts d'aigua exteriors del refugi">
      </div>
      <div>
        <span class="equip-tag"><span class="va">Punts d'aigua i higiene</span><span class="es">Puntos de agua e higiene</span></span>
        <h3 style="margin-top:.5em"><span class="va">Tot el que necessites</span><span class="es">Todo lo que necesitas</span></h3>
        <ul class="equip equip-1col" style="margin-top:18px">
{eq_li([5,6,15])}        </ul>
        <p class="note" style="margin-top:18px"><span class="va">⚠️ L'aigua és d'una cava natural, un bé escàs: <strong>no és potable</strong> i cal utilitzar-la de manera responsable. Porta la teua per a consumir.</span><span class="es">⚠️ El agua es de una cava natural, un bien escaso: <strong>no es potable</strong> y hay que utilizarla de forma responsable. Trae la tuya para consumir.</span></p>
      </div>
    </div>

    <!-- BLOC 4: COM ARRIBAR — foto esquerra en escriptori, baix en mòbil -->
    <div class="equip-block equip-block--photo-below-mobile reveal" style="border-top:1px solid var(--hair)">
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[10]}" alt="Camí d'accés al refugi">
      </div>
      <div>
        <span class="equip-tag"><span class="va">Accés</span><span class="es">Acceso</span></span>
        <h3 style="margin-top:.5em"><span class="va">Com arribar</span><span class="es">Cómo llegar</span></h3>
        <p style="margin-top:12px;color:var(--muted)"><span class="va">Per la carretera de Pego a la Vall d'Ebo (CV-712), uns 8 km. Quan comença a baixar cap a Ebo, uns 200 m més avall a mà dreta trobem el camí d'accés, ben senyalitzat. Després d'1,7 km s'arriba al refugi.</span><span class="es">Por la carretera de Pego a la Vall d'Ebo (CV-712), unos 8 km. Cuando empieza a bajar hacia Ebo, unos 200 m más abajo a mano derecha encontramos el camino de acceso, bien señalizado. Tras 1,7 km se llega al refugio.</span></p>
        <a class="btn btn-outline" style="margin-top:18px" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Refugi+La+Figuereta+Vall+d%27Ebo">Google Maps</a>
      </div>
    </div>

  </div>
</section>
'''+footer()
    write("refugi.html", doc("La Figuereta | Centre Excursionista de Pego",
        "Refugi de muntanya La Figuereta, a la Vall d'Ebo. Equipament complet per a 21 persones.", refugi, path="refugi.html"))

    # ============================================= RESERVAR
    rules=[("Sols es pot fer foc a la xemeneia de dins del refugi; proporcionem llenya, graelles i material per encendre lliure de tòxics.","Solo se puede hacer fuego en la chimenea del interior; proporcionamos leña, parrillas y material para encender libre de tóxicos."),
     ("No deixar el foc encés al dormir.","No dejar el fuego encendido al dormir."),
     ("Tancar les dues claus de pas de l'aigua després de l'estada.","Cerrar las dos llaves de paso del agua tras la estancia."),
     ("Deixar el refugi igual o millor, i emportar-se tota la brossa.","Dejar el refugio igual o mejor, y llevarse toda la basura."),
     ("Respectar l'entorn, la flora i la fauna.","Respetar el entorno, la flora y la fauna."),
     ("No es pot traure el mobiliari de l'interior a l'exterior baix cap concepte.","No se puede sacar el mobiliario del interior al exterior bajo ningún concepto."),
     ("Cabuda màxima de 21 persones.","Cabida máxima de 21 personas."),
     ("Portar utensilis de cuina i sac de dormir.","Traer utensilios de cocina y saco de dormir."),
     ("L'aigua és d'una cava natural: millor porta la teua per a consumir.","El agua es de una cava natural: mejor trae la tuya para consumir."),
     ("Eixida: 12:00 h dissabtes i 17:00 h diumenges.","Salida: 12:00 h sábados y 17:00 h domingos.")]
    rl="".join(f'      <li><span class="va">{va}</span><span class="es">{es}</span></li>\n' for va,es in rules)
    reservar=header("reservar")+subhero(REFUGI[5],'<span class="va">Refugi La Figuereta</span><span class="es">Refugio La Figuereta</span>',
        "Reservar","Reservar",
        "Disponibilitat i sol·licitud de reserva del refugi La Figuereta.","Disponibilidad y solicitud de reserva del refugio La Figuereta.")+f'''
<section class="section-sm" style="padding-bottom:clamp(20px,3vw,32px)">
  <div class="wrap narrow center reveal">
    <div class="kicker center-k"><span class="va">Com funciona</span><span class="es">Cómo funciona</span></div>
    <h2><span class="va">Tria les dates i envia la sol·licitud</span><span class="es">Elige las fechas y envía la solicitud</span></h2>
    <p class="lead"><span class="va">Al calendari veus els dies lliures i els ja reservats. Tria les teues dates, envia la sol·licitud i <strong>nosaltres la revisarem</strong>. Et contactarem per confirmar-la i indicar-te els passos a seguir.</span><span class="es">En el calendario ves los días libres y los ya reservados. Elige tus fechas, envía la solicitud y <strong>nosotros la revisaremos</strong>. Te contactaremos para confirmarla e indicarte los pasos a seguir.</span></p>
  </div>
</section>

<div class="wrap narrow">
  <div class="avis reveal" style="border-radius:var(--r);margin-bottom:clamp(16px,2.5vw,28px)">
    <span class="va" data-cms="avis_reserva_va">&#x26A0;&#xFE0F; El refugi <strong>no admet reserves del 31 de maig al 1 d'octubre</strong> (tancament d'estiu anual). Tampoc es lloga <strong>la nit del 31 de desembre</strong>. Fins finals de setembre no gestionarem les reserves, que aniran per ordre d'arribada.</span>
    <span class="es" data-cms="avis_reserva_es">&#x26A0;&#xFE0F; El refugio <strong>no admite reservas del 31 de mayo al 1 de octubre</strong> (cierre de verano anual). Tampoco se alquila <strong>la noche del 31 de diciembre</strong>. Hasta finales de septiembre no gestionaremos las reservas, que irán por orden de llegada.</span>
  </div>
</div>

<section class="section bg-paper2" style="padding-top:clamp(30px,4vw,60px)">
  <div class="wrap reserva-grid">
    <div class="reveal">
      <div class="kicker"><span class="va">Disponibilitat</span><span class="es">Disponibilidad</span></div>
      <h3 style="margin:6px 0 16px;font-size:1.5rem"><span class="va">Calendari del refugi</span><span class="es">Calendario del refugio</span></h3>
      <div id="reserva-cal"></div>
    </div>
    <div class="reveal">
      <div class="card">
        <h3 style="font-size:1.4rem"><span class="va">La teua sol·licitud</span><span class="es">Tu solicitud</span></h3>
        <p id="r-resum"></p>
        <form id="reserva-form" novalidate>
          <input type="hidden" id="r-entrada" name="entrada">
          <input type="hidden" id="r-salida" name="salida">
          <div class="field"><label><span class="va">Nom i cognoms</span><span class="es">Nombre y apellidos</span> *</label><input name="nom" required></div>
          <div class="select-row">
            <div class="field"><label><span class="va">Correu</span><span class="es">Correo</span> *</label><input type="email" name="email" required></div>
            <div class="field"><label><span class="va">Telèfon</span><span class="es">Teléfono</span></label><input name="telefon"></div>
          </div>
          <div class="select-row">
            <div class="field"><label><span class="va">Població</span><span class="es">Población</span></label><input name="poblacio"></div>
            <div class="field"><label><span class="va">Nº persones</span><span class="es">Nº personas</span></label><input type="number" id="r-persones" name="persones" min="1" max="21"><div id="r-persones-msg" class="field-error"></div></div>
          </div>
          <div class="select-row">
            <div class="field"><label><span class="va">Ets soci/a?</span><span class="es">¿Eres soci@?</span></label>
              <select name="soci"><option value="">—</option><option value="Si">Sí</option><option value="No">No</option></select></div>
            <div class="field"><label><span class="va">Vols internet?</span><span class="es">¿Quieres internet?</span></label>
              <select name="internet"><option value="">—</option><option value="Si">Sí</option><option value="No">No</option></select></div>
          </div>
          <div class="field"><label><span class="va">Missatge</span><span class="es">Mensaje</span></label><textarea name="missatge"></textarea></div>
          <div class="hp"><label>No omplir<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <button type="submit" id="r-submit" class="btn btn-primary" disabled><span class="va">Enviar sol·licitud</span><span class="es">Enviar solicitud</span></button>
          <div id="r-msg" class="r-msg"></div>
        </form>
      </div>
    </div>
  </div>
</section>

<section class="section rules-top">
  <div class="wrap">
    <div class="narrow center reveal" style="margin-bottom:clamp(24px,3vw,40px)">
      <div class="kicker center-k">⚠️ <span class="va">Normes</span><span class="es">Normas</span></div>
      <h2><span class="va">Abans de la teua estada</span><span class="es">Antes de tu estancia</span></h2>
    </div>
    <ul class="rules">
{rl}    </ul>
    <p class="note" style="margin-top:22px;border-left:3px solid var(--ember)"><span class="va">En realitzar la reserva, l'usuari o club assumeix plenament la responsabilitat per qualsevol accident o incident durant l'ús de l'espai cedit, eximint la part cedent de qualsevol responsabilitat. Reconeix haver sigut informat de les condicions d'ús i les accepta de forma voluntària.</span><span class="es">Al realizar la reserva, el usuario o club asume plenamente la responsabilidad por cualquier accidente o incidente durante el uso del espacio cedido, eximiendo a la parte cedente de cualquier responsabilidad. Reconoce haber sido informado de las condiciones de uso y las acepta de forma voluntaria.</span></p>
  </div>
</section>
'''+footer()
    write("reservar.html", doc("Reservar | Refugi La Figuereta — CEPEGO",
        "Disponibilitat, normes i sol·licitud de reserva del refugi La Figuereta.", reservar, path="reservar.html", extra_js="js/reserves.js"))

    # ============================================= METEO
    meteo_dash=f'''<section class="section" style="padding:clamp(28px,3.5vw,48px) 0">
  <div class="wrap">
    <div class="kicker center-k" style="justify-content:center"><span class="va">Temps en directe</span><span class="es">Tiempo en directo</span></div>
    <div class="meteo-dash-grid reveal" style="margin-top:clamp(16px,2.5vw,28px)">
      <div id="meteo-dash-figuereta"></div>
      <div id="meteo-dash-pego"></div>
    </div>
    <p class="note center avamet-credit" style="margin-top:14px">
      <img src="{IMG}avamet-logo.jpg" alt="AVAMET" class="avamet-credit__logo avamet-credit__logo--avamet">
    </p>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="kicker center-k" style="justify-content:center"><span class="va">Previsió Pego i la Figuereta, pròxims dies</span><span class="es">Previsión Pego y la Figuereta, próximos días</span></div>
    <div id="aemet-forecast" class="reveal"></div>
    <p class="note center avamet-credit" style="margin-top:14px">
      <img src="{IMG}aemet-logo.jpg" alt="AEMET" class="avamet-credit__logo">
    </p>
  </div>
</section>
'''
    meteo=header("meteo")+subhero(IMG+"meteo-instal.jpg",'AVAMET',
        "El temps","El tiempo",
        "Estacions meteorològiques a La Figuereta i a Pego connectades a la xarxa AVAMET, més la previsió del temps i els avisos d'alertes meteorològiques d'AEMET.","Estaciones meteorológicas en La Figuereta y en Pego conectadas a la red AVAMET, más la previsión del tiempo y los avisos de alertas meteorológicas de AEMET.",
        pos='18%')+meteo_dash+footer()
    write("meteo.html", doc("El temps a Pego i la Figuereta | CEPEGO",
        "Estacions meteorològiques del refugi La Figuereta i de Pego connectades a la xarxa AVAMET, i previsió AEMET.", meteo, path="meteo.html", extra_js=["js/meteo-dashboard.js","js/aemet-forecast.js"]))

    # ============================================= RUTES
    routes=[("Circular Figuereta – Tossal","2,97 km","+154 m","673 m","facil","Fàcil","Fácil",
      "Figuereta · Cova Blanca · Tossal Gran · Despoblat Beniqueis · Camí de la Figuereta · Coveta de Llúcia · Figuereta.",
      IMG+"bb9bb0_7e2efa67934342c2974582cae5147165~mv2.png", "https://loc.wiki/t/18485253?h=jpy94v53z8&wa=sd"),
     ("Circular Figuereta – Ebo","8,4 km","+294 m","598 m","moderada","Moderada","Moderada",
      "Figuereta · Travessia del Maset · Avenc Estret i del Mig · Riu Girona · Font del Gili · Ebo · Camí Vell d'Atzúbia · Tossal Gran · Figuereta.",
      IMG+"bb9bb0_08ee550eeae74d7fbc28b76279017f00~mv2.png", "https://loc.wiki/t/196024884?h=jpy94v53z8&wa=sd"),
     ("Circular Pego – Figuereta","11,57 km","+563 m","587 m","moderada","Moderada","Moderada",
      "Pego · Calvari · Escola d'Escalada · Barranc de les Coves · Font del Lliberet · Bodoix · La Figuereta · Senda del Xical · Barranc de la Canal · Calvari.",
      IMG+"bb9bb0_7f7f8275a09b48738568bbb829a360c7~mv2.png", "https://loc.wiki/t/133790078?h=jpy94v53z8&wa=sd")]
    rc=""
    for name,dist,desn,alt,tc,tva,tes,itin,img,wikiloc in routes:
        rc+=f'''      <div class="route reveal">
        <a class="route__img" href="{wikiloc}" target="_blank" rel="noopener" title="Obrir a Wikiloc"><img loading="lazy" src="{img}" alt="Codi QR i mapa {name} — Wikiloc"></a>
        <div class="route__b">
          <span class="tag {tc}"><span class="va">{tva}</span><span class="es">{tes}</span></span>
          <h3 style="margin-top:10px">{name}</h3>
          <div class="route__stats">
            <div><b>{dist}</b><span><span class="va">Distància</span><span class="es">Distancia</span></span></div>
            <div><b>{desn}</b><span><span class="va">Desnivell</span><span class="es">Desnivel</span></span></div>
            <div><b>{alt}</b><span><span class="va">Alt. màx.</span><span class="es">Alt. máx.</span></span></div>
          </div>
          <p style="font-size:.9rem;color:var(--muted)">{itin}</p>
        </div>
      </div>\n'''
    rutes=header("rutes")+subhero(IMG+"senderisme-grup.jpg",'Wikiloc',
        "Rutes i entorn","Rutas y entorno",
        "Les principals rutes per Pego i les Valls, amb distància, desnivell i itinerari.","Las principales rutas por Pego y sus valles, con distancia, desnivel e itinerario.")+f'''
<section class="section">
  <div class="wrap">
    <div class="grid cols-3">
{rc}    </div>
  </div>
</section>
'''+footer()
    write("rutes.html", doc("Rutes de senderisme per Pego | CEPEGO",
        "Rutes de senderisme per Pego i les Valls amb el seu perfil i itinerari.", rutes, path="rutes.html"))

    # ============================================= ESCALADA
    inic=[("1","Diedre","V"),("2","Placa","V"),("3","Plaqueta","IV"),("4","Mosquera","V"),("5","Ximet","V"),
     ("6","Forats","V+"),("7","Chaqueta d'ocasió","6a+"),("8","El salt del jaguar","6b+/c"),("9","Politoxicómano","V+"),
     ("10","Perro flaco","V+"),("11","Hace calor","V+"),("12","Rocofobia","6a"),("13","Duende","V+")]
    placa=[("1","Forats negres","6a"),("2","Cabra loca","6b"),("3","Borrego volador","6b+/c"),("4","La figa de ta tia","6c"),
     ("5","Muca muca","7a"),("6","Teto","7a"),("7","Anaconda","7c"),("8","Quimera","6b+/c"),("9","Garguller","7a+/b"),
     ("10","Me'n Fot Dénia","6b+"),("11","Mística","6c"),("12","Plat Combinat","V"),("13","Plat Combinat II","V+"),
     ("14","Rafelet un flanet","V"),("15","Caldetes","V+")]
    def grade_class(g):
        base=g.split('+')[0].split('/')[0].strip()
        if base in ("IV","V"): return "facil"
        if base in ("6a","6b"): return "moderada"
        return "dificil"
    def via_cards(rows):
        return "".join(
            f'      <div class="via-card"><span class="via-card__n">{n}</span>'
            f'<span class="via-card__name">{nm}</span>'
            f'<span class="tag {grade_class(g)}">{g}</span></div>\n'
            for n,nm,g in rows)
    def sector_block(name,count,grade_range_va,grade_range_es,img,rows,rev=False):
        media=f'''      <div class="topos reveal">
        <a href="{IMG}{img}"><img loading="lazy" src="{IMG}{img}" alt="Ressenya {name}"></a>
      </div>'''
        content=f'''      <div>
        <span class="equip-tag">Sector</span>
        <h3 style="margin-top:.5em">{name}</h3>
        <p style="color:var(--muted);margin-bottom:20px"><span class="va">{count} vies · de {grade_range_va}</span><span class="es">{count} vías · de {grade_range_es}</span></p>
        <div class="via-grid">
{via_cards(rows)}        </div>
      </div>'''
        order = (media+"\n"+content) if rev else (content+"\n"+media)
        cls = "sector-block sector-block--rev reveal" if rev else "sector-block reveal"
        return f'    <div class="{cls}">\n{order}\n    </div>'
    escalada=header("escalada")+subhero(IMG+"escalada-via.jpg",'<span class="va">Calvari · Pego</span><span class="es">Calvari · Pego</span>',
        "Escalada","Escalada",
        "L'escola d'escalada del Calvari: dos sectors i 28 vies equipades.","La escuela de escalada del Calvari: dos sectores y 28 vías equipadas.")+f'''
<section class="section">
  <div class="wrap">
    <p class="lead narrow reveal" style="margin-bottom:clamp(34px,4vw,56px)"><span class="va">L'accés és molt fàcil, seguint el camí al final del Passeig del Calvari. En arribar al barranc, a mà esquerra hi ha les indicacions. Consta de dos sectors: <strong>Iniciació</strong> (13 vies de IV a 6b+/c, uns 12 m) i <strong>Placa del Sol</strong> (15 vies de V a 7c, de 20 a 27 m, el més dur i espectacular). Equipament de parabolt de 10 mm i cadenes amb mosquetó fixe.</span><span class="es">El acceso es muy fácil, siguiendo el camino al final del Paseo del Calvari. Al llegar al barranco, a mano izquierda están las indicaciones. Consta de dos sectores: <strong>Iniciación</strong> (13 vías de IV a 6b+/c, unos 12 m) y <strong>Placa del Sol</strong> (15 vías de V a 7c, de 20 a 27 m, el más duro y espectacular). Equipamiento de parabolt de 10 mm y cadenas con mosquetón fijo.</span></p>
{sector_block("Sector Iniciació",13,"IV a 6b+/c","IV a 6b+/c","bb9bb0_8ac538198ebe452eb7192aadfadf4652~mv2.png",inic)}
{sector_block("Sector Placa del Sol",15,"V a 7c","V a 7c","bb9bb0_62daeaf5f5f044a0a19c177e3c098354~mv2.png",placa,rev=True)}
    <p class="note" style="margin-top:12px"><span class="va">📷 La numeració de les vies segueix l'ordre d'esquerra a dreta tal com es veu la paret. Fes clic a la fotografia per ampliar-la i localitzar cada via.</span><span class="es">📷 La numeración de las vías sigue el orden de izquierda a derecha tal como se ve la pared. Haz clic en la fotografía para ampliarla y localizar cada vía.</span></p>
  </div>
</section>
'''+footer()
    write("escalada.html", doc("Escalada a Pego | Escola del Calvari — CEPEGO",
        "Escola d'escalada del Calvari a Pego: sectors Iniciació i Placa del Sol, 28 vies.", escalada, path="escalada.html"))

    # ============================================= ESPELEO
    espeleo=header("espeleo")+subhero(IMG+"bb9bb0_82b4e09447a84e64a0cbbb9b026159e5~mv2.jpeg",'<span class="va">Avencs i coves</span><span class="es">Avencos y cuevas</span>',
        "Espeleologia","Espeleología",
        "Les principals cavitats de la nostra zona, amb ressenyes i topografies.","Las principales cavidades de nuestra zona, con reseñas y topografías.")+f'''
<section class="section">
  <div class="wrap">
    <div class="topos reveal">
      <a href="{IMG}bb9bb0_855db2b521a34b89b40493f0da2e37e8~mv2.png"><img loading="lazy" src="{IMG}bb9bb0_855db2b521a34b89b40493f0da2e37e8~mv2.png" alt="Topografia"></a>
      <a href="{IMG}bb9bb0_52ad1044d2e44fa296bdd0ee216e139b~mv2.png"><img loading="lazy" src="{IMG}bb9bb0_52ad1044d2e44fa296bdd0ee216e139b~mv2.png" alt="Topografia avenc"></a>
      <a href="{IMG}bb9bb0_ad75be20ffaa4beda5eb4123765e797b~mv2.png"><img loading="lazy" src="{IMG}bb9bb0_ad75be20ffaa4beda5eb4123765e797b~mv2.png" alt="Topografia avenc"></a>
    </div>
  </div>
</section>
'''+footer()
    write("espeleo.html", doc("Espeleologia a Pego | Avencs i coves — CEPEGO",
        "Les principals cavitats i avencs de la zona de Pego, amb les seues topografies.", espeleo, path="espeleo.html"))

    # ============================================= BARRANCS
    barrancs=header("barrancs")+subhero(IMG+"bb9bb0_c7bc744c47aa43e89c657194275c9132~mv2.jpg",'<span class="va">Aigua i roca</span><span class="es">Agua y roca</span>',
        "Barrancs","Barrancos",
        "Els principals barrancs de la comarca, amb material i topografia.","Los principales barrancos de la comarca, con material y topografía.")+f'''
<section class="section">
  <div class="wrap">
    <div class="topos reveal" style="max-width:560px;margin:0 auto">
      <a href="{IMG}bb9bb0_71c52fbdc12e4e5780714b9d44318023~mv2.jpg"><img loading="lazy" src="{IMG}bb9bb0_71c52fbdc12e4e5780714b9d44318023~mv2.jpg" alt="Material i topografia de barrancs"></a>
    </div>
  </div>
</section>
'''+footer()
    write("barrancs.html", doc("Barrancs de Pego i la Marina | CEPEGO",
        "Els principals barrancs de la zona de Pego, amb material i topografia.", barrancs, path="barrancs.html"))

    # ============================================= CALENDARI
    calendari=header("calendari")+subhero(IMG+"calendari-grup.jpg",'<span class="va">Activitats</span><span class="es">Actividades</span>',
        "Calendari d'activitats","Calendario de actividades",
        "Activitats que realitzem al llarg de l'any, excepte a l'estiu.","Actividades que realizamos a lo largo del año, excepto en verano.")+f'''
<section class="section">
  <div class="wrap">
    <div id="cal-featured" class="cal-featured"></div>
    <div class="narrow center reveal" id="cal-archive-head" style="margin:clamp(20px,3vw,40px) 0 20px;display:none">
      <div class="kicker center-k"><span class="va">Arxiu</span><span class="es">Archivo</span></div>
      <h3 style="font-size:1.4rem"><span class="va">Calendaris anteriors</span><span class="es">Calendarios anteriores</span></h3>
    </div>
    <div id="cal-archive" class="cal-archive"></div>
  </div>
</section>
'''+footer()
    write("calendari.html", doc("Calendari d'activitats | CEPEGO",
        "Activitats del Centre Excursionista de Pego al llarg de l'any.", calendari, path="calendari.html"))

    # ============================================= CONTACTE
    contacte=header("contacte")+subhero(IMG+"bb9bb0_391b36f3ebd04e3182be56e88280aca8~mv2.jpeg",'Pego',
        "Contacta amb el club","Contacta con el club",
        "Tens dubtes o suggeriments? Escriu-nos.","¿Tienes dudas o sugerencias? Escríbenos.",
        pos='25%')+f'''
<section class="section">
  <div class="wrap narrow">
    <div class="reveal">
      <div class="kicker"><span class="va">Escriu-nos</span><span class="es">Escríbenos</span></div>
      <h2><span class="va">Parla amb nosaltres</span><span class="es">Habla con nosotros</span></h2>
      <p class="lead"><span class="va">Gestionem les consultes des del nostre formulari. També pots escriure'ns directament.</span><span class="es">Gestionamos las consultas desde nuestro formulario. También puedes escribirnos directamente.</span></p>
      <div class="info-line"><span class="ic">✉️</span><div><b><span class="va">Correu</span><span class="es">Correo</span></b><br><a data-cms-href="email" href="mailto:cexcursionistapego@gmail.com"><span data-cms="email">cexcursionistapego@gmail.com</span></a></div></div>
      <div class="info-line"><span class="ic">📍</span><div><b><span class="va">Adreça</span><span class="es">Dirección</span></b><br><span data-cms="adreca"><span class="va">Carrer del Llavador, 83</span><span class="es">Calle del Lavadero, 83</span> · 03780 Pego (Alacant)</span></div></div>
      <div class="info-line"><span class="ic">{IG_SVG}</span><div><b>Instagram</b><br><a href="{IG}" target="_blank" rel="noopener">@refugifiguereta</a></div></div>
    </div>
    <div class="reveal">
      <div class="card">
        <h3 style="font-size:1.4rem"><span class="va">Dubtes i suggeriments</span><span class="es">Dudas y sugerencias</span></h3>
        <form id="contacte-form" novalidate>
          <div class="field"><label><span class="va">Nom i cognoms</span><span class="es">Nombre y apellidos</span> *</label><input name="nom" required></div>
          <div class="select-row">
            <div class="field"><label><span class="va">Correu</span><span class="es">Correo</span> *</label><input type="email" name="email" required></div>
            <div class="field"><label><span class="va">Telèfon</span><span class="es">Teléfono</span></label><input name="telefon"></div>
          </div>
          <div class="field"><label><span class="va">Missatge</span><span class="es">Mensaje</span> *</label><textarea name="missatge" required></textarea></div>
          <div class="hp"><label>No omplir<input name="website" tabindex="-1" autocomplete="off"></label></div>
          <button type="submit" id="c-submit" class="btn btn-primary"><span class="va">Enviar missatge</span><span class="es">Enviar mensaje</span></button>
          <div id="c-msg" class="r-msg"></div>
        </form>
      </div>
    </div>
  </div>
</section>
<section class="section-sm" style="padding-top:0">
  <div class="wrap">
    <div class="embed reveal"><iframe src="https://www.google.com/maps?q=Centre%20Excursionista%20Pego&output=embed" height="380" title="Mapa CEPEGO" loading="lazy"></iframe></div>
  </div>
</section>
'''+footer()
    write("contacte.html", doc("Contacte | CEPEGO",
        "Contacta amb el Centre Excursionista de Pego: correu, adreça i formulari de contacte.", contacte, path="contacte.html", extra_js="js/contacte.js"))

    # ============================================= SOCI (ALTA / BAIXA)
    soci=header("soci")+subhero(IMG+"soci-cim.jpg",'<span class="va">Centre Excursionista de Pego</span><span class="es">Centre Excursionista de Pego</span>',
        '<span class="va">Racó del soci</span><span class="es">Área del socio</span>',
        '<span class="va">Racó del soci</span><span class="es">Área del socio</span>',
        '<span class="va">Gestiona la teua pertinença al club: alta, baixa i informació per als socis.</span>',
        '<span class="es">Gestiona tu pertenencia al club: alta, baja e información para los socios.</span>')+f'''
<section class="section" id="alta">
  <div class="wrap narrow">
    <div class="reveal">
      <div class="kicker center-k"><span class="va">Uneix-te al club</span><span class="es">Únete al club</span></div>
      <h2 style="text-align:center"><span class="va">Alta de soci</span><span class="es">Alta de socio</span></h2>
      <p class="lead center" style="text-align:center"><span class="va">La quota anual és de <strong>35 €</strong>. Ompli el formulari i et contactarem per correu electrònic per confirmar-te l'alta i indicar-te com realitzar el pagament.</span><span class="es">La cuota anual es de <strong>35 €</strong>. Rellena el formulario y te contactaremos por correo electrónico para confirmar el alta e indicarte cómo realizar el pago.</span></p>
    </div>
    <div class="card reveal" style="max-width:680px;margin:clamp(24px,3vw,40px) auto 0">
      <form id="alta-form" novalidate>

        <div class="form-section-label"><span class="va">Dades personals</span><span class="es">Datos personales</span></div>
        <div class="select-row">
          <div class="field"><label><span class="va">Nom</span><span class="es">Nombre</span> *</label><input name="nom" required autocomplete="given-name"></div>
          <div class="field"><label><span class="va">Cognoms</span><span class="es">Apellidos</span> *</label><input name="cognoms" required autocomplete="family-name"></div>
        </div>
        <div class="select-row">
          <div class="field"><label>DNI / NIE *</label><input name="dni" required placeholder="12345678A" autocomplete="off"></div>
          <div class="field"><label><span class="va">Data de naixement</span><span class="es">Fecha de nacimiento</span> *</label><input type="date" name="naixement" required></div>
        </div>
        <div class="select-row">
          <div class="field"><label><span class="va">Telèfon</span><span class="es">Teléfono</span> *</label><input type="tel" name="telefon" required autocomplete="tel"></div>
          <div class="field"><label><span class="va">Correu electrònic</span><span class="es">Correo electrónico</span> *</label><input type="email" name="email" required autocomplete="email"></div>
        </div>
        <div class="field"><label><span class="va">Localitat</span><span class="es">Localidad</span> *</label><input name="localitat" required autocomplete="address-level2"></div>

        <div class="form-section-label" style="margin-top:20px"><span class="va">Pagament de la quota</span><span class="es">Pago de la cuota</span></div>
        <div class="field"><label><span class="va">Compte corrent (IBAN)</span><span class="es">Cuenta corriente (IBAN)</span> *</label><input name="iban" required placeholder="ES00 0000 0000 0000 0000 0000" autocomplete="off"></div>

        <div class="form-section-label" style="margin-top:20px"><span class="va">Documentació</span><span class="es">Documentación</span></div>
        <div class="select-row">
          <div class="field"><label><span class="va">Foto DNI (anvers)</span><span class="es">Foto DNI (anverso)</span> *</label><input type="file" name="dni_anvers" accept="image/*" required></div>
          <div class="field"><label><span class="va">Foto DNI (revers)</span><span class="es">Foto DNI (reverso)</span> *</label><input type="file" name="dni_revers" accept="image/*" required></div>
        </div>

        <div class="form-section-label" style="margin-top:20px"><span class="va">Opcions</span><span class="es">Opciones</span></div>
        <div class="field">
          <label class="chk"><input type="checkbox" name="sala" value="1"> <span class="va">Vull utilitzar la sala d'entrenament (<strong>50 €</strong>/any addicionals)</span><span class="es">Quiero utilizar la sala de entrenamiento (<strong>50 €</strong>/año adicionales)</span></label>
        </div>
        <div class="field"><label><span class="va">Notes (opcional)</span><span class="es">Notas (opcional)</span></label><textarea name="notas" rows="2"></textarea></div>

        <div class="hp"><label>No omplir<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <button type="submit" id="alta-submit" class="btn btn-primary" style="width:100%;margin-top:8px"><span class="va">Enviar sol·licitud d'alta</span><span class="es">Enviar solicitud de alta</span></button>
        <p class="note" style="margin:12px 0 0;font-size:.82rem;opacity:.75"><span class="va">* Camps obligatoris. Les teues dades es tracten d'acord amb la normativa RGPD i s'utilitzen exclusivament per a la gestió de la teua pertinença al club.</span><span class="es">* Campos obligatorios. Tus datos se tratan según la normativa RGPD y se utilizan exclusivamente para la gestión de tu pertenencia al club.</span></p>
        <div id="alta-msg" class="r-msg"></div>
      </form>
    </div>
    <div style="text-align:center;margin-top:clamp(24px,3vw,40px);padding-top:clamp(20px,2.5vw,32px);border-top:1px solid var(--hair)">
      <p style="color:var(--muted);font-size:.9rem;margin-bottom:12px"><span class="va">Ja ets soci/a i vols donar-te de baixa?</span><span class="es">¿Ya eres socio/a y quieres darte de baja?</span></p>
      <a href="#baixa" class="btn btn-ghost" style="font-size:.88rem"><span class="va">Baixa de soci →</span><span class="es">Baja de socio →</span></a>
    </div>
  </div>
</section>

<hr class="section-rule" id="baixa">
<section class="section bg-paper2">
  <div class="wrap narrow">
    <div class="reveal" style="text-align:center;margin-bottom:clamp(24px,3vw,40px)">
      <div class="kicker center-k"><span class="va">Donar-se de baixa</span><span class="es">Darse de baja</span></div>
      <h2><span class="va">Baixa de soci</span><span class="es">Baja de socio</span></h2>
      <p class="lead"><span class="va">Lamentem veure't marxar. Omple el formulari amb les teues dades i processarem la baixa. Et confirmarem per correu electrònic.</span><span class="es">Lamentamos verte partir. Rellena el formulario con tus datos y procesaremos la baja. Te confirmaremos por correo electrónico.</span></p>
    </div>
    <div class="card reveal" style="max-width:580px;margin:0 auto">
      <form id="baixa-form" novalidate>
        <div class="select-row">
          <div class="field"><label><span class="va">Nom</span><span class="es">Nombre</span> *</label><input name="nom" required autocomplete="given-name"></div>
          <div class="field"><label><span class="va">Cognoms</span><span class="es">Apellidos</span> *</label><input name="cognoms" required autocomplete="family-name"></div>
        </div>
        <div class="field"><label>DNI / NIE *</label><input name="dni" required placeholder="12345678A" autocomplete="off"></div>
        <div class="select-row">
          <div class="field"><label><span class="va">Correu electrònic</span><span class="es">Correo electrónico</span> *</label><input type="email" name="email" required autocomplete="email"></div>
          <div class="field"><label><span class="va">Telèfon</span><span class="es">Teléfono</span></label><input type="tel" name="telefon" autocomplete="tel"></div>
        </div>
        <div class="field"><label><span class="va">IBAN devolució quota (si escau)</span><span class="es">IBAN devolución cuota (si procede)</span></label><input name="iban" placeholder="ES00 0000 0000 0000 0000 0000"></div>
        <div class="field"><label><span class="va">Foto del DNI (opcional)</span><span class="es">Foto del DNI (opcional)</span></label><input type="file" name="dni_foto" accept="image/*"></div>
        <div class="field"><label><span class="va">Motiu de la baixa (opcional)</span><span class="es">Motivo de la baja (opcional)</span></label><textarea name="missatge" rows="2"></textarea></div>
        <div class="hp"><label>No omplir<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <button type="submit" id="baixa-submit" class="btn btn-ghost" style="width:100%;margin-top:4px"><span class="va">Enviar sol·licitud de baixa</span><span class="es">Enviar solicitud de baja</span></button>
        <div id="baixa-msg" class="r-msg"></div>
      </form>
    </div>
  </div>
</section>
'''+footer()
    write("soci.html", doc("Racó del soci | CEPEGO",
        "Gestiona la teua pertinença al Centre Excursionista de Pego: alta de soci, baixa i informació.", soci, path="soci.html", extra_js="js/soci.js"))

    # ============================================= AVÍS LEGAL / PRIVACITAT / COOKIES
    def legal_head(kva,kes,hva,hes):
        return f'''<section class="section-sm">
  <div class="wrap narrow">
    <div class="kicker"><span class="va">{kva}</span><span class="es">{kes}</span></div>
    <h1 style="font-size:clamp(2rem,4.5vw,3.2rem)"><span class="va">{hva}</span><span class="es">{hes}</span></h1>
  </div>
</section>'''

    avis_legal=header("legal")+legal_head("Informació legal","Información legal","Avís legal","Aviso legal")+f'''
<section class="section" style="padding-top:0">
  <div class="wrap narrow prose">
    <h2><span class="va">1. Dades identificatives</span><span class="es">1. Datos identificativos</span></h2>
    <p><span class="va">En compliment del deure d'informació de la Llei 34/2002, de Serveis de la Societat de la Informació i de Comerç Electrònic (LSSICE), s'informa que este lloc web és titularitat de:</span><span class="es">En cumplimiento del deber de información de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSICE), se informa de que este sitio web es titularidad de:</span></p>
    <ul>
      <li><span class="va">Denominació:</span><span class="es">Denominación:</span> Centre Excursionista de Pego (CEPEGO), <span class="va">associació sense ànim de lucre</span><span class="es">asociación sin ánimo de lucro</span></li>
      <li>NIF/CIF: G03293297</li>
      <li><span class="va">Domicili:</span><span class="es">Domicilio:</span> <span class="va">Carrer del Llavador, 83</span><span class="es">Calle del Lavadero, 83</span> · 03780 Pego (Alacant)</li>
      <li><span class="va">Correu de contacte:</span><span class="es">Correo de contacto:</span> <a href="mailto:cexcursionistapego@gmail.com">cexcursionistapego@gmail.com</a></li>
    </ul>
    <h2><span class="va">2. Objecte</span><span class="es">2. Objeto</span></h2>
    <p><span class="va">Este lloc web té com a finalitat informar sobre les activitats, el refugi La Figuereta i els serveis del Centre Excursionista de Pego, així com gestionar sol·licituds d'alta i baixa de soci, reserves del refugi i consultes generals.</span><span class="es">Este sitio web tiene como finalidad informar sobre las actividades, el refugio La Figuereta y los servicios del Centro Excursionista de Pego, así como gestionar solicitudes de alta y baja de socio, reservas del refugio y consultas generales.</span></p>
    <h2><span class="va">3. Condicions d'ús</span><span class="es">3. Condiciones de uso</span></h2>
    <p><span class="va">L'accés i ús d'este lloc web atribueix la condició d'usuari i implica l'acceptació de les condicions ací establides. L'usuari es compromet a fer un ús adequat dels continguts i a no emprar-los per a activitats il·lícites, contràries a la bona fe i a l'ordre públic.</span><span class="es">El acceso y uso de este sitio web atribuye la condición de usuario e implica la aceptación de las condiciones aquí establecidas. El usuario se compromete a hacer un uso adecuado de los contenidos y a no emplearlos para actividades ilícitas, contrarias a la buena fe y al orden público.</span></p>
    <h2><span class="va">4. Propietat intel·lectual</span><span class="es">4. Propiedad intelectual</span></h2>
    <p><span class="va">Els continguts del lloc web (textos, imatges, disseny gràfic, logotips) són propietat del Centre Excursionista de Pego o de tercers que n'han autoritzat l'ús, i estan protegits per la normativa de propietat intel·lectual. No es permet la seua reproducció sense autorització prèvia.</span><span class="es">Los contenidos del sitio web (textos, imágenes, diseño gráfico, logotipos) son propiedad del Centro Excursionista de Pego o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual. No se permite su reproducción sin autorización previa.</span></p>
    <h2><span class="va">5. Enllaços externs</span><span class="es">5. Enlaces externos</span></h2>
    <p><span class="va">Este lloc pot incloure enllaços a llocs de tercers (AVAMET, Google Maps, Airtable, xarxes socials). El Centre Excursionista de Pego no es fa responsable dels continguts o polítiques d'eixos llocs externs.</span><span class="es">Este sitio puede incluir enlaces a sitios de terceros (AVAMET, Google Maps, Airtable, redes sociales). El Centro Excursionista de Pego no se hace responsable de los contenidos o políticas de esos sitios externos.</span></p>
    <h2><span class="va">6. Legislació aplicable</span><span class="es">6. Legislación aplicable</span></h2>
    <p><span class="va">Estes condicions es regeixen per la legislació espanyola. Per a qualsevol controvèrsia, les parts se sotmeten als jutjats i tribunals de la província d'Alacant.</span><span class="es">Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de la provincia de Alicante.</span></p>
  </div>
</section>
'''+footer()
    write("avis-legal.html", doc("Avís legal | CEPEGO",
        "Avís legal del lloc web del Centre Excursionista de Pego.", avis_legal, path="avis-legal.html"))

    privacitat=header("legal")+legal_head("Protecció de dades","Protección de datos","Política de privacitat","Política de privacidad")+f'''
<section class="section" style="padding-top:0">
  <div class="wrap narrow prose">
    <h2><span class="va">1. Responsable del tractament</span><span class="es">1. Responsable del tratamiento</span></h2>
    <p>Centre Excursionista de Pego · <span class="va">Carrer del Llavador, 83</span><span class="es">Calle del Lavadero, 83</span> · 03780 Pego (Alacant) · <a href="mailto:cexcursionistapego@gmail.com">cexcursionistapego@gmail.com</a></p>
    <h2><span class="va">2. Quines dades recollim i per a què</span><span class="es">2. Qué datos recogemos y para qué</span></h2>
    <ul>
      <li><b><span class="va">Alta i baixa de soci:</span><span class="es">Alta y baja de socio:</span></b> <span class="va">nom, cognoms, DNI/NIE, data de naixement, telèfon, correu, localitat, IBAN i fotografies del DNI, per a gestionar la teua pertinença al club i el cobrament de la quota.</span><span class="es">nombre, apellidos, DNI/NIE, fecha de nacimiento, teléfono, correo, localidad, IBAN y fotografías del DNI, para gestionar tu pertenencia al club y el cobro de la cuota.</span></li>
      <li><b><span class="va">Reserva del refugi:</span><span class="es">Reserva del refugio:</span></b> <span class="va">nom, correu, telèfon, població, nombre de persones i missatge, per a gestionar la teua sol·licitud de reserva.</span><span class="es">nombre, correo, teléfono, población, número de personas y mensaje, para gestionar tu solicitud de reserva.</span></li>
      <li><b><span class="va">Formulari de contacte:</span><span class="es">Formulario de contacto:</span></b> <span class="va">nom, correu, telèfon i missatge, per a respondre les teues consultes o suggeriments.</span><span class="es">nombre, correo, teléfono y mensaje, para responder tus consultas o sugerencias.</span></li>
    </ul>
    <h2><span class="va">3. Base legal</span><span class="es">3. Base legal</span></h2>
    <p><span class="va">El tractament es basa en l'execució d'una relació associativa o contractual (alta de soci, reserva) i en el consentiment de la persona interessada en enviar cada formulari.</span><span class="es">El tratamiento se basa en la ejecución de una relación asociativa o contractual (alta de socio, reserva) y en el consentimiento de la persona interesada al enviar cada formulario.</span></p>
    <h2><span class="va">4. Amb qui compartim les dades</span><span class="es">4. Con quién compartimos los datos</span></h2>
    <p><span class="va">Les dades s'emmagatzemen a Airtable (encarregat del tractament) i el lloc web s'allotja a Netlify. Ambdós proveïdors poden processar dades fora de l'Espai Econòmic Europeu, sota les garanties previstes pel RGPD (clàusules contractuals tipus). No cedim dades a tercers amb finalitats comercials.</span><span class="es">Los datos se almacenan en Airtable (encargado del tratamiento) y el sitio web se aloja en Netlify. Ambos proveedores pueden procesar datos fuera del Espacio Económico Europeo, bajo las garantías previstas por el RGPD (cláusulas contractuales tipo). No cedemos datos a terceros con fines comerciales.</span></p>
    <h2><span class="va">5. Termini de conservació</span><span class="es">5. Plazo de conservación</span></h2>
    <p><span class="va">Les dades de socis es conserven mentre dure la relació associativa i, després, durant els terminis exigits per la normativa aplicable. Les dades de reserves i consultes es conserven el temps necessari per a gestionar-les.</span><span class="es">Los datos de socios se conservan mientras dure la relación asociativa y, después, durante los plazos exigidos por la normativa aplicable. Los datos de reservas y consultas se conservan el tiempo necesario para gestionarlas.</span></p>
    <h2><span class="va">6. Els teus drets</span><span class="es">6. Tus derechos</span></h2>
    <p><span class="va">Pots exercir els teus drets d'accés, rectificació, supressió, oposició, limitació i portabilitat escrivint a</span><span class="es">Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a</span> <a href="mailto:cexcursionistapego@gmail.com">cexcursionistapego@gmail.com</a>. <span class="va">També pots presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (aepd.es) si consideres que no s'han atés els teus drets correctament.</span><span class="es">También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (aepd.es) si consideras que no se han atendido tus derechos correctamente.</span></p>
    <h2><span class="va">7. Seguretat</span><span class="es">7. Seguridad</span></h2>
    <p><span class="va">Apliquem mesures tècniques i organitzatives raonables per a protegir les teues dades contra accessos no autoritzats, pèrdua o alteració.</span><span class="es">Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos no autorizados, pérdida o alteración.</span></p>
    <h2><span class="va">8. Menors d'edat</span><span class="es">8. Menores de edad</span></h2>
    <p><span class="va">L'alta de soci de persones menors d'edat requereix el consentiment i les dades del pare, mare o tutor/a legal.</span><span class="es">El alta de socio de personas menores de edad requiere el consentimiento y los datos del padre, madre o tutor/a legal.</span></p>
  </div>
</section>
'''+footer()
    write("privacitat.html", doc("Política de privacitat | CEPEGO",
        "Política de privacitat i protecció de dades del Centre Excursionista de Pego.", privacitat, path="privacitat.html"))

    cookies=header("legal")+legal_head("Navegació","Navegación","Política de cookies","Política de cookies")+f'''
<section class="section" style="padding-top:0">
  <div class="wrap narrow prose">
    <h2><span class="va">1. Què usem</span><span class="es">1. Qué usamos</span></h2>
    <p><span class="va">Este lloc web no utilitza cookies pròpies d'analítica o publicitat. Únicament guardem al teu navegador (mitjançant <em>localStorage</em>, no una cookie) la teua preferència d'idioma (valencià/castellà), una dada purament tècnica necessària per al funcionament del lloc.</span><span class="es">Este sitio web no utiliza cookies propias de analítica o publicidad. Únicamente guardamos en tu navegador (mediante <em>localStorage</em>, no una cookie) tu preferencia de idioma (valenciano/castellano), un dato puramente técnico necesario para el funcionamiento del sitio.</span></p>
    <h2><span class="va">2. Contingut de tercers</span><span class="es">2. Contenido de terceros</span></h2>
    <p><span class="va">Algunes pàgines inclouen contingut incrustat de tercers que pot instal·lar les seues pròpies cookies quan es carrega:</span><span class="es">Algunas páginas incluyen contenido incrustado de terceros que puede instalar sus propias cookies cuando se carga:</span></p>
    <ul>
      <li><b>Google Maps</b> — <span class="va">mapa a la pàgina de Contacte.</span><span class="es">mapa en la página de Contacto.</span></li>
      <li><b>AVAMET</b> — <span class="va">estacions meteorològiques a les pàgines de Meteo.</span><span class="es">estaciones meteorológicas en las páginas de Meteo.</span></li>
      <li><b>Google Fonts</b> — <span class="va">tipografies del lloc, carregades des dels servidors de Google.</span><span class="es">tipografías del sitio, cargadas desde los servidores de Google.</span></li>
    </ul>
    <p><span class="va">Estos serveis es regeixen per les seues pròpies polítiques de privacitat i cookies, alienes al Centre Excursionista de Pego.</span><span class="es">Estos servicios se rigen por sus propias políticas de privacidad y cookies, ajenas al Centro Excursionista de Pego.</span></p>
    <h2><span class="va">3. Com gestionar-les</span><span class="es">3. Cómo gestionarlas</span></h2>
    <p><span class="va">Pots eliminar o bloquejar les cookies i les dades emmagatzemades pels llocs que visites des de la configuració del teu navegador.</span><span class="es">Puedes eliminar o bloquear las cookies y los datos almacenados por los sitios que visitas desde la configuración de tu navegador.</span></p>
  </div>
</section>
'''+footer()
    write("cookies.html", doc("Política de cookies | CEPEGO",
        "Política de cookies del lloc web del Centre Excursionista de Pego.", cookies, path="cookies.html"))
