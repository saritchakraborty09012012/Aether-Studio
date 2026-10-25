export type Project = {
  id: string
  date: string
  title: string
  subtitle: string
  yellowNote?: string
  tags: string[]
  art: 'kizuna' | 'weargo' | 'discoat' | 'matsusaka' | 'shinsekai' | 'stella' | 'fortnite' | 'unreal'
  hue: string
}

export const works: Project[] = [
  {
    id: 'kizuna',
    date: '2021.02.14',
    title: 'KizunaAI "Hello, Fortnite"',
    subtitle: 'KizunaAI "Hello, Fortnite" Special Map',
    yellowNote: 'KizunaAI × Fortnite special collaboration map',
    tags: ['unreal5', 'worlds_engine', 'advertisement', 'movie'],
    art: 'kizuna',
    hue: '#ff5fa2',
  },
  {
    id: 'weargo',
    date: '2026.01.10',
    title: 'WEAR GO LAND',
    subtitle: 'WEAR GO LAND, "Fortnite"',
    yellowNote: 'A virtual amusement park built inside Fortnite',
    tags: ['unreal5', 'worlds_engine', 'advertisement', 'movie'],
    art: 'weargo',
    hue: '#ff7ad9',
  },
  {
    id: 'discoat',
    date: '2020.09.26',
    title: 'DISCOAT 2020 SS EXHIBITION',
    subtitle: 'DISCOAT 2020 SS EXHIBITION in virtual',
    yellowNote: 'A photoreal virtual fashion exhibition space',
    tags: ['entertainment', 'unrealengine', '3d-advertisement', 'cloud-rendering'],
    art: 'discoat',
    hue: '#ff3b3b',
  },
  {
    id: 'matsusaka',
    date: '2020.07.02',
    title: 'Matsusaka Samba II "Rise Up the World"',
    subtitle: 'Matsusaka Samba II "Rise Up the World"',
    yellowNote: 'Realtime 3DCG performance for Matsusaka Samba II',
    tags: ['entertainment', 'unrealengine', '3d-advertisement', 'cloud-rendering'],
    art: 'matsusaka',
    hue: '#ffb02e',
  },
  {
    id: 'shinsekai',
    date: '2021.07.14',
    title: 'RADWIMPS ROLE PLAYING MUSIC',
    subtitle: 'SHIN SEKAI "worldside" RADWIMPS ROLE PLAYING MUSIC',
    yellowNote: 'Spatial audio × realtime 3DCG in-game concert',
    tags: ['entertainment', 'unreal_engine', 'mobile', 'in-game-concert'],
    art: 'shinsekai',
    hue: '#5ee7ff',
  },
  {
    id: 'stellla',
    date: '2025.03.28',
    title: 'stellla',
    subtitle: 'stellla — immersive music experience',
    yellowNote: 'A live experience where music and sky dissolve into one',
    tags: ['unreal5', 'live-visual', 'music', 'realtime'],
    art: 'stella',
    hue: '#ffc9ea',
  },
]

export const news = [
  {
    date: '2024.04.12',
    text: 'We will be speaking at Unreal Fest Hokkaido 2024.',
  },
  {
    date: '2024.04.04',
    text: 'Opened "PEAK GO LAND" — a photoreal virtual amusement park of illusion and fantasy.',
  },
  {
    date: '2024.03.15',
    text: 'Announced "Theme PARK LIVE" — a spatial-audio × realtime 3DCG live attraction.',
  },
]

export const aboutLines = [
  'Creating unprecedented immersive experiences',
  'as experiential entertainment',
  'for the world.',
]

export const aboutEn =
  'Pioneering immersive experiences\nand unprecedented entertainment\nlike no other'

export const visionLines = [
  'We create worlds that stir the heart',
  'and inspire hope.',
]

export const visionEn = 'Architect worlds that move hearts and spark hope.'
