import { useEffect, useState } from 'react'

export function Logo({ light = false }: { light?: boolean }) {
  const c = light ? '#0b0c10' : '#ffffff'
  return (
    <a
      href="#top"
      aria-label="Aether — back to top"
      className="group flex items-center gap-[2px] select-none"
      style={{ color: c, textShadow: light ? 'none' : '0 1px 18px rgba(4,5,12,0.55)' }}
    >
      <svg viewBox="0 0 100 88" className="h-[17px] w-[15px] translate-y-[1px]" aria-hidden>
        <path d="M50 10 L92 82 H8 Z" fill="none" stroke={c} strokeWidth="12" strokeLinejoin="round" />
      </svg>
      <span className="font-display text-[20px] font-black tracking-[0.12em]">ETHER</span>
    </a>
  )
}

const links = ['News', 'Works', 'About', 'stellla']

export default function Nav({ light }: { light: boolean }) {
  const [open, setOpen] = useState(false)
  const c = light ? 'text-[#0b0c10]' : 'text-white'
  const pill = light
    ? 'border-[#0b0c10]/30 bg-[#e3eaee]/40 text-[#0b0c10] hover:bg-[#0b0c10] hover:text-white'
    : 'border-white/40 bg-[#04050c]/25 text-white backdrop-blur-sm hover:bg-white hover:text-black'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-[65] h-24 transition-colors duration-500 ${
          light
            ? 'bg-gradient-to-b from-[#e3eaee] via-[#e3eaee]/75 to-transparent'
            : 'bg-gradient-to-b from-[#04050c]/75 via-[#04050c]/35 to-transparent'
        }`}
      />
      <header className="fixed inset-x-0 top-0 z-[70] flex items-center justify-between px-6 py-5 md:px-8">
        <Logo light={light} />

        <nav
          className={`hidden items-center gap-9 font-mono text-[12px] tracking-wide md:flex ${c}`}
          style={{ textShadow: light ? 'none' : '0 1px 18px rgba(4,5,12,0.6)' }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="opacity-90 transition-opacity hover:opacity-100"
            >
              {l}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className={`hidden rounded-full border px-5 py-2 font-mono text-[11px] tracking-wide transition-colors sm:inline-block ${pill}`}
          >
            Contact / Recruit
          </a>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="menu-overlay"
            onClick={() => setOpen(true)}
            className={`grid h-9 w-9 place-items-center rounded border transition-colors ${
              light
                ? 'border-[#0b0c10]/25 bg-[#e3eaee]/40 text-[#0b0c10]'
                : 'border-white/25 bg-[#04050c]/25 text-white backdrop-blur-sm'
            } hover:border-current`}
          >
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
              <path d="M0 1h14M0 5h14M0 9h14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </header>

      <div
        id="menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-0 z-[95] bg-[#05060c] transition-all duration-500 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex h-full flex-col justify-between p-8 md:p-12">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded border border-white/25 text-white"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {['Top', 'News', 'Works', 'About', 'stellla', 'Contact'].map((l, i) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="font-display text-4xl font-black uppercase tracking-tight text-white/90 transition-all hover:text-white sm:text-5xl md:text-7xl"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {l}
              </a>
            ))}
          </nav>
          <div className="flex justify-between font-mono text-[11px] text-white/50">
            <span>© 2026 Aether Inc.</span>
            <div className="flex gap-6">
              <span>Instagram ↗</span>
              <span>Recruit ↗</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
