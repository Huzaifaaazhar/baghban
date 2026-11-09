import type { CharacterId } from '../types'
import { CHARACTERS } from '../data/characters'
import { ALL } from './data'
import { family, getBond } from './engine'
import { INFO } from './data'
import type { Bond, FamilyAttr, Sim } from './types'

/** Plain-language read of how someone currently feels toward you. Never a verdict on you. */
export function bondWord(b: Bond): string {
  if (b.scar >= 12 || b.resentment >= 55) return 'hurt, and not hiding it'
  if (b.resentment >= 35 || b.trust < 42) return 'strained with you'
  if (b.distance >= 55) return 'far away from you'
  if (b.trust >= 72 && b.heard >= 58 && b.resentment < 20) return 'open with you'
  if (b.trust >= 62 && b.resentment < 26) return 'warm toward you'
  return 'guarded with you'
}
export const warmthScore = (b: Bond) => b.trust + b.heard - b.resentment - b.distance

const FAM_WORDS: Record<FamilyAttr, [string, string, string]> = {
  cohesion: ['coming apart', 'holding', 'close'],
  communication: ['clogged', 'patchy', 'open'],
  mutualRespect: ['worn thin', 'mixed', 'steady'],
  unresolved: ['quiet', 'a few open questions', 'crowded with unfinished business'],
  sharedResp: ['lopsided', 'uneven', 'shared'],
  wellbeing: ['frayed', 'getting by', 'settled'],
}
export const FAMILY_LABEL: Record<FamilyAttr, string> = {
  cohesion: 'Family cohesion', communication: 'Communication', mutualRespect: 'Mutual respect',
  unresolved: 'Unresolved conflict', sharedResp: 'Shared responsibility', wellbeing: 'Emotional wellbeing',
}
export function familyWord(attr: FamilyAttr, v: number): string {
  const w = FAM_WORDS[attr]
  if (attr === 'unresolved') return v < 22 ? w[0] : v < 42 ? w[1] : w[2]
  return v < 40 ? w[0] : v < 64 ? w[1] : w[2]
}

export interface Shift { who: CharacterId; text: string; dir: 'closer' | 'further' | 'same' }
export interface Report {
  shifts: Shift[]
  stillOpen: string[]
  agreements: string[]
  learned: string[]
  reframed: string[]
  family: { attr: FamilyAttr; from: string; to: string }[]
}

/** What the player can honestly perceive after a situation — movements in how people are with them, not a grade. */
export function buildReport(before: Sim, after: Sim, me: CharacterId): Report {
  const shifts: Shift[] = []
  for (const c of ALL) {
    if (c === me) continue
    const b0 = getBond(before, c, me), b1 = getBond(after, c, me)
    const d = warmthScore(b1) - warmthScore(b0)
    const name = CHARACTERS[c].name
    if (Math.abs(d) < 5) continue
    const dRes = b1.resentment - b0.resentment
    const dHeard = b1.heard - b0.heard
    let text: string
    if (d > 0) text = dHeard > 4 ? `${name} feels more heard by you.` : `${name} is a little easier with you.`
    else text = dRes > 4 ? `${name} is carrying something against you.` : dHeard < -4 ? `${name} feels less heard by you.` : `${name} is a little further away.`
    shifts.push({ who: c, text, dir: d > 0 ? 'closer' : 'further' })
  }
  shifts.sort((a, b) => Math.abs(warmthScore(getBond(after, b.who, me)) - warmthScore(getBond(before, b.who, me))) - Math.abs(warmthScore(getBond(after, a.who, me)) - warmthScore(getBond(before, a.who, me))))
  const openBefore = new Set(before.issues.filter((i) => i.open).map((i) => i.id))
  const stillOpen = after.issues.filter((i) => i.open && !openBefore.has(i.id) && (i.a === me || i.b === me || i.sev > 0.3))
    .map((i) => `Something between ${CHARACTERS[i.a].name} and ${CHARACTERS[i.b].name} is still unspoken.`)
    .filter((t, i, all) => all.indexOf(t) === i)
  const agreements = after.agreements.filter((g) => !before.agreements.some((x) => x.id === g.id)).map((g) => g.text)
  const learned = after.insights.filter((i) => !before.insights.includes(i)).map((i) => INFO[i]?.title).filter(Boolean) as string[]
  // only your own earlier acts: “you did that without knowing what you now know”
  const reframed = after.memory.filter((m) => m.reframed && m.actor === me && !before.memory.find((x) => x.id === m.id)?.reframed).map((m) => m.n)
  const f0 = family(before), f1 = family(after)
  const famChanges = (Object.keys(f1) as FamilyAttr[])
    .filter((a) => familyWord(a, f0[a]) !== familyWord(a, f1[a]))
    .map((a) => ({ attr: a, from: familyWord(a, f0[a]), to: familyWord(a, f1[a]) }))
  return { shifts: shifts.slice(0, 5), stillOpen: stillOpen.slice(0, 3), agreements, learned, reframed, family: famChanges }
}
