import { motion } from 'framer-motion'
import { CHARACTERS } from '../../data/characters'
import { ALL } from '../../sim/data'
import { family, getBond, HURTFUL } from '../../sim/engine'
import { bondWord, FAMILY_LABEL, familyWord } from '../../sim/report'
import { SCENARIOS } from '../../scenarios'
import { useGame } from '../../store/gameStore'
import type { FamilyAttr } from '../../sim/types'
import type { CharacterId } from '../../types'
import { Button } from '../ui/Button'
import { SceneBackdrop } from '../art/SceneBackdrop'

const FAM: FamilyAttr[] = ['cohesion', 'communication', 'mutualRespect', 'unresolved', 'sharedResp', 'wellbeing']
const PAIRS: [CharacterId, CharacterId][] = [
  ['raj', 'vikram'], ['raj', 'rohan'], ['raj', 'kabir'], ['pooja', 'meera'], ['pooja', 'simran'], ['pooja', 'ananya'], ['raj', 'pooja'], ['alok', 'raj'],
]
const short = (b: ReturnType<typeof getBond>) => bondWord(b).replace(' with you', '').replace(' toward you', '').replace(' from you', '').replace(' you', '')

function Spark({ values, bad }: { values: number[]; bad?: boolean }) {
  if (values.length < 2) return null
  const w = 110, h = 26
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / 100) * h}`).join(' ')
  return <svg width={w} height={h} className="overflow-visible" aria-hidden><polyline points={pts} fill="none" stroke={bad ? '#7a2231' : '#6b6b3a'} strokeWidth="2" strokeLinejoin="round" /></svg>
}

/** The close of the year: how the household moved — not a verdict on who was right. */
export function YearInReview({ onInspect, onJournal }: { onInspect: () => void; onJournal: () => void }) {
  const { sim, persona, beginCampaign, goTo } = useGame()
  if (!sim) return null
  const fam = family(sim)
  const first = sim.history[0]?.fam ?? fam

  // friction vs repair per person
  const tally = ALL.map((c) => {
    const mine = sim.memory.filter((m) => m.actor === c)
    const friction = mine.filter((m) => HURTFUL.includes(m.k)).reduce((a, m) => a + m.blame, 0)
    const repair = mine.filter((m) => !HURTFUL.includes(m.k) && m.k !== 'absorb').reduce((a, m) => a + m.warm, 0)
    return { c, friction: Math.round(friction * 10) / 10, repair: Math.round(repair * 10) / 10 }
  })
  const maxF = Math.max(1, ...tally.map((t) => t.friction)), maxR = Math.max(1, ...tally.map((t) => t.repair))

  const bonds = Object.entries(sim.bonds).map(([k, b]) => ({ k, b }))
  const worst = bonds.sort((a, b) => (b.b.resentment + b.b.scar) - (a.b.resentment + a.b.scar))[0]
  const best = [...bonds].sort((a, b) => (b.b.trust + b.b.heard - b.b.resentment) - (a.b.trust + a.b.heard - a.b.resentment))[0]
  const [wa, wb] = worst.k.split('>') as [CharacterId, CharacterId]
  const [ba, bb] = best.k.split('>') as [CharacterId, CharacterId]
  const open = sim.issues.filter((i) => i.open)
  const scarred = bonds.filter((x) => x.b.scar >= 8).length

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      <div className="absolute inset-0 scale-105 blur-[4px]"><SceneBackdrop location="courtyard" time="night" /></div>
      <div className="absolute inset-0 bg-black/75" aria-hidden />
      <div className="scroll-thin absolute inset-0 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-3 pb-14 pt-20 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center text-shadow-film">
            <p className="font-display text-sm uppercase tracking-[0.4em] text-brass">A year at Verma Sadan</p>
            <h1 className="font-display text-4xl font-semibold text-cream sm:text-6xl">How the year went</h1>
            <p className="mx-auto mt-2 max-w-2xl text-lg italic text-beige">This is not a verdict. It is what fifteen situations did to one family — and what each of them carried into the next.</p>
          </motion.div>

          <section className="paper-dark mt-7 rounded-md p-5 sm:p-7" aria-label="The household">
            <h2 className="font-display text-2xl font-semibold text-cream">The household</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {FAM.map((a) => {
                const d = fam[a] - first[a]
                return (
                  <div key={a} className="rounded-sm border border-brass/30 bg-black/25 p-3">
                    <div className="flex items-baseline justify-between"><span className="font-display text-lg font-semibold text-glow">{FAMILY_LABEL[a]}</span><span className="font-display text-lg italic text-cream">{familyWord(a, fam[a])}</span></div>
                    <div className="mt-1 flex items-center justify-between">
                      <Spark values={sim.history.map((h) => h.fam[a])} bad={a === 'unresolved'} />
                      <span className="text-sm text-beige/80">{Math.abs(d) < 3 ? 'about the same as the start' : (d > 0) === (a !== 'unresolved') ? 'better than at the start' : 'worse than at the start'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <ul className="mt-4 space-y-1.5 text-[1.1rem] text-cream">
              <li>The closest bond now is {CHARACTERS[ba].name} toward {CHARACTERS[bb].name}.</li>
              <li>The most strained is {CHARACTERS[wa].name} toward {CHARACTERS[wb].name}{best.k === worst.k ? '' : ''}.</li>
              <li>{open.length === 0 ? 'Nothing important is left unspoken.' : `${open.length} thing${open.length === 1 ? ' is' : 's are'} still unresolved between people who love each other.`}</li>
              <li>{scarred === 0 ? 'No injury from this year has left a lasting mark.' : `${scarred} relationship${scarred === 1 ? '' : 's'} still carr${scarred === 1 ? 'ies' : 'y'} a scar that time has not erased.`}</li>
            </ul>
          </section>

          <section className="paper-dark mt-5 rounded-md p-5 sm:p-7" aria-label="Key relationships">
            <h2 className="font-display text-2xl font-semibold text-cream">Between them</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {PAIRS.map(([a, b]) => (
                <li key={a + b} className="rounded-sm border border-brass/25 bg-black/25 p-2.5 text-[1.05rem] text-cream">
                  <span className="font-semibold">{CHARACTERS[a].name}</span> toward {CHARACTERS[b].name}: <em className="text-beige">{short(getBond(sim, a, b))}</em><br />
                  <span className="font-semibold">{CHARACTERS[b].name}</span> toward {CHARACTERS[a].name}: <em className="text-beige">{short(getBond(sim, b, a))}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="paper-dark mt-5 rounded-md p-5 sm:p-7" aria-label="Where friction and repair came from">
            <h2 className="font-display text-2xl font-semibold text-cream">Where the friction came from — and the repair</h2>
            <p className="mt-1 text-base italic text-beige">Blame is weighted by whether a request was fair, whether the person knew the reason, and what they had been given before. A fair “no” counts for little. A needless cruelty counts for a great deal. Everyone contributes; not equally.</p>
            <ul className="mt-3 space-y-2">
              {tally.filter((t) => t.friction > 0 || t.repair > 0).sort((a, b) => b.friction - a.friction).map((t) => (
                <li key={t.c} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-[1.02rem] text-cream sm:grid-cols-[7rem_1fr]">
                  <span className="font-display text-lg font-semibold">{CHARACTERS[t.c].name}</span>
                  <span className="grid gap-1">
                    <span className="flex items-center gap-2"><span className="h-2 rounded-full bg-[#a14a5a]" style={{ width: `${(t.friction / maxF) * 100}%`, minWidth: t.friction > 0 ? 4 : 0 }} /><span className="text-sm text-beige">friction {t.friction}</span></span>
                    <span className="flex items-center gap-2"><span className="h-2 rounded-full bg-[#8a9a4a]" style={{ width: `${(t.repair / maxR) * 100}%`, minWidth: t.repair > 0 ? 4 : 0 }} /><span className="text-sm text-beige">repair {t.repair}</span></span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="paper-dark mt-5 rounded-md p-5 text-center sm:p-7">
            <p className="font-display text-xl italic text-glow">Whether the parents or the children were really right is a larger question than one year can answer.</p>
            <p className="mt-1 text-lg text-beige">{persona ? `You walked it as ${CHARACTERS[persona].name} and through the others’ eyes.` : ''} {SCENARIOS.length} situations played.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={onInspect}>Inspect every number</Button>
              <Button variant="ghost" onClick={onJournal}>The journal</Button>
              <Button variant="ghost" onClick={beginCampaign}>Live the year again</Button>
              <Button variant="ghost" onClick={() => goTo('opening')}>Return to the opening</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
