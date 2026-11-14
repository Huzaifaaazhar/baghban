import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CHARACTERS } from '../../data/characters'
import type { Exit, Hotspot } from '../../data/explore'
import { LOCATIONS } from '../../data/locations'
import {
  currentLine, linesForCursor, nodeCast, resolveText, visibleOptions,
} from '../../engine/story'
import { chapterTitle, CONFRONTATION_INDEX } from '../../scenarios'
import { makeQ } from '../../sim/engine'
import { activeScene, activeWho, useGame } from '../../store/gameStore'
import type { CharacterId, LocationId } from '../../types'
import { HotspotLayer } from '../art/HotspotLayer'
import { SceneBackdrop } from '../art/SceneBackdrop'
import { Aftermath } from '../story/Aftermath'
import { CastLayer } from '../story/CastLayer'
import { ClosingCard } from '../story/ClosingCard'
import { DecisionPanel } from '../story/DecisionPanel'
import { DialogueBox } from '../story/DialogueBox'
import { ExplorePanel } from '../story/ExplorePanel'
import { HouseMap } from '../story/HouseMap'
import { Chapters } from '../story/Chapters'
import { DecisionHistory } from '../story/DecisionHistory'
import { Inspector } from '../story/Inspector'
import { Journal } from '../story/Journal'
import { LocationCard } from '../story/LocationCard'
import { PauseMenu } from '../story/PauseMenu'
import { ScenarioBrief } from '../story/ScenarioBrief'
import { VerdictReport } from '../story/VerdictReport'
import { IconBook, IconHouse, IconMenu, IconMute, IconSound } from '../ui/Icons'
import { IconButton } from '../ui/Button'

export function Play() {
  const g = useGame()
  const { persona, cursor, mode, location, sceneComplete, examined, campaign, sim } = g
  const [journal, setJournal] = useState(false)
  const [menu, setMenu] = useState(false)
  const [map, setMap] = useState(false)
  const [inspect, setInspect] = useState(false)
  const [chapters, setChapters] = useState(false)
  const [history, setHistory] = useState(false)
  const [closing, setClosing] = useState(false)
  const [observation, setObservation] = useState<Hotspot | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  /* Part 1: show the closing card once, when the prologue finishes during this session */
  const wasComplete = useRef(sceneComplete)
  useEffect(() => {
    if (sceneComplete && !wasComplete.current) setClosing(true)
    wasComplete.current = sceneComplete
  }, [sceneComplete])

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

  const who = activeWho(g)
  if (!persona || !who) return null

  const inCampaign = campaign.stage !== 'off'
  const scene = activeScene(g)
  const node = scene.nodes[cursor.nodeId] ?? scene.nodes[scene.start]
  const q = inCampaign && sim ? makeQ(sim) : undefined
  const story = inCampaign ? campaign.stage === 'scene' || campaign.stage === 'aftermath' : mode === 'story'
  const storyActive = inCampaign ? campaign.stage === 'scene' : mode === 'story'
  const explore = !inCampaign && mode === 'explore'
  const time = explore ? 'night' : node.time
  const line = storyActive ? currentLine(scene, cursor, who, q) : undefined
  const speaker = line && line.speaker !== 'narrator' && line.speaker !== 'thought' ? (line.speaker as CharacterId) : undefined
  const cast = story ? nodeCast(node, who) : []
  const options = storyActive ? visibleOptions(node, who, q) : []
  const lineCount = storyActive ? linesForCursor(scene, cursor, who, q).length : 0
  const here: LocationId = explore ? location : node.location
  const brief = campaign.stage === 'brief'
  const finale = campaign.stage === 'finale'
  const stageHidden = journal || menu || map || closing || inspect || chapters || history
  const title = finale ? 'A year at Verma Sadan' : inCampaign ? `${campaign.index + 1}. ${chapterTitle(Math.min(campaign.index, CONFRONTATION_INDEX))}` : LOCATIONS[here].name

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      {!brief && !finale && <SceneBackdrop location={here} time={time} />}

      {explore && (
        <div className="absolute inset-0 z-10">
          <HotspotLayer location={location} examined={examined} onExamine={examine} onTravel={(e: Exit) => g.travel(e.to)} />
        </div>
      )}

      {story && <CastLayer cast={cast} speaker={speaker} mood={line?.mood} persona={who} />}
      {!brief && !finale && <LocationCard location={here} time={time} />}

      {brief && <ScenarioBrief />}
      {finale && <VerdictReport onInspect={() => setInspect(true)} onJournal={() => setJournal(true)} onChapters={() => setChapters(true)} onHistory={() => setHistory(true)} />}

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-[45] flex items-center justify-between gap-2 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-3 max-sm:pb-7 sm:from-black/70 sm:via-transparent sm:p-5">
        <div className="min-w-0">
          <p className="hidden font-display text-xl font-semibold tracking-[0.3em] text-cream text-shadow-film sm:block sm:text-2xl">BAGHBAN</p>
          <p className="truncate text-base italic text-beige/90 text-shadow-film max-sm:max-w-[48vw] sm:text-sm">
            {title}{!brief && !finale ? ` · as ${CHARACTERS[who].name}` : ''}
          </p>
        </div>
        <nav className="pointer-events-auto flex items-center gap-2" aria-label="Story controls">
          {explore && <IconButton label="Walk through the house" onClick={() => setMap(true)}><IconHouse /></IconButton>}
          <IconButton label="Open journal" onClick={() => setJournal(true)}><IconBook /></IconButton>
          <IconButton label={g.soundOn ? 'Mute ambient sound' : 'Play ambient sound'} onClick={() => g.setSound(!g.soundOn)} aria-pressed={g.soundOn}>
            {g.soundOn ? <IconSound /> : <IconMute />}
          </IconButton>
          <IconButton label="Menu" onClick={() => setMenu(true)}><IconMenu /></IconButton>
        </nav>
      </header>

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
        {storyActive && cursor.stage !== 'decision' && line && !stageHidden && (
          <DialogueBox
            key={`${cursor.nodeId}-${cursor.stage}-${cursor.choiceId ?? ''}-${cursor.index}`}
            lineKey={`${cursor.nodeId}-${cursor.index}`}
            line={line}
            persona={who}
            onAdvance={g.next}
          />
        )}
        {storyActive && cursor.stage === 'decision' && node.decision && !stageHidden && (
          <DecisionPanel
            key={`d-${scene.id}-${cursor.nodeId}`}
            prompt={node.decision.prompt}
            options={options}
            persona={who}
            onPick={g.pick}
            notices={inCampaign ? (node.notice ?? []).filter((n) => !n.when || (q && n.when(q))) : []}
            seen={campaign.seenNotices.map((s) => s.split(':').slice(1).join(':'))}
            onNotice={g.useNotice}
          />
        )}
      </AnimatePresence>
      {storyActive && cursor.stage !== 'decision' && lineCount > 1 && !stageHidden && (
        <div className="pointer-events-none absolute bottom-1 left-1/2 z-30 hidden -translate-x-1/2 gap-1.5 sm:flex" aria-hidden>
          {Array.from({ length: lineCount }).map((_, i) => (
            <span key={i} className={`h-1 w-5 rounded-full ${i <= cursor.index ? 'bg-glow/80' : 'bg-white/20'}`} />
          ))}
        </div>
      )}

      {explore && !closing && (
        <ExplorePanel
          location={location} persona={who} examined={examined} observation={observation}
          onExamine={examine} onTravel={g.travel} onDismissObservation={() => setObservation(null)} onReflect={() => setClosing(true)}
        />
      )}

      {closing && (
        <ClosingCard
          onBegin={() => { setClosing(false); g.beginCampaign() }}
          onWalk={() => { setClosing(false); setMap(true) }}
          onJournal={() => { setClosing(false); setJournal(true) }}
          onClose={() => setClosing(false)}
        />
      )}

      {campaign.stage === 'aftermath' && !stageHidden && <Aftermath onInspect={() => setInspect(true)} onJournal={() => setJournal(true)} />}

      <Journal open={journal} onClose={() => setJournal(false)} />
      <PauseMenu open={menu} onClose={() => setMenu(false)} onJournal={() => setJournal(true)} onInspect={() => setInspect(true)} onChapters={() => setChapters(true)} onHistory={() => setHistory(true)} />
      <HouseMap open={map} onClose={() => setMap(false)} onGo={g.travel} />
      <Inspector open={inspect} onClose={() => setInspect(false)} />
      <Chapters open={chapters} onClose={() => setChapters(false)} />
      <DecisionHistory open={history} onClose={() => setHistory(false)} />
      <span className="sr-only" aria-live="polite">{line ? resolveText(line.text, who) : ''}</span>
    </div>
  )
}
