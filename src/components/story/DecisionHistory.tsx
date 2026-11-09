import { CHARACTERS } from '../../data/characters'
import { useGame } from '../../store/gameStore'
import { describeAct, impactOf } from '../../sim/verdict'
import { Modal } from '../ui/Modal'

/** Every decision you have made, with what it did — shown after the fact, never before. */
export function DecisionHistory({ open, onClose }: { open: boolean; onClose: () => void }) {
  const sim = useGame((s) => s.sim)
  if (!sim) return null
  const groups = new Map<number, typeof sim.log>()
  for (const e of sim.log) groups.set(e.i, [...(groups.get(e.i) ?? []), e])
  return (
    <Modal open={open} onClose={onClose} label="Decision history" wide restoreFocus={false}>
      <div className="border-b border-brass/30 px-6 pb-3 pt-5">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-brass">Decision history</p>
        <h2 className="font-display text-3xl font-semibold text-cream">What you chose, and what it did</h2>
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-[#f1e3bd] p-5 text-umber sm:p-6">
        {groups.size === 0 && <p className="italic">Nothing decided yet.</p>}
        {[...groups.entries()].map(([i, es]) => (
          <section key={i} className="mb-5">
            <h3 className="font-display text-2xl font-semibold text-burgundy">{i + 1}. {es[0].title}</h3>
            {es.map((e, k) => {
              const imp = impactOf(sim, e)
              const others = e.acts.filter((a) => a.by !== e.who).slice(0, 2)
              return (
                <article key={k} className="mt-2 rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3">
                  <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#8b5a30]">As {CHARACTERS[e.who].name}</p>
                  <p className="text-[1.08rem] font-semibold leading-snug">“{e.label}”</p>
                  <p className="mt-1 text-[1rem] italic text-[#5a3520]">{e.acts.filter((a) => a.by === e.who).slice(0, 2).map(describeAct).join('; ') || 'A choice without direct effect on anyone.'}.</p>
                  {others.length > 0 && <p className="text-[0.98rem] text-[#5a3520]">In response: {others.map((a) => a.n).join(' ')}</p>}
                  <p className={`mt-1 text-sm font-semibold ${imp > 0.8 ? 'text-olive' : imp < -0.8 ? 'text-burgundy' : 'text-[#6b4024]'}`}>{imp > 0.8 ? 'It eased things.' : imp < -0.8 ? 'It strained things.' : 'It changed little, for now.'}</p>
                </article>
              )
            })}
          </section>
        ))}
      </div>
    </Modal>
  )
}
