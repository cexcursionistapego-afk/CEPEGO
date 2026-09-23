import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

SRC = '/root/.claude/uploads/3459d845-f1d6-5004-9c24-b1d8bc6aa6f8/788106ea-image.jpg'
OUT = '/home/user/CEPEGO/apicultora.jpg'
SCRATCH = '/tmp/claude-0/-home-user-CEPEGO/3459d845-f1d6-5004-9c24-b1d8bc6aa6f8/scratchpad/'

im = Image.open(SRC).convert('RGB')
W, H = im.size
arr = np.asarray(im).astype(np.float32)
Y, X = np.mgrid[0:H, 0:W].astype(np.float32)

S = 2
PIVOT = (1045.0, 1000.0)
ANGLE = -8.0
CLOTH = np.array([243.0, 238.0, 226.0], dtype=np.float32)

def blank(): return Image.new('L', (W * S, H * S), 0)
def sc(p):   return [(x * S, y * S) for x, y in p]

def bake(m, rotate=False, blur=1.6):
    if rotate:
        m = m.rotate(ANGLE, resample=Image.BICUBIC, center=(PIVOT[0] * S, PIVOT[1] * S))
    m = m.resize((W, H), Image.LANCZOS)
    if blur: m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(m).astype(np.float32) / 255.0

def blurA(a, r):
    return np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(r))).astype(np.float32)

def over(base, color, mask):
    m = mask[..., None]
    if not isinstance(color, np.ndarray): color = np.array(color, np.float32)
    return base * (1 - m) + color * m

L = arr[..., 0] * .299 + arr[..., 1] * .587 + arr[..., 2] * .114

# ============================================================ mascaras
shirt = np.load(SCRATCH + 'shirt_mask.npy')
M_SUIT = blurA(shirt * 255.0, 1.6) / 255.0

veil = [(862,898),(1230,898),(1244,1010),(1248,1124),(1234,1156),
        (1046,1172),(858,1156),(844,1124),(848,1010)]
m = blank(); d = ImageDraw.Draw(m)
d.polygon(sc(veil), fill=255)
d.ellipse(sc([(844,1100),(1248,1198)]), fill=255)
M_VEIL_RAW = bake(m, rotate=True, blur=1.2)

m = blank(); d = ImageDraw.Draw(m)
d.ellipse(sc([(846,856),(1246,928)]), fill=255)      # ala
d.rectangle(sc([(920,802),(1172,900)]), fill=255)    # copa
d.ellipse(sc([(920,768),(1172,834)]), fill=255)      # tapa
M_HAT = bake(m, rotate=True, blur=1.1)

m = blank(); d = ImageDraw.Draw(m)
d.rectangle(sc([(920,802),(1172,898)]), fill=255)
d.ellipse(sc([(920,768),(1172,834)]), fill=255)
M_CROWN = bake(m, rotate=True, blur=1.1)

m = blank(); d = ImageDraw.Draw(m)
d.ellipse(sc([(852,894),(1240,996)]), fill=255)
M_BRIMSHADOW = bake(m, rotate=True, blur=15.0)

M_VEIL = np.clip(M_VEIL_RAW - M_HAT, 0, 1)

gx = np.clip((X - 760.0) / 520.0, 0, 1)
KEY = (1.10 - 0.50 * gx) * (1.0 - 0.16 * np.clip((Y - 1150.0) / 520.0, 0, 1))

rng = np.random.default_rng(7)
grain = blurA(rng.normal(0, 3.4, (H, W)).astype(np.float32) + 128, 0.7) - 128

out = arr.copy()

# ============================================================ 1. mono
sel = shirt
Lb, Lm = blurA(L, 17), blurA(L, 5)
lo, hi = np.percentile(Lb[sel], 3), np.percentile(Lb[sel], 97)
rg = max(hi - lo, 1e-3)
Ln = np.clip((Lb - lo) / rg, 0, 1) ** 0.9
det = np.clip((Lm - Lb) / rg, -0.5, 0.5)
shade = (0.42 + 0.68 * Ln + 0.44 * det) * (0.96 + 0.07 * (1 - gx))
suit = np.clip(CLOTH[None, None, :] * shade[..., None] + grain[..., None] * 1.8, 0, 255)
out = over(out, suit, M_SUIT)

def band(er_in, er_out, sub=None):
    a = ndi.binary_erosion(shirt, np.ones((er_in, er_in)))
    b = ndi.binary_erosion(shirt, np.ones((er_out, er_out)))
    bd = (a & ~b).astype(np.float32)
    if sub is not None: bd *= sub
    return blurA(bd * 255, 2.0) / 255.0

# costura hombro/manga
m = blank(); d = ImageDraw.Draw(m)
d.line(sc([(930,1150),(886,1192),(852,1252),(836,1318)]), fill=255, width=5*S)
seam = bake(m, blur=2.0) * M_SUIT
out = over(out, np.clip(suit * 0.74, 0, 255), seam * 0.7)
m = blank(); d = ImageDraw.Draw(m)
d.line(sc([(936,1144),(892,1186),(858,1246),(842,1312)]), fill=255, width=3*S)
out = over(out, np.clip(suit * 1.14 + 12, 0, 255), bake(m, blur=2.4) * M_SUIT * 0.45)

# puno elastico de la manga (borde inferior derecho)
selbot = ((Y > 1360) & (X > 1010)).astype(np.float32)
cuff = band(9, 21, selbot) * M_SUIT
out = over(out, np.clip(suit * 0.80, 0, 255), cuff * 0.55)
cuff2 = band(21, 27, selbot) * M_SUIT
out = over(out, np.clip(suit * 1.10 + 8, 0, 255), cuff2 * 0.35)

# ============================================================ 2. velo
th = math.radians(-ANGLE)
u = (X - PIVOT[0]) * math.cos(th) + (Y - PIVOT[1]) * math.sin(th)
v = -(X - PIVOT[0]) * math.sin(th) + (Y - PIVOT[1]) * math.cos(th)
P = 4.6
mesh = np.maximum(np.cos(2*math.pi*u/P)**10, np.cos(2*math.pi*v/P)**10)
# ligera ondulacion de la tela
wob = 0.5 + 0.5*np.sin(u/47.0 + np.sin(v/61.0)*1.3)

veil_c = arr * 0.40 + np.array([20.0, 22.0, 26.0])[None, None, :] * 0.60
veil_c *= (1.0 - 0.38 * mesh)[..., None]
veil_c *= (0.90 + 0.20 * wob)[..., None]
sheen = np.exp(-(((X - 905)/215.0)**2 + ((Y - 1010)/265.0)**2))
veil_c += (sheen * 30.0)[..., None]
veil_c *= np.clip(KEY * 1.06, 0.45, 1.22)[..., None]
veil_c = np.clip(veil_c + grain[..., None] * 1.2, 0, 255)
out = over(out, veil_c, M_VEIL)
out = out * (1 - (M_BRIMSHADOW * M_VEIL)[..., None] * 0.40)

# el mono se repinta sobre el velo => velo remetido en el cuello
m = blank(); d = ImageDraw.Draw(m)
d.polygon(sc([(830,1096),(1250,1096),(1250,1186),(1190,1196),(1040,1204),(900,1196),(830,1182)]), fill=255)
M_COLLAR = bake(m, blur=10.0) * M_SUIT
out = over(out, suit, M_COLLAR)
# sombra del velo justo encima del cuello
m = blank(); d = ImageDraw.Draw(m)
d.line(sc([(846,1150),(1000,1176),(1190,1160)]), fill=255, width=26*S)
out = out * (1 - (bake(m, blur=10.0) * M_COLLAR)[..., None] * 0.30)

# canto iluminado del velo
m = blank(); d = ImageDraw.Draw(m)
d.polygon(sc(veil), outline=255, width=4*S)
rim = bake(m, rotate=True, blur=2.6) * M_VEIL * np.clip(1.5 - 1.7*gx, 0, 1)
out = over(out, np.array([172.0, 172.0, 166.0]), rim * 0.40)

# elastico del bajo del velo
m = blank(); d = ImageDraw.Draw(m)
d.arc(sc([(844,1090),(1248,1188)]), 14, 166, fill=255, width=9*S)
hem = bake(m, rotate=True, blur=2.2) * M_VEIL
out = over(out, np.clip(veil_c * 0.62, 0, 255), hem * 0.7)

# ============================================================ 3. sombrero
hat = CLOTH[None, None, :] * KEY[..., None]
vol = 1.05 - 0.28*np.clip((X - 905.0)/300.0, 0, 1) - 0.10*np.clip((Y - 790.0)/130.0, 0, 1)
hat = np.clip(hat * np.clip(vol, .45, 1.15)[..., None] + grain[..., None] * 1.4, 0, 255)
out = over(out, hat, M_HAT)

m = blank(); d = ImageDraw.Draw(m)
d.ellipse(sc([(846,856),(1246,928)]), outline=255, width=7*S)
brimline = bake(m, rotate=True, blur=2.0) * np.clip(M_HAT - M_CROWN, 0, 1)
out = over(out, np.clip(hat * 0.78, 0, 255), brimline * 0.5)

m = blank(); d = ImageDraw.Draw(m)
d.line(sc([(921,896),(1171,896)]), fill=255, width=4*S)
out = over(out, np.clip(hat * 0.68, 0, 255), bake(m, rotate=True, blur=1.6) * M_HAT * 0.5)

Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(OUT, quality=94, subsampling=1)
print('escrito', OUT)
