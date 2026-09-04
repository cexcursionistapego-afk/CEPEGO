# CEPEGO — notas del proyecto

Web del Centre Excursionista de Pego. Sitio estático generado con Python,
alojado en Netlify, con funciones serverless que hablan con Airtable.

## Servicios de los que depende la web

El club es de voluntarios y la gente rota, así que conviene tener claro
qué cuentas existen y qué pasa si se pierde el acceso a cada una. Ninguna
credencial se guarda aquí: esto es solo el mapa.

| Servicio | Para qué | Si se pierde el acceso |
|---|---|---|
| **GitHub** (`cexcursionistapego-afk/CEPEGO`) | El código y el contenido. Todo el historial. | Se conserva la web publicada, pero no se puede cambiar nada. Es la copia de seguridad real del proyecto. |
| **Netlify** | Publica la web y ejecuta las funciones. Guarda las claves secretas como variables de entorno. | La web deja de poder actualizarse. Las claves de Airtable y Turnstile viven solo ahí. |
| **Airtable** | **Todos los datos de socios**: nombre, DNI/NIE, teléfono, IBAN y fotos del DNI. También reservas y consultas. | Es lo más sensible que hay. Una brecha aquí es notificable a la AEPD. |
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

## Estructura

- `build/gen.py` — plantilla común (`doc()`, `header()`, `footer()`,
  `subhero()`, `write()`), constantes y la Content-Security-Policy.
- `build/pages.py` — el contenido de cada página. `write()` genera la
  versión valenciana en la raíz y la castellana en `/es/`.
- `js/` — JavaScript del cliente. `main.js` va en todas las páginas.
- `netlify/functions/` — funciones serverless. Sin dependencias npm: usan
  el `fetch` nativo de Node.
- `data/*.json` — contenido editable desde el panel.
- `juansa/` — panel de administración (Decap CMS + Netlify Identity).
  Antes estaba en `/admin`; se movió para que los escáneres automáticos no
  lo encuentren. No lo pongas en `robots.txt`: eso publicaría la ruta.

## Panel de administración

En `cepego.com/juansa`, protegido con Netlify Identity. Escribe
directamente en la rama de producción (`backend.branch` en
`juansa/config.yml`), así que **las ediciones del club salen publicadas
solas**. Gestiona: calendario, datos del club, aviso de portada, notícies
y reunions.

## Seguridad de los formularios

Los cuatro formularios (alta, baja, contacto, reserva) llevan, en este
orden:

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
`appkuKVxHSMyDElfh`, en tres tablas:

- **CONTACTE** (`tblAD8ZeIKmNwNRm9`) — reservas y consultas. El campo
  `TIPO DE CONSULTA` distingue unas de otras.
- **SOCIS** (`tblNm2FZG9KCdiCDq`) — altas de socio, con las fotos del DNI
  adjuntas al registro.
- **BAIXES** (`tblGeQzo49FyjBQJs`) — bajas.

Las reservas entran con `ESTADO = "PENDENT GESTIONAR"`. **El calendario de
la web solo bloquea los días de los registros que el club pasa a
`ESTADO = "RESERVAT"`** a mano en Airtable. O sea: una solicitud no ocupa
fechas hasta que alguien la confirma. Ese es el circuito, y es
intencionado.

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

## Cosas que ya han dado problemas

- **Turnstile deja pasar todo si falta la clave.** Un envío correcto no
  distingue "verificado" de "saltado". Solo lo dice el panel de Cloudflare.
- **Las variables de entorno de Netlify no llegan a las funciones hasta
  que hay un despliegue nuevo.** Cambiar una y no redesplegar parece que
  funciona, pero no aplica.
- **Las capturas de AEMET y AVAMET se parsean del HTML de sus webs.** Si
  cambian el diseño, `netlify/functions/aemet.js` o `meteo.js` empezarán a
  devolver `parse_failed`. No es un fallo del código: hay que reajustar
  las expresiones regulares al HTML nuevo.
- **CSS Grid con `1fr` no da columnas iguales** si el contenido de una es
  más ancho. Por eso `.cols-2/3/4` usan `minmax(0,1fr)`.

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
