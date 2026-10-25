import { useEffect, useState } from 'react'
import { scrollState } from '../lib/scrollState'

/**
 * Loader replicating the video:
 * 1) stacked solid white triangle converges
 * 2) triangle slides left while technical grid lines draw
 * 3) concentric wireframe triangle + glowing blue orb core
 * 4) flash — reveal site
 * Footer strip is visible underneath the whole time (as in the original).
 */
export default function Loader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0) // 0 stack, 1 grid, 2 wire+orb, 3 flash, 4 gone

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 2900),
      setTimeout(() => {
        setPhase(4)
        scrollState.ready = true
        onDone()
      }, 3400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  if (phase >= 4) return null

  return (
    <div
      className="fixed inset-0 z-[90] bg-black transition-opacity duration-500"
      style={{ opacity: phase === 3 ? 0 : 1 }}
    >
      {/* faint blue core glow through all phases */}
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, rgba(70,100,255,0.85) 0%, rgba(30,40,180,0.4) 40%, transparent 70%)',
          opacity: phase >= 1 ? 1 : 0.25,
          transform: `translate(-50%,-50%) scale(${phase >= 2 ? 1.15 : 0.6})`,
        }}
      />

      {/* technical grid lines */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {[12, 28, 44, 58, 72, 86].map((x, i) => (
          <line
            key={`v${i}`}
            x1={`${x}%`}
            y1="0"
            x2={`${x}%`}
            y2="100%"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1"
            style={{
              strokeDasharray: 2000,
              strokeDashoffset: phase >= 1 ? 0 : 2000,
              transition: `stroke-dashoffset 1.1s cubic-bezier(0.7,0,0.2,1) ${i * 0.06}s`,
            }}
          />
        ))}
        {[62, 70, 78, 86].map((y, i) => (
          <line
            key={`h${i}`}
            x1="55%"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            style={{
              strokeDasharray: 800,
              strokeDashoffset: phase >= 1 ? 0 : 800,
              transition: `stroke-dashoffset 0.9s cubic-bezier(0.7,0,0.2,1) ${0.3 + i * 0.08}s`,
            }}
          />
        ))}
      </svg>

      {/* triangle mark */}
      <div
        className="absolute left-1/2 top-1/2 transition-all duration-[900ms]"
        style={{
          transform:
            phase === 0
              ? 'translate(-50%,-50%) scale(1)'
              : phase === 1
                ? 'translate(calc(-50% - 22vw), calc(-50% - 4vh)) scale(0.85)'
                : 'translate(-50%,-50%) scale(1.05)',
        }}
      >
        {phase <= 1 ? (
          /* stacked solid triangles converging */
          <div className="relative h-28 w-32">
            {[0, 1, 2, 3].map((i) => (
              <svg
                key={i}
                viewBox="0 0 100 88"
                className="absolute inset-0 h-full w-full"
                style={{
                  transform: `translateY(${(3 - i) * 5}px) scale(${1 - (3 - i) * 0.06})`,
                  opacity: phase === 0 ? 0.4 + i * 0.2 : 1,
                  transition: 'transform 0.7s cubic-bezier(0.2,0.8,0.2,1), opacity 0.5s',
                }}
              >
                <path
                  d="M50 8 L94 82 H6 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="11"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>
        ) : (
          /* concentric wireframe triangles + orb */
          <div className="relative h-72 w-80">
            {[1, 0.86, 0.72, 0.58].map((s, i) => (
              <svg
                key={i}
                viewBox="0 0 100 88"
                className="absolute inset-0 h-full w-full"
                style={{
                  transform: `translate(-50%,-50%) scale(${s})`,
                  left: '50%',
                  top: '50%',
                  opacity: 0.35 + i * 0.2,
                }}
              >
                <path
                  d="M50 8 L94 82 H6 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
            <div className="glow-orb absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,#5a7bff_40%,#1a2acc_75%)]" />
          </div>
        )}
      </div>

      {/* loader footer strip — same as site footer, visible from the start */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-8 pb-6 font-mono text-[10px] tracking-wider text-white/80">
        <div className="flex gap-14">
          <div className="flex flex-col gap-2">
            {['Top', 'News', 'Works'].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {['About', 'Contact'].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-white/50">
            <span>Language</span>
            <span>
              <span className="text-white">English</span> | JP
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-6">
            <span>Instagram ↗</span>
            <span>Recruit ↗</span>
          </div>
          <div className="flex gap-4 text-white/45">
            <span>Privacy Policy</span>
            <span>Terms of Use</span>
          </div>
        </div>
      </div>

      {/* corner ticks */}
      <div className="absolute left-6 top-6 h-4 w-4 border-l border-t border-white/40" />
      <div className="absolute right-6 top-6 h-4 w-4 border-r border-t border-white/40" />
    </div>
  )
}
