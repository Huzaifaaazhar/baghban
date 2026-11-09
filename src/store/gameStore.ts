import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CharacterId, Cursor, LedgerEntry, LocationId, PersonaId, RoleId, Stat, StoryScene,
} from '../types'
import { SUNDAY_CHAI } from '../data/scenes/sundayChai'
import { advance, choose, resolveText, visibleOptions } from '../engine/story'
import { roleOfPersona } from '../data/roles'
import { chapterTitle, CHAPTER_COUNT, CONFRONTATION_INDEX, ctxFromSim, getScenarioScene, SCENARIOS } from '../scenarios'
import type { Ctx, LensKey } from '../scenarios/kit'
import { applyFx, clone, firePending, makeQ, snapshot, tick, type Echo } from '../sim/engine'
import { buildReport, type Report } from '../sim/report'
import { applyNotice, enterNode, resolveOption } from '../sim/runtime'
import { LAYERS, type Layer } from '../audio/ambient'
import { replayCampaign } from '../sim/replay'
import { seedFromPrologue } from '../sim/seed'
import type { Sim } from '../sim/types'

export type Phase = 'opening' | 'family' | 'role' | 'play'
export type Mode = 'story' | 'explore'
export type CampaignStage = 'off' | 'brief' | 'scene' | 'aftermath' | 'finale'

export interface Campaign {
  stage: CampaignStage
  /** Index of the current scenario (0-based). */
  index: number
  ctx: Ctx | null
  lens: LensKey | null
  echoes: Echo[]
  /** The simulation at the start of this situation — the rewind point. */
  snapshot: Sim | null
  report: Report | null
  seenNotices: string[]
  seenWitness: LensKey[]
  completed: number[]
}

const PROLOGUE = SUNDAY_CHAI
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

export const INITIAL_STATS: Record<Stat, number> = { warmth: 50, dignity: 55, burden: 30, trust: 50 }

const freshCampaign = (): Campaign => ({
  stage: 'off', index: 0, ctx: null, lens: null, echoes: [], snapshot: null, report: null, seenNotices: [], seenWitness: [], completed: [],
})

interface GameState {
  phase: Phase
  soundOn: boolean
  volume: number
  /** Let the room and the season decide which sounds play. */
  soundAuto: boolean
  /** Which kinds of sound are allowed at all. */
  soundMix: Record<Layer, boolean>
  role: RoleId | null
  persona: PersonaId | null
  mode: Mode
  cursor: Cursor
  location: LocationId
  sceneComplete: boolean
  stats: Record<Stat, number>
  relations: Partial<Record<CharacterId, number>>
  flags: string[]
  learned: string[]
  examined: string[]
  visited: LocationId[]
  ledger: LedgerEntry[]
  /* Part 2 */
  sim: Sim | null
  campaign: Campaign
  /* actions */
  goTo: (phase: Phase) => void
  setSound: (on: boolean) => void
  setVolume: (v: number) => void
  setSoundAuto: (on: boolean) => void
  setLayer: (layer: Layer, on: boolean) => void
  pickRole: (role: RoleId) => void
  beginStory: (persona: PersonaId) => void
  next: () => void
  pick: (optionId: string) => void
  travel: (loc: LocationId) => void
  examine: (hotspotId: string, learn?: string) => void
  replayScene: () => void
  resetAll: () => void
  beginCampaign: () => void
  chooseLens: (lens: LensKey) => void
  useNotice: (noticeId: string) => void
  markWitness: (lens: LensKey, learn: string[]) => void
  rewind: () => void
  continueCampaign: () => void
  /** Return to the start of chapter `index` (0-based) by replaying the recorded decisions. */
  jumpToChapter: (index: number) => void
  /** Erase everything — progress, perspective, saved decisions. */
  resetProgress: () => void
}

const freshProgress = () => ({
  mode: 'story' as Mode,
  cursor: { nodeId: PROLOGUE.start, stage: 'lines', index: 0 } as Cursor,
  location: PROLOGUE.nodes[PROLOGUE.start].location,
  sceneComplete: false,
  stats: { ...INITIAL_STATS },
  relations: {} as Partial<Record<CharacterId, number>>,
  flags: [] as string[],
  learned: [] as string[],
  examined: [] as string[],
  visited: [PROLOGUE.nodes[PROLOGUE.start].location] as LocationId[],
  ledger: [] as LedgerEntry[],
})

/** Which scene the cursor currently refers to. */
export function activeScene(s: Pick<GameState, 'campaign'>): StoryScene {
  const c = s.campaign
  if ((c.stage === 'scene' || c.stage === 'aftermath') && c.lens && c.ctx) return getScenarioScene(c.index, c.ctx, c.lens, c.snapshot ?? undefined)
  return PROLOGUE
}
/** The character whose eyes the player is looking through right now. */
export function activeWho(s: Pick<GameState, 'campaign' | 'persona'>): PersonaId | null {
  if (s.campaign.stage === 'scene' || s.campaign.stage === 'aftermath') return (activeScene(s).who as PersonaId) ?? s.persona
  return s.persona
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'opening',
      soundOn: false,
      volume: 0.5,
      soundAuto: true,
      soundMix: Object.fromEntries(LAYERS.map((l) => [l.id, true])) as Record<Layer, boolean>,
      role: null,
      persona: null,
      ...freshProgress(),
      sim: null,
      campaign: freshCampaign(),

      goTo: (phase) => set({ phase }),
      setSound: (soundOn) => set({ soundOn }),
      setVolume: (volume) => set({ volume }),
      setSoundAuto: (soundAuto) => set({ soundAuto }),
      setLayer: (layer, on) => set((st) => ({ soundMix: { ...st.soundMix, [layer]: on } })),
      pickRole: (role) => set({ role }),

      beginStory: (persona) =>
        set({ persona, role: roleOfPersona(persona), phase: 'play', ...freshProgress(), sim: null, campaign: freshCampaign() }),

      /* ------------------------------------------------------------ */
      next: () => {
        const s = get()
        const who = activeWho(s)
        if (!who) return
        if (s.campaign.stage !== 'off' && s.campaign.stage !== 'scene') return
        if (s.campaign.stage === 'scene') {
          const scene = activeScene(s)
          const sim = clone(s.sim!)
          const res = advance(scene, s.cursor, who, makeQ(sim))
          if (res.kind === 'end') { finishScenario(set, get); return }
          if (res.cursor.nodeId !== s.cursor.nodeId) enterNode(sim, scene.nodes[res.cursor.nodeId], scene.id)
          set({ cursor: res.cursor, sim })
          return
        }
        if (s.mode !== 'story') return
        const res = advance(PROLOGUE, s.cursor, who)
        if (res.kind === 'end') { set({ mode: 'explore', sceneComplete: true }); return }
        const node = PROLOGUE.nodes[res.cursor.nodeId]
        set({
          cursor: res.cursor,
          location: node.location,
          visited: s.visited.includes(node.location) ? s.visited : [...s.visited, node.location],
        })
      },

      pick: (optionId) => {
        const s = get()
        const who = activeWho(s)
        if (!who || s.cursor.stage !== 'decision') return
        if (s.campaign.stage !== 'off' && s.campaign.stage !== 'scene') return

        if (s.campaign.stage === 'scene') {
          const scene = activeScene(s)
          const node = scene.nodes[s.cursor.nodeId]
          const sim = clone(s.sim!)
          const opt = visibleOptions(node, who, makeQ(sim)).find((o) => o.id === optionId)
          if (!opt) return
          const offered = visibleOptions(node, who, makeQ(sim))
          const branch = resolveOption(sim, opt, scene.id, { i: s.campaign.index, title: chapterTitle(s.campaign.index), nodeId: node.id, lens: s.campaign.lens!, who, offered })
          const res = choose(scene, s.cursor, optionId, who, makeQ(sim))
          if (res === 'end') { set({ sim }); finishScenario(set, get); return }
          set({ sim, cursor: { ...res, branch } })
          return
        }

        const node = PROLOGUE.nodes[s.cursor.nodeId]
        const opt = node?.decision?.options.find((o) => o.id === optionId)
        if (!opt) return
        const stats = { ...s.stats }
        for (const [k, v] of Object.entries(opt.effects?.stats ?? {})) stats[k as Stat] = clamp(stats[k as Stat] + (v ?? 0))
        const relations = { ...s.relations }
        for (const [k, v] of Object.entries(opt.effects?.relations ?? {})) relations[k as CharacterId] = clamp((relations[k as CharacterId] ?? 0) + (v ?? 0), -100, 100)
        const flags = Array.from(new Set([...s.flags, ...(opt.effects?.flags ?? [])]))
        const learned = Array.from(new Set([...s.learned, ...(opt.effects?.learn ?? [])]))
        const ledger = opt.ledger
          ? [...s.ledger, { ...opt.ledger, id: `${node.id}:${opt.id}`, optionLabel: resolveText(opt.label, who), persona: who }]
          : s.ledger
        const result = choose(PROLOGUE, s.cursor, optionId, who)
        if (result === 'end') { set({ stats, relations, flags, learned, ledger, mode: 'explore', sceneComplete: true }); return }
        const target = PROLOGUE.nodes[result.nodeId]
        set({
          stats, relations, flags, learned, ledger, cursor: result, location: target.location,
          visited: s.visited.includes(target.location) ? s.visited : [...s.visited, target.location],
        })
      },

      travel: (loc) => {
        const s = get()
        set({ location: loc, visited: s.visited.includes(loc) ? s.visited : [...s.visited, loc] })
      },

      examine: (hotspotId, learn) => {
        const s = get()
        set({
          examined: s.examined.includes(hotspotId) ? s.examined : [...s.examined, hotspotId],
          learned: learn && !s.learned.includes(learn) ? [...s.learned, learn] : s.learned,
        })
      },

      replayScene: () => set({ ...freshProgress(), sim: null, campaign: freshCampaign() }),
      resetAll: () => set({ phase: 'opening', role: null, persona: null, ...freshProgress(), sim: null, campaign: freshCampaign() }),

      /* ------------------------------------------------------------ */
      /* Part 2                                                        */
      /* ------------------------------------------------------------ */
      beginCampaign: () => {
        const s = get()
        if (!s.persona) return
        const sim = seedFromPrologue({ persona: s.persona, flags: s.flags, relations: s.relations, stats: s.stats })
        set({
          sim, mode: 'story', phase: 'play',
          campaign: { ...freshCampaign(), stage: 'brief', index: 0, ctx: ctxFromSim(sim), snapshot: clone(sim) },
        })
      },

      chooseLens: (lens) => {
        const s = get()
        const c = s.campaign
        if (!c.ctx || !s.sim) return
        const scene = getScenarioScene(c.index, c.ctx, lens, c.snapshot ?? s.sim)
        const sim = clone(c.snapshot ?? s.sim)
        enterNode(sim, scene.nodes[scene.start], scene.id)
        set({
          sim, cursor: { nodeId: scene.start, stage: 'lines', index: 0 }, mode: 'story',
          campaign: { ...c, stage: 'scene', lens, report: null, seenNotices: [], seenWitness: [] },
        })
      },

      useNotice: (noticeId) => {
        const s = get()
        if (s.campaign.stage !== 'scene' || !s.sim) return
        const scene = activeScene(s)
        const node = scene.nodes[s.cursor.nodeId]
        const n = node.notice?.find((x) => x.id === noticeId)
        if (!n || s.campaign.seenNotices.includes(`${scene.id}:${noticeId}`)) return
        const sim = clone(s.sim)
        applyNotice(sim, n, scene.id)
        set({ sim, campaign: { ...s.campaign, seenNotices: [...s.campaign.seenNotices, `${scene.id}:${noticeId}`] } })
      },

      markWitness: (lens, learn) => {
        const s = get()
        if (!s.sim || s.campaign.seenWitness.includes(lens)) return
        const sim = clone(s.sim)
        for (const info of learn) applyFx(sim, { t: 'insight', info }, 'witness')
        sim.reads.push({ i: s.campaign.index, lens })
        set({ sim, campaign: { ...s.campaign, seenWitness: [...s.campaign.seenWitness, lens] } })
      },

      rewind: () => {
        const s = get()
        const c = s.campaign
        if (!c.snapshot) return
        set({
          sim: clone(c.snapshot), mode: 'story', cursor: freshProgress().cursor,
          campaign: { ...c, stage: 'brief', lens: null, report: null, seenNotices: [], seenWitness: [], completed: c.completed.filter((i) => i !== c.index) },
        })
      },

      continueCampaign: () => {
        const s = get()
        const c = s.campaign
        if (!s.sim) return
        const sim = clone(s.sim)
        tick(sim)
        const echoes = firePending(sim)
        const index = c.index + 1
        if (index >= CHAPTER_COUNT) {
          set({ sim, cursor: freshProgress().cursor, campaign: { ...c, stage: 'finale', index, echoes, report: null, lens: null } })
          return
        }
        set({
          sim, cursor: freshProgress().cursor,
          campaign: { ...c, stage: 'brief', index, ctx: ctxFromSim(sim), lens: null, echoes, snapshot: clone(sim), report: null, seenNotices: [], seenWitness: [] },
        })
      },

      jumpToChapter: (index) => {
        const s = get()
        if (!s.persona || !s.sim) return
        const target = Math.max(0, Math.min(index, CHAPTER_COUNT - 1))
        const done = new Set(s.sim.log.map((e) => e.i))
        // a chapter can be revisited if every earlier chapter has recorded decisions
        for (let i = 0; i < target; i++) if (!done.has(i)) return
        const { sim, echoes } = replayCampaign({ persona: s.persona, flags: s.flags, relations: s.relations, stats: s.stats }, s.sim.log, s.sim.reads, target)
        set({
          sim, mode: 'story', phase: 'play', cursor: freshProgress().cursor,
          campaign: { ...freshCampaign(), stage: 'brief', index: target, ctx: ctxFromSim(sim), snapshot: clone(sim), echoes, completed: Array.from({ length: target }, (_, i) => i) },
        })
      },

      resetProgress: () => set({ phase: 'opening', role: null, persona: null, ...freshProgress(), sim: null, campaign: freshCampaign() }),
    }),
    {
      name: 'baghban-save-v3',
      version: 3,
      partialize: (s) => ({
        phase: s.phase, volume: s.volume, soundAuto: s.soundAuto, soundMix: s.soundMix, role: s.role, persona: s.persona,
        mode: s.mode, cursor: s.cursor, location: s.location, sceneComplete: s.sceneComplete,
        stats: s.stats, relations: s.relations, flags: s.flags, learned: s.learned,
        examined: s.examined, visited: s.visited, ledger: s.ledger, sim: s.sim, campaign: s.campaign,
      }),
      // If saved data points at something that no longer exists, fall back to a clean start.
      merge: (persisted, current) => {
        const p = persisted as Partial<GameState> | undefined
        if (!p || !p.cursor) return current
        try {
          const merged = { ...current, ...p } as GameState
          const scene = activeScene(merged)
          if (!scene.nodes[merged.cursor.nodeId]) return current
          return merged
        } catch { return current }
      },
    },
  ),
)

/** Finish the current situation: record what changed, and show the aftermath. */
function finishScenario(set: (p: Partial<GameState>) => void, get: () => GameState) {
  const s = get()
  const c = s.campaign
  const who = activeWho(s)
  if (!s.sim || !c.snapshot || !who) return
  const sim = clone(s.sim)
  snapshot(sim, c.index === CONFRONTATION_INDEX ? 's16' : SCENARIOS[c.index].id)
  const report = buildReport(c.snapshot, sim, who)
  set({ sim, campaign: { ...c, stage: 'aftermath', report, completed: Array.from(new Set([...c.completed, c.index])) } })
}

export const hasSavedGame = (s: GameState) => !!s.persona && (s.phase === 'play' || s.ledger.length > 0 || s.sceneComplete)
export const SCENE_DATA = PROLOGUE
