#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera el QR d'una ruta de Rutes i entorn, igual que tots els altres.

    python3 build/qr.py <url-de-wikiloc> <nom>

El <nom> és la part del mig del fitxer: "pla-roig" fa img/ruta-pla-roig-qr.png.

Per què hi ha un script per a una cosa tan curta: la recepta no estava
escrita en cap lloc i una vegada es va pujar un QR blau amb l'escut del club
en compte de negre amb el logo de Wikiloc. Ací els paràmetres estan fixats i
no hi ha res a recordar.

La recepta, per si algun dia cal tocar-la a mà:
  - 684 × 684 px, negre sobre blanc.
  - Logo de Wikiloc centrat, ocupant el 32,5 %.
  - Correcció d'errors H, pujant la versió fins que un lector de veritat el
    puga llegir: amb el logo damunt, les versions baixes no deixen prou
    redundància per a una URL llarga.

L'últim pas és el que importa: el QR es comprova amb un lector abans de
desar-lo. Si no passa la comprovació, no s'escriu res i l'script falla, que
és molt millor que penjar un codi que no s'escaneja i no assabentar-se'n.

Fa falta: pip install segno pillow opencv-python-headless numpy
"""

import io
import os
import sys

import segno
import numpy as np
import cv2
from PIL import Image

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ARREL, 'build', 'wikiloc-logo.png')
COSTAT = 684          # els altres QR del lloc fan esta mida
PROPORCIO = 0.325     # quant del QR ocupa el logo
VERSIO_MAX = 25


def genera(url, desti):
    logo = Image.open(LOGO).convert('RGB')
    costat_logo = int(COSTAT * PROPORCIO)
    logo = logo.resize((costat_logo, costat_logo), Image.LANCZOS)
    lector = cv2.QRCodeDetector()

    for versio in range(8, VERSIO_MAX + 1):
        try:
            qr = segno.make(url, error='h', version=versio)
        except Exception:
            continue  # la URL no cap en esta versió: provem la següent
        buf = io.BytesIO()
        qr.save(buf, kind='png', scale=12, border=4)
        im = Image.open(buf).convert('RGB').resize((COSTAT, COSTAT), Image.LANCZOS)
        cantonada = (COSTAT - costat_logo) // 2
        im.paste(logo, (cantonada, cantonada))

        llegit, _, _ = lector.detectAndDecode(
            cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR))
        if llegit == url:
            im.save(desti)
            return versio

    return None


def main():
    if len(sys.argv) != 3:
        print(__doc__.strip().split('\n\n')[1])
        return 2

    url, nom = sys.argv[1], sys.argv[2]
    if not url.startswith('http'):
        print('La primera cosa ha de ser la URL de Wikiloc.')
        return 2

    nom = nom.removeprefix('ruta-').removesuffix('-qr').removesuffix('.png')
    desti = os.path.join(ARREL, 'img', f'ruta-{nom}-qr.png')
    if os.path.exists(desti):
        print(f'Ja existeix {os.path.relpath(desti, ARREL)}. Esborra\'l primer si el vols refer.')
        return 1

    versio = genera(url, desti)
    if versio is None:
        print('No s\'ha pogut fer un QR llegible per a esta URL. Mira si és massa llarga.')
        return 1

    print(f'· {os.path.relpath(desti, ARREL)} · versió {versio} · llegit i verificat')
    print('  Ara afig la ruta a la llista routes de build/pages.py, ordenada per distància.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
