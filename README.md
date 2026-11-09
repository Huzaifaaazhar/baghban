# Baghban — Who Is Really Right?

A cinematic, 2D, browser-based family morality game inspired by the spirit of the Bollywood film *Baghban* (2003).
Three generations, one house, one roof that needs mending — and the question nobody can answer alone.

> **Part 1 — Visual foundation and core game.** Opening, family introduction, perspective selection,
> and the first playable scene (*Sunday Chai*) with a walkable 2D house.

All artwork is original, hand-built SVG + CSS. All sound is synthesised in the browser (Web Audio).
No film footage, posters or soundtrack recordings are used, and all dialogue is original.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## What's in Part 1

| Screen | What it does |
| --- | --- |
| **Opening** | Cinematic title over an animated 2D Indian living room (turning ceiling fan, swaying curtains, steam, dust in the light). Start Experience / Continue, ambient sound toggle + volume. |
| **The Vermas** | A wall of framed photographs. Each of the nine characters opens into a dossier: personality, occupation, responsibilities, finances, relationships, motivation, frustration, expectation. |
| **Perspective** | Choose **Parent** (Raj or Pooja), **Child** (Vikram, Rohan or Kabir) or **Alok**. |
| **Sunday Chai** | A fully playable scene: dialogue, inner thoughts, role-specific decisions, consequences, and story-driven navigation between rooms. |
| **The house** | After the scene, walk Verma Sadan — seven rooms, each with objects to examine and doors to walk through — via doors in the art, buttons, or a cut-away house map. |
| **Journal** | Your role, what *you* know, the moments your choices wrote down, and how the household and each person now feel about you. |

### The role changes everything

The same Sunday plays out differently depending on who you are:

- **Information** — each persona starts with different private knowledge (Raj knows the true savings; Pooja knows about the knee slip; Vikram knows his bonus was halved; Alok only knows what he can see). Inner thoughts and room observations are written per person.
- **Decisions** — each role gets its own set of choices with different costs (Raj weighs pride vs honesty, Pooja weighs shielding vs speaking, the sons weigh generosity vs limits, Alok weighs helping vs overstepping).
- **Responsibilities** — shown in the journal (duties, circumstances, what you carry).
- **Who you can hear** — where you go after dusk (kitchen, dining room, balcony) decides which conversation you witness.

Nobody is a villain. Every option carries a quiet cost, recorded in the journal with whose position it leaned toward (`parents` / `children` / `alok`) — the ledger a later part will use to weigh *who was really right*.

## Tech

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (theme tokens in `src/index.css`)
- **Framer Motion** for restrained scene transitions
- **Zustand** (+ `persist` → `localStorage`) for state and automatic saving
- Fonts self-hosted via `@fontsource` (Cormorant Garamond, Crimson Pro, Tiro Devanagari Hindi)

## Architecture

```
src/
  types.ts                 domain types (characters, scenes, decisions, effects)
  data/
    characters.ts          the nine characters (personality, finances, relationships…)
    roles.ts               roles + each persona's duties & starting knowledge
    locations.ts           the seven rooms and how they connect
    explore.ts             examinable objects and doors per room (art-space coordinates)
    knowledge.ts           things a player can come to know
    scenes/sundayChai.ts   the first scene as a graph of nodes → lines → decisions
  engine/
    story.ts               pure functions: cursor, advance, choose, persona/role filtering
    describe.ts            words for stats & relationships
  store/gameStore.ts       Zustand store + persistence
  audio/                   procedural ambient sound (tanpura-like drone, room tone, clock)
  components/
    art/                   SVG rooms, shared parts, Portrait, scene backdrop, hotspot layer
    story/                 reusable DialogueBox, DecisionPanel, CastLayer, Journal, HouseMap …
    screens/               Opening, FamilyIntro, RoleSelect, Play
    ui/                    Button, Modal, Icons, SoundControl
```

### Writing a new scene

Scenes are plain data (`StoryScene`): nodes with a `location`, `time`, `cast`, `lines`, an optional
`decision`, and a `next`. Anything can be gated by persona or role:

```ts
{ speaker: 'thought', for: ['vikram'], text: 'The EMI is fifty-eight thousand…' }
{ id: 'r-pride', for: ['raj'], label: '“I will manage.”', effects: { stats: { dignity: 8 } }, ledger: {…}, response: [...] }
```

Text can be localized per persona or role: `{ raj: '…', pooja: '…', child: '…', default: '…' }`.
The engine skips stages that have nothing to show for a persona, and a decision can only be resolved by choosing.

## Notes

- Progress is saved automatically in `localStorage` (`baghban-save-v1`). *Menu → Return to the opening → Continue* resumes it.
- Ambient sound starts off (browsers require a user gesture) — use the speaker control.
- Keyboard: `Space` / `Enter` / `→` advance dialogue; `1`–`4` choose an option; `Esc` closes overlays.
- Respects `prefers-reduced-motion`.
