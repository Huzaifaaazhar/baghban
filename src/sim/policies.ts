import type { LensKey } from '../scenarios/kit'
import type { Option } from '../types'
import type { Act } from './types'
import type { Chooser } from './runner'

/**
 * Play styles used by the automated tests. A style is defined by what its choices *do* (the acts inside each
 * option), never by which option id or ending it should lead to. The verdict then judges the consequences.
 */
const arr = (x: Act | Act[] | undefined): Act[] => (x === undefined ? [] : Array.isArray(x) ? x : [x])

export function pressure(o: Option): number {
  let s = 0
  for (const a of arr(o.act)) {
    const w: Record<string, number> = { shame: 3, guilt: 3, accuse: 3, impose: 2.5, intrude: 2.5, dismiss: 2, refuse: 1.5, request: 0.5 }
    if (w[a.k] === undefined) continue
    s += w[a.k] + (a.tone === 'blunt' ? 1 : a.tone === 'harsh' ? 2 : 0) - (a.hear ? 0.7 : 0) - (a.alt ? 0.7 : 0) - (a.why ? 0.4 : 0)
  }
  return s
}
export function conciliation(o: Option): number {
  let s = 0
  for (const a of arr(o.act)) {
    if (a.k === 'apologize') s += a.apology?.own && a.apology?.nobut ? 4 : 1.5
    else if (a.k === 'compromise') s += 3
    else if (a.k === 'listen') s += 3
    else if (a.k === 'confide') s += 2.5
    else if (a.k === 'offer' || a.k === 'support') s += 2
    else if (a.k === 'thank') s += 2
    else if (a.k === 'concede') s += 1.5
    else if (a.k === 'defend') s += 1
    else continue
    s += (a.hear ? 1 : 0) + (a.alt ? 1 : 0) + (a.tone === 'warm' ? 0.5 : 0)
  }
  return s - pressure(o) * 0.5
}
export function avoidance(o: Option): number {
  return arr(o.act).filter((a) => a.k === 'absorb' || a.k === 'withhold' || a.k === 'deflect').length
}

const argmax = (opts: Option[], f: (o: Option) => number) => opts.map((o, i) => [o, f(o), i] as const).sort((a, b) => b[1] - a[1] || a[2] - b[2])[0][0].id

export interface Style {
  name: string
  describe: string
  lens: (i: number, own: LensKey) => LensKey
  choose: Chooser
}

export const STYLES: Style[] = [
  { name: 'parents-first', describe: 'Always in the parents’ place, pressing their expectations and answering resistance with authority.', lens: () => 'parent', choose: (opts) => argmax(opts, pressure) },
  { name: 'children-first', describe: 'Always in the children’s place, protecting independence and setting parents’ demands aside.', lens: () => 'child', choose: (opts) => argmax(opts, pressure) },
  { name: 'alok', describe: 'Always as Alok: patient, warm, supportive.', lens: () => 'alok', choose: (opts) => argmax(opts, (o) => conciliation(o) + 0.01) },
  { name: 'alok-comfort', describe: 'As Alok: gentle, but smoothing things over rather than naming them.', lens: () => 'alok', choose: (opts) => argmax(opts, (o) => Math.max(0, conciliation(o)) * 0.4 + avoidance(o) * 3 - pressure(o)) },
  { name: 'compromise', describe: 'Always seeking compromise, through whichever perspective the situation calls for.', lens: (i) => (['parent', 'child', 'alok'] as LensKey[])[i % 3], choose: (opts) => argmax(opts, conciliation) },
  { name: 'avoidant', describe: 'Always keeping the peace by saying nothing.', lens: (_i, own) => own, choose: (opts) => argmax(opts, (o) => avoidance(o) * 3 - pressure(o)) },
]
