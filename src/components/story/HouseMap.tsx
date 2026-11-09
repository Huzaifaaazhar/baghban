import { LOCATIONS } from '../../data/locations'
import { CHARACTERS } from '../../data/characters'
import { useGame } from '../../store/gameStore'
import type { LocationId } from '../../types'
import { Modal } from '../ui/Modal'
import { IconEye } from '../ui/Icons'

const TOP: LocationId[] = ['boys-room', 'parents-bedroom', 'balcony']
const BOTTOM: LocationId[] = ['kitchen', 'dining-room', 'living-room', 'courtyard']

/** A 2D cut-away of Verma Sadan. Travel by choosing a room. */
export function HouseMap({ open, onClose, onGo }: { open: boolean; onClose: () => void; onGo: (l: LocationId) => void }) {
  const { location, visited, persona } = useGame()
  const Room = ({ id }: { id: LocationId }) => {
    const loc = LOCATIONS[id]
    const here = id === location
    const seen = visited.includes(id)
    return (
      <button
        onClick={() => { onGo(id); onClose() }}
        aria-current={here ? 'location' : undefined}
        className={`group relative flex min-h-[110px] flex-col items-start justify-between overflow-hidden rounded-[3px] border-2 p-3 text-left transition-all ${here ? 'border-glow bg-[#7a4a1f] shadow-[0_0_40px_rgba(243,185,95,0.55)_inset]' : 'border-[#3a2112] bg-[#4a2a17] hover:border-brass hover:bg-[#5b3519]'}`}
      >
        <span className="font-deva text-sm text-brass/80">{loc.hindi}</span>
        <span className="font-display text-xl font-semibold leading-tight text-cream sm:text-2xl">{loc.name}</span>
        <span className="mt-1 flex items-center gap-1.5 text-sm text-beige/80">
          <IconEye width={15} height={15} />
          {here ? 'You are here' : seen ? 'Visited' : 'Not yet seen'}
        </span>
        <span className={`absolute right-3 top-3 h-6 w-4 rounded-t-full border ${seen || here ? 'border-glow bg-glow/80 shadow-[0_0_14px_rgba(243,185,95,0.9)]' : 'border-[#2a170d] bg-[#1f1009]'}`} />
        {here && persona && (
          <span className="absolute bottom-2 right-2 rounded-sm bg-glow px-2 py-0.5 font-display text-sm font-bold uppercase tracking-widest text-umber">{CHARACTERS[persona].name}</span>
        )}
      </button>
    )
  }
  return (
    <Modal open={open} onClose={onClose} label="Walk through the house" wide restoreFocus={false}>
      <div className="p-5 sm:p-8">
        <p className="font-deva text-lg text-brass">वर्मा सदन</p>
        <h2 className="font-display text-3xl font-semibold text-cream sm:text-4xl">Verma Sadan</h2>
        <p className="mt-1 italic text-beige">Choose a room to walk into.</p>
        <div className="mt-5">
          {/* roof */}
          <div className="mx-auto -mb-1 h-0 w-[102%] -translate-x-[1%] border-x-[28px] border-b-[54px] border-x-transparent border-b-[#a65a3a]" aria-hidden />
          <div className="grid grid-cols-2 gap-1.5 rounded-sm bg-[#2a170d] p-1.5 sm:grid-cols-3">
            {TOP.map((id) => <Room key={id} id={id} />)}
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-sm bg-[#2a170d] p-1.5 sm:grid-cols-4">
            {BOTTOM.map((id) => <Room key={id} id={id} />)}
          </div>
          <div className="mt-1 h-3 rounded-sm bg-gradient-to-b from-[#6b4024] to-[#3a2112]" aria-hidden />
        </div>
      </div>
    </Modal>
  )
}
