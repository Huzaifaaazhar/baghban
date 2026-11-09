import type { CharacterId, Line, LocationId, Mood, Notice, Option, PersonaId, StoryNode, StoryScene, TimeOfDay } from '../types'
import type { Act, Cond, Fx } from '../sim/types'

export type LensKey = 'parent' | 'child' | 'alok'

/** Facts about this playthrough that decide who stands where in a scenario. */
export interface Ctx {
  persona: PersonaId
  /** Son whose home hosts the parents. */
  H: CharacterId
  HW: CharacterId
  /** The son the player's story follows outside host-specific situations. */
  S: CharacterId
  SW: CharacterId
  /** The son who actually does most of the parents' errands. */
  carer: CharacterId
  /** Where the parents live now: 'host' | 'rotate' | 'own' | 'alok-near' | 'undecided'. */
  living: string
}

export interface LensDef {
  who: CharacterId
  /** One honest sentence about what this person wants and fears — never their secret. */
  stake: string
  /** What this person already knows that others don't (shown to the player only once they are playing them). */
  reveals: string[]
  intro: Line[]
  /** NPC acts that happen as the scene begins (may depend on simulation state). */
  enter?: Act[] | ((q: import('../sim/types').Q) => Act[])
  notice?: Notice[]
  prompt: string
  options: Option[]
  /** What this person was seeing and thinking — read by players who played someone else. */
  witness: Line[]
  witnessLearn?: string[]
}

export interface ScenarioBody {
  where: LocationId
  time: TimeOfDay
  background: string
  conflict: string
  involved: CharacterId[]
  lenses: Record<LensKey, LensDef>
  aftermath: Line[]
  aftermathWhere?: LocationId
  aftermathTime?: TimeOfDay
}

export interface ScenarioDef {
  id: string
  n: number
  title: string
  month: string
  build: (c: Ctx) => ScenarioBody
}

/* ---------- authoring helpers ---------- */
export const say = (speaker: Line['speaker'], text: Line['text'], mood?: Mood, o: Partial<Line> = {}): Line => ({ speaker, text, mood, ...o })
export const nar = (text: Line['text'], o: Partial<Line> = {}): Line => ({ speaker: 'narrator', text, ...o })
export const th = (text: Line['text'], mood?: Mood, o: Partial<Line> = {}): Line => ({ speaker: 'thought', text, mood, ...o })
/** Make every line conditional on the simulation. */
export const iff = (when: Cond, ...lines: Line[]): Line[] => lines.map((l) => ({ ...l, when }))

export const act = (by: CharacterId, to: CharacterId, k: Act['k'], o: Partial<Act> & { n: string }): Act => ({ by, to, k, ...o })

export const opt = (
  id: string, label: Option['label'],
  o: { act?: Act | Act[]; fx?: Fx[]; res: Line[]; branches?: Option['branches']; when?: Cond; note?: string; next?: string },
): Option => ({ id, label, ...o, response: o.res } as Option)

export const later = (id: string, inn: number, fx: Fx[], echo?: { speaker: CharacterId | 'narrator'; text: string }[], o: { ifFlag?: string; unlessFlag?: string } = {}): Fx =>
  ({ t: 'later', id, in: inn, fx, echo, ...o })
export const flag = (f: string): Fx => ({ t: 'flag', f })
export const learnFx = (c: CharacterId, info: string): Fx => ({ t: 'learn', c, info })
export const insightFx = (info: string): Fx => ({ t: 'insight', info })

/* ---------- compile a scenario + lens into a playable scene ---------- */
export function compile(def: ScenarioDef, ctx: Ctx, lens: LensKey): StoryScene {
  const body = def.build(ctx)
  const L = body.lenses[lens]
  const cast = body.involved
  const intro: StoryNode = {
    id: 'intro',
    location: body.where,
    time: body.time,
    cast,
    lines: L.intro,
    decision: { prompt: L.prompt, options: L.options },
    notice: L.notice,
    onEnter: { acts: L.enter, fx: [...L.reveals.map((i) => insightFx(i)), ...L.reveals.map((i) => learnFx(L.who, i))] },
    next: 'aftermath',
  }
  const aftermath: StoryNode = {
    id: 'aftermath',
    location: body.aftermathWhere ?? body.where,
    time: body.aftermathTime ?? body.time,
    cast,
    lines: body.aftermath,
    ends: true,
  }
  return { id: def.id, who: L.who, title: def.title, subtitle: def.month, start: 'intro', nodes: { intro, aftermath } }
}

/* ---------- per-son facts shared by several scenarios ---------- */
export const SECRET: Record<string, string> = { vikram: 'vik-bonus', rohan: 'rohan-invoices', kabir: 'kabir-debt' }
export const OFFER: Record<string, string> = { vikram: 'vik-offer', rohan: 'rohan-offer', kabir: 'kabir-offer' }
export const WIFE_SECRET: Record<string, string> = { meera: 'meera-watched', simran: 'simran-judged', ananya: 'ananya-alone' }
export const sonsExcept = (c: CharacterId): CharacterId[] => (['vikram', 'rohan', 'kabir'] as CharacterId[]).filter((x) => x !== c)
