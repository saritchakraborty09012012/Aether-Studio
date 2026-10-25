import { useEffect, useState } from 'react'

/** Right-side technical HUD: coordinates, rotating reticle, generation labels */
export default function Hud({ light }: { light: boolean }) {
  const [coords, setCoords] = useState(['.42', '-.20', '.40', '.08'])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1)
      setCoords(() =>
        Array.from({ length: 4 }, () => {
          const v = Math.random() * 2 - 1
          const s = Math.abs(v).toFixed(2).slice(1)
          return (v < 0 ? '-' : '.') + s
        }),
      )
    }, 900)
    return () => clearInterval(id)
  }, [])

  const c = light ? 'text-[#0b0c10]' : 'text-white'
  const dim = light ? 'text-[#0b0c10]/45' : 'text-white/45'
  const stroke = light ? '#0b0c10' : '#ffffff'

  return (
    <div className={`pointer-events-none fixed right-6 top-24 z-[60] hidden flex-col items-end gap-3 font-mono text-[10px] tracking-wider lg:flex ${c}`}>
      <div className={dim}>Headless Generation</div>
      <div className="flex gap-3 tabular-nums">
        {coords.map((v, i) => (
          <span key={i} className={i === 0 ? '' : dim}>
            {v}
          </span>
        ))}
      </div>

      <svg width="88" height="88" viewBox="0 0 100 100" className="my-1">
        <g className="reticle-spin" style={{ transformOrigin: '50px 50px' }}>
          <circle cx="50" cy="50" r="38" fill="none" stroke={stroke} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="6 5" />
          <path d="M50 8v10M50 82v10M8 50h10M82 50h10" stroke={stroke} strokeOpacity="0.7" strokeWidth="1.5" />
        </g>
        <g className="reticle-spin-rev" style={{ transformOrigin: '50px 50px' }}>
          <circle cx="50" cy="50" r="26" fill="none" stroke={stroke} strokeOpacity="0.5" strokeWidth="1" />
          <circle cx="50" cy="24" r="2.2" fill="#ff3b6b" />
          <circle cx="72" cy="62" r="2.2" fill="#3bff9a" />
          <circle cx="28" cy="62" r="2.2" fill="#3b7bff" />
        </g>
        <circle cx="50" cy="50" r="3" fill={stroke} />
        <line x1="50" y1="30" x2="50" y2="70" stroke={stroke} strokeOpacity="0.4" strokeWidth="0.8" />
        <line x1="30" y1="50" x2="70" y2="50" stroke={stroke} strokeOpacity="0.4" strokeWidth="0.8" />
        <text x="50" y="97" textAnchor="middle" fill={stroke} fillOpacity="0.5" fontSize="7" fontFamily="monospace">
          {String(tick % 100).padStart(2, '0')}
        </text>
      </svg>

      <div className={dim}>Root Generation</div>
    </div>
  )
}
