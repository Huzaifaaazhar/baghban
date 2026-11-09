import { useEffect } from 'react'
import { useGame } from '../store/gameStore'
import { ambient } from './ambient'
import type { LocationId } from '../types'

const MOODS: Partial<Record<LocationId, 'outdoor' | 'kitchen'>> = {
  courtyard: 'outdoor', balcony: 'outdoor', kitchen: 'kitchen',
}

/** Keeps the synthesised ambience in step with the store (sound toggle, volume, room). */
export function useAmbient() {
  const soundOn = useGame((s) => s.soundOn)
  const volume = useGame((s) => s.volume)
  const location = useGame((s) => s.location)
  const phase = useGame((s) => s.phase)

  useEffect(() => {
    if (soundOn) void ambient.start(volume)
    else ambient.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn])

  useEffect(() => { ambient.setVolume(volume) }, [volume])
  useEffect(() => {
    ambient.setMood(phase === 'play' ? MOODS[location] ?? 'indoor' : 'indoor')
  }, [location, phase])
}
