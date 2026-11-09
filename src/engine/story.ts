import type {
  CharacterId, Cursor, Line, Localized, Option, PersonaId, RoleId, StoryNode, StoryScene,
} from '../types'
import { roleOfPersona } from '../data/roles'

type Filter = (PersonaId | RoleId)[] | undefined

export function matches(persona: PersonaId, f: { for?: Filter; notFor?: Filter }): boolean {
  const role = roleOfPersona(persona)
  if (f.for && !(f.for.includes(persona) || f.for.includes(role))) return false
  if (f.notFor && (f.notFor.includes(persona) || f.notFor.includes(role))) return false
  return true
}

export function resolveText(text: Localized | undefined, persona: PersonaId): string {
  if (text === undefined) return ''
  if (typeof text === 'string') return text
  const role = roleOfPersona(persona)
  return text[persona] ?? text[role] ?? text.default ?? ''
}

export function nodeCast(node: StoryNode, persona: PersonaId): CharacterId[] {
  return typeof node.cast === 'function' ? node.cast(persona) : node.cast
}

export function visibleLines(lines: Line[], persona: PersonaId): Line[] {
  return lines.filter((l) => matches(persona, l))
}

export function visibleOptions(node: StoryNode, persona: PersonaId): Option[] {
  return (node.decision?.options ?? []).filter((o) => matches(persona, o))
}

export function linesForCursor(scene: StoryScene, cursor: Cursor, persona: PersonaId): Line[] {
  const node = scene.nodes[cursor.nodeId]
  if (!node) return []
  if (cursor.stage === 'response') {
    const opt = node.decision?.options.find((o) => o.id === cursor.choiceId)
    return visibleLines(opt?.response ?? [], persona)
  }
  return visibleLines(node.lines, persona)
}

export type AdvanceResult =
  | { kind: 'cursor'; cursor: Cursor }
  | { kind: 'end' }

/**
 * Move one step forward from the current cursor. Stages that have nothing to show for this persona
 * (e.g. a node whose lines are all addressed to someone else) are skipped automatically.
 */
export function advance(scene: StoryScene, cursor: Cursor, persona: PersonaId): AdvanceResult {
  return settle(scene, advanceRaw(scene, cursor, persona), persona)
}

export function settle(scene: StoryScene, res: AdvanceResult, persona: PersonaId): AdvanceResult {
  let r = res
  for (let guard = 0; guard < 30; guard++) {
    if (r.kind === 'end') return r
    const c = r.cursor
    if (c.stage === 'decision' || linesForCursor(scene, c, persona).length > 0) return r
    r = advanceRaw(scene, c, persona)
  }
  return r
}

function advanceRaw(scene: StoryScene, cursor: Cursor, persona: PersonaId): AdvanceResult {
  // A decision can only be resolved by choosing — a stray tap must never skip it.
  if (cursor.stage === 'decision') return { kind: 'cursor', cursor }
  const node = scene.nodes[cursor.nodeId]
  const lines = linesForCursor(scene, cursor, persona)

  if (cursor.index + 1 < lines.length) {
    return { kind: 'cursor', cursor: { ...cursor, index: cursor.index + 1 } }
  }

  if (cursor.stage === 'lines') {
    if (node.decision && visibleOptions(node, persona).length > 0) {
      return { kind: 'cursor', cursor: { nodeId: node.id, stage: 'decision', index: 0 } }
    }
    return goto(scene, node.next, node.ends)
  }

  if (cursor.stage === 'response') {
    const opt = node.decision?.options.find((o) => o.id === cursor.choiceId)
    return goto(scene, opt?.next ?? node.next, node.ends)
  }
  return { kind: 'cursor', cursor }
}

function goto(_scene: StoryScene, nodeId: string | undefined, ends?: boolean): AdvanceResult {
  if (!nodeId || ends) return { kind: 'end' }
  return { kind: 'cursor', cursor: { nodeId, stage: 'lines', index: 0 } }
}

/** Result of selecting an option. */
export function choose(scene: StoryScene, cursor: Cursor, optionId: string, persona: PersonaId): Cursor | 'end' {
  const node = scene.nodes[cursor.nodeId]
  const opt = node.decision?.options.find((o) => o.id === optionId)
  if (!opt) return cursor
  const response = visibleLines(opt.response ?? [], persona)
  if (response.length > 0) return { nodeId: node.id, stage: 'response', index: 0, choiceId: optionId }
  const target = opt.next ?? node.next
  if (!target || node.ends) return 'end'
  const r = settle(scene, { kind: 'cursor', cursor: { nodeId: target, stage: 'lines', index: 0 } }, persona)
  return r.kind === 'end' ? 'end' : r.cursor
}

/** The line currently on screen (or the last line, for the decision stage). */
export function currentLine(scene: StoryScene, cursor: Cursor, persona: PersonaId): Line | undefined {
  const lines = linesForCursor(scene, cursor, persona)
  if (cursor.stage === 'decision') {
    return visibleLines(scene.nodes[cursor.nodeId].lines, persona).slice(-1)[0]
  }
  return lines[cursor.index]
}
