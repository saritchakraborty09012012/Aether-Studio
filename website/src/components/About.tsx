import { useEffect, useRef } from 'react'
import { aboutLines, aboutEn, visionLines, visionEn } from '../data/content'
import { scrollState, clamp01 } from '../lib/scrollState'

function Grid({ id }: { id: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={id} width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M120 0H0V120" fill="none" stroke="#52646f" strokeWidth="0.5" opacity="0.22" />
          <path d="M60 54v12M54 60h12" stroke="#52646f" strokeWidth="1" opacity="0.38" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

function Triangle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 900" className={className} fill="none" aria-hidden>
      <path d="M500 78 L932 802 H68 Z" stroke="white" strokeWidth="3" strokeLinejoin="round" />
      <path d="M500 300 L724 686 H276 Z" stroke="white" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
      <path d="M68 802 H318 L346 770 H654 L682 802 H932" stroke="white" strokeWidth="4" strokeLinejoin="round" />
      <path d="M346 770 H654" stroke="white" strokeWidth="2" opacity="0.7" />
    </svg>
  )
}

function Rail({ label, light = false }: { label: string; light?: boolean }) {
  return (
    <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col items-start gap-1.5 md:flex">
      {Array.from({ length: 7 }).map((_, i) => (
        <span
          key={i}
          className={light ? 'block h-px bg-[#0b0c10]/35' : 'block h-px bg-white/40'}
          style={{ width: i % 3 === 0 ? 18 : 10 }}
        />
      ))}
      <span className="py-2 font-mono text-[9px] tracking-[0.3em] text-[#0b0c10]/55 [writing-mode:vertical-rl]">
        {label}
      </span>
      {Array.from({ length: 7 }).map((_, i) => (
        <span
          key={`b${i}`}
          className={light ? 'block h-px bg-[#0b0c10]/35' : 'block h-px bg-white/40'}
          style={{ width: i % 3 === 0 ? 18 : 10 }}
        />
      ))}
    </div>
  )
}

export default function About() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const top = -rect.top
      const p1 = clamp01(top / Math.max(vh, 1))
      const p2 = clamp01((top - vh * 0.92) / Math.max(vh * 0.9, 1))
      scrollState.about = p1

      el.querySelectorAll<HTMLElement>('[data-line]').forEach((line, i) => {
        const t = clamp01((p1 - 0.02 - i * 0.13) / 0.22)
        line.style.setProperty('--p', String(t))
        line.style.setProperty('--clip', `${(1 - t) * 100}%`)
      })
      const en = el.querySelector<HTMLElement>('[data-en]')
      if (en) en.style.opacity = String(clamp01((p1 - 0.5) / 0.2))

      el.querySelectorAll<HTMLElement>('[data-vline]').forEach((line, i) => {
        const t = clamp01((p2 - 0.04 - i * 0.2) / 0.26)
        line.style.setProperty('--p', String(t))
        line.style.setProperty('--clip', `${(1 - t) * 100}%`)
      })
      const ven = el.querySelector<HTMLElement>('[data-ven]')
      if (ven) ven.style.opacity = String(clamp01((p2 - 0.42) / 0.2))
      const beam = el.querySelector<HTMLElement>('[data-beam]')
      if (beam) beam.style.transform = `rotate(${24 + p2 * 12}deg) translateY(${(0.5 - p2) * 14}vh)`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section ref={ref} id="about" data-theme="light" className="relative z-10 h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#e3eaee] text-[#0b0c10]">
        <Grid id="about-grid" />
        <Triangle className="absolute inset-x-0 top-[6vh] mx-auto h-[92vh] w-[86vw] opacity-90 sm:w-[74vw]" />
        <Rail label="ABOUT" light />

        <div className="relative flex h-full flex-col justify-center px-6 sm:px-[8vw]">
          <div className="mb-5 font-mono text-[10px] tracking-[0.32em] text-[#0b0c10]/45">MISSION</div>
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            {aboutLines.map((line) => (
              <h2
                key={line}
                data-line
                className="font-jp text-[clamp(19px,4.6vw,52px)] font-bold leading-tight"
                style={{ '--p': 0 } as React.CSSProperties}
              >
                <span className="relative inline-block">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 -left-[0.3em] -right-[0.3em] bg-[#0b0c10]"
                    style={{ transform: 'scaleX(var(--p, 0))', transformOrigin: 'left center' }}
                  />
                  <span className="relative px-[0.3em] py-[0.12em]">{line}</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 px-[0.3em] py-[0.12em] text-[#e3eaee]"
                    style={{ clipPath: 'inset(0 var(--clip, 100%) 0 0)' }}
                  >
                    {line}
                  </span>
                </span>
              </h2>
            ))}
          </div>

          <p
            data-en
            className="mt-6 max-w-md whitespace-pre-line font-mono text-[11px] leading-relaxed text-[#0b0c10]/55 sm:mt-10 sm:text-[12px]"
            style={{ opacity: 0 }}
          >
            {aboutEn}
          </p>
        </div>
      </div>

      <div className="sticky top-0 h-screen overflow-hidden bg-[#e3eaee] text-[#0b0c10]">
        <Grid id="vision-grid" />
        <span className="font-display pointer-events-none absolute left-[6vw] top-[9vh] text-[16vw] leading-none font-black text-outline opacity-80 select-none sm:text-[13vw]">
          VISION
        </span>
        <Triangle className="absolute inset-x-0 top-[10vh] mx-auto h-[84vh] w-[86vw] opacity-90 sm:w-[70vw]" />
        <div
          data-beam
          aria-hidden
          className="absolute -left-[3vw] top-[-20%] h-[150%] w-[7vw] opacity-90 sm:left-[16vw] sm:w-[4.5vw]"
          style={{
            background:
              'linear-gradient(180deg, #ff7ad9 0%, #ffd23e 24%, #9cff6a 46%, #54c7ff 72%, #a06bff 100%)',
            filter: 'blur(1px) saturate(1.25)',
            mixBlendMode: 'multiply',
            transformOrigin: 'center',
          }}
        />
        <div
          aria-hidden
          className="absolute -left-[3vw] top-[-20%] h-[150%] w-[7vw] opacity-40 sm:left-[16vw] sm:w-[4.5vw]"
          style={{
            background:
              'linear-gradient(180deg, #ff7ad9 0%, #ffd23e 24%, #9cff6a 46%, #54c7ff 72%, #a06bff 100%)',
            filter: 'blur(40px) saturate(1.4)',
            transform: 'rotate(34deg)',
          }}
        />
        <Rail label="VISION" light />

        <div className="absolute right-5 top-1/2 flex max-w-[92vw] -translate-y-1/2 flex-col items-end gap-2 sm:right-[8vw] sm:gap-3">
          <div className="mb-3 font-mono text-[10px] tracking-[0.32em] text-[#0b0c10]/45">VISION</div>
          {visionLines.map((line) => (
            <h2
              key={line}
              data-vline
              className="text-right font-jp text-[clamp(17px,3.4vw,40px)] font-bold leading-tight"
              style={{ '--p': 0 } as React.CSSProperties}
            >
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-y-0 -left-[0.3em] -right-[0.3em] bg-[#0b0c10]"
                  style={{ transform: 'scaleX(var(--p, 0))', transformOrigin: 'right center' }}
                />
                <span className="relative px-[0.3em] py-[0.12em]">{line}</span>
                <span
                  aria-hidden
                  className="absolute inset-0 px-[0.3em] py-[0.12em] text-[#e3eaee]"
                  style={{ clipPath: 'inset(0 var(--clip, 100%) 0 0)' }}
                >
                  {line}
                </span>
              </span>
            </h2>
          ))}
          <p
            data-ven
            className="mt-5 max-w-xs text-right font-mono text-[11px] leading-relaxed text-[#0b0c10]/55 sm:max-w-sm sm:text-[12px]"
            style={{ opacity: 0 }}
          >
            {visionEn}
          </p>
        </div>
      </div>
    </section>
  )
}
