import { useEffect, useRef, useState } from 'react'
import { works } from '../data/content'
import { scrollState, clamp01 } from '../lib/scrollState'
import { ProjectArt } from './ProjectArt'

/**
 * Cylindrical horizontal gallery — cards sit on an invisible drum.
 * Scroll rotates the drum: the focused card faces the camera, neighbours
 * curve away left/right (rotateY + receding Z), like the reference site.
 */
export default function Works() {
  const ref = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const h = el.offsetHeight - window.innerHeight
      const p = clamp01(-rect.top / Math.max(h, 1))
      scrollState.works = p

      const n = works.length
      const pos = p * (n - 1)
      const vw = window.innerWidth
      const isPhone = vw < 640
      // phone: tighter drum so one landscape card dominates; desktop: wide cinematic drum
      const angle = isPhone ? 0.62 : 0.52
      const R = isPhone ? Math.min(vw * 1.35, 620) : Math.min(vw * 1.05, 1500)

      for (let i = 0; i < n; i++) {
        const card = cardRefs.current[i]
        if (!card) continue
        const theta = (i - pos) * angle
        const x = Math.sin(theta) * R
        const z = (Math.cos(theta) - 1) * R
        const dist = Math.abs(i - pos)
        const rotY = (theta * 180) / Math.PI
        const scale = Math.max(0.78, 1 - dist * 0.06)
        const opacity = dist > 2.4 ? 0 : Math.max(0.35, 1 - dist * 0.22)
        card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`
        card.style.opacity = opacity.toFixed(3)
        card.style.zIndex = String(200 - Math.round(dist * 20))
      }

      const idx = Math.min(n - 1, Math.max(0, Math.round(pos)))
      setActive(idx)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const meta = works[active]

  return (
    <section ref={ref} id="works" className="relative z-10 h-[420vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* huge outline WORKS backdrop */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[28vw] leading-none font-black text-outline opacity-[0.13] select-none">
            WORKS
          </span>
        </div>

        {/* cylindrical card drum */}
        <div
          className="absolute inset-0"
          style={{ perspective: '1500px', perspectiveOrigin: '50% 44%' }}
        >
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {works.map((w, i) => (
              <article
                key={w.id}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                className="group absolute left-1/2 top-[38%] aspect-video w-[86vw] max-w-[720px] overflow-hidden rounded-[2px] border border-white/10 bg-[#0a0d18] will-change-transform sm:top-[42%] sm:h-[42vh] sm:w-[46vw] sm:aspect-auto"
                style={{
                  transform: 'translate(-50%, -50%)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="absolute inset-0">
                  <ProjectArt kind={w.art} />
                </div>
                {/* subtle vignette so side cards melt into the room */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(4,5,12,0.45)_100%)]" />
                {/* scanline sheen on hover */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* corner ticks */}
                <span className="corner-tick absolute inset-3 opacity-60" />
              </article>
            ))}
          </div>
        </div>

        {/* focused meta bottom-left */}
        <div className="absolute bottom-8 left-4 right-4 max-w-[min(560px,88vw)] sm:bottom-12 sm:left-6 sm:right-auto">
          <div className="mb-2 font-mono text-[10px] tracking-wider text-[#ffd23e] sm:text-[11px]">{meta.date}</div>
          {meta.yellowNote && (
            <div className="mb-1 font-jp text-[10px] text-[#ffd23e]/90 sm:text-[11px]">{meta.yellowNote}</div>
          )}
          <h3 className="font-display text-[clamp(18px,5.5vw,40px)] leading-tight font-bold text-white">
            {meta.title}
          </h3>
          <p className="mt-1 font-mono text-[10px] text-white/60 sm:text-[11px]">{meta.subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {meta.tags.map((t) => (
              <span key={t} className="tag-pill text-white/80">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* more works link — hidden on phones to avoid colliding with tags */}
        <a
          href="#works"
          className="absolute bottom-14 right-8 hidden font-mono text-[12px] tracking-wide text-white/85 hover:text-white md:block"
        >
          More Works ↗
        </a>

        {/* left TICK rail */}
        <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-1 md:flex">
          <span className="mb-3 font-mono text-[9px] tracking-[0.25em] text-white/40 [writing-mode:vertical-rl]">
            TICK
          </span>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="block h-px bg-white/35" style={{ width: i % 4 === 0 ? 16 : 8 }} />
          ))}
        </div>

        {/* progress index */}
        <div className="absolute bottom-14 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] tabular-nums text-white/45 md:block">
          {String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
        </div>
        {/* phone progress */}
        <div className="absolute bottom-4 right-4 font-mono text-[10px] tabular-nums text-white/45 md:hidden">
          {String(active + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
        </div>
      </div>
    </section>
  )
}
