import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { LOCATIONS } from '../../data/locations'
import type { LocationId, TimeOfDay } from '../../types'

const TIME_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning', afternoon: 'Afternoon', golden: 'Late afternoon, golden hour', evening: 'Evening', night: 'Night',
}

/** Brief film-style title when the story moves to a new room. */
export function LocationCard({ location, time }: { location: LocationId; time: TimeOfDay }) {
  const [show, setShow] = useState(true)
  useEffect(() => {
    setShow(true)
    const t = setTimeout(() => setShow(false), 2600)
    return () => clearTimeout(t)
  }, [location])
  const loc = LOCATIONS[location]
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={location}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="pointer-events-none absolute inset-0 z-[15] grid place-items-center bg-black/35 [@media(max-height:520px)]:items-start [@media(max-height:520px)]:pt-14"
          aria-live="polite"
        >
          <div className="text-center text-shadow-film">
            <p className="font-deva text-2xl text-glow/90 sm:text-3xl">{loc.hindi}</p>
            <h2 className="mt-1 font-display text-4xl font-semibold uppercase tracking-[0.22em] text-cream sm:text-6xl [@media(max-height:520px)]:text-3xl">{loc.name}</h2>
            <div className="ornament-rule mx-auto my-3 w-48 [@media(max-height:520px)]:hidden" />
            <p className="font-display text-xl italic text-beige sm:text-2xl [@media(max-height:520px)]:hidden">{TIME_LABEL[time]}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
