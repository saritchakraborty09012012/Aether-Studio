import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The Three.js scene is already loaded via a dynamic import (see App.tsx), but
 * it was still emitted as a single ~1.1 MB chunk. These groups split it into
 * cacheable vendor chunks so no single file trips Vercel's size warning and
 * repeat visits only re-download what changed.
 */
const nm = 'node_modules[\\\\/]'
const pkg = (name: string) => new RegExp(`${nm}(?:${name})[\\\\/]`)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // the only chunk left above Vercel's 500 kB default is `scene-core`, which is
    // Three.js itself (two monolithic modules) — it can't be split any further
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'scene-core', test: pkg('three|@react-three[\\\\/]fiber'), priority: 30 },
            { name: 'scene-fx', test: pkg('postprocessing|@react-three[\\\\/]postprocessing'), priority: 25 },
            { name: 'scene-drei', test: pkg('@react-three[\\\\/]drei|three-stdlib'), priority: 20 },
            { name: 'vendor', test: pkg('react|react-dom|scheduler|gsap|lenis'), priority: 10 },
          ],
        },
      },
    },
  },
})
