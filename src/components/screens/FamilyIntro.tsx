import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { CHARACTERS, FAMILY_ORDER } from '../../data/characters'
import { useGame } from '../../store/gameStore'
import type { Character, CharacterId } from '../../types'
import { Portrait } from '../art/Portrait'
import { Button } from '../ui/Button'
import { IconBack, IconChevron } from '../ui/Icons'
import { Modal } from '../ui/Modal'

function FramedPortrait({ ch, seen, onOpen, small = false }: { ch: Character; seen: boolean; onOpen: () => void; small?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -6, rotate: ch.id.length % 2 ? 0.6 : -0.6 }}
      aria-label={`Meet ${ch.fullName}, ${ch.title}`}
      className="group relative flex flex-col items-center"
      style={{ width: small ? 'clamp(84px, 22vw, 120px)' : 'clamp(100px, 10.5vw, 150px)' }}
    >
      <span className="absolute -top-3 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-brass/70" aria-hidden />
      <span className="relative block w-full rounded-[3px] bg-gradient-to-br from-[#8b5a30] via-[#6b4024] to-[#3a2112] p-[7px] shadow-[0_16px_26px_-8px_rgba(0,0,0,0.8)] ring-1 ring-brass/60 transition group-hover:ring-glow">
        <span className="block rounded-[1px] bg-[#d9c08a] p-[5px]">
          <span className="relative block aspect-[3/4] overflow-hidden bg-gradient-to-b from-[#b89a62] to-[#8a6a3a]">
            <Portrait spec={ch.portrait} title={ch.name} className="absolute inset-0 h-full w-full sepia-[0.35]" blink={false} />
            <span className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10" />
          </span>
        </span>
        {seen && (
          <span className="absolute -right-2 -top-2 grid h-7 w-7 rotate-12 place-items-center rounded-full bg-burgundy font-display text-sm font-bold text-cream shadow-md ring-1 ring-brass" title="Met" aria-label="Already met">✓</span>
        )}
      </span>
      <span className="mt-2 w-[94%] rounded-[2px] border border-brass/60 bg-gradient-to-b from-[#d7b15d] to-[#a37a2a] px-1 py-0.5 text-center font-display text-base font-bold leading-tight tracking-wide text-umber shadow sm:text-lg">
        {ch.name}
      </span>
      <span className="mt-0.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#5a3520] sm:text-sm">{ch.title.split('·')[0].trim()}</span>
    </motion.button>
  )
}

function Dossier({ id, onClose, onNav }: { id: CharacterId | null; onClose: () => void; onNav: (d: 1 | -1) => void }) {
  const ch = id ? CHARACTERS[id] : null
  useEffect(() => {
    if (!id) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [id, onNav])

  return (
    <Modal open={!!ch} onClose={onClose} label={ch ? `About ${ch.fullName}` : 'Character'} wide bare>
      {ch && (
        <div className="paper scroll-thin relative flex max-h-[92dvh] flex-col overflow-y-auto rounded-md sm:flex-row sm:overflow-hidden">
          <div className="relative flex shrink-0 flex-col items-center justify-start bg-gradient-to-b from-[#4a2a17] to-[#2a170d] p-5 sm:w-[300px] sm:justify-center">
            <div className="rounded-[3px] bg-gradient-to-br from-[#8b5a30] to-[#3a2112] p-2 shadow-xl ring-1 ring-brass/60">
              <div className="rounded-[1px] bg-[#d9c08a] p-1.5">
                <div className="relative aspect-[3/4] w-[170px] overflow-hidden bg-gradient-to-b from-[#c9ac72] to-[#8a6a3a] sm:w-[220px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={ch.id} className="absolute inset-0" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <Portrait spec={ch.portrait} title={ch.name} className="h-full w-full" mood={ch.id === 'raj' || ch.id === 'vikram' ? 'tired' : 'warm'} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center font-display text-lg italic leading-snug text-beige">{ch.quote}</p>
          </div>

          <div className="scroll-thin min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">
            <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-burgundy">{ch.title}</p>
            <h2 className="font-display text-4xl font-semibold leading-tight text-umber sm:text-5xl">{ch.fullName}<span className="ml-3 text-2xl font-normal text-[#6b4024]">{ch.age}</span></h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ch.personality.traits.map((t) => (
                <span key={t} className="rounded-full border border-burgundy/50 bg-burgundy/10 px-3 py-0.5 text-base font-semibold text-burgundy">{t}</span>
              ))}
            </div>
            <p className="mt-3 text-[1.12rem] leading-snug">{ch.personality.portrait}</p>

            <Section title="Occupation"><p>{ch.occupation}</p></Section>
            <Section title="Responsibilities"><ul className="list-disc space-y-0.5 pl-5">{ch.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul></Section>
            <Section title="Financial circumstances"><p>{ch.finances}</p></Section>
            <Section title="With the others">
              <ul className="space-y-1">
                {ch.relationships.map((r) => (
                  <li key={r.with + r.text}><strong className="font-semibold text-burgundy">{r.with === 'all' ? 'With the sons' : `With ${CHARACTERS[r.with].name}`}:</strong> {r.text}</li>
                ))}
              </ul>
            </Section>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[['Wants', ch.motivation], ['Frustrated by', ch.frustration], ['Expects', ch.expectation]].map(([k, v]) => (
                <div key={k} className="rounded-sm border border-[#8b5a30]/40 bg-white/30 p-3">
                  <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-burgundy">{k}</p>
                  <p className="mt-0.5 leading-snug">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="paper" onClick={() => onNav(-1)} className="!px-3 !py-2 !text-base sm:!px-4"><IconBack width={18} height={18} /> Previous</Button>
              <span className="hidden text-sm italic text-[#6b4024] min-[420px]:inline">{FAMILY_ORDER.indexOf(ch.id) + 1} of {FAMILY_ORDER.length}</span>
              <Button variant="paper" onClick={() => onNav(1)} className="!px-3 !py-2 !text-base sm:!px-4">Next <IconChevron width={18} height={18} /></Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-4">
    <h3 className="font-display text-xl font-semibold text-burgundy">{title}</h3>
    <div className="text-[1.08rem] leading-snug">{children}</div>
  </section>
)

export function FamilyIntro() {
  const goTo = useGame((s) => s.goTo)
  const [open, setOpen] = useState<CharacterId | null>(null)
  const [seen, setSeen] = useState<CharacterId[]>([])

  const openChar = useCallback((id: CharacterId) => {
    setOpen(id)
    setSeen((s) => (s.includes(id) ? s : [...s, id]))
  }, [])

  const nav = useCallback((d: 1 | -1) => {
    setOpen((cur) => {
      if (!cur) return cur
      const i = (FAMILY_ORDER.indexOf(cur) + d + FAMILY_ORDER.length) % FAMILY_ORDER.length
      const next = FAMILY_ORDER[i]
      setSeen((s) => (s.includes(next) ? s : [...s, next]))
      return next
    })
  }, [])

  const F = ({ id, small }: { id: CharacterId; small?: boolean }) => (
    <FramedPortrait ch={CHARACTERS[id]} seen={seen.includes(id)} onOpen={() => openChar(id)} small={small} />
  )

  return (
    <div className="absolute inset-0 overflow-hidden bg-night">
      {/* the wall */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#e0c78f_0%,#cfb07a_100%)]" aria-hidden />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20px_20px,rgba(122,34,49,0.35)_2px,transparent_3px),radial-gradient(circle_at_0_0,rgba(122,34,49,0.25)_2px,transparent_3px)] [background-size:40px_40px]" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,226,160,0.55),transparent_60%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-3 bg-[#6b4024]" aria-hidden />
      <div className="vignette" />

      <div className="scroll-thin absolute inset-0 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-6xl flex-col items-center px-4 pb-10 pt-8 text-umber">
          <button onClick={() => goTo('opening')} className="self-start rounded-sm border border-[#6b4024]/50 bg-black/10 px-3 py-1 font-display text-sm font-bold uppercase tracking-widest text-umber hover:bg-black/20">
            ← Back
          </button>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mt-1 text-center">
            <p className="font-deva text-xl text-burgundy">वर्मा सदन, लखनऊ</p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-umber sm:text-5xl">The Vermas of Lucknow</h1>
            <p className="mx-auto mt-1.5 max-w-2xl text-lg italic text-[#5a3520]">
              A house built in 1991, in the year the first son was born. Thirty-three years of tea, tuition fees and things left unsaid. Touch a photograph to know them.
            </p>
          </motion.div>

          <div className="mt-5 flex w-full flex-1 flex-col items-center gap-6">
            {/* parents + Alok */}
            <div className="flex w-full flex-wrap items-start justify-center gap-x-[clamp(24px,6vw,110px)] gap-y-8">
              <div className="flex flex-col items-center">
                <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.3em] text-burgundy">The parents</p>
                <div className="flex gap-[clamp(14px,3vw,40px)]"><F id="raj" /><F id="pooja" /></div>
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.3em] text-burgundy">Not family — yet always there</p>
                <F id="alok" />
              </div>
            </div>

            {/* sons and wives */}
            <div className="flex w-full flex-col items-center">
              <p className="mb-3 font-display text-sm font-bold uppercase tracking-[0.3em] text-burgundy">Their sons, and the families they have built</p>
              <div className="flex flex-wrap justify-center gap-x-[clamp(18px,4vw,64px)] gap-y-8">
                {([['vikram', 'meera'], ['rohan', 'simran'], ['kabir', 'ananya']] as [CharacterId, CharacterId][]).map(([a, b]) => (
                  <div key={a} className="flex gap-[clamp(8px,1.4vw,18px)]"><F id={a} /><F id={b} /></div>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 mt-8 flex w-[calc(100%+2rem)] flex-col items-center gap-2 bg-gradient-to-t from-[#cdae77] via-[#cdae77]/95 to-transparent px-4 pb-4 pt-8">
            <p className="text-base italic text-[#5a3520]">{seen.length === 0 ? 'No one here is a villain. Nobody is a saint.' : `${seen.length} of ${FAMILY_ORDER.length} met`}</p>
            <Button onClick={() => goTo('role')} className="text-xl">Choose whose eyes to see through</Button>
          </div>
        </div>
      </div>

      <Dossier id={open} onClose={() => setOpen(null)} onNav={nav} />
    </div>
  )
}
