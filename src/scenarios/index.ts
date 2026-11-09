import type { CharacterId, StoryScene } from '../types'
import { SPOUSE_OF } from '../sim/seed'
import type { Sim } from '../sim/types'
import { compile, type Ctx, type LensKey, type ScenarioBody, type ScenarioDef } from './kit'
import { S01 } from './s01'
import { S02 } from './s02'
import { S03 } from './s03'
import { S04 } from './s04'
import { S05 } from './s05'
import { S06 } from './s06'
import { S07 } from './s07'
import { S08 } from './s08'
import { S09 } from './s09'
import { S10 } from './s10'
import { S11 } from './s11'
import { S12 } from './s12'
import { S13 } from './s13'
import { S14 } from './s14'
import { S15 } from './s15'

export const SCENARIOS: ScenarioDef[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15]

/** Everything a scenario needs to know about this playthrough, taken from the simulation. */
export function ctxFromSim(sim: Sim): Ctx {
  const persona = (sim.facts.persona as Ctx['persona']) ?? 'vikram'
  const H = (sim.facts.host as CharacterId) ?? 'vikram'
  const S = (sim.facts.son as CharacterId) ?? H
  const sons: CharacterId[] = ['vikram', 'rohan', 'kabir']
  const carer = sons.reduce((best, c) => ((sim.load[c] ?? 0) > (sim.load[best] ?? 0) ? c : best), 'rohan' as CharacterId)
  return { persona, H, HW: SPOUSE_OF[H]!, S, SW: SPOUSE_OF[S]!, carer, living: String(sim.facts.living ?? 'host') }
}

const cache = new Map<string, StoryScene>()
export function getScenarioScene(index: number, ctx: Ctx, lens: LensKey): StoryScene {
  const key = `${index}|${lens}|${JSON.stringify(ctx)}`
  let s = cache.get(key)
  if (!s) { s = compile(SCENARIOS[index], ctx, lens); cache.set(key, s) }
  return s
}
export function getScenarioBody(index: number, ctx: Ctx): ScenarioBody {
  return SCENARIOS[index].build(ctx)
}
