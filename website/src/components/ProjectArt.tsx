const src: Record<string, string> = {
  kizuna: '/images/kizuna.jpg',
  weargo: '/images/weargo.jpg',
  discoat: '/images/discoat.jpg',
  matsusaka: '/images/matsusaka.jpg',
  shinsekai: '/images/shinsekai.jpg',
  stella: '/images/stella.jpg',
  fortnite: '/images/fortnite.jpg',
  unreal: '/images/unreal.jpg',
}

/** High-quality stock project stills (Unsplash, free licence) */
export function ProjectArt({ kind }: { kind: string }) {
  return (
    <img
      src={src[kind] ?? src.unreal}
      alt=""
      draggable={false}
      className="h-full w-full object-cover"
      style={{
        filter: 'saturate(1.15) contrast(1.05)',
      }}
      loading="lazy"
    />
  )
}
