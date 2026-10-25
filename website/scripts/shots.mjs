/* Visual verification shots via puppeteer-core + system Edge */
import puppeteer from 'puppeteer-core'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../../analysis/website_shots')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:5180/'

const scrolls = [
  { name: '01_hero', y: 0 },
  { name: '02_hero_mid', y: 900 },
  { name: '03_works_start', y: 2600 },
  { name: '04_works_mid', y: 4200 },
  { name: '05_works_late', y: 5600 },
  { name: '06_about', y: 8200 },
  { name: '07_services', y: 11500 },
  { name: '08_featured', y: 14500 },
  { name: '09_stella', y: 17200 },
  { name: '10_footer', y: 99999 },
]

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1680,1050'],
  defaultViewport: { width: 1680, height: 1050 },
})

const page = await browser.newPage()
page.on('pageerror', (e) => console.error('PAGEERROR', e.message))
page.on('console', (m) => {
  if (m.type() === 'error') console.error('CONSOLE', m.text())
})

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
// wait out the loader
await new Promise((r) => setTimeout(r, 4500))

for (const s of scrolls) {
  await page.evaluate((y) => {
    const lenis = window.__lenis
    const top = Math.min(y, document.documentElement.scrollHeight - window.innerHeight)
    if (lenis) lenis.scrollTo(top, { immediate: true })
    else window.scrollTo(0, top)
  }, s.y)
  await new Promise((r) => setTimeout(r, 1400))
  const file = path.join(outDir, `${s.name}.png`)
  await page.screenshot({ path: file })
  console.log('shot', s.name, 'scrollY=', await page.evaluate(() => window.scrollY))
}

await browser.close()
console.log('DONE')
