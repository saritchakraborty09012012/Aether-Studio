export default function Footer() {
  return (
    <footer id="contact" className="relative z-10 overflow-hidden bg-[#04050c] px-5 pt-16 pb-8 text-white sm:px-8 sm:pt-24 sm:pb-10">
      {/* Visible sample watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="select-none text-center text-[12vw] font-black uppercase tracking-[0.4em] text-white/15 sm:text-[10vw]">
          SAMPLE
        </div>
      </div>
      <div className="relative mb-12 grid gap-10 sm:mb-16 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <svg viewBox="0 0 100 88" className="h-6 w-6">
              <path d="M50 10 L92 82 H8 Z" fill="none" stroke="#fff" strokeWidth="11" strokeLinejoin="round" />
            </svg>
            <span className="font-display text-2xl font-black tracking-[0.14em]">Aether</span>
          </div>
          <p className="max-w-md font-jp text-[13px] leading-relaxed text-white/60">
            A creative studio built on Unreal Engine — crafting immersive,
            experiential entertainment unlike anything before.
          </p>
          <p className="mt-3 max-w-md font-mono text-[11px] text-white/40">
            Pioneering immersive experiences and unprecedented entertainment like no other.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 font-mono text-[12px] md:grid-cols-3">
          <div className="flex flex-col gap-3">
            {['Top', 'News', 'Works'].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-white/75 hover:text-white">
                {l}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {['About', 'stella', 'Contact'].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-white/75 hover:text-white">
                {l}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <a href="#contact" className="text-white/75 hover:text-white">Instagram ↗</a>
            <a href="#contact" className="text-white/75 hover:text-white">Recruit ↗</a>
            <div className="flex flex-col gap-2 text-white/45">
              <span>Language</span>
              <span>
                <span className="text-white">English</span> | JP
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[10px] text-white/40 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-6">
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
          <span>© Aether Inc.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-white/25" />
          <span>Built with realtime 3D</span>
        </div>
      </div>
    </footer>
  )
}
