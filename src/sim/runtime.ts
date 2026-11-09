import { resolveText } from '../engine/story'
import type { Notice, Option, PersonaId, StoryNode } from '../types'
import { applyAct, applyFx, family, makeQ, type Appraisal } from './engine'
import type { Act, ActKind, Lens, LogAct, LogEntry, LogOffered, Sim } from './types'

const asArray = <T,>(x: T | T[] | undefined): T[] => (x === undefined ? [] : Array.isArray(x) ? x : [x])

const WARM_KINDS: ActKind[] = ['compromise', 'listen', 'apologize', 'offer', 'support', 'thank', 'confide', 'concede', 'defend']
const AVOID_KINDS: ActKind[] = ['absorb', 'withhold', 'deflect']

/** A single number for how the household is doing. Used to judge each decision's immediate effect. */
export function composite(s: Sim): number {
  const f = family(s)
  return Math.round(((f.cohesion + f.communication + f.mutualRespect + f.wellbeing + f.sharedResp + (100 - f.unresolved)) / 6) * 10) / 10
}

/** How an option reads, from what its acts actually are (never from its label). */
export function optionStyle(o: Option): LogOffered['style'] {
  const acts = asArray(o.act)
  if (acts.length === 0) return 'other'
  const rough = (a: Act) => a.tone === 'blunt' || a.tone === 'harsh'
  const kind = (a: Act): 'hard' | 'soft' | 'avoid' | 'other' => {
    if (AVOID_KINDS.includes(a.k)) return 'avoid'
    if (['accuse', 'shame', 'guilt', 'impose', 'intrude', 'dismiss'].includes(a.k)) return 'hard'
    if (a.k === 'refuse' || a.k === 'request') return rough(a) || (!a.hear && !a.alt && a.tone !== 'gentle' && a.tone !== 'warm') ? 'hard' : 'soft'
    if (a.k === 'defend') return rough(a) ? 'hard' : 'soft'
    if (WARM_KINDS.includes(a.k)) return rough(a) && a.k !== 'apologize' ? 'other' : 'soft'
    return 'other'
  }
  const ks = acts.map(kind)
  const hard = ks.filter((k) => k === 'hard').length, soft = ks.filter((k) => k === 'soft').length
  if (hard > soft) return 'hard'
  if (soft > 0) return 'soft'
  if (ks.every((k) => k === 'avoid')) return 'avoid'
  return 'other'
}

/** Things that happen as a node begins: others' acts, the lens revealing its own secrets. */
export function enterNode(sim: Sim, node: StoryNode, scenario: string): void {
  const e = node.onEnter
  if (!e) return
  const acts: Act[] = typeof e.acts === 'function' ? e.acts(makeQ(sim)) : e.acts ?? []
  for (const a of acts) applyAct(sim, a, scenario)
  for (const f of e.fx ?? []) applyFx(sim, f, scenario)
}

export interface Rec { i: number; title: string; nodeId: string; lens: Lens; who: PersonaId; offered: Option[] }

/**
 * Apply a chosen option: its acts, its effects, then the simulation-chosen branch.
 * Returns the branch index. If `rec` is given, the decision is written to the log.
 */
export function resolveOption(sim: Sim, opt: Option, scenario: string, rec?: Rec): number | undefined {
  const before = composite(sim)
  const memStart = sim.memory.length
  const logActs: LogAct[] = []
  const apply = (a: Act) => {
    const ap: Appraisal = applyAct(sim, a, scenario)
    logActs.push({ by: a.by, to: a.to, k: a.k, c: a.c, tone: a.tone, why: a.why, alt: a.alt, hear: a.hear, pub: !!a.pub?.length, n: a.n, felt: ap.felt, warm: ap.warm, blame: ap.blame })
  }
  for (const a of asArray(opt.act)) apply(a)
  for (const f of opt.fx ?? []) applyFx(sim, f, scenario)
  let idx: number | undefined
  if (opt.branches?.length) {
    const q = makeQ(sim)
    const found = opt.branches.findIndex((b) => b.when(q))
    if (found >= 0) {
      idx = found
      const b = opt.branches[found]
      for (const a of b.acts ?? []) apply(a)
      for (const f of b.fx ?? []) applyFx(sim, f, scenario)
    }
  }
  if (rec) {
    const entry: LogEntry = {
      i: rec.i, sid: scenario, title: rec.title, nodeId: rec.nodeId, lens: rec.lens, who: rec.who,
      optionId: opt.id, label: resolveText(opt.label, rec.who), style: optionStyle(opt), acts: logActs,
      offered: rec.offered.map((o) => ({ id: o.id, label: resolveText(o.label, rec.who), style: optionStyle(o) })),
      looked: sim.look.splice(0), delta: Math.round((composite(sim) - before) * 10) / 10,
      memIds: sim.memory.slice(memStart).map((m) => m.id),
    }
    sim.log.push(entry)
  }
  return idx
}

export function applyNotice(sim: Sim, n: Notice, scenario: string): void {
  for (const f of n.fx ?? []) applyFx(sim, f, scenario)
  if (!sim.look.includes(n.id)) sim.look.push(n.id)
}
