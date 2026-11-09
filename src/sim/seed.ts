import type { CharacterId, PersonaId, Stat } from '../types'
import { isSon, newSim, SONS } from './data'
import { applyAct, applyFx, clone, learn, snapshot } from './engine'
import type { Act, Sim } from './types'

export interface Prologue {
  persona: PersonaId
  flags: string[]
  relations: Partial<Record<CharacterId, number>>
  stats: Record<Stat, number>
}

/** Which son the parents stay with while the roof is mended (and who then hosts them for the winter). */
export function chooseHost(p: Prologue): CharacterId {
  const f = (x: string) => p.flags.includes(x)
  if (f('stay-with-rohan') || f('rohan-doubled-down')) return 'rohan'
  if (f('offered-home-kabir')) return 'kabir'
  if (f('offered-home-vikram')) return 'vikram'
  if (f('said-no-room')) return 'vikram' === p.persona ? 'rohan' : 'vikram'
  if (isSon(p.persona) && p.persona !== 'kabir') return p.persona // Kabir's box room can't host
  return 'vikram'
}

export const SPOUSE_OF: Partial<Record<CharacterId, CharacterId>> = { vikram: 'meera', rohan: 'simran', kabir: 'ananya' }

/** Build the simulation's opening state from what happened on that first Sunday. */
export function seedFromPrologue(p: Prologue): Sim {
  const s = newSim()
  const me = p.persona
  const f = (x: string) => p.flags.includes(x)
  s.flags.push(...p.flags.map((x) => `p1:${x}`))

  // lingering feelings toward the player's character
  for (const [c, rel] of Object.entries(p.relations) as [CharacterId, number][]) {
    if (c === me) continue
    const b = s.bonds[`${c}>${me}`]
    b.trust += rel * 0.25
    b.heard += rel * 0.2
    b.distance -= rel * 0.15
    if (rel < 0) b.resentment += -rel * 0.35
    if (rel <= -12) b.scar += 2.5
  }
  // the evening's overall mood
  const dTrust = (p.stats.trust - 50) * 0.12
  for (const b of Object.values(s.bonds)) { b.trust += dTrust }
  for (const c of SONS) s.self[c].finStress += Math.max(0, p.stats.burden - 30) * 0.3
  for (const c of ['raj', 'pooja'] as const) s.self[c].security += (p.stats.dignity - 55) * 0.25
  s.comm += (p.stats.warmth - 50) * 0.08

  const act = (a: Act) => applyAct(s, a, 'prologue')
  const fam: CharacterId[] = ['raj', 'pooja', 'vikram', 'meera', 'rohan', 'simran', 'kabir', 'ananya']
  const others = fam.filter((c) => c !== me)

  if (f('roof-hidden')) for (const c of SONS) act({ by: 'raj', to: c, k: 'withhold', c: 'honesty', tone: 'gentle', n: 'Raj closed the door on the roof — “I will manage” — and told his sons nothing.' })
  if (f('raj-disclosed')) {
    for (const c of SONS) { act({ by: 'raj', to: c, k: 'confide', c: 'honesty', tone: 'warm', n: 'Raj told his sons about the knee, the fixed deposit and the roof.' }) }
    s.comm += 3
  }
  if (f('pooja-revealed-knee')) act({ by: 'pooja', to: 'raj', k: 'impose', c: 'dignity', tone: 'gentle', n: 'Pooja exposed Raj’s knee in front of his sons.' })
  if (f('pooja-shielded') || f('pooja-deflected')) act({ by: 'pooja', to: 'vikram', k: 'deflect', c: 'honesty', tone: 'gentle', n: 'Pooja steered the roof conversation away from the truth.' })
  if (f('asked-for-the-truth')) act({ by: me, to: 'raj', k: 'request', c: 'dignity', tone: 'blunt', pub: others.filter((c) => c !== 'raj'), n: 'Asked Raj to state the balance in front of everyone.' })
  if (f('pressed-envelope')) act({ by: me, to: 'raj', k: 'impose', c: 'dignity', tone: 'gentle', n: 'Pressed an envelope into Raj’s hand on the balcony.' })
  if (f('said-no-room')) act({ by: me, to: 'pooja', k: 'refuse', c: 'belonging', tone: 'gentle', why: true, n: 'Said there was no room for the parents in a small flat.' })
  if (f('proposed-rental')) act({ by: me, to: 'raj', k: 'offer', c: 'belonging', tone: 'neutral', n: 'Offered a rented flat instead of a room.' })
  if (f('rohan-overpromised') || f('rohan-doubled-down')) act({ by: 'rohan', to: 'simran', k: 'impose', c: 'autonomy', tone: 'gentle', n: 'Rohan promised their time and money without asking Simran.' })
  if (f('rohan-paused')) act({ by: 'rohan', to: 'simran', k: 'concede', c: 'autonomy', tone: 'warm', n: 'Rohan took back a yes to talk to Simran first.' })
  if (f('vikram-paid')) act({ by: 'vikram', to: 'meera', k: 'impose', c: 'money', tone: 'gentle', n: 'Vikram offered to pay for the roof before telling Meera his bonus had been cut.' })
  if (f('vikram-pressed')) act({ by: 'vikram', to: 'rohan', k: 'accuse', c: 'recognition', tone: 'blunt', n: 'Vikram told Rohan, in the dining room, who had paid for what.' })
  if (f('rohan-answered-back')) act({ by: 'rohan', to: 'vikram', k: 'accuse', c: 'recognition', tone: 'blunt', n: 'Rohan answered back: “I am your brother, not your staff.”' })
  if (f('kabir-honest')) act({ by: 'kabir', to: 'raj', k: 'confide', c: 'honesty', tone: 'warm', n: 'Kabir admitted he could not give much, and asked not to be counted out.' })
  if (f('admitted-need')) act({ by: 'raj', to: 'pooja', k: 'confide', c: 'honesty', tone: 'warm', n: 'Raj said, on the balcony, that he did not know how to ask for help.' })
  if (f('asked-what-papa-wants')) { act({ by: me, to: 'raj', k: 'listen', c: 'belonging', tone: 'warm', n: 'Asked Raj what he wants, instead of how much.' }); learn(s, me, 'raj-lonely') }
  if (f('alok-listened')) { act({ by: 'alok', to: 'raj', k: 'listen', c: 'belonging', tone: 'warm', n: 'Alok listened on the balcony.' }); learn(s, 'alok', 'raj-lonely') }
  if (f('alok-overstepped')) act({ by: 'alok', to: 'vikram', k: 'accuse', c: 'dignity', tone: 'harsh', pub: fam.filter((c) => c !== 'vikram'), n: 'Alok said, in front of everyone, that the sons lacked a conscience.' })
  if (f('alok-promised-too-much')) act({ by: 'alok', to: 'raj', k: 'impose', c: 'dignity', tone: 'gentle', n: 'Alok promised to “see to” Raj’s knee and Pooja’s medicines.' })
  if (f('alok-told-the-sons')) act({ by: 'alok', to: 'vikram', k: 'accuse', c: 'dignity', tone: 'blunt', n: 'Alok told the brothers what Pooja hides behind the rice.' })
  if (f('alok-offered-room')) act({ by: 'alok', to: 'vikram', k: 'offer', c: 'dignity', tone: 'neutral', pub: ['raj', 'pooja'], n: 'Alok offered the parents a room above his shop, in front of the sons.' })
  if (f('bp-strip-known')) {
    for (const c of ['meera', 'simran', 'ananya'] as const) { learn(s, c, 'pooja-pills'); act({ by: 'pooja', to: c, k: 'confide', c: 'health', tone: 'gentle', n: 'Pooja admitted she was stretching her tablets.' }) }
    s.comm += 2
  }
  if (f('bp-strip-hidden')) for (const c of ['meera', 'simran', 'ananya'] as const) act({ by: 'pooja', to: c, k: 'withhold', c: 'health', tone: 'gentle', n: 'Pooja laughed off the tablet strip.' })
  if (f('child-refills-meds')) { act({ by: me, to: 'pooja', k: 'offer', c: 'health', tone: 'warm', n: 'Took charge of Pooja’s tablets.' }); learn(s, me, 'pooja-pills') }
  if (f('alok-noted-strip') || f('alok-organised-care')) learn(s, 'alok', 'pooja-pills')
  if (f('brothers-paused')) for (const a of SONS) for (const b of SONS) if (a !== b) { s.bonds[`${a}>${b}`].trust += 2 }
  if (f('sons-saw-parent-overhear')) { for (const c of ['vikram', 'rohan'] as const) act({ by: 'raj', to: c, k: 'withhold', c: 'dignity', tone: 'gentle', n: 'The brothers realised Raj had heard them.' }) }

  // who hosts the parents this winter
  const host = chooseHost(p)
  s.facts.persona = me
  s.facts.host = host
  s.facts.son = isSon(me) ? me : host
  s.facts.living = 'host'
  s.t = 0
  for (const [k, b] of Object.entries(s.bonds)) s.baseline[k] = { trust: b.trust, respect: b.respect, resentment: b.resentment, heard: b.heard, distance: b.distance }
  snapshot(s, 'prologue')
  return clone(s)
}

export { applyFx }
