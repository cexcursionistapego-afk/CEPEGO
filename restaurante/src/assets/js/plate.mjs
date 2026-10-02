// Platos generativos. Cada plato del menú se dibuja como una composición vista
// desde arriba, determinista (mismo texto → mismo dibujo) y con los colores de
// sus ingredientes. Sirve de identidad visual mientras no haya fotografía y
// funciona igual en el build (Node) y en el navegador.

const PALETTE = {
  beet: '#7b2d2b', saffron: '#c99a2e', moss: '#56632f', ink: '#2a2723', cream: '#e2d3b6', clay: '#b4552f',
  sage: '#8e9c6c', cacao: '#5a3a2c', tomato: '#b83a26', sea: '#3e5a61', rose: '#cf9282', bone: '#ece2cf', citrus: '#d98b2b',
};

const INGREDIENTS = [
  [/gamba|prawn|langost/, ['tomato', 'rose', 'citrus']],
  [/remolacha|beet|cereza|cherry|higo|fig/, ['beet', 'rose', 'cacao']],
  [/azafran|saffron|arroz|rice/, ['saffron', 'cream', 'clay']],
  [/hinojo|fennel|albahaca|basil|eneldo|dill|manzana verde|green apple|hierba|herb/, ['moss', 'sage', 'bone']],
  [/chocolate|algarroba|carob|cafe|coffee/, ['cacao', 'ink', 'cream']],
  [/naranja|orange|citric|citrus|limon|lemon/, ['citrus', 'saffron', 'bone']],
  [/ostra|oyster|erizo|urchin|mar|sea/, ['sea', 'saffron', 'bone']],
  [/queso|cheese|leche|milk|mantequilla|butter|pan |bread|nata|cream/, ['cream', 'bone', 'saffron']],
  [/tomate|tomato|salmonete|mullet/, ['tomato', 'clay', 'saffron']],
  [/pichon|pigeon|caza|game|carne|beef/, ['beet', 'cacao', 'ink']],
  [/aceituna|olive|aceite|oil/, ['moss', 'ink', 'saffron']],
  [/alcachofa|artichoke|coliflor|cauliflower|verdura/, ['sage', 'cream', 'moss']],
  [/almendra|almond|avellana|hazelnut|nuez/, ['cream', 'cacao', 'bone']],
  [/dulce|petit|mignard/, ['cacao', 'rose', 'saffron']],
];

const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colorsFor(text, rnd) {
  const s = fold(text) + ' ';
  const picked = [];
  for (const [re, cols] of INGREDIENTS) if (re.test(s)) picked.push(...cols);
  const base = picked.length ? [...new Set(picked)] : ['clay', 'moss', 'cream'];
  const out = [];
  while (out.length < 3) out.push(PALETTE[base[Math.floor(rnd() * base.length)]] || PALETTE.clay);
  // El color principal tiene que destacar sobre la loza: si todo es claro
  // (pan, queso, leche), se añade un acento tostado.
  out.sort((a, b) => luminance(a) - luminance(b));
  if (luminance(out[0]) > 0.5) out[0] = [PALETTE.saffron, PALETTE.clay, PALETTE.cacao][Math.floor(rnd() * 3)];
  return [out[0], out[2], out[1]];
}

const f = (n) => Math.round(n * 10) / 10;

function closedCurve(p) {
  const n = p.length;
  let d = `M${f(p[0][0])},${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}

function blob(cx, cy, r, rnd, irregular = 0.35, n = 7) {
  const pts = [];
  const rot = rnd() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.35;
    const rr = r * (1 - irregular / 2 + rnd() * irregular);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return closedCurve(pts);
}

const polar = (a, r) => [100 + Math.cos(a) * r, 100 + Math.sin(a) * r];

function element(kind, x, y, color, rnd) {
  const rot = Math.round(rnd() * 180);
  switch (kind) {
    case 'quenelle':
      return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(7 + rnd() * 4)}" ry="${f(3.6 + rnd() * 1.6)}" transform="rotate(${rot} ${f(x)} ${f(y)})" fill="${color}"/>`;
    case 'sphere': {
      const r = 3.2 + rnd() * 3.6;
      return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${color}"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.3)}" r="${f(r * 0.28)}" fill="#fff" opacity=".35"/>`;
    }
    case 'leaf':
      return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(4.2 + rnd() * 2)}" ry="1.5" transform="rotate(${rot} ${f(x)} ${f(y)})" fill="${PALETTE.moss}"/>`;
    case 'shard':
      return `<path d="${blob(x, y, 4 + rnd() * 3, rnd, 0.9, 4)}" fill="${color}" opacity=".92"/>`;
    default:
      return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + rnd() * 1.6)}" fill="${color}"/>`;
  }
}

/**
 * SVG de un plato. `seed` suele ser el nombre del plato.
 * Opciones: { title, className, rim: true }
 */
export function plateSVG(seed, opts = {}) {
  const rnd = rng(hash(String(seed)));
  const [c1, c2, c3] = colorsFor(seed, rnd);
  const picked = Math.floor(rnd() * 4);
  const type = opts.type ?? picked;
  const parts = [];

  if (type === 0) {
    // Trazo de salsa en arco con elementos a lo largo
    const a0 = rnd() * Math.PI * 2;
    const span = 1.6 + rnd() * 1.4;
    const r = 34 + rnd() * 12;
    const [x0, y0] = polar(a0, r), [x1, y1] = polar(a0 + span, r);
    parts.push(`<path d="M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 0 1 ${f(x1)},${f(y1)}" stroke="${c1}" stroke-width="${f(8 + rnd() * 6)}" stroke-linecap="round" fill="none" opacity=".88"/>`);
    parts.push(`<path d="M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 0 1 ${f(x1)},${f(y1)}" stroke="${c3}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".7" transform="translate(${f(rnd() * 4 - 2)} ${f(rnd() * 4 - 2)})"/>`);
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const [x, y] = polar(a0 + (span * (i + 0.5)) / n, r + (rnd() - 0.5) * 6);
      parts.push(element(['quenelle', 'sphere', 'shard', 'leaf'][Math.floor(rnd() * 4)], x, y, i % 2 ? c2 : c3, rnd));
    }
  } else if (type === 1) {
    // Pieza central con gotas concéntricas
    const cx = 100 + (rnd() - 0.5) * 10, cy = 100 + (rnd() - 0.5) * 10;
    parts.push(`<path d="${blob(cx, cy, 20 + rnd() * 8, rnd, 0.3, 8)}" fill="${c1}"/>`);
    parts.push(`<path d="${blob(cx + 3, cy - 2, 9 + rnd() * 5, rnd, 0.4, 6)}" fill="${c2}" opacity=".9"/>`);
    const n = 5 + Math.floor(rnd() * 5);
    const ring = 38 + rnd() * 10;
    const a0 = rnd() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const [x, y] = polar(a0 + (i / n) * Math.PI * 2, ring);
      parts.push(element(i % 3 === 0 ? 'leaf' : 'dot', x, y, i % 2 ? c3 : c2, rnd));
    }
  } else if (type === 2) {
    // Media luna de piezas pequeñas
    const a0 = rnd() * Math.PI * 2;
    const n = 6 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / (n - 1)) * Math.PI * 1.1;
      const [x, y] = polar(a, 30 + Math.sin((i / (n - 1)) * Math.PI) * 14);
      const kind = i % 3 === 0 ? 'shard' : i % 3 === 1 ? 'sphere' : 'quenelle';
      parts.push(element(kind, x, y, [c1, c2, c3][i % 3], rnd));
    }
    const [lx, ly] = polar(a0 + Math.PI * 1.45, 26);
    parts.push(`<path d="M${f(lx - 14)},${f(ly)}q14,-10 28,0" stroke="${c3}" stroke-width=".9" fill="none" opacity=".8"/>`);
  } else {
    // Charco de salsa desplazado y un elemento encima
    const [px, py] = polar(rnd() * Math.PI * 2, 10 + rnd() * 10);
    parts.push(`<path d="${blob(px, py, 30 + rnd() * 10, rnd, 0.22, 9)}" fill="${c1}" opacity=".85"/>`);
    parts.push(`<path d="${blob(px, py, 13 + rnd() * 5, rnd, 0.3, 7)}" fill="${c2}"/>`);
    for (let i = 0; i < 6; i++) {
      const [x, y] = [px + (rnd() - 0.5) * 50, py + (rnd() - 0.5) * 50];
      const d = Math.hypot(x - 100, y - 100);
      if (d < 62) parts.push(element(i % 2 ? 'dot' : 'leaf', x, y, c3, rnd));
    }
  }

  const title = opts.title ? `<title>${String(opts.title).replace(/[<&>]/g, '')}</title>` : '';
  const aria = opts.title ? 'role="img"' : 'aria-hidden="true" focusable="false"';
  const rim = opts.rim === false ? '' : `<circle cx="100" cy="100" r="72" fill="none" stroke="var(--plate-line)" stroke-width=".5"/>`;
  return `<svg class="plate ${opts.className || ''}" viewBox="0 0 200 200" ${aria}>${title}<circle class="plate-disc" cx="100" cy="100" r="97" fill="var(--plate)" stroke="var(--plate-line)" stroke-width=".6"/>${rim}<g class="plate-food" transform="translate(100 100) scale(1.14) translate(-100 -100)">${parts.join('')}</g></svg>`;
}

/**
 * Planta de la sala dibujada a línea: 24 plazas (barra del chef de 8,
 * tres mesas de 4 y dos de 2). Ilustración para eventos y filosofía.
 */
export function floorPlanSVG(opts = {}) {
  const seat = (x, y) => `<circle cx="${x}" cy="${y}" r="5" class="fp-seat"/>`;
  const round = (x, y) => `<circle cx="${x}" cy="${y}" r="17" class="fp-table"/>` + [[0, -27], [27, 0], [0, 27], [-27, 0]].map(([dx, dy]) => seat(x + dx, y + dy)).join('');
  const two = (x, y) => `<rect x="${x - 12}" y="${y - 12}" width="24" height="24" class="fp-table"/>` + seat(x - 22, y) + seat(x + 22, y);
  const counter = Array.from({ length: 8 }, (_, i) => seat(108 + i * 28, 88)).join('');
  return `<svg class="floorplan ${opts.className || ''}" viewBox="0 0 440 320" role="img" aria-label="${opts.label || 'Planta de la sala'}">
  <rect x="20" y="20" width="400" height="280" class="fp-wall"/>
  <path d="M20 120 V220" class="fp-window"/>
  <rect x="96" y="34" width="236" height="34" class="fp-kitchen"/>
  <rect x="96" y="68" width="236" height="8" class="fp-table"/>
  ${counter}
  ${round(110, 170)}${round(220, 210)}${round(330, 170)}
  ${two(120, 262)}${two(320, 262)}
  <path d="M380 300 a40 40 0 0 1 40 -40" class="fp-door"/>
  <text x="214" y="56" class="fp-label">${opts.kitchen || 'cocina'}</text>
</svg>`;
}
