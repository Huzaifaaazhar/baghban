/**
 * Layout sweep: plays a short route through the real UI at several screen sizes, screenshots every kind of screen
 * and flags horizontal page scroll, controls pushed off-screen, tiny tap targets and text clipped by its own box.
 *   node tests/e2e/layout.cjs [--viewport=phone-small|mobile|tablet|tablet-land|laptop|desktop ...] [--through=16]
 */
const path = require('path')
const { chromium } = require('playwright')
const OUT = process.env.E2E_OUT || path.join(require('os').tmpdir(), 'baghban-layout')
require('fs').mkdirSync(OUT, { recursive: true })
const VP = {
  'phone-small': { width: 360, height: 640 }, mobile: { width: 390, height: 844 }, 'phone-land': { width: 844, height: 390 },
  tablet: { width: 820, height: 1180 }, 'tablet-land': { width: 1180, height: 820 }, laptop: { width: 1280, height: 720 }, desktop: { width: 1440, height: 900 },
}
const args = process.argv.slice(2)
const names = args.filter((a) => a.startsWith('--viewport=')).map((a) => a.split('=')[1])
const todo = names.length ? names : ['phone-small', 'mobile', 'phone-land', 'tablet', 'tablet-land']
let issues = 0

;(async () => {
  const { createServer } = await import('vite')
  const root = path.resolve(__dirname, '../..')
  const dev = await createServer({ root, server: { port: 5197, strictPort: false, host: '127.0.0.1' }, logLevel: 'error' })
  await dev.listen(); const url = dev.resolvedUrls.local[0]
  const browser = await chromium.launch()
  { const w = await browser.newPage(); await w.goto(url); await w.waitForTimeout(4000); await w.reload(); await w.waitForTimeout(2000); await w.close() }

  for (const vp of todo) {
    console.log(`\n=== ${vp} ${VP[vp].width}x${VP[vp].height}`)
    const ctx = await browser.newContext({ viewport: VP[vp], reducedMotion: 'reduce', hasTouch: /phone|mobile|tablet/.test(vp), isMobile: /phone|mobile/.test(vp) })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)) })
    await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(800)

    const audit = async (tag, { scrollable = false } = {}) => {
      await page.waitForTimeout(450)
      await page.screenshot({ path: path.join(OUT, `${vp}-${tag}.png`) })
      const r = await page.evaluate(() => {
        const iw = innerWidth, ih = innerHeight
        const inScroller = (e) => { for (let a = e.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if ((o === 'auto' || o === 'scroll') && a.scrollWidth > a.clientWidth) return true } return false }
        const srOnly = (e) => { const r = e.getBoundingClientRect(); return r.width <= 2 || r.height <= 2 }
        const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 }
        const doc = { sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth }
        const offButtons = [...document.querySelectorAll('button, a, [role=button]')].filter(vis).filter((e) => !inScroller(e)).filter((e) => !/^(Walk to|Look closely)/.test(e.getAttribute('aria-label') || ''))  /* in-art doors sit in the scene, partly beyond the crop by design */.filter((e) => { const r = e.getBoundingClientRect(); return r.left < -2 || r.right > iw + 2 }).slice(0, 4).map((e) => (e.getAttribute('aria-label') || e.innerText || '').trim().slice(0, 40))
        const small = [...document.querySelectorAll('button, [role=button], input[type=checkbox]')].filter(vis).filter((e) => { const r = e.getBoundingClientRect(); return r.top < ih && r.bottom > 0 && (r.width < 30 || r.height < 30) && !e.closest('[aria-hidden=true]') && !e.closest('label') }).slice(0, 4).map((e) => `${(e.getAttribute('aria-label') || e.innerText || e.type).trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`)
        const clipped = [...document.querySelectorAll('h1,h2,h3,p,li,button,span')].filter(vis).filter((e) => { const s = getComputedStyle(e); return (s.overflow === 'hidden' || s.overflowX === 'hidden') && s.textOverflow !== 'ellipsis' && e.scrollWidth > e.clientWidth + 3 && e.clientWidth > 2 && e.clientHeight > 2 && e.children.length === 0 }).slice(0, 3).map((e) => (e.innerText || '').trim().slice(0, 40))
        // a decision panel / dialogue must not cover the whole viewport on short screens
        const opts = document.querySelector('[data-option-id]')
        let panel = null
        if (opts) { const p = opts.closest('section, div[class*="absolute"]'); const pr = (opts.parentElement?.parentElement || p).getBoundingClientRect(); panel = { top: Math.round(pr.top), h: Math.round(pr.height) } }
        return { doc, offButtons, small, clipped, panel, ih }
      })
      const bad = []
      if (r.doc.sw > r.doc.bw + 1 || r.doc.sw > innerWidthOf(r)) bad.push(`page scrolls sideways (${r.doc.sw})`)
      if (r.offButtons.length) bad.push('controls off-screen: ' + r.offButtons.join(' | '))
      if (r.small.length) bad.push('small tap targets: ' + r.small.join(' | '))
      if (r.clipped.length) bad.push('clipped text: ' + r.clipped.join(' | '))
      if (r.panel && r.panel.top < 70) bad.push(`decision panel reaches the top bar (top ${r.panel.top}px, ${r.panel.h}px tall of ${r.ih})`)
      console.log(`  ${bad.length ? 'ISSUE' : 'ok   '} ${tag}${bad.length ? ' — ' + bad.join('; ') : ''}`)
      issues += bad.length
    }
    const innerWidthOf = () => VP[vp].width

    const click = async (name, opts = {}) => { await page.getByRole('button', { name }).first().click(opts); await page.waitForTimeout(500) }

    await audit('01-opening')
    await click('Soundscape'); await audit('02-soundscape'); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    await click('Start Experience'); await audit('03-family')
    await page.locator('button[aria-label^="Meet "]').first().click(); await page.waitForTimeout(500); await audit('04-dossier')
    await page.evaluate(() => { document.querySelectorAll('.scroll-thin').forEach((e) => { e.scrollTop = e.scrollHeight }) }); await audit('04b-dossier-bottom')
    console.log('   next button rect', JSON.stringify(await page.getByRole('button', { name: /Next/ }).first().boundingBox()))
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await click('Choose whose eyes to see through'); await page.waitForTimeout(500); await audit('05-roles')
    await page.getByRole('button', { name: /The Child/ }).first().click()
    await page.getByRole('region', { name: 'Choose who you are' }).getByRole('button', { name: /Rohan/ }).first().click(); await page.waitForTimeout(400); await audit('06-persona')
    await click(/Begin: Sunday Chai/); await page.waitForTimeout(1300); await audit('07-scene-line')

    // prologue: audit the first decision panel and the thought line, then run to the end
    const drive = (stop, onDecision) => page.evaluate(async ({ stop }) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const t0 = Date.now()
      while (Date.now() - t0 < 120000) {
        if (document.body.innerText.includes(stop)) return 'found'
        const opts = [...document.querySelectorAll('button[data-option-id]')]
        if (opts.length) { await sleep(350); document.querySelector('button[data-option-id]')?.click(); await sleep(450); continue }
        const d = document.querySelector('button[aria-label="Continue"], button[aria-label="Show full line"]')
        if (d) { d.click(); await sleep(50); document.querySelector('button[aria-label="Continue"]')?.click(); await sleep(380) } else await sleep(100)
      }
      return 'timeout'
    }, { stop })
    // stop at first decision
    for (let k = 0; k < 40; k++) {
      if (await page.locator('button[data-option-id]').count()) break
      const c = page.locator('button[aria-label="Continue"], button[aria-label="Show full line"]').first()
      if (await c.count()) { await c.click(); await page.waitForTimeout(150); const c2 = page.locator('button[aria-label="Continue"]').first(); if (await c2.count()) await c2.click(); await page.waitForTimeout(300) } else await page.waitForTimeout(200)
    }
    await audit('08-decision')
    await click('Open journal'); await audit('09-journal'); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    await click('Menu'); await audit('10-menu'); await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    let r = await drive('The evening ends'); if (r !== 'found') console.log('  !! prologue did not finish')
    await page.waitForTimeout(1500); await audit('11-end-of-evening')
    await page.getByRole('dialog', { name: 'End of the evening' }).getByRole('button', { name: /Walk through the house/ }).click(); await page.waitForTimeout(900); await audit('11b-house-map')
    await page.keyboard.press('Escape'); await page.waitForTimeout(700); await audit('11c-house-explore')
    const hs = page.locator('button:has(svg)').filter({ hasText: /\S/ }); 
    await page.getByRole('button', { name: /Reflect on tonight/ }).click(); await page.waitForTimeout(900)
    await page.getByRole('dialog', { name: 'End of the evening' }).getByRole('button', { name: /Begin the year/ }).click(); await page.waitForTimeout(900)

    // chapters
    const through = 16
    for (let i = 0; i < through; i++) {
      const detail = i === 0 || i === 6 || i === 15
      await page.waitForTimeout(400)
      if (detail) await audit(`ch${String(i + 1).padStart(2, '0')}-a-brief`)
      if (detail && i === 0) { // scroll the brief to its end
        await page.evaluate(() => { const s = document.querySelector('.scroll-thin'); if (s) s.scrollTop = s.scrollHeight }); await audit('ch01-a2-brief-bottom')
      }
      await page.locator('button[aria-label^="See it as"]').nth(i % 3).click(); await page.waitForTimeout(900)
      if (detail) {
        for (let k = 0; k < 60; k++) {
          if (await page.locator('button[data-option-id]').count()) break
          const c = page.locator('button[aria-label="Continue"], button[aria-label="Show full line"]').first()
          if (await c.count()) { await c.click(); await page.waitForTimeout(120); const c2 = page.locator('button[aria-label="Continue"]').first(); if (await c2.count()) await c2.click(); await page.waitForTimeout(250) } else await page.waitForTimeout(200)
        }
        await audit(`ch${String(i + 1).padStart(2, '0')}-b-decision`)
      }
      r = await drive('What you noticed'); if (r !== 'found') { console.log('  !! chapter did not finish', i + 1); break }
      await page.waitForTimeout(700)
      if (detail) await audit(`ch${String(i + 1).padStart(2, '0')}-c-aftermath`)
      if (i === 0) {
        await click(/Through .*eyes|Read it through|through the others/i).catch(() => {})
      }
      await page.getByRole('button', { name: /The next situation|The family gathers|See the verdict/ }).click(); await page.waitForTimeout(600)
    }
    await page.waitForSelector('[data-testid="verdict"]', { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(2200)
    await audit('v1-verdict-top')
    const total = await page.evaluate(() => { const s = document.querySelector('[data-testid="verdict"]')?.closest('.overflow-y-auto') || document.querySelector('.overflow-y-auto'); return s ? [s.scrollHeight, s.clientHeight] : [0, 0] })
    const steps = Math.min(8, Math.ceil(total[0] / Math.max(1, total[1])) - 1)
    for (let k = 1; k <= steps; k++) {
      await page.evaluate((k) => { const s = document.querySelector('[data-testid="verdict"]')?.closest('.overflow-y-auto') || document.querySelector('.overflow-y-auto'); if (s) s.scrollTop = k * s.clientHeight * 0.92 }, k)
      await audit(`v${k + 1}-verdict-scroll`)
    }
    for (const [btn, tag] of [['Revisit a chapter', 'chapters'], ['Decision history', 'history'], ['The journal', 'journal2'], ['Inspect', 'inspect']]) {
      await page.evaluate(() => { const s = document.querySelector('[data-testid="verdict"]')?.closest('.overflow-y-auto') || document.querySelector('.overflow-y-auto'); if (s) s.scrollTop = s.scrollHeight })
      const b = page.getByRole('button', { name: new RegExp(btn) }).first()
      if (await b.count()) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click(); await page.waitForTimeout(600); await audit(`v-modal-${tag}`); await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
      else console.log(`  ?? no "${btn}" button`)
    }
    console.log(errors.length ? '  ISSUE console errors: ' + errors.slice(0, 3).join(' | ') : '  ok    no console errors')
    issues += errors.length
    await ctx.close()
  }
  await browser.close(); await dev.close()
  console.log(`\nscreenshots in ${OUT}\n${issues} issue(s) flagged`)
})().catch((e) => { console.error(e); process.exit(1) })
