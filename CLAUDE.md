# CEPEGO — notas del proyecto

Web del Centre Excursionista de Pego. Sitio estático generado con Python,
alojado en Netlify, con funciones serverless que hablan con Airtable.

> **Este fichero va en el repositorio a propósito.** Ya se perdió una vez
> por vivir solo en la máquina de trabajo: es lo único que explica cómo
> funciona todo esto, así que tiene que sobrevivir a quien lo gestione.

## Servicios de los que depende la web

El club es de voluntarios y la gente rota, así que conviene tener claro
qué cuentas existen y qué pasa si se pierde el acceso a cada una. Ninguna
credencial se guarda aquí: esto es solo el mapa.

| Servicio | Para qué | Si se pierde el acceso |
|---|---|---|
| **GitHub** (`cexcursionistapego-afk/CEPEGO`) | El código y el contenido. Todo el historial. | Se conserva la web publicada, pero no se puede cambiar nada. Es la copia de seguridad real del proyecto. |
| **Netlify** | Publica la web y ejecuta las funciones. Guarda las claves secretas como variables de entorno. | La web deja de poder actualizarse. Las claves de Airtable y Turnstile viven solo ahí. |
| **Airtable** | **Todos los datos de socios**: nombre, DNI/NIE, teléfono, IBAN y fotos del DNI. También reservas, consultas y el registro de viajeros. | Es lo más sensible que hay. Una brecha aquí es notificable a la AEPD. |
| **Cloudflare** | Solo la configuración del captcha (Turnstile). | Se podría desactivar el captcha. Impacto bajo. |
| **Wix** | Donde está registrado el dominio `cepego.com` (la web anterior del club estaba allí). | Quien controle esto puede apuntar el dominio a otro sitio y suplantar la web entera. |
| **Gmail** (`cexcursionistapego@gmail.com`) | Correo del club y vía de recuperación de todas las demás cuentas. | Da acceso indirecto a casi todo lo anterior. |

Todas tienen verificación en dos pasos activada.

## Continuidad: qué pasa si quien lo gestiona no está

La verificación en dos pasos de todos los servicios está asociada a la
cuenta del club, **cexcursionistapego@gmail.com**, no a una cuenta
personal. Eso es lo correcto: la identidad es del club, no de quien lo
gestione en cada momento.

Quien lo lleva a día de hoy es Juansa (`juansa.moll@gmail.com`), y hay un
segundo miembro de la junta, Ximo, al corriente de cómo funciona.

Los códigos del segundo factor están en **Google Authenticator,
sincronizado con la cuenta de Google del club**. Esto es lo que hace que
el relevo sea posible, porque Google Authenticator guarda los códigos en
la cuenta y no solo en el móvil.

**Cómo recuperar el acceso si quien lo gestiona ya no está:**

1. Entrar en `cexcursionistapego@gmail.com` (la contraseña la debe
   conocer alguien más de la junta; si no, se recupera por los medios
   habituales de Google).
2. Instalar Google Authenticator en el móvil nuevo e iniciar sesión con
   esa misma cuenta de Google. Los códigos de todos los servicios
   aparecen solos.
3. Con eso ya se puede entrar en Netlify, GitHub, Airtable, Cloudflare y
   Wix.

**El punto débil que queda** es la contraseña del Gmail del club: si nadie
más la sabe ni puede recuperarla, la cadena se rompe en el primer paso.
Conviene que un segundo miembro de la junta pueda entrar en ese correo, o
que la contraseña esté guardada en un sitio que controle el club (un sobre
cerrado en poder del secretario, por ejemplo). Es lo único que hay que
mantener vivo con el tiempo.

Saber cómo funciona la web (este documento) y poder entrar a cambiarla son
dos cosas distintas. Ambas están cubiertas mientras se mantenga el acceso
al correo del club.

## Despliegue: leer esto antes de tocar ramas

**Netlify publica `claude/rerun-test-download-site-hjl80a`.** Es la rama de
producción real: lo que se sube ahí sale en cepego.com.

En Netlify → Build & deploy → Branches and deploy contexts:
- Production branch: `claude/rerun-test-download-site-hjl80a`
- Branch deploys: **None** (solo se despliega la rama de producción)

**`claude/prueba-94xvlo` no se despliega en ningún sitio.** Es un espejo
histórico que quedó de una configuración anterior. No hace falta
mantenerlo sincronizado: hacerlo duplica el trabajo en cada cambio y ya
provocó divergencias silenciosas (el calendario mejorado y las ediciones
del panel se quedaron sin llegar durante semanas). Trabaja solo sobre la
rama de producción salvo que alguien pida lo contrario.

**Netlify no ejecuta el generador.** El Build command está sin definir y
`publish = "."`, así que Netlify sirve tal cual el HTML que hay en el
repositorio. Después de tocar `build/gen.py` o `build/pages.py` hay que
ejecutar `python3 build/gen.py` y **commitear el HTML generado**, o los
cambios no salen.

**Antes de empezar, comprueba que la copia local es la buena.** El panel
escribe directo en la rama de producción, así que el remoto avanza solo.
Un `git fetch` y un `git log --oneline -3 origin/<rama>` al principio
evitan trabajar encima de una copia vieja. Si al ir a subir salen
conflictos en *todos* los ficheros a la vez, no es un conflicto normal:
son dos historias distintas, y la buena es la del remoto.

## Estructura

- `build/gen.py` — plantilla común (`doc()`, `header()`, `footer()`,
  `subhero()`, `write()`), constantes y la Content-Security-Policy.
  `doc()` acepta `noindex=True` y `avis=False` para las páginas de un solo
  uso.
- `build/pages.py` — el contenido de cada página. `write()` genera la
  versión valenciana en la raíz y la castellana en `/es/`.
- `js/` — JavaScript del cliente. `main.js` va en todas las páginas.
- `netlify/functions/` — funciones serverless. Sin dependencias npm: usan
  el `fetch` nativo de Node.
- `data/*.json` — contenido editable desde el panel.
- `juansa/` — panel de administración (Decap CMS + Netlify Identity).
  Antes estaba en `/admin`; se movió para que los escáneres automáticos no
  lo encuentren. No lo pongas en `robots.txt`: eso publicaría la ruta.

La lista de páginas del `sitemap.xml` es la constante `PAGES` de
`gen.py`, escrita a mano. Una página nueva no entra sola: si debe
indexarse, hay que añadirla ahí.

## Panel de administración

En `cepego.com/juansa`, protegido con Netlify Identity. Escribe
directamente en la rama de producción (`backend.branch` en
`juansa/config.yml`), así que **las ediciones del club salen publicadas
solas**. Gestiona: calendario, datos del club, aviso de portada, notícies
y reunions.

Las imágenes que se suben por el panel van a `img/calendari/` con un
nombre automático. Si una se va a usar en la web (una cabecera, por
ejemplo), muévela a `img/` con un nombre que se entienda.

## Seguridad de los formularios

Los cinco formularios (alta, baja, contacto, reserva y registro de
viajeros) llevan, en este orden:

1. Honeypot (campo oculto `website`).
2. Comprobación de `Origin`/`Referer` contra el propio dominio (CSRF).
3. Cloudflare Turnstile, verificado en servidor contra siteverify.

Turnstile falla en abierto a propósito en dos casos, para no dejar al club
sin formularios: si `TURNSTILE_SECRET_KEY` no está configurada, y si
Cloudflare no responde. **Ojo con el primero**: si la variable falta o está
mal escrita, los formularios siguen funcionando pero sin validar nada. La
señal fiable es el panel de Turnstile en Cloudflare, que avisa si no le
llegan llamadas a siteverify — un envío correcto no distingue los dos
casos.

Las variables de entorno viven en Netlify (nunca en el repositorio):
`AIRTABLE_TOKEN`, `AIRTABLE_BASE`, `AIRTABLE_TABLE`, `TURNSTILE_SECRET_KEY`.
La site key de Turnstile sí es pública y está en `build/gen.py`.

La Content-Security-Policy va como `<meta>` en las páginas generadas, no
como cabecera en `netlify.toml`, precisamente para que no alcance a
`juansa/index.html`, que carga Decap CMS desde unpkg. Si añades algún
recurso externo nuevo, actualiza `CSP` en `build/gen.py`.

## Cómo llegan los datos a Airtable

Todo lo que la gente envía por los formularios acaba en la base
`appkuKVxHSMyDElfh`, en cuatro tablas:

- **CONTACTE** (`tblAD8ZeIKmNwNRm9`) — reservas y consultas. El campo
  `TIPO DE CONSULTA` distingue unas de otras.
- **SOCIS** (`tblNm2FZG9KCdiCDq`) — altas de socio, con las fotos del DNI
  adjuntas al registro.
- **BAIXES** (`tblGeQzo49FyjBQJs`) — bajas.
- **REGISTRE RESERVES R.D. 933/2021** (`tblPIgkyzam4AKvTo`) — el registro
  de viajeros del refugio.

Las reservas entran con `ESTADO = "PENDENT GESTIONAR"`. **El calendario de
la web solo bloquea los días de los registros que el club pasa a
`ESTADO = "RESERVAT"`** a mano en Airtable. O sea: una solicitud no ocupa
fechas hasta que alguien la confirma. Ese es el circuito, y es
intencionado.

El IBAN se guarda siempre junto y en mayúsculas (`normIBAN` en
`netlify/functions/_validators.js`), aunque la gente lo escriba de cuatro
en cuatro.

## Registro de viajeros (R.D. 933/2021)

En `cepego.com/hostes` (y `/huespedes`, que redirige a la versión
castellana). Es la página que se pasa a quien viene a dormir al refugio:
la ley obliga a registrar a todo el que pernocta.

- **Fuera del menú, con `noindex` y fuera del sitemap**, pero *no es
  secreta*: es un formulario público y se protege como los demás.
- **No lista ningún registro, y es a propósito.** Al ser pública,
  cualquiera con el enlace entra; un endpoint de lectura sería una lista
  abierta de DNIs y domicilios. Los registros se consultan en Airtable.
- `netlify/functions/registre-viatgers.js` solo escribe. El tipo de
  documento (DNI / PASSAPORTE / TIE) decide en qué campo va el número y en
  qué campo de adjunto va la foto.
- **Cuatro idiomas** — el resto del sitio tiene dos. Al refugio viene
  gente de fuera. No hay `/en/` ni `/fr/`: el selector de la propia página
  cambia `data-lang` al vuelo y el CSS enseña los `<span>` que tocan. Por
  eso `.en` y `.fr` van ocultos en cualquier otro idioma, para que no
  aparezca texto a medias en otra página.
- **El calendario está hecho a mano** (`js/hostes.js`). No se usa
  `<input type="date">` porque ese calendario lo pinta el navegador y sale
  en el idioma *del navegador*, no en el de la página. Se comprobó: poner
  `lang` en el campo o en el documento no cambia nada.
- No tiene cabecera, ni franja de avisos, ni pie. El único enlace al aviso
  de privacidad es el del bloque "Qué hacemos con los datos": si tocas ese
  texto, no lo pierdas.

## Webcam del refugio

Sale en `/meteo`, encima de las dos estaciones. La cámara está en un
ordenador del club que sube una foto cada 5 minutos.

- **No hay FTP**: en Netlify no se puede montar un servidor FTP. El
  ordenador sube la foto por HTTPS a `/api/webcam-upload` con una clave
  (`WEBCAM_UPLOAD_KEY`). Esa clave **solo sirve para subir la foto**: es a
  propósito, para que un ordenador que se pierda no se lleve nada más.
- La foto se guarda en **Netlify Blobs**, no en el repositorio. Si fuera al
  repositorio, cada publicación del panel `/juansa` la borraría, porque el
  sitio se vuelve a desplegar tal cual está en git.
- `/api/webcam` la devuelve. Pasa por una función en vez de ir directa al
  `<img>` porque la CSP es `img-src 'self' data:`.
- **La edad la calcula el navegador**, no el servidor: la respuesta se
  cachea 4 minutos y un "hace X minutos" hecho en el servidor se quedaría
  congelado y mostraría una hora que no cuadra.
- **La foto no se amplía nunca más de lo que mide** (`js/webcam.js` le pone
  un `max-width` igual a su anchura real). Antes se estiraba a 16:9 con
  `object-fit:cover`, que además recortaba los lados: se veía borrosa. Si
  se ve pequeña, el problema está en el origen — que la cámara guarde a
  1280×720 o más.

**Ahora mismo la cámara sube las 24 horas**, también de noche.

Existe la opción de pararla por la noche: si se rellenan `webcam_nit_desde`
y `webcam_nit_fins` en el panel, durante esa franja la página dice que la
cámara descansa y a qué hora vuelve, en vez de avisar de que la imagen es
vieja. **Están vacías a propósito**; dejarlas así es lo que hace que la
webcam funcione toda la noche.

> Si algún día se rellenan, **esas horas quedan en dos sitios**: el panel y
> la tarea programada del ordenador de la cámara. Habría que cambiarlas en
> los dos, o la página dirá una cosa y la cámara hará otra.

## Reglas del refugio codificadas

Estas son decisiones del club, no detalles técnicos. Están duplicadas en
el navegador (`js/reserves.js`, para pintar el calendario) y en el
servidor (`netlify/functions/reserva.js`, que es quien de verdad manda).
Si cambia alguna, hay que tocar los dos sitios.

- **Cierre de verano**: del 31 de mayo al 1 de octubre no se reserva.
- **Nochevieja**: la noche del 31 de diciembre no se alquila nunca.
- **Aforo**: máximo 21 personas.
- **Cambio de turno**: la salida del sábado es a las 12:00, así que otro
  grupo puede entrar ese mismo día. La del domingo es a las 17:00, así que
  no da tiempo: los domingos que son día de salida quedan bloqueados para
  entrar. Por eso el calendario avisa de que quizá haya que entrar o salir
  a las 12:00.
- **Excepciones puntuales**: `BLOCKED_EXIT` en `js/reserves.js` marca días
  sueltos en los que nadie puede salir (ahora mismo, el 8-11-2026).
- **Cola de reservas**: si en el panel se pone una fecha en
  `reserves_cua_desde`, las solicitudes para esa fecha en adelante se
  aceptan pero avisando de que entran en cola.

## Añadir una ruta a "Rutes i entorn"

Las rutas son la lista `routes` de `build/pages.py`, una tupla de 11
campos, **ordenada por distancia**. El desplegable de territorio sale solo
de las propias rutas, así que un pueblo nuevo aparece en el filtro sin
tocar nada más.

El QR lo hace un script, para no tener que acordarse de la receta:

```bash
pip install segno pillow opencv-python-headless numpy   # solo la primera vez
python3 build/qr.py "https://es.wikiloc.com/rutas-senderismo/..." pla-roig
# -> img/ruta-pla-roig-qr.png
```

El script **comprueba el código con un lector antes de guardarlo**: si no
se puede escanear, no escribe nada y falla. Tampoco pisa un fichero que ya
exista. El logo de Wikiloc está en `build/wikiloc-logo.png` (solo se usa
para generar; no se publica).

Si algún día hay que hacerlo a mano, la receta es: 684 × 684 px, **negro
sobre blanco** (nada de azul ni de escudo), logo de Wikiloc centrado al
**32,5 %**, corrección de errores `H` y subiendo la versión hasta que un
lector de verdad lo descodifique — con el logo encima, las versiones bajas
no dejan bastante redundancia. Se estropeó una vez justamente por hacerlo
de memoria.

## Probar los cambios

No hay suite de tests. Lo que funciona bien es levantar el sitio y
comprobarlo con un navegador de verdad:

```bash
python3 build/gen.py
python3 -m http.server 8910
# y con Playwright: chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
```

Las funciones serverless se pueden probar importándolas en Node y
sustituyendo `global.fetch` por un doble, sin necesidad de red.

## Cosas que ya han dado problemas

- **Turnstile deja pasar todo si falta la clave.** Un envío correcto no
  distingue "verificado" de "saltado". Solo lo dice el panel de Cloudflare.
- **Las variables de entorno de Netlify no llegan a las funciones hasta
  que hay un despliegue nuevo.** Cambiar una y no redesplegar parece que
  funciona, pero no aplica.
- **El viento de AEMET, calibrado (29-09-2026)** contra el HTML real (capturado
  con un `.webarchive` de Safari). La fila viene marcada por un `<th title="Dirección
  y velocidad del viento"...>` — **en minúscula**, a diferencia de las otras
  filas ("Probabilidad de precipitación", con mayúscula), así que la búsqueda
  se hace en minúsculas. Cada celda trae `<div class="texto_viento">SO</div>`
  (rumbo) y `<div class="font-size-12px">5</div>` (km/h); en calma, rumbo "C"
  y velocidad "0". Solo se pinta a partir de 15 km/h. Va dentro de cada tramo
  (mañana/tarde/noche), junto al % de lluvia; en los días de un solo bloque se
  usa el más fuerte del día.
- **Las capturas de AEMET y AVAMET se parsean del HTML de sus webs.** Si
  cambian el diseño, `netlify/functions/aemet.js` o `meteo.js` empezarán a
  devolver `parse_failed`. No es un fallo del código: hay que reajustar
  las expresiones regulares al HTML nuevo.
- **AVAMET devolvió 403 (27-09-2026)** porque mandábamos un User-Agent que
  se declaraba robot. Se cambió por uno de navegador normal. Para saber
  cuál de las dos cosas pasa, abre `cepego.com/api/meteo?station=figuereta`
  y mira el `error`: `fetch_failed` es que ellos nos rechazan o están
  caídos; `parse_failed` es que han cambiado el HTML. La página enseña
  "sense connexió" en los dos casos, así que desde fuera no se distinguen.
- **Netlify Blobs no siempre se autoconfigura.** La webcam guarda la foto ahí
  (`netlify/functions/_blobs.js`). Si la subida falla con
  `MissingBlobsEnvironmentError` / `blobs-sense-configurar`, es que Netlify no
  le está inyectando el contexto a la función: hay que poner `BLOBS_SITE_ID` y
  `BLOBS_TOKEN` en las variables del sitio y **redesplegar**. El código usa
  esas variables si están y, si no, deja que Netlify haga lo suyo, así que el
  día que vuelva a funcionar solo basta con quitarlas.
- **El calendario nativo de `<input type="date">` no se puede traducir**
  desde la web: sale en el idioma del navegador y ya está.
- **CSS Grid con `1fr` no da columnas iguales** si el contenido de una es
  más ancho. Por eso `.cols-2/3/4` usan `minmax(0,1fr)`.
- **Las imágenes pegadas en el chat no llegan a la máquina de trabajo.**
  Para meter una foto nueva hay que subirla por el panel `/juansa` y luego
  moverla a `img/`.
