import { AnimatePresence, motion } from 'framer-motion'
import { useAmbient } from './audio/useAmbient'
import { FamilyIntro } from './components/screens/FamilyIntro'
import { Opening } from './components/screens/Opening'
import { Play } from './components/screens/Play'
import { RoleSelect } from './components/screens/RoleSelect'
import { useGame } from './store/gameStore'

export default function App() {
  const phase = useGame((s) => s.phase)
  const persona = useGame((s) => s.persona)
  useAmbient()

  // A saved "play" phase without a persona can't be resumed: fall back to the opening.
  const effective = phase === 'play' && !persona ? 'opening' : phase

  return (
    <div className="relative h-full w-full overflow-hidden bg-night">
      <AnimatePresence mode="wait">
        <motion.div
          key={effective}
          className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          {effective === 'opening' && <Opening />}
          {effective === 'family' && <FamilyIntro />}
          {effective === 'role' && <RoleSelect />}
          {effective === 'play' && <Play />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
