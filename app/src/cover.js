// Vice Coast Cover Studio — cover render engine.
// Draws GTA-style multi-panel cover art on any 2D canvas: panel layouts,
// per-panel photo crops, sunset/neon colour grades, Anton + Pacifico
// lettering, halftone title block, palm-sun vector art, grain and vignette.
// Everything here is drawn from scratch with canvas shapes; no external art.

export const LAYOUTS = [
  { id: 'nine', label: 'Nine Panel', panels: 9 },
  { id: 'hero-three', label: 'Hero + Three', panels: 4 },
  { id: 'four', label: 'Four Panel', panels: 4 },
  { id: 'fullbleed', label: 'Full Bleed', panels: 1 },
  { id: 'tilted', label: 'Tilted Snapshots', panels: 4 },
  { id: 'triptych', label: 'Triptych', panels: 3 },
  { id: 'story', label: 'Story', panels: 1 },
];

export const GRADES = [
  { id: 'sunset', label: 'Sunset' },
  { id: 'neon-night', label: 'Neon Night' },
  { id: 'vice-pink', label: 'Vice Pink' },
  { id: 'teal-noir', label: 'Teal Noir' },
  { id: 'golden-hour', label: 'Golden Hour' },
  { id: 'mono-noir', label: 'Mono Noir' },
];

export const TITLE_STYLES = [
  { id: 'gradient', label: 'Sunset Gradient' },
  { id: 'solid', label: 'Solid White' },
  { id: 'outline', label: 'Outline' },
  { id: 'neon', label: 'Neon Glow' },
];

export const SAMPLE_PHOTOS = [
  { file: 'woman-car.jpg', name: 'Boulevard' },
  { file: 'man-rooftop.jpg', name: 'Rooftop' },
  { file: 'friends-neon.jpg', name: 'Neon Night' },
  { file: 'man-pier.jpg', name: 'Pier Days' },
];

export function defaultPanels() {
  return Array.from({ length: 9 }, (_, i) => ({
    photo: i % SAMPLE_PHOTOS.length,
    zoom: 1,
    ox: 0,
    oy: 0,
    flip: false,
  }));
}

export function defaultState() {
  return {
    layout: 'nine',
    grade: 'sunset',
    title: 'NEON SHORE',
    subtitle: 'a vice coast story',
    badge: 'VICE COAST',
    titleStyle: 'gradient',
    frame: true,
    grain: true,
    vignette: true,
    halftone: true,
    sun: true,
    selected: 0,
    panels: defaultPanels(),
  };
}

export function panelCount(layout) {
  const found = LAYOUTS.find((l) => l.id === layout);
  return found ? found.panels : 9;
}

// Panel rectangles as fractions of the canvas (x, y, w, h, rotation deg).
// The title band sits across the bottom for most layouts.
export function layoutPanels(layout, W, H) {
  const g = 0.008; // gutter fraction
  const band = 0.24; // bottom title band height fraction
  switch (layout) {
    case 'nine': {
      const out = [];
      const cw = (1 - g * 4) / 3;
      const ch = (1 - band - g * 4) / 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          out.push({ x: g + c * (cw + g), y: g + r * (ch + g), w: cw, h: ch, rot: 0 });
        }
      }
      return { panels: out, title: { x: 0.03, y: 1 - band + 0.02, w: 0.94, h: band - 0.04, align: 'center' } };
    }
    case 'hero-three': {
      const out = [
        { x: g, y: g, w: 0.64 - g * 1.5, h: 1 - band - g * 2, rot: 0 },
      ];
      const rw = 1 - 0.64 - g;
      const rh = (1 - band - g * 4) / 3;
      for (let r = 0; r < 3; r++) {
        out.push({ x: 0.64, y: g + r * (rh + g), w: rw, h: rh, rot: 0 });
      }
      return { panels: out, title: { x: 0.03, y: 1 - band + 0.02, w: 0.94, h: band - 0.04, align: 'left' } };
    }
    case 'four': {
      const out = [];
      const cw = (1 - g * 3) / 2;
      const ch = (1 - band - g * 3) / 2;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          out.push({ x: g + c * (cw + g), y: g + r * (ch + g), w: cw, h: ch, rot: 0 });
        }
      }
      return { panels: out, title: { x: 0.03, y: 1 - band + 0.02, w: 0.94, h: band - 0.04, align: 'center' } };
    }
    case 'fullbleed':
      return {
        panels: [{ x: 0, y: 0, w: 1, h: 1, rot: 0 }],
        title: { x: 0.04, y: 0.68, w: 0.92, h: 0.28, align: 'left' },
      };
    case 'tilted': {
      return {
        panels: [
          { x: 0, y: 0, w: 1, h: 1, rot: 0, backdrop: true },
          { x: 0.06, y: 0.05, w: 0.42, h: 0.52, rot: -6 },
          { x: 0.5, y: 0.1, w: 0.42, h: 0.52, rot: 5 },
          { x: 0.28, y: 0.34, w: 0.44, h: 0.5, rot: -2 },
        ],
        title: { x: 0.04, y: 0.8, w: 0.92, h: 0.17, align: 'center' },
      };
    }
    case 'triptych': {
      const out = [];
      const cw = (1 - g * 4) / 3;
      for (let c = 0; c < 3; c++) {
        out.push({ x: g + c * (cw + g), y: g, w: cw, h: 1 - band - g * 2, rot: 0 });
      }
      return { panels: out, title: { x: 0.03, y: 1 - band + 0.02, w: 0.94, h: band - 0.04, align: 'center' } };
    }
    case 'story':
    default:
      return {
        panels: [{ x: 0, y: 0, w: 1, h: 1, rot: 0 }],
        title: { x: 0.05, y: 0.06, w: 0.9, h: 0.3, align: 'center' },
      };
  }
}

function drawPhotoInto(ctx, img, rect, panel, W, H) {
  const px = rect.x * W;
  const py = rect.y * H;
  const pw = rect.w * W;
  const ph = rect.h * H;
  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2);
  if (rect.rot) ctx.rotate((rect.rot * Math.PI) / 180);
  ctx.translate(-pw / 2, -ph / 2);
  // White poster gutter around the photo inside its cell.
  ctx.fillStyle = '#fdf8f0';
  ctx.fillRect(0, 0, pw, ph);
  const inset = Math.max(2, Math.min(pw, ph) * 0.012);
  const iw = pw - inset * 2;
  const ih = ph - inset * 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(inset, inset, iw, ih);
  ctx.clip();
  if (img) {
    const base = Math.max(iw / img.naturalWidth, ih / img.naturalHeight);
    const scale = base * (panel.zoom || 1);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = inset + (iw - dw) / 2 + (panel.ox || 0) * iw * 0.5;
    const dy = inset + (ih - dh) / 2 + (panel.oy || 0) * ih * 0.5;
    if (panel.flip) {
      ctx.translate(inset + iw / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(inset + iw / 2), 0);
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = '#3a2b4d';
    ctx.fillRect(inset, inset, iw, ih);
  }
  ctx.restore();
  ctx.restore();
}

const GRADE_LAYERS = {
  'sunset': [
    { kind: 'linear', from: [0, 0], to: [0, 1], stops: [[0, 'rgba(255,170,80,0.10)'], [0.55, 'rgba(255,120,60,0.05)'], [1, 'rgba(214,48,120,0.42)']], op: 'source-over' },
    { kind: 'linear', from: [0, 0], to: [1, 0], stops: [[0, 'rgba(255,90,120,0.14)'], [1, 'rgba(255,190,80,0.10)']], op: 'overlay' },
  ],
  'neon-night': [
    { kind: 'linear', from: [0, 0], to: [0, 1], stops: [[0, 'rgba(80,40,220,0.34)'], [0.5, 'rgba(160,30,180,0.16)'], [1, 'rgba(255,45,149,0.40)']], op: 'source-over' },
    { kind: 'linear', from: [0, 0], to: [1, 1], stops: [[0, 'rgba(0,220,255,0.20)'], [1, 'rgba(255,0,180,0.16)']], op: 'overlay' },
  ],
  'vice-pink': [
    { kind: 'linear', from: [0, 0], to: [0, 1], stops: [[0, 'rgba(255,120,200,0.22)'], [1, 'rgba(255,20,140,0.46)']], op: 'source-over' },
    { kind: 'linear', from: [0, 0], to: [1, 0], stops: [[0, 'rgba(255,80,160,0.20)'], [1, 'rgba(120,40,255,0.14)']], op: 'soft-light' },
  ],
  'teal-noir': [
    { kind: 'linear', from: [0, 0], to: [0, 1], stops: [[0, 'rgba(0,90,110,0.30)'], [1, 'rgba(0,30,50,0.42)']], op: 'source-over' },
    { kind: 'linear', from: [0, 0], to: [1, 0], stops: [[0, 'rgba(0,255,220,0.12)'], [1, 'rgba(0,60,90,0.20)']], op: 'overlay' },
  ],
  'golden-hour': [
    { kind: 'linear', from: [0, 0], to: [0, 1], stops: [[0, 'rgba(255,200,90,0.20)'], [0.6, 'rgba(255,150,50,0.10)'], [1, 'rgba(200,90,20,0.34)']], op: 'source-over' },
    { kind: 'solid', color: 'rgba(255,180,60,0.10)', op: 'overlay' },
  ],
  'mono-noir': [
    { kind: 'solid', color: 'rgba(128,128,128,1)', op: 'saturation' },
    { kind: 'linear', from: [0, 0], to: [0, 1], stops: [[0, 'rgba(255,255,255,0.10)'], [1, 'rgba(0,0,0,0.38)']], op: 'source-over' },
    { kind: 'linear', from: [0, 0], to: [1, 1], stops: [[0, 'rgba(255,255,255,0.08)'], [1, 'rgba(0,0,0,0.12)']], op: 'overlay' },
  ],
};

function applyGrade(ctx, grade, W, H) {
  const layers = GRADE_LAYERS[grade] || GRADE_LAYERS.sunset;
  for (const layer of layers) {
    ctx.save();
    ctx.globalCompositeOperation = layer.op;
    if (layer.kind === 'linear') {
      const grad = ctx.createLinearGradient(
        layer.from[0] * W, layer.from[1] * H, layer.to[0] * W, layer.to[1] * H,
      );
      for (const [stop, color] of layer.stops) grad.addColorStop(stop, color);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = layer.color;
    }
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

// Synthwave sun medallion: a gradient disc with horizontal slats cut through
// its lower half, and two small palm silhouettes standing inside the disc.
// Everything is clipped to the disc, so the art never paints over faces.
export function drawPalmSun(ctx, cx, cy, r, W, H) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sun.addColorStop(0, '#ffd166');
  sun.addColorStop(0.55, '#ff7b54');
  sun.addColorStop(1, '#ff2d95');
  ctx.fillStyle = sun;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // Slats: dark horizontal bands across the lower half, widening downward.
  ctx.fillStyle = '#160a24';
  let y = cy + r * 0.08;
  let h = r * 0.05;
  while (y < cy + r) {
    ctx.fillRect(cx - r, y, r * 2, h);
    y += h + r * 0.16;
    h *= 1.45;
  }

  // Palms inside the disc: a curving trunk and five fronds that arc upward
  // from the crown and droop at their tips.
  ctx.strokeStyle = '#1c0f2e';
  ctx.lineCap = 'round';
  const palm = (bx, by, s, lean) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(s, s);
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(lean * 14, -52, lean * 32, -96);
    ctx.stroke();
    const topX = lean * 32;
    const topY = -96;
    ctx.lineWidth = 5;
    for (let k = 0; k < 5; k++) {
      const a = (-168 + k * 39) * (Math.PI / 180);
      const len = 46 - Math.abs(k - 2) * 8;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(
        topX + dx * len * 0.55, topY + dy * len * 0.55 - len * 0.08,
        topX + dx * len, topY + dy * len * 0.55 + len * 0.42,
      );
      ctx.stroke();
    }
    ctx.restore();
  };
  palm(cx - r * 0.42, cy + r * 0.98, r / 110, -1);
  palm(cx + r * 0.42, cy + r * 0.98, r / 118, 1);
  ctx.restore();
}

let grainTile = null;
export function grainPattern(ctx) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = 140;
    grainTile.height = 140;
    const g = grainTile.getContext('2d');
    const data = g.createImageData(140, 140);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data.data[i] = v;
      data.data[i + 1] = v;
      data.data[i + 2] = v;
      data.data[i + 3] = 255;
    }
    g.putImageData(data, 0, 0);
  }
  return ctx.createPattern(grainTile, 'repeat');
}

function drawHalftone(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,45,149,0.20)';
  const step = Math.max(10, w / 46);
  for (let yy = y + step / 2; yy < y + h; yy += step) {
    for (let xx = x + step / 2; xx < x + w; xx += step) {
      const row = Math.floor((yy - y) / step);
      const off = row % 2 ? step / 2 : 0;
      ctx.beginPath();
      ctx.arc(xx + off, yy, step * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startSize, family, weight) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawTitleBlock(ctx, state, zone, W, H) {
  const x = zone.x * W;
  const y = zone.y * H;
  const w = zone.w * W;
  const h = zone.h * H;
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const badge = (state.badge || '').trim().toUpperCase();

  // Dark band so lettering stays readable over any photo.
  ctx.save();
  const bandGrad = ctx.createLinearGradient(0, y, 0, y + h);
  bandGrad.addColorStop(0, 'rgba(12,4,24,0)');
  bandGrad.addColorStop(0.35, 'rgba(12,4,24,0.72)');
  bandGrad.addColorStop(1, 'rgba(12,4,24,0.88)');
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, y - h * 0.12, W, h + h * 0.12);
  if (state.halftone) drawHalftone(ctx, x, y, w, h * 0.9);
  ctx.restore();

  ctx.save();
  ctx.textAlign = zone.align === 'left' ? 'left' : 'center';
  const tx = zone.align === 'left' ? x : x + w / 2;
  const baseline = y + h * 0.62;

  if (title) {
    const size = fitFont(ctx, title, w * 0.98, h * 0.52, 'Anton, sans-serif', '');
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.textBaseline = 'alphabetic';
    if (state.titleStyle === 'gradient') {
      const grad = ctx.createLinearGradient(0, baseline - size, 0, baseline);
      grad.addColorStop(0, '#ffe259');
      grad.addColorStop(0.5, '#ff7b54');
      grad.addColorStop(1, '#ff2d95');
      ctx.fillStyle = grad;
      ctx.lineWidth = Math.max(2, size * 0.06);
      ctx.strokeStyle = 'rgba(20,4,32,0.9)';
      ctx.strokeText(title, tx, baseline);
      ctx.fillText(title, tx, baseline);
    } else if (state.titleStyle === 'outline') {
      ctx.lineWidth = Math.max(2, size * 0.07);
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeText(title, tx, baseline);
      ctx.fillText(title, tx, baseline);
    } else if (state.titleStyle === 'neon') {
      ctx.fillStyle = '#ff5db1';
      ctx.shadowColor = '#ff2d95';
      ctx.shadowBlur = size * 0.45;
      ctx.fillText(title, tx, baseline);
      ctx.shadowBlur = size * 0.14;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, tx, baseline);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = size * 0.12;
      ctx.shadowOffsetY = size * 0.04;
      ctx.fillText(title, tx, baseline);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  if (subtitle) {
    const subSize = fitFont(ctx, subtitle, w * 0.9, h * 0.2, 'Pacifico, cursive', '');
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = 'rgba(255,45,149,0.8)';
    ctx.shadowBlur = subSize * 0.35;
    ctx.fillText(subtitle, tx, baseline + h * 0.3);
    ctx.shadowBlur = 0;
  }

  if (badge) {
    const bSize = Math.max(12, h * 0.13);
    ctx.font = `${bSize}px Anton, sans-serif`;
    const pad = bSize * 0.9;
    const bw = ctx.measureText(badge).width + pad * 2;
    const bx = W - bw - W * 0.03;
    const by = H * 0.03;
    ctx.save();
    ctx.translate(bx + bw / 2, by + bSize);
    ctx.rotate(-0.03);
    ctx.fillStyle = '#ff2d95';
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bSize * 0.85, bw, bSize * 1.7, bSize * 0.35);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, 0, bSize * 0.08);
    ctx.restore();
  }
  ctx.restore();
}

// Main entry: paint the whole cover for `state` onto `canvas` at its own size.
export function drawCoverArt(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, W, H);

  const { panels, title } = layoutPanels(state.layout, W, H);
  const count = panelCount(state.layout);
  for (let i = 0; i < count; i++) {
    const rect = panels[i];
    const panel = state.panels[i] || { photo: 0, zoom: 1, ox: 0, oy: 0, flip: false };
    const img = photos[panel.photo] || null;
    if (rect.backdrop) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      drawPhotoInto(ctx, img, rect, panel, W, H);
      ctx.restore();
      ctx.fillStyle = 'rgba(22,10,36,0.45)';
      ctx.fillRect(0, 0, W, H);
    } else {
      drawPhotoInto(ctx, img, rect, panel, W, H);
    }
  }

  applyGrade(ctx, state.grade, W, H);

  if (state.sun) {
    const r = Math.min(W, H) * 0.1;
    drawPalmSun(ctx, W - r * 1.2, H * 0.15, r, W, H);
  }

  drawTitleBlock(ctx, state, title, W, H);

  if (state.vignette) {
    const vg = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.42,
      W / 2, H / 2, Math.max(W, H) * 0.72,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  if (state.frame) {
    ctx.save();
    ctx.strokeStyle = '#fdf8f0';
    ctx.lineWidth = Math.max(6, Math.min(W, H) * 0.012);
    ctx.strokeRect(
      ctx.lineWidth / 2, ctx.lineWidth / 2,
      W - ctx.lineWidth, H - ctx.lineWidth,
    );
    ctx.restore();
  }

  return { panels, title };
}
