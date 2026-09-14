## 1. El evento: qué pasa, qué falla y tu ventana de 72 horas

### 1.1 No es un fenómeno, son tres, y cada uno llega a su hora

**1. Fulguración (flare): 8 min 20 s.** Es luz (rayos X y UV extremo): cuando la detectas ya te ha llegado, no hay aviso posible. Apaga la radio HF (3-30 MHz) en toda la cara diurna. Escala **R**. Dura minutos u horas. **No toca la red eléctrica.**

**2. Tormenta de radiación solar (protones): 15 min a unas horas.** Escala **S**. Afecta a satélites, rutas aéreas polares y astronautas. A nivel del suelo, no a ti (§1.7).

**3. CME y corrientes geomagnéticamente inducidas (GIC): 15-90 h.** Es la que tumba la red. Plasma magnetizado a 500-3.000 km/s: tránsito típico de 2-4 días, pero los eventos extremos son mucho más rápidos —la CME de Carrington (1859) tardó **17,6 h**—. Escala **G**.

**Tu aviso real, en dos tramos:**

- **Probabilístico: 18-72 h.** Los coronógrafos (SOHO/LASCO, STEREO) ven salir la CME y los modelos estiman la llegada, con un error de ±6-12 h. Y, sobre todo, **la orientación del campo magnético de la nube (componente Bz), que determina la severidad, no se conoce hasta el final**: sabes que viene algo, no si será G2 o G5.
- **Firme: 15-60 minutos.** Los satélites en L1 (DSCOVR, ACE), a 1,5 millones de km, miden velocidad y Bz reales justo antes del impacto. Con una CME muy rápida, 15 min.

> **Operativamente:** tu margen útil es la ventana de 18-72 h, y hay que gastarla asumiendo que lo más probable es que no pase nada. Actuar cuesta medio día y unos 200 €. Esperar al aviso firme es llegar 40 minutos tarde.

### 1.2 Las escalas NOAA

| G | Kp | Efecto sobre la red eléctrica | Días/ciclo de 11 años |
|---|----|-------------------------------|------|
| G1 Menor | 5 | Fluctuaciones débiles | ~900 |
| G2 Moderada | 6 | Alarmas de tensión en latitudes altas; tormentas largas pueden dañar transformadores | ~360 |
| G3 Fuerte | 7 | Correcciones de tensión; falsas alarmas en protecciones | ~130 |
| G4 Severa | 8 | Control de tensión comprometido; protecciones que desconectan activos clave por error | ~60 |
| G5 Extrema | 9 | Colapso o apagón completo en algunas redes; posible daño en transformadores | ~4 |

**Aviso sobre G5:** la escala se satura en Kp=9 y dentro de "G5" cabe un factor 3-4 de severidad. Dst mínimo: Gannon (mayo 2024) **−412 nT**; Quebec 1989 **≈ −589 nT**; Carrington **−850/−900 nT** estimado; la CME de julio de 2012, que falló a la Tierra por una semana de órbita, **−1.200 nT**. *"Es G5" no te dice cuál de esos tienes encima.*

| S | Protones >10 MeV (pfu) | Efecto | Eventos/ciclo |
|---|---|---|---|
| S1 | 10 | Ninguno en tierra | ~50 |
| S2 | 10² | HF degradado en polos | ~25 |
| S3 | 10³ | Ruido en satélites; apagón HF polar; dosis medible en vuelos polares | ~10 |
| S4 | 10⁴ | Degradación de paneles y memoria en satélites; riesgo en vuelos polares | ~3 |
| S5 | 10⁵ | Peligro inevitable para astronautas en EVA; exposición de tripulaciones polares | <1 |

| R | Rayos X (GOES) | Efecto en HF | Eventos/ciclo |
|---|---|---|---|
| R1 | M1 | Degradación menor | ~2.000 |
| R2 | M5 | Apagón parcial, decenas de minutos | ~350 |
| R3 | X1 | Apagón amplio ~1 h en la cara diurna | ~175 |
| R4 | X10 | Apagón de 1-2 h en casi toda la cara diurna | ~8 |
| R5 | X20 | Apagón total en toda la cara diurna durante horas | <1 |

### 1.3 Qué falla de verdad y qué NO

**En riesgo real:**

- **Transformadores EHV (220-765 kV).** *El* punto crítico. Las GIC son cuasi-continuas (0,001-0,1 Hz): saturan el núcleo, generan armónicos y calientan puntos localizados. Tres tiempos: disparo de protecciones (inmediato), degradación del aislamiento (acumulativa), fallo (días o meses después). **No hay stock**: los plazos de entrega han pasado de 12-18 meses antes de 2020 a **30-36 meses típicos y hasta 60 en unidades EHV** (DOE, *Large Power Transformer Resilience Report*, 2024). Son piezas de 200-400 t, a medida y con transporte especial: si se pierden decenas a la vez, no se reponen comprando más.
- **Red regional.** Quebec 1989: colapso total en **90 segundos**, 6 millones de personas, **9 horas**. Halloween 2003: Malmö, ~50.000 clientes, 1 hora.
- **HF y onda corta:** inutilizable durante horas (fase R).
- **GNSS/GPS:** pérdida de precisión y de fijación por centelleo ionosférico. En mayo de 2024, los tractores con guiado RTK centimétrico del Medio Oeste estadounidense se desviaron y hubo que parar la siembra. El GPS de tu móvil pierde metros, no desaparece.
- **Satélites:** la termosfera se expande y aumenta el arrastre; en Gannon, Starlink midió 3-5 veces más y 12 satélites reentraron. En 2003 se perdió el ADEOS-II (600 M USD).
- **Oleoductos:** corriente en la tubería, protección catódica falseada, corrosión acelerada. Mantenimiento, no explosiones.

**Lo que casi con seguridad sobrevive:**

- **Tu coche.** Arranca. No hay mecanismo físico por el que una GIC afecte a 4 m de cableado.
- **Tu móvil.** El teléfono funciona; lo que cae es la red. Las estaciones base llevan baterías de **2-8 h** y sólo las críticas tienen generador: sin reposición de gasóleo, la cobertura se apaga en **4-72 h**.
- **Electrónica pequeña en general**, enchufada o no.

**El mito principal: una CME NO es un EMP nuclear.** El pulso nuclear tiene una componente E1 (nanosegundos, gigahercios) que acopla energía a pistas de circuito y destruye semiconductores. Una CME **no produce E1**: sólo el equivalente de la E3, variación lenta del campo geomagnético que induce corriente **proporcional a la longitud del conductor**. 500 km de línea saturan un transformador; 30 cm de placa base recogen microvoltios. No hay un solo caso documentado de daño a electrónica de consumo por tormenta geomagnética. **No se "fríen todos los chips".**

**Honestidad en la otra dirección:** nadie ha visto un Carrington con una red moderna. Lloyd's/AER (2013) estimó para Norteamérica **20-40 millones de personas en riesgo de apagones de 16 días a 1-2 años** y pérdidas de hasta 2,6 billones de dólares: escenario modelado con incertidumbre enorme, no predicción. En contrapeso, en Gannon la red norteamericana **aguantó**. Según NERC: filtros de armónicos, una línea de 110 kV y un banco de condensadores disparados, alarmas de temperatura de aceite en transformadores, una nuclear bajando carga por GIC en su transformador elevador, y **cero pérdida de suministro**. Hoy existen procedimientos ante perturbación geomagnética que en 1989 no existían. La verdad está entre "no pasa nada" y "fin del mundo", y está mal acotada.

### 1.4 El efecto dominó de las primeras 72 horas

| Sistema | Autonomía | Qué falla |
|---|---|---|
| Semáforos, alumbrado | 0 h | Cruces sin regular desde el minuto uno |
| Gasolineras | 0 h | El combustible sigue en el tanque enterrado; el surtidor es eléctrico y no hay extracción manual |
| Pagos y cajeros | 0-8 h | Sin datáfono ni cajero. El efectivo es la única moneda |
| Agua potable | 12-48 h | Los depósitos en altura y las torres dan presión por gravedad mientras duran; luego, caudal nulo o insuficiente en pisos altos. Sin presión, la red puede contaminarse por intrusión: **desde ahí, hervir** |
| Alcantarillado | 0-12 h | Bombeos de aguas residuales eléctricos; retorno por desagües en zonas bajas |
| Nevera / congelador | 4 h / 24-48 h | Cerrados. Un congelador lleno aguanta el doble que uno medio vacío |
| Calefacción y ACS | 0 h | La caldera de gas necesita 100-200 W de control, ventilador y bomba: el gas llega, la caldera no arranca |
| Farmacia | horas | Cadena de frío de vacunas rota. Insulina sin abrir: 2-8 °C; un vial en uso aguanta ~28 días por debajo de 25-30 °C |
| Hospitales | 24-96 h | Generadores con depósito de 24-72 h, dependientes de cisternas, que dependen de gasolineras, que dependen de la red |
| Telefonía móvil | 4-72 h | Baterías de estación base, luego nada |

### 1.5 Cronología por fases

| Fase | Sociedad | Tú |
|---|---|---|
| **Aviso (T−24 h)** | Alerta SWPC/ESA. Los operadores reducen carga. Se desvían rutas polares. Casi nadie se entera | Ejecutar §1.6 entera |
| **Día 0-1** | Apagón regional. Confusión, no pánico. Colas en gasolineras. Cobertura móvil intermitente. La FM local sigue con generador | No conducir. Confirmar a la familia mientras haya cobertura. Consumir primero la nevera |
| **Día 2-3** | Cae la telefonía. Cierran comercios. Agua a baja presión. Problemas de alcantarillado. Hospitales en generador | Congelador → nevera → seco. Racionar agua y hervir. Higiene de manos estricta. Censo de vecinos: quién tiene generador, quién necesita frío |
| **Día 4-7** | Se agota el diésel no priorizado. Gastroenteritis por agua y alimentos. En invierno la hipotermia en interiores pasa a ser el riesgo principal. Primeras restauraciones por bloques | Una habitación caliente, cocina exterior, saneamiento con bolsas, turnos de vigilancia en el edificio |
| **Semana 2-3** | Se bifurca: con daño limitado vuelve casi todo con apagones rotatorios; con daño masivo en EHV, la restauración deja de medirse en días | Pasar de "aguantar" a "sostener". Decidir si quedarse o desplazarse |
| **Semana 4+** | Sólo con daño masivo: energía racionada, efectivo y trueque, reparto organizado de agua. Improbable, pero es lo que justifica prepararse | Integrarse en la estructura comunitaria que exista. Nadie aguanta un mes solo |

### 1.6 La ventana de 18-72 h: orden de ejecución

Por retorno decreciente. Si sólo tienes dos horas, haz los cuatro primeros.

- [ ] **Agua (30 min).** Llenar bañeras, garrafas, ollas. Objetivo: 4 l/persona/día, 7 días. Lo único insustituible.
- [ ] **Combustible (45 min).** Depósito lleno y 1-2 bidones homologados. El coche es además refugio con calefacción, USB y radio.
- [ ] **Efectivo (30 min).** En **billetes pequeños y monedas**: nadie te dará cambio de 50 € el día 3.
- [ ] **Medicación (30 min).** Renovar recetas crónicas; plan de frío para insulina o biológicos. No se improvisa.
- [ ] **Frío (45 min).** Congelar botellas, comprar hielo, bajar el termostato: 24-48 h extra de alimentos y cadena de frío.
- [ ] **Baterías (continuo).** Móviles, power banks, linternas, portátiles, herramienta inalámbrica.
- [ ] **Familia (15 min).** Un solo mensaje: **punto de encuentro físico, hora fija y plan B a las 24 h**. Cuando cae la telefonía sólo sirve lo acordado antes.
- [ ] **Comida (60 min).** Una semana de calorías sin cocción ni frío: conservas, atún, arroz, pasta, frutos secos, aceite.
- [ ] **Desenchufar (15 min).** Con el aviso firme, desconectar de pared y antena todo lo caro que no esté en uso. **No por la GIC**, que no te afecta en casa, sino por los transitorios al colapsar la red y, sobre todo, al reponerse. Ese riesgo sí es real.
- [ ] **Calor.** Bombona de repuesto, hornillo, mantas. Localiza cómo alimentar la caldera con un inversor pequeño (200-300 W bastan).

### 1.7 Jaula de Faraday: hazla, pero sin engañarte

**Frente a una tormenta geomagnética es un seguro barato, no una necesidad:** lo que protege tu electrónica es tenerla desenchufada. La jaula cubre el escenario improbable (un EMP) y los transitorios acoplados por cables largos. Cuesta 30 € y una tarde: hazla, pero nunca a costa de agua, comida o medicación.

1. Cubo de basura metálico galvanizado con tapa a presión, caja de acero o lata grande. Lo que cuenta es la continuidad eléctrica.
2. Sellar la junta de la tapa con **cinta de cobre** adhesiva, sin ranuras continuas.
3. **Aislar todo el interior** con cartón o espuma: ningún aparato debe tocar el metal.
4. Cada aparato, además, en **doble bolsa mylar anidada**: dos capas separadas por aislante valen más que una gruesa.
5. **Verifica:** mete una radio FM encendida y cierra. Si se sigue oyendo, no está cerrada.

**Dentro:** radio AM/FM/onda corta, dos walkies, panel solar de 10-20 W con regulador, dos frontales, un disco con documentación (escrituras, pólizas, recetas, contactos, mapas offline), un inversor 12 V, multímetro, cargador de coche y cables. Todo apagado y con las pilas fuera.

### 1.8 Radiación: dónde importa y dónde no

Importa en tres sitios: **astronautas** (un S5 es peligro inevitable en actividad extravehicular), **tripulaciones y pasajeros de vuelos polares a gran altitud** —por eso se desvían rutas transpolares en eventos S3 o superiores, como en octubre de 2003— y **la electrónica de los satélites**.

**A nivel del suelo no es una amenaza para ti.** Te protegen el campo magnético terrestre, que desvía las partículas cargadas hacia los polos, y **10.000 kg de atmósfera por metro cuadrado** sobre tu cabeza. Incluso en los eventos de protones más intensos registrados, la dosis añadida a nivel del mar es una fracción despreciable del fondo natural. No necesitas yoduro potásico, ni refugio, ni quedarte dentro. Si alguien te vende protección radiológica para una tormenta solar, te está estafando: aquí te hará daño el agua contaminada, el frío y la falta de medicación, no los protones.
