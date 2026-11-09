import { useGame } from '../../store/gameStore'
import { IconMute, IconSound } from './Icons'

/** Ambient sound: toggle + volume. Audio can only begin after a user gesture, so it starts off. */
export function SoundControl({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const soundOn = useGame((s) => s.soundOn)
  const volume = useGame((s) => s.volume)
  const setSound = useGame((s) => s.setSound)
  const setVolume = useGame((s) => s.setVolume)
  return (
    <div className={`flex items-center gap-3 rounded-full border border-brass/40 bg-black/35 py-1 pl-1 pr-4 backdrop-blur-sm ${className}`}>
      <button
        onClick={() => setSound(!soundOn)}
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}
        className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-cream transition hover:text-glow"
      >
        {soundOn ? <IconSound /> : <IconMute />}
      </button>
      {!compact && (
        <span className="hidden text-sm uppercase tracking-[0.18em] text-beige sm:inline">{soundOn ? 'Sound on' : 'Sound off'}</span>
      )}
      <input
        type="range" min={0} max={1} step={0.05} value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Ambient volume"
        className="w-20 sm:w-24"
      />
    </div>
  )
}
