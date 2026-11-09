import { useState } from 'react'
import { CHARACTERS } from '../../data/characters'
import { ALL } from '../../sim/data'
import { charView, family } from '../../sim/engine'
import { FAMILY_LABEL, familyWord } from '../../sim/report'
import { useGame } from '../../store/gameStore'
import type { FamilyAttr } from '../../sim/types'
import { Modal } from '../ui/Modal'

type Tab = 'family' | 'people' | 'bonds' | 'memory' | 'history'
const TABS: { id: Tab; label: string }[] = [
  { id: 'family', label: 'Family' }, { id: 'people', label: 'People' }, { id: 'bonds', label: 'Strained bonds' },
  { id: 'memory', label: 'Memory' }, { id: 'history', label: 'Across the year' },
]
const FAM: FamilyAttr[] = ['cohesion', 'communication', 'mutualRespect', 'unresolved', 'sharedResp', 'wellbeing']

const Bar = ({ v, bad = false }: { v: number; bad?: boolean }) => (
  <span className="inline-block h-1.5 w-16 rounded-full bg-black/10 align-middle"><span className={`block h-full rounded-full ${bad ? 'bg-burgundy' : 'bg-olive'}`} style={{ width: `${v}%` }} /></span>
)

/** Full, spoiler-laden view of the simulation. For curiosity and for verifying that choices really change the family. */
export function Inspector({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sim = useGame((s) => s.sim)
  const [tab, setTab] = useState<Tab>('family')
  if (!sim) return null
  const fam = family(sim)
  const bonds = Object.entries(sim.bonds)
    .map(([k, b]) => ({ k, b, score: b.resentment + b.scar * 1.5 + (100 - b.trust) * 0.5 }))
    .sort((a, b) => b.score - a.score).slice(0, 12)

  return (
    <Modal open={open} onClose={onClose} label="Inspect the household" wide restoreFocus={false}>
      <div className="border-b border-brass/30 px-6 pb-3 pt-5">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-brass">Spoilers · situation {sim.t + 1}</p>
        <h2 className="font-display text-3xl font-semibold text-cream">The household, as the simulation sees it</h2>
      </div>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-brass/20 px-4 pt-2">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-t-sm px-4 py-2 font-display text-lg font-semibold ${tab === t.id ? 'bg-[#f1e3bd] text-umber' : 'text-beige hover:text-glow'}`}>{t.label}</button>
        ))}
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-auto bg-[#f1e3bd] p-5 text-umber" role="tabpanel">
        {tab === 'family' && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {FAM.map((a) => (
                <div key={a} className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3">
                  <div className="flex items-baseline justify-between"><span className="font-display text-lg font-semibold text-burgundy">{FAMILY_LABEL[a]}</span><span className="font-display text-lg italic">{familyWord(a, fam[a])}</span></div>
                  <div className="mt-1 flex items-center gap-2"><Bar v={fam[a]} bad={a === 'unresolved'} /><span className="text-sm tabular-nums">{fam[a]}</span></div>
                </div>
              ))}
            </div>
            <div className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3 text-[1.02rem]">
              <p><strong>Open grievances:</strong> {sim.issues.filter((i) => i.open).map((i) => `${CHARACTERS[i.a].name} → ${CHARACTERS[i.b].name} (${i.concern}${i.id.endsWith('unvoiced') ? ', unspoken' : ''}, ${i.sev})`).join('; ') || 'none'}</p>
              <p className="mt-1"><strong>Agreements:</strong> {sim.agreements.map((g) => `${g.text}${g.brokenBy.length ? ` (broken by ${g.brokenBy.map((c) => CHARACTERS[c].name).join(', ')})` : ''}`).join('; ') || 'none'}</p>
              <p className="mt-1"><strong>Delayed consequences waiting:</strong> {sim.pending.filter((p) => !p.fired).length} · <strong>Flags:</strong> {sim.flags.filter((f) => !f.startsWith('p1:')).join(', ') || 'none'}</p>
            </div>
          </div>
        )}
        {tab === 'people' && (
          <table className="w-full min-w-[720px] text-left text-[0.98rem]">
            <thead><tr className="border-b border-[#8b5a30]/50 font-display text-sm uppercase tracking-wider text-burgundy">
              <th className="py-1">Person</th>{['Trust', 'Respect', 'Resent.', 'Heard', 'Distance', 'Secure', 'Indep.', 'Compromise', 'Fin. stress'].map((h) => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {ALL.map((c) => {
                const v = charView(sim, c)
                return (
                  <tr key={c} className="border-b border-[#8b5a30]/20">
                    <td className="py-1 font-semibold">{CHARACTERS[c].name}</td>
                    {[v.trust, v.respect, v.resentment, v.heard, v.distance, v.security, v.independence, v.compromise, v.finStress].map((n, i) => <td key={i} className="tabular-nums">{n}</td>)}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {tab === 'bonds' && (
          <ul className="space-y-1.5">
            {bonds.map(({ k, b }) => {
              const [a, c] = k.split('>') as [keyof typeof CHARACTERS, keyof typeof CHARACTERS]
              return <li key={k} className="rounded-sm border border-[#8b5a30]/30 bg-white/25 p-2 text-[1rem]"><strong>{CHARACTERS[a].name} → {CHARACTERS[c].name}</strong>: trust {b.trust} · respect {b.respect} · resentment {b.resentment} · heard {b.heard} · distance {b.distance} · scar {b.scar}</li>
            })}
          </ul>
        )}
        {tab === 'memory' && (
          <ul className="space-y-1.5">
            {[...sim.memory].reverse().slice(0, 60).map((m) => (
              <li key={m.id} className="rounded-sm border border-[#8b5a30]/30 bg-white/25 p-2 text-[1rem]">
                <span className="font-semibold">{CHARACTERS[m.actor].name} → {CHARACTERS[m.target].name}</span> <span className="text-[#6b4024]">[{m.k}{m.c ? ` · ${m.c}` : ''} · {m.tone}]</span> {m.n}
                <span className="block text-sm text-[#6b4024]">felt {m.felt} · warmth {m.warm} · blame {m.blame} {m.resolved ? '· resolved' : '· unresolved'} {m.reframed ? '· reframed by new information' : ''} · {m.scenario}</span>
              </li>
            ))}
          </ul>
        )}
        {tab === 'history' && (
          <table className="w-full min-w-[640px] text-left text-[0.98rem]">
            <thead><tr className="border-b border-[#8b5a30]/50 font-display text-sm uppercase tracking-wider text-burgundy"><th className="py-1">After</th>{FAM.map((a) => <th key={a}>{FAMILY_LABEL[a]}</th>)}</tr></thead>
            <tbody>{sim.history.map((h, i) => <tr key={i} className="border-b border-[#8b5a30]/20"><td className="py-1 font-semibold">{h.scenario}</td>{FAM.map((a) => <td key={a} className="tabular-nums">{h.fam[a]}</td>)}</tr>)}</tbody>
          </table>
        )}
      </div>
    </Modal>
  )
}
