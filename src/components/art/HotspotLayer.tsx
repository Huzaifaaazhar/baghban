import { useState } from 'react'
import { EXITS, HOTSPOTS, type Hotspot, type Exit } from '../../data/explore'
import type { LocationId } from '../../types'

/**
 * Interactive layer drawn over the room in the same 1600×900 coordinate space.
 * Objects pulse softly until examined; doors show where they lead.
 */
export function HotspotLayer({
  location, examined, onExamine, onTravel,
}: {
  location: LocationId
  examined: string[]
  onExamine: (h: Hotspot) => void
  onTravel: (e: Exit) => void
}) {
  const [hover, setHover] = useState<string | null>(null)
  const spots = HOTSPOTS[location]
  const exits = EXITS[location]
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="group" aria-label="Things to look at and doors">
      {exits.map((e) => {
        const active = hover === 'e-' + e.to
        return (
          <g
            key={e.to}
            role="button"
            tabIndex={0}
            aria-label={`Walk to ${e.label}`}
            className="cursor-pointer"
            onMouseEnter={() => setHover('e-' + e.to)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover('e-' + e.to)}
            onBlur={() => setHover(null)}
            onClick={() => onTravel(e)}
            onKeyDown={(k) => { if (k.key === 'Enter' || k.key === ' ') { k.preventDefault(); onTravel(e) } }}
          >
            <rect x={e.x} y={e.y} width={e.w} height={e.h} rx="10" fill={active ? 'rgba(255,205,110,0.28)' : 'rgba(255,205,110,0.0)'} stroke={active ? '#f3b95f' : 'rgba(243,185,95,0.0)'} strokeWidth="3" style={{ transition: 'all .25s' }} />
            <g transform={`translate(${e.x + e.w / 2} ${e.y + e.h - 40})`} opacity={active ? 1 : 0.8}>
              <circle r="26" fill="rgba(29,15,8,0.7)" stroke="#f3b95f" strokeWidth="2" />
              <path d="M-7 -12 L9 0 L-7 12" stroke="#f3b95f" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {active && <Label x={e.x + e.w / 2} y={e.y - 18} text={e.label} />}
          </g>
        )
      })}
      {spots.map((h) => {
        const seen = examined.includes(h.id)
        const active = hover === h.id
        const cx = h.x + h.w / 2
        const cy = h.y + h.h / 2
        return (
          <g
            key={h.id}
            role="button"
            tabIndex={0}
            aria-label={`Look closely: ${h.label}`}
            className="cursor-pointer"
            onMouseEnter={() => setHover(h.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(h.id)}
            onBlur={() => setHover(null)}
            onClick={() => onExamine(h)}
            onKeyDown={(k) => { if (k.key === 'Enter' || k.key === ' ') { k.preventDefault(); onExamine(h) } }}
          >
            <rect x={h.x} y={h.y} width={h.w} height={h.h} rx="14" fill={active ? 'rgba(255,230,160,0.2)' : 'transparent'} stroke={active ? '#f3b95f' : 'transparent'} strokeWidth="2.5" strokeDasharray="10 8" style={{ transition: 'all .25s' }} />
            <g transform={`translate(${cx} ${cy})`}>
              {!seen && <circle r="22" fill="none" stroke="#f3b95f" strokeWidth="2" opacity="0.7" className="flicker" />}
              <circle r={seen ? 8 : 12} fill={seen ? 'rgba(243,185,95,0.5)' : '#f3b95f'} stroke="#2a1408" strokeWidth="3" />
            </g>
            {active && <Label x={cx} y={h.y - 14} text={h.label} />}
          </g>
        )
      })}
    </svg>
  )
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  const w = Math.max(120, text.length * 15 + 40)
  return (
    <g pointerEvents="none" transform={`translate(${x} ${Math.max(46, y)})`}>
      <rect x={-w / 2} y={-30} width={w} height={44} rx="6" fill="rgba(29,15,8,0.9)" stroke="#c79a3a" strokeWidth="1.5" />
      <text textAnchor="middle" y={0} fontSize="26" fill="#f4e9d3" fontFamily="Cormorant Garamond, serif" fontWeight="600" letterSpacing="1.5">{text}</text>
    </g>
  )
}
