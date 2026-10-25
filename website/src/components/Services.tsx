import { useEffect, useRef } from 'react'
import { scrollState, clamp01 } from '../lib/scrollState'

function ServiceGrid() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.55]" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="service-grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M120 0H0V120" fill="none" stroke="#9fb6d8" strokeWidth="0.5" opacity="0.16" />
          <path d="M60 54v12M54 60h12" stroke="#dbe7ff" strokeWidth="1" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#service-grid)" />
    </svg>
  )
}

const ringStyle: React.CSSProperties = {
  background:
    'conic-gradient(from 20deg, #ff5a3c 0deg, #ffd23e 55deg, #8bff6a 120deg, #38c8ff 185deg, #5b6bff 240deg, #ff5ad9 300deg, #ff5a3c 360deg)',
  imageRendering: 'auto',
}

export default function Services() {
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
      scrollState.services = p

      el.querySelectorAll<HTMLElement>('[data-row]').forEach((row, i) => {
        const dir = i % 2 === 0 ? -1 : 1
        row.style.transform = `translate3d(${dir * p * 30}vw, 0, 0)`
      })

      el.querySelectorAll<HTMLElement>('[data-ring]').forEach((ring) => {
        ring.style.transform = `translate(calc(-50% + ${(p - 0.5) * 34}vw), -50%) rotate(${p * 190}deg) scale(${0.82 + p * 0.34})`
        ring.style.opacity = String(0.28 + Math.sin(clamp01(p) * Math.PI) * 0.62)
      })
      el.querySelectorAll<HTMLElement>('[data-ring-soft]').forEach((ring) => {
        ring.style.transform = `translate(calc(-50% + ${(p - 0.5) * 34}vw), -50%) rotate(${p * 190 + 12}deg) scale(${0.82 + p * 0.34})`
        ring.style.opacity = String(0.12 + Math.sin(clamp01(p) * Math.PI) * 0.34)
      })
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section ref={ref} id="services" data-theme="dark" className="relative z-10 h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#04060e]/90 text-white">
        <ServiceGrid />

        <div className="absolute inset-0 flex flex-col justify-center gap-[1.5vh] overflow-hidden">
          {Array.from({ length: 2 }).map((_, r) => (
            <div key={r} data-row className="will-change-transform">
              <div className="marquee-track" style={{ animationDuration: `${26 + r * 8}s` }}>
                {Array.from({ length: 4 }).map((__, i) => (
                  <span
                    key={i}
                    className="font-display mx-5 text-[19vw] leading-[0.8] font-black text-[#e7e3d8]/90 select-none sm:mx-8"
                  >
                    SERVICES
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          data-ring
          className="pointer-events-none absolute left-1/2 top-1/2 h-[96vmax] w-[96vmax] rounded-full"
          style={{
            ...ringStyle,
            maskImage: 'radial-gradient(circle, transparent 38%, #000 39%, #000 55%, transparent 56%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 38%, #000 39%, #000 55%, transparent 56%)',
            filter: 'blur(22px) saturate(1.35)',
            mixBlendMode: 'screen',
          }}
        />
        <div
          data-ring-soft
          className="pointer-events-none absolute left-1/2 top-1/2 h-[112vmax] w-[112vmax] rounded-full"
          style={{
            ...ringStyle,
            maskImage: 'radial-gradient(circle, transparent 38%, #000 39%, #000 52%, transparent 56%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 38%, #000 39%, #000 52%, transparent 56%)',
            filter: 'blur(60px) saturate(1.5)',
            mixBlendMode: 'screen',
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48vh] bg-gradient-to-t from-[#04060e] via-[#04060e]/80 to-transparent" />

        <div className="absolute bottom-[9vh] left-4 right-4 sm:left-[8vw] sm:right-auto sm:max-w-md">
          <div className="border-l border-white/30 bg-[#04060e]/55 px-5 py-4 backdrop-blur-md">
            <div className="mb-3 font-mono text-[10px] tracking-[0.28em] text-white/50">SERVICE</div>
            <h3 className="font-display text-[clamp(18px,4.6vw,30px)] leading-snug font-bold text-[#f3efe4]">
              Realtime 3D · Virtual Production · Metaverse Experiences
            </h3>
            <p className="mt-3 font-jp text-[12px] leading-relaxed text-white/65 sm:text-[13px]">
              Photoreal spatial design with Unreal Engine, virtual exhibitions, live attractions
              and more. A realtime entertainment studio that designs the experience itself.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['unreal-engine', 'virtual-production', 'cloud-rendering', 'spatial-audio', 'web3'].map((t) => (
                <span key={t} className="tag-pill border-white/25 text-white/75">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute left-5 top-20 font-mono text-[10px] text-white/40 sm:left-8 sm:top-24">03 / SERVICE</div>
        <div className="absolute bottom-8 right-5 hidden font-mono text-[10px] tracking-[0.3em] text-white/35 md:block">
          IRIDESCENT / REALTIME
        </div>
      </div>
    </section>
  )
}
