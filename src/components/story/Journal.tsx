import { useState } from 'react'
import { CHARACTERS, FAMILY_ORDER } from '../../data/characters'
import { KNOWLEDGE } from '../../data/knowledge'
import { PERSONA_BRIEF, ROLES, roleOfPersona } from '../../data/roles'
import { relationTone, relationWord, STAT_META, statWord } from '../../engine/describe'
import { useGame, activeWho } from '../../store/gameStore'
import { INFO } from '../../sim/data'
import { FAMILY_LABEL, bondWord, familyWord, warmthScore } from '../../sim/report'
import { family, getBond } from '../../sim/engine'
import type { FamilyAttr } from '../../sim/types'
import type { Stat } from '../../types'
import { Portrait } from '../art/Portrait'
import { Modal } from '../ui/Modal'

type Tab = 'role' | 'know' | 'moments' | 'house' | 'insights' | 'memory'
const TABS: { id: Tab; label: string }[] = [
  { id: 'role', label: 'Your place' },
  { id: 'know', label: 'What you know' },
  { id: 'moments', label: 'Moments' },
  { id: 'house', label: 'The household' },
  { id: 'insights', label: 'Insights' },
  { id: 'memory', label: 'Remembered' },
]

export function Journal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('role')
  const game = useGame()
  const { persona, learned, ledger, stats, relations, sim, campaign } = game
  if (!persona) return null
  const who = activeWho(game) ?? persona
  const campaignOn = campaign.stage !== 'off' && !!sim
  const visibleTabs = TABS.filter((t) => (t.id === 'insights' || t.id === 'memory') ? campaignOn : true)
  const role = ROLES[roleOfPersona(persona)]
  const brief = PERSONA_BRIEF[persona]
  const me = CHARACTERS[persona]

  return (
    <Modal open={open} onClose={onClose} label="Journal" wide restoreFocus={false} className="!max-w-3xl">
      <div className="flex shrink-0 items-center gap-3 border-b border-brass/30 py-3 pl-4 pr-16 sm:gap-4 sm:px-6 sm:pb-3 sm:pt-5 sm:pr-16">
        <div className="h-16 w-14 overflow-hidden rounded-sm border border-brass/50 bg-[#c9a76b]">
          <Portrait spec={me.portrait} className="h-full w-full" blink={false} />
        </div>
        <div>
          <p className="font-display text-sm uppercase tracking-[0.25em] text-brass">The journal of</p>
          <h2 className="font-display text-2xl font-semibold leading-tight text-cream sm:text-3xl">{me.fullName}</h2>
        </div>
      </div>
      <div role="tablist" className="scroll-thin flex shrink-0 gap-1 overflow-x-auto border-b border-brass/20 px-4 pt-2">
        {visibleTabs.map((t) => (
          <button
            key={t.id} role="tab" aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-t-sm px-3 py-2.5 sm:px-4 font-display text-lg font-semibold tracking-wide transition ${tab === t.id ? 'bg-[#f1e3bd] text-umber' : 'text-beige hover:text-glow'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-[#f1e3bd] p-5 text-umber sm:p-7" role="tabpanel">
        {tab === 'role' && (
          <div className="space-y-5">
            <div>
              <h3 className="font-display text-2xl font-semibold text-burgundy">{role.title}</h3>
              <p className="italic text-[#5a3520]">{role.tagline}</p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              {[['You know', role.knows], ['You decide', role.decides], ['You carry', role.carries]].map(([k, v]) => (
                <div key={k} className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3">
                  <dt className="font-display text-sm font-bold uppercase tracking-[0.2em] text-burgundy">{k}</dt>
                  <dd className="mt-1 text-[1.02rem] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h4 className="font-display text-xl font-semibold text-burgundy">Your duties, as {me.name}</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {brief.duties.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-xl font-semibold text-burgundy">Your circumstances</h4>
              <p className="mt-1 leading-snug">{me.finances}</p>
            </div>
          </div>
        )}
        {tab === 'know' && (
          <div className="space-y-3">
            <p className="italic text-[#5a3520]">Only what {me.name} could actually know. Other people’s secrets stay theirs until you earn them.</p>
            {[...brief.knowledge.map((k) => ({ ...k, fresh: false })), ...learned.filter((id) => KNOWLEDGE[id]).map((id) => ({ id, ...KNOWLEDGE[id], fresh: true }))].map((k) => (
              <article key={k.id} className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3">
                <h4 className="flex items-center gap-2 font-display text-xl font-semibold text-burgundy">
                  {k.title}
                  {k.fresh && <span className="rounded-sm bg-olive px-1.5 py-0.5 font-body text-xs font-semibold uppercase tracking-widest text-cream">Learned</span>}
                </h4>
                <p className="leading-snug">{k.text}</p>
              </article>
            ))}
          </div>
        )}
        {tab === 'moments' && (
          <div className="space-y-3">
            {ledger.length === 0 && <p className="italic text-[#5a3520]">Nothing yet. Your choices are written here, together with what they quietly cost.</p>}
            {ledger.map((m, i) => (
              <article key={m.id} className="rounded-sm border-l-4 border-burgundy bg-white/30 p-3 pl-4">
                <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#8b5a30]">{i + 1}.</p>
                <h4 className="font-display text-xl font-semibold text-burgundy">{m.title}</h4>
                <p className="mt-0.5 text-[0.98rem] italic text-[#5a3520]">“{m.optionLabel}”</p>
                <p className="mt-1 leading-snug">{m.note}</p>
              </article>
            ))}
          </div>
        )}
        {tab === 'insights' && sim && (
          <div className="space-y-3">
            <p className="italic text-[#5a3520]">Things people have not said aloud, and what you have come to understand by looking, listening and remembering. Seeing the same night through someone else’s eyes may add to this.</p>
            {sim.insights.length === 0 && <p className="italic">Nothing yet.</p>}
            {sim.insights.map((id) => INFO[id] && (
              <article key={id} className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3">
                <h4 className="font-display text-xl font-semibold text-burgundy">{INFO[id].title}</h4>
                <p className="leading-snug">{INFO[id].text}</p>
                <p className="mt-1 text-sm italic text-[#6b4024]">Kept private by {CHARACTERS[INFO[id].holder].name}{sim.knowledge[who]?.includes(id) ? ` — and ${CHARACTERS[who].name} knows it.` : ` — ${CHARACTERS[who].name} does not know this.`}</p>
              </article>
            ))}
          </div>
        )}
        {tab === 'memory' && sim && (
          <div className="space-y-2">
            <p className="italic text-[#5a3520]">Nobody here forgets quickly. These are the moments the people around you are still carrying.</p>
            {sim.memory.filter((m) => (m.actor === who || m.target === who || m.actor === persona || m.target === persona) && (m.felt >= 0.15 || m.warm >= 0.3) && m.k !== 'absorb').slice(-25).reverse().map((m) => (
              <article key={m.id} className={`rounded-sm border-l-4 bg-white/30 p-2.5 pl-3 ${m.warm > m.felt ? 'border-olive' : 'border-burgundy'}`}>
                <p className="leading-snug">{m.n}</p>
                {m.reframed && <p className="text-sm italic text-burgundy">You now know something that changes how this should be read.</p>}
                {m.resolved && <p className="text-sm italic text-[#6b4024]">Since addressed.</p>}
              </article>
            ))}
          </div>
        )}
        {tab === 'house' && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(STAT_META) as Stat[]).map((s) => (
                <div key={s} className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-lg font-semibold text-burgundy">{STAT_META[s].label}</span>
                    <span className="font-display text-lg italic">{statWord(s, stats[s])}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-[#c9b27a]/60" role="meter" aria-valuenow={Math.round(stats[s])} aria-valuemin={0} aria-valuemax={100} aria-label={STAT_META[s].label}>
                    <div className="h-full rounded-full bg-gradient-to-r from-olive to-amber transition-all duration-700" style={{ width: `${stats[s]}%` }} />
                  </div>
                  <p className="mt-1 text-sm italic text-[#5a3520]">{STAT_META[s].hint}</p>
                </div>
              ))}
            </div>
            {campaignOn && sim && (
              <div className="grid gap-2 sm:grid-cols-3">
                {(['cohesion', 'communication', 'mutualRespect', 'unresolved', 'sharedResp', 'wellbeing'] as FamilyAttr[]).map((a) => (
                  <div key={a} className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-2.5"><p className="font-display text-sm uppercase tracking-wider text-burgundy">{FAMILY_LABEL[a]}</p><p className="font-display text-xl italic">{familyWord(a, family(sim)[a])}</p></div>
                ))}
              </div>
            )}
            <div>
              <h4 className="font-display text-xl font-semibold text-burgundy">How they feel about you</h4>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {FAMILY_ORDER.filter((id) => id !== who).map((id) => {
                  const v = relations[id] ?? 0
                  const b = campaignOn && sim ? getBond(sim, id, who) : null
                  const tone = b ? (warmthScore(b) < 20 ? 'bad' : warmthScore(b) > 70 ? 'good' : 'neutral') : relationTone(v)
                  return (
                    <li key={id} className="flex items-center gap-3 rounded-sm border border-[#8b5a30]/30 bg-white/25 p-2">
                      <span className="h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-[#c9a76b]"><Portrait spec={CHARACTERS[id].portrait} className="h-full w-full" blink={false} /></span>
                      <span className="min-w-0 flex-1 leading-tight"><span className="block font-semibold">{CHARACTERS[id].name}</span><span className="block text-sm text-[#5a3520]">{CHARACTERS[id].title.split('·')[0]}</span></span>
                      <span className={`font-display text-lg italic ${tone === 'bad' ? 'text-burgundy' : tone === 'good' ? 'text-olive' : 'text-[#5a3520]'}`}>{b ? bondWord(b).replace(' with you', '').replace(' toward you', '').replace(' from you', '') : relationWord(v)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
