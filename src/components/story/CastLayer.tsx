import { AnimatePresence, motion } from 'framer-motion'
import { CHARACTERS } from '../../data/characters'
import type { CharacterId, Mood, PersonaId } from '../../types'
import { Portrait } from '../art/Portrait'
import { useMedia } from '../../hooks/useMedia'

/**
 * Characters standing in the room. The speaker steps forward; the others recede.
 * The player's own character is only seen when they speak. Portraits shrink to fit however many are present.
 */
export function CastLayer({
  cast, speaker, mood, persona,
}: { cast: CharacterId[]; speaker?: CharacterId; mood?: Mood; persona: PersonaId }) {
  const small = useMedia('(max-width: 640px)')
  const max = small ? 3 : 6

  let list = Array.from(new Set([...cast.filter((id) => id !== persona), ...(speaker ? [speaker] : [])]))
  if (list.length > max) {
    // keep the speaker and the people nearest them in the cast order
    const idx = speaker ? list.indexOf(speaker) : 0
    const start = Math.max(0, Math.min(list.length - max, idx - Math.floor(max / 2)))
    list = list.slice(start, start + max)
  }

  const n = Math.max(1, list.length)
  // Width of one portrait: bounded by available height AND by the width left for `n` overlapping figures.
  const hMax = small ? 'calc(46dvh * 0.714)' : 'calc(60dvh * 0.714)'
  const w = `min(${hMax}, calc(100vw / (${0.75 * n + 0.25})))`

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[28dvh] z-10 flex h-[48dvh] items-end justify-center overflow-hidden sm:bottom-0 sm:h-[62dvh]"
      style={{ ['--w' as string]: w }}
      aria-hidden
    >
      <AnimatePresence mode="popLayout">
        {list.map((id) => {
          const ch = CHARACTERS[id]
          const isSpeaker = id === speaker
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{
                opacity: 1, y: isSpeaker ? 0 : 22,
                scale: isSpeaker ? 1.08 : 0.92,
                filter: !speaker || isSpeaker ? 'brightness(1) saturate(1)' : 'brightness(0.62) saturate(0.78)',
              }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative shrink-0"
              style={{
                zIndex: isSpeaker ? 5 : 1,
                width: 'var(--w)',
                aspectRatio: '300 / 420',
                marginInline: 'calc(var(--w) * -0.125)',
              }}
            >
              <div className="absolute inset-x-[4%] bottom-[-1%] h-12 rounded-[50%] bg-[radial-gradient(ellipse,rgba(10,4,0,0.65),transparent_70%)]" />
              <Portrait
                spec={ch.portrait}
                mood={isSpeaker ? mood ?? 'neutral' : 'neutral'}
                title={ch.name}
                className="relative h-full w-full"
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
