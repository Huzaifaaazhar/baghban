import type { ReactNode } from 'react'
import type { TimeOfDay } from '../../types'

/** Palette used across all hand-built SVG artwork. */
export const C = {
  cream: '#ecdcb6', creamDeep: '#dcc392', plaster: '#d9bf8b', plasterShade: '#c3a470',
  wood: '#5a3520', woodDark: '#3a2112', woodMid: '#7c4b27', woodLight: '#a87440',
  burgundy: '#7a2231', burgundyDark: '#561722', olive: '#6b6b3a', oliveDark: '#4c4c28',
  amber: '#d9923b', amberLight: '#f3b95f', brass: '#c79a3a', steel: '#b9b4a6', steelDark: '#86816f',
  ink: '#2a170d', ivory: '#f7ecd0', terracotta: '#a65a3a',
}

export const SKY: Record<TimeOfDay, [string, string]> = {
  morning: ['#f6dca2', '#fdf0cc'],
  afternoon: ['#bcd8e2', '#f5ecd2'],
  golden: ['#f1a850', '#fbd88e'],
  evening: ['#6e4660', '#eb9a5e'],
  night: ['#0e1830', '#33425f'],
}

export const isDark = (t: TimeOfDay) => t === 'night'

/* ---------- defs ---------- */
export function SvgDefs() {
  return (
    <defs>
      <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e4cf9f" />
        <stop offset="1" stopColor="#d3b680" />
      </linearGradient>
      <linearGradient id="g-wall-dark" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c9ab72" />
        <stop offset="1" stopColor="#a58851" />
      </linearGradient>
      <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8a5430" />
        <stop offset="1" stopColor="#4d2d18" />
      </linearGradient>
      <linearGradient id="g-floor-tile" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c08a58" />
        <stop offset="1" stopColor="#7d4f2e" />
      </linearGradient>
      <linearGradient id="g-wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#7c4b27" />
        <stop offset="0.5" stopColor="#8b5a30" />
        <stop offset="1" stopColor="#5f3a1e" />
      </linearGradient>
      <linearGradient id="g-wood-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8b5a30" />
        <stop offset="1" stopColor="#5a3520" />
      </linearGradient>
      <linearGradient id="g-curtain" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#561722" />
        <stop offset="0.25" stopColor="#8a2a3b" />
        <stop offset="0.5" stopColor="#6a1c2b" />
        <stop offset="0.75" stopColor="#8a2a3b" />
        <stop offset="1" stopColor="#561722" />
      </linearGradient>
      <linearGradient id="g-sofa" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7d7a45" />
        <stop offset="1" stopColor="#555229" />
      </linearGradient>
      <linearGradient id="g-steel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8f8a79" />
        <stop offset="0.35" stopColor="#ded9c8" />
        <stop offset="1" stopColor="#8a8573" />
      </linearGradient>
      <radialGradient id="g-lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffd98a" stopOpacity="0.95" />
        <stop offset="0.4" stopColor="#f3a94b" stopOpacity="0.4" />
        <stop offset="1" stopColor="#f3a94b" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="g-shadow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#1a0d06" stopOpacity="0.6" />
        <stop offset="0.6" stopColor="#1a0d06" stopOpacity="0.3" />
        <stop offset="1" stopColor="#1a0d06" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="g-vignette" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#1a0d06" stopOpacity="0" />
        <stop offset="1" stopColor="#1a0d06" stopOpacity="0.55" />
      </radialGradient>
      <pattern id="p-jaali" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="none" stroke="#3a2112" strokeWidth="3" />
        <circle cx="18" cy="18" r="3.5" fill="#3a2112" />
      </pattern>
      <pattern id="p-rug" width="44" height="44" patternUnits="userSpaceOnUse">
        <rect width="44" height="44" fill="#7a2231" />
        <path d="M22 4 L40 22 L22 40 L4 22 Z" fill="none" stroke="#d9a441" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="4" fill="#d9a441" />
      </pattern>
      <pattern id="p-tile" width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="64" height="64" fill="#b6845a" />
        <rect width="64" height="64" fill="none" stroke="#6d4528" strokeWidth="2" />
        <rect x="26" y="26" width="12" height="12" fill="#a8744a" />
      </pattern>
      <pattern id="p-kitchen-tile" width="48" height="48" patternUnits="userSpaceOnUse">
        <rect width="48" height="48" fill="#ecdfbd" />
        <rect width="48" height="48" fill="none" stroke="#c9b88c" strokeWidth="2" />
        <path d="M24 8 L40 24 L24 40 L8 24 Z" fill="none" stroke="#6b7a50" strokeWidth="1.6" />
      </pattern>
            </defs>
  )
}

/* ---------- room shell ---------- */
export function RoomShell({
  floorY = 640, dadoY = 480, floor = 'wood', time, children, wall = 'g-wall',
}: {
  floorY?: number
  dadoY?: number
  floor?: 'wood' | 'tile'
  time: TimeOfDay
  children?: ReactNode
  wall?: string
}) {
  const planks: ReactNode[] = []
  if (floor === 'wood') {
    // perspective planks converging towards the vanishing point
    for (let i = -16; i <= 16; i++) {
      planks.push(
        <line key={i} x1={800 + i * 40} y1={floorY} x2={800 + i * 150} y2={900} stroke="#2e180c" strokeOpacity="0.45" strokeWidth="2" />,
      )
    }
    for (let j = 1; j < 7; j++) {
      const y = floorY + (900 - floorY) * (j / 7) ** 1.5
      planks.push(<line key={'h' + j} x1="0" y1={y} x2="1600" y2={y} stroke="#2e180c" strokeOpacity="0.28" strokeWidth="1.5" />)
    }
  }
  return (
    <g>
      <rect width="1600" height="900" fill={isDark(time) ? 'url(#g-wall-dark)' : `url(#${wall})`} />
      {/* dado panel + rails */}
      <rect y={dadoY} width="1600" height={floorY - dadoY} fill="#6b4024" />
      <rect y={dadoY} width="1600" height="14" fill="#8b5a30" />
      <rect y={dadoY + 14} width="1600" height="5" fill="#3a2112" opacity="0.5" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={30 + i * 140} y={dadoY + 34} width="100" height={floorY - dadoY - 56} rx="4" fill="none" stroke="#3a2112" strokeOpacity="0.55" strokeWidth="3" />
      ))}
      {/* top frieze */}
      <rect width="1600" height="26" fill="#6b4024" />
      <rect y="26" width="1600" height="6" fill="#c79a3a" opacity="0.7" />
      {/* floor */}
      <rect y={floorY} width="1600" height={900 - floorY} fill={floor === 'wood' ? 'url(#g-floor)' : 'url(#g-floor-tile)'} />
      {floor === 'tile' && <rect y={floorY} width="1600" height={900 - floorY} fill="url(#p-tile)" opacity="0.65" />}
      {planks}
      <rect y={floorY - 14} width="1600" height="16" fill="#3a2112" />
      <rect y={floorY - 14} width="1600" height="4" fill="#a87440" opacity="0.6" />
      {children}
    </g>
  )
}

/* ---------- window with jaali & curtains ---------- */
export function Window({
  x, y, w, h, time, curtains = true, arch = true,
}: { x: number; y: number; w: number; h: number; time: TimeOfDay; curtains?: boolean; arch?: boolean }) {
  const [top, bot] = SKY[time]
  const id = `sky-${x}-${y}-${time}`
  const path = arch
    ? `M${x} ${y + h} V${y + 70} Q${x} ${y} ${x + w / 2} ${y} Q${x + w} ${y} ${x + w} ${y + 70} V${y + h} Z`
    : `M${x} ${y} H${x + w} V${y + h} H${x} Z`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
        <clipPath id={id + '-c'}><path d={path} /></clipPath>
      </defs>
      <path d={path} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}-c)`}>
        {/* distant rooftops & neem tree */}
        <g opacity={time === 'night' ? 0.9 : 0.55} fill={time === 'night' ? '#070d1a' : '#8a5c3a'}>
          <rect x={x + 10} y={y + h - 90} width="70" height="90" />
          <rect x={x + w - 110} y={y + h - 120} width="90" height="120" />
          <circle cx={x + w / 2 - 20} cy={y + h - 70} r="52" fill={time === 'night' ? '#08111f' : '#6b6b3a'} />
          <rect x={x + w / 2 - 28} y={y + h - 70} width="16" height="70" />
        </g>
        {time === 'night' && (
          <g fill="#ffe9a8">
            {[[0.2, 0.3], [0.7, 0.2], [0.45, 0.12], [0.85, 0.5], [0.12, 0.6]].map(([a, b], i) => (
              <circle key={i} cx={x + w * a} cy={y + h * b} r={i % 2 ? 1.6 : 2.4} opacity="0.9" />
            ))}
            <circle cx={x + w * 0.72} cy={y + h * 0.22} r="14" fill="#fff4cf" opacity="0.9" />
          </g>
        )}
      </g>
      {/* jaali grille */}
      <path d={path} fill="url(#p-jaali)" opacity="0.5" />
      {/* frame */}
      <path d={path} fill="none" stroke="url(#g-wood)" strokeWidth="14" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#3a2112" strokeWidth="2" opacity="0.7" />
      <line x1={x + w / 2} y1={arch ? y : y} x2={x + w / 2} y2={y + h} stroke="#5a3520" strokeWidth="8" />
      <line x1={x} y1={y + h * 0.55} x2={x + w} y2={y + h * 0.55} stroke="#5a3520" strokeWidth="8" />
      <rect x={x - 14} y={y + h} width={w + 28} height="16" rx="3" fill="#7c4b27" />
      {curtains && <Curtains x={x} y={y - 14} w={w} h={h + 6} />}
    </g>
  )
}

export function Curtains({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const cw = Math.max(46, w * 0.22)
  const panel = (px: number, flip: boolean) => (
    <g className={flip ? 'sway-r' : 'sway-l'} style={{ transformOrigin: `${flip ? px + cw : px}px ${y}px` }}>
      <path
        d={`M${px} ${y} H${px + cw} V${y + h} Q${px + cw * 0.75} ${y + h + 10} ${px + cw * 0.5} ${y + h} Q${px + cw * 0.25} ${y + h - 10} ${px} ${y + h} Z`}
        fill="url(#g-curtain)"
      />
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={px + cw * f} y1={y + 6} x2={px + cw * f} y2={y + h - 6} stroke="#2e0d14" strokeOpacity="0.35" strokeWidth="3" />
      ))}
    </g>
  )
  return (
    <g>
      {panel(x - cw * 0.55, false)}
      {panel(x + w - cw * 0.45, true)}
      <rect x={x - cw - 10} y={y - 6} width={w + cw * 2 + 20} height="10" rx="5" fill="#3a2112" />
      <circle cx={x - cw - 10} cy={y - 1} r="9" fill="#c79a3a" />
      <circle cx={x + w + cw + 10} cy={y - 1} r="9" fill="#c79a3a" />
    </g>
  )
}

/* ---------- framed family photograph ---------- */
export function Photo({ x, y, w, h, variant = 0, rotate = 0 }: { x: number; y: number; w: number; h: number; variant?: number; rotate?: number }) {
  const cx = x + w / 2
  const figs = [
    [[0.3, 0.55, 0.11], [0.5, 0.5, 0.12], [0.7, 0.57, 0.1]],
    [[0.35, 0.55, 0.12], [0.65, 0.55, 0.12]],
    [[0.25, 0.6, 0.09], [0.45, 0.5, 0.11], [0.62, 0.53, 0.11], [0.8, 0.62, 0.08]],
  ][variant % 3]
  return (
    <g transform={`rotate(${rotate} ${cx} ${y + h / 2})`}>
      <rect x={x + 5} y={y + 9} width={w} height={h} fill="#1a0d06" opacity="0.35" />
      <rect x={x} y={y} width={w} height={h} fill="#4a2a17" />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} fill="#c79a3a" opacity="0.8" />
      <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill="#2e180c" />
      <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="#d9c08a" />
      <rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="#8a6a3a" opacity="0.25" />
      {figs.map(([fx, fy, fr], i) => (
        <g key={i} fill="#4a3320" opacity="0.8">
          <circle cx={x + 14 + (w - 28) * fx} cy={y + 14 + (h - 28) * fy * 0.75} r={(h - 28) * fr} />
          <path d={`M${x + 14 + (w - 28) * fx - (h - 28) * fr * 1.5} ${y + h - 14} Q${x + 14 + (w - 28) * fx} ${y + 14 + (h - 28) * fy * 0.75 + (h - 28) * fr * 1.1} ${x + 14 + (w - 28) * fx + (h - 28) * fr * 1.5} ${y + h - 14} Z`} />
        </g>
      ))}
    </g>
  )
}

/* ---------- small objects ---------- */
export function Lamp({ x, y, on = true, size = 1 }: { x: number; y: number; on?: boolean; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {on && <circle cx="0" cy="-60" r="170" fill="url(#g-lamp)" className="flicker-slow" />}
      <rect x="-5" y="-30" width="10" height="70" fill="#3a2112" />
      <ellipse cx="0" cy="40" rx="30" ry="8" fill="#3a2112" />
      <path d="M-34 -30 L-22 -88 H22 L34 -30 Z" fill={on ? '#f3c36f' : '#cfa95f'} />
      <path d="M-34 -30 L-22 -88 H22 L34 -30 Z" fill="url(#g-wood)" opacity="0.15" />
    </g>
  )
}

export function Diya({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <circle cx="0" cy="-16" r="52" fill="url(#g-lamp)" className="flicker" />
      <path d="M-20 0 Q0 22 20 0 Q16 -8 0 -8 Q-16 -8 -20 0Z" fill="#b9602d" />
      <g className="flame"><path d="M0 -10 Q-7 -22 0 -34 Q8 -22 0 -10Z" fill="#ffd36e" /><path d="M0 -12 Q-3 -20 0 -26 Q3 -20 0 -12Z" fill="#fff4cf" /></g>
    </g>
  )
}

export function Plant({ x, y, scale = 1, tulsi = false }: { x: number; y: number; scale?: number; tulsi?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-34 0 L-26 -62 H26 L34 0 Z" fill="#a65a3a" />
      <rect x="-38" y="-72" width="76" height="16" rx="4" fill="#b8683f" />
      {[[-30, -140, -18], [-12, -170, -8], [10, -165, 8], [30, -135, 20], [0, -120, 0], [-22, -105, -28], [22, -108, 26]].map(([lx, ly, rot], i) => (
        <g key={i} className="sway-plant" style={{ transformOrigin: '0px -70px' }}>
          <ellipse cx={lx} cy={ly} rx={tulsi ? 15 : 24} ry={tulsi ? 26 : 42} fill={i % 2 ? '#5d6a35' : '#6f7d3d'} transform={`rotate(${rot} ${lx} ${ly})`} />
        </g>
      ))}
    </g>
  )
}

export function WallClock({ x, y, r = 46 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 8} fill="#5a3520" />
      <circle cx={x} cy={y} r={r} fill="#f3e5c0" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return <line key={i} x1={x + Math.sin(a) * (r - 6)} y1={y - Math.cos(a) * (r - 6)} x2={x + Math.sin(a) * (r - 13)} y2={y - Math.cos(a) * (r - 13)} stroke="#3a2112" strokeWidth="3" />
      })}
      <line x1={x} y1={y} x2={x} y2={y - r * 0.5} stroke="#3a2112" strokeWidth="4" strokeLinecap="round" transform={`rotate(-50 ${x} ${y})`} />
      <line x1={x} y1={y} x2={x} y2={y - r * 0.75} stroke="#3a2112" strokeWidth="3" strokeLinecap="round" transform={`rotate(110 ${x} ${y})`} />
      <circle cx={x} cy={y} r="4" fill="#7a2231" />
    </g>
  )
}

export function Cup({ x, y, steam = true, chipped = false }: { x: number; y: number; steam?: boolean; chipped?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {steam && (
        <g className="steam" opacity="0.55" stroke="#fff6df" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M-6 -22 Q-14 -34 -6 -46 T-6 -66" />
          <path d="M8 -20 Q0 -32 8 -44 T8 -62" style={{ animationDelay: '1.2s' }} />
        </g>
      )}
      <path d="M-20 -16 H20 Q20 8 0 8 Q-20 8 -20 -16Z" fill="#f4ead0" />
      <ellipse cx="0" cy="-16" rx="20" ry="5" fill="#b9732f" />
      <path d="M20 -12 Q34 -10 28 2 Q24 6 18 4" fill="none" stroke="#f4ead0" strokeWidth="4" />
      {chipped && <path d="M-12 -21 l4 5 l4 -5Z" fill="#b9732f" />}
      <ellipse cx="0" cy="12" rx="26" ry="5" fill="#f4ead0" opacity="0.8" />
    </g>
  )
}

/* ---------- doors & arches (visual) ---------- */
export function Archway({ x, y, w, h, glow = '#f3b95f', curtain = false }: { x: number; y: number; w: number; h: number; glow?: string; curtain?: boolean }) {
  const d = `M${x} ${y + h} V${y + w * 0.42} Q${x} ${y} ${x + w / 2} ${y} Q${x + w} ${y} ${x + w} ${y + w * 0.42} V${y + h} Z`
  return (
    <g>
      <path d={d} fill="#1f1009" />
      <path d={d} fill={glow} opacity="0.2" />
      <path d={d} fill="none" stroke="url(#g-wood)" strokeWidth="16" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#c79a3a" strokeWidth="2" opacity="0.6" transform={`translate(0 0)`} />
      {curtain && (
        <g opacity="0.95">
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={x + 10 + i * ((w - 20) / 7)} y={y + w * 0.3} width={(w - 20) / 7 - 2} height={h - w * 0.3} fill={i % 2 ? '#8a2a3b' : '#6a1c2b'} />
          ))}
        </g>
      )}
    </g>
  )
}

export function Door({ x, y, w, h, glass = false, time = 'golden' as TimeOfDay }: { x: number; y: number; w: number; h: number; glass?: boolean; time?: TimeOfDay }) {
  const [top, bot] = SKY[time]
  return (
    <g>
      <rect x={x - 12} y={y - 12} width={w + 24} height={h + 12} rx="6" fill="url(#g-wood)" />
      <rect x={x} y={y} width={w} height={h} fill={glass ? bot : '#6b4024'} />
      {glass ? (
        <>
          <rect x={x} y={y} width={w} height={h} fill={`url(#sky-door-${time})`} opacity="0.95" />
          <defs>
            <linearGradient id={`sky-door-${time}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient>
          </defs>
          <rect x={x} y={y} width={w} height={h} fill="url(#p-jaali)" opacity="0.35" />
          <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#4a2a17" strokeWidth="10" />
          {[0.33, 0.66].map((f) => <line key={f} x1={x} y1={y + h * f} x2={x + w} y2={y + h * f} stroke="#4a2a17" strokeWidth="6" />)}
        </>
      ) : (
        <>
          <rect x={x + 14} y={y + 16} width={w - 28} height={h * 0.4} rx="6" fill="none" stroke="#2e180c" strokeWidth="4" opacity="0.7" />
          <rect x={x + 14} y={y + h * 0.5} width={w - 28} height={h * 0.42} rx="6" fill="none" stroke="#2e180c" strokeWidth="4" opacity="0.7" />
          <circle cx={x + w - 22} cy={y + h * 0.5} r="7" fill="#c79a3a" />
        </>
      )}
    </g>
  )
}

/** Soft floor shadow & rug */
export function Rug({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + h / 2 + 12} rx={w / 2 + 24} ry={h / 2 + 18} fill="url(#g-shadow)" />
      <path d={`M${x + 40} ${y} H${x + w - 40} L${x + w} ${y + h} H${x} Z`} fill="url(#p-rug)" />
      <path d={`M${x + 40} ${y} H${x + w - 40} L${x + w} ${y + h} H${x} Z`} fill="none" stroke="#d9a441" strokeWidth="5" />
      <path d={`M${x + 56} ${y + 12} H${x + w - 56} L${x + w - 20} ${y + h - 12} H${x + 20} Z`} fill="none" stroke="#d9a441" strokeWidth="2" opacity="0.7" />
    </g>
  )
}

/** Warm light falling from a window across the floor — a plain gradient (no blur filter or blend mode, for smooth animation). */
export function LightPool({ x, y, w, h, time }: { x: number; y: number; w: number; h: number; time: TimeOfDay }) {
  const color = time === 'night' ? '#7a90c8' : time === 'evening' ? '#f19a52' : time === 'morning' ? '#fff0c0' : '#ffd081'
  const op = time === 'night' ? 0.14 : 0.3
  const id = `lp-${x}-${y}-${time}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={op} />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${x} ${y} L${x + w} ${y} L${x + w + 260} ${y + h} L${x - 120} ${y + h} Z`} fill={`url(#${id})`} />
    </g>
  )
}
