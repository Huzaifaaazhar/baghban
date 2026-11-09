import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { CHARACTERS } from '../../data/characters'
import { resolveText } from '../../engine/story'
import { useTypewriter } from '../../hooks/useTypewriter'
import type { Line, PersonaId } from '../../types'
import { IconDown } from '../ui/Icons'

/** Cinematic lower-third. Click, tap, Space or Enter to advance; first press completes the line. */
export function DialogueBox({
  line, persona, onAdvance, lineKey,
}: { line: Line; persona: PersonaId; onAdvance: () => void; lineKey: string }) {
  const text = resolveText(line.text, persona)
  const { shown, done, skip } = useTypewriter(text, line.speaker === 'narrator' ? 85 : 62, line.speaker === 'thought' ? 0.35 : 0)

  const press = () => { if (!done) skip(); else onAdvance() }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        const t = e.target as HTMLElement
        if (t.closest('button, [role="button"], input, a')) return
        e.preventDefault()
        press()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const isNarr = line.speaker === 'narrator'
  const isThought = line.speaker === 'thought'
  const ch = !isNarr && !isThought ? CHARACTERS[line.speaker as keyof typeof CHARACTERS] : null
  const you = ch && ch.id === persona
  const name = isThought ? 'Your thoughts' : ch ? ch.name : ''

  return (
    <motion.div
      key={lineKey}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-8 sm:pb-6"
    >
      <button
        type="button"
        onClick={press}
        aria-label={done ? 'Continue' : 'Show full line'}
        className={`paper-dark relative mx-auto block w-full max-w-4xl rounded-md px-5 pb-5 pt-6 text-left sm:px-9 sm:pb-6 sm:pt-7 ${isThought ? 'border-[#a14a5a]/55' : ''}`}
      >
        {!isNarr && (
          <div className="absolute -top-4 left-5 flex items-center gap-2 sm:left-8">
            <span className={`rounded-sm border px-4 py-0.5 font-display text-xl font-semibold tracking-[0.14em] uppercase shadow-lg sm:text-2xl ${isThought ? 'border-[#c97a89]/60 bg-[#4d1d2a] text-[#f2c6cf] italic normal-case tracking-[0.04em]' : 'border-brass/70 bg-[#4a2a17] text-glow'}`}>
              {name}
            </span>
            {you && <span className="rounded-sm bg-glow px-2 py-0.5 font-display text-sm font-semibold uppercase tracking-widest text-umber">You</span>}
          </div>
        )}
        <p
          className={`min-h-[3.6em] text-[1.22rem] leading-[1.5] sm:text-[1.4rem] ${isNarr ? 'font-body italic text-[#e9d8b0]' : isThought ? 'font-body italic text-[#f0d7dc]' : 'text-cream'}`}
        >
          {shown}
          <span className="opacity-0">{text.slice(shown.length)}</span>
        </p>
        <span className={`absolute bottom-3 right-5 text-glow transition-opacity ${done ? 'bob opacity-90' : 'opacity-0'}`} aria-hidden>
          <IconDown width={22} height={22} />
        </span>
      </button>
    </motion.div>
  )
}
