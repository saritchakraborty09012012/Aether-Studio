import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import Lenis from 'lenis'
import Loader from './components/Loader'

// code-split the ~1.4 MB Three.js scene out of the initial bundle
const Scene3D = lazy(() => import('./components/Scene3D'))
import Nav from './components/Nav'
import Hud from './components/Hud'
import Hero from './components/Hero'
import Works from './components/Works'
import About from './components/About'
import Services from './components/Services'
import Featured, { Stella } from './components/Featured'
import Footer from './components/Footer'
import { scrollState } from './lib/scrollState'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [light, setLight] = useState(false)

  const onLoaded = useCallback(() => setLoaded(true), [])

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const lenis = new Lenis({
      duration: isTouch ? 0.9 : 1.25,
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    const themed = Array.from(document.querySelectorAll<HTMLElement>('[data-theme]'))
    let raf = 0
    let lastLight = false
    const loop = (t: number) => {
      lenis.raf(t)
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollState.progress = max > 0 ? window.scrollY / max : 0

      // which chapter sits under the nav band right now?
      let nextLight = false
      for (const el of themed) {
        const r = el.getBoundingClientRect()
        if (r.top <= 36 && r.bottom > 36) {
          nextLight = el.dataset.theme === 'light'
          break
        }
      }
      scrollState.light = nextLight ? 1 : 0
      if (nextLight !== lastLight) {
        lastLight = nextLight
        setLight(nextLight)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      scrollState.px = (e.clientX / window.innerWidth) * 2 - 1
      scrollState.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // debug: ?y=<px> jumps scroll for visual verification
  useEffect(() => {
    const y = new URLSearchParams(window.location.search).get('y')
    if (!y) return
    const id = window.setTimeout(() => {
      const top = parseInt(y, 10)
      const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
      if (lenis) lenis.scrollTo(top, { immediate: true })
      else window.scrollTo({ top, behavior: 'auto' })
    }, 3600)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="grain relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:font-mono focus:text-[12px] focus:text-black"
      >
        Skip to content
      </a>
      <Loader onDone={onLoaded} />
      <Suspense fallback={null}>
        <Scene3D />
      </Suspense>
      <Nav light={light} />
      <Hud light={light} />
      <main
        id="main-content"
        className="relative"
        style={{ filter: loaded ? 'none' : 'blur(6px)', transition: 'filter 0.8s ease' }}
      >
        <Hero />
        <Works />
        <About />
        <Services />
        <Featured />
        <Stella />
        <Footer />
      </main>
    </div>
  )
}
