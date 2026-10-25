import { useEffect, useRef } from 'react'
import { scrollState, clamp01 } from '../lib/scrollState'
import { ProjectArt } from './ProjectArt'

const panels = [
  {
    id: 'unreal',
    kicker: 'LUNAR / ENGINE',
    badgeTop: 'CREATED IN',
    badge: 'UNREAL ENGINE',
    ghost: 'UNREAL',
    title: 'Unreal Engine Works',
    jp: 'Armed with realtime rendering, we cross the boundaries of film, space and live performance. Photoreal worlds — built as experiences you can step inside.',
    en: 'Realtime rendering as a craft — film, space and live shows engineered in Unreal Engine.',
    tags: ['unreal5', 'virtual-production', 'cloud-rendering'],
    art: 'unreal',
  },
  {
    id: 'fortnite',
    kicker: 'DEVELOPED IN FORTNITE',
    badgeTop: 'CREATED IN',
    badge: 'FORTNITE',
    ghost: 'FORTNITE',
    title: 'Fortnite Creative',
    jp: 'Brand experience maps planned, designed and built with Fortnite Creative. Places made to be played — stories made to be lived.',
    en: 'Brand worlds built inside Fortnite Creative — designed to be played, not watched.',
    tags: ['fortnite', 'metaverse', 'in-game-concert'],
    art: 'fortnite',
  },
]

function FeaturedGrid() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-60" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="featured-grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M120 0H0V120" fill="none" stroke="#8ea8d0" strokeWidth="0.5" opacity="0.14" />
          <path d="M60 54v12M54 60h12" stroke="#cfe0ff" strokeWidth="1" opacity="0.26" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#featured-grid)" />
    </svg>
  )
}

export default function Featured() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const h = el.offsetHeight - window.innerHeight
      const p = clamp01(-rect.top / Math.max(h, 1))
      scrollState.featured = p
      const items = el.querySelectorAll<HTMLElement>('[data-panel]')
      const last = items.length - 1
      items.forEach((item, i) => {
        const local = clamp01((p - i * 0.42) / 0.4)
        const fadeIn = clamp01(local / 0.25)
        const fadeOut = i === last ? 1 : 1 - clamp01((local - 0.75) / 0.25)
        const o = fadeIn * fadeOut
        item.style.opacity = String(o)
        item.style.transform = `translateY(${(1 - fadeIn) * 7}vh) scale(${0.96 + fadeIn * 0.04})`
        item.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
      })
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section ref={ref} id="featured" data-theme="dark" className="relative z-10 h-[260vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#04060e]/75">
        <FeaturedGrid />
        {panels.map((panel, i) => (
          <div
            key={panel.id}
            data-panel
            className="absolute inset-0 flex flex-col justify-center gap-5 px-5 opacity-0 sm:gap-7 sm:px-[6vw] md:grid md:grid-cols-[1.25fr_0.75fr] md:items-center"
            style={{ opacity: 0 }}
          >
            <span className="font-display pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 text-[22vw] leading-none font-black text-outline opacity-[0.09] select-none">
              {panel.ghost}
            </span>

            <div className="relative w-full" style={{ perspective: '1800px' }}>
              <div
                className="relative aspect-[16/10] w-full max-w-4xl justify-self-center md:justify-self-start"
                style={{ transform: 'rotateY(9deg) rotateX(3deg) rotateZ(-1.2deg)' }}
              >
                <div className="absolute -inset-3 bg-[#4d6bff]/20 blur-3xl" aria-hidden />
                <span className="corner-tick absolute -inset-3 opacity-70 sm:-inset-4" />
                <div className="absolute inset-0 overflow-hidden border border-white/20 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
                  <ProjectArt kind={panel.art} />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_35%,transparent_70%,rgba(4,5,12,0.35))]" />
                </div>
                <div className="absolute -left-8 top-0 hidden h-full flex-col justify-between py-2 md:flex">
                  {Array.from({ length: 7 }).map((_, t) => (
                    <span key={t} className="h-px w-4 bg-white/35" />
                  ))}
                </div>
                <div className="absolute -bottom-6 left-0 hidden font-mono text-[9px] text-white/40 md:block">
                  FRAME_{String(i + 1).padStart(2, '0')} · 3840×2160 · REALTIME
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                <span className="grid h-7 w-7 place-items-center rounded-full border border-white/40 sm:h-8 sm:w-8">
                  <svg viewBox="0 0 100 88" className="h-3 w-3" aria-hidden>
                    <path d="M50 12 L90 80 H10 Z" fill="none" stroke="#fff" strokeWidth="10" />
                  </svg>
                </span>
                <div className="text-right leading-none">
                  <div className="font-mono text-[9px] tracking-[0.28em] text-white/45">{panel.badgeTop}</div>
                  <div className="font-display mt-1 text-[22px] font-black tracking-tight text-white/90 sm:text-[26px]">
                    {panel.badge}
                  </div>
                </div>
              </div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-white/55">{panel.kicker}</div>
              <h2 className="font-display mt-2 text-[clamp(24px,5.6vw,50px)] leading-[1.02] font-bold">{panel.title}</h2>
              <p className="mt-3 font-jp text-[12px] leading-relaxed text-white/70 sm:mt-5 sm:text-[13px]">{panel.jp}</p>
              <p className="mt-3 hidden max-w-sm font-mono text-[11px] leading-relaxed text-white/45 sm:mt-4 sm:block">{panel.en}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {panel.tags.map((t) => (
                  <span key={t} className="tag-pill border-white/25 text-white/75">
                    {t}
                  </span>
                ))}
              </div>
              <a
                href="#featured"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 font-mono text-[11px] transition-colors hover:bg-white hover:text-black sm:mt-8"
              >
                More Details ↗
              </a>
            </div>
          </div>
        ))}

        <div className="absolute left-5 top-20 font-mono text-[10px] text-white/40 sm:left-8 sm:top-24">04 / FEATURED</div>
      </div>
    </section>
  )
}

/** stellla fullscreen chapter — pastel dream panel */
export function Stella() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const p = clamp01((window.innerHeight - rect.top) / (window.innerHeight + rect.height * 0.5))
      const media = el.querySelector<HTMLElement>('[data-stella-media]')
      if (media) media.style.transform = `scale(${1.08 - p * 0.12})`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section ref={ref} id="stellla" data-theme="dark" className="relative z-10 h-[160vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#08060c]">
        <div data-stella-media className="absolute inset-0 origin-center">
          <img
            src="/images/stella.jpg"
            alt="stellla"
            className="h-full w-full object-cover"
            style={{ filter: 'saturate(1.05) contrast(1.02) brightness(1.08)' }}
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_62%_38%,rgba(255,194,228,0.72),rgba(255,150,200,0.25)_38%,transparent_68%)] mix-blend-screen" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(120,70,140,0.28),rgba(255,170,210,0.18)_45%,rgba(30,10,40,0.5))] mix-blend-soft-light" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(8,6,12,0.4)_100%)]" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-display text-[clamp(54px,9vw,120px)] leading-none font-semibold text-white/95 italic drop-shadow-[0_4px_40px_rgba(120,80,200,0.6)]">
                stellla
              </div>
              <div
                aria-hidden
                className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-full border border-white/70 bg-white/10 backdrop-blur-sm"
              >
                <span className="ml-1 text-white">▶</span>
              </div>
            </div>
          </div>
        </div>
        {[
          ['right-10 top-[22%]', ''],
          ['right-10 top-[46%]', ''],
          ['right-10 top-[70%]', ''],
        ].map(([pos], i) => (
          <span key={i} className={`absolute ${pos} font-mono text-white/60`}>
            +
          </span>
        ))}
        <div className="absolute bottom-8 left-5 font-mono text-[11px] text-white/70 sm:bottom-10 sm:left-8">
          <div className="text-white/40">2025.03.28</div>
          <div className="font-display text-lg font-bold">stellla</div>
        </div>
      </div>
    </section>
  )
}
