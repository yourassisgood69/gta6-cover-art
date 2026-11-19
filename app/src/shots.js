// Fixed scenes for screenshots. `?shot=cover` shows an exported cover alone,
// `?shot=portrait` and `?shot=square` the same at other post sizes, and
// `?shot=editor` shows the editor with a photo loaded. Each scene loads the
// four sample photos, applies its own layout, grade and caption, paints once,
// then sets window.__shotReady once the paint has landed (double rAF).
import { defaultPanels } from './cover.js';

// `frames` holds one [ox, oy] crop offset per entry of `order`, measured so
// the crop window centres on the photo's face (see the framing table in the
// build notes): a wide panel on a portrait photo otherwise cuts faces off.
function panelsFor(order, zooms, frames) {
  const panels = defaultPanels();
  for (let i = 0; i < panels.length; i++) {
    const k = i % order.length;
    panels[i].photo = order[k];
    panels[i].zoom = zooms ? zooms[k] : 1;
    const f = frames ? frames[k] : null;
    panels[i].ox = f ? f[0] : 0;
    panels[i].oy = f ? f[1] : 0;
    panels[i].flip = false;
  }
  return panels;
}

const SCENES = {
  cover: {
    coverOnly: true,
    size: [1920, 1080],
    patch: {
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
      panels: panelsFor([0, 1, 2, 3], [1.15, 1.1, 1.2, 1.05],
        [[0.16, 0.82], [0.11, 1.0], [-0.07, 0.7], [-0.06, 1.0]]),
    },
  },
  portrait: {
    coverOnly: true,
    size: [1080, 1350],
    patch: {
      layout: 'hero-three',
      grade: 'vice-pink',
      title: 'NIGHT SHIFT',
      subtitle: 'neon after dark',
      badge: 'VICE COAST',
      titleStyle: 'neon',
      frame: true,
      grain: true,
      vignette: true,
      halftone: true,
      sun: true,
      selected: 0,
      panels: panelsFor([2, 0, 1, 3], [1.1, 1.15, 1.1, 1.2],
        [[-0.15, 0.12], [0.3, 0.18], [0.11, 0.59], [-0.12, 0.85]]),
    },
  },
  square: {
    coverOnly: true,
    size: [1080, 1080],
    patch: {
      layout: 'four',
      grade: 'golden-hour',
      title: 'PIER DAYS',
      subtitle: 'salt air & slow mornings',
      badge: 'VICE COAST',
      titleStyle: 'gradient',
      frame: true,
      grain: true,
      vignette: true,
      halftone: true,
      sun: true,
      selected: 0,
      panels: panelsFor([3, 0, 1, 2], [1.1, 1.15, 1.05, 1.2],
        [[-0.11, 0.9], [0.26, 0.18], [0.07, 0.64], [-0.08, 0.23]]),
    },
  },
  editor: {
    coverOnly: false,
    size: null,
    patch: {
      layout: 'hero-three',
      grade: 'sunset',
      title: 'BOULEVARD QUEEN',
      subtitle: 'a vice coast story',
      badge: 'VICE COAST',
      titleStyle: 'gradient',
      frame: true,
      grain: true,
      vignette: true,
      halftone: true,
      sun: true,
      selected: 0,
      panels: panelsFor([0, 2, 1, 3], [1.15, 1.1, 1.2, 1.05],
        [[0.42, 0.17], [-0.07, 0.13], [0.12, 0.8], [-0.07, 0.94]]),
    },
  },
};

export async function runShot(shot, query, api) {
  const scene = SCENES[shot] || SCENES.cover;
  if (scene.coverOnly) document.body.classList.add('shot-cover');
  await api.loadAllSamples();
  api.applyPatch(scene.patch);
  if (scene.size) api.setCanvasSize(scene.size[0], scene.size[1]);
  api.render();
  try {
    await document.fonts.load('40px Anton');
    await document.fonts.load('40px Pacifico');
    await document.fonts.ready;
  } catch { /* draw with whatever fonts arrived */ }
  api.render();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
