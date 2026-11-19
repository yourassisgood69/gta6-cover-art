# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/yourassisgood69/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/yourassisgood69/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Coast Cover Studio** — an offline web app that turns your photo and a caption into GTA 6-style multi-panel cover art, and exports it as PNGs to share.

Pick one of 7 layouts (nine-panel cover grid, hero + three, four-panel grid, full-bleed, tilted snapshots, triptych, story), drop a different photo — or the same photo with different crops — into each panel, and grade it with one of 6 sunset/neon colour grades. Titles are set in Anton with a sunset-gradient, solid, outline or neon-glow style, plus a Pacifico neon script subtitle and a badge ribbon. Film grain, vignette, a halftone title block, hand-drawn palm-sun vector art and a white poster frame finish the look. Drag any panel to reposition its photo, zoom and flip per panel, undo/redo anything, then export all four post sizes at once: 1080×1080, 1080×1350, 1920×1080 and 1080×1920.

Everything runs offline in the browser from static files — photos never leave your machine. The four sample photos were made with an image model for this entry. All lettering uses OFL fonts (Anton and Pacifico) shipped under `app/fonts/`. Original work only: no Rockstar logo, artwork or fonts.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — pick a layout and a grade, click a panel to crop its photo, type your title, and hit **Export all 4 sizes (PNG)**.

## Screenshots

- `screenshots/1-cover.jpg` — exported nine-panel cover, wide
- `screenshots/2-editor.jpg` — the editor with a photo loaded
- `screenshots/3-cover.jpg` — exported hero + three cover, portrait
- `screenshots/4-cover.jpg` — exported four-panel cover, square

<sub>Entered on [make.fun](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) — built for the make.fun GTA 6 Cover Art bounty.</sub>
