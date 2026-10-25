/* Mobile / tablet visual audit via puppeteer-core + system Edge */
import puppeteer from 'puppeteer-core'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../../analysis/mobile_shots')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const BASE = 'http://localhost:5180/'

const devices = [
  { name: 'phone', width: 390, height: 844, dsf: 2 },
  { name: 'tab', width: 768, height: 1024, dsf: 2 },
]

const scrolls = [
  { name: '01_hero', y: 0 },
  { name: '02_hero_mid', y: 700 },
  { name: '03_works', y: 2200 },
  { name: '04_works_mid', y: 3600 },
  { name: '05_about', y: 7000 },
  { name: '06_services', y: 9800 },
  { name: '07_featured', y: 12500 },
  { name: '08_stella', y: 15500 },
  { name: '09_footer', y: 999999 },
]

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--window-size=390,844'],
})

for (const dev of devices) {
  const page = await browser.newPage()
  await page.setViewport({ width: dev.width, height: dev.height, deviceScaleFactor: dev.dsf, isMobile: true, hasTouch: true })
  page.on('pageerror', (e) => console.error('PAGEERROR', e.message))

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 4500))

  for (const s of scrolls) {
    await page.evaluate((y) => {
      const lenis = window.__lenis
      const top = Math.min(y, document.documentElement.scrollHeight - window.innerHeight)
      if (lenis) lenis.scrollTo(top, { immediate: true })
      else window.scrollTo(0, top)
    }, s.y)
    await new Promise((r) => setTimeout(r, 1200))
    const file = path.join(outDir, `${dev.name}_${s.name}.png`)
    await page.screenshot({ path: file })
    console.log(dev.name, s.name, 'y=', await page.evaluate(() => window.scrollY))
  }
  await page.close()
}

await browser.close()
console.log('DONE')
