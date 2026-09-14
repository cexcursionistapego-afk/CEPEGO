## 6. Información, navegación y movilidad: no quedarse a ciegas

Cuando cae la red, **la información fiable vale más que la comida**. Se aguantan tres días con hambre; no tres días decidiendo a ciegas. La mitad de los errores graves en una crisis —evacuar cuando había que quedarse, gastar el depósito en un viaje inútil— se cometen por no saber **qué pasa** ni **cuánto va a durar**.

Tu objetivo es doble y jerárquico: **primero, una forma de recibir** información (barata, pasiva, casi siempre disponible); **segundo, una forma de transmitir a corta distancia** con familia y vecinos. Transmitir lejos es un lujo que exige licencia y meses de preparación.

### 6.1 Qué comunicaciones fallan y cuáles no

| Sistema | Qué le pasa en una tormenta solar severa | Duración | Qué haces |
|---|---|---|---|
| **HF / onda corta (3–30 MHz)** | Apagón por absorción en la **capa D**, en el hemisferio iluminado. Escala NOAA **R1 (menor) a R5 (extremo)**, según el pico de rayos X | Minutos a horas por evento; **se recupera**. Las noches suelen estar limpias | Reintenta cada hora y de madrugada |
| **Telefonía móvil** | **El teléfono funciona; la red no.** Las estaciones base llevan **baterías de 4–8 h** y luego dependen del generador diésel (días, si alguien reposta). Antes de caerse, se **congestiona** | Horas a días, por zonas | **SMS antes que llamadas**: menos ancho de banda, pasan cuando la voz no |
| **VHF/UHF corta distancia (walkies, 144/430/446 MHz)** | **Prácticamente nada.** Propagación directa: ni ionosfera ni infraestructura | Mientras tengas pilas | Tu columna vertebral local. Los repetidores sí dependen de su propia energía |
| **GNSS (GPS/Galileo)** | **Pérdida de precisión** por retardo ionosférico y centelleo; posibles pérdidas de enganche | Horas a días, intermitente | **Asume que no lo tienes.** Mapa de papel y brújula |
| **Radiodifusión AM (onda media) y FM local** | Emiten mientras tengan generador. La **AM de noche** llega cientos de km por reflexión ionosférica; la FM apenas rebasa el horizonte | Mientras haya gasóleo en la emisora | **Tu mejor fuente oficial.** Escucha a horas en punto |
| **Internet fijo, TDT, satélite doméstico** | Caen con el suministro local aunque el equipo esté intacto | Igual que la red | No cuentes con ellos |

Dos matices honestos: el apagón HF es **temporal y del lado diurno**, no el fin de la onda corta; y la caída del móvil no será instantánea —habrá horas de red saturada antes del silencio. **Usa esa ventana**: manda el SMS de "estoy bien, voy al punto de encuentro" en los primeros minutos.

### 6.2 Tu kit de comunicaciones, por presupuesto

| € | Equipo | Para qué | Legalidad en España/UE |
|---|---|---|---|
| **30–50 €** | **Radio multibanda AM/FM/onda corta con manivela y panel solar** | **El objeto número 1 de la guía.** Recibir boletines oficiales sin depender de nada | Libre |
| +15 € | **Pilas recargables y cargador USB**, con una radio que las admita | La manivela es el respaldo, no el uso diario | Libre |
| **40–80 €/par** | **Walkies PMR446** (446 MHz, 500 mW, 16 canales analógicos, antena fija) | Coordinar familia, portal y vecindario | **Uso libre sin licencia** en toda la UE. No se puede cambiar la antena ni usarlos de repetidor |
| **25 €** | **Receptor SDR (RTL-SDR)** + portátil | Escuchar muchísimo: aviación, marina, radioafición y, con adaptador, HF | Recibir es legal; **divulgar o aprovechar comunicaciones ajenas, no** |
| **80–200 €** | **CB 27 MHz** (40 canales, 4 W AM/FM, 12 W PEP en BLU) | Carretera y camioneros: estado real de las vías. Canal 9 emergencia, 19 carretera | **Uso común sin licencia** desde 2017, con equipo homologado y sin fin lucrativo |
| **60–150 €** | **Handy VHF/UHF de radioaficionado** | Lo mejor en corto y medio alcance, vía repetidor | **Escuchar: legal. Transmitir: exige licencia** |
| **300–900 €** | **Equipo HF + antena NVIS** | **NVIS**: cobertura regional de **50–500 km** en 40 y 80 m con la antena baja (3–5 m en 40 m, 6–8 m en 80 m), radiando casi en vertical | Requiere licencia |

**Sobre la licencia de radioaficionado, sin rodeos.** En España se aprueba un examen (electricidad/radio y reglamentación; no hay Morse desde 2006) y se pagan tasas de unos **138 €**, para un indicativo EA/EB/EC. Es un trámite de **meses** que **se hace ANTES**, no durante la crisis. Transmitir sin licencia es una infracción seria; **escuchar no requiere autorización**, y por eso el SDR de 25 € y un handy en modo solo recepción son la entrada más rentable. (Ante peligro inminente para la vida se admite pedir auxilio por cualquier medio; eso no legitima el uso rutinario de equipos sin licencia.)

**Alcance real, no el de la caja.** Un PMR446 que anuncia "10 km" da **1–3 km en ciudad** y 300–800 m entre edificios; desde una azotea, en línea de visión, sí llega a 5–10 km. Probadlo **hoy** con la familia y anotad dónde funciona y dónde no.

### 6.3 Plan de comunicaciones familiar: el método PACE

**P**rimario, **A**lternativo, **C**ontingencia, **E**mergencia: cuatro formas de contactar, cada una independiente de la anterior. Cuando falla una, todos pasan a la siguiente **sin discutir y sin improvisar**.

| Nivel | Medio | Cómo se usa exactamente |
|---|---|---|
| **P — Primario** | Móvil, **SMS antes que llamada** | Texto corto: "OK / voy a CASA / 19:40" |
| **A — Alternativo** | **Walkie PMR446, canal 7 subtono 7** | **Ventanas de escucha**: encender **en punto y a y media, 5 minutos**; el resto, apagado |
| **C — Contingencia** | **Nota escrita en el buzón nº 12** (o ladrillo suelto del murete del parque) | Lápiz, no bolígrafo (escribe mojado). Fecha, hora, adónde vas, con quién |
| **E — Emergencia** | **Punto de encuentro físico**: primario, la portería de casa; secundario, la puerta sur del colegio | Presentarse **a las 09:00 y las 19:00**, esperar 30 min, dejar nota al irse |

Tres reglas que hacen que el PACE funcione de verdad:

- **Ventanas de escucha.** Un walkie siempre encendido agota la batería en 8–12 h; 5 minutos cada media hora dura **días** y garantiza el encuentro, porque los dos sabéis cuándo escucha el otro.
- **Por escrito, plastificado, en cada cartera y mochila.** En una crisis nadie recuerda el canal: tarjeta con canal, subtono, horas, puntos de encuentro y teléfonos.
- **Un contacto fuera de la región** como **nodo de retransmisión**: dentro de la zona no hay línea, pero una llamada entrante desde fuera o un SMS hacia fuera sí puede pasar. Todos llaman a la misma persona, y esa persona sabe dónde está cada uno.

### 6.4 Disciplina de radio y OPSEC

**La radio no es privada.** Cualquiera con un aparato de 20 € te oye, y en una crisis mucha gente escucha precisamente para saber quién tiene qué.

- **No des por radio**: tu dirección exacta, qué reservas o combustible tienes, ni **cuándo la casa se queda vacía**.
- **Mensajes cortos**: quién llama, a quién, qué necesita, hora. Diez segundos.
- **Nombres en clave sencillos**, acordados por escrito: "Nido" = casa, "Fuente" = punto de agua, "Verde" = todo bien, "Ámbar" = problema, "Rojo" = ayuda ya.
- **Nada de melodrama.** Ni pánico, ni discursos, ni discusiones familiares en el aire; el tono tranquilo también es información.
- Deja el **canal 9 de CB** y las frecuencias de emergencia libres para emergencias reales.

### 6.5 Navegación sin GPS

Compra **hoy**, por unos 10 €, el **mapa topográfico 1:25.000 del IGN de tu comarca** y el **callejero en papel de tu ciudad**.

- **Brújula y declinación magnética.** En la España peninsular es hoy **muy pequeña, del orden de 0° a 2°** (algo Este en el levante, cercana a cero u Oeste en el occidente) y **varía con los años**: consúltala en el calculador del IGN y **anótala a lápiz en el margen del mapa**, con la fecha.
- **Orientar el mapa**: gíralo hasta que su norte apunte al de la brújula; entonces lo que ves delante coincide con el papel. Es el 80 % de la navegación.
- **Rumbo y contrarrumbo**: el de vuelta es el de ida +180°. Anótalo antes de salir.
- **Navegar por el terreno**, no por números: **handrails** (sigue un río, una vía, una línea eléctrica), **catching features** (un límite que te avisa de que te has pasado), **aiming off** (apunta 20° a un lado del puente para saber hacia dónde girar al llegar al río).
- **Distancia**: cuenta **pares de pasos** (calibra cuántos haces en 100 m: suelen ser 60–70) o estima por tiempo.
- **Tiempo de marcha (regla de Naismith)**: **5 km/h en llano + 1 hora por cada 600 m de desnivel positivo**. Con mochila, de noche o con niños, **reduce a 3–4 km/h** y añade paradas: una ruta "de 20 km" con 800 m de subida son **5–6 horas reales**, no tres.
- **Sol y estrellas**: a mediodía solar el sol está al sur. De noche, la **Polar** (prolonga cinco veces el lado de la Osa Mayor) marca el norte; en el hemisferio sur, la **Cruz del Sur** prolongada 4,5 veces marca el sur.
- **Anota tu mapa**: puntos de agua, hospitales, farmacias, salidas de la ciudad, puentes y **cuellos de botella** que se colapsarán, y dos rutas alternativas a cada destino importante.

### 6.6 Movilidad

**La bicicleta es el mejor vehículo de una crisis larga.** No consume combustible, carga **40 kg** con alforjas o remolque, atraviesa atascos y sube a un portal. Ten siempre **dos cámaras, parches y desmontables, cadena de repuesto, radios sueltas, bomba, candado y lubricante**, y aprende a cambiar una cámara antes de necesitarlo.

**El coche**: excelente mientras haya combustible, pésimo a largo plazo. Desmontemos el mito: **un CME no quema tu coche**. Las corrientes geomagnéticamente inducidas afectan a conductores muy largos —líneas de 400 kV, oleoductos, cables submarinos—, no al cableado de tres metros de un vehículo. Arrancará; **lo que no funcionará es la gasolinera**, cuyas bombas sumergidas necesitan electricidad. Regla permanente: **nunca por debajo de medio depósito**.

**Combustible almacenado**: solo en **bidones homologados** (UN/ADR), en pequeña cantidad, en lugar ventilado y fuera de la vivienda y del garaje comunitario —hay límites en la normativa de incendios y en muchos reglamentos de comunidad. Usa **estabilizador** (de 3–6 meses a 1–2 años) y **rota** las existencias. **Sifonar con la boca es peligroso** (aspirar gasolina causa neumonía química), los depósitos modernos llevan válvula antirrobo y sacar combustible de un vehículo ajeno es un delito, también en una crisis.

**A pie**: carga máxima **20–25 % del peso corporal**, ritmo sostenible, calzado ya domado. **Evacuar a pie con familia es el último recurso**: con niños o mayores harás 10–15 km al día en el mejor caso, expuesto y sin poder volver. Quedarse en casa con recursos casi siempre gana.

### 6.7 Habilidades de campo que sí importan

- **Fuego, con tres métodos redundantes**: cinco mecheros baratos repartidos, un **ferrocerio** (funciona mojado y con guantes) y cerillas en un **tarro hermético**. Yesca casera: **bolas de algodón con vaselina** (arden 3–4 minutos), pelusa de secadora, corteza de abedul. Con lluvia, saca la leña de **madera muerta en pie**, nunca del suelo empapado, y ábrela para llegar al corazón seco. Para cocinar, **fuego pequeño y eficiente** —hoyo Dakota o cocina rocket—: menos leña y **casi nada de humo**, que te delata de día como la llama de noche.
- **Seis nudos que cubren el 95 %**: **as de guía** (lazo fijo que no aprieta), **ballestrinque** (amarrar a un poste), **vuelta de escota** (unir cuerdas de distinto grosor), **nudo de leñador** (arrastrar troncos), **prusik** (agarre deslizante sobre otra cuerda) y **tensor / trucker's hitch** (tensar un tarp o una carga: multiplica tu fuerza ×3). Lleva 15 m de paracord y cuerda de 8 mm.
- **Cuchillo y afilado**: hoja fija de 10–12 cm, acero sencillo, espiga completa, seco y aceitado. Afila con piedra a **ángulo constante de 20°**; sin piedra, el **borde sin vidriar del fondo de una taza de cerámica** sirve de emergencia.
- **Refugio improvisado**: **tarp en A** (dos aguas, contra lluvia y viento) o **en cuña/lean-to** (una vertiente abierta al fuego). Y sobre todo **aísla el suelo**: roba más calor que el aire, y 20–30 cm de hojarasca comprimida, cartón o ramas de conífera bajo el cuerpo valen más que una manta encima.
- **Reparar en vez de reemplazar**: cinta americana, alambre fino, bridas, hilo encerado y agujas gruesas, sellador, pegamento bicomponente, multiherramienta. En una crisis larga no hay tienda: quien sabe coser una mochila, remendar una lona y empalmar un cable es el vecino valioso.

### 6.8 El cuaderno y los papeles

Lleva un **cuaderno de bitácora a mano, con lápiz**. Con cansancio y estrés, **la memoria falla a los tres días** y se decide con datos inventados ("creo que nos queda agua para una semana").

Anota cada día: **litros de agua consumidos**, comida gastada y existencias restantes, quién hizo qué tarea, **qué oíste por la radio, en qué emisora y a qué hora** (así detectas si una noticia se repite en bucle o se contradice), síntomas y medicación, y las decisiones tomadas con su porqué. Eso convierte impresiones en datos, y datos en buenas decisiones.

Y ten **en papel y en un pendrive**, en bolsa estanca: DNI y pasaporte escaneados, libro de familia, escrituras o contrato de alquiler, pólizas de seguro, informes médicos y recetas, **la graduación de tus gafas**, contactos con direcciones físicas —no solo móviles— y fotos recientes de cada miembro de la familia, por si hay que buscar o identificar a alguien.
