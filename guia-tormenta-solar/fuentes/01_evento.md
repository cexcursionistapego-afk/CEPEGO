## 1. El evento: qué pasa, qué falla y tu ventana de 72 horas

### 1.1 No es un fenómeno, son tres, y cada uno llega a su hora

**1. Fulguración (flare): 8 min 20 s.** Rayos X y UV extremo: al detectarla ya te ha llegado, no hay aviso posible. Apaga la radio HF (3-30 MHz) en toda la cara diurna. Escala **R**. Minutos u horas. **No toca la red eléctrica.**

**2. Tormenta de radiación solar (protones): 15 min a horas.** Escala **S**. Satélites, rutas polares, astronautas; a nivel del suelo, no a ti (§1.8).

**3. CME y corrientes geomagnéticamente inducidas (GIC): 15-90 h.** La que tumba la red: plasma a 500-3.000 km/s, tránsito típico de 2-4 días salvo extremos —Carrington (1859), **17,6 h**—. Escala **G**.

**Tu aviso real, en dos tramos:**

- **Probabilístico, 18-72 h.** Los coronógrafos ven salir la CME; los modelos estiman la llegada con error de ±6-12 h. Sobre todo, **la orientación del campo (Bz), que determina la severidad, no se conoce hasta el final**: sabes que viene algo, no si será G2 o G5.
- **Firme, 15-60 min.** Los satélites en L1 (DSCOVR, ACE) miden velocidad y Bz reales justo antes del impacto.

> **Operativamente:** tu margen útil es la ventana de 18-72 h, gastada asumiendo que lo más probable es que no pase nada. Actuar cuesta medio día y unos 200 €; esperar al aviso firme es llegar 40 minutos tarde.

### 1.2 Las escalas NOAA

| G | Kp | Efecto sobre la red eléctrica | Días/ciclo de 11 años |
|---|----|-------------------------------|------|
| G1 Menor | 5 | Fluctuaciones débiles | ~900 |
| G2 Moderada | 6 | Alarmas de tensión en latitudes altas; tormentas largas pueden dañar transformadores | ~360 |
| G3 Fuerte | 7 | Correcciones de tensión; falsas alarmas en protecciones | ~130 |
| G4 Severa | 8 | Control de tensión comprometido; protecciones que desconectan activos clave por error | ~60 |
| G5 Extrema | 9 | Colapso o apagón completo en algunas redes; posible daño en transformadores | ~4 |

**Aviso sobre G5:** la escala se satura en Kp=9; dentro de "G5" cabe un factor 3 de severidad. Dst mínimo medido o estimado:

| Evento | Dst mínimo | Qué pasó |
|---|---|---|
| Gannon, mayo 2024 | **−412 nT** | G5 real, cero pérdida de suministro (§1.3) |
| Quebec, marzo 1989 | **−589 nT** | Colapso de una red completa en 90 s |
| Carrington, 1859 | **≈ −900 nT** | Red eléctrica inexistente; sólo telégrafos |
| CME de julio de 2012 | **≈ −1.200 nT** | No impactó: la Tierra ya había pasado por ahí |

Carrington es **reconstruido, no medido** (estimaciones de −800 a −1.750 nT; los análisis más sólidos, hacia −900). *"Es G5" no dice cuál de estos cuatro tienes encima.*

**Tampoco afecta igual que a tu vecino:** depende del campo geoeléctrico local —latitud geomagnética, conductividad del terreno y efecto costa, que puede triplicarlo—. Costa, roca antigua y latitud alta: la combinación más frágil.

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

- **Transformadores EHV (220-765 kV).** *El* punto crítico: las GIC, cuasi-continuas, saturan el núcleo y lo calientan en tres tiempos —disparo de protecciones, degradación acumulativa, fallo meses después—. **No hay stock**: el DOE (*Large Power Transformer Resilience Report*, 2024) sitúa los plazos **hasta 60 meses en EHV**; la industria reporta **30-36 meses corrientes**, frente a 12-18 antes de 2020. Piezas de 200-400 t a medida: perder decenas a la vez no se resuelve comprando más.
- **Red regional.** Quebec 1989: colapso en **90 s**, 6 millones de personas, **9 horas** sin suministro y sin un solo transformador quemado —el mejor caso posible—. Halloween 2003: Malmö, ~50.000 clientes, 1 hora. Con transformadores perdidos, la restauración ya no se mide en horas (§1.5).
- **HF y onda corta:** inutilizable horas (fase R).
- **GNSS/GPS:** pierde precisión por centelleo ionosférico. En mayo de 2024, tractores de guiado RTK en EE. UU. se desviaron y paró la siembra; tu móvil pierde metros, no desaparece.
- **Satélites:** la termosfera se expande; en Gannon, Starlink midió 3-5 veces más arrastre y perdió 12 satélites. En 2003 cayó el ADEOS-II (600 M USD).
- **Oleoductos:** protección catódica falseada, corrosión acelerada. Mantenimiento, no explosiones.

**Lo que casi con seguridad sobrevive:**

- **Tu coche.** Arranca. No hay mecanismo físico por el que una GIC afecte a 4 m de cableado.
- **Tu móvil.** El teléfono funciona; lo que cae es la red. Las baterías de la estación base dan **2-8 h nominales**, pero ésa es la especificación de un emplazamiento macro bien dotado: muchos tienen 2-4 h y las celdas urbanas pequeñas bastante menos. En el apagón ibérico del 28 de abril de 2025 la cobertura cayó a en torno al **10 % en las primeras horas** y hacia las 18:06 —cinco horas y media tras el corte— las telecomunicaciones estaban caídas del todo. Cuenta con **horas, no días**, y manda SMS en los primeros minutos (§6.1).
- **Electrónica pequeña en general**, enchufada o no.

**El mito principal: una CME NO es un EMP nuclear.** El pulso nuclear tiene una componente E1 (nanosegundos, gigahercios) que acopla energía a pistas de circuito y destruye semiconductores. Una CME **no produce E1**: sólo el equivalente de la E3, variación lenta del campo geomagnético que induce corriente **proporcional a la longitud del conductor**. 500 km de línea saturan un transformador; 30 cm de placa base recogen microvoltios. No hay un solo caso documentado de daño a electrónica de consumo por tormenta geomagnética. **No se "fríen todos los chips".**

**Honestidad en la otra dirección:** nadie ha visto un Carrington con red moderna. Lloyd's/AER (2013) estimó para Norteamérica **20-40 millones de personas en riesgo de apagones de 16 días a 1-2 años** y pérdidas de hasta 2,6 billones de dólares: modelado con incertidumbre enorme, no predicción. En Gannon, en cambio, la red **aguantó** tres días entre G3 y G5: NERC registró disparo de filtros de armónicos en una línea de 345 kV, una línea de 110 kV y un banco de condensadores de 138 kV, alarmas de sobretemperatura en transformadores y una nuclear reduciendo carga por GIC. **Cero pérdida de suministro.** Hoy hay procedimientos que en 1989 no existían. La verdad está entre "no pasa nada" y "fin del mundo", mal acotada.

### 1.4 El efecto dominó de las primeras 72 horas

| Sistema | Autonomía | Qué falla |
|---|---|---|
| Semáforos, alumbrado | 0 h | Cruces sin regular desde el minuto uno |
| Gasolineras | 0 h | Combustible en el tanque enterrado; el surtidor es eléctrico, sin extracción manual |
| Pagos y cajeros | 0-8 h | Sin datáfono ni cajero: el efectivo es la única moneda |
| Agua potable | 12-48 h | Depósitos y torres dan presión por gravedad mientras duran; luego, caudal nulo o insuficiente en pisos altos. Sin presión, riesgo de contaminación: **desde ahí, hervir** |
| Alcantarillado | 0-12 h | Bombeos eléctricos; retorno por desagües en zonas bajas |
| Nevera / congelador | 4 h / 24-48 h | Cerrados. Lleno aguanta el doble que medio vacío |
| Calefacción y ACS | 0 h | La caldera de gas necesita 100-200 W de control, ventilador y bomba: el gas llega, no arranca |
| Farmacia | horas | Cadena de frío rota. Insulina sin abrir: 2-8 °C; en uso, ~28 días por debajo de 25-30 °C |
| Hospitales | 24-96 h | Generadores con depósito de 24-72 h, dependientes de cisternas → gasolineras → red |
| Telefonía móvil | Horas, no días | Baterías de estación base (2-8 h nominales; muchos emplazamientos, 2-4 h). El transporte —fibra, armarios de calle— aguanta menos que la antena, y antes de caer **se congestiona** |

### 1.5 Cronología por fases

| Fase | Sociedad | Tú |
|---|---|---|
| **Aviso (T−24 h)** | Alerta SWPC/ESA. Los operadores reducen carga y se desvían rutas polares. Casi nadie se entera | Ejecutar §1.6 entera |
| **Día 0-1** | Apagón regional. Confusión, no pánico. Colas en gasolineras. Cobertura móvil intermitente. La FM local sigue con generador | No conducir. Confirmar a la familia mientras haya cobertura. Consumir primero la nevera |
| **Día 2-3** | Cae la telefonía. Cierran comercios. Agua a baja presión. Problemas de alcantarillado. Hospitales en generador | Congelador → nevera → seco. Racionar agua y hervir. Higiene de manos estricta. Censo de vecinos: quién tiene generador, quién necesita frío |
| **Día 4-7** | Se agota el diésel no priorizado. Gastroenteritis por agua y alimentos. En invierno, la hipotermia en interiores es el riesgo principal. Primeras restauraciones por bloques | Una sola habitación caliente, cocina exterior, saneamiento con bolsas. Repartir tareas con los vecinos por turnos: agua, mayores, cocina común |
| **Semana 2-3** | Se bifurca: con daño limitado vuelve casi todo con apagones rotatorios; con daño masivo en EHV, la restauración deja de medirse en días | Pasar de "aguantar" a "sostener". Decidir si quedarse o desplazarse |
| **Semana 4+** | Sólo con daño masivo: energía racionada, efectivo y trueque, reparto organizado de agua. Improbable, pero es lo que justifica prepararse | Integrarse en la estructura comunitaria que exista. Nadie aguanta un mes solo |

### 1.6 La ventana de 18-72 h: orden de ejecución

El orden de supervivencia de este manual es **temperatura → agua → sueño → comida**, pero esta lista se ejecuta *antes* del apagón: lo primero es también lo que antes desaparece de las tiendas. **Con dos horas, haz los cuatro primeros.**

- [ ] **Calor (45 min).** Lo que más se olvida, porque hace sol cuando compras. Bombona de repuesto, hornillo, mantas. Alimenta la caldera con un inversor pequeño: **200-300 W** bastan para convertir el gas en calor real.
- [ ] **Agua (30 min).** Bañeras, garrafas, ollas, mientras haya presión. Objetivo: **4 l/persona/día, 7 días**: gratis ahora, imposible después.
- [ ] **Combustible (45 min).** Depósito lleno y 1-2 bidones homologados: el coche es también refugio, con calefacción, USB y radio.
- [ ] **Medicación (30 min).** Recetas crónicas al día y plan de frío para insulina o biológicos: no se improvisa.
- [ ] **Efectivo (30 min).** **Billetes pequeños y monedas**: nadie dará cambio de 50 € el día 3.
- [ ] **Frío (45 min).** Congelar botellas, comprar hielo, bajar el termostato: **24-48 h extra** de alimentos y frío para medicación.
- [ ] **Baterías (continuo).** Móviles, power banks, linternas, herramienta inalámbrica.
- [ ] **Familia (15 min).** Un mensaje: **punto de encuentro físico, hora fija y plan B a las 24 h**. Cuando cae la telefonía sólo sirve lo acordado antes. Incluye a los vecinos con los que compartirás la semana.
- [ ] **Comida (60 min).** Una semana sin cocción ni frío: conservas, atún, arroz, pasta, frutos secos, aceite. Al final a propósito: el hambre a 7 días es un problema de moral, no de fisiología, y **la caza o la recolección no resuelven la primera semana de nadie**.
- [ ] **Desenchufar (15 min, con el aviso firme).** Pared y antena: lo caro que no esté en uso. **No por la GIC**, que no te afecta en casa, sino por los transitorios al colapsar la red y, sobre todo, al reponerse. Ese riesgo sí es real.

### 1.7 Jaula de Faraday: hazla, pero sin engañarte

**Frente a una tormenta geomagnética es un seguro barato, no una necesidad:** lo que protege tu electrónica es tenerla desenchufada. La jaula cubre el escenario improbable de un EMP y los transitorios por cables largos. Cuesta 30 € y una tarde: nunca a costa de calor, agua o medicación.

1. Cubo de basura metálico galvanizado con tapa a presión, caja de acero o lata grande: cuenta la continuidad eléctrica.
2. Sella la junta con **cinta de cobre** adhesiva, sin ranuras.
3. **Aísla el interior** con cartón o espuma: ningún aparato debe tocar el metal.
4. Cada aparato, además, en **doble bolsa mylar anidada**: dos capas separadas valen más que una gruesa.
5. **Verifica:** radio FM encendida dentro y cierra. Si se oye, no está cerrada.

**Dentro:** radio AM/FM/onda corta, dos walkies, panel solar de 10-20 W con regulador, dos frontales, un disco con documentación (escrituras, pólizas, recetas, contactos, mapas offline), un inversor 12 V, multímetro, cargador de coche y cables. Todo apagado, pilas fuera.

### 1.8 Radiación: dónde importa y dónde no

Importa en tres sitios: **astronautas** (un S5 es peligro inevitable en EVA), **tripulaciones y pasajeros de vuelos polares a gran altitud** —de ahí las rutas transpolares desviadas en eventos S3+, como en octubre de 2003— y **la electrónica de los satélites**.

**A nivel del suelo no es una amenaza para ti.** Te protegen el campo magnético terrestre, que desvía las partículas hacia los polos, y **10.000 kg de atmósfera por metro cuadrado** sobre tu cabeza. Incluso en los eventos de protones más intensos registrados, la dosis añadida a nivel del mar es una fracción despreciable del fondo natural. No necesitas yoduro potásico, ni refugio, ni quedarte dentro. Si alguien te vende protección radiológica para una tormenta solar, te está estafando: aquí hace daño el agua contaminada, el frío y la falta de medicación, no los protones.
