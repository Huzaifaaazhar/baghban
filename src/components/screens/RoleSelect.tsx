import { motion } from 'framer-motion'
import { useState } from 'react'
import { CHARACTERS } from '../../data/characters'
import { ROLES, roleOfPersona } from '../../data/roles'
import { useGame } from '../../store/gameStore'
import type { PersonaId, RoleId } from '../../types'
import { Portrait } from '../art/Portrait'
import { SceneBackdrop } from '../art/SceneBackdrop'
import { Button } from '../ui/Button'

const ROLE_ORDER: RoleId[] = ['parent', 'child', 'alok']

function RoleArch({ role, selected, onPick }: { role: RoleId; selected: boolean; onPick: () => void }) {
  const r = ROLES[role]
  return (
    <motion.button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      whileHover={{ y: -6 }}
      className={`group relative flex w-full flex-col overflow-hidden rounded-t-[999px] rounded-b-md border-2 text-left transition-colors ${selected ? 'border-glow bg-[#4a2a17] shadow-[0_0_50px_rgba(243,185,95,0.4)]' : 'border-brass/40 bg-[#24130a] hover:border-brass'}`}
    >
      <div className="relative mx-auto mt-5 flex h-36 w-[78%] items-end justify-center overflow-hidden rounded-t-[999px] bg-gradient-to-b from-[#c9ac72] to-[#8a6a3a] sm:h-48">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,226,160,0.5),transparent_70%)]" />
        {r.personas.map((p, i) => (
          <Portrait
            key={p}
            spec={CHARACTERS[p].portrait}
            title={CHARACTERS[p].name}
            blink={false}
            className="relative h-[92%] shrink-0"
            style={{ marginLeft: i === 0 ? 0 : '-6%', width: `${r.personas.length === 1 ? 70 : r.personas.length === 2 ? 52 : 44}%` }}
          />
        ))}
      </div>
      <div className="p-5 pt-3 text-center">
        <h3 className="font-display text-3xl font-semibold text-cream">{r.title}</h3>
        <p className="mt-0.5 font-display text-lg italic text-glow">{r.tagline}</p>
        <p className="mt-2 text-[1.02rem] leading-snug text-beige">{r.summary}</p>
        <dl className="mt-3 space-y-1.5 border-t border-brass/25 pt-3 text-left text-[0.98rem] leading-snug">
          <div><dt className="inline font-display font-bold uppercase tracking-[0.15em] text-brass">You know </dt><dd className="inline text-cream/90">{r.knows}</dd></div>
          <div><dt className="inline font-display font-bold uppercase tracking-[0.15em] text-brass">You decide </dt><dd className="inline text-cream/90">{r.decides}</dd></div>
          <div><dt className="inline font-display font-bold uppercase tracking-[0.15em] text-brass">You carry </dt><dd className="inline text-cream/90">{r.carries}</dd></div>
        </dl>
        <span className={`mt-4 inline-block rounded-sm border px-4 py-1 font-display text-base font-bold uppercase tracking-[0.2em] ${selected ? 'border-glow bg-glow text-umber' : 'border-brass/50 text-brass group-hover:text-glow'}`}>
          {selected ? 'Chosen' : 'Choose'}
        </span>
      </div>
    </motion.button>
  )
}

export function RoleSelect() {
  const { goTo, beginStory, persona: savedPersona } = useGame()
  const [role, setRole] = useState<RoleId | null>(savedPersona ? roleOfPersona(savedPersona) : null)
  const [persona, setPersona] = useState<PersonaId | null>(savedPersona)

  const pickRole = (r: RoleId) => {
    setRole(r)
    const only = ROLES[r].personas
    setPersona(only.length === 1 ? only[0] : only.includes(persona as PersonaId) ? persona : null)
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 scale-105 blur-[5px]"><SceneBackdrop location="parents-bedroom" time="evening" /></div>
      <div className="absolute inset-0 bg-black/70" aria-hidden />
      <div className="scroll-thin absolute inset-0 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-6xl flex-col items-center px-4 pb-12 pt-6">
          <button onClick={() => goTo('family')} className="self-start rounded-sm border border-brass/50 bg-black/30 px-3 py-1 font-display text-sm font-bold uppercase tracking-widest text-cream hover:border-glow hover:text-glow">
            ← Back
          </button>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="mt-3 text-center text-shadow-film">
            <p className="font-display text-sm uppercase tracking-[0.4em] text-brass">Whose eyes?</p>
            <h1 className="font-display text-4xl font-semibold text-cream sm:text-6xl">Choose a perspective</h1>
            <p className="mx-auto mt-2 max-w-2xl text-lg italic text-beige sm:text-xl">
              The same Sunday, three ways. What you know, what you may say and what you must carry will change with the person you become.
            </p>
          </motion.div>

          <div className="mt-8 grid w-full gap-6 md:grid-cols-3">
            {ROLE_ORDER.map((r, i) => (
              <motion.div key={r} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15, duration: 0.8 }}>
                <RoleArch role={r} selected={role === r} onPick={() => pickRole(r)} />
              </motion.div>
            ))}
          </div>

          {role && ROLES[role].personas.length > 1 && (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 w-full max-w-3xl" aria-label="Choose who you are">
              <p className="text-center font-display text-xl italic text-glow">
                {role === 'parent' ? 'Which parent do you step into?' : 'Which son do you step into?'}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-4">
                {ROLES[role].personas.map((p) => {
                  const ch = CHARACTERS[p]
                  const on = persona === p
                  return (
                    <button
                      key={p} onClick={() => setPersona(p)} aria-pressed={on}
                      className={`flex w-40 flex-col items-center rounded-md border-2 p-3 transition ${on ? 'border-glow bg-[#4a2a17] shadow-[0_0_30px_rgba(243,185,95,0.4)]' : 'border-brass/40 bg-black/40 hover:border-brass'}`}
                    >
                      <span className="h-28 w-24 overflow-hidden rounded-sm bg-gradient-to-b from-[#c9ac72] to-[#8a6a3a]"><Portrait spec={ch.portrait} className="h-full w-full" blink={false} /></span>
                      <span className="mt-2 font-display text-2xl font-semibold text-cream">{ch.name}</span>
                      <span className="text-center text-sm leading-tight text-beige">{ch.title.split('·')[1]?.trim()}</span>
                    </button>
                  )
                })}
              </div>
            </motion.section>
          )}

          <div className="mt-10 flex flex-col items-center gap-2">
            {persona ? (
              <p className="text-lg italic text-beige">You will be {CHARACTERS[persona].fullName}.</p>
            ) : (
              <p className="text-lg italic text-beige/80">{role ? 'Choose who you are to begin.' : 'Choose a perspective to begin.'}</p>
            )}
            <Button disabled={!persona} onClick={() => persona && beginStory(persona)} className="text-xl">
              Begin: Sunday Chai
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
