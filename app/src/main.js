// Vice Coast Cover Studio — editor wiring.
// Loads the sample photos, binds every control to the cover state, keeps an
// undo/redo history, and exports the cover at all four post sizes at once.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import {
  LAYOUTS, GRADES, TITLE_STYLES, SAMPLE_PHOTOS,
  defaultState, panelCount, layoutPanels, drawCoverArt,
} from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const thumbsEl = document.getElementById('thumbs');
const panelLabel = document.getElementById('panelLabel');

const EXPORT_SIZES = [
  { id: 'square', label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
  { id: 'story', label: 'Story 1080 x 1920', w: 1080, h: 1920 },
];

let photos = []; // [{ name, img }]
let state = defaultState();
let history = [];
let future = [];
let lastPanels = null;
let previewSize = EXPORT_SIZES[0];

function setStatus(text) {
  statusEl.textContent = text;
}

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${url}`));
    img.src = url;
  });
}

function snapshot() {
  return JSON.stringify(state);
}

function pushHistory() {
  const snap = snapshot();
  if (history.length && history[history.length - 1] === snap) return;
  history.push(snap);
  if (history.length > 60) history.shift();
  future = [];
  updateUndoButtons();
}

function undo() {
  if (!history.length) return;
  future.push(snapshot());
  state = JSON.parse(history.pop());
  syncControls();
  redraw();
  updateUndoButtons();
  setStatus('Undid the last change.');
}

function redo() {
  if (!future.length) return;
  history.push(snapshot());
  state = JSON.parse(future.pop());
  syncControls();
  redraw();
  updateUndoButtons();
  setStatus('Redid the change.');
}

function updateUndoButtons() {
  document.getElementById('undo').disabled = history.length === 0;
  document.getElementById('redo').disabled = future.length === 0;
}

function redraw() {
  lastPanels = drawCoverArt(canvas, photos.map((p) => p.img), state);
  drawSelection();
  panelLabel.textContent = `Panel ${state.selected + 1} of ${panelCount(state.layout)}`;
}

function drawSelection() {
  if (!lastPanels || document.body.classList.contains('shot-cover')) return;
  const ctx = canvas.getContext('2d');
  const rect = lastPanels.panels[state.selected];
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = '#ff2d95';
  ctx.lineWidth = Math.max(4, canvas.width * 0.006);
  ctx.setLineDash([18, 10]);
  ctx.strokeRect(rect.x * canvas.width, rect.y * canvas.height, rect.w * canvas.width, rect.h * canvas.height);
  ctx.restore();
}

function applyPreviewSize() {
  canvas.width = previewSize.w;
  canvas.height = previewSize.h;
  redraw();
}

function buildPicker(el, items, current, onPick) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (item.id === current ? ' active' : '');
    b.setAttribute('aria-pressed', String(item.id === current));
    b.textContent = item.label;
    b.dataset.id = item.id;
    b.addEventListener('click', () => {
      pushHistory();
      onPick(item.id);
      buildPicker(el, items, item.id, onPick);
      redraw();
    });
    el.appendChild(b);
  }
}

function syncPickers() {
  buildPicker(document.getElementById('layoutPicker'), LAYOUTS, state.layout, (id) => {
    state.layout = id;
    state.selected = 0;
  });
  buildPicker(document.getElementById('gradePicker'), GRADES, state.grade, (id) => { state.grade = id; });
  buildPicker(document.getElementById('titleStylePicker'), TITLE_STYLES, state.titleStyle, (id) => { state.titleStyle = id; });
}

function syncControls() {
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('badge').value = state.badge;
  document.getElementById('zoom').value = String(panel().zoom);
  document.getElementById('panX').value = String(panel().ox);
  document.getElementById('panY').value = String(panel().oy);
  document.getElementById('flip').checked = panel().flip;
  for (const key of ['frame', 'grain', 'vignette', 'halftone', 'sun']) {
    document.getElementById(key).checked = state[key];
  }
  syncPickers();
  syncThumbs();
}

function panel() {
  return state.panels[state.selected] || state.panels[0];
}

function syncThumbs() {
  thumbsEl.innerHTML = '';
  photos.forEach((photo, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb' + (panel().photo === i ? ' active' : '');
    b.title = photo.name;
    const img = document.createElement('img');
    img.src = photo.img.src;
    img.alt = photo.name;
    b.appendChild(img);
    const cap = document.createElement('span');
    cap.textContent = photo.name;
    b.appendChild(cap);
    b.addEventListener('click', () => {
      pushHistory();
      panel().photo = i;
      redraw();
      syncThumbs();
      setStatus(`Panel ${state.selected + 1} now uses “${photo.name}”.`);
    });
    thumbsEl.appendChild(b);
  });
}

async function loadSamples() {
  const loaded = [];
  for (const sample of SAMPLE_PHOTOS) {
    try {
      const img = await loadImage(`samples/${sample.file}`);
      loaded.push({ name: sample.name, img });
    } catch {
      setStatus(`Sample ${sample.file} failed to load.`);
    }
  }
  photos = loaded;
  syncThumbs();
}

function downloadCanvas(off, filename) {
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve();
    }, 'image/png');
  });
}

function renderSize(size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCoverArt(off, photos.map((p) => p.img), state);
  return off;
}

async function exportAllSizes() {
  setStatus('Exporting 4 sizes…');
  for (const size of EXPORT_SIZES) {
    await downloadCanvas(renderSize(size), `vice-coast-${size.id}-${size.w}x${size.h}.png`);
  }
  setStatus('Saved 4 PNGs: square, portrait, wide and story.');
}

async function exportOneSize(size) {
  await downloadCanvas(renderSize(size), `vice-coast-${size.id}-${size.w}x${size.h}.png`);
  setStatus(`Saved vice-coast-${size.id}-${size.w}x${size.h}.png`);
}

function bindControls() {
  document.getElementById('photoUpload').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const img = await loadImage(URL.createObjectURL(file));
      photos.push({ name: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'Uploaded', img });
    }
    syncThumbs();
    redraw();
    setStatus(`${files.length} photo(s) added. Click a thumbnail to put it in the selected panel.`);
    e.target.value = '';
  });

  const titleInput = document.getElementById('title');
  titleInput.addEventListener('focus', pushHistory);
  titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
  const subInput = document.getElementById('subtitle');
  subInput.addEventListener('focus', pushHistory);
  subInput.addEventListener('input', () => { state.subtitle = subInput.value; redraw(); });
  const badgeInput = document.getElementById('badge');
  badgeInput.addEventListener('focus', pushHistory);
  badgeInput.addEventListener('input', () => { state.badge = badgeInput.value; redraw(); });

  for (const key of ['frame', 'grain', 'vignette', 'halftone', 'sun']) {
    const box = document.getElementById(key);
    box.addEventListener('pointerdown', pushHistory);
    box.addEventListener('change', (e) => {
      state[key] = e.target.checked;
      redraw();
    });
  }

  const zoom = document.getElementById('zoom');
  zoom.addEventListener('pointerdown', pushHistory);
  zoom.addEventListener('focus', pushHistory);
  zoom.addEventListener('input', () => { panel().zoom = Number(zoom.value); redraw(); });
  const panX = document.getElementById('panX');
  panX.addEventListener('pointerdown', pushHistory);
  panX.addEventListener('focus', pushHistory);
  panX.addEventListener('input', () => { panel().ox = Number(panX.value); redraw(); });
  const panY = document.getElementById('panY');
  panY.addEventListener('pointerdown', pushHistory);
  panY.addEventListener('focus', pushHistory);
  panY.addEventListener('input', () => { panel().oy = Number(panY.value); redraw(); });
  const flipBox = document.getElementById('flip');
  flipBox.addEventListener('pointerdown', pushHistory);
  flipBox.addEventListener('change', (e) => {
    panel().flip = e.target.checked;
    redraw();
  });
  document.getElementById('fillAll').addEventListener('click', () => {
    pushHistory();
    const p = panel();
    for (const other of state.panels) Object.assign(other, { photo: p.photo, zoom: p.zoom, ox: p.ox, oy: p.oy, flip: p.flip });
    redraw();
    setStatus('Every panel now uses the selected photo and crop.');
  });

  document.getElementById('prevPanel').addEventListener('click', () => {
    state.selected = (state.selected - 1 + panelCount(state.layout)) % panelCount(state.layout);
    syncControls();
    redraw();
  });
  document.getElementById('nextPanel').addEventListener('click', () => {
    state.selected = (state.selected + 1) % panelCount(state.layout);
    syncControls();
    redraw();
  });

  document.getElementById('previewSize').addEventListener('change', (e) => {
    previewSize = EXPORT_SIZES.find((s) => s.id === e.target.value) || EXPORT_SIZES[0];
    applyPreviewSize();
  });

  document.getElementById('exportAll').addEventListener('click', exportAllSizes);
  for (const size of EXPORT_SIZES) {
    document.getElementById(`export-${size.id}`).addEventListener('click', () => exportOneSize(size));
  }
  document.getElementById('undo').addEventListener('click', undo);
  document.getElementById('redo').addEventListener('click', redo);
  document.getElementById('shuffle').addEventListener('click', () => {
    pushHistory();
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    state.layout = pick(LAYOUTS).id;
    state.grade = pick(GRADES).id;
    state.titleStyle = pick(TITLE_STYLES).id;
    state.selected = 0;
    for (const p of state.panels) {
      p.photo = photos.length ? Math.floor(Math.random() * photos.length) : 0;
      p.zoom = 1 + Math.random() * 0.3;
      p.ox = (Math.random() * 2 - 1) * 0.5;
      p.oy = (Math.random() * 2 - 1) * 0.5;
      p.flip = Math.random() < 0.15;
    }
    syncControls();
    applyPreviewSize();
    setStatus('Shuffled into a fresh cover — caption kept, everything else new.');
  });
  document.getElementById('reset').addEventListener('click', () => {
    pushHistory();
    const keepPanels = state.panels;
    state = defaultState();
    state.panels = keepPanels;
    syncControls();
    applyPreviewSize();
    setStatus('Layout, grade and lettering reset.');
  });

  // Click a panel to select it; drag inside it to pan the photo.
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const { panels } = layoutPanels(state.layout, 1, 1);
    for (let i = panelCount(state.layout) - 1; i >= 0; i--) {
      const r = panels[i];
      if (fx >= r.x && fx <= r.x + r.w && fy >= r.y && fy <= r.y + r.h) {
        pushHistory();
        state.selected = i;
        drag = { x: fx, y: fy, ox: panel().ox, oy: panel().oy };
        canvas.setPointerCapture(e.pointerId);
        syncControls();
        redraw();
        break;
      }
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = canvas.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    panel().ox = Math.max(-1, Math.min(1, drag.ox + (fx - drag.x) * 2));
    panel().oy = Math.max(-1, Math.min(1, drag.oy + (fy - drag.y) * 2));
    redraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
}

// API the fixed screenshot scenes use.
export const shotApi = {
  async loadAllSamples() {
    await loadSamples();
    redraw();
  },
  applyPatch(patch) {
    Object.assign(state, patch);
    syncControls();
  },
  setCanvasSize(w, h) {
    canvas.width = w;
    canvas.height = h;
  },
  render() {
    redraw();
  },
  get state() { return state; },
  get photos() { return photos; },
};

async function init() {
  bindControls();
  syncControls();
  updateUndoButtons();
  await loadSamples();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    try {
      await document.fonts.load('40px Anton');
      await document.fonts.load('40px Pacifico');
    } catch { /* fall back to system fonts for the shot */ }
    await runShot(shot, new URLSearchParams(location.search), shotApi);
  } else {
    try {
      await document.fonts.ready;
    } catch { /* draw anyway */ }
    applyPreviewSize();
    setStatus('Pick a layout and a grade, then export all four sizes.');
  }
}

init();
