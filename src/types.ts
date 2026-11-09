/* Shared domain types for the Baghban story engine. */
import type { Act, Cond, Fx, Q } from './sim/types'

export type CharacterId =
  | 'raj'
  | 'pooja'
  | 'vikram'
  | 'meera'
  | 'rohan'
  | 'simran'
  | 'kabir'
  | 'ananya'
  | 'alok'

/** Who the player *is* inside the story (one of the playable characters). */
export type PersonaId = 'raj' | 'pooja' | 'vikram' | 'rohan' | 'kabir' | 'alok'

export type RoleId = 'parent' | 'child' | 'alok'

export type Mood = 'neutral' | 'warm' | 'worried' | 'stern' | 'hurt' | 'hopeful' | 'tired'

export type LocationId =
  | 'living-room'
  | 'dining-room'
  | 'parents-bedroom'
  | 'boys-room'
  | 'kitchen'
  | 'balcony'
  | 'courtyard'

export type TimeOfDay = 'morning' | 'afternoon' | 'golden' | 'evening' | 'night'

/** Text that may differ by persona or role. Resolution: persona → role → default. */
export type Localized = string | ({ default?: string } & Partial<Record<PersonaId | RoleId, string>>)

export type Stat = 'warmth' | 'dignity' | 'burden' | 'trust'

export interface Effects {
  stats?: Partial<Record<Stat, number>>
  /** How each person now feels about *the person you are playing*. */
  relations?: Partial<Record<CharacterId, number>>
  flags?: string[]
  learn?: string[]
}

export type Stance = 'parents' | 'children' | 'alok'

export interface LedgerNote {
  title: string
  /** Quiet reflection on what this choice means — shown in the journal. */
  note: string
  /** Whose position this choice leaned toward. Used by the verdict in later parts. */
  leans: Stance[]
}

export interface Line {
  /** Character speaking; 'narrator' for scene narration; 'thought' for the player's inner voice. */
  speaker: CharacterId | 'narrator' | 'thought'
  text: Localized
  mood?: Mood
  /** Only show to these personas/roles. */
  for?: (PersonaId | RoleId)[]
  /** Hide from these personas/roles. */
  notFor?: (PersonaId | RoleId)[]
  /** Only show when the simulation says so (Part 2). */
  when?: Cond
}

export interface Option {
  id: string
  label: Localized
  /** One short line describing the inner motive — shown under the label. */
  hint?: Localized
  for?: (PersonaId | RoleId)[]
  notFor?: (PersonaId | RoleId)[]
  /** Only offer this choice when the simulation says so (e.g. you know something). */
  when?: Cond
  /** Part 2: what this choice *does*, appraised by the simulation — never a score. */
  act?: Act | Act[]
  fx?: Fx[]
  /** Neutral memory note for the journal. */
  note?: string
  /** Part 2: after the act is applied, the first branch whose condition holds decides how others respond (deterministic, from simulation state). */
  branches?: Branch[]
  effects?: Effects
  ledger?: LedgerNote
  response?: Line[]
  next?: string
}

export interface Decision {
  prompt: Localized
  options: Option[]
}

export interface Branch {
  when: Cond
  fx?: Fx[]
  acts?: Act[]
  res: Line[]
}

/** Something the player can look at or remember before deciding. May reveal private information. */
export interface Notice {
  id: string
  label: string
  kind: 'look' | 'memory' | 'ask'
  text: Localized
  fx?: Fx[]
  when?: Cond
}

export interface StoryNode {
  id: string
  location: LocationId
  time: TimeOfDay
  /** Characters visible on stage. A function receives the persona to adapt to who you are with. */
  cast: CharacterId[] | ((persona: PersonaId) => CharacterId[])
  lines: Line[]
  decision?: Decision
  next?: string
  /** Final node of the scene — shows the closing card. */
  ends?: boolean
  /** Part 2: things that happen as this node begins (acts by others, effects). */
  onEnter?: { acts?: Act[] | ((q: Q) => Act[]); fx?: Fx[] }
  /** Part 2: look around / remember / ask — shown beside the decision. */
  notice?: Notice[]
}

export interface StoryScene {
  id: string
  /** Part 2: the character the player embodies in this scenario. */
  who?: CharacterId
  title: string
  subtitle: string
  start: string
  nodes: Record<string, StoryNode>
}

export interface Cursor {
  nodeId: string
  stage: 'lines' | 'decision' | 'response'
  index: number
  choiceId?: string
  /** Index of the simulation-chosen branch of the chosen option, if any. */
  branch?: number
}

export interface LedgerEntry extends LedgerNote {
  id: string
  optionLabel: string
  persona: PersonaId
}

/* ---------- Characters ---------- */

export interface PortraitSpec {
  skin: string
  hair: string
  hairStyle: 'bald-grey' | 'short' | 'side-part' | 'bun' | 'long' | 'bob' | 'crop' | 'pulled-back'
  grey?: boolean
  glasses?: boolean
  moustache?: boolean
  beard?: boolean
  bindi?: boolean
  sindoor?: boolean
  clothing: 'kurta' | 'shirt' | 'shirt-tie' | 'saree' | 'suit' | 'salwar' | 'sweater'
  clothColor: string
  clothAccent: string
  dupatta?: string
  age: 'young' | 'mid' | 'old'
  woman?: boolean
}

export interface Character {
  id: CharacterId
  name: string
  fullName: string
  age: number
  title: string
  group: 'parents' | 'children' | 'spouses' | 'outsider'
  occupation: string
  responsibilities: string[]
  finances: string
  personality: { traits: string[]; portrait: string }
  relationships: { with: CharacterId | 'all'; text: string }[]
  motivation: string
  frustration: string
  expectation: string
  quote: string
  portrait: PortraitSpec
  playable: boolean
}

export interface Role {
  id: RoleId
  title: string
  tagline: string
  summary: string
  knows: string
  decides: string
  carries: string
  personas: PersonaId[]
}

export interface Location {
  id: LocationId
  name: string
  hindi: string
  blurb: string
  exits: LocationId[]
}
