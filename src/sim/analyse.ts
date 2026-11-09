import type { CharacterId } from '../types'
import { ALL, SONS, WIVES } from './data'
import { family, getBond, HURTFUL } from './engine'
import type { ActKind, Concern, LogEntry, Memory, Sim } from './types'

export type Group = 'parents' | 'children' | 'alok'
export const groupOf = (c: CharacterId): Group => (c === 'raj' || c === 'pooja' ? 'parents' : c === 'alok' ? 'alok' : 'children')
const KIDS: CharacterId[] = [...SONS, ...WIVES]
const SOFT_KINDS: ActKind[] = ['compromise', 'listen', 'apologize', 'offer', 'support', 'thank', 'confide', 'concede', 'defend']
const AVOID_KINDS: ActKind[] = ['absorb', 'withhold', 'deflect']
const HARM_KINDS: ActKind[] = HURTFUL.filter((k) => k !== 'deflect' && k !== 'withhold')

const harmOf = (m: Memory) => (HARM_KINDS.includes(m.k) ? m.blame : (m.k === 'deflect' || m.k === 'withhold') ? m.blame * 0.5 : 0)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const r1 = (n: number) => Math.round(n * 10) / 10
const compositeFam = (f: ReturnType<typeof family>) => (f.cohesion + f.communication + f.mutualRespect + f.wellbeing + f.sharedResp + (100 - f.unresolved)) / 6

/* ------------------------------------------------------------------ */
/* Whole-playthrough analysis                                          */
/* ------------------------------------------------------------------ */
export interface Analysis {
  fam: ReturnType<typeof family>
  /** Blame-weighted harm done by each side (fair requests count for little; needless cruelty for a lot). */
  harm: Record<Group, number>
  /** Warmth / repair offered by each side. */
  repair: Record<Group, number>
  /** Children's failures toward parents' needs, and parents' impositions on children's lives. */
  childNeglect: number
  parentImposition: number
  /** Needs left unmet at the end: open grievances held by each side, plus scars. */
  unmet: { parents: number; children: number }
  avoidance: Record<Group, number>
  agreements: { active: number; broken: number }
  apologies: { total: number; good: number }
  compromises: number
  unvoiced: number
  maxScar: number
  /** Share of chapters in which the household ended better than it began. */
  steady: number
  damagingChapters: number
  /** Share of the player's decisions made through each lens. */
  lensShare: Record<'parent' | 'child' | 'alok', number>
  styleShare: { soft: number; hard: number; avoid: number }
  alok: { warm: number; harm: number; avoid: number; acts: number; avoidShare: number; intrusions: number }
  /** Honest judgement of Alok's approach. */
  alokFair: boolean
  parentsSecurity: number
  childrenIndependence: number
}

export function analyse(sim: Sim): Analysis {
  const fam = family(sim)
  const harm = { parents: 0, children: 0, alok: 0 } as Record<Group, number>
  const repair = { parents: 0, children: 0, alok: 0 } as Record<Group, number>
  const avoidance = { parents: 0, children: 0, alok: 0 } as Record<Group, number>
  let childNeglect = 0, parentImposition = 0, compromises = 0
  const apologies = { total: 0, good: 0 }
  for (const m of sim.memory) {
    const g = groupOf(m.actor)
    harm[g] += harmOf(m)
    if (SOFT_KINDS.includes(m.k)) repair[g] += m.warm
    if (AVOID_KINDS.includes(m.k) || m.k === 'absorb') avoidance[g] += 1
    if (m.k === 'apologize') { apologies.total++; if (m.warm >= 0.35) apologies.good++ }
    if (m.k === 'compromise' || (m.k === 'concede' && m.warm > 0.3)) compromises++
    if (g === 'children' && groupOf(m.target) === 'parents') childNeglect += harmOf(m)
    // children also fail the family by shirking shared responsibility toward one another
    else if (g === 'children' && (m.c === 'fairness' || m.c === 'usefulness') && KIDS.includes(m.target)) childNeglect += harmOf(m) * 0.6
    if (g === 'parents' && m.target !== 'raj' && m.target !== 'pooja') parentImposition += harmOf(m)
  }
  const open = sim.issues.filter((i) => i.open)
  const unmet = {
    parents: sum(open.filter((i) => groupOf(i.a) === 'parents').map((i) => i.sev)) + sum(Object.entries(sim.bonds).filter(([k]) => groupOf(k.split('>')[0] as CharacterId) === 'parents').map(([, b]) => b.scar)) / 20,
    children: sum(open.filter((i) => groupOf(i.a) === 'children').map((i) => i.sev)) + sum(Object.entries(sim.bonds).filter(([k]) => groupOf(k.split('>')[0] as CharacterId) === 'children').map(([, b]) => b.scar)) / 20,
  }
  const hist = sim.history
  let steady = 0, damaging = 0
  for (let i = 1; i < hist.length; i++) {
    const d = compositeFam(hist[i].fam) - compositeFam(hist[i - 1].fam)
    if (d > -0.4) steady++
    if (d < -2) damaging++
  }
  const chapters = Math.max(1, hist.length - 1)
  const entries = sim.log
  const nE = Math.max(1, entries.length)
  const lensShare = { parent: 0, child: 0, alok: 0 }
  const styleShare = { soft: 0, hard: 0, avoid: 0 }
  for (const e of entries) {
    lensShare[e.lens] += 1 / nE
    if (e.style === 'soft') styleShare.soft += 1 / nE
    if (e.style === 'hard') styleShare.hard += 1 / nE
    if (e.style === 'avoid') styleShare.avoid += 1 / nE
  }
  const am = sim.memory.filter((m) => m.actor === 'alok')
  const alokActs = am.filter((m) => m.k !== 'apologize' || true)
  const alokAvoid = alokActs.filter((m) => AVOID_KINDS.includes(m.k)).length
  const alok = {
    warm: r1(sum(am.filter((m) => SOFT_KINDS.includes(m.k)).map((m) => m.warm))),
    harm: r1(sum(am.map(harmOf))),
    avoid: alokAvoid, acts: alokActs.length,
    avoidShare: alokActs.length ? alokAvoid / alokActs.length : 0,
    intrusions: am.filter((m) => m.k === 'intrude').length,
  }
  const maxScar = Math.max(0, ...Object.values(sim.bonds).map((b) => b.scar))
  const unvoiced = open.filter((i) => i.id.endsWith('unvoiced')).length
  const parentsSecurity = (sim.self.raj.security + sim.self.pooja.security) / 2
  const childrenIndependence = sum(KIDS.map((c) => sim.self[c].independence)) / KIDS.length
  return {
    fam, harm: mapR(harm), repair: mapR(repair), childNeglect: r1(childNeglect), parentImposition: r1(parentImposition),
    unmet: { parents: r1(unmet.parents), children: r1(unmet.children) }, avoidance,
    agreements: { active: sim.agreements.filter((g) => g.active).length, broken: sim.agreements.filter((g) => g.brokenBy.length).length },
    apologies, compromises, unvoiced, maxScar: r1(maxScar), steady: steady / chapters, damagingChapters: damaging,
    lensShare, styleShare, alok,
    alokFair: alok.avoidShare <= 0.34 && fam.unresolved <= 38 && alok.intrusions <= 1 && alok.harm <= 1.6,
    parentsSecurity: r1(parentsSecurity), childrenIndependence: r1(childrenIndependence),
  }
}
const mapR = (o: Record<Group, number>) => ({ parents: r1(o.parents), children: r1(o.children), alok: r1(o.alok) })

/* ------------------------------------------------------------------ */
/* Who is where, emotionally — used by the confrontation and the verdict */
/* ------------------------------------------------------------------ */
export interface Grievance { who: CharacterId; note: string; felt: number; concern?: Concern; scenario?: string }
export interface Stance {
  id: CharacterId
  speak: 'speaks' | 'hesitant' | 'silent'
  neglected: boolean
  resentful: boolean
  willingToApologise: boolean
  refusesToCompromise: boolean
  /** What this person holds against whom, drawn from real unresolved acts. */
  holds: Grievance[]
  /** What this person did that still stands between them and someone. */
  owes: Grievance[]
  /** The person this character most trusts at the table. */
  trusts?: CharacterId
  resentment: number
  security: number
}

export function stanceOf(sim: Sim, c: CharacterId): Stance {
  const others = ALL.filter((x) => x !== c)
  const bonds = others.map((x) => ({ x, b: getBond(sim, c, x) }))
  const avgRes = sum(bonds.map((b) => b.b.resentment)) / bonds.length
  const avgHeard = sum(bonds.map((b) => b.b.heard)) / bonds.length
  const sec = sim.self[c].security, comp = sim.self[c].compromise
  const scored = bonds.map(({ x, b }) => {
    const mem = sim.memory.filter((m) => m.actor === x && m.target === c && !m.resolved && HARM_KINDS.includes(m.k) && m.felt >= 0.25).sort((a, b2) => b2.felt - a.felt)[0]
    const issue = sim.issues.find((i) => i.open && i.a === c && i.b === x)
    // how heavily the remembered act still weighs: an open grievance weighs in full; one that has been addressed, much less
    const weight = issue ? Math.min(1, issue.sev / 0.6) : 0.2
    const score = b.resentment + b.scar * 1.2 + (mem ? mem.felt * 40 * weight : 0) + (issue ? issue.sev * 20 : 0)
    return { x, score, mem, issue, b }
  }).sort((a, b) => b.score - a.score)
  const holds: Grievance[] = scored.filter((s) => s.score >= 28 && (s.mem || s.issue)).slice(0, 2).map((s) => ({
    who: s.x, note: s.mem?.n ?? s.issue!.text, felt: Math.round((s.mem ? s.mem.felt * (s.issue ? Math.min(1, s.issue.sev / 0.6) : 0.2) : s.issue!.sev) * 100) / 100, concern: s.mem?.c ?? s.issue?.concern, scenario: s.mem?.scenario,
  }))
  const owesRaw = sim.memory.filter((m) => m.actor === c && !m.resolved && HARM_KINDS.includes(m.k) && m.blame >= 0.3).sort((a, b) => b.blame - a.blame)
  const seen = new Set<string>()
  const owes: Grievance[] = []
  for (const m of owesRaw) { if (seen.has(m.target)) continue; seen.add(m.target); owes.push({ who: m.target, note: m.n, felt: m.blame, concern: m.c, scenario: m.scenario }); if (owes.length >= 2) break }
  const maxRes = Math.max(...bonds.map((b) => b.b.resentment))
  const scarMax = Math.max(...bonds.map((b) => b.b.scar))
  const openNeglect = sim.issues.filter((i) => i.open && i.a === c && ['belonging', 'recognition', 'fairness', 'usefulness'].includes(i.concern)).reduce((a, i) => a + i.sev, 0)
  const carerLoad = SONS.includes(c) && (sim.load[c] ?? 0) >= 40
  const neglected = avgHeard < 34 || openNeglect >= 0.5 || carerLoad
  const resentful = avgRes >= 26 || maxRes >= 45
  let speak: Stance['speak'] = 'speaks'
  if (sec < 36 && avgHeard < 32 && maxRes < 45) speak = 'silent'
  else if (sec < 46 && maxRes < 40) speak = 'hesitant'
  const topOwed = owes[0]
  const willing = !!topOwed && comp >= 48 && sec >= 34 && getBond(sim, c, topOwed.who).resentment < 48
  const refuses = comp <= 42 || (scarMax >= 12 && maxRes >= 40)
  const trusts = [...bonds].sort((a, b) => b.b.trust + b.b.heard - b.b.resentment - (a.b.trust + a.b.heard - a.b.resentment))[0]?.x
  return { id: c, speak, neglected, resentful, willingToApologise: willing, refusesToCompromise: refuses, holds, owes, trusts, resentment: Math.round(avgRes * 10) / 10, security: sec }
}

export const allStances = (sim: Sim): Record<CharacterId, Stance> =>
  Object.fromEntries(ALL.map((c) => [c, stanceOf(sim, c)])) as Record<CharacterId, Stance>

export { compositeFam }
export type { LogEntry }
