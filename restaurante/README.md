# Web y reservas — restaurante de autor

Web trilingüe (**valenciano por defecto**, castellano en `/es/`, inglés en `/en/`), con sistema de reservas propio y panel de gestión. Funciona en el plan gratuito de Netlify, sin base de datos externa: los datos se guardan en Netlify Blobs.

> **Nombre provisional:** «Umbral» y todos los datos marcados como PROVISIONAL (dirección, teléfono, equipo, productores, datos fiscales) son de relleno. Se cambian en `site.config.mjs` y `content/*.mjs`.

## Qué incluye

**Web pública** (`/`, `/es/`, `/en/`)
- Portada, Menús, Filosofía, Eventos privados, Tarjeta regalo, Contacto, Reservas, Gestionar reserva, Aviso legal, Privacidad, Cookies y 404, en los tres idiomas y con URL traducidas (`/reserves/`, `/es/reservas/`, `/en/reservations/`).
- Diseño propio: tipografía editorial, «platos generativos» dibujados a partir de los ingredientes de cada plato (hacen de imagen hasta que haya fotografía) y una web que sigue la luz de la sala: clara de día y oscura al anochecer, según la hora local del restaurante.
- Disponibilidad en directo en la portada («Queden taules», «Pròxima taula lliure: dissabte…»).
- Asistente de reserva paso a paso: comensales, día (calendario con disponibilidad real), hora, menú y maridaje, y datos con dietas, alergias y ocasión. Termina con localizador, enlace de gestión y botones para añadir la reserva al calendario.
- Lista de espera cuando no queda mesa, y solicitudes de eventos privados, tarjetas regalo y contacto.
- Si se cambian los menús o los horarios desde el panel, la web se actualiza sola.

**Reservas**
- Aforo por servicio y ritmo de llegadas por turno, para que la sala no se llene de golpe.
- Antelación mínima y máxima, cierres y vacaciones, confirmación automática o manual, y política de cancelación.
- Escrituras atómicas que impiden la sobreventa aunque entren dos reservas a la vez (está probado en los tests).
- Confirmación, recordatorio y cancelación por **email** (Resend) y **SMS** (Twilio), en el idioma del cliente. Cada SMS cabe en un solo mensaje (160 caracteres) e incluye un enlace corto para gestionar la reserva.

**Panel de gestión** (`/admin`)
- **Servicio**: la hoja de sala del día por turnos, con alergias destacadas, mesa asignable y estados (pendiente → confirmada → en sala → terminada, o no-show). Se actualiza sola cada minuto, admite impresión y se puede usar en tablet o móvil.
- **Calendario** de ocupación mensual; **Reservas** con búsqueda en todo el historial y exportación a CSV; **Clientes** con visitas, no-shows, etiquetas (VIP…) y notas.
- **Solicitudes** de eventos, regalos y contacto; **Ajustes** de reservas, avisos, horarios, cierres, menús en los tres idiomas y equipo (roles Administración y Sala).

## Publicar gratis en Netlify

1. Entra en [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → GitHub → este repositorio.
2. **Branch to deploy**: la rama de trabajo. **Base directory**: `restaurante`. El resto de opciones se leen de `netlify.toml`.
3. En **Site configuration → Environment variables**, añade como mínimo `ADMIN_PASSWORD` (al menos 12 caracteres).
4. **Deploy**. La web queda en `https://<nombre>.netlify.app` y el panel en `/admin` (usuario `admin`).

Mientras no se defina `SITE_URL`, la web se publica con `noindex` para que Google no indexe el nombre ni los datos provisionales.

### Variables de entorno

| Variable | Para qué | Obligatoria |
|---|---|---|
| `ADMIN_PASSWORD` | Contraseña de la cuenta `admin` del panel (mínimo 12 caracteres) | Sí |
| `SITE_URL` | Dominio definitivo, p. ej. `https://www.restaurante.com`. Activa la indexación en buscadores | Al estrenar |
| `APP_SECRET` | Clave para firmar sesiones y enlaces (32+ caracteres aleatorios). Si falta, se genera y guarda sola | Recomendada |
| `RESEND_API_KEY`, `MAIL_FROM` | Emails de confirmación y recordatorio ([resend.com](https://resend.com), 3.000/mes gratis). `MAIL_FROM` = `Nombre <reservas@dominio.com>` con el dominio verificado | Para email |
| `STAFF_EMAIL` | Email del restaurante que recibe los avisos de reservas y solicitudes nuevas | Opcional |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Credenciales de [Twilio](https://www.twilio.com) para enviar SMS | Para SMS |
| `TWILIO_FROM` o `TWILIO_MESSAGING_SERVICE_SID` | Remitente del SMS: número de Twilio o nombre alfanumérico de hasta 11 caracteres. El registro del remitente en España lo gestiona Twilio | Para SMS |
| `SMS_DEFAULT_COUNTRY` | Prefijo para teléfonos sin `+` (por defecto `34`) | No |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Antispam de Cloudflare en los formularios (gratis). Recomendado en producción | Recomendada |

Sin las claves de email o SMS el sistema funciona igual, simplemente no envía esos avisos. En **Ajustes → Avisos al cliente** se activa cada tipo de SMS. Por defecto están activados el de confirmación y el de recordatorio.

**Coste de los SMS**: el SMS no es gratis en ningún proveedor; en España suele costar unos céntimos por mensaje. Netlify y Resend son gratuitos con estos volúmenes.

## Cuando haya nombre y dominio

1. Cambia `name` (y el resto de datos PROVISIONAL) en `site.config.mjs`. Los textos están en `content/va.mjs`, `content/es.mjs` y `content/en.mjs`.
2. Regenera la imagen para redes y los iconos: `node scripts/images.mjs` (requiere Playwright en local).
3. En Netlify: **Domain management** → añade el dominio, y define `SITE_URL=https://tudominio.com`. Netlify activa HTTPS y redirige el `*.netlify.app` al dominio.
4. Da de alta el restaurante en Google Business Profile con el mismo nombre, dirección y teléfono que la web, y envía `https://tudominio.com/sitemap.xml` a Google Search Console.

## Desarrollo en local

```bash
cd restaurante
npm install
npm run seed   # opcional: reservas de demostración
npm run dev    # http://localhost:8888 · panel en /admin (admin / admin-local-2026)
npm test       # 19 pruebas: disponibilidad, sobreventa, cambios, SMS, RGPD…
```

En local los datos se guardan en `.data/`, y en Netlify en Blobs.

## Estructura

```
site.config.mjs        identidad del restaurante (nombre, dirección, idiomas…)
content/               textos de la web: va (predeterminado), es, en
lib/                   lógica de servidor: disponibilidad, reservas, autenticación, email, SMS, rutas
netlify/functions/     API pública, API del panel, enlace corto de SMS, recordatorios y mantenimiento diario
src/pages/             plantillas de página (se generan en el build)
src/assets/            CSS, JS del navegador, fuentes e imágenes
src/admin/             panel de gestión
scripts/build.mjs      genera dist/ (HTML de los tres idiomas, sitemap, robots, cabeceras)
test/                  pruebas automáticas (node --test)
```

## Seguridad

- Cabeceras estrictas (`netlify.toml`): CSP sin scripts de terceros (salvo el antispam opcional), HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y COOP.
- Sesión del panel en cookie `__Host-` HttpOnly, Secure y SameSite=Strict, firmada con HMAC y de 12 horas. Contraseñas con scrypt, límite de intentos de acceso por IP y roles Administración/Sala.
- Protección CSRF por origen y SameSite. Validación y límites de tamaño en todas las entradas, y escape de todo lo que se pinta. En la exportación CSV se neutralizan las fórmulas.
- Enlaces de cliente firmados (sin enumeración de reservas), límite de envíos por IP, campo trampa contra bots y Turnstile opcional.
- `/admin` y la API, fuera de buscadores y sin caché. Incluye `/.well-known/security.txt`.

## SEO

- HTML estático y rápido: sin frameworks, fuentes propias precargadas y caché inmutable de recursos.
- `hreflang` (`ca`, `es`, `en` y `x-default` → valenciano), canonical, Open Graph y Twitter en cada página, y URL traducidas.
- Datos estructurados: `Restaurant` (dirección, horario, reservas), `Menu` con platos y precios, `BreadcrumbList` y `WebSite`.
- `sitemap.xml` con todas las versiones de idioma, `robots.txt` y páginas 404 por idioma.

## Protección de datos

- Política de privacidad y de cookies en los tres idiomas. Solo se usa almacenamiento técnico, así que no hace falta banner de cookies.
- Las alergias se tratan como datos de salud, con consentimiento explícito.
- En el panel, cada ficha de cliente tiene **Eliminar datos del cliente** (derecho de supresión): se anonimizan sus reservas y solicitudes.
- Cada noche se borran automáticamente las fichas que llevan dos años sin visitas y los registros temporales antispam.
- Pendiente: revisar los textos legales con los datos fiscales reales.
