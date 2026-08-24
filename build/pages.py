# -*- coding: utf-8 -*-
# Cos de cada pàgina del sitio CEPEGO

def build(g):
    doc=g['doc']; header=g['header']; footer=g['footer']; subhero=g['subhero']; write=g['write']
    IMG=g['IMG']; REFUGI=g['REFUGI']; L1=g['L1']; L2=g['L2']; HERO=g['HERO_BENCS']; CREST=g['CREST']
    ALTA=g['ALTA']; BAIXA=g['BAIXA']; RESERVA=g['RESERVA']; GCAL=g['GCAL']; METEO=g['METEO']; METEO_PEGO=g['METEO_PEGO']
    IG=g['IG']; FB=g['FB']
    RESERVA_EMBED="https://airtable.com/embed/appkuKVxHSMyDElfh/pagsRVRH1Oa9zgKka/form"

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
    <div class="kicker on-photo"><span class="va">Pego · Alacant · Des de 1973</span><span class="es">Pego · Alicante · Desde 1973</span></div>
    <h1><span class="va">Vivim la muntanya,<br><em>compartim</em> l'aventura</span><span class="es">Vivimos la montaña,<br><em>compartimos</em> la aventura</span></h1>
    <p><span class="va">El Centre Excursionista de Pego és un club sense ànim de lucre format per gent de totes les edats unida per la natura i els esports de muntanya.</span><span class="es">El Centro Excursionista de Pego es un club sin ánimo de lucro formado por gente de todas las edades unida por la naturaleza y los deportes de montaña.</span></p>
    <div class="hero__actions">
      <a href="soci.html" class="btn btn-primary"><span class="va">Fes-te soci</span><span class="es">Hazte socio</span></a>
      <a href="refugi.html" class="btn btn-ghost"><span class="va">El refugi La Figuereta</span><span class="es">El refugio La Figuereta</span></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="stats reveal">
      <div><div class="n">1973</div><div class="l"><span class="va">Fundació</span><span class="es">Fundación</span></div></div>
      <div><div class="n">540 m</div><div class="l"><span class="va">Altitud del refugi</span><span class="es">Altitud del refugio</span></div></div>
      <div><div class="n">21</div><div class="l"><span class="va">Places al refugi</span><span class="es">Plazas en el refugio</span></div></div>
      <div><div class="n">28</div><div class="l"><span class="va">Vies d'escalada</span><span class="es">Vías de escalada</span></div></div>
    </div>
  </div>
</section>

<hr class="section-rule">
<section class="section" style="padding-top:clamp(48px,7vw,100px)">
  <div class="wrap">
    <div class="split reveal">
      <div class="prose">
        <div class="kicker"><span class="va">El club</span><span class="es">El club</span></div>
        <h2><span class="va">Amics units per la muntanya</span><span class="es">Amigos unidos por la montaña</span></h2>
        <p><span class="va">El CEP està format per amics de diferents generacions, amants de la natura i dels esports d'aventura. Gran part dels membres som persones de diferents edats amb una gran dedicació en tot allò que fem.</span><span class="es">El CEP está formado por amigos de diferentes generaciones, amantes de la naturaleza y de los deportes de aventura. Gran parte de los miembros somos personas de diferentes edades con una gran dedicación en todo lo que hacemos.</span></p>
        <p><span class="va">Tenim dues seccions principals: qui fa senderisme —per la zona i per terres més llunyanes, aprofitant caps de setmana i ponts— i qui es dedica a l'escalada, majoritàriament esportiva, bloc i clàssica. També fem alta muntanya, espeleologia i barranquisme.</span><span class="es">Tenemos dos secciones principales: quien hace senderismo —por la zona y por tierras más lejanas, aprovechando fines de semana y puentes— y quien se dedica a la escalada, mayoritariamente deportiva, bloque y clásica. También hacemos alta montaña, espeleología y barranquismo.</span></p>
        <a href="rutes.html" class="link-arrow"><span class="va">Descobreix les activitats</span><span class="es">Descubre las actividades</span></a>
      </div>
      <div class="split__media">
        <img src="{IMG}bb9bb0_dd4b5c48aab64d6fa0f2f034dfbaf7e1~mv2.jpeg" alt="El refugi La Figuereta al capvespre">
        <div class="tagpin"><span class="n">540</span><span><span class="va">metres<br>d'altitud</span><span class="es">metros<br>de altitud</span></span></div>
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="band__bg" style="background-image:url('{L2}')"></div>
  <div class="band__scrim"></div>
  <div class="wrap">
    <blockquote><span class="va">"La muntanya no és un lloc on anar, és una manera de viure."</span><span class="es">"La montaña no es un lugar al que ir, es una forma de vivir."</span>
      <cite>Centre Excursionista de Pego</cite></blockquote>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="narrow center reveal" style="margin-bottom:clamp(34px,4vw,56px)">
      <div class="kicker center-k"><span class="va">Què fem</span><span class="es">Qué hacemos</span></div>
      <h2><span class="va">Les nostres activitats</span><span class="es">Nuestras actividades</span></h2>
    </div>
    <div class="act-list">
{act_cards}    </div>
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
      <img loading="lazy" src="{IMG}bb9bb0_391b36f3ebd04e3182be56e88280aca8~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_2a340796bdb14c5cacc3936de7383b74~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_82b4e09447a84e64a0cbbb9b026159e5~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_57ae4d984d9c48b2a32c53e3bfe3498d~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_becd04976a1149d3a87a611761d3fe35~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_051b66f2418a4085955891b0c0a262c5~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_e3a29c2c30e74be998225d7b468bbe37~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_c7bc744c47aa43e89c657194275c9132~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_feeaad2d5baf4e91b2f160405d5c0f55~mv2.jpeg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_27dddcd5086a44a0827ac05bf406df3a~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_f8b750629ad5479d9b83d134fca28bb2~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_0a8a6079eb9e4d08b920f87662ca13a0~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_a878841efccf4e4cbfd75fa1348c80d8~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_b4b6f8c3f6f144d3854112914b948cc3~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_61c60a6949b449169cf212140f7dfec0~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_8ac56ee5cd134f028578b52d80640a5c~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_198f57a26919421c999cdc96a0534cf5~mv2.jpg" alt="Jornada de recuperació de senders">
      <img loading="lazy" src="{IMG}bb9bb0_43da4fad9c1547daa345593283911dfb~mv2.jpg" alt="Jornada de recuperació de senders">
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split reverse reveal">
      <div class="prose">
        <div class="kicker"><span class="va">El refugi</span><span class="es">El refugio</span></div>
        <h2>La Figuereta</h2>
        <p><span class="va">El nostre refugi de muntanya, a la Vall d'Ebo, sobre un macís calcari a 540 m. Equipat per a 21 persones per passar uns dies fent senderisme, escalada, barrancs, espeleologia o turisme rural.</span><span class="es">Nuestro refugio de montaña, en la Vall d'Ebo, sobre un macizo calcáreo a 540 m. Equipado para 21 personas para pasar unos días haciendo senderismo, escalada, barrancos, espeleología o turismo rural.</span></p>
        <div class="hero__actions" style="margin-top:8px">
          <a href="reservar.html" class="btn btn-navy"><span class="va">Disponibilitat i reserva</span><span class="es">Disponibilidad y reserva</span></a>
          <a href="refugi.html" class="btn btn-outline"><span class="va">Conéixer el refugi</span><span class="es">Conocer el refugio</span></a>
        </div>
      </div>
      <div class="split__media"><img src="{REFUGI[0]}" alt="Refugi La Figuereta"></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split reveal">
      <div class="prose">
        <div class="kicker"><span class="va">Fes-te soci</span><span class="es">Hazte socio</span></div>
        <h2><span class="va">Forma part del club</span><span class="es">Forma parte del club</span></h2>
        <p><span class="va">Per només <strong data-cms="quota_soci">35 €</strong> a l'any ajudes al manteniment i senyalització de les sendes de Pego i les valls, i gaudeixes de descomptes al refugi. Amb la sala d'entrenament (<strong data-cms="quota_sala">50 €</strong>/any) pots entrenar totes les disciplines de muntanya.</span><span class="es">Por solo <strong>35 €</strong> al año ayudas al mantenimiento y señalización de las sendas de Pego y sus valles, y disfrutas de descuentos en el refugio. Con la sala de entrenamiento (<strong>50 €</strong>/año) puedes entrenar todas las disciplinas de montaña.</span></p>
        <div class="hero__actions" style="margin-top:8px">
          <a href="{ALTA}" target="_blank" rel="noopener" class="btn btn-primary"><span class="va">Alta de soci</span><span class="es">Alta de socio</span></a>
          <a href="{BAIXA}" target="_blank" rel="noopener" class="btn btn-outline"><span class="va">Baixa de soci</span><span class="es">Baja de socio</span></a>
        </div>
      </div>
      <div class="split__media"><img src="{REFUGI[4]}" alt="Grup del CEPEGO a la muntanya"></div>
    </div>
  </div>
</section>
'''+footer()
    write("index.html", doc("Centre Excursionista de Pego | Refugi La Figuereta",
        "Club de muntanya sense ànim de lucre des de 1973 a Pego. Senderisme, escalada, barranquisme, espeleologia i el refugi La Figuereta.",
        home, identity=True))

    # ============================================= REFUGI
    equip=[("Una llar amb llenya per a fer foc i rostir (proporcionem les ferramentes).","Chimenea con leña para hacer fuego y asar (proporcionamos las herramientas)."),
     ("Cuina amb 4 fogons de gas (bombona de butà inclosa).","Cocina con 4 fogones de gas (bombona de butano incluida)."),
     ("Nevera amb congelador, microones i torrador de pa.","Nevera con congelador, microondas y tostador de pan."),
     ("Cafetera Nespresso: 1 € la càpsula.","Cafetera Nespresso: 1 € la cápsula."),
     ("Endolls a 220 v.","Enchufes a 220 v."),
     ("Lavabos i dutxa amb aigua calenta (moneda d'1 €, dóna per a dues persones).","Lavabos y ducha con agua caliente (moneda de 1 €, da para dos personas)."),
     ("Aigüera exterior amb punts d'aigua (NO potable).","Fregadero exterior con puntos de agua (NO potable)."),
     ("Internet de banda ampla (cal reservar-lo).","Internet de banda ancha (hay que reservarlo)."),
     ("No hi ha utensilis de cuina: porta el que necessites.","No hay utensilios de cocina: trae lo que necesites."),
     ("Lliteres amb matalàs i coixí: només cal el sac de dormir.","Literas con colchón y cojín: solo hace falta el saco de dormir.")]
    def eq_li(idxs):
        return "".join(f'          <li><span class="va">{equip[i][0]}</span><span class="es">{equip[i][1]}</span></li>\n' for i in idxs)
    refugi=header("refugi")+subhero(REFUGI[0],'<span class="va">Vall d\'Ebo · 540 m</span><span class="es">Vall d\'Ebo · 540 m</span>',
        "La Figuereta","La Figuereta",
        "El refugi de muntanya del Centre Excursionista de Pego.","El refugio de montaña del Centro Excursionista de Pego.")+f'''

<section class="section">
  <div class="wrap">

    <!-- Intro + heading BEFORE mosaic -->
    <div class="narrow center reveal" style="margin-bottom:clamp(32px,4.5vw,60px)">
      <p class="lead"><span class="va">La Figuereta és el refugi del Centre Excursionista de Pego, a la Vall d'Ebo, habilitat per passar uns dies en la natura fent senderisme, escalada, descens de barrancs, espeleologia o turisme rural pels pobles propers.</span><span class="es">La Figuereta es el refugio del Centro Excursionista de Pego, en la Vall d'Ebo, habilitado para pasar unos días en la naturaleza haciendo senderismo, escalada, barrancos, espeleología o turismo rural por los pueblos cercanos.</span></p>
      <div class="kicker center-k" style="margin-top:clamp(28px,4vw,52px)"><span class="va">Equipament</span><span class="es">Equipamiento</span></div>
      <h2 style="margin-top:.4em"><span class="va">Tot a punt per a 21 persones</span><span class="es">Todo listo para 21 personas</span></h2>
      <p><span class="va">Dos habitacles comunicats amb lliteres, cuina completa i tots els serveis per gaudir de la natura.</span><span class="es">Dos habitáculos comunicados con literas, cocina completa y todos los servicios para disfrutar de la naturaleza.</span></p>
    </div>

    <!-- MOSAIC INTRO: tall left + 2 right stacked -->
    <div class="refugi-mosaic reveal" style="margin-bottom:clamp(44px,6vw,80px)">
      <div class="refugi-mosaic__main">
        <img loading="lazy" src="{REFUGI[1]}" alt="Refugi La Figuereta">
      </div>
      <div><img loading="lazy" src="{REFUGI[2]}" alt="Refugi La Figuereta"></div>
      <div><img loading="lazy" src="{REFUGI[3]}" alt="Refugi La Figuereta"></div>
    </div>

    <!-- BLOC 1: CUINA — foto esquerra -->
    <div class="equip-block reveal">
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[7]}" alt="Cuina del refugi">
      </div>
      <div>
        <span class="equip-tag"><span class="va">Cuina i àpats</span><span class="es">Cocina y comidas</span></span>
        <h3 style="margin-top:.5em"><span class="va">Cuina equipada per a tothom</span><span class="es">Cocina equipada para todos</span></h3>
        <ul class="equip equip-1col" style="margin-top:18px">
{eq_li([0,1,2,3,8])}        </ul>
      </div>
    </div>

    <!-- FRANJA FOTOGRÀFICA -->
    <div class="photo-strip reveal">
      <img loading="lazy" src="{REFUGI[5]}" alt="Refugi La Figuereta">
      <img loading="lazy" src="{REFUGI[6]}" alt="Refugi La Figuereta">
      <img loading="lazy" src="{REFUGI[8]}" alt="Refugi La Figuereta">
    </div>

    <!-- BLOC 2: DORMIR — foto dreta amb badge -->
    <div class="equip-block equip-block--rev reveal">
      <div>
        <span class="equip-tag"><span class="va">Dormir</span><span class="es">Dormir</span></span>
        <h3 style="margin-top:.5em"><span class="va">Descansa com a casa</span><span class="es">Descansa como en casa</span></h3>
        <ul class="equip equip-1col" style="margin-top:18px">
{eq_li([9])}        </ul>
        <p style="margin-top:16px;font-size:.94rem;color:var(--muted)"><span class="va">Dos habitacles separats però comunicats. Porta sempre el teu sac de dormir.</span><span class="es">Dos habitáculos separados pero comunicados. Trae siempre tu saco de dormir.</span></p>
      </div>
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[4]}" alt="Dormitori del refugi">
        <div class="cap-badge">
          <div class="n">21</div>
          <div class="l"><span class="va">places<br>màxim</span><span class="es">plazas<br>máximo</span></div>
        </div>
      </div>
    </div>

    <!-- BLOC 3: SERVEIS — foto esquerra -->
    <div class="equip-block reveal">
      <div class="equip-block__media">
        <img loading="lazy" src="{REFUGI[11]}" alt="Exterior del refugi La Figuereta">
      </div>
      <div>
        <span class="equip-tag"><span class="va">Instal·lacions</span><span class="es">Instalaciones</span></span>
        <h3 style="margin-top:.5em"><span class="va">Tot el que necessites</span><span class="es">Todo lo que necesitas</span></h3>
        <ul class="equip equip-1col" style="margin-top:18px">
{eq_li([4,5,6,7])}        </ul>
        <p class="note" style="margin-top:18px"><span class="va">⚠️ L'aigua és d'una cava natural i <strong>no és potable</strong>: porta la teua per a consumir.</span><span class="es">⚠️ El agua es de una cava natural y <strong>no es potable</strong>: trae la tuya para consumir.</span></p>
      </div>
    </div>

    <!-- DUO FINAL -->
    <div class="photo-duo reveal">
      <img loading="lazy" src="{REFUGI[9]}" alt="Entorn del refugi">
      <img loading="lazy" src="{REFUGI[10]}" alt="Alta muntanya des del refugi">
    </div>

  </div>
</section>

<section class="section bg-paper2">
  <div class="wrap grid cols-2">
    <div class="card reveal">
      <h3><span class="va">Com arribar</span><span class="es">Cómo llegar</span></h3>
      <p><span class="va">Per la carretera de Pego a la Vall d'Ebo (CV-712), uns 8 km. Quan comença a baixar cap a Ebo, uns 200 m més avall a mà dreta trobem el camí d'accés, ben senyalitzat. Després d'1,7 km s'arriba al refugi.</span><span class="es">Por la carretera de Pego a la Vall d'Ebo (CV-712), unos 8 km. Cuando empieza a bajar hacia Ebo, unos 200 m más abajo a mano derecha encontramos el camino de acceso, bien señalizado. Tras 1,7 km se llega al refugio.</span></p>
      <a class="btn btn-outline" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Refugi+La+Figuereta+Vall+d%27Ebo">Google Maps</a>
    </div>
    <div class="card reveal">
      <h3><span class="va">Entorn natural</span><span class="es">Entorno natural</span></h3>
      <p><span class="va">Sobre un macís calcari a 540 m, amb vegetació de bosc baix mediterrani —argelagues, margallons, pi blanc— i fins i tot la Llengua de Cèrvol, espècie endèmica i protegida dels avencs de la zona. Al voltant, turisme rural i gastronomia a Ebo, Vall d'Alcalà, Laguar, Gallinera i Pego.</span><span class="es">Sobre un macizo calcáreo a 540 m, con vegetación de bosque bajo mediterráneo —aliagas, palmitos, pino blanco— e incluso la Lengua de Ciervo, especie endémica y protegida de los avencos de la zona. Alrededor, turismo rural y gastronomía en Ebo, Vall d'Alcalà, Laguar, Gallinera y Pego.</span></p>
    </div>
  </div>
</section>
'''+footer()
    write("refugi.html", doc("La Figuereta | Centre Excursionista de Pego",
        "Refugi de muntanya La Figuereta, a la Vall d'Ebo. Equipament complet per a 21 persones.", refugi))

    # ============================================= RESERVAR
    rules=[("Sols es pot fer foc a la xemeneia de dins del refugi; proporcionem llenya, graelles i material lliure de tòxics.","Solo se puede hacer fuego en la chimenea del interior; proporcionamos leña, parrillas y material libre de tóxicos."),
     ("No deixar el foc encés al dormir.","No dejar el fuego encendido al dormir."),
     ("Tancar les dues claus de pas de l'aigua després de l'estada.","Cerrar las dos llaves de paso del agua tras la estancia."),
     ("Deixar el refugi igual o millor, i emportar-se tota la brossa.","Dejar el refugio igual o mejor, y llevarse toda la basura."),
     ("Respectar l'entorn, la flora i la fauna.","Respetar el entorno, la flora y la fauna."),
     ("Cabuda màxima de 21 persones.","Cabida máxima de 21 personas."),
     ("Portar utensilis de cuina i sac de dormir.","Traer utensilios de cocina y saco de dormir."),
     ("L'aigua és d'una cava natural: millor porta la teua per a consumir.","El agua es de una cava natural: mejor trae la tuya para consumir."),
     ("Eixida: 12:00 h dissabtes i 17:00 h diumenges.","Salida: 12:00 h sábados y 17:00 h domingos.")]
    rl="".join(f'      <li><span class="va">{va}</span><span class="es">{es}</span></li>\n' for va,es in rules)
    reservar=header("reservar")+subhero(REFUGI[5],'<span class="va">Refugi La Figuereta</span><span class="es">Refugio La Figuereta</span>',
        "Reservar","Reservar",
        "Disponibilitat i sol·licitud de reserva del refugi La Figuereta.","Disponibilidad y solicitud de reserva del refugio La Figuereta.")+f'''
<section class="section-sm">
  <div class="wrap narrow center reveal">
    <div class="kicker center-k"><span class="va">Com funciona</span><span class="es">Cómo funciona</span></div>
    <h2><span class="va">Tria les dates i envia la sol·licitud</span><span class="es">Elige las fechas y envía la solicitud</span></h2>
    <p class="lead"><span class="va">Al calendari veus els dies lliures i els ja reservats. Tria les teues dates, envia la sol·licitud i <strong>nosaltres la revisarem</strong>. Et contactarem per confirmar-la i indicar-te el pagament de la senyal (50 €). El total es paga una setmana abans d'entrar.</span><span class="es">En el calendario ves los días libres y los ya reservados. Elige tus fechas, envía la solicitud y <strong>nosotros la revisaremos</strong>. Te contactaremos para confirmarla e indicarte el pago de la señal (50 €). El total se paga una semana antes de entrar.</span></p>
    <div class="prices" style="max-width:560px;margin:22px auto 0">
      <div class="price"><div class="n" data-cms="preu1">190 €</div><div class="l"><span class="va">1 nit</span><span class="es">1 noche</span></div></div>
      <div class="price"><div class="n" data-cms="preu2">250 €</div><div class="l"><span class="va">2 nits</span><span class="es">2 noches</span></div></div>
      <div class="price"><div class="n" data-cms="preu3">350 €</div><div class="l"><span class="va">3 nits</span><span class="es">3 noches</span></div></div>
    </div>
  </div>
</section>

<div class="wrap narrow" style="padding-top:clamp(20px,3vw,36px)">
  <div class="avis reveal" style="border-radius:var(--r);margin-bottom:clamp(16px,2.5vw,28px)">
    <span class="va">&#x26A0;&#xFE0F; El refugi <strong>no admet reserves del 31 de maig al 1 d'octubre</strong> (tancament d'estiu anual).</span>
    <span class="es">&#x26A0;&#xFE0F; El refugio <strong>no admite reservas del 31 de mayo al 1 de octubre</strong> (cierre de verano anual).</span>
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
            <div class="field"><label><span class="va">Nº persones</span><span class="es">Nº personas</span></label><input type="number" name="persones" min="1" max="21"></div>
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

<section class="section">
  <div class="wrap">
    <div class="narrow center reveal" style="margin-bottom:clamp(24px,3vw,40px)">
      <div class="kicker center-k">⚠️ <span class="va">Normes</span><span class="es">Normas</span></div>
      <h2><span class="va">Abans de la teua estada</span><span class="es">Antes de tu estancia</span></h2>
    </div>
    <ul class="rules narrow">
{rl}    </ul>
    <p class="note narrow" style="margin-top:22px;border-left:3px solid var(--ember)"><span class="va">En realitzar la reserva, l'usuari o club assumeix plenament la responsabilitat per qualsevol accident o incident durant l'ús de l'espai cedit, eximint la part cedent de qualsevol responsabilitat. Reconeix haver sigut informat de les condicions d'ús i les accepta de forma voluntària.</span><span class="es">Al realizar la reserva, el usuario o club asume plenamente la responsabilidad por cualquier accidente o incidente durante el uso del espacio cedido, eximiendo a la parte cedente de cualquier responsabilidad. Reconoce haber sido informado de las condiciones de uso y las acepta de forma voluntaria.</span></p>
  </div>
</section>
'''+footer()
    write("reservar.html", doc("Reservar | Refugi La Figuereta — CEPEGO",
        "Disponibilitat, normes i sol·licitud de reserva del refugi La Figuereta.", reservar, extra_js="js/reserves.js"))

    # ============================================= METEO
    meteo=header("meteo")+subhero(HERO,'AVAMET',
        "El temps al refugi","Meteo al refugio",
        "Estació meteorològica a La Figuereta, connectada a la xarxa AVAMET.","Estación meteorológica en La Figuereta, conectada a la red AVAMET.")+f'''
<section class="section">
  <div class="wrap">
    <div class="embed reveal" style="max-width:1000px;margin:0 auto">
      <iframe src="{METEO}" title="AVAMET — La Figuereta" scrolling="no" style="height:1180px;max-height:82vh"></iframe>
    </div>
    <div class="center" style="margin-top:24px">
      <a class="btn btn-outline" target="_blank" rel="noopener" href="{METEO}"><span class="va">Obrir a AVAMET</span><span class="es">Abrir en AVAMET</span></a>
    </div>
  </div>
</section>
'''+footer()
    write("meteo.html", doc("El temps al refugi | CEPEGO",
        "Estació meteorològica del refugi La Figuereta connectada a la xarxa AVAMET.", meteo))

    # ============================================= METEO PEGO
    meteo_pego=header("meteo-pego")+subhero(L2,'AVAMET',
        "El temps a Pego","El tiempo en Pego",
        "Estació meteorològica a Pego, connectada a la xarxa AVAMET.","Estación meteorológica en Pego, conectada a la red AVAMET.")+f'''
<section class="section">
  <div class="wrap">
    <div class="embed reveal" style="max-width:1000px;margin:0 auto">
      <iframe src="{METEO_PEGO}" title="AVAMET — Pego" scrolling="no" style="height:1180px;max-height:82vh"></iframe>
    </div>
    <div class="center" style="margin-top:24px">
      <a class="btn btn-outline" target="_blank" rel="noopener" href="{METEO_PEGO}"><span class="va">Obrir a AVAMET</span><span class="es">Abrir en AVAMET</span></a>
    </div>
  </div>
</section>
'''+footer()
    write("meteo-pego.html", doc("El tiempo en Pego | CEPEGO",
        "Estació meteorològica de Pego connectada a la xarxa AVAMET.", meteo_pego))

    # ============================================= RUTES
    routes=[("Circular Figuereta – Tossal","2,97 km","+154 m","673 m","facil","Fàcil","Fácil",
      "Figuereta · Cova Blanca · Tossal Gran · Despoblat Beniqueis · Camí de la Figuereta · Coveta de Llúcia · Figuereta.",
      IMG+"bb9bb0_7e2efa67934342c2974582cae5147165~mv2.png"),
     ("Circular Figuereta – Ebo","8,4 km","+294 m","598 m","moderada","Moderada","Moderada",
      "Figuereta · Travessia del Maset · Avenc Estret i del Mig · Riu Girona · Font del Gili · Ebo · Camí Vell d'Atzúbia · Tossal Gran · Figuereta.",
      IMG+"bb9bb0_08ee550eeae74d7fbc28b76279017f00~mv2.png"),
     ("Circular Pego – Figuereta","11,57 km","+563 m","587 m","moderada","Moderada","Moderada",
      "Pego · Calvari · Escola d'Escalada · Barranc de les Coves · Font del Lliberet · Bodoix · La Figuereta · Senda del Xical · Barranc de la Canal · Calvari.",
      IMG+"bb9bb0_7f7f8275a09b48738568bbb829a360c7~mv2.png")]
    rc=""
    for name,dist,desn,alt,tc,tva,tes,itin,img in routes:
        rc+=f'''      <div class="route reveal">
        <a class="route__img" href="{img}"><img loading="lazy" src="{img}" alt="Mapa {name}"></a>
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
    rutes=header("rutes")+subhero(L2,'Wikiloc',
        "Rutes i entorn","Rutas y entorno",
        "Les principals rutes per Pego i les Valls, amb distància, desnivell i itinerari.","Las principales rutas por Pego y sus valles, con distancia, desnivel e itinerario.")+f'''
<section class="section">
  <div class="wrap">
    <div class="grid cols-3">
{rc}    </div>
  </div>
</section>
'''+footer()
    write("rutes.html", doc("Rutes i entorn | CEPEGO",
        "Rutes de senderisme per Pego i les Valls amb el seu perfil i itinerari.", rutes))

    # ============================================= ESCALADA
    inic=[("1","Diedre","V"),("2","Placa","V"),("3","Plaqueta","IV"),("4","Mosquera","V"),("5","Ximet","V"),
     ("6","Forats","V+"),("7","Chaqueta d'ocasió","6a+"),("8","El salt del jaguar","6b+/c"),("9","Politoxicómano","V+"),
     ("10","Perro flaco","V+"),("11","Hace calor","V+"),("12","Rocofobia","6a"),("13","Duende","V+")]
    placa=[("1","Forats negres","6a"),("2","Cabra loca","6b"),("3","Borrego volador","6b+/c"),("4","La figa de ta tia","6c"),
     ("5","Muca muca","7a"),("6","Teto","7a"),("7","Anaconda","7c"),("8","Quimera","6b+/c"),("9","Garguller","7a+/b"),
     ("10","Me'n Fot Dénia","6b+"),("11","Mística","6c"),("12","Plat Combinat","V"),("13","Plat Combinat II","V+"),
     ("14","Rafelet un flanet","V"),("15","Caldetes","V+")]
    def via(cap,rows):
        tr="".join(f'    <tr><td>{n}</td><td>{nm}</td><td>{g}</td></tr>\n' for n,nm,g in rows)
        return f'  <table class="viatable"><caption>{cap}</caption>\n{tr}  </table>'
    escalada=header("escalada")+subhero(L1,'<span class="va">Calvari · Pego</span><span class="es">Calvari · Pego</span>',
        "Escalada","Escalada",
        "L'escola d'escalada del Calvari: dos sectors i 28 vies equipades.","La escuela de escalada del Calvari: dos sectores y 28 vías equipadas.")+f'''
<section class="section">
  <div class="wrap">
    <p class="lead narrow reveal" style="margin-bottom:clamp(34px,4vw,56px)"><span class="va">L'accés és molt fàcil, seguint el camí al final del Passeig del Calvari. En arribar al barranc, a mà esquerra hi ha les indicacions. Consta de dos sectors: <strong>Iniciació</strong> (13 vies de IV a 6b+/c, uns 12 m) i <strong>Placa del Sol</strong> (15 vies de V a 7c, de 20 a 27 m, el més dur i espectacular). Equipament de parabolt de 10 mm i cadenes amb mosquetó fixe.</span><span class="es">El acceso es muy fácil, siguiendo el camino al final del Paseo del Calvari. Al llegar al barranco, a mano izquierda están las indicaciones. Consta de dos sectores: <strong>Iniciación</strong> (13 vías de IV a 6b+/c, unos 12 m) y <strong>Placa del Sol</strong> (15 vías de V a 7c, de 20 a 27 m, el más duro y espectacular). Equipamiento de parabolt de 10 mm y cadenas con mosquetón fijo.</span></p>
    <div class="grid cols-2" style="align-items:start">
{via("Sector Iniciació",inic)}
{via("Sector Placa del Sol",placa)}
    </div>
    <div class="topos reveal" style="margin-top:34px">
      <a href="{IMG}bb9bb0_8ac538198ebe452eb7192aadfadf4652~mv2.png"><img loading="lazy" src="{IMG}bb9bb0_8ac538198ebe452eb7192aadfadf4652~mv2.png" alt="Ressenya escalada"></a>
      <a href="{IMG}bb9bb0_62daeaf5f5f044a0a19c177e3c098354~mv2.png"><img loading="lazy" src="{IMG}bb9bb0_62daeaf5f5f044a0a19c177e3c098354~mv2.png" alt="Ressenya escalada"></a>
    </div>
  </div>
</section>
'''+footer()
    write("escalada.html", doc("Escalada | CEPEGO",
        "Escola d'escalada del Calvari a Pego: sectors Iniciació i Placa del Sol, 28 vies.", escalada))

    # ============================================= ESPELEO
    espeleo=header("espeleo")+subhero(REFUGI[9],'<span class="va">Avencs i coves</span><span class="es">Avencos y cuevas</span>',
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
    write("espeleo.html", doc("Espeleologia | CEPEGO",
        "Les principals cavitats i avencs de la zona de Pego, amb les seues topografies.", espeleo))

    # ============================================= BARRANCS
    barrancs=header("barrancs")+subhero(REFUGI[5],'<span class="va">Aigua i roca</span><span class="es">Agua y roca</span>',
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
    write("barrancs.html", doc("Barrancs | CEPEGO",
        "Els principals barrancs de la zona de Pego, amb material i topografia.", barrancs))

    # ============================================= CALENDARI
    calendari=header("calendari")+subhero(L2,'<span class="va">Activitats</span><span class="es">Actividades</span>',
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
        "Activitats del Centre Excursionista de Pego al llarg de l'any.", calendari))

    # ============================================= CONTACTE
    contacte=header("contacte")+subhero(REFUGI[4],'Pego',
        "Contacta amb el club","Contacta con el club",
        "Vols fer-te soci o passar uns dies a La Figuereta? Escriu-nos.","¿Quieres hacerte socio o pasar unos días en La Figuereta? Escríbenos.")+f'''
<section class="section">
  <div class="wrap contact-grid">
    <div class="reveal">
      <div class="kicker"><span class="va">Escriu-nos</span><span class="es">Escríbenos</span></div>
      <h2><span class="va">Parla amb nosaltres</span><span class="es">Habla con nosotros</span></h2>
      <p class="lead"><span class="va">Gestionem les consultes i sol·licituds de reserva des del nostre formulari. També pots escriure'ns directament.</span><span class="es">Gestionamos las consultas y solicitudes de reserva desde nuestro formulario. También puedes escribirnos directamente.</span></p>
      <div class="info-line"><span class="ic">✉️</span><div><b><span class="va">Correu</span><span class="es">Correo</span></b><br><a data-cms-href="email" href="mailto:cexcursionistapego@gmail.com"><span data-cms="email">cexcursionistapego@gmail.com</span></a></div></div>
      <div class="info-line"><span class="ic">📍</span><div><b><span class="va">Adreça</span><span class="es">Dirección</span></b><br><span data-cms="adreca">Carrer Llavador, s/n · 03780 Pego (Alacant)</span></div></div>
      <div class="info-line"><span class="ic">📷</span><div><b>Instagram</b><br><a href="{IG}" target="_blank" rel="noopener">@refugifiguereta</a></div></div>
      <div style="margin-top:26px"><a class="btn btn-primary" href="{RESERVA}" target="_blank" rel="noopener"><span class="va">Formulari de contacte i reserva</span><span class="es">Formulario de contacto y reserva</span></a></div>
    </div>
    <div class="reveal">
      <div class="embed"><iframe src="{RESERVA_EMBED}" title="Formulari de contacte" style="height:640px;background:#fff"></iframe></div>
    </div>
  </div>
</section>
<section class="section-sm" style="padding-top:0">
  <div class="wrap">
    <div class="embed reveal"><iframe src="https://www.google.com/maps?q=Carrer%20Llavador%2C%20Pego%2C%20Alacant&output=embed" height="380" title="Mapa CEPEGO" loading="lazy"></iframe></div>
  </div>
</section>
'''+footer()
    write("contacte.html", doc("Contacte | CEPEGO",
        "Contacta amb el Centre Excursionista de Pego: correu, telèfon i formulari de reserva.", contacte))

    # ============================================= SOCI (ALTA / BAIXA)
    soci=header("soci")+subhero(REFUGI[1],'<span class="va">Centre Excursionista de Pego</span><span class="es">Centre Excursionista de Pego</span>',
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
        "Gestiona la teua pertinença al Centre Excursionista de Pego: alta de soci, baixa i informació.", soci, extra_js="js/soci.js"))
