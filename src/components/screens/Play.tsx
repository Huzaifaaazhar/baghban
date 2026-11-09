import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CHARACTERS } from '../../data/characters'
import type { Exit, Hotspot } from '../../data/explore'
import { LOCATIONS } from '../../data/locations'
import {
  currentLine, linesForCursor, nodeCast, resolveText, visibleOptions,
} from '../../engine/story'
import { SCENE_DATA, useGame } from '../../store/gameStore'
import type { CharacterId, LocationId } from '../../types'
import { HotspotLayer } from '../art/HotspotLayer'
import { SceneBackdrop } from '../art/SceneBackdrop'
import { CastLayer } from '../story/CastLayer'
import { ClosingCard } from '../story/ClosingCard'
import { DecisionPanel } from '../story/DecisionPanel'
import { DialogueBox } from '../story/DialogueBox'
import { ExplorePanel } from '../story/ExplorePanel'
import { HouseMap } from '../story/HouseMap'
import { Journal } from '../story/Journal'
import { LocationCard } from '../story/LocationCard'
import { PauseMenu } from '../story/PauseMenu'
import { IconBook, IconHouse, IconMenu, IconMute, IconSound } from '../ui/Icons'
import { IconButton } from '../ui/Button'

export function Play() {
  const g = useGame()
  const { persona, cursor, mode, location, sceneComplete, examined } = g
  const [journal, setJournal] = useState(false)
  const [menu, setMenu] = useState(false)
  const [map, setMap] = useState(false)
  const [closing, setClosing] = useState(false)
  const [observation, setObservation] = useState<Hotspot | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  /* show the closing card once, when the scene is finished during this session */
  const wasComplete = useRef(sceneComplete)
  useEffect(() => {
    if (sceneComplete && !wasComplete.current) setClosing(true)
    wasComplete.current = sceneComplete
  }, [sceneComplete])

  /* a quiet note each time a choice is written into the journal */
  const ledgerLen = useRef(g.ledger.length)
  useEffect(() => {
    if (g.ledger.length > ledgerLen.current) {
      setToast(g.ledger[g.ledger.length - 1].title)
      const t = setTimeout(() => setToast(null), 3800)
      ledgerLen.current = g.ledger.length
      return () => clearTimeout(t)
    }
    ledgerLen.current = g.ledger.length
  }, [g.ledger])

  useEffect(() => { setObservation(null) }, [location, mode])

  const examine = useCallback((h: Hotspot) => {
    setObservation(h)
    g.examine(h.id, h.learn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.examine])

  if (!persona) return null

  const node = SCENE_DATA.nodes[cursor.nodeId]
  const story = mode === 'story'
  const time = story ? node.time : 'night'
  const line = story ? currentLine(SCENE_DATA, cursor, persona) : undefined
  const speaker = line && line.speaker !== 'narrator' && line.speaker !== 'thought' ? (line.speaker as CharacterId) : undefined
  const cast = story ? nodeCast(node, persona) : []
  const options = story ? visibleOptions(node, persona) : []
  const lineCount = story ? linesForCursor(SCENE_DATA, cursor, persona).length : 0

  const travel = (to: LocationId) => g.travel(to)
  const stageHidden = journal || menu || map || closing

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      <SceneBackdrop location={story ? node.location : location} time={time} />

      {mode === 'explore' && (
        <div className="absolute inset-0 z-10">
          <HotspotLayer
            location={location}
            examined={examined}
            onExamine={examine}
            onTravel={(e: Exit) => travel(e.to)}
          />
        </div>
      )}

      {story && <CastLayer cast={cast} speaker={speaker} mood={line?.mood} persona={persona} />}

      <LocationCard location={story ? node.location : location} time={time} />

      {/* top bar */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-5">
        <div className="min-w-0">
          <p className="hidden font-display text-xl font-semibold tracking-[0.3em] text-cream text-shadow-film sm:block sm:text-2xl">BAGHBAN</p>
          <p className="truncate text-base italic text-beige/90 text-shadow-film max-sm:max-w-[48vw] sm:text-sm">
            {LOCATIONS[story ? node.location : location].name} · as {CHARACTERS[persona].name}
          </p>
        </div>
        <nav className="flex items-center gap-2" aria-label="Story controls">
          {mode === 'explore' && (
            <IconButton label="Walk through the house" onClick={() => setMap(true)}><IconHouse /></IconButton>
          )}
          <IconButton label="Open journal" onClick={() => setJournal(true)}><IconBook /></IconButton>
          <IconButton label={g.soundOn ? 'Mute ambient sound' : 'Play ambient sound'} onClick={() => g.setSound(!g.soundOn)} aria-pressed={g.soundOn}>
            {g.soundOn ? <IconSound /> : <IconMute />}
          </IconButton>
          <IconButton label="Menu" onClick={() => setMenu(true)}><IconMenu /></IconButton>
        </nav>
      </header>

      {/* journal toast */}
      <AnimatePresence>
        {toast && (
          <motion.button
            key={toast}
            onClick={() => setJournal(true)}
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-sm border border-brass/60 bg-[#2a170d]/95 px-5 py-2 text-center shadow-xl"
          >
            <span className="block font-display text-xs font-bold uppercase tracking-[0.3em] text-brass">Written in the journal</span>
            <span className="block font-display text-xl italic text-cream">{toast}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* lower third */}
      <AnimatePresence mode="wait">
        {story && cursor.stage !== 'decision' && line && !stageHidden && (
          <DialogueBox
            key={`${cursor.nodeId}-${cursor.stage}-${cursor.choiceId ?? ''}-${cursor.index}`}
            lineKey={`${cursor.nodeId}-${cursor.index}`}
            line={line}
            persona={persona}
            onAdvance={g.next}
          />
        )}
        {story && cursor.stage === 'decision' && node.decision && !stageHidden && (
          <DecisionPanel
            key={`d-${cursor.nodeId}`}
            prompt={node.decision.prompt}
            options={options}
            persona={persona}
            onPick={g.pick}
          />
        )}
      </AnimatePresence>
      {story && cursor.stage !== 'decision' && lineCount > 1 && !stageHidden && (
        <div className="pointer-events-none absolute bottom-1 left-1/2 z-30 hidden -translate-x-1/2 gap-1.5 sm:flex" aria-hidden>
          {Array.from({ length: lineCount }).map((_, i) => (
            <span key={i} className={`h-1 w-5 rounded-full ${i <= cursor.index ? 'bg-glow/80' : 'bg-white/20'}`} />
          ))}
        </div>
      )}

      {mode === 'explore' && !closing && (
        <ExplorePanel
          location={location}
          persona={persona}
          examined={examined}
          observation={observation}
          onExamine={examine}
          onTravel={travel}
          onDismissObservation={() => setObservation(null)}
          onReflect={() => setClosing(true)}
        />
      )}

      {closing && (
        <ClosingCard
          onWalk={() => { setClosing(false); setMap(true) }}
          onJournal={() => { setClosing(false); setJournal(true) }}
          onClose={() => setClosing(false)}
        />
      )}

      <Journal open={journal} onClose={() => setJournal(false)} />
      <PauseMenu open={menu} onClose={() => setMenu(false)} onJournal={() => setJournal(true)} />
      <HouseMap open={map} onClose={() => setMap(false)} onGo={travel} />
      <span className="sr-only" aria-live="polite">
        {line ? resolveText(line.text, persona) : ''}
      </span>
    </div>
  )
}
