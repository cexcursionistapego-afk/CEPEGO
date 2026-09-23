import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

SRC = '/root/.claude/uploads/3459d845-f1d6-5004-9c24-b1d8bc6aa6f8/788106ea-image.jpg'
a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H, W, _ = a.shape
R, G, B = a[..., 0], a[..., 1], a[..., 2]
L = 0.299 * R + 0.587 * G + 0.114 * B

roi = np.zeros((H, W), bool); roi[1115:1500, 735:1232] = True
skin = (L > 110) & (R > B + 26)                     # brazo, cuello, pared calida

m = roi & (B >= R - 8) & (L > 18) & ~skin
m = ndi.binary_closing(m, np.ones((13, 13)))
m = ndi.binary_fill_holes(m)
lab, n = ndi.label(m)
sizes = ndi.sum(m, lab, range(1, n + 1))
m = lab == (1 + int(np.argmax(sizes)))

# zona del estampado oscuro / regazo, que el test de color descarta
p = Image.new('L', (W, H), 0)
dp = ImageDraw.Draw(p)
dp.polygon([(786,1288),(826,1252),(890,1248),(965,1300),(985,1372),
            (958,1408),(866,1408),(796,1390),(778,1344)], fill=255)
dp.polygon([(902,1126),(1000,1140),(1030,1200),(1000,1250),(930,1240),(898,1176)], fill=255)
dp.polygon([(884,1206),(918,1180),(958,1204),(962,1262),(920,1278),(882,1252)], fill=255)
dp.polygon([(1010,1128),(1110,1148),(1140,1182),(1090,1196),(1010,1172)], fill=255)
dp.polygon([(822,1244),(836,1190),(890,1176),(928,1196),(932,1262),(880,1282),(828,1274)], fill=255)
dp.polygon([(898,1156),(985,1176),(1035,1252),(1022,1338),(946,1340),(892,1258)], fill=255)
extra = (np.asarray(p) > 0) & ~skin & (L > 8)
m |= extra

# envolvente del torso: cierra los huecos internos sin invadir el fondo
env = Image.new('L', (W, H), 0)
ImageDraw.Draw(env).polygon(
    [(896,1118),(1000,1130),(1080,1158),(1150,1208),(1200,1290),(1226,1380),
     (1230,1462),(1180,1502),(1080,1506),(1000,1462),(950,1412),(870,1404),
     (800,1396),(766,1352),(760,1268),(788,1188),(838,1144)], fill=255)
env = np.asarray(env) > 0
m = ndi.binary_fill_holes(ndi.binary_closing(m, np.ones((27, 27)))) & env | m
m = ndi.binary_closing(m, np.ones((9, 9)))
m = ndi.binary_fill_holes(m)
m = ndi.binary_opening(m, np.ones((7, 7)))
lab, n = ndi.label(m)
sizes = ndi.sum(m, lab, range(1, n + 1))
m = lab == (1 + int(np.argmax(sizes)))
# suavizar el borde dentado
sm = np.asarray(Image.fromarray((m * 255).astype(np.uint8))
                .filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(3.5)))
m = sm > 128
np.save('shirt_mask.npy', m)
ys, xs = np.nonzero(m); print('bbox x', xs.min(), xs.max(), 'y', ys.min(), ys.max(), 'px', m.sum())

vis = a.copy(); vis[m] = vis[m] * 0.35 + np.array([255, 0, 0]) * 0.65
Image.fromarray(vis.astype(np.uint8)).crop((600, 1050, 1400, 1560)).save('seg.png')
