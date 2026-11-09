import type { CharacterId } from '../types'
import type { Bond, Concern, Sim, SelfState } from './types'

export const ALL: CharacterId[] = ['raj', 'pooja', 'vikram', 'meera', 'rohan', 'simran', 'kabir', 'ananya', 'alok']
export const PARENTS: CharacterId[] = ['raj', 'pooja']
export const SONS: CharacterId[] = ['vikram', 'rohan', 'kabir']
export const WIVES: CharacterId[] = ['meera', 'simran', 'ananya']
export const SPOUSE: Partial<Record<CharacterId, CharacterId>> = {
  raj: 'pooja', pooja: 'raj', vikram: 'meera', meera: 'vikram', rohan: 'simran', simran: 'rohan', kabir: 'ananya', ananya: 'kabir',
}
export const isParent = (c: CharacterId) => c === 'raj' || c === 'pooja'
export const isSon = (c: CharacterId) => c === 'vikram' || c === 'rohan' || c === 'kabir'
export const isWife = (c: CharacterId) => c === 'meera' || c === 'simran' || c === 'ananya'

/** How much each person cares about each concern (0..1). Drives how hard a given act lands. */
const W = (o: Partial<Record<Concern, number>>) => o
export const CONCERN_WEIGHT: Record<CharacterId, Partial<Record<Concern, number>>> = {
  raj: W({ dignity: 0.95, usefulness: 0.9, autonomy: 0.8, routine: 0.8, sleep: 0.25, privacy: 0.35, approval: 0.6, belonging: 0.75, recognition: 0.7, money: 0.7, health: 0.5, honesty: 0.5, fairness: 0.6, tradition: 0.7 }),
  pooja: W({ belonging: 0.95, health: 0.45, routine: 0.6, dignity: 0.6, approval: 0.5, tradition: 0.75, privacy: 0.3, recognition: 0.65, usefulness: 0.7, sleep: 0.4, honesty: 0.5, autonomy: 0.4, money: 0.5, fairness: 0.55 }),
  vikram: W({ sleep: 0.85, money: 0.85, approval: 0.85, autonomy: 0.75, dignity: 0.7, privacy: 0.6, fairness: 0.8, routine: 0.5, recognition: 0.8, honesty: 0.6, belonging: 0.5, usefulness: 0.5, health: 0.5, tradition: 0.4 }),
  meera: W({ privacy: 0.9, autonomy: 0.85, sleep: 0.7, fairness: 0.8, dignity: 0.7, recognition: 0.6, money: 0.6, honesty: 0.8, routine: 0.6, belonging: 0.4, approval: 0.4, usefulness: 0.4, health: 0.5, tradition: 0.3 }),
  rohan: W({ fairness: 0.7, money: 0.8, approval: 0.7, recognition: 0.8, belonging: 0.6, autonomy: 0.6, honesty: 0.5, dignity: 0.75, sleep: 0.5, privacy: 0.4, routine: 0.3, usefulness: 0.6, health: 0.4, tradition: 0.4 }),
  simran: W({ autonomy: 0.9, recognition: 0.85, privacy: 0.8, fairness: 0.85, dignity: 0.8, money: 0.7, sleep: 0.6, honesty: 0.7, belonging: 0.3, approval: 0.4, routine: 0.4, usefulness: 0.5, health: 0.4, tradition: 0.2 }),
  kabir: W({ approval: 0.85, fairness: 0.6, money: 0.7, belonging: 0.7, recognition: 0.6, autonomy: 0.65, honesty: 0.6, dignity: 0.6, sleep: 0.6, privacy: 0.5, routine: 0.3, usefulness: 0.8, health: 0.5, tradition: 0.4 }),
  ananya: W({ belonging: 0.8, autonomy: 0.8, recognition: 0.7, health: 0.8, sleep: 0.85, privacy: 0.7, honesty: 0.8, fairness: 0.7, dignity: 0.6, money: 0.6, approval: 0.5, tradition: 0.3, routine: 0.4, usefulness: 0.5 }),
  alok: W({ belonging: 0.95, usefulness: 0.9, recognition: 0.6, honesty: 0.7, dignity: 0.6, autonomy: 0.5, approval: 0.8, fairness: 0.6, money: 0.6, privacy: 0.4, sleep: 0.4, routine: 0.3, health: 0.4, tradition: 0.5 }),
}
export const weight = (c: CharacterId, k: Concern) => CONCERN_WEIGHT[c][k] ?? 0.45

/** Private information. Holders know their own; everyone else learns only by listening, noticing or remembering. */
export interface Info { id: string; holder: CharacterId; title: string; text: string }
export const INFO: Record<string, Info> = {
  'host-strain': { id: 'host-strain', holder: 'vikram', title: 'A stretched household', text: 'The flat you are sleeping in is already stretched: an exam, a shift, a baby, a deadline. Every extra noise lands on someone with nothing left.' },
  'raj-insomnia': { id: 'raj-insomnia', holder: 'raj', title: 'Raj cannot sleep', text: 'Since the knee began to ache, Raj lies awake until two. The typewriter is how he gets through the night without lying still and listening to the flat breathe around him.' },
  'raj-booklet': { id: 'raj-booklet', holder: 'raj', title: 'The booklet', text: 'Raj is typing “Banking for Ordinary People”: forty years of what he knows, for people who were never taught. It is the first thing in fourteen months that has felt like work.' },
  'raj-lonely': { id: 'raj-lonely', holder: 'raj', title: 'Raj feels like furniture', text: 'In other people’s homes Raj feels like a piece of furniture that has been politely moved aside. His sharpness is where the loneliness comes out.' },
  'raj-excluded': { id: 'raj-excluded', holder: 'raj', title: 'Decided over his head', text: 'Raj hears about decisions concerning him after they are made. He has stopped asking, because asking feels like begging.' },
  'raj-letters': { id: 'raj-letters', holder: 'raj', title: 'The letters', text: 'In the steel almirah Raj keeps one letter from each son, from hostel years. He reads them when he thinks he has failed.' },
  'raj-gift': { id: 'raj-gift', holder: 'raj', title: 'A gift he can’t give', text: 'Raj ordered a small gift for Pooja weeks ago. He does not know how to hand it over without it sounding like an apology.' },
  'vik-bonus': { id: 'vik-bonus', holder: 'vikram', title: 'Vikram’s bonus', text: 'Vikram’s bonus was halved this year. He has not told Meera, and has been quietly shifting money between accounts to cover it.' },
  'vik-judged': { id: 'vik-judged', holder: 'vikram', title: 'Never “well done”', text: 'Vikram cannot remember Raj saying “well done” to him since school. Every conversation with his father feels like an audit.' },
  'rohan-invoices': { id: 'rohan-invoices', holder: 'rohan', title: 'Rohan’s invoices', text: 'Three of Rohan’s invoices are ninety days overdue. Simran has been covering the studio’s gaps from her own freelance money.' },
  'rohan-overload': { id: 'rohan-overload', holder: 'rohan', title: 'Rohan does the errands', text: 'For a year Rohan has done almost every pharmacy run, hospital visit and bank queue for his parents. His diary is full of them. He has told no one.' },
  'kabir-debt': { id: 'kabir-debt', holder: 'kabir', title: 'The debt Kabir can’t repay', text: 'Kabir tells himself he will repay the fixed deposit one day. Each month he does not, it gets heavier — and it keeps him from calling home.' },
  'kabir-offer': { id: 'kabir-offer', holder: 'kabir', title: 'The offer from elsewhere', text: 'Kabir has a job offer in another city that would clear his loan and feed his growing family. He has told no one, because it feels like running away.' },
  'pooja-pills': { id: 'pooja-pills', holder: 'pooja', title: 'The rationed tablets', text: 'Pooja takes her blood-pressure tablet every other day to make the strip last. She calls it “remembering when I remember.”' },
  'pooja-excluded': { id: 'pooja-excluded', holder: 'pooja', title: 'Pooja feels left out', text: 'Pooja hears about family decisions in the corridor, after. She has taught herself to smile through it.' },
  'pooja-quiet-home': { id: 'pooja-quiet-home', holder: 'pooja', title: 'The quiet house', text: 'Verma Sadan has become too quiet. Pooja keeps the radio on all day to hear a voice. She will not say this, because it sounds like a complaint.' },
  'pooja-found-papers': { id: 'pooja-found-papers', holder: 'pooja', title: 'What Pooja saw', text: 'While tidying, Pooja saw papers she was not meant to see — numbers that explain a child’s tiredness. She put them back exactly, and has said nothing.' },
  'meera-watched': { id: 'meera-watched', holder: 'meera', title: 'Meera feels watched', text: 'Meera has stopped taking phone calls at home and changes in the bathroom. It is her house, and she feels like a guest in it.' },
  'simran-judged': { id: 'simran-judged', holder: 'simran', title: 'Simran feels judged', text: 'Simran hears the little comments about her work, her hours, her dupatta. Rohan has never heard them. She has stopped telling him because he says “they don’t mean it.”' },
  'ananya-alone': { id: 'ananya-alone', holder: 'ananya', title: 'Ananya is alone with the baby', text: 'Ananya has not slept properly in weeks. Pooja’s help arrives as instruction, and Kabir’s as apology. She wants someone to simply sit with her.' },
  'alok-belong': { id: 'alok-belong', holder: 'alok', title: 'Alok needs to belong', text: 'Alok’s kindness is real. It is also how he holds a place at a table that is not his. He fears the day he is no longer needed.' },
  'alok-paid': { id: 'alok-paid', holder: 'alok', title: 'Alok has been paying', text: 'Alok has quietly paid for Pooja’s tablets for three months. He skipped a payment to his own supplier to do it.' },
  'vik-offer': { id: 'vik-offer', holder: 'vikram', title: 'The Pune offer', text: 'Vikram has been offered the regional head role in Pune. He has told no one: the move would leave Rohan holding everything, and he cannot decide whether that is a reason or an excuse.' },
  'rohan-offer': { id: 'rohan-offer', holder: 'rohan', title: 'The Hyderabad offer', text: 'A studio in Hyderabad has offered Rohan a salaried partnership. It would end the invoice chase. He has told no one, because it would mean leaving Simran’s family and his parents in one stroke.' },
  'pooja-sacrificed': { id: 'pooja-sacrificed', holder: 'pooja', title: 'The classes she gave up', text: 'Pooja stopped teaching embroidery the year Kabir went abroad, so Raj’s pension could stretch. She has never said she missed it.' },
}

/* ------------------------------------------------------------------ */
/* Starting state                                                      */
/* ------------------------------------------------------------------ */

const bond = (o: Partial<Bond> = {}): Bond => ({ trust: 60, respect: 64, resentment: 12, heard: 44, distance: 32, scar: 0, ...o })
export const bkey = (a: CharacterId, b: CharacterId) => `${a}>${b}`

function baseBond(a: CharacterId, b: CharacterId): Bond {
  if (SPOUSE[a] === b) return bond({ trust: 80, respect: 76, resentment: 8, heard: 56, distance: 14 })
  if (isParent(a) && isParent(b)) return bond({ trust: 82, respect: 78, resentment: 8, heard: 58, distance: 12 })
  if (a === 'alok') return isParent(b) ? bond({ trust: 86, respect: 88, resentment: 4, heard: 72, distance: 12 }) : bond({ trust: 56, respect: 54, resentment: 10, heard: 42, distance: 38 })
  if (b === 'alok') return isParent(a) ? bond({ trust: 84, respect: 74, resentment: 4, heard: 60, distance: 14 }) : bond({ trust: 48, respect: 52, resentment: 12, heard: 38, distance: 42 })
  if (isParent(a) && (isSon(b))) return bond({ trust: 64, respect: 66, resentment: 12, heard: 42, distance: 30 })
  if (isSon(a) && isParent(b)) return bond({ trust: 62, respect: 70, resentment: 14, heard: 38, distance: 32 })
  if (isParent(a) && isWife(b)) return bond({ trust: 56, respect: 62, resentment: 8, heard: 40, distance: 40 })
  if (isWife(a) && isParent(b)) return bond({ trust: 54, respect: 68, resentment: 10, heard: 36, distance: 40 })
  if (isSon(a) && isSon(b)) return bond({ trust: 58, respect: 58, resentment: 14, heard: 44, distance: 30 })
  if (isWife(a) && isWife(b)) return bond({ trust: 58, respect: 62, resentment: 8, heard: 50, distance: 36 })
  if (isSon(a) && isWife(b)) return bond({ trust: 56, respect: 60, resentment: 10, heard: 44, distance: 38 }) // brother's wife
  if (isWife(a) && isSon(b)) return bond({ trust: 56, respect: 60, resentment: 10, heard: 42, distance: 38 })
  return bond()
}

const OVERRIDES: [CharacterId, CharacterId, Partial<Bond>][] = [
  ['vikram', 'raj', { heard: 34, resentment: 20, respect: 74 }],
  ['raj', 'vikram', { heard: 40, respect: 66 }],
  ['kabir', 'raj', { distance: 46, resentment: 8, trust: 56 }],
  ['raj', 'kabir', { respect: 60, heard: 46 }],
  ['rohan', 'vikram', { resentment: 20, respect: 60 }],
  ['vikram', 'rohan', { resentment: 20, respect: 52, trust: 52 }],
  ['vikram', 'kabir', { resentment: 22, trust: 54 }],
  ['kabir', 'vikram', { trust: 50, respect: 66 }],
  ['simran', 'raj', { heard: 32, trust: 50 }],
  ['simran', 'pooja', { heard: 34, trust: 52 }],
  ['meera', 'raj', { respect: 72 }],
  ['ananya', 'pooja', { trust: 62, respect: 72, heard: 40 }],
  ['pooja', 'ananya', { heard: 40 }],
  ['vikram', 'alok', { trust: 46, resentment: 16 }],
]

const SELF0: Record<CharacterId, SelfState> = {
  raj: { security: 52, independence: 72, compromise: 34, finStress: 46 },
  pooja: { security: 50, independence: 44, compromise: 62, finStress: 36 },
  vikram: { security: 44, independence: 70, compromise: 44, finStress: 58 },
  meera: { security: 56, independence: 72, compromise: 50, finStress: 40 },
  rohan: { security: 48, independence: 56, compromise: 66, finStress: 72 },
  simran: { security: 52, independence: 74, compromise: 44, finStress: 62 },
  kabir: { security: 46, independence: 50, compromise: 60, finStress: 62 },
  ananya: { security: 52, independence: 56, compromise: 60, finStress: 56 },
  alok: { security: 56, independence: 62, compromise: 60, finStress: 52 },
}

/** What each character knows at the start. Everyone knows their own secrets; some things are common knowledge. */
function initialKnowledge(): Record<string, string[]> {
  const k: Record<string, string[]> = {}
  for (const c of ALL) k[c] = Object.values(INFO).filter((i) => i.holder === c).map((i) => i.id)
  // Known to a few already: Pooja knows the knee; Alok knows about the booklet idea only because he'll print it.
  k.alok.push('raj-booklet')
  k.pooja.push('raj-booklet', 'raj-insomnia')
  return k
}

export function newSim(): Sim {
  const bonds: Sim['bonds'] = {}
  for (const a of ALL) for (const b of ALL) if (a !== b) bonds[bkey(a, b)] = baseBond(a, b)
  for (const [a, b, o] of OVERRIDES) bonds[bkey(a, b)] = { ...bonds[bkey(a, b)], ...o }
  return {
    t: 0,
    self: JSON.parse(JSON.stringify(SELF0)),
    bonds,
    // caregiving load: rough share of parental errands — Rohan quietly does most
    load: { vikram: 20, rohan: 55, kabir: 5, meera: 10, simran: 8, ananya: 2 },
    goodwill: {},
    apologies: {},
    memory: [],
    issues: [],
    agreements: [],
    pending: [],
    knowledge: initialKnowledge(),
    insights: [],
    flags: [],
    facts: {},
    comm: 0,
    history: [],
  }
}
