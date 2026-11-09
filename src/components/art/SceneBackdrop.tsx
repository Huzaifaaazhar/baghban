import { AnimatePresence, motion } from 'framer-motion'
import { memo, useMemo } from 'react'
import type { LocationId, TimeOfDay } from '../../types'
import { ROOM_COMPONENTS } from './rooms'

const TINT: Record<TimeOfDay, { bg: string; blend: string }> = {
  morning: { bg: 'rgba(255,225,150,0.12)', blend: 'normal' },
  afternoon: { bg: 'rgba(255,255,255,0.0)', blend: 'normal' },
  golden: { bg: 'rgba(255,150,40,0.16)', blend: 'normal' },
  evening: { bg: 'rgba(110,40,70,0.26)', blend: 'normal' },
  night: { bg: 'rgba(10,18,46,0.3)', blend: 'normal' },
}

const SHAFT: Record<TimeOfDay, string> = {
  morning: 'rgba(255,240,190,0.28)',
  afternoon: 'rgba(255,248,220,0.22)',
  golden: 'rgba(255,190,90,0.34)',
  evening: 'rgba(255,150,80,0.22)',
  night: 'rgba(130,160,230,0.10)',
}

function Motes({ time }: { time: TimeOfDay }) {
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${20 + ((i * 53) % 70)}%`,
        size: 2 + (i % 3),
        dur: 12 + (i % 7) * 2,
        delay: -((i * 1.7) % 14),
        dx: ((i % 5) - 2) * 18,
        dy: -(80 + (i % 4) * 30),
      })),
    [],
  )
  if (time === 'night') return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {motes.map((m, i) => (
        <span
          key={i}
          className="mote"
          style={{
            left: m.left, top: m.top, width: m.size, height: m.size,
            ['--dur' as string]: `${m.dur}s`, ['--delay' as string]: `${m.delay}s`,
            ['--dx' as string]: `${m.dx}px`, ['--dy' as string]: `${m.dy}px`,
          }}
        />
      ))}
    </div>
  )
}

/** The full-bleed 2D scene: hand-built SVG room + warm cinematic lighting layers. */
export const SceneBackdrop = memo(function SceneBackdrop({
  location, time, drift = true,
}: { location: LocationId; time: TimeOfDay; drift?: boolean }) {
  const Room = ROOM_COMPONENTS[location]
  const tint = TINT[time]
  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      <AnimatePresence initial={false}>
        <motion.div
          key={`${location}-${time}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: drift ? 1.0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          <Room time={time} />
        </motion.div>
      </AnimatePresence>
      {/* time-of-day grade */}
      <div className="pointer-events-none absolute inset-0 transition-colors duration-[1600ms]" style={{ background: tint.bg }} />
      {/* light shaft */}
      <div
        className="shaft pointer-events-none absolute -left-[10%] top-[-10%] h-[120%] w-[38%] origin-top"
        style={{ background: `linear-gradient(100deg, ${SHAFT[time]}, transparent 70%)` }}
        aria-hidden
      />
      <Motes time={time} />
      <div className="vignette" />
      <div className="grain" aria-hidden />
    </div>
  )
})
