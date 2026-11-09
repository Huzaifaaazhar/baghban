import { motion } from 'framer-motion'
import { CHARACTERS } from '../../data/characters'
import { useGame } from '../../store/gameStore'
import { SceneBackdrop } from '../art/SceneBackdrop'
import { Button } from '../ui/Button'
import { SoundControl } from '../ui/SoundControl'
import { SoundPanel } from '../ui/SoundPanel'
import { Modal } from '../ui/Modal'
import { useState } from 'react'

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
})

export function Opening() {
  const goTo = useGame((s) => s.goTo)
  const persona = useGame((s) => s.persona)
  const sceneComplete = useGame((s) => s.sceneComplete)
  const campaign = useGame((s) => s.campaign)
  const hasSave = !!persona
  const [soundOpen, setSoundOpen] = useState(false)

  return (
    <div className="absolute inset-0">
      <SceneBackdrop location="living-room" time="golden" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/75" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,14,4,0.62),transparent_68%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 z-20 flex justify-end p-3 sm:p-6">
        <motion.div {...rise(2.4)} className="flex items-center gap-2"><SoundControl /><button onClick={() => setSoundOpen(true)} className="rounded-full border border-brass/40 bg-black/35 px-3 py-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-cream backdrop-blur-sm transition hover:border-glow hover:text-glow" aria-label="Open the soundscape">Soundscape</button></motion.div>
      </div>

      {/* cinematic letterbox */}
      <motion.div className="absolute inset-x-0 top-0 z-10 h-[5vh] bg-black" initial={{ height: '50vh' }} animate={{ height: '5vh' }} transition={{ duration: 2.4, ease: 'easeInOut' }} aria-hidden />
      <motion.div className="absolute inset-x-0 bottom-0 z-10 h-[5vh] bg-black" initial={{ height: '50vh' }} animate={{ height: '5vh' }} transition={{ duration: 2.4, ease: 'easeInOut' }} aria-hidden />

      <main className="scroll-thin absolute inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-5 py-[9vh] text-center">
        <motion.p {...rise(0.8)} className="font-deva text-3xl text-glow text-shadow-film sm:text-5xl">बागबान</motion.p>
        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.24em' }}
          transition={{ delay: 1.0, duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-1 pl-[0.24em] font-display text-[clamp(2.6rem,12.5vw,9rem)] font-semibold leading-none text-cream text-shadow-film"
        >
          BAGHBAN
        </motion.h1>
        <motion.div {...rise(1.8)} className="ornament-rule my-4 w-[min(420px,70vw)]" />
        <motion.h2 {...rise(2.0)} className="font-display text-[clamp(1.1rem,3.4vw,2rem)] font-medium uppercase tracking-[0.42em] text-glow text-shadow-film">
          Who is really right?
        </motion.h2>
        <motion.p {...rise(2.6)} className="mt-6 max-w-xl font-body text-[clamp(1.2rem,2.6vw,1.6rem)] italic text-beige text-shadow-film">
          “Every generation believes it understands the other.”
        </motion.p>

        <motion.div {...rise(3.2)} className="mt-10 flex w-full max-w-sm flex-col items-center gap-3">
          <Button onClick={() => goTo('family')} className="w-full text-xl">Start Experience</Button>
          {hasSave && (
            <Button variant="ghost" onClick={() => goTo('play')} className="w-full">
              Continue as {CHARACTERS[persona!].name}
              {campaign.stage === 'finale' ? ' · the verdict awaits' : campaign.stage !== 'off' ? (campaign.index >= 15 ? ' · the family gathers' : ` · situation ${campaign.index + 1} of 15`) : sceneComplete ? ' · prologue complete' : ''}
            </Button>
          )}
        </motion.div>
        <motion.p {...rise(3.6)} className="mt-8 max-w-md text-sm uppercase tracking-[0.2em] text-beige/80 text-shadow-film">
          A 2D story of one house, three generations, and the question nobody can answer alone
        </motion.p>
      </main>
      <Modal open={soundOpen} onClose={() => setSoundOpen(false)} label="Soundscape"><div className="p-5 sm:p-7"><h2 className="font-display text-3xl font-semibold text-cream">The sound of the house</h2><p className="mb-3 italic text-beige">Original, synthesised sound — nothing sampled. Off until you turn it on.</p><SoundPanel /></div></Modal>
    </div>
  )
}
