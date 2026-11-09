import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CharacterId, Cursor, LedgerEntry, LocationId, PersonaId, RoleId, Stat,
} from '../types'
import { SUNDAY_CHAI } from '../data/scenes/sundayChai'
import { advance, choose, resolveText } from '../engine/story'
import { roleOfPersona } from '../data/roles'

export type Phase = 'opening' | 'family' | 'role' | 'play'
export type Mode = 'story' | 'explore'

const SCENE = SUNDAY_CHAI
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

export const INITIAL_STATS: Record<Stat, number> = { warmth: 50, dignity: 55, burden: 30, trust: 50 }

interface GameState {
  phase: Phase
  /* sound */
  soundOn: boolean
  volume: number
  /* identity */
  role: RoleId | null
  persona: PersonaId | null
  /* story progress */
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
  /* actions */
  goTo: (phase: Phase) => void
  setSound: (on: boolean) => void
  setVolume: (v: number) => void
  pickRole: (role: RoleId) => void
  beginStory: (persona: PersonaId) => void
  next: () => void
  pick: (optionId: string) => void
  travel: (loc: LocationId) => void
  examine: (hotspotId: string, learn?: string) => void
  replayScene: () => void
  resetAll: () => void
}

const freshProgress = () => ({
  mode: 'story' as Mode,
  cursor: { nodeId: SCENE.start, stage: 'lines', index: 0 } as Cursor,
  location: SCENE.nodes[SCENE.start].location,
  sceneComplete: false,
  stats: { ...INITIAL_STATS },
  relations: {} as Partial<Record<CharacterId, number>>,
  flags: [] as string[],
  learned: [] as string[],
  examined: [] as string[],
  visited: [SCENE.nodes[SCENE.start].location] as LocationId[],
  ledger: [] as LedgerEntry[],
})

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'opening',
      soundOn: false,
      volume: 0.5,
      role: null,
      persona: null,
      ...freshProgress(),

      goTo: (phase) => set({ phase }),
      setSound: (soundOn) => set({ soundOn }),
      setVolume: (volume) => set({ volume }),

      pickRole: (role) => set({ role }),

      beginStory: (persona) =>
        set({ persona, role: roleOfPersona(persona), phase: 'play', ...freshProgress() }),

      next: () => {
        const { cursor, persona, mode } = get()
        if (!persona || mode !== 'story') return
        const res = advance(SCENE, cursor, persona)
        if (res.kind === 'end') {
          set({ mode: 'explore', sceneComplete: true })
          return
        }
        const node = SCENE.nodes[res.cursor.nodeId]
        const visited = get().visited
        set({
          cursor: res.cursor,
          location: node.location,
          visited: visited.includes(node.location) ? visited : [...visited, node.location],
        })
      },

      pick: (optionId) => {
        const { cursor, persona } = get()
        if (!persona || cursor.stage !== 'decision') return
        const node = SCENE.nodes[cursor.nodeId]
        const opt = node.decision?.options.find((o) => o.id === optionId)
        if (!opt) return
        const s = get()
        const stats = { ...s.stats }
        for (const [k, v] of Object.entries(opt.effects?.stats ?? {})) {
          stats[k as Stat] = clamp(stats[k as Stat] + (v ?? 0))
        }
        const relations = { ...s.relations }
        for (const [k, v] of Object.entries(opt.effects?.relations ?? {})) {
          relations[k as CharacterId] = clamp((relations[k as CharacterId] ?? 0) + (v ?? 0), -100, 100)
        }
        const flags = Array.from(new Set([...s.flags, ...(opt.effects?.flags ?? [])]))
        const learned = Array.from(new Set([...s.learned, ...(opt.effects?.learn ?? [])]))
        const ledger = opt.ledger
          ? [...s.ledger, { ...opt.ledger, id: `${node.id}:${opt.id}`, optionLabel: resolveText(opt.label, persona), persona }]
          : s.ledger

        const result = choose(SCENE, cursor, optionId, persona)
        if (result === 'end') {
          set({ stats, relations, flags, learned, ledger, mode: 'explore', sceneComplete: true })
          return
        }
        const target = SCENE.nodes[result.nodeId]
        set({
          stats, relations, flags, learned, ledger,
          cursor: result,
          location: target.location,
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

      replayScene: () => set({ ...freshProgress() }),

      resetAll: () =>
        set({ phase: 'opening', role: null, persona: null, ...freshProgress() }),
    }),
    {
      name: 'baghban-save-v1',
      version: 1,
      partialize: (s) => ({
        phase: s.phase, volume: s.volume, role: s.role, persona: s.persona,
        mode: s.mode, cursor: s.cursor, location: s.location, sceneComplete: s.sceneComplete,
        stats: s.stats, relations: s.relations, flags: s.flags, learned: s.learned,
        examined: s.examined, visited: s.visited, ledger: s.ledger,
      }),
      // If saved data points at a node that no longer exists, fall back to a clean start.
      merge: (persisted, current) => {
        const p = persisted as Partial<GameState> | undefined
        if (!p || !p.cursor || !SCENE.nodes[p.cursor.nodeId]) return current
        return { ...current, ...p }
      },
    },
  ),
)

export const hasSavedGame = (s: GameState) => !!s.persona && (s.phase === 'play' || s.ledger.length > 0 || s.sceneComplete)
export const SCENE_DATA = SCENE
