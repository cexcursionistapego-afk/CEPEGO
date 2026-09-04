# CEPEGO — notas del proyecto

Web del Centre Excursionista de Pego. Sitio estático generado con Python,
alojado en Netlify, con funciones serverless que hablan con Airtable.

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
