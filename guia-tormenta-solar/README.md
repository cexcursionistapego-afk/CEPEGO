# Semanas sin red — guía de tormenta solar

Manual de emergencia (69 páginas, A4) sobre cómo prepararse y sobrevivir a un apagón
prolongado provocado por una tormenta geomagnética severa. **No forma parte de la web
del club**: es un documento independiente pensado para imprimirse y guardarse en papel.

- `semanas-sin-red.pdf` — el documento final, listo para imprimir a doble cara.
- `fuentes/` — las seis secciones en Markdown, una por dominio.
- `generador/` — lo necesario para regenerar el PDF desde las fuentes.

## Regenerar el PDF

Requiere Python 3 y un Chromium (aquí se usa el de Playwright).

```
pip install markdown playwright pypdf
python3 generador/getfonts.py    # descarga Archivo, Source Serif 4 y JetBrains Mono
python3 generador/build_pdf.py
```

El montaje hace **dos pasadas**: la primera detecta en qué página cae cada epígrafe
mediante marcadores fuera de flujo; la segunda numera el índice y los elimina. Por eso
el índice lleva números de página reales y la paginación no se desplaza entre pasadas.

## Aviso

Las cifras del documento llevan fuente y distinguen lo bien establecido de lo
especulativo; las recomendaciones operativas son criterio. No sustituye a formación
presencial en primeros auxilios, ni a la licencia de armas o de caza, ni al consejo
médico. Las técnicas de trampeo y caza de la sección 4 están reguladas o prohibidas
en España y en casi toda la UE fuera de una emergencia declarada.

## Versión protegida

`semanas-sin-red-protegido.pdf` es la misma guía con permisos de PDF que bloquean copiar texto, editar y extraer páginas en lectores que respetan esos permisos (Adobe Reader, Vista Previa, la mayoría de apps móviles). Se abre sin contraseña y la búsqueda funciona con normalidad.

**Límite real, sin adornos:** esto no es cifrado de contenido ni DRM. Es una señal que los lectores conformes respetan, pero que herramientas comunes —incluida la propia librería con la que se generó este PDF— pueden ignorar y extraer el texto igualmente. Tampoco existe forma de impedir una captura de pantalla desde ningún formato de documento: es una función del sistema operativo del lector, no del archivo. Trátalo como una barrera de cortesía, no como seguridad real.

`semanas-sin-red.pdf` es el máster sin proteger; es el que hay que editar para futuras revisiones. La contraseña de propietario de la versión protegida (necesaria para quitarle los permisos con una herramienta como Acrobat) no se guarda en este repositorio.
