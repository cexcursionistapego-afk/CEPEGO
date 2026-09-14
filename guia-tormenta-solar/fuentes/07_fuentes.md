## 7. Fuentes y verificación

De un documento así puede depender la vida de alguien, así que esta sección dice exactamente de dónde sale cada cifra, **cuáles se han comprobado y cuáles no**. Un manual que no distingue esas dos cosas no es un manual: es una opinión con tablas.

### 7.1 Cómo se ha verificado, y qué límite tiene esta verificación

El manual lo redactó un consejo de seis especialistas, uno por dominio, cada uno con la obligación de citar fuente para las cifras y de distinguir lo establecido de lo especulativo. Después hubo una segunda pasada de cierre, sección por sección, y una tercera centrada sólo en **las afirmaciones que pueden hacer daño si están mal**: dosis, temperaturas, umbrales y plazos.

Hay que decir con claridad cuál es el límite de esa tercera pasada. El acceso directo a los dominios de las fuentes primarias —`cdc.gov`, `who.int`, `epa.gov`, `boe.es`, `swpc.noaa.gov`— **estaba bloqueado** desde el entorno donde se redactó. La comprobación se hizo con búsquedas que devuelven extractos de esas mismas páginas y con fuentes secundarias que las citan. Para las cifras de la tabla siguiente eso es suficiente para detectar un error grueso, y de hecho detectó varios. **No es lo mismo que haber leído el documento oficial.**

Lo que se deduce de esto es sencillo y conviene tomárselo en serio:

> **Antes de actuar sobre una cifra de este manual que pueda dañar a alguien —una dosis, una temperatura de cocción, un umbral de gas— confírmala en la fuente primaria.** Están todas nombradas en §7.4 y se encuentran en un minuto con el móvil, hoy, que es cuando hay internet. Ese es justo el trabajo que no vas a poder hacer el día del apagón.

### 7.2 Verificación de las afirmaciones que pueden hacer daño

`Verificada` = confirmada contra la fuente. `En parte` = confirmada a medias, con lo que falta anotado. `CORREGIDA` = estaba mal y se ha cambiado en esta revisión. `Sin verificar` = no se ha comprobado en esta pasada.

| Afirmación | Lo que dice el manual | Estado | Contra qué |
|---|---|---|---|
| Hervido para potabilizar | 1 min; 3 min por encima de 2.000 m | Verificada | CDC: 1 min, y 3 min sobre 6.500 pies (1.981 m) |
| Lejía, agua clara | 2 gotas/L al 5-6 % | Verificada | CDC: 8 gotas (algo menos de ⅛ de cucharadita) de lejía al 5-9 % por galón |
| Lejía, agua turbia | el doble de dosis | Verificada | CDC: 16 gotas o ¼ de cucharadita por galón |
| Tiempo de contacto del cloro | 30 minutos | Verificada | CDC |
| Lejía española más diluida que la americana | 35-40 g/L (3,5-4 %), 3 gotas/L | Verificada en parte | La horquilla CDC de 5-9 % confirma que la dosis depende de la concentración; el etiquetado español, por fuente comercial |
| Los filtros de fibra hueca no retienen virus | 0,1-0,2 µm; virus más pequeños | **Verificada** | Los virus exigen ~0,02 µm. Sawyer 0,1 µm y LifeStraw 0,2 µm retienen bacterias y protozoos, no virus |
| Suero oral de la OMS | 1 L + 6 cucharaditas rasas de azúcar + ½ de sal | **Verificada** | Formulación casera de la OMS |
| Riesgo de pasarse de sal en el suero | *añadido en esta revisión* | **CORREGIDA** | Demasiada sal es peligrosa en lactantes: riesgo de hipernatremia |
| Umbrales de monóxido de carbono | situaba la pérdida de consciencia en 150-200 ppm | **CORREGIDA** | OSHA/NIOSH: 35-50 ppm límite laboral; 100 ppm cefalea leve; 400 ppm peligro vital en 1-2 h; **800 ppm inconsciencia en minutos**; 1.200 IDLH; >1.600 muerte en ~20 min |
| Triquina: temperatura de cocción | ≥71 °C en toda la pieza | **Verificada** | USDA: 71 °C (160 °F) para carne de caza |
| El congelado no es fiable en caza silvestre | afirmado tajantemente | **Verificada** | Hay especies de *Trichinella* silvestres resistentes a la congelación |
| Especies de triquina en España | *T. britovi* y *T. spiralis*, no la ártica *T. nativa* | **Verificada** | Ambas circulan en España en fauna silvestre y suidos |
| Biotoxinas marinas | termoestables; hervir no las destruye | **Verificada** | Saxitoxina y ácido domoico son termoestables; cocinar y congelar no las elimina |
| «La cocción concentra las biotoxinas» | *retirada en esta revisión* | **CORREGIDA** | No se pudo sostener; sustituida por que el caldo queda igual de tóxico |
| Anti-isla del inversor fotovoltaico | EN 50549 obliga a desconectar en segundos | Verificada en parte | EN 50549 sí impone anti-isla, con desconexión típica ≤ 2 s. **El artículo concreto del reglamento español no se ha verificado**, y se ha retirado esa atribución |
| Autonomía real de la red móvil | horas, no días | Verificada en parte | Apagón ibérico del 28-IV-2025. La cifra nominal de 4-8 h es de especificación |
| Escalas NOAA G, S y R | frecuencias por ciclo de 11 años | **Verificada** | Confirmados G1 (1.700/ciclo), G2 (~360 días), G3 (~130 días), **G4 (~60 días)** y G5 (~4 por ciclo). La progresión es la estándar de NOAA (Kp5→Kp9); G4 confirmado por SWPC y fuentes secundarias consistentes (Fox Weather, ejemplos G4 St. Patrick's 2015 y oct-2024) |
| Nevera 4 h, congelador 24-48 h | 4 h; 48 h lleno, 24 h medio | **Verificada** | USDA y FoodSafety.gov dan exactamente esas cifras, con la puerta cerrada |
| Insulina en uso: 28 días | 28 días entre 15 y 30 °C; nunca congelar | **Verificada** | Indicación de fabricantes: en uso, hasta 28 días por debajo de 30 °C. Congelada se destruye |
| Botulismo en conservas | pH > 4,6 exige autoclave a 116-121 °C; hervir a 100 °C no mata la espora | **Verificada** | pH 4,6 es el umbral reconocido; los alimentos poco ácidos exigen olla a presión a 240-250 °F (116-121 °C), inalcanzable en baño de agua |
| Ahumado en frío | decía «peligroso sin salazón previa» | **CORREGIDA** | La sal común no basta: lo que inhibe a *C. botulinum* es el **nitrito** de la sal de cura, del orden de 120 ppm en la industria. El frío mantiene justo el medio en que la espora germina. Fila y aviso rehechos |
| Salazón y cecina: tiempos y concentraciones | 200-250 g/L de salmuera «flota un huevo», ~1 día/cm, HR < 60 % | **CORREGIDA** | Un huevo flota ya al ~10 % de sal (90-110 g/L): fuerza de adobo para cocinar pronto o refrigerar, insuficiente para semanas sin frío (*S. aureus* puede seguir creciendo). Salmuera de conservación real: **cerca de la saturación, 250-300 g/L**. Salazón en seco: la regla verificada es **~1 día de sal por kg de peso** (jamón ibérico), no por cm; 3-4 % del peso coincide con USDA (≥4 lb/100 lb) y con la práctica española (~3 %). HR de cecina: FSA británica cita biltong secado a ~55 % HR, coherente con «<60 %» |
| Ilegalidad de lazo y cepo en España | Ley 42/2007, art. 65.3 y Anexo VII | **Verificada** | El art. 65.3 prohíbe los procedimientos masivos o no selectivos del Anexo VII; las comunidades autónomas pueden autorizar excepciones |
| Legítima defensa, art. 20.4 CP | agresión ilegítima, necesidad racional del medio, falta de provocación suficiente | **Verificada** | Los tres requisitos, con el matiz confirmado de que la «necesidad racional» no es igualdad de armas sino racionalidad según las circunstancias |
| Eximente incompleta, art. 21.1 CP | opera si falta alguno de los otros dos requisitos; rebaja de uno o dos grados | **Verificada** | Confirmado, y añadida la consecuencia que faltaba: sin agresión ilegítima no hay eximente ni completa ni incompleta |
| Spray de defensa personal | Orden de 3 de octubre de 1994 y aprobación del Ministerio de Sanidad con informe de la CIPAE | **Verificada** | BOE-A-1994-21767. Venta en armerías a mayores de edad, informe de la CIPAE en 30 días y prohibición expresa de venta por catálogo |
| Traslado de armas, art. 149 RD 137/1993 | por vías y lugares públicos urbanos, desmontada o en funda/caja, solo en el trayecto entre el lugar de guarda y el de uso autorizado | **Verificada** | RD 137/1993, art. 149.1 |
| Custodia en domicilio, BOE-A-2025-387 | Resolución de la DGGC de 4-XII-2024, medidas mínimas de armeros y cajas fuertes en domicilios particulares | **Verificada** | BOE núm. 7, de 8-I-2025 (BOE-A-2025-387), en vigor desde el 9-I-2025 |
| Límite de armas, licencias D y E | decía «hasta seis de cada clase y doce como máximo en total» para ambas | **CORREGIDA** | Son límites distintos y no acumulables: licencia D, hasta 5 armas largas rayadas de caza mayor; licencia E, hasta 12 armas en total (máx. 6 escopetas y 6 rifles de tiro). Hay una reforma del reglamento en trámite que endurecería el límite de la D; no se ha usado como base porque aún no está en vigor |
| Licencia B, arma corta para defensa personal | excepcional, exige riesgo grave y real acreditado | **Verificada** | Reglamento de Armas, régimen de concesión restrictiva de la licencia B |
| Real decreto de respaldo de telecos, 2026 | citado como apoyo secundario | Verificada en parte | Existencia confirmada por prensa (Moncloa.com, El Periódico de la Energía, jul-2026): obligaría a operadores con >50 M€ de facturación o >500.000 usuarios a instalar baterías con ≥4 h de autonomía en estaciones base, en tres fases (50 %→65 %→75 % de población) antes de fin de 2026. **No se ha podido confirmar contra el texto oficial (BOE)**, sólo contra cobertura periodística consistente entre varias fuentes independientes |

### 7.3 Lo que sigue sin verificar, dicho sin adornos

Tras la última pasada queda **un** punto abierto (la frecuencia de G4 ya se ha confirmado; el real decreto de telecos pasa de «no verificable» a «verificado por prensa, no por BOE»; la salazón y cecina de §4.8 quedan corregidas y verificadas; y el marco legal de §5 queda cerrado por completo, ver más abajo). No sostiene una recomendación que pueda matar a nadie por sí sola, pero conviene saber cuál es:

1. **El real decreto de 2026 sobre respaldo eléctrico de telecomunicaciones**: su existencia y contenido (≥4 h, 75 % de población) están respaldados por varias fuentes periodísticas independientes, pero no se ha contrastado contra el texto publicado en el BOE. Se cita como apoyo, nunca como base de un argumento.

**El marco legal de §5 queda ya completo y verificado.** Los arts. 20.4 y 21.1 del Código Penal y el régimen del spray de defensa ya estaban confirmados; en esta pasada se han verificado además el traslado de armas del art. 149 del Reglamento de Armas y la Resolución de la Guardia Civil de 2024 sobre armeros (BOE-A-2025-387), ambos tal como los describía el manual. Los límites de las licencias D y E sí tenían un error, ya **corregido**: el manual les asignaba el mismo tope («hasta seis de cada clase y doce en total») cuando son cifras distintas y no acumulables — la licencia D permite hasta 5 armas de caza mayor, la E hasta 12 en total (máximo 6 escopetas y 6 rifles de tiro).

### 7.4 Fuentes, por secciones

**§1. El evento y la infraestructura.** NOAA Space Weather Prediction Center, escalas de clima espacial G, S y R. Departamento de Energía de EE. UU., *Large Power Transformer Resilience Report*, informe al Congreso, 2024 (plazos de entrega de transformadores EHV). NERC, revisión operativa de la tormenta Gannon de mayo de 2024. Lloyd's of London y Atmospheric and Environmental Research, *Solar Storm Risk to the North American Electric Grid*, 2013. Boteler, análisis del índice Dst de la tormenta de marzo de 1989. Reconstrucciones publicadas del evento de Carrington de 1859 y de la CME de julio de 2012.

**§2. Preparación física.** Ecuación de Pandolf y modelos derivados de coste metabólico de la marcha con carga. Literatura de aclimatación al calor y de adaptación al frío. Datos de pérdida de masa muscular y fuerza con la edad. Fisiología del límite de aprovechamiento proteico (*rabbit starvation*).

**§3. Agua, calor, energía y comida.** CDC, *How to Make Water Safe in an Emergency* (hervido y desinfección con cloro). EPA, *Emergency Disinfection of Drinking Water*. OMS, formulación de sales de rehidratación oral y receta casera. OSHA y NIOSH, límites de exposición y tablas de efectos del monóxido de carbono. Especificaciones de fabricante de filtros de membrana de fibra hueca. Protocolo SODIS de desinfección solar. USDA y FoodSafety.gov, seguridad alimentaria durante cortes de suministro. Fichas de almacenamiento de insulina de los fabricantes y de la FDA. Norma **EN 50549** sobre conexión de instalaciones de generación en paralelo con redes de distribución (protección anti-isla).

**§4. Obtención de alimento.** USDA/FSIS, guía de prevención y control de *Trichinella* y temperaturas de cocción de carne de caza. Estudios de prevalencia de *Trichinella spiralis* y *T. britovi* en jabalí en España. FAO, *Aquatic biotoxins* (termoestabilidad de las toxinas PSP, DSP y ASP). Ley 42/2007 del Patrimonio Natural y de la Biodiversidad, art. 65.3 y Anexo VII, métodos masivos o no selectivos prohibidos. USDA/FSIS sobre *Clostridium botulinum* y botulismo. Servicios de extensión universitaria (Clemson, Penn State) sobre el umbral de pH 4,6 y las condiciones de autoclave en conservas caseras. Literatura sobre el papel del nitrito en el control del botulismo en carnes curadas.

**§5. Seguridad y comunidad.** Disaster Research Center de la Universidad de Delaware (fundado en 1963 en Ohio State, en Delaware desde 1985), *Preliminary Papers*. E. L. Quarantelli, *Common Misconceptions about Disasters: Panic, the "Disaster Syndrome," and Looting*. K. Tierney, C. Bevc y E. Kuligowski, *Metaphors Matter: Disaster Myths, Media Frames, and Their Consequences in Hurricane Katrina*, Annals of the AAPSS, 2006. R. Solnit, *A Paradise Built in Hell*, 2009. Recuentos oficiales de los apagones de Nueva York de 1965, 1977 y 2003 recopilados en NYCdata (CUNY Baruch College). Environment Canada y literatura médica sobre la tormenta de hielo de Quebec de 1998. Cifras oficiales japonesas sobre marzo de 2011. Red Eléctrica, Gobierno de España y ENTSO-E sobre el apagón ibérico del 28 de abril de 2025. Desmentidos de *The Times-Picayune* y NPR, *Anatomy of a Rumor*, sobre Katrina. Ley Orgánica 10/1995 del Código Penal, arts. 20.4 y 21.1. Reglamento de Armas, RD 137/1993, régimen de licencias, custodia y traslado (art. 149). Resolución de la Dirección General de la Guardia Civil de 4 de diciembre de 2024, medidas mínimas de seguridad de armeros en domicilios (BOE-A-2025-387). Orden de 3 de octubre de 1994, sprays de defensa de venta permitida en armerías.

**§6. Comunicaciones y navegación.** Física de la absorción ionosférica en la capa D y su dependencia de la frecuencia. Informes sobre la caída de cobertura móvil en el apagón ibérico de abril de 2025. Especificaciones de PMR446 y régimen europeo de uso sin licencia. Regulación española de radioafición (indicativos EA, EB y EC). Literatura sobre degradación de GNSS por centelleo ionosférico. Regla de Naismith para estimación de tiempos de marcha.

### 7.5 Esto se corrige a mano

Este manual no es una lápida. Si encuentras un error, **táchalo en el papel y escribe la corrección al lado**, con la fecha y de dónde sacaste el dato bueno. Si el documento circula entre más gente, que circule también la corrección: un error repetido en veinte copias impresas es peor que no tener manual, porque la gente confía en lo que está impreso.

Y si una cifra de aquí contradice lo que te dice tu médico, tu farmacéutico, tu veterinario o el técnico que te montó las placas, **hazles caso a ellos**. Ellos conocen tu caso; este papel no.
