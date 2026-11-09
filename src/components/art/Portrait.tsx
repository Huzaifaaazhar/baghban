import { useId, type CSSProperties } from 'react'
import type { Mood, PortraitSpec } from '../../types'

/** Brow/mouth presets per mood. inner/outer shift brow ends vertically (negative = raised). */
const MOODS: Record<Mood, { inner: number; outer: number; mouth: string; lid: number; cheeks?: boolean; bags?: boolean; glossy?: boolean }> = {
  neutral: { inner: 0, outer: 0, mouth: 'M124 240 Q150 245 176 240', lid: 0 },
  warm: { inner: -1, outer: -2, mouth: 'M120 234 Q150 262 180 234', lid: 0.18, cheeks: true },
  worried: { inner: -8, outer: 2, mouth: 'M126 246 Q150 237 174 246', lid: 0.05 },
  stern: { inner: 6, outer: -2, mouth: 'M124 242 H176', lid: 0.2 },
  hurt: { inner: -9, outer: 3, mouth: 'M128 247 Q150 234 172 247', lid: 0.15, glossy: true },
  hopeful: { inner: -5, outer: -4, mouth: 'M126 238 Q150 252 174 238', lid: 0, cheeks: true },
  tired: { inner: -2, outer: 3, mouth: 'M126 244 Q150 247 174 244', lid: 0.42, bags: true },
}

export function Portrait({
  spec, mood = 'neutral', className, title, blink = true, style,
}: { spec: PortraitSpec; mood?: Mood; className?: string; title?: string; blink?: boolean; style?: CSSProperties }) {
  const uid = useId().replace(/:/g, '')
  const m = MOODS[mood]
  const { skin, hair, hairStyle, clothing, clothColor, clothAccent, age, woman } = spec
  const faceRx = woman ? 55 : age === 'young' ? 57 : 60
  const skinShade = shade(skin, -26)
  const skinLight = shade(skin, 18)
  const browColor = spec.grey ? '#8f8a80' : shade(hair, 6)
  const lidH = 8 * (1 - m.lid)
  // Head silhouette: full at the cheeks, tapering to a defined chin.
  const k = faceRx / 60
  const X = (dx: number) => (150 + dx * k).toFixed(1)
  const headPath = `M150 99 C${X(55)} 99 ${X(62)} 150 ${X(56)} 190 C${X(50)} 232 ${X(26)} 258 150 258 C${X(-26)} 258 ${X(-50)} 232 ${X(-56)} 190 C${X(-62)} 150 ${X(-55)} 99 150 99Z`

  const browL = `M100 ${151 + m.outer} Q118 ${141 + (m.inner + m.outer) / 2} 138 ${150 + m.inner}`
  const browR = `M162 ${150 + m.inner} Q182 ${141 + (m.inner + m.outer) / 2} 200 ${151 + m.outer}`

  return (
    <svg viewBox="0 0 300 420" className={className} style={style} role="img" aria-label={title} preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id={`${uid}-skin`} cx="0.38" cy="0.35" r="0.85">
          <stop offset="0" stopColor={skinLight} />
          <stop offset="0.55" stopColor={skin} />
          <stop offset="1" stopColor={skinShade} />
        </radialGradient>
        <linearGradient id={`${uid}-cloth`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(clothColor, 22)} />
          <stop offset="0.6" stopColor={clothColor} />
          <stop offset="1" stopColor={shade(clothColor, -30)} />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc56e" stopOpacity="0.55" />
          <stop offset="0.28" stopColor="#ffc56e" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-head`}><path d={headPath} /></clipPath>
      </defs>

      {/* back hair */}
      {hairStyle === 'long' && <path d="M80 175 Q66 78 150 74 Q234 78 220 175 L232 372 Q150 336 68 372Z" fill={hair} />}
      {hairStyle === 'bob' && <path d="M80 175 Q70 82 150 78 Q230 82 220 175 L216 268 Q150 282 84 268Z" fill={hair} />}
      {hairStyle === 'bun' && <circle cx="150" cy="82" r="34" fill={hair} />}
      {hairStyle === 'pulled-back' && <ellipse cx="214" cy="262" rx="18" ry="46" fill={hair} transform="rotate(-18 214 262)" />}

      {/* body / clothing */}
      <Torso uid={uid} clothing={clothing} accent={clothAccent} dupatta={spec.dupatta} woman={woman} />

      {/* neck */}
      <path d="M130 250 L128 318 Q150 338 172 318 L170 250Z" fill={skinShade} />
      <path d="M128 290 Q150 312 172 290 L172 318 Q150 338 128 318Z" fill="#000" opacity="0.16" />

      {/* ears */}
      <ellipse cx={150 - faceRx - 1} cy="182" rx="9" ry="16" fill={skin} />
      <ellipse cx={150 + faceRx + 1} cy="182" rx="9" ry="16" fill={skin} />
      <ellipse cx={150 - faceRx - 1} cy="184" rx="4" ry="9" fill={skinShade} opacity="0.6" />
      <ellipse cx={150 + faceRx + 1} cy="184" rx="4" ry="9" fill={skinShade} opacity="0.6" />

      {/* head */}
      <path d={headPath} fill={`url(#${uid}-skin)`} />
      <g clipPath={`url(#${uid}-head)`}>
        <rect x="80" y="90" width="140" height="180" fill={`url(#${uid}-rim)`} />
        {m.cheeks && (
          <>
            <ellipse cx="116" cy="210" rx="14" ry="9" fill="#b5503a" opacity="0.18" />
            <ellipse cx="184" cy="210" rx="14" ry="9" fill="#b5503a" opacity="0.18" />
          </>
        )}
      </g>

      {/* age lines */}
      {age === 'old' && (
        <g stroke={skinShade} strokeWidth="1.6" fill="none" opacity="0.5" strokeLinecap="round">
          <path d="M112 128 Q150 120 188 128" />
          <path d="M116 138 Q150 132 184 138" />
          <path d="M110 196 Q104 214 114 232" />
          <path d="M190 196 Q196 214 186 232" />
          <path d="M102 168 l-8 -4 M102 174 l-9 0 M198 168 l8 -4 M198 174 l9 0" />
        </g>
      )}
      {(m.bags || age !== 'young') && (
        <g fill="none" stroke={skinShade} strokeWidth="2" opacity={m.bags ? 0.55 : 0.28} strokeLinecap="round">
          <path d="M108 184 Q122 192 136 184" />
          <path d="M164 184 Q178 192 192 184" />
        </g>
      )}

      {/* eyes */}
      <g className={blink ? 'blink' : undefined} style={{ transformOrigin: '150px 168px' }}>
        {[122, 178].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="168" rx="15" ry={lidH + 0.5} fill="#f7efe0" />
            <circle cx={cx + (cx < 150 ? 1.5 : -1.5)} cy="168" r={Math.min(6.4, lidH)} fill="#2a170d" />
            <circle cx={cx + (cx < 150 ? 3 : -0)} cy="166" r="1.8" fill="#fff" opacity="0.9" />
            {m.glossy && <ellipse cx={cx} cy="173" rx="12" ry="2.5" fill="#fff" opacity="0.5" />}
            <path d={`M${cx - 16} 168 Q${cx} ${158 + lidH * 0.4 - (1 - lidH / 8) * -6} ${cx + 16} 168`} stroke={shade(skin, -60)} strokeWidth="2.2" fill="none" />
          </g>
        ))}
      </g>

      {/* brows */}
      <g stroke={browColor} strokeWidth={age === 'old' ? 6 : 5.5} strokeLinecap="round" fill="none">
        <path d={browL} />
        <path d={browR} />
      </g>

      {/* nose */}
      <path d="M150 170 Q144 204 136 210 Q150 218 164 210 Q156 204 150 170Z" fill={skinShade} opacity="0.35" />
      <path d="M138 208 Q150 214 162 208" stroke={shade(skin, -60)} strokeWidth="2" fill="none" opacity="0.5" />

      {/* beard / moustache */}
      {spec.beard && <path d="M95 192 Q98 266 150 280 Q202 266 205 192 Q196 238 150 244 Q104 238 95 192Z" fill={hair} opacity="0.55" />}
      {spec.moustache && <path d="M118 228 Q134 217 150 224 Q166 217 182 228 Q166 238 150 232 Q134 238 118 228Z" fill={spec.grey ? '#cfcac0' : hair} />}

      {/* mouth */}
      <path d={m.mouth} stroke="#6a2a22" strokeWidth="4" strokeLinecap="round" fill="none" />
      {(mood === 'warm' || mood === 'hopeful') && !spec.moustache && (
        <path d="M128 240 Q150 256 172 240" fill="#f7efe0" opacity="0.5" />
      )}

      {/* hair front */}
      <FrontHair style={hairStyle} hair={hair} grey={spec.grey} skin={skin} />

      {/* marks */}
      {spec.bindi && <circle cx="150" cy="134" r="4.4" fill="#a31c2b" />}
      {spec.sindoor && <path d="M150 96 V124" stroke="#b01e2c" strokeWidth="3" strokeLinecap="round" />}
      {spec.woman && <circle cx={150 - faceRx - 1} cy="200" r="3" fill="#d9a441" />}
      {spec.woman && <circle cx={150 + faceRx + 1} cy="200" r="3" fill="#d9a441" />}

      {/* glasses */}
      {spec.glasses && (
        <g stroke="#2a170d" strokeWidth="3.2" fill="#fff" fillOpacity="0.07">
          <rect x="99" y="152" width="46" height="34" rx="12" />
          <rect x="155" y="152" width="46" height="34" rx="12" />
          <path d="M145 166 Q150 162 155 166" fill="none" />
          <path d="M99 162 L88 158 M201 162 L212 158" fill="none" />
        </g>
      )}
    </svg>
  )
}

function FrontHair({ style, hair, grey, skin }: { style: PortraitSpec['hairStyle']; hair: string; grey?: boolean; skin: string }) {
  const hi = shade(hair, 26)
  switch (style) {
    case 'bald-grey':
      return (
        <g>
          <path d="M92 182 Q82 128 106 108 Q98 150 104 186Z" fill={hair} />
          <path d="M208 182 Q218 128 194 108 Q202 150 196 186Z" fill={hair} />
          <path d="M104 116 Q150 92 196 116" stroke={hair} strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
          <ellipse cx="132" cy="104" rx="22" ry="6" fill={shade(skin, 40)} opacity="0.35" />
        </g>
      )
    case 'bun':
      return (
        <g>
          <path d="M88 168 Q80 90 150 86 Q220 90 212 168 Q204 126 150 118 Q96 126 88 168Z" fill={hair} />
          <path d="M100 130 Q150 100 200 130" stroke={hi} strokeWidth="3" fill="none" opacity="0.6" />
          {grey && <path d="M112 128 Q130 110 150 104 M150 104 Q178 112 192 128" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.4" />}
        </g>
      )
    case 'long':
    case 'bob':
      return (
        <g>
          <path d="M84 176 Q78 86 150 82 Q222 86 216 176 Q206 122 160 112 Q146 130 118 134 Q92 140 84 176Z" fill={hair} />
          <path d="M104 126 Q150 98 196 126" stroke={hi} strokeWidth="3" fill="none" opacity="0.5" />
        </g>
      )
    case 'pulled-back':
      return (
        <g>
          <path d="M90 156 Q92 96 150 94 Q208 96 210 156 Q198 126 150 122 Q102 126 90 156Z" fill={hair} />
          <path d="M104 124 Q150 104 196 124" stroke={hi} strokeWidth="3" fill="none" opacity="0.5" />
        </g>
      )
    case 'crop':
      return (
        <g>
          <path d="M92 154 Q90 92 150 90 Q210 92 208 154 Q202 124 150 120 Q98 124 92 154Z" fill={hair} />
          <path d="M106 118 Q150 100 194 118" stroke={hi} strokeWidth="3" fill="none" opacity="0.5" />
        </g>
      )
    case 'side-part':
      return (
        <g>
          <path d="M88 162 Q82 84 150 82 Q220 84 212 160 Q206 118 168 112 Q130 108 108 124 Q94 134 88 162Z" fill={hair} />
          <path d="M120 106 Q166 88 206 128" stroke={hi} strokeWidth="3" fill="none" opacity="0.55" />
        </g>
      )
    case 'short':
    default:
      return (
        <g>
          <path d="M88 160 Q82 84 150 82 Q218 84 212 160 Q204 118 150 112 Q96 118 88 160Z" fill={hair} />
          <path d="M106 112 Q150 94 194 112" stroke={hi} strokeWidth="3" fill="none" opacity="0.55" />
        </g>
      )
  }
}

function Torso({ uid, clothing, accent, dupatta, woman }: { uid: string; clothing: PortraitSpec['clothing']; accent: string; dupatta?: string; woman?: boolean }) {
  const base = `url(#${uid}-cloth)`
  const shoulders = woman
    ? 'M20 420 Q26 338 100 312 L200 312 Q274 338 280 420Z'
    : 'M4 420 Q10 336 94 312 L206 312 Q290 336 296 420Z'
  return (
    <g>
      <path d={shoulders} fill={base} />
      {clothing === 'kurta' && (
        <g>
          <path d="M120 306 Q150 326 180 306 L182 296 Q150 316 118 296Z" fill={accent} />
          <path d="M150 318 V420" stroke={accent} strokeWidth="3" />
          {[336, 362, 388].map((y) => <circle key={y} cx="150" cy={y} r="3.5" fill={accent} />)}
        </g>
      )}
      {clothing === 'shirt' && (
        <g>
          <path d="M118 304 L150 346 L122 352Z" fill="#f3ead4" />
          <path d="M182 304 L150 346 L178 352Z" fill="#f3ead4" />
          <path d="M150 346 V420" stroke="#00000033" strokeWidth="2" />
        </g>
      )}
      {clothing === 'shirt-tie' && (
        <g>
          <path d="M118 304 L150 340 L120 350Z" fill="#f6efdc" />
          <path d="M182 304 L150 340 L180 350Z" fill="#f6efdc" />
          <path d="M143 338 L157 338 L152 352 L162 420 L150 434 L138 420 L148 352Z" fill={accent} />
        </g>
      )}
      {clothing === 'suit' && (
        <g>
          <path d="M112 306 L150 380 L96 420 L70 420Z" fill="#00000033" />
          <path d="M188 306 L150 380 L204 420 L230 420Z" fill="#00000033" />
          <path d="M132 308 L150 350 L168 308Z" fill="#f6efdc" />
        </g>
      )}
      {clothing === 'sweater' && (
        <g>
          <ellipse cx="150" cy="312" rx="38" ry="14" fill="none" stroke={accent} strokeWidth="6" />
          {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${60 + i * 36} 340 V420`} stroke="#00000022" strokeWidth="3" />)}
        </g>
      )}
      {clothing === 'salwar' && (
        <g>
          <path d="M112 308 Q150 340 188 308" fill="none" stroke={accent} strokeWidth="7" />
          {dupatta && <path d="M60 340 Q150 380 260 330 L280 420 H200 Q150 380 80 420 L40 420Z" fill={dupatta} opacity="0.92" />}
          {dupatta && <path d="M60 346 Q150 386 262 336" fill="none" stroke={accent} strokeWidth="4" />}
        </g>
      )}
      {clothing === 'saree' && (
        <g>
          {/* blouse neckline */}
          <path d="M118 308 Q150 336 182 308" fill="none" stroke={accent} strokeWidth="5" />
          {/* pallu draping over the left shoulder, across the chest */}
          <path d="M34 336 Q96 300 150 326 Q210 356 296 420 H196 Q140 376 84 392 L40 420 H14Z" fill={dupatta ?? '#8a2d3c'} />
          <path d="M34 336 Q96 300 150 326 Q210 356 296 420" fill="none" stroke={accent} strokeWidth="7" />
          <path d="M40 354 Q100 322 150 346 Q206 372 280 420" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" />
          <path d="M14 420 H40 L84 392 Q140 376 196 420" fill="none" stroke={accent} strokeWidth="5" />
        </g>
      )}
    </g>
  )
}

/** Lighten (+) or darken (−) a hex colour. */
function shade(hex: string, amt: number): string {
  const n = hex.replace('#', '')
  const f = (i: number) => Math.max(0, Math.min(255, parseInt(n.slice(i, i + 2), 16) + amt))
  const h = (v: number) => v.toString(16).padStart(2, '0')
  return `#${h(f(0))}${h(f(2))}${h(f(4))}`
}
