import { LAYERS } from '../../audio/ambient'
import { useGame } from '../../store/gameStore'
import { IconMute, IconSound } from './Icons'

/** The soundscape: a master switch, volume, and which sounds may be heard. All sound is synthesised in the browser. */
export function SoundPanel({ className = '' }: { className?: string }) {
  const { soundOn, volume, soundAuto, soundMix, setSound, setVolume, setSoundAuto, setLayer } = useGame()
  return (
    <section className={`rounded-md border border-brass/30 bg-black/25 p-4 text-left ${className}`} aria-label="Soundscape">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSound(!soundOn)} aria-pressed={soundOn}
          aria-label={soundOn ? 'Turn the soundscape off' : 'Turn the soundscape on'}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brass/50 bg-black/40 text-cream transition hover:border-glow hover:text-glow"
        >
          {soundOn ? <IconSound /> : <IconMute />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold text-cream">{soundOn ? 'Sound on' : 'Sound off'}</p>
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Ambient volume" className="w-full" />
        </div>
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-3 text-[1.02rem] text-beige">
        <input type="checkbox" checked={soundAuto} onChange={(e) => setSoundAuto(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
        <span><span className="font-semibold text-cream">Follow the scene</span> — the room, the hour and the season decide what you hear (the fan in the living room, rain in the monsoon, the typewriter at night).</span>
      </label>
      <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {LAYERS.map((l) => (
          <li key={l.id}>
            <label className="flex cursor-pointer items-start gap-2.5 text-base text-cream" title={l.hint}>
              <input type="checkbox" checked={soundMix[l.id]} onChange={(e) => setLayer(l.id, e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
              <span>{l.label}<span className="block text-xs italic text-beige/70">{l.hint}</span></span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
