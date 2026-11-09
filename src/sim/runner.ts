import { advance, choose, visibleOptions } from '../engine/story'
import { chapterTitle, getScenarioBody, getScenarioScene } from '../scenarios'
import type { Ctx, LensKey } from '../scenarios/kit'
import type { Cursor, Option, PersonaId } from '../types'
import { applyNotice } from './runtime'
import { applyFx, clone, firePending, makeQ, snapshot, tick } from './engine'
import { enterNode, resolveOption } from './runtime'
import type { Q, Sim } from './types'

export type Chooser = (options: Option[], q: Q, info: { scenario: number; lens: LensKey; nodeId: string; who: string }) => string | { id: string; look?: string[] }

/**
 * Headless play-through of one scenario. The UI store runs exactly the same steps,
 * so anything the tests prove about the simulation is true of the game.
 */
export function runScenario(sim: Sim, index: number, ctx: Ctx, lens: LensKey, chooser: Chooser): string[] {
  const snap = clone(sim)
  const scene = getScenarioScene(index, ctx, lens, snap)
  const who = scene.who as PersonaId
  const picked: string[] = []
  let cursor: Cursor = { nodeId: scene.start, stage: 'lines', index: 0 }
  enterNode(sim, scene.nodes[cursor.nodeId], scene.id)
  for (let guard = 0; guard < 200; guard++) {
    const node = scene.nodes[cursor.nodeId]
    if (cursor.stage === 'decision') {
      const q = makeQ(sim)
      const opts = visibleOptions(node, who, q)
      const ch = chooser(opts, q, { scenario: index, lens, nodeId: node.id, who })
      const id = typeof ch === 'string' ? ch : ch.id
      if (typeof ch !== 'string') for (const n of node.notice ?? []) if (ch.look?.includes(n.id)) applyNotice(sim, n, scene.id)
      const opt = opts.find((o) => o.id === id)
      if (!opt) throw new Error(`option ${id} not offered in ${scene.id}/${lens}: [${opts.map((o) => o.id)}]`)
      picked.push(id)
      const branch = resolveOption(sim, opt, scene.id, { i: index, title: chapterTitle(index), nodeId: node.id, lens, who, offered: opts })
      const res = choose(scene, cursor, id, who, makeQ(sim))
      if (res === 'end') return picked
      cursor = { ...res, branch }
      continue
    }
    const r = advance(scene, cursor, who, makeQ(sim))
    if (r.kind === 'end') return picked
    const prev = cursor.nodeId
    cursor = r.cursor
    if (cursor.nodeId !== prev) enterNode(sim, scene.nodes[cursor.nodeId], scene.id)
  }
  throw new Error('scenario did not terminate: ' + scene.id)
}

/** Close a scenario: record a snapshot, let time pass, fire delayed consequences. */
export function closeScenario(sim: Sim, scenarioId: string, index?: number, reads: { lens: LensKey; learn: string[] }[] = []) {
  snapshot(sim, scenarioId)
  for (const r of reads) {
    for (const info of r.learn) applyFx(sim, { t: 'insight', info }, 'witness')
    if (index !== undefined) sim.reads.push({ i: index, lens: r.lens })
  }
  tick(sim)
  return firePending(sim)
}

export { applyFx, getScenarioBody }
