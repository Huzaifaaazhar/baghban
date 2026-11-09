import { ctxFromSim, getScenarioBody, CONFRONTATION_INDEX, SCENARIOS } from '../scenarios'
import type { LensKey } from '../scenarios/kit'
import { clone, firePending, type Echo } from './engine'
import { closeScenario, runScenario } from './runner'
import { seedFromPrologue, type Prologue } from './seed'
import type { LogEntry, Sim } from './types'

/**
 * Rebuild the household exactly as it was after `upto` completed chapters, by replaying the recorded decisions
 * through the same deterministic engine. This is what makes chapter selection, save/load and "explore another
 * perspective" honest: the state is always the consequence of the decisions, never a stored shortcut.
 */
export function replayCampaign(prologue: Prologue, log: LogEntry[], reads: Sim['reads'], upto: number): { sim: Sim; echoes: Echo[] } {
  const sim = seedFromPrologue(prologue)
  let echoes: Echo[] = []
  for (let i = 0; i < upto; i++) {
    const entries = log.filter((e) => e.i === i)
    if (entries.length === 0) throw new Error(`no recorded decisions for chapter ${i + 1}`)
    const lens = entries[0].lens as LensKey
    const ctx = ctxFromSim(sim)
    const base = clone(sim)
    let k = 0
    runScenario(sim, i, ctx, lens, () => { const e = entries[k++]; return { id: e.optionId, look: e.looked } })
    const learn = reads.filter((r) => r.i === i).map((r) => ({
      lens: r.lens as LensKey,
      learn: i === CONFRONTATION_INDEX ? [] : getScenarioBody(i, ctx, base).lenses[r.lens as LensKey].witnessLearn ?? [],
    }))
    echoes = closeScenario(sim, i === CONFRONTATION_INDEX ? 's16' : SCENARIOS[i].id, i, learn)
  }
  void firePending
  return { sim, echoes }
}
