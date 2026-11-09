import { motion } from 'framer-motion'
import { CHARACTERS } from '../../data/characters'
import { roleOfPersona } from '../../data/roles'
import { chapterMonth, chapterTitle, CHAPTER_COUNT, CONFRONTATION_INDEX, getScenarioBody } from '../../scenarios'
import type { LensKey } from '../../scenarios/kit'
import { useGame } from '../../store/gameStore'
import { SceneBackdrop } from '../art/SceneBackdrop'
import { Portrait } from '../art/Portrait'

const LENS_LABEL: Record<LensKey, string> = { parent: 'The parent', child: 'The child', alok: 'The one who watches' }
const LENS_ORDER: LensKey[] = ['parent', 'child', 'alok']

/** Interlude before each situation: what is happening, what has carried over, and whose eyes to see it through. */
export function ScenarioBrief() {
  const { campaign, sim, persona, chooseLens } = useGame()
  if (!campaign.ctx || !sim) return null
  const body = getScenarioBody(campaign.index, campaign.ctx, campaign.snapshot ?? sim)
  const isConf = campaign.index === CONFRONTATION_INDEX
  const def = { n: campaign.index + 1, title: chapterTitle(campaign.index), month: chapterMonth(campaign.index), id: isConf ? 's16' : `s${String(campaign.index + 1).padStart(2, '0')}` }
  const mine: LensKey = persona ? (roleOfPersona(persona) as LensKey) : 'child'
  // things still remembered — what people carry into this situation
  const recalled = sim.memory
    .filter((m) => !m.resolved && m.felt >= 0.4 && m.scenario !== def.id)
    .sort((a, b) => b.felt - a.felt)
    .slice(0, 3)

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 scale-105 blur-[4px]"><SceneBackdrop location={body.where} time={body.time} /></div>
      <div className="absolute inset-0 bg-black/72" aria-hidden />
      <div className="scroll-thin absolute inset-0 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-5xl flex-col items-center px-4 pb-12 pt-20 sm:pt-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="text-center text-shadow-film">
            <p className="font-display text-sm uppercase tracking-[0.4em] text-brass">
              {isConf ? 'The last night' : `Situation ${def.n} of ${CHAPTER_COUNT - 1}`} · {def.month}
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold text-cream sm:text-6xl">{def.title}</h1>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="paper-dark mt-6 w-full max-w-3xl rounded-md p-5 sm:p-7"
            aria-label="Background"
          >
            <p className="text-[1.15rem] leading-relaxed text-cream sm:text-[1.25rem]">{body.background}</p>
            <div className="ornament-rule my-4" />
            <p className="font-display text-xl italic text-glow sm:text-2xl">{body.conflict}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brass">In the room</span>
              {body.involved.map((id) => (
                <span key={id} className="flex items-center gap-1.5 rounded-full border border-brass/40 bg-black/30 py-0.5 pl-0.5 pr-3 text-base text-beige">
                  <span className="h-7 w-6 overflow-hidden rounded-full bg-[#c9ac72]"><Portrait spec={CHARACTERS[id].portrait} blink={false} className="h-full w-full" /></span>
                  {CHARACTERS[id].name}
                </span>
              ))}
            </div>
            {(campaign.echoes.length > 0 || recalled.length > 0) && (
              <div className="mt-5 rounded-sm border border-brass/25 bg-black/25 p-3">
                <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brass">What has carried over</p>
                <ul className="mt-1.5 space-y-1.5 text-[1.05rem] italic text-beige">
                  {campaign.echoes.map((e, i) => (
                    <li key={'e' + i}>{e.speaker === 'narrator' ? e.text : <><span className="not-italic font-semibold text-cream">{CHARACTERS[e.speaker].name}:</span> “{e.text}”</>}</li>
                  ))}
                  {recalled.map((m) => <li key={m.id} className="text-beige/85">Not forgotten: {m.n}</li>)}
                </ul>
              </div>
            )}
          </motion.section>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 text-center">
            <p className="font-display text-sm uppercase tracking-[0.4em] text-brass">{isConf ? 'The same table, three ways' : 'The same night, three ways'}</p>
            <h2 className="font-display text-3xl font-semibold text-cream">Whose eyes?</h2>
            <p className="mx-auto mt-1 max-w-xl italic text-beige">{isConf ? 'Everyone is here. What each of them does tonight is decided by the year you have lived.' : 'Each person knows something the others do not. You can come back to this moment through the others’ eyes afterwards.'}</p>
          </motion.div>

          <div className="mt-5 grid w-full gap-4 md:grid-cols-3">
            {LENS_ORDER.map((k, i) => {
              const L = body.lenses[k]
              const ch = CHARACTERS[L.who]
              return (
                <motion.button
                  key={k}
                  type="button"
                  onClick={() => chooseLens(k)}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.12, duration: 0.7 }}
                  whileHover={{ y: -5 }}
                  className={`group flex flex-col items-center rounded-md border-2 bg-[#24130a] p-4 text-center transition hover:border-glow hover:shadow-[0_0_40px_rgba(243,185,95,0.35)] ${k === mine ? 'border-brass/80' : 'border-brass/35'}`}
                  aria-label={`See it as ${ch.name}`}
                >
                  <span className="h-28 w-24 overflow-hidden rounded-t-[999px] bg-gradient-to-b from-[#c9ac72] to-[#8a6a3a]"><Portrait spec={ch.portrait} className="h-full w-full" blink={false} /></span>
                  <span className="mt-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-brass">{LENS_LABEL[k]}{k === mine ? ' · your path' : ''}</span>
                  <span className="font-display text-2xl font-semibold text-cream">{ch.name}</span>
                  <span className="mt-1 text-[1.02rem] leading-snug text-beige">{L.stake}</span>
                  <span className="mt-3 rounded-sm border border-brass/50 px-4 py-1 font-display text-sm font-bold uppercase tracking-[0.2em] text-brass group-hover:bg-glow group-hover:text-umber">Begin as {ch.name}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
