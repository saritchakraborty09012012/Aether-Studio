# Aether — Immersive Entertainment Studio Website

A scroll-driven, real-time 3D portfolio site for a fictional Unreal Engine creative studio, **Aether**. Built with React 19, TypeScript, Three.js (via React Three Fiber), Tailwind CSS 4 and GSAP, with Lenis smooth scrolling and a choreographed WebGL background scene that reacts to scroll position and pointer movement.

**Stack:** React 19 · TypeScript 6 · Vite 8 (Rolldown) · Three.js · @react-three/fiber · @react-three/drei · @react-three/postprocessing · Tailwind CSS 4 · GSAP · Lenis

---

## Table of Contents

- [Demo & Preview](#demo--preview)
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [How the Site Is Built](#how-the-site-is-built)
- [The 3D Scene](#the-3d-scene)
- [Content & Copywriting](#content--copywriting)
- [Performance & Code Splitting](#performance--code-splitting)
- [Visual QA Scripts](#visual-qa-scripts)
- [Deployment (Vercel)](#deployment-vercel)
- [Troubleshooting](#troubleshooting)

---

## Demo & Preview

```bash
cd website
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build      # tsc -b && vite build  → website/dist
npm run preview    # serve the production build locally
```

---

## Getting Started

**Requirements:** Node.js 20+ (22 LTS recommended), npm 10+, Google Chrome (only for the optional visual QA scripts).

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check with `tsc -b`, then build the production bundle |
| `npm run preview` | Serve `website/dist` locally |
| `npm run lint` | Lint with Oxlint |

All commands run from the `website/` directory.

---

## Repository Structure

```
.
├── analysis/                  # Design research & visual QA artefacts
│   ├── frames/                #   extracted frames of the reference walkthrough
│   ├── contact_sheets/        #   contact sheets built from those frames
│   ├── website_shots/         #   full-page screenshots of this site (desktop)
│   └── mobile_shots/          #   phone/tablet screenshots
├── assets/
│   ├── blender/               # Source Blender assets (GLB models + generator scripts)
│   └── stock_candidates*/     # Candidate stock imagery reviewed during art direction
└── website/                   # The actual web application (Vite root)
    ├── public/
    │   ├── images/            #   project stills served from /images
    │   ├── models/            #   GLB models served from /models
    │   ├── favicon.svg
    │   └── icons.svg
    ├── scripts/               # Puppeteer visual QA + screenshot tooling
    ├── src/
    │   ├── components/        #   One component per page chapter
    │   ├── data/content.ts    #   Single source of truth for all site copy
    │   ├── lib/scrollState.ts #   Shared scroll/pointer state (read by DOM + WebGL)
    │   ├── App.tsx            #   Page composition + Lenis + theme detection
    │   └── index.css          #   Tailwind entry + design tokens
    ├── vite.config.ts         #   Build, chunking and plugin configuration
    └── dist/                  #   Build output (git-ignored)
```

---

## How the Site Is Built

### Page chapters

`App.tsx` composes the page from one component per chapter, in order:

| Component | Chapter |
| --- | --- |
| `Loader` | Four-stage intro: converging white triangle → sliding grid lines → wireframe triangle with glowing orb → flash reveal |
| `Nav` / `Hud` | Fixed navigation (auto light/dark against the section under it) and a right-side technical HUD with rotating reticle |
| `Hero` | Giant AETHER wordmark whose letters breathe apart as you scroll |
| `Works` | Cylindrical horizontal gallery — cards sit on an invisible drum that rotates with scroll |
| `About` | Studio statement with grid/rail decoration |
| `Services` | Capability grid |
| `Featured` / `Stella` | Featured work grid and the fullscreen `stellla` dream chapter |
| `Footer` | Contact, sitemap, language switch and the visible `SAMPLE` watermark |
| `Scene3D` | The persistent WebGL background, rendered behind all content |

### Scroll architecture

- **Lenis** drives smooth scrolling; its RAF loop lives in `App.tsx`.
- Every frame, `App.tsx` writes `scrollState` (global progress, per-chapter weights, pointer position, theme) in `src/lib/scrollState.ts`.
- Both the DOM (GSAP/scroll handlers) and the WebGL scene read from that single object, so CSS animation and 3D animation always stay in sync without re-rendering React.
- The nav watches which `data-theme="light|dark"` section sits under the top bar and flips its palette accordingly.

---

## The 3D Scene

`src/components/Scene3D.tsx` renders a fixed full-viewport canvas that sits behind the whole page:

- **`TileRoom`** — an instanced LED-style digital tile room that fades away for light chapters
- **`Shards`** — a spherical glass-shard blast (fibonacci sphere) built from `alche_shards.glb`
- **`LogoTriangle`** — the studio's triangular A from `alche_logo.glb`
- **`IriRing`** — an iridescent ring from `alche_ring.glb`
- **`Rig`** — camera choreography driven by scroll (dolly back through hero, push into Works, rise for About, settle for Featured)
- **Post-processing** — bloom, chromatic aberration and vignette via `@react-three/postprocessing`
- **Adaptive quality** — phones get lower DPR, no antialiasing and a wider FOV for battery/thermals

Models are preloaded with `useGLTF.preload(...)` at module scope so the intro and the scene share one download.

---

## Content & Copywriting

All site copy lives in **`website/src/data/content.ts`** — projects, news, About/Vision statements and tags. Nothing is hard-coded in components, so edits never require touching layout code.

- The copy is written in **UK English** (e.g. `programme`, `colour`) and the document is declared `lang="en-GB"`.
- The footer carries a visible `SAMPLE` watermark (`Footer.tsx`) to mark the work as a sample/preview build.
- Imagery is free-licence stock (Unsplash) curated in `assets/stock_candidates*/`; the selected stills are served from `website/public/images/`.

---

## Performance & Code Splitting

The build (Vite 8 / Rolldown) splits the app so the initial paint downloads very little:

| Chunk | Contents | Size (gzip) |
| --- | --- | --- |
| `index` | App shell: React, GSAP, Lenis, components | ~13 kB |
| `Scene3D` | Lazy-loaded scene entry | ~3 kB |
| `scene-core` | Three.js + React Three Fiber | ~248 kB |
| `scene-drei` | drei helpers (GLTF, Environment, Lightformer) | ~40 kB |
| `scene-fx` | postprocessing (bloom, chromatic aberration, vignette) | ~23 kB |
| `vendor` | Shared vendor libraries | ~70 kB |

Key points:

- **`Scene3D` is `React.lazy`-loaded** (`App.tsx`), so Three.js never blocks the first paint — the page renders and the loader plays while the scene downloads.
- **`build.rolldownOptions.output.codeSplitting.groups`** (`vite.config.ts`) separates Three.js, drei and postprocessing into independently cacheable chunks; repeat visits only re-download what changed.
- **`chunkSizeWarningLimit: 1000`** covers `scene-core` only: it is Three.js itself — two monolithic modules that cannot be split further. Every other chunk is far below the default 500 kB threshold.

---

## Visual QA Scripts

Headless Chrome tooling in `website/scripts/` (requires Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`, or edit the path):

| Script | Purpose |
| --- | --- |
| `qa.mjs` | Loads the site, reports layout metrics, console errors, failed requests, fonts, images and section offsets |
| `shots.mjs` | Captures a full set of desktop scroll screenshots |
| `shots-mobile.mjs` | Captures phone and tablet screenshots |

They expect a server on the URL configured at the top of each script (`http://localhost:5180/` by default) — start one first with `npm run dev -- --port 5180` or `npm run preview -- --port 5180`. Output is written outside the repository (temp directory).

---

## Deployment (Vercel)

- **Root directory:** `website`
- **Framework preset:** Vite
- **Build command:** `npm run build` (runs `tsc -b && vite build`)
- **Output directory:** `dist`
- **Install command:** `npm install`

No environment variables are required. `node_modules/` and `dist/` are excluded from git via `.gitignore`.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `error TS6133: 'x' is declared but its value is never read` | An unused local in `src/` — remove it (TypeScript's `noUnusedLocals` is enabled and fails the Vercel build) |
| Chunk-size warning in the build | Only `scene-core` (Three.js) may exceed the default limit; the threshold is already raised in `vite.config.ts` |
| Port already in use when running `npm run preview` | Pass a free port: `npm run preview -- --port 4321` |
| WebGL scene does not appear | Check that hardware acceleration is enabled and that `public/models/*.glb` are reachable — the scene falls back to a blank background otherwise |

---

## Licence & Credits

Sample/educational project. Stock imagery via [Unsplash](https://unsplash.com/licence) (free licence); studio name, projects and copy are fictional. Not affiliated with Epic Games, Unreal Engine or any brand referenced in the sample content.
