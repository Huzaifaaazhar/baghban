# Baghban — Who Is Really Right?

A cinematic, 2D, browser-based family morality game inspired by the spirit of the Bollywood film *Baghban* (2003).
Three generations, one house, one roof that needs mending — and the question nobody can answer alone.

> **Part 1 — Visual foundation and core game.** Opening, family introduction, perspective selection,
> and the first playable scene (*Sunday Chai*) with a walkable 2D house.
>
> **Part 2 — Family simulation and consequence engine.** Fifteen interconnected situations, a deterministic
> offline simulation (no model, no API keys), character memory, delayed consequences, private information,
> and the same event played through three different pairs of eyes. See *Part 2* below.

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


---

# Part 2 — The simulation

After *Sunday Chai* choose **Begin the year at Verma Sadan**. Fifteen situations follow, from the first November
night to the next Diwali. Each is played through **one of three perspectives** — the parent, the child, or Alok —
and each perspective knows different things, notices different things, and is offered different choices.

| # | Situation | # | Situation |
| --- | --- | --- | --- |
| 1 | Midnight Typewriter | 9 | The Sacrifice Argument |
| 2 | Monthly Expenses | 10 | Household Rules |
| 3 | Living Arrangements | 11 | Forgotten Anniversary |
| 4 | Marriage Interference | 12 | Career Decision |
| 5 | Grandchildren | 13 | Unequal Responsibility |
| 6 | Family Gathering | 14 | Public Argument |
| 7 | Medical Emergency | 15 | The Apology |
| 8 | Personal Boundaries | | |

Every situation has a background, a conflict, three perspectives (each with at least three meaningful choices),
immediate consequences, delayed consequences, relationship changes and an authored aftermath scene, then a short
neutral report of *what you noticed* — never a grade. After a situation you can read it **through the others’ eyes**
(which reveals what they knew), or **rewind** it and play it again.

## How the simulation works

There is no score. A choice is described as an **act** — *who does what to whom, about which concern, in what tone,
with or without a reason, an alternative, or acknowledging the other person* — and the engine appraises it against context.

**Tracked per person** (derived from directed bonds plus inner state): trust, respect, resentment, emotional security,
feeling heard, independence, willingness to compromise, financial stress, emotional distance.
**Tracked for the family:** cohesion, communication, mutual respect, unresolved conflict, shared responsibility, emotional wellbeing.

What an act does depends on:

- **Who it touches** — each person cares about different things (Raj: dignity, usefulness; Meera: privacy, fairness…).
- **How it is done** — tone, giving the real reason, offering an alternative, listening first, doing it in public.
- **Agreements** — enforcing something agreed is not the same as a fresh demand; breaking one counts against you.
- **Needs on both sides** — a request from real need weighs differently from a convenience.
- **Knowledge** — harming someone *knowing* their reason carries more blame than doing it in ignorance (the hurt is the same).
- **History** — repeated dismissals of the same concern compound; reasonable compromises build goodwill that cushions later friction.
- **Other people’s circumstances** — security and strain amplify or soften what lands.

**Memory and forgiveness.** Everyone remembers. Serious incidents leave a *scar* that raises the floor on resentment and caps trust;
time wears it down slowly, never away. Apologies repair in proportion to quality (own it, be specific, no “but”, change something),
fatigue if repeated, and a non-apology lands as another dismissal. Unvoiced grievances *fester* between situations.

**Delayed consequences** fire several situations later (“Raj has stopped typing…”) and are carried into the next briefing.
**Private information** (Raj can’t sleep; Rohan has done the errands for a year; Pooja has seen the papers) is discovered by noticing,
remembering, asking, or by reading a situation through someone else’s eyes — and learning it *reframes* earlier decisions in the journal.

### Interconnection (examples)

- *Midnight Typewriter* can create a **quiet-hours agreement** that changes how Raj behaves in *Household Rules*; absorbing the noise silently causes an outburst two situations later.
- *Monthly Expenses* sets how care is paid for; secretly covering it makes your spouse find out; truth-telling can make brothers reveal their own numbers.
- *Living Arrangements* decides where the parents live, which relocates *Household Rules*.
- *Family Gathering* attendance is **computed from the relationships**, not scripted.
- *Medical Emergency* and *Unequal Responsibility* share a caregiving load; *Career Decision* shifts it.
- *Personal Boundaries* can leak a child’s secret to Raj; *The Sacrifice Argument*, *Public Argument* and *The Apology* all read the accumulated scars.

## Verify it yourself

```bash
npm run simcheck
```

Runs offline and checks: every situation × perspective × persona compiles with ≥3 options and valid references; all
~1,000 option runs complete; the engine behaves as described (blunt vs kind requests, compounding dismissals, goodwill,
scars, apology quality, delayed consequences, reframing); different play styles across all fifteen situations end in
measurably different families; identical choices reproduce an identical household. In the game, **Menu → Inspect the household**
shows every number (spoilers).

## Part 2 code map

```
src/sim/        types, data (concerns, private info, starting state), engine (appraise/apply/tick), seed (from Part 1), report, runtime
src/scenarios/  kit (authoring helpers + compile) and s01…s15 (one file per situation)
src/components/story/  ScenarioBrief, Aftermath, Inspector, YearInReview (+ Journal tabs: Insights, Remembered)
scripts/simcheck.mjs   verification harness
```
