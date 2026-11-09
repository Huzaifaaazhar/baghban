/**
 * Simulation verification — runs offline, no API keys.
 *   node scripts/simcheck.mjs
 * 1. Content: every scenario × lens × persona compiles; ≥3 options; valid ids; every option plays to the end.
 * 2. Engine: memory compounding, apology fatigue, scars that do not auto-forgive, context-sensitive appraisal.
 * 3. Dynamics: full 15-situation campaigns under different play styles end in measurably different families.
 * 4. Determinism: the same choices always give the same household.
 */
import { createServer } from 'vite'

const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const L = (p) => server.ssrLoadModule(p)
const seed = await L('/src/sim/seed.ts'), eng = await L('/src/sim/engine.ts'), runner = await L('/src/sim/runner.ts')
const scen = await L('/src/scenarios/index.ts'), story = await L('/src/engine/story.ts')
const data = await L('/src/sim/data.ts'), chars = await L('/src/data/characters.ts')

let failures = 0
const ok = (c, m) => { if (!c) { failures++; console.log('  FAIL:', m) } }
const section = (t) => console.log('\n' + t)

const PERSONAS = ['raj', 'pooja', 'vikram', 'rohan', 'kabir', 'alok']
const mk = (persona, flags = [], relations = {}) => seed.seedFromPrologue({ persona, flags, relations, stats: { warmth: 50, dignity: 55, burden: 30, trust: 50 } })
const clone = eng.clone
const LENSES = ['parent', 'child', 'alok']

/* ---------------- 1. content ---------------- */
section('1. Content validation')
const optionsOf = (scene) => scene.nodes.intro.decision.options
let optionRuns = 0
const infoIds = new Set(Object.keys(data.INFO))
const checkFx = (fxs, where) => { for (const f of fxs ?? []) {
  if ((f.t === 'learn' || f.t === 'insight') && !infoIds.has(f.info)) ok(false, `${where}: unknown info ${f.info}`)
  if (f.t === 'later') checkFx(f.fx, where + '/later')
  if (f.t === 'learn' && !chars.CHARACTERS[f.c]) ok(false, `${where}: unknown char ${f.c}`)
} }
const checkLine = (l, where) => {
  if (l.speaker !== 'narrator' && l.speaker !== 'thought' && !chars.CHARACTERS[l.speaker]) ok(false, `${where}: unknown speaker ${l.speaker}`)
  if (!l.text) ok(false, `${where}: empty text`)
}
for (const persona of PERSONAS) {
  const sim = mk(persona)
  const ctx = scen.ctxFromSim(sim)
  for (let i = 0; i < scen.SCENARIOS.length; i++) {
    const def = scen.SCENARIOS[i]
    const body = scen.getScenarioBody(i, ctx)
    ok(body.background.length > 80 && body.conflict.length > 20, `${def.id}: background/conflict present`)
    ok(body.aftermath.length >= 3, `${def.id}: has an aftermath scene`)
    for (const lens of LENSES) {
      const L0 = body.lenses[lens]
      const where = `${persona}/${def.id}/${lens}`
      ok(!!chars.CHARACTERS[L0.who], `${where}: lens character exists`)
      ok(L0.options.length >= 3, `${where}: at least 3 options (${L0.options.length})`)
      ok(L0.witness.length >= 1, `${where}: witness view present`)
      L0.intro.forEach((l) => checkLine(l, where + '/intro')); L0.witness.forEach((l) => checkLine(l, where + '/witness'))
      for (const i2 of L0.reveals) ok(infoIds.has(i2), `${where}: reveals unknown ${i2}`)
      for (const i2 of L0.witnessLearn ?? []) ok(infoIds.has(i2), `${where}: witnessLearn unknown ${i2}`)
      for (const n of L0.notice ?? []) checkFx(n.fx, where + '/notice')
      for (const o of L0.options) {
        checkFx(o.fx, where + '/' + o.id)
        ;(o.response ?? []).forEach((l) => checkLine(l, where + '/' + o.id))
        for (const b of o.branches ?? []) { checkFx(b.fx, where + '/' + o.id + '/branch'); b.res.forEach((l) => checkLine(l, where + '/' + o.id + '/branch')) }
        const acts = [o.act].flat().filter(Boolean).concat((o.branches ?? []).flatMap((b) => b.acts ?? []))
        for (const a of acts) { ok(!!chars.CHARACTERS[a.by] && !!chars.CHARACTERS[a.to], `${where}/${o.id}: act character ids`); ok(!!a.n, `${where}/${o.id}: act has a memory note`) }
      }
    }
  }
}
console.log('  compiled + checked 6 personas × 15 situations × 3 lenses')

// every option of every lens, in sequence context (reached by a neutral first-option path), plays to the end
for (const persona of PERSONAS) {
  const base = mk(persona)
  const sim = clone(base)
  for (let i = 0; i < scen.SCENARIOS.length; i++) {
    const ctx = scen.ctxFromSim(sim)
    for (const lens of LENSES) {
      const probe = clone(sim)
      const scene = scen.getScenarioScene(i, ctx, lens)
      const first = story.visibleOptions(scene.nodes.intro, scene.who, eng.makeQ(runner.runScenario ? sim : sim))
      ok(first.length >= 3, `${persona}/s${i + 1}/${lens}: ≥3 options offered in-context (${first.length})`)
      for (const o of first) {
        const s2 = clone(sim)
        try { runner.runScenario(s2, i, ctx, lens, () => o.id); optionRuns++
          for (const c of data.ALL) for (const k of ['security', 'independence', 'compromise', 'finStress']) ok(Number.isFinite(s2.self[c][k]) && s2.self[c][k] >= 0 && s2.self[c][k] <= 100, `${persona}/s${i + 1}/${lens}/${o.id}: ${c}.${k} in range`)
        } catch (e) { ok(false, `${persona}/s${i + 1}/${lens}/${o.id}: ${e.message}`) }
      }
      void probe
    }
    // advance the baseline: play the first option of the persona's own role lens
    const lens = persona === 'raj' || persona === 'pooja' ? 'parent' : persona === 'alok' ? 'alok' : 'child'
    runner.runScenario(sim, i, ctx, lens, (opts) => opts[0].id)
    runner.closeScenario(sim, scen.SCENARIOS[i].id)
  }
}
console.log(`  played ${optionRuns} option×situation×lens runs to completion`)

/* ---------------- 2. engine behaviour ---------------- */
section('2. Engine behaviour')
{
  // (a) the same request is appraised differently depending on how it is made
  const a = mk('vikram'), b = mk('vikram'), g = mk('vikram')
  const req = (tone, extra = {}) => ({ by: 'vikram', to: 'raj', k: 'request', c: 'usefulness', own: 'sleep', need: 0.9, tone, unk: 'raj-insomnia', n: 'asked Raj to stop typing', ...extra })
  const blunt = eng.appraise(a, req('blunt')), gentle = eng.appraise(b, req('gentle', { why: true, alt: true, hear: true }))
  console.log(`  asking Raj to stop at midnight — blunt: hurt ${blunt.felt}; gentle+reason+alternative: hurt ${gentle.felt}`)
  ok(blunt.felt > gentle.felt * 2.5, 'blunt request lands much harder than a gentle one with an alternative')
  eng.applyAct(g, req('gentle', { why: true, alt: true, hear: true }), 't')
  ok(!g.issues.some((i) => i.open), 'a gentle, explained request with an alternative does not create a grievance')
  ok(g.bonds['raj>vikram'].respect >= a.bonds['raj>vikram'].respect, 'asking kindly is not automatically disrespect')
  // (b) a previous agreement changes the weight
  const enf = eng.appraise(mk('vikram'), req('neutral', { agr: 'enforce' })), nonEnf = eng.appraise(mk('vikram'), req('neutral'))
  ok(enf.felt < nonEnf.felt, 'enforcing an agreed rule is less hurtful than a fresh demand')
  // (c) knowing the reason matters for blame, not for how it feels
  const s = mk('vikram'); const unknowing = eng.appraise(s, req('blunt')); eng.learn(s, 'vikram', 'raj-insomnia'); const knowing = eng.appraise(s, req('blunt'))
  ok(Math.abs(unknowing.felt - knowing.felt) < 0.001 && knowing.blame > unknowing.blame * 1.5, 'knowingly harming carries more blame than unknowing harm (same hurt)')
  // (d) repeated dismissals compound
  const m = mk('vikram'); const trust = []
  for (let k = 0; k < 4; k++) { eng.applyAct(m, { by: 'vikram', to: 'raj', k: 'dismiss', c: 'dignity', tone: 'neutral', n: 'dismissed again' }, 't'); trust.push(m.bonds['raj>vikram'].trust) }
  const d1 = trust[0] - 60, d2 = trust[1] - trust[0], d3 = trust[2] - trust[1]
  console.log(`  repeated dismissals — trust drops: ${(60 - trust[0]).toFixed(1)}, ${(trust[0] - trust[1]).toFixed(1)}, ${(trust[1] - trust[2]).toFixed(1)}`)
  ok(Math.abs(d2) > Math.abs(d1) * 0.95 || (60 - trust[1]) > (60 - trust[0]) * 1.6, 'dismissing the same concern repeatedly damages trust cumulatively')
  ok(m.issues.some((i) => i.open), 'repeated dismissals leave an open grievance')
  void d3
  // (e) reasonable compromises build credit
  const c1 = mk('vikram'), c2 = mk('vikram')
  for (let k = 0; k < 3; k++) eng.applyAct(c1, { by: 'raj', to: 'vikram', k: 'compromise', c: 'sleep', alt: true, tone: 'warm', n: 'compromised' }, 't')
  const hurtNoCredit = eng.appraise(c2, { by: 'raj', to: 'vikram', k: 'refuse', c: 'sleep', tone: 'blunt', n: 'x' }).felt
  const hurtCredit = eng.appraise(c1, { by: 'raj', to: 'vikram', k: 'refuse', c: 'sleep', tone: 'blunt', n: 'x' }).felt
  console.log(`  goodwill — a blunt refusal hurts ${hurtNoCredit} with no history, ${hurtCredit} after three compromises`)
  ok(hurtCredit < hurtNoCredit && c1.bonds['vikram>raj'].trust > c2.bonds['vikram>raj'].trust, 'repeated reasonable compromises improve the relationship and cushion later friction')
  // (f) serious incidents are not automatically forgiven
  const sc = mk('vikram')
  eng.applyAct(sc, { by: 'raj', to: 'vikram', k: 'shame', c: 'dignity', tone: 'harsh', pub: ['pooja', 'alok'], n: 'shamed in public' }, 't')
  const scar0 = sc.bonds['vikram>raj'].scar
  for (let k = 0; k < 4; k++) eng.tick(sc)
  const after = sc.bonds['vikram>raj']
  console.log(`  public shaming — scar ${scar0}, after four chapters of quiet: scar ${after.scar}, resentment ${after.resentment}, trust ${after.trust}`)
  ok(scar0 > 5 && after.scar > scar0 * 0.6 && after.resentment >= after.scar * 0.6, 'a serious incident leaves a scar that time alone does not erase')
  // (g) apologies repair partially; cheap apologies do not repair; repeated ones fatigue
  const ap = (o) => ({ by: 'raj', to: 'vikram', k: 'apologize', tone: 'warm', n: 'apologised', apology: o })
  const full = clone(sc), but = clone(sc), none = clone(sc)
  eng.applyAct(full, ap({ own: true, spec: true, nobut: true, change: true }), 't')
  eng.applyAct(but, ap({ own: true, spec: true, nobut: false, change: false }), 't')
  eng.applyAct(none, ap({}), 't')
  const r = (x) => x.bonds['vikram>raj']
  console.log(`  apologies (resentment after): full ${r(full).resentment}, with a "but" ${r(but).resentment}, non-apology ${r(none).resentment}, none ${r(sc).resentment}; scar after full apology ${r(full).scar} (was ${r(sc).scar})`)
  ok(r(full).resentment < r(but).resentment && r(but).resentment < r(sc).resentment && r(none).resentment >= r(sc).resentment, 'full apology > apology with a "but" > non-apology')
  ok(r(full).scar > 0 && r(full).scar < r(sc).scar, 'even a full apology reduces the scar without erasing it')
  const again = clone(full); eng.applyAct(again, ap({ own: true, spec: true, nobut: true, change: true }), 't')
  ok((r(full).resentment - r(again).resentment) < (r(sc).resentment - r(full).resentment), 'repeating the same apology has diminishing effect')
  // (h) delayed consequences
  const dl = mk('vikram'); eng.applyFx(dl, { t: 'later', id: 'x', in: 2, fx: [{ t: 'flag', f: 'fired' }], echo: [{ speaker: 'narrator', text: 'later' }] }, 's')
  eng.tick(dl); ok(eng.firePending(dl).length === 0 && !dl.flags.includes('fired'), 'delayed consequence waits')
  eng.tick(dl); const e = eng.firePending(dl); ok(e.length === 1 && dl.flags.includes('fired'), 'delayed consequence fires when due and is reported')
  // (i) private information reframes earlier decisions
  const rf = mk('vikram'); eng.applyAct(rf, req('blunt'), 's01')
  ok(!rf.memory.at(-1).reframed, 'a blunt request made in ignorance is not yet reframed'); eng.insight(rf, 'raj-insomnia')
  ok(rf.memory.at(-1).reframed, 'learning the hidden reason reframes the earlier decision')
}

/* ---------------- 3 & 4. dynamics + determinism ---------------- */
section('3. Different decisions → different family dynamics')
const HARSH = new Set(['shame', 'guilt', 'accuse', 'dismiss', 'impose', 'intrude', 'refuse'])
const SOFT = new Set(['listen', 'confide', 'compromise', 'offer', 'support', 'thank', 'apologize', 'concede'])
const toneW = { harsh: 3, blunt: 2, neutral: 0, gentle: -1, warm: -2 }
const score = (o) => {
  const acts = [o.act].flat().filter(Boolean)
  let hard = 0, soft = 0, avoid = 0
  for (const a of acts) {
    if (HARSH.has(a.k)) hard += 2 + (toneW[a.tone ?? 'neutral'] ?? 0)
    if (SOFT.has(a.k)) soft += 2 + (a.hear ? 1 : 0) + (a.alt ? 1 : 0) + (a.apology?.own && a.apology?.nobut ? 2 : 0)
    if (a.k === 'absorb' || a.k === 'withhold' || a.k === 'deflect') avoid += 2
  }
  return { hard, soft, avoid }
}
const policies = {
  confrontational: (opts) => opts.map((o) => [o, score(o).hard - score(o).soft]).sort((a, b) => b[1] - a[1])[0][0].id,
  conciliatory: (opts) => opts.map((o) => [o, score(o).soft - score(o).hard]).sort((a, b) => b[1] - a[1])[0][0].id,
  avoidant: (opts) => opts.map((o) => [o, score(o).avoid]).sort((a, b) => b[1] - a[1])[0][0].id,
  first: (opts) => opts[0].id,
  last: (opts) => opts[opts.length - 1].id,
}
function campaign(persona, policy, lensRule = 'own') {
  const sim = mk(persona)
  const picks = []
  for (let i = 0; i < scen.SCENARIOS.length; i++) {
    const ctx = scen.ctxFromSim(sim)
    const lens = lensRule === 'own' ? (persona === 'raj' || persona === 'pooja' ? 'parent' : persona === 'alok' ? 'alok' : 'child') : LENSES[i % 3]
    picks.push(...runner.runScenario(sim, i, ctx, lens, (opts) => policy(opts)))
    runner.closeScenario(sim, scen.SCENARIOS[i].id)
  }
  return { sim, picks }
}
const rows = []
for (const [name, p] of Object.entries(policies)) {
  const { sim, picks } = campaign('vikram', p)
  const f = eng.family(sim)
  const rajV = sim.bonds['vikram>raj'], vikR = sim.bonds['raj>vikram']
  rows.push({ name, f, rajV, vikR, openIssues: sim.issues.filter((i) => i.open).length, picks: picks.join(',') })
}
console.log('  policy'.padEnd(18) + 'cohes  comm  respect unres  shared wellb | vik→raj res/trust/scar | raj→vik res/trust | open')
for (const r of rows) console.log(('  ' + r.name).padEnd(18) + [r.f.cohesion, r.f.communication, r.f.mutualRespect, r.f.unresolved, r.f.sharedResp, r.f.wellbeing].map((x) => String(x).padEnd(6)).join(' ') + ' | ' + `${r.rajV.resentment}/${r.rajV.trust}/${r.rajV.scar}`.padEnd(22) + ' | ' + `${r.vikR.resentment}/${r.vikR.trust}`.padEnd(12) + ' | ' + r.openIssues)
const by = Object.fromEntries(rows.map((r) => [r.name, r]))
ok(by.conciliatory.f.cohesion > by.confrontational.f.cohesion + 6, 'conciliatory play ends with a more cohesive family than confrontational play')
ok(by.conciliatory.f.unresolved < by.confrontational.f.unresolved - 6, 'confrontational play leaves more unresolved conflict')
ok(by.conciliatory.f.communication > by.avoidant.f.communication + 6, 'avoidance leaves communication worse than honest, conciliatory play')
ok(by.avoidant.openIssues > by.conciliatory.openIssues, 'avoidance leaves more unspoken grievances open')
ok(by.confrontational.vikR.resentment > by.conciliatory.vikR.resentment + 5, 'the same father is more resentful of a confrontational son')
ok(new Set(rows.map((r) => r.picks)).size >= 4, 'policies really took different paths through the scenarios')

section('   …and across the three perspectives (same style, different eyes)')
for (const persona of ['raj', 'vikram', 'alok']) {
  const { sim } = campaign(persona, policies.conciliatory)
  const f = eng.family(sim)
  console.log(`  ${persona.padEnd(7)} ` + Object.entries(f).map(([k, v]) => `${k} ${v}`).join(' · '))
}
const mixed = campaign('vikram', policies.conciliatory, 'rotate')
console.log('  rotating lens each situation: ' + Object.entries(eng.family(mixed.sim)).map(([k, v]) => `${k} ${v}`).join(' · '))

section('4. Determinism')
const x1 = campaign('rohan', policies.confrontational), x2 = campaign('rohan', policies.confrontational)
ok(JSON.stringify(x1.sim) === JSON.stringify(x2.sim), 'identical choices → identical household (no randomness, no external model)')
const y1 = campaign('rohan', policies.conciliatory)
ok(JSON.stringify(x1.sim) !== JSON.stringify(y1.sim), 'different choices → different household')

section('5. Interconnection (earlier choices change later situations)')
{
  // S01 agreement changes S10 lines; S02 support fact changes S07 aftermath; S08 flags change S09's NPC act.
  const A = mk('vikram'), B = mk('vikram')
  const ctx = scen.ctxFromSim(A)
  runner.runScenario(A, 0, ctx, 'child', () => 'knock-gentle')
  runner.runScenario(B, 0, ctx, 'child', () => 'absorb')
  ok(A.agreements.some((g) => g.id === 'quiet-hours') && !B.agreements.some((g) => g.id === 'quiet-hours'), 'situation 1 can create a standing agreement')
  runner.closeScenario(A, 's01'); runner.closeScenario(B, 's01'); runner.closeScenario(A, 's01'); runner.closeScenario(B, 's01')
  ok(B.flags.includes('h-snaps') && !A.flags.includes('h-snaps'), 'silently absorbing the noise produces a delayed outburst two situations later')
  const lensP = 'parent'
  const scA = scen.getScenarioScene(9, scen.ctxFromSim(A), lensP), scB = scen.getScenarioScene(9, scen.ctxFromSim(B), lensP)
  const qa = eng.makeQ(A), qb = eng.makeQ(B)
  const linesA = story.visibleLines(scA.nodes.intro.lines, 'raj', qa).map((l) => l.text).join('|')
  const linesB = story.visibleLines(scB.nodes.intro.lines, 'raj', qb).map((l) => l.text).join('|')
  ok(linesA !== linesB, 'the quiet-hours agreement changes what Raj thinks in the household-rules situation (situation 10)')
  // S06 attendance derived from bonds
  const C = mk('vikram'), D = mk('vikram')
  for (let i = 0; i < 4; i++) for (const s of ['vikram', 'rohan', 'kabir']) { eng.applyAct(D, { by: 'raj', to: s, k: 'shame', c: 'dignity', tone: 'harsh', pub: ['pooja'], n: 'x' }, 't') }
  eng.applyFx(C, { t: 'attend' }, 't'); eng.applyFx(D, { t: 'attend' }, 't')
  console.log(`  gathering attendance — undamaged family: ${C.facts.gather_attendance}, after repeated humiliations: ${D.facts.gather_attendance}`)
  ok(C.facts.gather_attendance > D.facts.gather_attendance, 'who comes to the family gathering is computed from the relationships, not authored')
}

console.log(failures === 0 ? '\nAll simulation checks passed.' : `\n${failures} check(s) FAILED.`)
await server.close()
process.exit(failures === 0 ? 0 : 1)
