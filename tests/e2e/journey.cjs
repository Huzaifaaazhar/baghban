/**
 * End-to-end player journeys in a real browser (Playwright).
 *   node tests/e2e/journey.cjs [style ...] [--viewport=desktop|laptop|tablet|mobile] [--keep]
 *
 * For each play style the test computes — in Node, from the same deterministic engine — which choices that style makes,
 * clicks exactly those choices through the UI (prologue, 15 situations, the confrontation), and then checks that the
 * ending the browser shows is the ending the *decisions* produce. Nothing is looked up from a table of outcomes.
 */
const path = require('path')
const { chromium } = require('playwright')
const OUT = process.env.E2E_OUT || path.join(require('os').tmpdir(), 'baghban-e2e')
require('fs').mkdirSync(OUT, { recursive: true })

const VIEWPORTS = { desktop: { width: 1440, height: 900 }, laptop: { width: 1280, height: 720 }, tablet: { width: 820, height: 1180 }, mobile: { width: 390, height: 844 } }
const args = process.argv.slice(2)
const vpName = (args.find((a) => a.startsWith('--viewport=')) || '--viewport=desktop').split('=')[1]
const styleNames = args.filter((a) => !a.startsWith('--'))
const START = { 'parents-first': ['The Parent', 'Raj'], 'children-first': ['The Child', 'Vikram'], alok: ['Alok', '-'], 'alok-comfort': ['Alok', '-'], compromise: ['The Child', 'Rohan'], avoidant: ['The Child', 'Kabir'] }

let failures = 0
const ok = (c, m) => { console.log((c ? '  ok  : ' : '  FAIL: ') + m); if (!c) failures++ }

;(async () => {
  const { createServer } = await import('vite')
  const root = path.resolve(__dirname, '../..')
  const ssr = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
  const L = (p) => ssr.ssrLoadModule(p)
  const seed = await L('/src/sim/seed.ts'), runner = await L('/src/sim/runner.ts'), scen = await L('/src/scenarios/index.ts'), pol = await L('/src/sim/policies.ts'), ver = await L('/src/sim/verdict.ts')
  const dev = await createServer({ root, server: { port: 5199, strictPort: false, host: '127.0.0.1' }, logLevel: 'error' })
  await dev.listen()
  const url = dev.resolvedUrls.local[0]
  const browser = await chromium.launch()
  // warm the dev server (first load optimises dependencies and reloads once)
  { const w = await browser.newPage(); await w.goto(url); await w.waitForTimeout(5000); await w.reload(); await w.waitForTimeout(2500); await w.close() }
  const results = {}

  for (const name of styleNames.length ? styleNames : pol.STYLES.map((s) => s.name)) {
    const style = pol.STYLES.find((s) => s.name === name)
    console.log(`\n▶ ${name} — ${style.describe} [${vpName}]`)
    const ctx = await browser.newContext({ viewport: VIEWPORTS[vpName], reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)) })
    await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(800)

    // ---- the opening, the family, the perspective ----
    const [role, persona] = START[name]
    await page.getByRole('button', { name: 'Start Experience' }).click()
    await page.getByRole('button', { name: 'Choose whose eyes to see through' }).click(); await page.waitForTimeout(700)
    await page.getByRole('button', { name: new RegExp(role) }).first().click()
    if (persona !== '-') await page.getByRole('region', { name: 'Choose who you are' }).getByRole('button', { name: new RegExp(persona) }).first().click()
    await page.getByRole('button', { name: /Begin: Sunday Chai/ }).click(); await page.waitForTimeout(1200)

    const drive = (stop, queue) => page.evaluate(async ({ stop, queue }) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const t0 = Date.now(); const q = [...queue]; let misses = 0
      while (Date.now() - t0 < 120000) {
        if (stop && document.body.innerText.includes(stop)) return { r: 'found' }
        const opts = [...document.querySelectorAll('button[data-option-id]')]
        if (opts.length) {
          await sleep(350)
          const want = q.length ? q[0] : null
          const cur = [...document.querySelectorAll('button[data-option-id]')]
          const b = want ? cur.find((x) => x.dataset.optionId === want) : cur[0]
          if (!b) { if (cur.length === 0) { await sleep(150); continue } misses++; if (misses > 12) return { r: 'missing-option', want, have: cur.map((x) => x.dataset.optionId) }; await sleep(200); continue }
          if (want) q.shift()
          misses = 0; b.click(); await sleep(450); continue
        }
        const d = document.querySelector('button[aria-label="Continue"], button[aria-label="Show full line"]')
        if (d) { d.click(); await sleep(50); document.querySelector('button[aria-label="Continue"]')?.click(); await sleep(380) } else await sleep(100)
      }
      return { r: 'timeout' }
    }, { stop, queue })

    let res = await drive('The evening ends', [])
    ok(res.r === 'found', 'prologue (Sunday Chai) played to its end ' + (res.r !== 'found' ? JSON.stringify(res) : ''))
    await page.waitForTimeout(1500)
    await page.getByRole('dialog', { name: 'End of the evening' }).getByRole('button', { name: /Begin the year/ }).click(); await page.waitForTimeout(700)

    // what the prologue produced, so the Node-side simulation starts from the same household
    const pro = await page.evaluate(() => { const s = window.__game.getState(); return { persona: s.persona, flags: s.flags, relations: s.relations, stats: s.stats } })

    // ---- predict this style's decisions with the engine ----
    const sim = seed.seedFromPrologue(pro)
    const own = ['raj', 'pooja'].includes(pro.persona) ? 'parent' : pro.persona === 'alok' ? 'alok' : 'child'
    const plan = []
    for (let i = 0; i < scen.CHAPTER_COUNT; i++) {
      const c = scen.ctxFromSim(sim)
      const lens = style.lens(i, own)
      const picks = runner.runScenario(sim, i, c, lens, style.choose)
      plan.push({ lens, picks })
      runner.closeScenario(sim, i === 15 ? 's16' : scen.SCENARIOS[i].id, i)
    }
    const expected = ver.computeVerdict(sim)

    // ---- play the year through the real UI ----
    const lensIdx = { parent: 0, child: 1, alok: 2 }
    let good = true
    for (let i = 0; i < plan.length; i++) {
      await page.waitForTimeout(350)
      const brief = await page.locator('button[aria-label^="See it as"]').count()
      if (brief !== 3) { good = false; ok(false, `chapter ${i + 1}: briefing with three perspectives (saw ${brief})`); break }
      await page.locator('button[aria-label^="See it as"]').nth(lensIdx[plan[i].lens]).click(); await page.waitForTimeout(500)
      res = await drive('What you noticed', plan[i].picks)
      if (res.r !== 'found') { good = false; ok(false, `chapter ${i + 1} played through (${JSON.stringify(res)})`); break }
      if (i === 7) { // save & resume in the middle of the year
        await page.waitForTimeout(500)
        await page.reload(); await page.waitForTimeout(1200)
        const back = await page.getByText('What you noticed').count()
        ok(back === 1, 'reload after chapter 8 resumes at its aftermath')
      }
      if (i === 15) { await page.screenshot({ path: path.join(OUT, `${name}-${vpName}-confrontation-aftermath.png`) }) }
      await page.waitForTimeout(300)
      await page.getByRole('button', { name: /The next situation|The family gathers|See the verdict/ }).click(); await page.waitForTimeout(500)
    }
    if (good) {
      await page.waitForSelector('[data-testid="verdict"]', { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(2200)
      const title = await page.locator('[data-testid="ending-title"]').innerText().catch(() => '')
      ok(title.includes(expected.title), `browser shows “${expected.title}” (the ending these decisions produce) — saw “${title.trim()}”`)
      results[name] = expected.ending
      const reasons = await page.locator('[data-testid="reasons"] li').count()
      ok(reasons >= 3, `the verdict explains itself with ${reasons} evidence lines`)
      const relRows = await page.locator('[data-testid="relationships"] li').count()
      ok(relRows >= 10, `relationship changes shown (${relRows} pairs)`)
      const body = await page.locator('[data-testid="verdict"]').innerText()
      const quoted = expected.best.concat(expected.worst).concat(expected.missed.map((m) => ({ e: m.e }))).map((d) => d.e.label).find((l) => body.includes(l))
      ok(!!quoted || (expected.best.length + expected.worst.length + expected.missed.length === 0), 'the report quotes the player’s actual decisions')
      ok(await page.getByText('Who was really right?').count() >= 1, 'the closing question is “Who was really right?”')
      await page.screenshot({ path: path.join(OUT, `${name}-${vpName}-verdict.png`) })
      await page.evaluate(() => window.scrollTo(0, 0))
      // revisit a chapter through the UI
      await page.getByRole('button', { name: 'Revisit a chapter' }).click(); await page.waitForTimeout(500)
      await page.getByRole('button', { name: /Chapter 1: / }).click(); await page.getByRole('button', { name: /Return to chapter 1/ }).click(); await page.waitForTimeout(900)
      ok((await page.locator('button[aria-label^="See it as"]').count()) === 3, 'chapter selection returns to chapter 1 with all three perspectives')
      const log = await page.evaluate(() => window.__game.getState().sim.log.length)
      ok(log === 0, 'going back replays the decisions up to that chapter (none before chapter 1)')
    }
    ok(errors.length === 0, 'no console or page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''))
    await ctx.close()
  }
  const distinct = new Set(Object.values(results))
  console.log('\nEndings reached:', JSON.stringify(results))
  if (Object.keys(results).length >= 4) ok(distinct.size >= 4, `different play styles reach different endings (${distinct.size} distinct)`)
  await browser.close(); await dev.close(); await ssr.close()
  console.log(failures === 0 ? '\nAll journeys passed.' : `\n${failures} check(s) FAILED.`)
  process.exit(failures === 0 ? 0 : 1)
})().catch((e) => { console.error(e); process.exit(1) })
