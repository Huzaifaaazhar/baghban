import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { LOCATIONS } from '../../data/locations'
import { EXITS, HOTSPOTS, type Hotspot } from '../../data/explore'
import { resolveText } from '../../engine/story'
import type { LocationId, PersonaId } from '../../types'
import { IconDoor, IconDown, IconEye } from '../ui/Icons'

export function ExplorePanel({
  location, persona, examined, observation, onExamine, onTravel, onDismissObservation, onReflect,
}: {
  location: LocationId
  persona: PersonaId
  examined: string[]
  observation: Hotspot | null
  onExamine: (h: Hotspot) => void
  onTravel: (to: LocationId) => void
  onDismissObservation: () => void
  onReflect: () => void
}) {
  const loc = LOCATIONS[location]
  const [open, setOpen] = useState(true)
  const total = Object.values(HOTSPOTS).reduce((n, a) => n + a.length, 0)
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-8 sm:pb-5">
      <AnimatePresence>
        {observation && (
          <motion.aside
            key={observation.id}
            initial={{ opacity: 0, y: 16, rotate: -0.6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: 8 }}
            className="paper mx-auto mb-3 max-w-3xl rounded-sm p-4 sm:p-5"
            role="note"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-[#7a2231]">{observation.label}</h3>
                <p className="mt-1 text-[1.12rem] leading-snug sm:text-[1.2rem]">{resolveText(observation.text, persona)}</p>
              </div>
              <button onClick={onDismissObservation} className="shrink-0 rounded-sm border border-[#7a2231]/50 px-3 py-1 font-display text-sm font-semibold uppercase tracking-widest text-[#7a2231] hover:bg-[#7a2231]/10">
                Close
              </button>
            </div>
            <p className="mt-2 text-sm italic text-[#6b4024]">Added to your journal under “What you know”.</p>
          </motion.aside>
        )}
      </AnimatePresence>
      <div className="paper-dark scroll-thin mx-auto max-h-[calc(100dvh-92px)] max-w-4xl overflow-y-auto rounded-md px-4 pb-3 pt-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-semibold leading-tight text-cream sm:text-[1.7rem]">{loc.name}</h2>
            {open && <p className="hidden text-[1rem] italic text-beige sm:block">{loc.blurb}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <p className="hidden text-sm italic text-beige/80 md:block">{examined.length} of {total} details noticed</p>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? 'Hide options to see the room' : 'Show options'}
              className="grid h-9 w-9 place-items-center rounded-full border border-brass/50 text-cream transition hover:border-glow hover:text-glow"
            >
              <IconDown width={18} height={18} className={`transition-transform ${open ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>
        {open && (
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 font-display text-sm font-bold uppercase tracking-[0.22em] text-brass">Look closer</p>
              <div className="flex flex-wrap gap-2">
                {HOTSPOTS[location].map((h) => (
                  <button
                    key={h.id}
                    onClick={() => onExamine(h)}
                    className={`inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-base transition ${examined.includes(h.id) ? 'border-brass/30 bg-black/20 text-beige' : 'border-glow/70 bg-[#4a2a17] text-cream hover:bg-[#5b3519]'}`}
                  >
                    <IconEye width={16} height={16} /> {h.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 font-display text-sm font-bold uppercase tracking-[0.22em] text-brass">Walk to</p>
              <div className="flex flex-wrap gap-2">
                {EXITS[location].map((e) => (
                  <button
                    key={e.to}
                    onClick={() => onTravel(e.to)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-brass/60 bg-black/30 px-3 py-1.5 text-base text-cream transition hover:border-glow hover:text-glow"
                  >
                    <IconDoor width={16} height={16} /> {e.label}
                  </button>
                ))}
                <button
                  onClick={onReflect}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-transparent px-3 py-1.5 font-display text-sm font-bold uppercase tracking-[0.16em] text-glow underline-offset-4 hover:underline"
                >
                  Reflect on tonight
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
