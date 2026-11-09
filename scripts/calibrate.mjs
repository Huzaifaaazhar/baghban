import { createServer } from 'vite'
const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const L = (p) => server.ssrLoadModule(p)
const seed = await L('/src/sim/seed.ts'), runner = await L('/src/sim/runner.ts'), scen = await L('/src/scenarios/index.ts'), pol = await L('/src/sim/policies.ts'), ver = await L('/src/sim/verdict.ts')
const mk = (p) => seed.seedFromPrologue({ persona: p, flags: [], relations: {}, stats: { warmth: 50, dignity: 55, burden: 30, trust: 50 } })
function play(persona, style) {
  const sim = mk(persona)
  const own = persona === 'raj' || persona === 'pooja' ? 'parent' : persona === 'alok' ? 'alok' : 'child'
  for (let i = 0; i < scen.CHAPTER_COUNT; i++) {
    const ctx = scen.ctxFromSim(sim)
    runner.runScenario(sim, i, ctx, style.lens(i, own), style.choose)
    runner.closeScenario(sim, i === 15 ? 's16' : scen.SCENARIOS[i].id, i)
  }
  return sim
}
for (const persona of ['vikram', 'raj', 'alok']) for (const st of pol.STYLES) {
  const sim = play(persona, st)
  const v = ver.computeVerdict(sim), a = v.analysis
  console.log(`${persona.padEnd(7)} ${st.name.padEnd(14)} → ${String(v.number)} ${v.title.padEnd(28)} harm P${a.harm.parents}/C${a.harm.children}/A${a.alok.harm} neglect ${a.childNeglect} impose ${a.parentImposition} unmet ${a.unmet.parents}/${a.unmet.children} comm ${a.fam.communication} unres ${a.fam.unresolved} resp ${a.fam.mutualRespect} shared ${a.fam.sharedResp} well ${a.fam.wellbeing} sec ${a.parentsSecurity} ind ${a.childrenIndependence} agr ${a.agreements.active}/${a.agreements.broken} scar ${a.maxScar} steady ${a.steady.toFixed(2)} dmg ${a.damagingChapters} lensA ${a.lensShare.alok.toFixed(2)} alokW ${a.alok.warm} avoid ${a.alok.avoidShare.toFixed(2)} fair ${a.alokFair}`)
}
await server.close()
