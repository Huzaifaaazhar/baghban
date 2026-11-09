import type { CharacterId } from '../types'
import { ALL, SONS, SPOUSE, bkey, isParent, weight } from './data'
import type {
  Act, ActKind, Bond, BondAttr, FamilyAttr, Fx, Memory, Q, SelfAttr, Sim, Tone,
} from './types'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const r1 = (n: number) => Math.round(n * 10) / 10
const uniq = <T,>(a: T[]) => Array.from(new Set(a))

export const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x))
export const getBond = (s: Sim, from: CharacterId, to: CharacterId): Bond => s.bonds[bkey(from, to)]

/** Resentment can't fall below a share of the scar; trust can't rise above what the scar allows. */
function settle(b: Bond) {
  b.scar = clamp(b.scar, 0, 60)
  b.resentment = clamp(Math.max(b.resentment, b.scar * 0.6))
  b.trust = clamp(Math.min(b.trust, 100 - b.scar * 1.2))
  b.respect = clamp(b.respect)
  b.heard = clamp(b.heard)
  b.distance = clamp(Math.max(b.distance, b.scar * 0.5))
  for (const k of ['trust', 'respect', 'resentment', 'heard', 'distance', 'scar'] as const) b[k] = r1(b[k])
}
function bump(s: Sim, from: CharacterId, to: CharacterId, d: Partial<Record<BondAttr | 'scar', number>>) {
  const b = getBond(s, from, to)
  for (const [k, v] of Object.entries(d)) b[k as keyof Bond] += v as number
  settle(b)
}
function bumpSelf(s: Sim, c: CharacterId, d: Partial<Record<SelfAttr, number>>) {
  for (const [k, v] of Object.entries(d)) s.self[c][k as SelfAttr] = r1(clamp(s.self[c][k as SelfAttr] + (v as number)))
}

/* ------------------------------------------------------------------ */
/* how acts are appraised                                              */
/* ------------------------------------------------------------------ */
const BASE: Record<ActKind, { h: number; w: number }> = {
  request: { h: 0.26, w: 0 }, refuse: { h: 0.34, w: 0 }, dismiss: { h: 0.5, w: 0 }, deflect: { h: 0.22, w: 0 },
  accuse: { h: 0.62, w: 0 }, shame: { h: 0.9, w: 0 }, guilt: { h: 0.62, w: 0 }, impose: { h: 0.52, w: 0 },
  intrude: { h: 0.58, w: 0 }, withhold: { h: 0.14, w: 0 }, absorb: { h: 0, w: 0 },
  concede: { h: 0, w: 0.4 }, compromise: { h: 0, w: 0.55 }, offer: { h: 0, w: 0.55 }, listen: { h: 0, w: 0.5 },
  confide: { h: 0, w: 0.6 }, support: { h: 0, w: 0.5 }, defend: { h: 0, w: 0.45 }, thank: { h: 0, w: 0.45 },
  apologize: { h: 0, w: 0 },
}
export const HURTFUL: ActKind[] = ['request', 'refuse', 'dismiss', 'deflect', 'accuse', 'shame', 'guilt', 'impose', 'intrude', 'withhold']
const WARM: ActKind[] = ['concede', 'compromise', 'offer', 'listen', 'confide', 'support', 'defend', 'thank']
const toneH: Record<Tone, number> = { warm: 0.5, gentle: 0.65, neutral: 1, blunt: 1.3, harsh: 1.7 }
const toneW: Record<Tone, number> = { warm: 1.25, gentle: 1, neutral: 0.85, blunt: 0.55, harsh: 0.3 }

export interface Appraisal { felt: number; warm: number; blame: number }

export function knows(s: Sim, c: CharacterId, info: string) { return (s.knowledge[c] ?? []).includes(info) }

function openRepeats(s: Sim, actor: CharacterId, target: CharacterId, concern?: string) {
  return s.memory.filter((m) => m.actor === actor && m.target === target && !m.resolved && HURTFUL.includes(m.k) && m.felt >= 0.2 && (!concern || m.c === concern)).length
}

/** Pure appraisal: how hard does this land, how warm is it, and who is to blame? */
export function appraise(s: Sim, a: Act): Appraisal {
  const base = BASE[a.k]
  const tone = a.tone ?? 'neutral'
  const target = s.self[a.to]
  const vuln = 1 + Math.max(0, 50 - target.security) / 100
  const wT = a.c ? weight(a.to, a.c) : 0.5
  const concernMul = 0.6 + 0.8 * wT

  // whose need is heavier? only when the actor is acting from a need of their own
  let needMul = 1
  if (a.own) {
    const own = a.need ?? 0.5
    const theirs = wT
    const L = own - theirs
    needMul = L > 0 ? 1 - 0.35 * Math.min(1, L) : 1 + 0.35 * Math.min(1, -L)
  }
  const agrMul = a.agr === 'enforce' ? 0.55 : a.agr === 'break' ? 1.4 : 1
  const repeats = openRepeats(s, a.by, a.to, a.c)
  const histMul = 1 + 0.28 * Math.min(4, repeats)
  const recip = openRepeats(s, a.to, a.by, a.c)
  const recipMul = 1 - 0.12 * Math.min(3, recip) // they have done the same to you — your complaint is fairer
  const gw = s.goodwill[bkey(a.by, a.to)] ?? 0
  const gwMul = 1 - Math.min(0.35, 0.07 * gw)

  let felt = base.h * toneH[tone]
    * (a.why ? 0.8 : 1) * (a.alt ? 0.7 : 1) * (a.hear ? 0.8 : 1) * (a.pub?.length ? 1.4 : 1)
    * concernMul * needMul * vuln * histMul * recipMul * gwMul * agrMul * (a.sev ?? 1)
  if (base.h === 0) felt = 0
  felt = r1(clamp(felt * 100, 0, 100)) / 100

  let warm = base.w * toneW[tone]
  if (a.k === 'request' || a.k === 'refuse') warm += (a.alt ? 0.12 : 0) + (a.hear ? 0.08 : 0)
  if (WARM.includes(a.k) && a.alt) warm *= 1.1
  warm = r1(warm * 100) / 100

  let blame = felt
  if (a.unk) blame *= knows(s, a.by, a.unk) ? 1.2 : 0.55
  if (a.own && (a.need ?? 0.5) > wT) blame *= 0.8
  blame = r1(blame * 100) / 100
  return { felt, warm, blame }
}

/* ------------------------------------------------------------------ */
/* applying an act                                                     */
/* ------------------------------------------------------------------ */
export function applyAct(s: Sim, a: Act, scenario: string): Appraisal {
  if (a.k === 'apologize') return applyApology(s, a, scenario)
  const ap = appraise(s, a)
  const { felt, warm } = ap
  const toneIsHarsh = a.tone === 'harsh' || a.tone === 'blunt'
  const gain = 1 + 0.08 * Math.min(5, s.goodwill[bkey(a.by, a.to)] ?? 0)

  if (a.k === 'absorb') {
    const need = a.need ?? 0.5
    bump(s, a.by, a.to, { resentment: 6 * need * (1 - getBond(s, a.by, a.to).resentment / 140), heard: -3 * need })
    bumpSelf(s, a.by, { security: -2 * need })
    raiseIssue(s, { id: `${a.by}~${a.to}~${a.c ?? 'general'}~unvoiced`, a: a.by, b: a.to, concern: a.c ?? 'honesty', sev: 0.3 * need + 0.1, text: a.n })
  } else {
    // the target's feelings about the actor
    bump(s, a.to, a.by, {
      trust: -13 * felt + 9 * warm * gain,
      respect: -(toneIsHarsh ? 8 : 4) * felt + 4 * warm + (a.alt ? 2 : 0),
      resentment: 14 * felt - 8 * warm,
      heard: -(a.hear ? 6 : 14) * felt + 10 * warm * (a.k === 'listen' ? 1.3 : 1),
      distance: 10 * felt - 8 * warm,
      scar: felt >= 0.75 ? (felt - 0.5) * 28 : 0,
    })
    bumpSelf(s, a.to, {
      security: -9 * felt + 5 * warm + (a.k === 'listen' || a.k === 'confide' ? 3 : 0),
      compromise: -8 * felt * (a.hear ? 0.6 : 1) + 7 * warm,
      independence: a.k === 'impose' || a.k === 'intrude' ? -7 * felt : a.k === 'refuse' || a.k === 'request' ? -2 * felt : 0,
    })
    // the actor
    if ((a.k === 'request' || a.k === 'refuse') && (a.own === 'privacy' || a.own === 'autonomy' || a.own === 'sleep' || a.own === 'routine') && felt < 0.6) {
      bumpSelf(s, a.by, { independence: 3 })
    }
    if (felt > 0.7) bumpSelf(s, a.by, { security: -3 })
    if (a.k === 'concede' || a.k === 'compromise') bumpSelf(s, a.by, { compromise: 3 })
    if (a.k === 'refuse' && !a.alt) bumpSelf(s, a.by, { compromise: -1.5 })
    // bystanders and loyalty
    const ally = SPOUSE[a.to]
    if (ally && ally !== a.by && felt > 0) bump(s, ally, a.by, { trust: -5 * felt, resentment: 6 * felt })
    if (ally && ally !== a.by && warm > 0) bump(s, ally, a.by, { trust: 2 * warm })
    for (const w of a.pub ?? []) {
      if (w === a.by || w === a.to) continue
      if (felt > 0.5) { bump(s, w, a.by, { respect: -6 * felt, resentment: 3 * felt }); bump(s, w, a.to, { trust: 2 }) }
      else if (warm > 0.4) bump(s, w, a.by, { respect: 2 })
    }
    if (a.k === 'defend' && a.vs) {
      const fv = 0.38 * toneH[a.tone ?? 'neutral']
      bump(s, a.vs, a.by, { trust: -5 * fv, respect: -3 * fv, resentment: 9 * fv, distance: 4 * fv })
    }
    if (warm > 0) {
      const k = bkey(a.by, a.to)
      s.goodwill[k] = r1(Math.min(6, (s.goodwill[k] ?? 0) + warm * (a.k === 'compromise' || a.k === 'concede' ? 1.8 : 1.2)))
    }
    if (a.k === 'listen' || a.k === 'confide') s.comm += 1.5
    else if (a.hear) s.comm += 0.5
    if (HURTFUL.includes(a.k) && !a.hear && !a.why && felt >= 0.35) s.comm -= 0.8

    // grievances
    if (HURTFUL.includes(a.k) && felt >= 0.35) {
      raiseIssue(s, { id: `${a.to}~${a.by}~${a.c ?? 'general'}`, a: a.to, b: a.by, concern: a.c ?? 'dignity', sev: Math.min(1, felt * 0.8), text: a.n })
    }
    if (WARM.includes(a.k) && a.c) resolveBy(s, a.by, a.to, a.c, warm * 0.9)
  }

  const mem: Memory = {
    id: `${s.t}:${s.memory.length}`, t: s.t, scenario, actor: a.by, target: a.to, k: a.k, c: a.c, n: a.n,
    felt, warm, blame: ap.blame, tone: a.tone ?? 'neutral', pub: !!a.pub?.length, resolved: false, unk: a.unk,
  }
  if (a.k === 'absorb') mem.resolved = false
  s.memory.push(mem)
  return ap
}

function raiseIssue(s: Sim, i: { id: string; a: CharacterId; b: CharacterId; concern: Act['c'] & string; sev: number; text: string }) {
  const ex = s.issues.find((x) => x.id === i.id)
  if (ex) { ex.sev = r1(Math.min(1, ex.sev + i.sev * 0.8)); ex.open = true; ex.text = i.text }
  else s.issues.push({ ...i, sev: r1(i.sev), open: true, since: s.t })
}

function resolveBy(s: Sim, by: CharacterId, to: CharacterId, concern: string, amount: number) {
  for (const i of s.issues) {
    if (!i.open || i.concern !== concern) continue
    if (!((i.a === by && i.b === to) || (i.a === to && i.b === by))) continue
    i.sev = r1(i.sev - amount)
    if (i.sev <= 0.12) closeIssue(s, i.id)
  }
}
function closeIssue(s: Sim, id: string) {
  const i = s.issues.find((x) => x.id === id)
  if (!i || !i.open) return
  i.open = false; i.sev = 0
  for (const m of s.memory) {
    if (m.resolved || m.c !== i.concern) continue
    if ((m.actor === i.b && m.target === i.a) || (m.actor === i.a && m.target === i.b)) m.resolved = true
  }
}

function applyApology(s: Sim, a: Act, scenario: string): Appraisal {
  const ap = a.apology ?? {}
  const q = (ap.own ? 0.25 : 0) + (ap.spec ? 0.25 : 0) + (ap.nobut ? 0.25 : 0) + (ap.change ? 0.25 : 0)
  const key = bkey(a.by, a.to)
  const n = s.apologies[key] ?? 0
  s.apologies[key] = n + 1
  const eff = q * Math.pow(0.7, n)
  const b = getBond(s, a.to, a.by)
  if (q < 0.5) {
    // "sorry you feel that way": a non-apology lands as another dismissal
    const felt = 0.3 * (1 - q)
    bump(s, a.to, a.by, { trust: -4 * felt * 10 / 10, resentment: 8 * felt, heard: -6 * felt })
  } else {
    bump(s, a.to, a.by, {
      scar: -(b.scar * 0.5 * eff + 2 * eff), resentment: -16 * eff, trust: 10 * eff, heard: 8 * eff, distance: -8 * eff, respect: 5 * eff,
    })
    bumpSelf(s, a.to, { security: 4 * eff, compromise: 5 * eff })
    bumpSelf(s, a.by, { security: 2 * eff })
    const concern = ap.for ?? a.c
    for (const i of s.issues) {
      if (!i.open || (concern && i.concern !== concern)) continue
      if (!((i.a === a.to && i.b === a.by) || (i.a === a.by && i.b === a.to))) continue
      i.sev = r1(i.sev - 0.6 * eff)
      if (i.sev <= 0.12) closeIssue(s, i.id)
    }
    s.goodwill[key] = r1(Math.min(6, (s.goodwill[key] ?? 0) + eff * 2))
    s.comm += 1.2 * eff
  }
  s.memory.push({
    id: `${s.t}:${s.memory.length}`, t: s.t, scenario, actor: a.by, target: a.to, k: 'apologize', c: a.c, n: a.n,
    felt: 0, warm: r1(eff), blame: 0, tone: a.tone ?? 'gentle', pub: false, resolved: true,
  })
  return { felt: 0, warm: eff, blame: 0 }
}

/* ------------------------------------------------------------------ */
/* other effects                                                       */
/* ------------------------------------------------------------------ */
export function learn(s: Sim, c: CharacterId, info: string): string[] {
  s.knowledge[c] = uniq([...(s.knowledge[c] ?? []), info])
  // anyone who acted in ignorance of this now has their memory reframed
  const reframed: string[] = []
  for (const m of s.memory) if (m.unk === info && m.actor === c && !m.reframed) { m.reframed = true; reframed.push(m.id) }
  return reframed
}
export function insight(s: Sim, info: string): string[] {
  if (!s.insights.includes(info)) s.insights.push(info)
  const reframed: string[] = []
  for (const m of s.memory) if (m.unk === info && !m.reframed) { m.reframed = true; reframed.push(m.id) }
  return reframed
}

export function applyFx(s: Sim, fx: Fx, scenario: string): void {
  switch (fx.t) {
    case 'bond': bump(s, fx.a, fx.b, fx.d); break
    case 'self': bumpSelf(s, fx.c, fx.d); break
    case 'flag': if (!s.flags.includes(fx.f)) s.flags.push(fx.f); break
    case 'unflag': s.flags = s.flags.filter((f) => f !== fx.f); break
    case 'fact': s.facts[fx.k] = fx.v; break
    case 'learn': learn(s, fx.c, fx.info); break
    case 'insight': insight(s, fx.info); break
    case 'agree': {
      s.agreements = s.agreements.filter((g) => g.id !== fx.id)
      s.agreements.push({ id: fx.id, between: fx.between, text: fx.text, active: true, brokenBy: [], t: s.t })
      break
    }
    case 'break': {
      const g = s.agreements.find((x) => x.id === fx.id)
      if (g) { g.brokenBy = uniq([...g.brokenBy, fx.by]) }
      break
    }
    case 'issue': raiseIssue(s, { id: fx.id, a: fx.a, b: fx.b, concern: fx.concern, sev: fx.sev, text: fx.text }); break
    case 'resolve': closeIssue(s, fx.id); break
    case 'load': s.load[fx.c] = clamp((s.load[fx.c] ?? 0) + fx.d, 0, 100); break
    case 'comm': s.comm += fx.d; break
    case 'attend': {
      const willing = SONS.filter((c) => {
        const r = getBond(s, c, 'raj'), p = getBond(s, c, 'pooja')
        return r.resentment + p.resentment < 52 && Math.max(r.distance, p.distance) < 56 && s.self[c].security > 30
      }).length
      s.facts['gather_attendance'] = Math.max(0, Math.min(3, willing + (fx.d ?? 0))) / 3
      break
    }
    case 'later':
      s.pending.push({ id: `${scenario}:${fx.id}`, due: s.t + fx.in, fx: fx.fx, echo: fx.echo, ifFlag: fx.ifFlag, unlessFlag: fx.unlessFlag })
      break
  }
}

/* ------------------------------------------------------------------ */
/* time                                                                */
/* ------------------------------------------------------------------ */
export interface Echo { speaker: CharacterId | 'narrator'; text: string }

/** Advance one chapter: unresolved things fester, scars fade slowly, goodwill is spent. */
export function tick(s: Sim): void {
  s.t += 1
  for (const i of s.issues) {
    if (!i.open) continue
    bump(s, i.a, i.b, { resentment: 2.4 * i.sev, distance: 1.4 * i.sev, heard: -0.9 * i.sev })
  }
  for (const b of Object.values(s.bonds)) {
    b.resentment = clamp(b.resentment - 1.2)
    b.scar = r1(b.scar * 0.94)
    settle(b)
  }
  for (const k of Object.keys(s.goodwill)) s.goodwill[k] = r1(s.goodwill[k] * 0.85)
  for (const c of ALL) bumpSelf(s, c, { security: (50 - s.self[c].security) * 0.03 })
}

/** Fire delayed consequences that have come due. Returns what the player should be told. */
export function firePending(s: Sim): Echo[] {
  const out: Echo[] = []
  for (const p of s.pending) {
    if (p.fired || p.due > s.t) continue
    p.fired = true
    if (p.ifFlag && !s.flags.includes(p.ifFlag)) continue
    if (p.unlessFlag && s.flags.includes(p.unlessFlag)) continue
    for (const f of p.fx) applyFx(s, f, 'later')
    if (p.echo) out.push(...p.echo)
  }
  return out
}

/* ------------------------------------------------------------------ */
/* derived views                                                       */
/* ------------------------------------------------------------------ */
const FAMILY = ALL.filter((c) => c !== 'alok')
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

function familyBonds(s: Sim): Bond[] {
  const out: Bond[] = []
  for (const a of FAMILY) for (const b of FAMILY) if (a !== b) out.push(getBond(s, a, b))
  return out
}

export function family(s: Sim): Record<FamilyAttr, number> {
  const bs = familyBonds(s)
  const trust = avg(bs.map((b) => b.trust))
  const dist = avg(bs.map((b) => b.distance))
  const res = avg(bs.map((b) => b.resentment))
  const heard = avg(bs.map((b) => b.heard))
  const gather = typeof s.facts['gather_attendance'] === 'number' ? (s.facts['gather_attendance'] as number) : 0.5
  const cross: Bond[] = []
  for (const p of ['raj', 'pooja'] as const) for (const c of SONS) { cross.push(getBond(s, p, c), getBond(s, c, p)) }
  const unvoiced = s.issues.filter((i) => i.open && i.id.endsWith('unvoiced')).length
  const sevSum = s.issues.filter((i) => i.open).reduce((a, i) => a + i.sev, 0)
  const loads = ['vikram', 'rohan', 'kabir', 'meera', 'simran', 'ananya'].map((c) => s.load[c] ?? 0)
  const total = loads.reduce((a, b) => a + b, 0) || 1
  const maxShare = Math.max(...loads) / total
  const sec = avg(FAMILY.map((c) => s.self[c].security))
  const fin = avg(FAMILY.map((c) => s.self[c].finStress))
  return {
    cohesion: r1(clamp(0.5 * trust + 0.3 * (100 - dist) + 0.2 * (100 - res) + (gather - 0.5) * 10)),
    communication: r1(clamp(0.6 * heard + 14 + 0.9 * Math.max(-15, Math.min(30, s.comm)) - Math.min(20, 3 * unvoiced))),
    mutualRespect: r1(clamp(avg(cross.map((b) => b.respect)))),
    unresolved: r1(clamp(sevSum * 15 + res * 0.5)),
    sharedResp: r1(clamp(100 - (maxShare - 1 / 6) * 130)),
    wellbeing: r1(clamp(0.6 * sec + 0.4 * (100 - fin))),
  }
}

export function charView(s: Sim, c: CharacterId) {
  const out = ALL.filter((x) => x !== c).map((x) => getBond(s, c, x))
  return {
    trust: r1(avg(out.map((b) => b.trust))),
    respect: r1(avg(out.map((b) => b.respect))),
    resentment: r1(avg(out.map((b) => b.resentment))),
    heard: r1(avg(out.map((b) => b.heard))),
    distance: r1(avg(out.map((b) => b.distance))),
    ...s.self[c],
  }
}

export function snapshot(s: Sim, scenario: string) {
  s.history.push({ t: s.t, scenario, fam: family(s) })
}

/* ------------------------------------------------------------------ */
/* query facade                                                        */
/* ------------------------------------------------------------------ */
export function makeQ(sim: Sim): Q {
  return {
    sim,
    bond: (a, b, attr) => getBond(sim, a, b)[attr],
    self: (c, attr) => sim.self[c][attr],
    fam: (attr) => family(sim)[attr],
    flag: (f) => sim.flags.includes(f),
    fact: (k) => sim.facts[k],
    knows: (c, info) => knows(sim, c, info),
    insight: (info) => sim.insights.includes(info),
    count: (f) => sim.memory.filter((m) =>
      (!f.actor || m.actor === f.actor) && (!f.target || m.target === f.target) &&
      (!f.kind || (Array.isArray(f.kind) ? f.kind.includes(m.k) : m.k === f.kind)) &&
      (!f.concern || m.c === f.concern) && (!f.scenario || m.scenario === f.scenario) &&
      (!f.open || !m.resolved)).length,
    scar: (a, b) => getBond(sim, a, b).scar,
    issue: (id) => sim.issues.some((i) => i.id === id && i.open),
    agreed: (id) => sim.agreements.some((g) => g.id === id && g.active),
    broken: (id) => !!sim.agreements.find((g) => g.id === id)?.brokenBy.length,
    load: (c) => sim.load[c] ?? 0,
  }
}

export { isParent }
