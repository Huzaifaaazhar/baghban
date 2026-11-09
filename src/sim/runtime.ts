import type { Notice, Option, StoryNode } from '../types'
import { applyAct, applyFx, makeQ } from './engine'
import type { Act, Sim } from './types'

const asArray = <T,>(x: T | T[] | undefined): T[] => (x === undefined ? [] : Array.isArray(x) ? x : [x])

/** Things that happen as a node begins: others' acts, the lens revealing its own secrets. */
export function enterNode(sim: Sim, node: StoryNode, scenario: string): void {
  const e = node.onEnter
  if (!e) return
  const acts: Act[] = typeof e.acts === 'function' ? e.acts(makeQ(sim)) : e.acts ?? []
  for (const a of acts) applyAct(sim, a, scenario)
  for (const f of e.fx ?? []) applyFx(sim, f, scenario)
}

/** Apply a chosen option: its acts, its effects, then the simulation-chosen branch. Returns the branch index. */
export function resolveOption(sim: Sim, opt: Option, scenario: string): number | undefined {
  for (const a of asArray(opt.act)) applyAct(sim, a, scenario)
  for (const f of opt.fx ?? []) applyFx(sim, f, scenario)
  if (!opt.branches?.length) return undefined
  const q = makeQ(sim)
  const idx = opt.branches.findIndex((b) => b.when(q))
  if (idx < 0) return undefined
  const b = opt.branches[idx]
  for (const a of b.acts ?? []) applyAct(sim, a, scenario)
  for (const f of b.fx ?? []) applyFx(sim, f, scenario)
  return idx
}

export function applyNotice(sim: Sim, n: Notice, scenario: string): void {
  for (const f of n.fx ?? []) applyFx(sim, f, scenario)
}
