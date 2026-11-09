import { useEffect } from 'react'
import { activeScene, useGame } from '../store/gameStore'
import { ambient, LAYERS, layersFor, type Layer } from './ambient'
import type { LocationId, TimeOfDay } from '../types'

/** Keeps the synthesised soundscape in step with the story: on/off, volume, the room, the hour and the season. */
export function useAmbient() {
  const soundOn = useGame((s) => s.soundOn)
  const volume = useGame((s) => s.volume)
  const auto = useGame((s) => s.soundAuto)
  const mix = useGame((s) => s.soundMix)

  // where the story is: a primitive key so the effect only runs when the place or hour changes
  const key = useGame((s): string => {
    if (s.phase !== 'play') return 'living-room|golden|-1'
    const c = s.campaign
    if (c.stage === 'scene' || c.stage === 'aftermath') {
      const node = activeScene(s).nodes[s.cursor.nodeId]
      return `${node?.location ?? 'living-room'}|${node?.time ?? 'evening'}|${c.index}`
    }
    if (c.stage === 'brief') return `living-room|evening|${c.index}`
    if (c.stage === 'finale') return 'courtyard|night|-1'
    const t: TimeOfDay = s.mode === 'explore' ? 'night' : (activeScene(s).nodes[s.cursor.nodeId]?.time ?? 'evening')
    return `${s.location}|${t}|-1`
  })

  useEffect(() => {
    if (soundOn) void ambient.start(volume)
    else ambient.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundOn])
  useEffect(() => { ambient.setVolume(volume) }, [volume])
  useEffect(() => {
    const [room, time, ch] = key.split('|')
    const chapter = Number(ch)
    const where = { room: room as LocationId, time: time as TimeOfDay, chapter: chapter >= 0 ? chapter : null }
    const base: Layer[] = auto ? layersFor(where) : LAYERS.map((l) => l.id)
    ambient.setLayers(base.filter((l) => mix[l]))
  }, [auto, mix, key])
}
