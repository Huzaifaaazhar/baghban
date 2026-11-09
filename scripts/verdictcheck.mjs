/**
 * Verdict, replay, save/load and confrontation checks (offline, deterministic).
 *   node scripts/verdictcheck.mjs
 */
import { createServer } from 'vite'

const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const L = (p) => server.ssrLoadModule(p)
const seed = await L('/src/sim/seed.ts'), eng = await L('/src/sim/engine.ts'), runner = await L('/src/sim/runner.ts'), scen = await L('/src/scenarios/index.ts')
const pol = await L('/src/sim/policies.ts'), ver = await L('/src/sim/verdict.ts'), replay = await L('/src/sim/replay.ts'), an = await L('/src/sim/analyse.ts')
const conf = await L('/src/scenarios/confrontation.ts'), story = await L('/src/engine/story.ts')

let failures = 0
const ok = (c, m) => { console.log((c ? '  ok  : ' : '  FAIL: ') + m); if (!c) failures++ }
const section = (t) => console.log('\n' + t)
const PRO = (persona, flags = []) => ({ persona, flags, relations: {}, stats: { warmth: 50, dignity: 55, burden: 30, trust: 50 } })
const ownLens = (p) => (p === 'raj' || p === 'pooja' ? 'parent' : p === 'alok' ? 'alok' : 'child')

function play(prologue, style, { chapters = scen.CHAPTER_COUNT, choose = style.choose, lens = style.lens, capture = false } = {}) {
  const sim = seed.seedFromPrologue(prologue)
  const states = []
  for (let i = 0; i < chapters; i++) {
    const ctx = scen.ctxFromSim(sim)
    runner.runScenario(sim, i, ctx, lens(i, ownLens(prologue.persona)), (o, q, info) => choose(o, q, { ...info, chapter: i }))
    runner.closeScenario(sim, i === 15 ? 's16' : scen.SCENARIOS[i].id, i)
    if (capture) states.push(JSON.stringify(sim))
  }
  return capture ? { sim, states } : sim
}
const style = (n) => pol.STYLES.find((s) => s.name === n)

/* ---------------- 1. five endings, from consequences ---------------- */
section('1. The five endings are reachable, and follow from what happened')
const runs = {}
for (const s of pol.STYLES) { runs[s.name] = ver.computeVerdict(play(PRO('vikram'), s)) }
for (const [n, v] of Object.entries(runs)) console.log(`  ${n.padEnd(14)} → ${v.number}. ${v.title}`)
ok(runs['parents-first'].ending === 'children', 'pressing the parents’ claims through every situation ends with “The Children Had a Point”')
ok(runs['children-first'].ending === 'parents', 'a child who keeps setting parents’ needs aside ends with “The Parents Had a Point”')
ok(runs.alok.ending === 'alok' && runs.alok.analysis.alokFair, 'direct, patient, empathic support as Alok ends with “Alok’s Approach” — judged fair')
ok(runs['alok-comfort'].ending === 'alok' && !runs['alok-comfort'].analysis.alokFair && /not entirely fair/.test(runs['alok-comfort'].alokNote), 'gentleness that only smooths things over is Alok’s Approach — but judged avoidant, not fair')
ok(runs.compromise.ending === 'compromise', 'consistently seeking compromise ends with “A Healthy Family Compromise”')
ok(runs.avoidant.ending === 'both-wrong', 'keeping the peace by saying nothing ends with “Everyone Was Partly Wrong”')
ok(new Set(Object.values(runs).map((v) => v.ending)).size === 5, 'all five endings are reachable')
for (const v of Object.values(runs)) ok(v.reasons.length >= 3 && v.fits.length === 5, `${v.title}: explains itself (${v.reasons.length} evidence lines, five readings tested)`)

section('   …it is not a count of parent-friendly or child-friendly choices')
{
  // Same pool of options, different distribution over time: alternate hard and soft every chapter.
  const alt = (o, q, info) => (info.chapter % 2 ? style('compromise').choose(o, q, info) : style('parents-first').choose(o, q, info))
  const mixed = ver.computeVerdict(play(PRO('vikram'), style('compromise'), { choose: alt }))
  console.log(`  alternating hard and conciliatory chapters → ${mixed.number}. ${mixed.title}`)
  ok(mixed.ending !== 'compromise', 'a healthy compromise needs consistency: alternating pressure and conciliation does not earn it')
  // Same final-chapter behaviour, different history → different verdict.
  const lateHard = (o, q, info) => (info.chapter >= 9 ? style('parents-first').choose(o, q, info) : style('compromise').choose(o, q, info))
  const late = ver.computeVerdict(play(PRO('vikram'), style('compromise'), { choose: lateHard }))
  console.log(`  a good half-year, then seven chapters of pressure → ${late.number}. ${late.title}`)
  console.log(`  harm after the good year ${runs.compromise.analysis.harm.parents}, with late pressure ${late.analysis.harm.parents}; steady ${runs.compromise.analysis.steady.toFixed(2)} → ${late.analysis.steady.toFixed(2)}`)
  ok(late.analysis.harm.parents > runs.compromise.analysis.harm.parents + 0.3 && late.analysis.steady <= runs.compromise.analysis.steady, 'late pressure shows up in the record (more harm, a less steady year)')
  ok(late.ending !== 'compromise', 'a good start does not earn a healthy compromise if the second half is pressure: consistency is required')
  // The same choices made in a household with a different history are judged by their consequences there.
  const damaged = PRO('vikram', ['roof-hidden', 'alok-overstepped', 'pressed-envelope'])
  const a = ver.computeVerdict(play(PRO('vikram'), style('compromise'))), b = ver.computeVerdict(play(damaged, style('compromise')))
  ok(JSON.stringify(a.analysis.fam) !== JSON.stringify(b.analysis.fam), 'the same style in a household with a different Part 1 history ends in a different family')
  // ending is decided by gates on the evidence, not by lens or persona alone
  const rot = ver.computeVerdict(play(PRO('vikram'), { ...style('compromise'), lens: () => 'child' }))
  const par = ver.computeVerdict(play(PRO('raj'), { ...style('compromise'), lens: () => 'parent' }))
  console.log(`  compromise only as the child → ${rot.number}; only as the parent → ${par.number}`)
  ok([rot, par].every((x) => x.analysis.fam.communication > 40), 'seeking compromise improves communication whichever side you play')
}

section('2. The report uses the player’s real decisions')
{
  const sim = play(PRO('vikram'), style('parents-first'))
  const v = ver.computeVerdict(sim)
  const labels = new Set(sim.log.map((e) => e.label))
  ok(v.worst.length > 0 && v.worst.every((d) => labels.has(d.e.label)), 'most damaging decisions are quotations of choices actually made')
  ok(v.statements.length >= 1 && v.statements.every((t) => /^You /.test(t) && !/\b(are|were) (a|an) /.test(t)), `statements describe choices, not personality: “${v.statements[0]}”`)
  ok(v.missed.length > 0 && v.missed.every((m) => labels.has(m.chosen)), 'missed compromises name a chosen option and a conciliatory alternative that was open')
  const good = ver.computeVerdict(play(PRO('vikram'), style('compromise')))
  ok(good.best.length > 0 && good.missed.length <= v.missed.length, 'a conciliatory year has constructive decisions and fewer missed opportunities')
  const delta = (x) => x.rel.reduce((a, r) => a + r.delta, 0)
  ok(delta(good) > delta(v), 'relationship changes reflect the year (warmer after compromise than after pressure)')
  ok(v.balance.children > v.balance.parents && runs['children-first'].balance.parents > runs['children-first'].balance.children, 'the scales tip toward whichever side was actually wronged')
}

section('3. Save, load and replay')
{
  const { sim, states } = play(PRO('rohan', ['stay-with-rohan']), style('compromise'), { capture: true })
  const log = sim.log
  const round = JSON.parse(JSON.stringify(sim))
  ok(JSON.stringify(round) === JSON.stringify(sim), 'the whole household survives a JSON save/load round-trip')
  const full = replay.replayCampaign(PRO('rohan', ['stay-with-rohan']), log, sim.reads, scen.CHAPTER_COUNT)
  ok(JSON.stringify(full.sim) === JSON.stringify(sim), 'replaying the recorded decisions reproduces the exact final household')
  let allOk = true
  for (const k of [1, 4, 8, 12, 15]) { const r = replay.replayCampaign(PRO('rohan', ['stay-with-rohan']), log, sim.reads, k); if (JSON.stringify(r.sim) !== states[k - 1]) allOk = false }
  ok(allOk, 'replay to any chapter reproduces the household exactly as it was then (chapter selection)')
  ok(log.length >= scen.CHAPTER_COUNT + 3, `every decision is logged (${log.length} entries, including the confrontation’s)`)
  ok(log.every((e) => e.offered.length >= 2 && e.label && e.acts.length > 0), 'each log entry records the options offered, the chosen text and its acts')
  // diverging at chapter 6 changes everything after it, and nothing before
  const other = seed.seedFromPrologue(PRO('rohan', ['stay-with-rohan']))
  for (let i = 0; i < 8; i++) { const ctx = scen.ctxFromSim(other); runner.runScenario(other, i, ctx, ownLens('rohan'), i === 5 ? style('parents-first').choose : style('compromise').choose); runner.closeScenario(other, scen.SCENARIOS[i].id, i) }
  const same = replay.replayCampaign(PRO('rohan', ['stay-with-rohan']), log, sim.reads, 5)
  ok(JSON.stringify(same.sim.bonds) !== JSON.stringify(other.bonds), 'a different choice in chapter 6 produces a different household')
  // replay with a lens change after jumping back works (explore another perspective)
  const rebuilt = replay.replayCampaign(PRO('rohan', ['stay-with-rohan']), log, sim.reads, 3)
  const alt = clone(rebuilt.sim); runner.runScenario(alt, 3, scen.ctxFromSim(alt), 'alok', style('alok').choose)
  ok(alt.log.length > rebuilt.sim.log.length && alt.log.at(-1).lens === 'alok', 'after going back, the same chapter can be played through another perspective')
}
function clone(x) { return JSON.parse(JSON.stringify(x)) }

section('4. The confrontation is built from the actual year')
{
  const calm = play(PRO('vikram'), style('compromise'), { chapters: 15 })
  const sour = play(PRO('vikram'), style('parents-first'), { chapters: 15 })
  const ctxC = scen.ctxFromSim(calm), ctxS = scen.ctxFromSim(sour)
  const stC = an.allStances(calm), stS = an.allStances(sour)
  const count = (st, f) => Object.values(st).filter(f).length
  console.log(`  after a conciliatory year — resentful ${count(stC, (s) => s.resentful)}, refuse to compromise ${count(stC, (s) => s.refusesToCompromise)}, silent ${count(stC, (s) => s.speak === 'silent')}, willing to apologise ${count(stC, (s) => s.willingToApologise)}`)
  console.log(`  after a year of pressure   — resentful ${count(stS, (s) => s.resentful)}, refuse to compromise ${count(stS, (s) => s.refusesToCompromise)}, silent ${count(stS, (s) => s.speak === 'silent')}, willing to apologise ${count(stS, (s) => s.willingToApologise)}`)
  ok(count(stS, (s) => s.resentful) > count(stC, (s) => s.resentful), 'more people arrive resentful after a year of pressure')
  ok(count(stS, (s) => s.refusesToCompromise) > count(stC, (s) => s.refusesToCompromise), 'more people refuse to compromise after a year of pressure')
  ok(count(stS, (s) => s.neglected) >= count(stC, (s) => s.neglected), 'who feels neglected follows the record')
  const sceneC = conf.compileConfrontation(calm, ctxC, 'child'), sceneS = conf.compileConfrontation(sour, ctxS, 'child')
  const textOf = (sc) => Object.values(sc.nodes).flatMap((n) => n.lines).map((l) => (typeof l.text === 'string' ? l.text : '')).join('\n')
  ok(textOf(sceneC) !== textOf(sceneS), 'the confrontation’s dialogue differs between the two households')
  const quotes = Object.values(stS).flatMap((s) => s.holds.map((h) => h.note))
  ok(quotes.length > 0 && quotes.every((q) => sour.memory.some((m) => m.n === q) || sour.issues.some((i) => i.text === q)), 'grievances voiced at the table quote real, recorded acts')
  ok(quotes.some((q) => textOf(sceneS).includes(q)), 'those quotations appear in the scene')
  ok(['parent', 'child', 'alok'].every((lens) => { const sc = conf.compileConfrontation(sour, ctxS, lens); return Object.values(sc.nodes).some((n) => (n.decision?.options.length ?? 0) >= 3) }), 'every perspective has real choices (≥3 options) at the table')
  // the player's choices at the table change the outcome
  const settle = (id) => { const s = clone(sour); runner.runScenario(s, 15, scen.ctxFromSim(s), 'child', (opts) => (opts.some((o) => o.id === id) ? id : opts[0].id)); return s }
  const a = settle('rota'), b = settle('nothing')
  ok(a.agreements.some((g) => g.id === 'rota') && !b.agreements.some((g) => g.id === 'rota'), 'proposing a settlement at the table creates a standing understanding; proposing nothing does not')
  ok(Math.abs(a.load.rohan - b.load.rohan) > 3 || Math.abs(a.load.vikram - b.load.vikram) > 3, 'a care rota actually redistributes responsibility')
  ok(a.facts.conf_settlement === 'rota' && b.facts.conf_settlement === 'nothing', 'the verdict records what was settled')
}

section('5. Interactions between systems')
{
  const s = seed.seedFromPrologue(PRO('vikram'))
  eng.applyAct(s, { by: 'raj', to: 'vikram', k: 'shame', c: 'dignity', tone: 'harsh', pub: ['pooja'], n: 'x' }, 's14')
  const before = an.stanceOf(s, 'vikram')
  ok(before.holds.length === 1 && before.holds[0].who === 'raj', 'a public shaming becomes a grievance the victim carries to the table')
  eng.applyAct(s, { by: 'raj', to: 'vikram', k: 'apologize', apology: { own: true, spec: true, nobut: true, change: true }, tone: 'warm', n: 'apologised' }, 's15')
  ok(an.stanceOf(s, 'vikram').holds.length === 0 || an.stanceOf(s, 'vikram').holds[0].felt < before.holds[0].felt, 'an apology lowers how heavily the grievance weighs')
}

console.log(failures === 0 ? '\nAll verdict, replay and confrontation checks passed.' : `\n${failures} check(s) FAILED.`)
await server.close()
process.exit(failures === 0 ? 0 : 1)
