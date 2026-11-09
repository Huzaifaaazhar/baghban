import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { CHARACTERS } from '../../data/characters'
import { INFO } from '../../sim/data'
import { FAMILY_LABEL } from '../../sim/report'
import { chapterTitle, CHAPTER_COUNT, CONFRONTATION_INDEX, getScenarioBody } from '../../scenarios'
import type { LensKey } from '../../scenarios/kit'
import { resolveText } from '../../engine/story'
import { activeScene, useGame } from '../../store/gameStore'
import type { PersonaId } from '../../types'
import { Button } from '../ui/Button'
import { Portrait } from '../art/Portrait'

const LENS_ORDER: LensKey[] = ['parent', 'child', 'alok']

export function Aftermath({ onInspect, onJournal }: { onInspect: () => void; onJournal: () => void }) {
  const { campaign, sim, rewind, continueCampaign, markWitness } = useGame()
  const [open, setOpen] = useState<LensKey | null>(null)
  if (!campaign.ctx || !campaign.report || !sim || !campaign.lens) return null
  const isConf = campaign.index === CONFRONTATION_INDEX
  const def = { n: campaign.index + 1, title: chapterTitle(campaign.index) }
  const body = getScenarioBody(campaign.index, campaign.ctx, campaign.snapshot ?? sim)
  const r = campaign.report
  const last = campaign.index >= CHAPTER_COUNT - 1
  const others = isConf ? [] : LENS_ORDER.filter((k) => k !== campaign.lens)
  const who = activeScene({ campaign }).who as PersonaId

  return (
    <motion.div className="absolute inset-0 z-40 overflow-y-auto bg-[#120904]/92 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-3 pb-8 pt-20 sm:py-8">
        <div className="paper-dark rounded-md p-5 sm:p-8">
          <p className="font-display text-sm uppercase tracking-[0.35em] text-brass">{isConf ? 'The last night' : `Situation ${def.n}`} · {def.title}</p>
          <h2 className="mt-1 font-display text-4xl font-semibold text-cream">What you noticed</h2>
          <p className="mt-1 text-lg italic text-beige">Nobody tells you whether it was right. You can only see what changed in the room — and what did not.</p>
          <div className="ornament-rule my-4" />

          <ul className="space-y-1.5 text-[1.15rem] text-cream">
            {r.shifts.length === 0 && <li className="italic text-beige">Nothing visibly shifted between you and the others — yet.</li>}
            {r.shifts.map((s) => (
              <li key={s.who} className="flex items-start gap-2"><span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${s.dir === 'closer' ? 'bg-[#c9d78a]' : 'bg-[#e79aa6]'}`} aria-hidden />{s.text}</li>
            ))}
            {r.stillOpen.map((t, i) => <li key={t + i} className="flex items-start gap-2 italic text-beige"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brass/70" aria-hidden />{t}</li>)}
            {r.agreements.map((t) => <li key={t} className="flex items-start gap-2"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-glow" aria-hidden />An understanding was reached: {t}</li>)}
          </ul>

          {r.family.length > 0 && (
            <p className="mt-3 text-base italic text-beige">
              In the household: {r.family.map((f) => `${FAMILY_LABEL[f.attr].toLowerCase()} is ${f.to} (was ${f.from})`).join('; ')}.
            </p>
          )}
          {r.learned.length > 0 && (
            <p className="mt-3 rounded-sm border border-brass/30 bg-black/25 p-2.5 text-base text-cream">
              <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brass">You learned </span>{r.learned.join(' · ')}
            </p>
          )}
          {r.reframed.length > 0 && (
            <p className="mt-3 rounded-sm border border-[#a14a5a]/50 bg-[#4d1d2a]/40 p-2.5 text-base text-[#f2c6cf]">
              <span className="font-display text-xs font-bold uppercase tracking-[0.25em]">Reconsider </span>
              Now that you know more, “{r.reframed[0]}” may not mean what it did.
            </p>
          )}

          {others.length > 0 && <div className="mt-6">
            <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brass">Through other eyes</p>
            <p className="text-base italic text-beige">The same moment, seen by the others. What they knew changes what it meant.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {others.map((k) => {
                const L = body.lenses[k]
                const ch = CHARACTERS[L.who]
                const seen = campaign.seenWitness.includes(k)
                return (
                  <button
                    key={k}
                    onClick={() => { setOpen(open === k ? null : k); markWitness(k, L.witnessLearn ?? []) }}
                    aria-expanded={open === k}
                    className={`flex items-center gap-3 rounded-sm border px-3 py-2 text-left transition hover:border-glow ${open === k ? 'border-glow bg-[#4a2a17]' : 'border-brass/40 bg-black/30'}`}
                  >
                    <span className="h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-[#c9ac72]"><Portrait spec={ch.portrait} className="h-full w-full" blink={false} /></span>
                    <span className="font-display text-xl font-semibold text-cream">Through {ch.name}’s eyes<span className="ml-2 text-sm font-normal italic text-beige">{seen ? 'read' : 'unread'}</span></span>
                  </button>
                )
              })}
            </div>
            <AnimatePresence mode="wait">
              {open && (
                <motion.div key={open} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="paper mt-2 rounded-sm p-4">
                  {body.lenses[open].witness.map((l, i) => (
                    <p key={i} className="mb-1.5 text-[1.12rem] italic leading-snug last:mb-0">{resolveText(l.text, body.lenses[open].who as PersonaId)}</p>
                  ))}
                  {(body.lenses[open].witnessLearn ?? []).length > 0 && (
                    <p className="mt-2 text-sm text-[#6b4024]">Now in your journal: {(body.lenses[open].witnessLearn ?? []).map((i) => INFO[i]?.title).filter(Boolean).join(' · ')}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={continueCampaign} className="sm:flex-1">{last ? 'See the verdict' : campaign.index === CHAPTER_COUNT - 2 ? 'The family gathers' : 'The next situation'}</Button>
            <Button variant="ghost" onClick={rewind}>Rewind this situation</Button>
            <Button variant="ghost" onClick={onJournal}>Journal</Button>
            <Button variant="ghost" onClick={onInspect}>Inspect the household</Button>
          </div>
          <p className="mt-2 text-sm italic text-beige/70">Playing as {CHARACTERS[who].name}. Rewinding restores the household to how it was before this situation, so you can try different eyes or different choices.</p>
        </div>
      </div>
    </motion.div>
  )
}
