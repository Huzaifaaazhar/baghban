import { motion } from 'framer-motion'
import { CHARACTERS, FAMILY_ORDER } from '../../data/characters'
import { relationWord, statWord } from '../../engine/describe'
import { useGame } from '../../store/gameStore'
import { Button } from '../ui/Button'

export function ClosingCard({
  onBegin, onWalk, onJournal, onClose,
}: { onBegin: () => void; onWalk: () => void; onJournal: () => void; onClose: () => void }) {
  const { persona, ledger, stats, relations, goTo } = useGame()
  if (!persona) return null
  const notable = FAMILY_ORDER.filter((id) => id !== persona && Math.abs(relations[id] ?? 0) >= 6)
    .sort((a, b) => Math.abs(relations[b] ?? 0) - Math.abs(relations[a] ?? 0))
    .slice(0, 4)
  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#120904]/80 p-3 pt-[72px] backdrop-blur-[2px]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
      role="dialog" aria-label="End of the evening"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
        className="closing-card paper-dark scroll-thin max-h-[calc(100dvh-84px)] w-full max-w-2xl sm:max-h-[calc(100dvh-96px)] overflow-y-auto rounded-md p-6 text-center sm:p-9"
      >
        <p className="font-display text-sm uppercase tracking-[0.35em] text-brass">Prologue · Sunday Chai</p>
        <h2 className="mt-1 font-display text-4xl font-semibold text-cream sm:text-5xl">The evening ends</h2>
        <div className="ornament-rule my-4" />
        <p className="text-lg italic text-beige">
          Nobody is declared right tonight. But the shape of the house has changed a little — and the house remembers.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
          {(['warmth', 'dignity', 'burden', 'trust'] as const).map((s) => (
            <div key={s} className="rounded-sm border border-brass/30 bg-black/25 p-2.5">
              <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">{s === 'dignity' ? 'Dignity' : s === 'burden' ? 'Burden' : s === 'warmth' ? 'Warmth' : 'Trust'}</p>
              <p className="font-display text-xl italic text-cream">{statWord(s, stats[s])}</p>
            </div>
          ))}
        </div>

        {notable.length > 0 && (
          <div className="mt-4 text-left">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-brass">How tonight sits with them</p>
            <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
              {notable.map((id) => (
                <li key={id} className="flex justify-between border-b border-brass/15 py-1 text-lg">
                  <span>{CHARACTERS[id].name}</span>
                  <span className={`italic ${(relations[id] ?? 0) < 0 ? 'text-[#e79aa6]' : 'text-[#c9d78a]'}`}>{relationWord(relations[id] ?? 0)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {ledger.length > 0 && (
          <blockquote className="mt-5 border-l-2 border-brass/60 pl-4 text-left">
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-brass">The moment that will be remembered</p>
            <p className="mt-1 font-display text-2xl text-cream">{ledger[ledger.length - 1].title}</p>
            <p className="text-lg italic text-beige">{ledger[ledger.length - 1].note}</p>
          </blockquote>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onBegin}>Begin the year at Verma Sadan</Button>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="ghost" onClick={onWalk}>Walk through the house</Button>
          <Button variant="ghost" onClick={onJournal}>Open the journal</Button>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="ghost" onClick={() => goTo('role')}>Try another perspective</Button>
          <Button variant="ghost" onClick={onClose}>Stay in the room</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
