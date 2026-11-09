import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { resolveText } from '../../engine/story'
import { useState } from 'react'
import type { Notice, Option, PersonaId, Localized } from '../../types'
import { IconEye } from '../ui/Icons'

export function DecisionPanel({
  prompt, options, persona, onPick, notices = [], seen = [], onNotice,
}: {
  prompt: Localized; options: Option[]; persona: PersonaId; onPick: (id: string) => void
  notices?: Notice[]; seen?: string[]; onNotice?: (id: string) => void
}) {
  const [shown, setShown] = useState<Notice | null>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= options.length) onPick(options[n - 1].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [options, onPick])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-8 sm:pb-6"
    >
      <div className="paper-dark mx-auto flex max-h-[68dvh] w-full max-w-4xl flex-col rounded-md px-4 pb-4 pt-5 sm:px-8 sm:pb-6">
        <p className="mb-1 text-center font-display text-[1.25rem] italic leading-snug text-glow sm:text-[1.5rem]">
          {resolveText(prompt, persona)}
        </p>
        <div className="ornament-rule my-2" />
        {notices.length > 0 && (
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-brass">Before you decide</span>
            {notices.map((n) => (
              <button
                key={n.id}
                onClick={() => { setShown(shown?.id === n.id ? null : n); onNotice?.(n.id) }}
                aria-expanded={shown?.id === n.id}
                className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-base transition ${seen.includes(n.id) ? 'border-brass/30 bg-black/20 text-beige' : 'border-glow/70 bg-[#4a2a17] text-cream hover:bg-[#5b3519]'}`}
              >
                <IconEye width={15} height={15} /> {n.kind === 'memory' ? 'Remember' : n.kind === 'ask' ? 'Ask' : 'Notice'}: {n.label}
              </button>
            ))}
          </div>
        )}
        {shown && (
          <div className="paper mb-2.5 rounded-sm p-3 text-[1.08rem] italic leading-snug" role="note">{resolveText(shown.text, persona)}</div>
        )}
        <ul className="scroll-thin -mr-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
          {options.map((o, i) => (
            <li key={o.id}>
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.08 }}
                onClick={() => onPick(o.id)}
                className="paper group flex w-full items-start gap-3 rounded-sm px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#7a2231]/60 font-display text-base font-bold text-[#7a2231]">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[1.12rem] font-semibold leading-snug sm:text-[1.2rem]">{resolveText(o.label, persona)}</span>
                  {o.hint && <span className="mt-0.5 block text-[0.98rem] italic text-[#6b4024]">{resolveText(o.hint, persona)}</span>}
                </span>
              </motion.button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
