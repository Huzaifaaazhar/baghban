/* Shared domain types for the Baghban story engine. */

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
}

export interface Option {
  id: string
  label: Localized
  /** One short line describing the inner motive — shown under the label. */
  hint?: Localized
  for?: (PersonaId | RoleId)[]
  notFor?: (PersonaId | RoleId)[]
  effects?: Effects
  ledger?: LedgerNote
  response?: Line[]
  next?: string
}

export interface Decision {
  prompt: Localized
  options: Option[]
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
}

export interface StoryScene {
  id: string
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
