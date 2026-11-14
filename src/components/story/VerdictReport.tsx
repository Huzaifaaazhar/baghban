import { motion } from 'framer-motion'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CHARACTERS } from '../../data/characters'
import { CHAPTER_COUNT } from '../../scenarios'
import { computeVerdict, ENDING_META, type EndingId } from '../../sim/verdict'
import { useGame } from '../../store/gameStore'
import { SceneBackdrop } from '../art/SceneBackdrop'
import { Button } from '../ui/Button'

/* ---------- 2D balance scale: parents' claim vs children's claim ---------- */
function Scale({ parents, children }: { parents: number; children: number }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 500); return () => clearTimeout(t) }, [])
  const angle = ready ? Math.max(-16, Math.min(16, (children - parents) * 18)) : 0
  const rad = (angle * Math.PI) / 180
  const L = 128
  const left = { x: 180 - L * Math.cos(rad), y: 62 - L * Math.sin(rad) }
  const right = { x: 180 + L * Math.cos(rad), y: 62 + L * Math.sin(rad) }
  const tr = 'transform 1.8s cubic-bezier(0.2,0.8,0.2,1)'
  return (
    <svg viewBox="-40 0 440 232" className="mx-auto h-auto w-full max-w-md [@media(max-height:520px)]:max-w-[17rem]" role="img" aria-label="A balance scale weighing the parents' claim against the children's claim">
      <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3c36f" /><stop offset="1" stopColor="#a8741f" /></linearGradient></defs>
      <rect x="170" y="62" width="20" height="130" rx="4" fill="#5a3520" />
      <path d="M130 200 H230 L212 188 H148Z" fill="#3a2112" />
      <circle cx="180" cy="62" r="10" fill="url(#gold)" />
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '180px 62px', transition: tr }}>
        <rect x={180 - L} y="58" width={L * 2} height="8" rx="4" fill="url(#gold)" />
      </g>
      {[['left', left, parents], ['right', right, children]].map(([k, p, w]) => {
        const pt = p as { x: number; y: number }
        const weight = w as number
        return (
          <g key={k as string} style={{ transform: `translate(${pt.x}px, ${pt.y}px)`, transition: tr }}>
            <path d="M0 0 L-34 62 M0 0 L34 62" stroke="#c79a3a" strokeWidth="2" />
            <path d="M-42 62 Q0 92 42 62Z" fill="#6b4024" stroke="#c79a3a" strokeWidth="2" />
            <circle cx="0" cy="56" r={4 + weight * 17} fill={k === 'left' ? '#c9ac72' : '#a14a5a'} opacity="0.92" />
          </g>
        )
      })}
      <text x="48" y="222" fill="#e9d8b0" fontFamily="Cormorant Garamond, serif" fontSize="15" textAnchor="middle">The parents’ claim</text>
      <text x="312" y="222" fill="#e9d8b0" fontFamily="Cormorant Garamond, serif" fontSize="15" textAnchor="middle">The children’s claim</text>
    </svg>
  )
}

const Section = ({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }}
    className="paper-dark mt-5 rounded-md p-5 sm:p-7"
  >
    {kicker && <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brass">{kicker}</p>}
    <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">{title}</h2>
    <div className="mt-3">{children}</div>
  </motion.section>
)

const EMBLEM: Record<EndingId, string> = { parents: '❶', children: '❷', alok: '❸', 'both-wrong': '❹', compromise: '❺' }

export function VerdictReport({ onInspect, onJournal, onChapters, onHistory }: { onInspect: () => void; onJournal: () => void; onChapters: () => void; onHistory: () => void }) {
  const { sim, beginCampaign, resetProgress, persona } = useGame()
  const [confirmReset, setConfirmReset] = useState(false)
  const v = useMemo(() => (sim ? computeVerdict(sim) : null), [sim])
  if (!sim || !v) return null
  const a = v.analysis
  const fitsSorted = [...v.fits].sort((x, y) => (y.passes ? 1 : 0) - (x.passes ? 1 : 0) || y.fit - x.fit)

  return (
    <div className="absolute inset-0 overflow-hidden bg-night" data-testid="verdict">
      <div className="absolute inset-0 scale-105 blur-[4px]"><SceneBackdrop location="courtyard" time="night" /></div>
      <div className="absolute inset-0 bg-black/78" aria-hidden />
      <div className="scroll-thin absolute inset-0 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-3 pb-24 pt-20 sm:pt-24">

          {/* ---- overall verdict ---- */}
          <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }} className="text-center text-shadow-film">
            <p className="font-display text-sm uppercase tracking-[0.45em] text-brass">The verdict</p>
            <p className="mt-2 font-display text-xl italic text-beige sm:text-2xl">“Every generation believes it understands the other.”</p>
          </motion.header>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }} className="mt-4">
            <Scale parents={v.balance.parents} children={v.balance.children} />
          </motion.div>
          <motion.section
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1 }}
            className="paper-dark mt-2 rounded-md p-6 text-center sm:p-9" aria-label="Overall verdict"
          >
            <p className="font-display text-sm font-bold uppercase tracking-[0.35em] text-brass">Ending {v.number} of 5</p>
            <h1 data-testid="ending-title" className="mt-1 font-display text-4xl font-semibold leading-tight text-cream sm:text-6xl"><span className="mr-3 text-glow" aria-hidden>{EMBLEM[v.ending]}</span>{v.title}</h1>
            <p className="mt-1 font-display text-xl italic text-glow">{v.tagline}</p>
            <div className="ornament-rule my-5" />
            <p className="mx-auto max-w-2xl text-[1.2rem] leading-relaxed text-cream">{v.summary}</p>
            {v.alokNote && <p className="mx-auto mt-3 max-w-2xl rounded-sm border border-brass/40 bg-black/25 p-3 text-[1.08rem] italic text-beige">{v.alokNote}</p>}
            {v.statements.length > 0 && (
              <div className="mx-auto mt-5 max-w-2xl text-left">
                <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brass">Your choices, in plain terms</p>
                <ul className="mt-1.5 space-y-1.5 text-[1.12rem] text-cream">{v.statements.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="mt-1 text-sm italic text-beige/80">This describes what was chosen in this telling, not who you are.</p>
              </div>
            )}
          </motion.section>

          {/* ---- why ---- */}
          <Section kicker="How the game reached this" title="Why this ending">
            <p className="text-[1.05rem] italic text-beige">Nothing here counts “parent-friendly” or “child-friendly” choices. Each reading below is tested against what actually happened: who did harm, how much of it was justified, what was said or left unsaid, what was agreed, and what scars remain.</p>
            <ul className="mt-3 space-y-1 text-[1.05rem] text-cream" data-testid="reasons">{v.reasons.map((r) => <li key={r} className={r.startsWith('✓') ? '' : 'text-[#e79aa6]'}>{r}</li>)}</ul>
            <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-brass">The five readings, side by side</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {fitsSorted.map((f) => (
                <li key={f.id} className={`rounded-sm border p-3 ${f.id === v.ending ? 'border-glow bg-[#4a2a17]' : 'border-brass/25 bg-black/25'}`}>
                  <div className="flex items-baseline justify-between gap-2"><span className="font-display text-lg font-semibold text-cream">{ENDING_META[f.id].n}. {ENDING_META[f.id].title}</span><span className="text-sm text-beige">{f.passes ? 'all tests met' : `${f.checks.filter((c) => c.ok).length}/${f.checks.length} tests`}</span></div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-black/40"><div className="h-full rounded-full bg-gradient-to-r from-olive to-amber" style={{ width: `${Math.round(f.fit * 100)}%` }} /></div>
                </li>
              ))}
            </ul>
          </Section>

          {/* ---- behaviour analyses ---- */}
          <div className="grid gap-5 md:grid-cols-3">
            {(['parents', 'children', 'alok'] as const).map((g) => {
              const b = v.behaviour[g]
              return (
                <motion.section key={g} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }} className="paper-dark mt-5 rounded-md p-5" aria-label={`${b.headline} — behaviour`}>
                  <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brass">{g === 'parents' ? 'Parent behaviour' : g === 'children' ? 'Children’s behaviour' : 'Alok’s approach'}</p>
                  <h2 className="font-display text-2xl font-semibold text-cream">{b.headline}</h2>
                  <ul className="mt-2 space-y-1.5 text-[1.02rem] leading-snug text-cream">{b.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  {b.harmful.length > 0 && <div className="mt-3"><p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[#e79aa6]">What strained things</p><ul className="mt-1 list-disc space-y-1 pl-5 text-[0.98rem] italic text-beige">{b.harmful.map((n) => <li key={n}>{n}</li>)}</ul></div>}
                  {b.constructive.length > 0 && <div className="mt-3"><p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[#c9d78a]">What helped</p><ul className="mt-1 list-disc space-y-1 pl-5 text-[0.98rem] italic text-beige">{b.constructive.map((n) => <li key={n}>{n}</li>)}</ul></div>}
                </motion.section>
              )
            })}
          </div>

          {/* ---- decisions ---- */}
          <div className="grid gap-5 md:grid-cols-2">
            {([['Most constructive decisions', v.best, 'olive'], ['Most damaging decisions', v.worst, 'burgundy']] as const).map(([title, list, tone]) => (
              <motion.section key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7 }} className="paper-dark mt-5 rounded-md p-5" aria-label={title}>
                <h2 className="font-display text-2xl font-semibold text-cream">{title}</h2>
                {list.length === 0 && <p className="mt-2 italic text-beige">{tone === 'olive' ? 'No single decision stands out as having helped.' : 'No single decision did lasting harm.'}</p>}
                <ol className="mt-2 space-y-3">
                  {list.map((d) => (
                    <li key={d.e.i + d.e.nodeId + d.e.optionId} className={`rounded-sm border-l-4 bg-black/25 p-3 ${tone === 'olive' ? 'border-olive' : 'border-burgundy'}`}>
                      <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brass">{d.e.i + 1}. {d.e.title} · as {CHARACTERS[d.e.who].name}</p>
                      <p className="text-[1.08rem] font-semibold leading-snug text-cream">“{d.e.label}”</p>
                      <p className="mt-0.5 text-[0.98rem] italic text-beige">{d.why}</p>
                    </li>
                  ))}
                </ol>
              </motion.section>
            ))}
          </div>

          {/* ---- relationships ---- */}
          <Section kicker="Over the year" title="How the relationships changed">
            <ul className="grid gap-2 sm:grid-cols-2" data-testid="relationships">
              {v.rel.map((r) => (
                <li key={r.a + r.b} className="flex items-center justify-between gap-3 rounded-sm border border-brass/25 bg-black/25 p-2.5 text-[1.02rem] text-cream">
                  <span><span className="font-semibold">{CHARACTERS[r.a].name}</span> → {CHARACTERS[r.b].name}<br /><span className="text-sm italic text-beige">{r.before} → {r.word}{r.scar >= 8 ? ' · carries a scar' : ''}</span></span>
                  <span className={`font-display text-xl ${r.delta >= 6 ? 'text-[#c9d78a]' : r.delta <= -6 ? 'text-[#e79aa6]' : 'text-beige'}`} aria-label={r.delta >= 6 ? 'warmer' : r.delta <= -6 ? 'colder' : 'about the same'}>{r.delta >= 6 ? '▲' : r.delta <= -6 ? '▼' : '●'}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* ---- wellbeing ---- */}
          <Section kicker="Where the household ended" title="Family wellbeing">
            <ul className="grid gap-3 sm:grid-cols-2">
              {v.family.map((f) => (
                <li key={f.attr} className="rounded-sm border border-brass/25 bg-black/25 p-3">
                  <div className="flex items-baseline justify-between"><span className="font-display text-lg font-semibold text-glow">{f.label}</span><span className="font-display text-lg italic text-cream">{f.word}</span></div>
                  <div className="relative mt-2 h-2 rounded-full bg-black/40">
                    <div className="h-full rounded-full bg-gradient-to-r from-olive to-amber transition-all duration-1000" style={{ width: `${f.value}%` }} />
                    <span className="absolute top-[-3px] h-3.5 w-0.5 bg-cream/80" style={{ left: `${f.start}%` }} title="where the year began" />
                  </div>
                  <p className="mt-1 text-xs italic text-beige/80">The pale mark shows where the year began.</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[1.02rem] text-beige">The parents’ sense of security ended at {a.parentsSecurity}; the children’s sense of independence at {a.childrenIndependence}.</p>
          </Section>

          {/* ---- conflicts ---- */}
          <Section kicker="Not finished" title="Unresolved conflicts">
            {v.conflicts.issues.length === 0 && v.conflicts.scars.length === 0 ? <p className="italic text-beige">Nothing important is left unspoken, and no injury has left a lasting mark.</p> : (
              <>
                <ul className="space-y-1.5 text-[1.05rem] text-cream">{v.conflicts.issues.map((g, i) => <li key={i}><span className="font-semibold">{CHARACTERS[g.a].name} toward {CHARACTERS[g.b].name}</span>{g.unspoken ? ' (unspoken)' : ''}: <span className="italic text-beige">{g.text}</span></li>)}</ul>
                {v.conflicts.scars.length > 0 && <p className="mt-3 text-[1.02rem] text-beige">Lasting scars: {v.conflicts.scars.map((s) => `${CHARACTERS[s.a].name} toward ${CHARACTERS[s.b].name}`).join('; ')}.</p>}
              </>
            )}
          </Section>

          {/* ---- missed ---- */}
          <Section kicker="Roads not taken" title="Missed opportunities for compromise">
            {v.missed.length === 0 ? <p className="italic text-beige">Whenever a conciliatory option was open, it was taken.</p> : (
              <ol className="space-y-3" data-testid="missed">
                {v.missed.map((m) => (
                  <li key={m.e.i + m.e.nodeId} className="rounded-sm bg-black/25 p-3">
                    <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brass">{m.e.i + 1}. {m.e.title} · as {CHARACTERS[m.e.who].name}</p>
                    <p className="text-[1.02rem] text-cream"><span className="text-beige">You chose</span> “{m.chosen}”</p>
                    <p className="text-[1.02rem] text-cream"><span className="text-beige">A more conciliatory option was open:</span> “{m.alternative}”</p>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {/* ---- the confrontation ---- */}
          <Section kicker="The last night" title="At the table">
            <p className="text-[1.05rem] text-cream">
              {v.confrontation.settlement && v.confrontation.settlement !== 'nothing' ? `You proposed a concrete change (${v.confrontation.settlement.replace('-', ' ')}). ` : 'Nothing was settled that night. '}
              {v.confrontation.apologised.length ? `${v.confrontation.apologised.map((c) => CHARACTERS[c].name).join(' and ')} apologised. ` : 'No apology was made. '}
              {v.confrontation.silent.length ? `${v.confrontation.silent.map((c) => CHARACTERS[c].name).join(' and ')} stayed silent when it mattered.` : ''}
            </p>
          </Section>

          {/* ---- the question ---- */}
          <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} className="mt-10 text-center text-shadow-film">
            <p className="font-deva text-2xl text-glow">बागबान</p>
            <h2 className="font-display text-5xl font-semibold tracking-wide text-cream sm:text-7xl">Who was really right?</h2>
            <div className="ornament-rule mx-auto my-5 w-64" />
            <ul className="mx-auto max-w-xl space-y-2 text-[1.15rem] italic text-beige">
              <li>If a parent gives forty years, what does a child owe — and is it money?</li>
              <li>Is a boundary a wall, or the first courtesy of an adult?</li>
              <li>When both sides are waiting to be apologised to, whose silence is longer?</li>
            </ul>
            <p className="mt-4 text-sm italic text-beige/70">{persona ? `You began as ${CHARACTERS[persona].name}. ` : ''}{CHAPTER_COUNT} chapters played.</p>
          </motion.section>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={onChapters}>Revisit a chapter</Button>
            <Button variant="ghost" onClick={onHistory}>Decision history</Button>
            <Button variant="ghost" onClick={onJournal}>The journal</Button>
            <Button variant="ghost" onClick={onInspect}>Inspect every number</Button>
            <Button variant="ghost" onClick={beginCampaign}>Live the year again</Button>
            <Button variant="ghost" onClick={() => setConfirmReset(true)}>Reset all progress</Button>
          </div>
          {confirmReset && (
            <div className="paper mx-auto mt-4 max-w-md rounded-sm p-4 text-center" role="alertdialog" aria-label="Confirm reset">
              <p className="text-lg">Erase every decision and begin from the opening?</p>
              <div className="mt-3 flex justify-center gap-3"><Button variant="paper" onClick={resetProgress}>Yes, erase everything</Button><Button variant="paper" onClick={() => setConfirmReset(false)}>Keep it</Button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
