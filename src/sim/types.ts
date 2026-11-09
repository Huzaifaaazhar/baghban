import type { CharacterId } from '../types'

/* ------------------------------------------------------------------ */
/* Simulation vocabulary                                               */
/* ------------------------------------------------------------------ */

/** How one person currently feels *toward one other person* (directed). */
export type BondAttr = 'trust' | 'respect' | 'resentment' | 'heard' | 'distance'
/** A person's own inner state. */
export type SelfAttr = 'security' | 'independence' | 'compromise' | 'finStress'
export type FamilyAttr = 'cohesion' | 'communication' | 'mutualRespect' | 'unresolved' | 'sharedResp' | 'wellbeing'

/** The things people care about — a decision touches one or more of these. */
export type Concern =
  | 'sleep' | 'dignity' | 'usefulness' | 'belonging' | 'money' | 'privacy' | 'routine'
  | 'approval' | 'autonomy' | 'health' | 'honesty' | 'recognition' | 'fairness' | 'tradition'

export type Tone = 'warm' | 'gentle' | 'neutral' | 'blunt' | 'harsh'

export type ActKind =
  | 'request'   // ask someone to change something
  | 'refuse'    // decline a request
  | 'dismiss'   // wave a concern away
  | 'deflect'   // change the subject / postpone
  | 'accuse'    // blame
  | 'shame'     // cutting, humiliating remark
  | 'guilt'     // invoke sacrifice / debt
  | 'impose'    // decide for someone
  | 'intrude'   // cross a boundary
  | 'withhold'  // keep something back
  | 'absorb'    // swallow your own need silently
  | 'concede'   // give way
  | 'compromise'
  | 'offer'     // offer help / alternative
  | 'listen'
  | 'confide'   // share something private
  | 'support'
  | 'defend'    // take someone's side (needs `vs`)
  | 'thank'
  | 'apologize'

/**
 * A semantic description of what a character *does* — never a score.
 * The engine appraises it against context (history, agreements, knowledge, needs, circumstances).
 */
export interface Act {
  by: CharacterId
  to: CharacterId
  k: ActKind
  /** What the target cares about that this act touches. */
  c?: Concern
  /** The actor's own motivating concern, and how intense that need is (0..1). */
  own?: Concern
  need?: number
  tone?: Tone
  /** Explained the real reason. */
  why?: boolean
  /** Offered an alternative or something in return. */
  alt?: boolean
  /** Acknowledged the other person's side first. */
  hear?: boolean
  /** Who was watching. */
  pub?: CharacterId[]
  /** Enforcing a previously agreed rule, or breaking one. */
  agr?: 'enforce' | 'break'
  /** A private fact the actor does not know (and that would change the moral weight if they did). */
  unk?: string
  /** For `defend`: whose position is being criticised. */
  vs?: CharacterId
  /** Short past-tense note remembered by everyone involved, and shown in the journal. */
  n: string
  /** Apology quality (for k = 'apologize'). */
  apology?: { own?: boolean; spec?: boolean; nobut?: boolean; change?: boolean; for?: Concern }
  /** Hurt multiplier for unusual circumstances. */
  sev?: number
}

/* ---------- effects other than acts ---------- */
export type Fx =
  | { t: 'bond'; a: CharacterId; b: CharacterId; d: Partial<Record<BondAttr, number>> }
  | { t: 'self'; c: CharacterId; d: Partial<Record<SelfAttr, number>> }
  | { t: 'flag'; f: string }
  | { t: 'unflag'; f: string }
  | { t: 'fact'; k: string; v: string | number | boolean }
  | { t: 'learn'; c: CharacterId; info: string }
  | { t: 'insight'; info: string }
  | { t: 'agree'; id: string; between: [CharacterId, CharacterId]; text: string }
  | { t: 'break'; id: string; by: CharacterId }
  | { t: 'issue'; id: string; a: CharacterId; b: CharacterId; concern: Concern; sev: number; text: string }
  | { t: 'resolve'; id: string }
  | { t: 'load'; c: CharacterId; d: number }
  | { t: 'comm'; d: number }
  /** Work out, from the bonds, how many sons actually come to a gathering (plus an optional bonus), and store it. */
  | { t: 'attend'; d?: number }
  | { t: 'later'; id: string; in: number; fx: Fx[]; echo?: { speaker: CharacterId | 'narrator'; text: string }[]; ifFlag?: string; unlessFlag?: string }

/* ---------- state ---------- */
export interface Bond {
  trust: number
  respect: number
  resentment: number
  heard: number
  distance: number
  /** Lingering damage from serious incidents. Raises the floor on resentment and lowers the ceiling on trust. */
  scar: number
}
export interface SelfState { security: number; independence: number; compromise: number; finStress: number }

export interface Memory {
  id: string
  t: number
  scenario: string
  actor: CharacterId
  target: CharacterId
  k: ActKind
  c?: Concern
  n: string
  felt: number
  warm: number
  blame: number
  tone: Tone
  pub: boolean
  resolved: boolean
  unk?: string
  reframed?: boolean
}
export interface Issue { id: string; a: CharacterId; b: CharacterId; concern: Concern; sev: number; text: string; open: boolean; since: number }
export interface Agreement { id: string; between: [CharacterId, CharacterId]; text: string; active: boolean; brokenBy: CharacterId[]; t: number }
export interface Pending {
  id: string
  due: number
  fx: Fx[]
  echo?: { speaker: CharacterId | 'narrator'; text: string }[]
  ifFlag?: string
  unlessFlag?: string
  fired?: boolean
}

export type Lens = 'parent' | 'child' | 'alok'

/** One thing a character did as part of a decision, with how it was appraised. */
export interface LogAct {
  by: CharacterId; to: CharacterId; k: ActKind; c?: Concern; tone?: Tone
  why?: boolean; alt?: boolean; hear?: boolean; pub?: boolean
  n: string; felt: number; warm: number; blame: number
}
export interface LogOffered { id: string; label: string; style: 'soft' | 'hard' | 'avoid' | 'other' }
/** Every decision the player makes is recorded — the verdict, history and replay are all derived from this. */
export interface LogEntry {
  /** Chapter index (0-based; 15 is the confrontation). */
  i: number
  sid: string
  title: string
  nodeId: string
  lens: Lens
  who: CharacterId
  optionId: string
  label: string
  style: LogOffered['style']
  acts: LogAct[]
  offered: LogOffered[]
  /** Notices looked at before deciding. */
  looked: string[]
  /** Family composite before/after this decision. */
  delta: number
  memIds: string[]
}

export interface FamilySnapshot { t: number; scenario: string; fam: Record<FamilyAttr, number> }

export interface Sim {
  t: number
  self: Record<CharacterId, SelfState>
  bonds: Record<string, Bond>
  load: Record<string, number>
  goodwill: Record<string, number>
  apologies: Record<string, number>
  memory: Memory[]
  issues: Issue[]
  agreements: Agreement[]
  pending: Pending[]
  /** What each character knows (in-universe). */
  knowledge: Record<string, string[]>
  /** What the player has discovered (insight journal). */
  insights: string[]
  flags: string[]
  facts: Record<string, string | number | boolean>
  comm: number
  history: FamilySnapshot[]
  /** Every decision made, in order. */
  log: LogEntry[]
  /** Notices viewed since the last decision. */
  look: string[]
  /** Which other perspectives were read after each chapter. */
  reads: { i: number; lens: Lens }[]
  /** Bonds as the year began, for before/after comparison. */
  baseline: Record<string, { trust: number; respect: number; resentment: number; heard: number; distance: number }>
}

/** Read-only query facade handed to scenario conditions. */
export interface Q {
  sim: Sim
  bond(a: CharacterId, b: CharacterId, attr: BondAttr | 'scar'): number
  self(c: CharacterId, attr: SelfAttr): number
  fam(attr: FamilyAttr): number
  flag(f: string): boolean
  fact(k: string): string | number | boolean | undefined
  knows(c: CharacterId, info: string): boolean
  insight(info: string): boolean
  count(f: { actor?: CharacterId; target?: CharacterId; kind?: ActKind | ActKind[]; concern?: Concern; scenario?: string; open?: boolean }): number
  scar(a: CharacterId, b: CharacterId): number
  issue(id: string): boolean
  agreed(id: string): boolean
  broken(id: string): boolean
  load(c: CharacterId): number
}

export type Cond = (q: Q) => boolean
