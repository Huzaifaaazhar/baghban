import { useState } from 'react'
import { chapterMonth, chapterTitle, CHAPTER_COUNT } from '../../scenarios'
import { CHARACTERS } from '../../data/characters'
import { useGame } from '../../store/gameStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

/** Chapter selection. Going back replays your recorded decisions up to that chapter, so the household is exactly as you left it then. */
export function Chapters({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sim, campaign, jumpToChapter } = useGame()
  const [pick, setPick] = useState<number | null>(null)
  if (!sim) return null
  const done = new Set(sim.log.map((e) => e.i))
  const reached = (i: number) => i === 0 || Array.from({ length: i }, (_, k) => k).every((k) => done.has(k))
  const current = campaign.stage === 'finale' ? CHAPTER_COUNT : campaign.index
  const close = () => { setPick(null); onClose() }

  return (
    <Modal open={open} onClose={close} label="Chapters" wide restoreFocus={false}>
      <div className="border-b border-brass/30 px-6 pb-3 pt-5">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-brass">Chapters</p>
        <h2 className="font-display text-3xl font-semibold text-cream">Return to a moment in the year</h2>
        <p className="italic text-beige">Choosing a chapter replays your recorded decisions up to that point. You can then see it through different eyes, or choose differently.</p>
      </div>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <ol className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: CHAPTER_COUNT }, (_, i) => {
            const entries = sim.log.filter((e) => e.i === i)
            const lens = entries[0] ? CHARACTERS[entries[0].who].name : null
            const state = i < current && done.has(i) ? 'done' : i === current ? 'current' : 'locked'
            const can = reached(i)
            return (
              <li key={i}>
                <button
                  disabled={!can}
                  onClick={() => setPick(i)}
                  aria-label={`Chapter ${i + 1}: ${chapterTitle(i)}`}
                  className={`flex w-full items-center gap-3 rounded-sm border p-3 text-left transition ${can ? 'border-brass/50 bg-black/25 hover:border-glow' : 'cursor-not-allowed border-brass/15 bg-black/10 opacity-50'} ${state === 'current' ? 'ring-1 ring-glow' : ''}`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border font-display text-lg font-bold ${state === 'done' ? 'border-glow bg-glow text-umber' : 'border-brass/50 text-brass'}`}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-xl font-semibold leading-tight text-cream">{chapterTitle(i)}</span>
                    <span className="block text-sm italic text-beige">{chapterMonth(i)}{lens ? ` · played as ${lens}` : state === 'current' ? ' · you are here' : can ? '' : ' · not reached'}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        {pick !== null && (
          <div className="paper mt-4 rounded-sm p-4" role="alertdialog" aria-label="Confirm">
            <p className="text-lg">Return to <strong>{chapterTitle(pick)}</strong>? Decisions you made from there onward will be replaced when you play it again.</p>
            <div className="mt-3 flex gap-3">
              <Button variant="paper" onClick={() => { jumpToChapter(pick); close() }}>Return to chapter {pick + 1}</Button>
              <Button variant="paper" onClick={() => setPick(null)}>Stay where I am</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
