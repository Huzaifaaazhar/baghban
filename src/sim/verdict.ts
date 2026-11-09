import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { ALL } from './data'
import { family, getBond } from './engine'
import { analyse, groupOf, type Analysis, type Group } from './analyse'
import { bondWord, familyWord, FAMILY_LABEL, warmthScore } from './report'
import type { ActKind, Concern, FamilyAttr, LogAct, LogEntry, Sim } from './types'

const N = (c: CharacterId) => CHARACTERS[c].name
const r1 = (n: number) => Math.round(n * 10) / 10
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const norm = (v: number, lo: number, hi: number) => clamp01((v - lo) / (hi - lo))

export type EndingId = 'parents' | 'children' | 'alok' | 'both-wrong' | 'compromise'

export const ENDING_META: Record<EndingId, { n: number; title: string; tagline: string }> = {
  parents: { n: 1, title: 'The Parents Had a Point', tagline: 'What was owed, and not paid.' },
  children: { n: 2, title: 'The Children Had a Point', tagline: 'What was asked, and never should have been.' },
  alok: { n: 3, title: 'Alok’s Approach', tagline: 'The one who stayed gentle.' },
  'both-wrong': { n: 4, title: 'Everyone Was Partly Wrong', tagline: 'Love, with nothing to carry it across the room.' },
  compromise: { n: 5, title: 'A Healthy Family Compromise', tagline: 'Dignity and independence, both kept.' },
}

export interface Check { label: string; ok: boolean; detail: string }
export interface EndingFit { id: EndingId; fit: number; passes: boolean; checks: Check[] }

/* ------------------------------------------------------------------ */
/* the five readings                                                   */
/* ------------------------------------------------------------------ */
export function evaluateEndings(sim: Sim, a: Analysis = analyse(sim)): EndingFit[] {
  const f = a.fam
  const bal = a.harm.parents + a.harm.children + 0.001
  const chk = (label: string, ok: boolean, detail: string): Check => ({ label, ok, detail })

  // 1 — the parents had a point: children repeatedly failed reasonable duties and needs
  const parentsChecks = [
    chk('Children’s failures toward the parents are substantial', a.childNeglect >= 3, `blame-weighted neglect ${a.childNeglect}`),
    chk('…and clearly outweigh the parents’ impositions', a.childNeglect >= a.parentImposition * 1.5 + 0.5, `${a.childNeglect} vs ${a.parentImposition}`),
    chk('The parents’ own needs were left substantially unmet', a.unmet.parents >= 1.5, `${a.unmet.parents} unmet`),
  ]
  // 2 — the children had a point: parents repeatedly imposed and disregarded boundaries
  const childrenChecks = [
    chk('Parents’ impositions on the children are substantial', a.parentImposition >= 3, `blame-weighted imposition ${a.parentImposition}`),
    chk('…and clearly outweigh the children’s neglect', a.parentImposition >= a.childNeglect * 1.5 + 0.5, `${a.parentImposition} vs ${a.childNeglect}`),
    chk('The children’s own needs were left substantially unmet', a.unmet.children >= 1.5, `${a.unmet.children} unmet`),
  ]
  // 3 — Alok's approach: consistent empathy, patience, constructive support
  const alokChecks = [
    chk('Most decisions were made through Alok’s eyes', a.lensShare.alok >= 0.6, `${Math.round(a.lensShare.alok * 100)}% of decisions`),
    chk('Alok’s warmth clearly outweighs any harm he did', a.alok.warm >= 3 && a.alok.harm <= a.alok.warm * 0.45, `warmth ${a.alok.warm}, harm ${a.alok.harm}`),
    chk('Empathy and patience, not recklessness', a.alok.intrusions <= 2, `${a.alok.intrusions} confidences broken`),
  ]
  // 5 — a healthy compromise: dignity, independence, respect, shared responsibility — and consistently
  const compChecks = [
    chk('Communication is open', f.communication >= 50, `${f.communication}`),
    chk('Little is left unresolved', f.unresolved <= 34, `${f.unresolved}`),
    chk('Mutual respect holds between generations', f.mutualRespect >= 62, `${f.mutualRespect}`),
    chk('Responsibility is shared, not carried by one', f.sharedResp >= 50, `${f.sharedResp}`),
    chk('Parents keep their dignity; children keep their independence', a.parentsSecurity >= 44 && a.childrenIndependence >= 56, `security ${a.parentsSecurity}, independence ${a.childrenIndependence}`),
    chk('Neither side did much unjustified harm', a.harm.parents <= 5 && a.harm.children <= 5, `parents ${a.harm.parents}, children ${a.harm.children}`),
    chk('Understandings were reached and mostly kept', a.agreements.active >= 3 && a.agreements.broken <= 1, `${a.agreements.active} reached, ${a.agreements.broken} broken`),
    chk('No injury left a deep scar', a.maxScar <= 14, `deepest scar ${a.maxScar}`),
    chk('The year improved steadily, not once', a.steady >= 0.6 && a.damagingChapters <= 2, `${Math.round(a.steady * 100)}% of chapters held or improved; ${a.damagingChapters} damaging`),
  ]
  // 4 — everyone partly wrong: shared failure to communicate, compromise and understand
  const bothChecks = [
    chk('Both generations did real harm', a.harm.parents >= 2 && a.harm.children >= 2, `parents ${a.harm.parents}, children ${a.harm.children}`),
    chk('Communication failed', f.communication < 50 || a.unvoiced >= 3, `communication ${f.communication}, ${a.unvoiced} unspoken grievances`),
    chk('Few understandings were made or kept', a.agreements.active < 3 || a.agreements.broken >= 2, `${a.agreements.active} reached, ${a.agreements.broken} broken`),
  ]
  const allOk = (c: Check[]) => c.every((x) => x.ok)
  const frac = (c: Check[]) => c.filter((x) => x.ok).length / c.length

  const fits: EndingFit[] = [
    { id: 'parents', checks: parentsChecks, passes: allOk(parentsChecks), fit: clamp01(0.5 * norm(a.childNeglect / (a.parentImposition + 1), 0.8, 3) + 0.3 * norm(a.unmet.parents, 0.5, 3) + 0.2 * frac(parentsChecks)) },
    { id: 'children', checks: childrenChecks, passes: allOk(childrenChecks), fit: clamp01(0.5 * norm(a.parentImposition / (a.childNeglect + 1), 0.8, 3) + 0.3 * norm(a.unmet.children, 0.5, 3) + 0.2 * frac(childrenChecks)) },
    { id: 'alok', checks: alokChecks, passes: allOk(alokChecks), fit: clamp01(0.45 * norm(a.lensShare.alok, 0.3, 1) + 0.35 * norm(a.alok.warm, 1, 8) + 0.2 * (1 - norm(a.alok.harm, 0, 4))) },
    { id: 'both-wrong', checks: bothChecks, passes: allOk(bothChecks), fit: clamp01(0.35 * norm(Math.min(a.harm.parents, a.harm.children), 0.5, 5) + 0.35 * (1 - norm(f.communication, 30, 70)) + 0.3 * norm(f.unresolved, 15, 70)) },
    { id: 'compromise', checks: compChecks, passes: allOk(compChecks), fit: clamp01(frac(compChecks) * 0.6 + 0.4 * (1 - bal / (bal + 6))) },
  ]
  return fits
}

/** Choose the ending from the evaluated readings. Order matters only where two honest readings could both hold. */
export function chooseEnding(fits: EndingFit[]): EndingId {
  const by = Object.fromEntries(fits.map((x) => [x.id, x])) as Record<EndingId, EndingFit>
  if (by.alok.passes) return 'alok'
  if (by.compromise.passes) return 'compromise'
  const sides = [by.parents, by.children].filter((x) => x.passes).sort((a, b) => b.fit - a.fit)
  if (sides.length) return sides[0].id
  return 'both-wrong'
}

/* ------------------------------------------------------------------ */
/* evidence                                                            */
/* ------------------------------------------------------------------ */
const CONCERN_PHRASE: Partial<Record<Concern, string>> = {
  belonging: 'need for companionship', usefulness: 'need to feel useful', recognition: 'need to be recognised', money: 'financial difficulties',
  privacy: 'privacy', autonomy: 'independence', health: 'health', sleep: 'need for rest', honesty: 'need for honesty', dignity: 'dignity',
  fairness: 'claim to fairness', approval: 'need for approval', routine: 'routines', tradition: 'traditions',
}
const GROUP_PHRASE: Record<Group, string> = { parents: 'the parents’', children: 'the children’s', alok: 'Alok’s' }
const HARM_VERB: Partial<Record<ActKind, string>> = { dismiss: 'dismissed', refuse: 'turned down', accuse: 'blamed', shame: 'shamed', guilt: 'pressed with guilt', impose: 'overrode', intrude: 'intruded on', request: 'pressed hard on', deflect: 'put off', withhold: 'kept back from', absorb: 'left unspoken' }
const GOOD_VERB: Partial<Record<ActKind, string>> = { listen: 'listened to', compromise: 'made room for', offer: 'offered something for', support: 'supported', thank: 'acknowledged', confide: 'was honest about', concede: 'gave way on', defend: 'stood up for', apologize: 'apologised over' }
const HARM_KINDS: ActKind[] = ['dismiss', 'refuse', 'accuse', 'shame', 'guilt', 'impose', 'intrude']
const AVOID: ActKind[] = ['deflect', 'withhold', 'absorb']
const GOOD: ActKind[] = ['listen', 'compromise', 'offer', 'support', 'thank', 'confide', 'concede', 'defend', 'apologize']

const roughReq = (a: LogAct) => a.k === 'request' && (a.tone === 'blunt' || a.tone === 'harsh') && !a.hear && !a.alt
export const isHarm = (a: LogAct) => HARM_KINDS.includes(a.k) || roughReq(a)
export const isAvoid = (a: LogAct) => AVOID.includes(a.k)
export const isGood = (a: LogAct) => GOOD.includes(a.k) || (a.k === 'request' && (a.hear || a.alt) && !isHarm(a))

export function describeAct(a: LogAct): string {
  const verb = HARM_VERB[a.k] ?? GOOD_VERB[a.k] ?? a.k
  const how: string[] = []
  if (a.tone === 'blunt' || a.tone === 'harsh') how.push('bluntly')
  if (a.pub) how.push('in front of others')
  if (a.why) how.push('with a reason')
  if (a.alt) how.push('offering an alternative')
  if (a.hear) how.push('after hearing them out')
  const tail = how.length ? `, ${how.join(', ')}` : ''
  return `${verb} ${N(a.to)}${a.c && CONCERN_PHRASE[a.c] ? ` about ${CONCERN_PHRASE[a.c]}` : ''}${tail}`
}

/** What the player's own decisions did — by whom they were directed at, and about what. Describes choices, never the person. */
export function choiceStatements(sim: Sim): string[] {
  type Tally = { harm: number; avoid: number; good: number; ex: { harm?: string; avoid?: string; good?: string } }
  const t = new Map<string, Tally>()
  for (const e of sim.log) {
    for (const a of e.acts) {
      if (a.by !== e.who || !a.c || !CONCERN_PHRASE[a.c]) continue
      const g = groupOf(a.to)
      if (a.to === a.by) continue
      const key = `${g}|${a.c}`
      const row = t.get(key) ?? { harm: 0, avoid: 0, good: 0, ex: {} }
      if (isHarm(a)) { row.harm++; row.ex.harm ??= e.label }
      else if (isAvoid(a)) { row.avoid++; row.ex.avoid ??= e.label }
      else if (isGood(a)) { row.good++; row.ex.good ??= e.label }
      t.set(key, row)
    }
  }
  const rows = [...t.entries()].map(([k, v]) => { const [g, c] = k.split('|') as [Group, Concern]; return { g, c, ...v } })
  const goods = rows.filter((r) => r.good >= 2).sort((a, b) => b.good - a.good)
  const harms = rows.filter((r) => r.harm + r.avoid >= 2 && r.harm + r.avoid > r.good).sort((a, b) => b.harm + b.avoid * 0.6 - (a.harm + a.avoid * 0.6))
  const out: string[] = []
  const pg = (r: typeof rows[number]) => `${GROUP_PHRASE[r.g]} ${CONCERN_PHRASE[r.c]}`
  const hverb = (r: typeof rows[number]) => (r.harm >= r.avoid ? 'repeatedly dismissed or overrode' : 'repeatedly left unspoken')
  if (goods[0] && harms[0] && pg(goods[0]) !== pg(harms[0])) {
    out.push(`You respected ${pg(goods[0])}, but ${hverb(harms[0])} ${pg(harms[0])}.`)
    if (goods[1] && harms[1] && pg(goods[1]) !== pg(harms[1])) out.push(`You made room for ${pg(goods[1])}, while ${hverb(harms[1])} ${pg(harms[1])}.`)
    else if (harms[1]) out.push(`You also ${hverb(harms[1])} ${pg(harms[1])}.`)
  } else {
    if (goods[0]) out.push(`You repeatedly respected ${pg(goods[0])}${goods[1] ? ` and ${pg(goods[1])}` : ''}.`)
    if (harms[0]) out.push(`You ${hverb(harms[0])} ${pg(harms[0])}${harms[1] ? ` and ${pg(harms[1])}` : ''}.`)
  }
  return out
}

/* ------------------------------------------------------------------ */
/* decisions: constructive, damaging, missed                            */
/* ------------------------------------------------------------------ */
export interface RatedDecision { e: LogEntry; impact: number; why: string }
export function impactOf(sim: Sim, e: LogEntry): number {
  let x = e.delta
  for (const id of e.memIds) {
    const m = sim.memory.find((y) => y.id === id)
    if (!m) continue
    x += m.warm * 3 - m.blame * 4 - (m.resolved ? 0 : m.felt * 1.5)
    if (m.k === 'absorb' && !m.resolved) x -= 0.8
  }
  return r1(x)
}
function whyOf(e: LogEntry): string {
  const mine = e.acts.filter((a) => a.by === e.who)
  const parts = mine.slice(0, 2).map(describeAct)
  return parts.length ? `${N(e.who)} ${parts.join('; and ')}.` : `${N(e.who)} chose: ${e.label}`
}
export function rateDecisions(sim: Sim): { best: RatedDecision[]; worst: RatedDecision[] } {
  const rated = sim.log.map((e) => ({ e, impact: impactOf(sim, e), why: whyOf(e) }))
  const best = rated.filter((x) => x.impact > 0.8).sort((a, b) => b.impact - a.impact).slice(0, 3)
  const worst = rated.filter((x) => x.impact < -0.8).sort((a, b) => a.impact - b.impact).slice(0, 3)
  return { best, worst }
}

export interface Missed { e: LogEntry; chosen: string; alternative: string }
export function missedCompromises(sim: Sim): Missed[] {
  const out: Missed[] = []
  for (const e of sim.log) {
    if (e.style === 'soft' || e.style === 'other') continue
    const alt = e.offered.find((o) => o.style === 'soft')
    if (!alt) continue
    out.push({ e, chosen: e.label, alternative: alt.label })
  }
  // those that left the most behind come first
  const impact = (e: LogEntry) => impactOf(sim, e)
  return out.sort((a, b) => impact(a.e) - impact(b.e)).slice(0, 5)
}

/* ------------------------------------------------------------------ */
/* relationships, grievances, behaviour analysis                        */
/* ------------------------------------------------------------------ */
export interface RelChange { a: CharacterId; b: CharacterId; word: string; before: string; delta: number; scar: number }
const PAIRS: [CharacterId, CharacterId][] = [['raj', 'vikram'], ['vikram', 'raj'], ['raj', 'rohan'], ['rohan', 'raj'], ['raj', 'kabir'], ['kabir', 'raj'], ['pooja', 'meera'], ['meera', 'pooja'], ['pooja', 'simran'], ['simran', 'pooja'], ['pooja', 'ananya'], ['ananya', 'pooja'], ['raj', 'pooja'], ['pooja', 'raj'], ['alok', 'raj'], ['raj', 'alok'], ['vikram', 'rohan'], ['rohan', 'kabir']]
export function relationshipChanges(sim: Sim): RelChange[] {
  return PAIRS.map(([a, b]) => {
    const now = getBond(sim, a, b)
    const base = sim.baseline[`${a}>${b}`] ?? now
    const d = warmthScore(now) - warmthScore({ ...now, ...base })
    return { a, b, word: bondWord(now).replace(' with you', '').replace(' toward you', '').replace(' from you', '').replace(' you', ''), before: bondWord({ ...now, ...base, scar: 0 }).replace(' with you', '').replace(' toward you', '').replace(' from you', '').replace(' you', ''), delta: Math.round(d), scar: now.scar }
  })
}

export interface Grievance { a: CharacterId; b: CharacterId; text: string; sev: number; unspoken: boolean }
export function openConflicts(sim: Sim): { issues: Grievance[]; scars: { a: CharacterId; b: CharacterId; scar: number }[] } {
  const issues = sim.issues.filter((i) => i.open).sort((x, y) => y.sev - x.sev).slice(0, 8).map((i) => ({ a: i.a, b: i.b, text: i.text, sev: i.sev, unspoken: i.id.endsWith('unvoiced') }))
  const scars = Object.entries(sim.bonds).filter(([, b]) => b.scar >= 8).map(([k, b]) => { const [a, c] = k.split('>') as [CharacterId, CharacterId]; return { a, b: c, scar: b.scar } }).sort((x, y) => y.scar - x.scar).slice(0, 5)
  return { issues, scars }
}

function topActs(sim: Sim, g: Group, kind: 'harm' | 'repair', n: number) {
  const mem = sim.memory.filter((m) => groupOf(m.actor) === g && m.scenario !== 'prologue')
  const rated = kind === 'harm'
    ? mem.filter((m) => HARM_KINDS.includes(m.k) && m.blame >= 0.25).sort((a, b) => b.blame - a.blame)
    : mem.filter((m) => GOOD.includes(m.k) && m.warm >= 0.3).sort((a, b) => b.warm - a.warm)
  const seen = new Set<string>(); const out = []
  for (const m of rated) { if (seen.has(m.n)) continue; seen.add(m.n); out.push(m); if (out.length >= n) break }
  return out
}

export interface BehaviourAnalysis { headline: string; points: string[]; harmful: string[]; constructive: string[] }
export function behaviour(sim: Sim, a: Analysis, g: Group): BehaviourAnalysis {
  const harmNotes = topActs(sim, g, 'harm', 3).map((m) => m.n)
  const goodNotes = topActs(sim, g, 'repair', 3).map((m) => m.n)
  const pts: string[] = []
  if (g === 'parents') {
    pts.push(`Blame-weighted harm to the children: ${a.harm.parents}. Repair offered: ${a.repair.parents}.`)
    pts.push(a.parentImposition >= 3 ? 'They pressed expectations, rules and verdicts on the children’s lives more than the circumstances justified.' : a.parentImposition >= 1.2 ? 'They overstepped on some occasions, mostly when they felt unseen — and not always without reason.' : 'They rarely overrode the children’s boundaries, and mostly when something real was at stake.')
    pts.push(a.unmet.parents >= 2.5 ? 'Their own needs — companionship, being asked, being thanked — were left largely unmet.' : a.unmet.parents >= 1 ? 'A few of their needs for belonging and recognition remained unanswered.' : 'Most of what they needed to be heard about was, in the end, heard.')
  } else if (g === 'children') {
    pts.push(`Blame-weighted harm to the parents: ${a.childNeglect}. Repair offered: ${a.repair.children}.`)
    pts.push(a.childNeglect >= 3 ? 'They repeatedly set aside reasonable duties and emotional needs — presence, patience, small responsibilities — and often did so without explaining why.' : a.childNeglect >= 1.2 ? 'There were real lapses in attention and presence, though some were genuinely forced by their own strain.' : 'They mostly showed up, and said what they could not give.')
    pts.push(a.unmet.children >= 2.5 ? 'Their own lives — boundaries, money, independence — went unrespected for long stretches.' : a.unmet.children >= 1 ? 'Some of their limits were respected; others were overridden.' : 'Their limits were largely respected.')
  } else {
    pts.push(`Warmth offered: ${a.alok.warm}. Harm done: ${a.alok.harm}. Confidences broken: ${a.alok.intrusions}. Acts of holding back: ${a.alok.avoid} of ${a.alok.acts}.`)
    pts.push(a.alok.avoidShare > 0.34 ? 'Much of the kindness took the form of avoiding the hard sentence: staying quiet, softening, stepping aside.' : 'Kindness was mostly direct: he asked, listened and said what he saw — within the limits of what was his to say.')
    pts.push(a.alokFair ? 'The support was fair as well as warm: it did not take a side against someone’s dignity.' : 'The warmth did not by itself answer the question of fairness: some of it was comfort that left the underlying conflict where it was.')
  }
  const headline = g === 'parents' ? 'Raj and Pooja' : g === 'children' ? 'The sons and their wives' : 'Alok'
  return { headline, points: pts, harmful: harmNotes, constructive: goodNotes }
}

/* ------------------------------------------------------------------ */
/* the verdict                                                          */
/* ------------------------------------------------------------------ */
export interface Verdict {
  ending: EndingId
  title: string
  tagline: string
  number: number
  summary: string
  alokNote?: string
  analysis: Analysis
  fits: EndingFit[]
  reasons: string[]
  statements: string[]
  behaviour: Record<Group, BehaviourAnalysis>
  best: RatedDecision[]
  worst: RatedDecision[]
  missed: Missed[]
  rel: RelChange[]
  conflicts: ReturnType<typeof openConflicts>
  family: { attr: FamilyAttr; label: string; word: string; value: number; start: number }[]
  /** How far the parents' and children's claims each stand, 0–1, for the scales. */
  balance: { parents: number; children: number }
  confrontation: { settlement: string | null; refused: CharacterId[]; apologised: CharacterId[]; silent: CharacterId[] }
}

const SUMMARY: Record<EndingId, string> = {
  parents: 'Over the year the children repeatedly let down things that were reasonable to ask: presence, patience, small duties, a word of thanks. Some of it was strain; much of it was avoidance. By the night of the confrontation the parents’ grievance was the better-founded one — though not the only one.',
  children: 'Over the year the parents repeatedly imposed expectations the children could not meet, overrode boundaries, and aired disagreements as verdicts. Some of it came from fear and loneliness; none of it was the children’s to carry. By the night of the confrontation the children’s grievance was the better-founded one — though not the only one.',
  alok: 'You walked the year as the one who stayed gentle. Patience and empathy were real, and they bought time and warmth the family needed. Whether that approach was fair — or only kinder than confrontation — is the question the record answers below.',
  'both-wrong': 'Nobody was the villain, and nobody was simply right. Parents pressed, children pulled away, and both avoided the sentence that would have helped. What failed was less a person than a habit: the family loved each other in silence, and silence is a poor carrier.',
  compromise: 'Across the year, parental dignity and the children’s independence were each defended — and each was sometimes given up for the other. Responsibility was shared more than carried, grievances were named rather than stored, and understandings were reached and kept. It was never easy, and it was consistent.',
}

export function computeVerdict(sim: Sim): Verdict {
  const a = analyse(sim)
  const fits = evaluateEndings(sim, a)
  const ending = chooseEnding(fits)
  const meta = ENDING_META[ending]
  const fam = family(sim)
  const first = sim.history[0]?.fam ?? fam
  const f = fits.find((x) => x.id === ending)!
  const reasons: string[] = []
  for (const c of f.checks) reasons.push(`${c.ok ? '✓' : '✗'} ${c.label} (${c.detail})`)
  if (ending === 'alok') reasons.push(a.alokFair ? '✓ Alok’s support was direct enough, and left little unresolved, to count as fair rather than avoidant.' : '✗ Alok’s support left too much unspoken (avoidance or open grievances) to count as fair rather than comfortable.')
  const { best, worst } = rateDecisions(sim)
  const apologised = ALL.filter((c) => sim.memory.some((m) => m.actor === c && m.k === 'apologize' && m.scenario === 's16' && m.warm >= 0.3))
  const refused = ALL.filter((c) => sim.memory.some((m) => m.actor === c && m.scenario === 's16' && (m.k === 'absorb' || m.k === 'accuse') && m.c))
  const settlement = (sim.facts.conf_settlement as string | undefined) ?? null
  return {
    ending, title: meta.title, tagline: meta.tagline, number: meta.n,
    summary: SUMMARY[ending],
    alokNote: ending === 'alok' ? (a.alokFair
      ? 'Judged honestly, this was fair as well as kind: you asked, listened and acted without taking one side against another’s dignity, and the family is measurably better placed for it.'
      : 'Judged honestly, this was kind but not entirely fair: much of the support softened conflict without resolving it, and several grievances were left for others to carry. Gentleness was not the same as justice.') : undefined,
    analysis: a, fits, reasons, statements: choiceStatements(sim),
    behaviour: { parents: behaviour(sim, a, 'parents'), children: behaviour(sim, a, 'children'), alok: behaviour(sim, a, 'alok') },
    best, worst, missed: missedCompromises(sim), rel: relationshipChanges(sim), conflicts: openConflicts(sim),
    family: (Object.keys(fam) as FamilyAttr[]).map((k) => ({ attr: k, label: FAMILY_LABEL[k], word: familyWord(k, fam[k]), value: fam[k], start: first[k] })),
    // each pan's weight is how much of the harm was done *to* that side; small totals keep the scale nearly level
    balance: {
      parents: clamp01(a.childNeglect / Math.max(3, a.childNeglect + a.parentImposition)),
      children: clamp01(a.parentImposition / Math.max(3, a.childNeglect + a.parentImposition)),
    },
    confrontation: { settlement, refused, apologised, silent: ALL.filter((c) => sim.memory.some((m) => m.actor === c && m.scenario === 's16' && m.k === 'absorb')) },
  }
}
