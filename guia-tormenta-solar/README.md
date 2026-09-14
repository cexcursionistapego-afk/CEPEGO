# Semanas sin red — guía de tormenta solar

Manual de emergencia (54 páginas, A4) sobre cómo prepararse y sobrevivir a un apagón
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

`semanas-sin-red-protegido.pdf` es la misma guía cifrada con AES-256. Hace falta contraseña para abrirla (facilitada aparte, no se guarda en este repositorio); una vez abierta, la búsqueda funciona con normalidad pero copiar texto, editar y extraer páginas quedan bloqueados en lectores que respetan esos permisos (Adobe Reader, Vista Previa, la mayoría de apps móviles). Imprimir sí está permitido.

Esta versión usa contraseñas distintas para abrir el archivo y para gestionar sus permisos, a propósito: si fueran la misma, muchos lectores tratarían esa contraseña como la de propietario y desbloquearían la copia en cuanto se introdujera, anulando la protección.

**Límite real, sin adornos:** al estar cifrado con contraseña de apertura, el contenido no se puede extraer sin conocerla — es cifrado de verdad, no solo una bandera de permisos (se comprobó: sin contraseña, ni siquiera la librería con la que se generó el PDF puede tocar el contenido). Pero sigue sin existir forma de impedir una captura de pantalla desde ningún formato de documento: es una función del sistema operativo del lector, no del archivo.

`semanas-sin-red.pdf` es el máster sin proteger y sin contraseña; es el que hay que editar para futuras revisiones. Ni la contraseña de apertura ni la de propietario de la versión protegida se guardan en este repositorio.
