## 6. Información, navegación y movilidad: no quedarse a ciegas

Cuando cae la red, **la información fiable vale más que la comida**: la mitad de los errores graves de una crisis —evacuar cuando había que quedarse, gastar el depósito en un viaje inútil— se cometen por no saber **qué está pasando** ni **cuánto va a durar**.

Esto no cambia el orden de prioridades del manual (**temperatura → agua → sueño → comida**): la información no calienta ni hidrata, pero te dice **cuánto tienes que estirar** lo que ya tienes.

Tu objetivo es doble: **primero, una forma de recibir** información —barata, pasiva, casi siempre disponible—; **segundo, transmitir a corta distancia** con familia y vecinos. Transmitir lejos exige licencia y meses de preparación. Recibir cuesta 40 €.

### 6.1 Qué comunicaciones fallan, cuáles no, y por qué

| Sistema | Qué le pasa en una tormenta solar severa | Duración | Qué haces |
|---|---|---|---|
| **HF / onda corta (3–30 MHz)** | **Apagón de radio** por absorción en la **capa D**, en el hemisferio iluminado. Escala NOAA **R1 (menor) a R5 (extremo)**, según el pico de rayos X | Minutos a horas; **se recupera**. Noches suelen estar limpias | Reintenta cada hora, sobre todo **de madrugada** |
| **Telefonía móvil** | **El teléfono funciona; la red no.** Batería de la estación base y luego generador diésel, si lo hay y lo reponen. Se **congestiona** antes de caer | **Horas, no días**, en la práctica | **SMS antes que llamadas**, en los primeros minutos |
| **VHF/UHF a corta distancia (walkies, 144/430/446 MHz)** | **Prácticamente nada**: propagación directa, sin ionosfera de por medio | Mientras tengas pilas | **Tu columna vertebral local** |
| **GNSS (GPS/Galileo)** | **Se degrada, no desaparece**: retardo ionosférico y centelleo; error de metros a decenas de metros | Horas a días, intermitente | **No te fíes de la precisión.** Navega en papel |
| **Radiodifusión AM (onda media) y FM local** | Emiten mientras tengan generador. **AM de noche** llega cientos de km por reflexión ionosférica; FM apenas rebasa el horizonte | Mientras haya gasóleo en la emisora | **Tu mejor fuente oficial** |
| **Internet fijo, TDT, satélite doméstico** | Caen con el suministro local aunque tu equipo esté intacto; el transporte (fibra, armarios) tiene **menos respaldo que la propia antena** | Igual o peor que el móvil | No cuentes con ellos |

**Por qué cae la HF y el walkie no.** La absorción de la capa D es **inversamente proporcional al cuadrado de la frecuencia**: doblar la frecuencia la reduce en torno a un 75 %. Por eso 80 y 40 metros se apagan primero y a 144–446 MHz el efecto es despreciable —y el walkie, además, no necesita la ionosfera en absoluto.

> **Caso real, apagón ibérico del 28-IV-2025.** El corte empezó a las 12:33; **la cobertura móvil cayó a ~10 % en las primeras horas**, y hacia las **18:06** las telecomunicaciones —fibra, móvil, fijo— estaban prácticamente caídas. Los generadores fueron recuperando emplazamientos urbanos por la noche: a las **07:00 del día siguiente** circulaba de nuevo ~60 % del tráfico móvil urbano. Lectura: **la degradación es grave a las 5–6 horas**, muy por debajo de la autonomía nominal.

Los "4–8 horas" de batería en las torres son la **especificación de un emplazamiento bien dotado**, no la experiencia real: muchos tienen solo **2–4 horas**. Lo confirma el real decreto de 2026, que **obligará** a garantizar 4 h de cobertura para el 75 % de la población, en tres fases. **Planifica con 1–2 horas útiles, no con ocho.**

El GPS tampoco se apaga: el receptor corrige el retardo ionosférico con un modelo que en tormenta deja de ajustar, y el error pasa de 3–5 m habituales a **decenas de metros** sin avisarte. EGNOS/SBAS y el RTK fallan primero; la pérdida total de enganche exige centelleo severo, raro en la península. En la práctica el problema llegará antes por falta de batería y mapas descargados que por la ionosfera: **navega en papel** y usa el GPS solo como comprobación.

Dos matices: el apagón HF es diurno y **se recupera** —no es el fin de la onda corta—, y la caída del móvil pasa antes por una ventana de **red saturada pero viva**: manda ahí el SMS de "estoy bien".

### 6.2 Tu kit de comunicaciones, por presupuesto

| € | Equipo | Para qué | Legalidad en España / UE |
|---|---|---|---|
| **30–50 €** | **Radio multibanda AM/FM/onda corta con manivela y panel solar** | **El objeto número 1 de todo el manual.** Boletines oficiales sin depender de nada | Libre |
| **+15 €** | Pilas recargables AA/AAA y cargador USB | Complementa la manivela; el uso diario cansa mucho menos | Libre |
| **40–80 € el par** | **Walkies PMR446** (446 MHz, **500 mW**, hasta 16 canales analógicos y 32 digitales, antena fija) | Coordinar familia, portal y vecindario: el uso de cada día | **Uso libre sin licencia** en toda la UE. No se puede cambiar la antena ni usarlos como repetidor |
| **25 €** | Receptor SDR (RTL-SDR) + un portátil | Escuchar aviación, marina, radioafición y, con adaptador, HF | Recibir es legal; **divulgar comunicaciones ajenas, no** |
| **80–200 €** | **CB 27 MHz** (40 canales, **4 W** AM/FM, **12 W PEP** en BLU) | Carretera y camioneros: el estado real de las vías. Canal 9 emergencia, 19 carretera | **Uso común sin licencia** desde 2017, equipo homologado, sin ánimo de lucro |
| **60–150 €** | Handy VHF/UHF de radioaficionado | Lo mejor en corto y medio alcance, vía repetidor | **Escuchar: legal siempre. Transmitir: exige licencia** |
| **300–900 €** | Equipo HF + antena **NVIS** | Cobertura regional de **50–500 km** en 40 y 80 m, antena deliberadamente baja (3–5 m / 6–8 m) para radiar casi en vertical | Requiere licencia |

**Qué escuchar.** Anota junto a la radio las frecuencias de AM nacional y FM local, y las horas en punto de los boletines. En onda corta, las bandas internacionales (**5,9–6,2 / 7,2–7,45 / 9,4–9,9 MHz**) rinden mejor al amanecer, al atardecer y de noche.

**Sobre la licencia de radioaficionado, sin rodeos.** En España se aprueba un examen (electricidad/radio y reglamentación; **sin Morse desde 2006**) y se pagan tasas de unos **138 €** en total (~24 € examen + ~114 € autorización), para un indicativo **EA/EB/EC** —la clase EA equivale al HAREC/CEPT y vale en el resto de Europa—. Es un trámite de **meses** que **se saca ANTES, no durante la crisis**.

**Escuchar no requiere ninguna autorización; transmitir sin licencia es una infracción administrativa seria.** Por eso el SDR de 25 € y un handy usado en modo solo recepción son la entrada más rentable: el 90 % del valor —saber qué pasa— sin riesgo legal. Ante peligro grave e inminente para la vida se admite pedir auxilio por cualquier medio; eso es una excepción de emergencia, no una licencia encubierta para el uso rutinario sin autorizar.

**Alcance real, no el de la caja.** Un PMR446 que anuncia "10 km" da, con sus 500 mW y antena fija, en torno a **1–3 km en ciudad** y **300–800 m** entre edificios. Los 10 km solo se dan en línea de visión limpia —azotea a azotea, loma a loma—. **La altura vale más que la potencia**, y hay que probarlo hoy, con la familia, anotando en el plano dónde entra y dónde no.

### 6.3 Plan de comunicaciones familiar: el método PACE

**P**rimario, **A**lternativo, **C**ontingencia, **E**mergencia: cuatro formas de contactar, cada una **independiente de la anterior** —si comparten infraestructura, no son niveles distintos—. Cuando falla una, todos pasan a la siguiente **sin discutir y sin improvisar**. Se decide hoy, con calma, no a media tarde de un día malo.

| Nivel | Medio | Cómo se usa exactamente |
|---|---|---|
| **P — Primario** | Móvil, **SMS antes que llamada** | Texto corto: `OK / VOY A NIDO / 19:40` |
| **A — Alternativo** | **Walkie PMR446, canal 7, subtono 7** | **Ventanas de escucha**: en punto y a y media, 5 minutos; el resto, apagado |
| **C — Contingencia** | Nota en el **buzón nº 12** (respaldo: el ladrillo suelto del murete del parque) | A **lápiz**, que aguanta la humedad. Fecha, hora, adónde vas y con quién |
| **E — Emergencia** | Punto de encuentro: primario, portería de casa; secundario, puerta sur del colegio | A las **09:00 y las 19:00**, esperar 30 min, dejar nota al irse |

Cuatro reglas que hacen que funcione:

- **Ventanas de escucha.** Encendido permanente agota la batería en **8–12 h**; 5 min cada media hora dura **días** y **garantiza el encuentro**, porque los dos sabéis cuándo escucha el otro.
- **Por escrito, plastificado, en cada mochila.** Canal, subtono, horarios, puntos de encuentro y contactos: nadie los recuerda de memoria en una crisis.
- **Un contacto fuera de la región, como nodo de retransmisión.** Dentro de la zona no hay línea, pero una llamada o SMS **desde fuera sí puede pasar**. Todos avisan a la misma persona, que sabe dónde está cada uno.
- **Ensayadlo una vez.** Una tarde, sin usar el móvil: del walkie al buzón y al punto de encuentro.

### 6.4 Disciplina de radio

Este manual ya explica en la **sección 5** por qué conviene un perfil bajo y por qué el saqueo generalizado es, sobre todo, un mito: **tu vecino es tu mayor activo**, no tu principal amenaza. No lo repito aquí. Lo específico del medio es una cuestión técnica, no de actitud: **la radio es un canal abierto**. No hay destinatario; cualquiera con un aparato de 20 € puede estar sintonizado en tu canal, a kilómetros, y no sabes quién ni cuántos son. Todo lo que digas queda dicho **ante desconocidos**, y no se puede retirar.

De ahí una disciplina de oficio, sin dramatismo:

- **No des por radio**: tu dirección exacta, el inventario de tus reservas o combustible, ni —sobre todo— **cuándo la casa se queda vacía y por cuánto tiempo**. No por miedo a una turba, sino porque no aporta nada al mensaje y sí atrae oportunismo puntual.
- **Mensajes cortos y con estructura**: quién llama, a quién, qué necesita, hora exacta. Diez segundos.
- **Nombres en clave sencillos**, acordados por escrito: "Nido" = casa, "Fuente" = punto de agua, "Verde" = todo bien, "Ámbar" = problema no urgente, "Rojo" = ayuda ya.
- **Nada de melodrama.** Ni pánico, ni discursos, ni discusiones familiares en el aire; el tono tranquilo también es información.
- **Deja libres el canal 9 de CB** y las frecuencias de emergencia: son de todos.
- Y el otro lado de la moneda: la radio es lo que permite que el vecindario **funcione como un solo organismo** —turnos de vigilancia, aviso del camión de agua, qué farmacia ha abierto—. Perfil bajo no es silencio: es decir lo útil y callar lo demás.

### 6.5 Navegación sin GPS

Compra **hoy**, por unos 10 € en total: el **mapa topográfico 1:25.000 del IGN** de tu comarca y el **callejero en papel** de tu ciudad. Es lo único que nunca se queda sin batería.

- **Brújula y declinación magnética.** En la España peninsular es hoy **muy pequeña, del orden de 0° a 2°** —algo Este en el levante, cercana a cero u Oeste en el occidente— y cambia con los años: consúltala en el calculador del IGN y **anótala a lápiz en el mapa, con fecha**. Referencia: **2° de desvío separan ~35 m por km; 10°, unos 175 m por km**.
- **Orienta el mapa** girándolo hasta que su norte coincida con el de la brújula: es el **80 % de la navegación**.
- **Rumbo y contrarrumbo**: el de vuelta es el de ida **+180°**. Anótalo antes de salir.
- **Navega por el terreno, no por números**: sigue un río, una vía o una línea eléctrica (**handrail**); usa un rasgo transversal como aviso de que te has pasado (**catching feature**); apunta a propósito a un lado del objetivo para saber con certeza hacia dónde girar al llegar (**aiming off**).
- **Distancia**: cuenta **pares de pasos** —calibra hoy cuántos haces en 100 m, suelen ser 60–70— o estima por tiempo.
- **Tiempo de marcha (regla de Naismith)**: **5 km/h en llano + 1 hora por cada 600 m de desnivel positivo**; con carga, de noche o con niños, baja a **3–4 km/h**. Una ruta "de 20 km" con 800 m de subida son **5–6 horas reales**, no tres.
- **Sol, reloj y estrellas.** A mediodía solar el sol está al sur; con reloj analógico hay que **corregir la hora oficial** —una hora adelantada en invierno, **dos en verano**— o el método falla **15–30°**. De noche, la **Polar** (cinco veces el lado de la Osa Mayor) marca el norte; en el hemisferio sur, la **Cruz del Sur** ×4,5.
- **Anota tu mapa, ahora**: puntos de agua, hospitales, farmacias, salidas de la ciudad, puentes y **cuellos de botella**, con dos rutas alternativas a cada destino importante.

### 6.6 Movilidad

**La bicicleta es el mejor vehículo de una crisis larga**: no consume combustible, **carga 40 kg** con alforjas o remolque, y atraviesa atascos y controles. Lleva siempre **dos cámaras, parches, cadena de repuesto, radios sueltas, bomba, candado y lubricante**, y aprende a cambiar una cámara antes de necesitarlo.

**El coche**: excelente mientras haya combustible, pésimo a largo plazo. Desmontemos el mito: **una eyección de masa coronal no quema tu coche**. Las corrientes geomagnéticamente inducidas se acoplan a **conductores muy largos** —líneas de 400 kV, oleoductos, vías electrificadas—, no al cableado de tres metros de un vehículo. **Tu coche arrancará.** Lo que no funcionará es **la gasolinera**: las bombas sumergidas necesitan electricidad. Regla permanente: **nunca por debajo de medio depósito**.

**Combustible almacenado**: solo en **bidones homologados** (UN/ADR), en poca cantidad, en lugar ventilado y **fuera de la vivienda y del garaje comunitario**. El **estabilizador** lleva la vida útil de la gasolina de 3–6 meses a **1–2 años**; rota las existencias. **Sifonar con la boca es peligroso** (aspirar gasolina causa neumonía química), y sacar combustible de un vehículo ajeno es un delito, también en un apagón.

**A pie**: carga máxima razonable, **20–25 % del peso corporal**, calzado ya domado. **Evacuar a pie con familia es el último recurso**: con niños o mayores harás **10–15 km al día** en el mejor de los casos, expuesto y sin posibilidad realista de volver sobre tus pasos. Quedarse en casa con recursos, calor y vecinos casi siempre gana; se evacúa por una razón concreta, no por ansiedad.

### 6.7 Habilidades de campo que sí importan

Una advertencia coherente con el resto del manual: esto **no es "vivir del monte"**. La caza y la recolección **no resuelven la primera semana**. Estas habilidades sirven para lo que de verdad importa: **calentarte, arreglar cosas y moverte**.

- **Fuego, con tres métodos redundantes**: varios mecheros baratos repartidos en sitios distintos, un **ferrocerio** —funciona mojado, con guantes y con frío— y cerillas en un **tarro hermético**. Yesca casera: bolas de algodón con vaselina, pelusa de secadora, corteza de abedul. Con lluvia, busca **madera muerta en pie**, nunca del suelo empapado. Para cocinar, **fuego pequeño y eficiente** —hoyo Dakota o cocina rocket—: menos leña y **casi nada de humo**, que delata tanto como la llama de noche.
- **Seis nudos que cubren el 95 % de los casos**: **as de guía** (lazo fijo que no se aprieta), **ballestrinque** (amarre rápido a un poste), **vuelta de escota** (unir cuerdas de distinto grosor), **nudo de leñador** (arrastrar cargas), **prusik** (agarre deslizante que muerde al cargarlo) y **tensor o trucker's hitch** (tensa un tarp o una carga, multiplicando tu fuerza **×3**). Lleva 15 m de paracord y algo de cuerda de 8 mm.
- **Cuchillo y afilado**: hoja fija de 10–12 cm, acero sencillo, espiga completa, seco y aceitado. Afila con piedra a **ángulo constante de unos 20°**; sin piedra, el **borde sin vidriar del fondo de una taza de cerámica** sirve de emergencia.
- **Refugio improvisado**, si te pilla fuera: **tarp en A** (dos aguas, contra lluvia y viento) o **en cuña/lean-to** (una vertiente abierta al fuego). Lo decisivo es **aislar el suelo**: 20–30 cm de hojarasca comprimida, cartón o ramas de conífera bajo el cuerpo abrigan más que cualquier manta encima.
- **Reparar en vez de reemplazar**: cinta americana, alambre fino, bridas, hilo encerado y agujas gruesas, sellador, multiherramienta. Quien sabe coser una mochila, remendar una lona y empalmar un cable es el vecino más valioso del portal.

### 6.8 El cuaderno y los papeles

Lleva un **cuaderno de bitácora, a mano y con lápiz**. Con cansancio, frío y estrés, **la memoria falla a los tres días**, y se empieza a decidir con datos inventados. El cuaderno convierte impresiones en datos, y los datos son lo único con lo que se puede racionar bien.

Anota cada día, con la hora:

- **Litros de agua consumidos** y restantes, por persona: el número que decide todo lo demás.
- **Comida gastada y existencias**, para recalcular cuántos días quedan en vez de estimarlos a ojo.
- **Quién hizo qué tarea**, para repartir el trabajo y no dejar nada crítico sin hacer.
- **Qué oíste por la radio, en qué emisora y a qué hora** —para detectar un boletín repetido en bucle o dos fuentes que se contradicen.
- **Síntomas médicos y medicación administrada**, con horas.
- **Las decisiones tomadas y por qué**, para no tener que reconstruirlas de memoria.

Y ten un juego de **documentos en papel y en un pendrive**, en bolsa estanca: DNI y pasaporte escaneados, libro de familia, escrituras o contrato de alquiler, pólizas de seguro, informes médicos y **recetas de la medicación crónica** (con el principio activo, no solo la marca), **la graduación de tus gafas**, contactos con **direcciones físicas** —no solo móviles— y **fotos recientes de la familia**, por si hay que buscar o identificar a alguien.
