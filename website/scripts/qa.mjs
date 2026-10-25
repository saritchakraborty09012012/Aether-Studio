import puppeteer from 'file:///D:/SARIT/NOVEXA- NoirDemons/alche works website by mimo/website/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'
import fs from 'fs'
import path from 'path'

const out = 'C:/Users/sarit/AppData/Local/Temp/opencode/aether_ref/qa'
fs.mkdirSync(out, { recursive: true })
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = 'http://127.0.0.1:5180/'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars', '--ignore-gpu-blocklist', '--enable-webgl', '--window-size=1680,1050'],
  defaultViewport: { width: 1680, height: 1050, deviceScaleFactor: 1 },
})
const page = await browser.newPage()
const logs = []
page.on('pageerror', e => logs.push('PAGEERROR ' + e.message))
page.on('console', m => { if (['error','warning'].includes(m.type())) logs.push(m.type().toUpperCase() + ' ' + m.text()) })
page.on('requestfailed', r => logs.push('REQFAIL ' + r.url() + ' ' + r.failure()?.errorText))
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 90000 })
await new Promise(r => setTimeout(r, 4200))

const meta = await page.evaluate(() => ({
  title: document.title,
  desc: document.querySelector('meta[name=description]')?.content,
  scrollHeight: document.documentElement.scrollHeight,
  innerHeight: innerHeight,
  overflowX: document.documentElement.scrollWidth > innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  canvas: [...document.querySelectorAll('canvas')].map(c => ({w:c.width,h:c.height,cssw:c.clientWidth,cssh:c.clientHeight})),
  images: [...document.images].map(i => ({src: i.currentSrc.split('/').pop(), ok: i.complete && i.naturalWidth>0, w:i.naturalWidth, h:i.naturalHeight})),
  fonts: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),
  nav: [...document.querySelectorAll('header a, header button')].map(el => {const s=getComputedStyle(el);return {txt:el.textContent.trim().slice(0,20),color:s.color}}).slice(0,12),
  lenis: !!window.__lenis,
  hasH1: !!document.querySelector('h1'),
  h1: [...document.querySelectorAll('h1')].map(h=>h.textContent.trim()),
}))
console.log(JSON.stringify(meta, null, 2))
console.log('LOGS', JSON.stringify(logs, null, 2))

const sections = await page.evaluate(() => [...document.querySelectorAll('main > section')].map(s => ({id:s.id, top:s.getBoundingClientRect().top+scrollY, h:s.offsetHeight})))
console.log('SECTIONS', JSON.stringify(sections, null, 2))

const ys = [0, 700, 1600, 2400, 3300, 4300, 5300, 6200, 7400, 8500, 9800, 11000, 12500, 13800, 15000, 16200, 17200]
const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
for (const [i,y] of ys.entries()) {
  const top = Math.min(y, max)
  await page.evaluate((t) => { const l = window.__lenis; if (l) l.scrollTo(t,{immediate:true}); else scrollTo(0,t) }, top)
  await new Promise(r => setTimeout(r, 750))
  await page.screenshot({ path: path.join(out, `d${String(i).padStart(2,'0')}_${top}.png`) })
}
const state = await page.evaluate(() => ({scrollY, light: window.__light, navColor: getComputedStyle(document.querySelector('header a span')).color, bodyOverflow: getComputedStyle(document.body).overflow}))
console.log('END', JSON.stringify(state))
await browser.close()
console.log('DONE')
