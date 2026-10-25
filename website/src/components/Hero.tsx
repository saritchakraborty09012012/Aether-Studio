import { useEffect, useRef } from 'react'
import { news } from '../data/content'
import { scrollState, clamp01 } from '../lib/scrollState'

/** Giant AETHER wordmark with the triangular A — scroll makes letters breathe apart */
export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = ref.current
      const t = titleRef.current
      if (!el || !t) return
      const rect = el.getBoundingClientRect()
      const h = el.offsetHeight || 1
      const p = clamp01(-rect.top / h)
      scrollState.hero = p
      // letters spread + fade as we scroll toward works
      const spread = p * 16
      t.style.setProperty('--spread', `${spread}vw`)
      t.style.opacity = String(1 - clamp01((p - 0.55) / 0.4))
      t.style.transform = `scale(${1 + p * 0.35}) translateY(${p * -8}vh)`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section ref={ref} id="top" className="relative z-10 h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* giant type */}
        <div
          ref={titleRef}
          className="absolute inset-x-0 top-[36%] flex -translate-y-1/2 items-center justify-center gap-[var(--spread,0vw)] px-2 sm:px-4"
          style={{ '--spread': '0vw' } as React.CSSProperties}
        >
          {/* A as triangle glyph */}
          <svg viewBox="0 0 100 88" className="h-[15vw] max-h-32 w-[16vw] max-w-36 shrink-0 drop-shadow-[0_0_30px_rgba(80,110,255,0.45)]">
            <path d="M50 10 L92 82 H8 Z" fill="none" stroke="white" strokeWidth="11" strokeLinejoin="round" />
          </svg>
          {['E', 'T', 'H', 'E', 'R'].map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="font-display text-[17vw] leading-none font-black text-white drop-shadow-[0_0_40px_rgba(70,100,255,0.35)]"
              style={{
                letterSpacing: '-0.02em',
                transform: `translateX(${i % 2 === 0 ? -1 : 1}px)`,
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* bottom-left stats block */}
        <div className="absolute bottom-10 left-6 hidden w-56 flex-col gap-3 font-mono text-[10px] text-white/70 md:flex">
          <span className="text-white/45">message from Aether</span>
          {[
            ['immersion', '0.92'],
            ['presence', '0.87'],
            ['realtime', '1.00'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className="w-20 text-white/50">{k}</span>
              <div className="h-[3px] flex-1 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-white/80" style={{ width: `${parseFloat(v) * 100}%` }} />
              </div>
              <span className="tabular-nums">{v}</span>
            </div>
          ))}
          <div className="mt-3 flex items-center gap-2 text-white/40">
            <span className="grid h-3 w-3 place-items-center rounded-sm border border-white/40 text-[8px]">✓</span>
            <span>All rights reserved, Aether Inc.</span>
          </div>
        </div>

        {/* news list bottom-right — hidden on phones (menu overlay covers it) */}
        <div id="news" className="absolute bottom-10 right-6 hidden w-[min(420px,46vw)] font-mono text-[11px] leading-relaxed md:block">
          <div className="mb-3 text-white/50">News</div>
          <ul className="flex flex-col gap-3">
            {news.map((n) => (
              <li key={n.date} className="grid grid-cols-[70px_1fr] gap-3">
                <span className="text-white/45 tabular-nums">{n.date}</span>
                <a href="#news" className="text-white/85 underline-offset-2 hover:underline">
                  {n.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* left tick rail */}
        <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="block h-px bg-white/40" style={{ width: i % 3 === 0 ? 14 : 8 }} />
          ))}
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-white/40">
          SCROLL
        </div>
      </div>
    </section>
  )
}
