import type { ReactNode } from 'react'
import type { LocationId, TimeOfDay } from '../../types'
import {
  Archway, C, Cup, Diya, Door, Lamp, LightPool, Photo, Plant, Rug, RoomShell, SvgDefs, Window, WallClock, Curtains, SKY, isDark,
} from './parts'

/* ---------------------------------------------------------------- */
/* helpers                                                          */
/* ---------------------------------------------------------------- */

function Chair({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <rect x="-30" y="-130" width="10" height="130" fill="#4a2a17" />
      <rect x="20" y="-130" width="10" height="130" fill="#4a2a17" />
      <rect x="-30" y="-130" width="60" height="70" rx="8" fill="#6b4024" />
      <rect x="-22" y="-120" width="44" height="50" rx="6" fill="#8a5a30" />
      <rect x="-36" y="-34" width="72" height="14" rx="4" fill="#7d7a45" />
      <rect x="-32" y="-20" width="8" height="56" fill="#4a2a17" />
      <rect x="24" y="-20" width="8" height="56" fill="#4a2a17" />
    </g>
  )
}

function Shadow({ x, y, w }: { x: number; y: number; w: number }) {
  return <ellipse cx={x} cy={y} rx={w / 2} ry={w / 12} fill="url(#g-shadow)" />
}

function Steel({ x, y, w, h, lid = true }: { x: number; y: number; w: number; h: number; lid?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill="url(#g-steel)" />
      {lid && <rect x={x - 3} y={y - 7} width={w + 6} height="10" rx="4" fill="url(#g-steel)" />}
      {lid && <circle cx={x + w / 2} cy={y - 12} r="5" fill="#d8d3c2" />}
      <rect x={x + 6} y={y + 8} width="5" height={h - 16} rx="2" fill="#fff" opacity="0.35" />
    </g>
  )
}

const Frame = ({ time, children }: { time: TimeOfDay; children: ReactNode }) => (
  <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden role="img" data-time={time}>
    <SvgDefs />
    {children}
  </svg>
)

/* ---------------------------------------------------------------- */
/* Living room                                                      */
/* ---------------------------------------------------------------- */
export function LivingRoom({ time }: { time: TimeOfDay }) {
  return (
    <Frame time={time}>
      <RoomShell time={time} floorY={640} dadoY={470}>
        {/* balcony glass door (left) */}
        <Door x={80} y={190} w={220} h={438} glass time={time} />
        <Curtains x={80} y={190} w={220} h={440} />
        <LightPool x={90} y={200} w={200} h={440} time={time} />
        {/* courtyard door */}
        <Door x={400} y={250} w={110} h={378} />
        <WallClock x={455} y={170} r={34} />
        {/* photograph wall */}
        <Photo x={610} y={170} w={130} h={100} variant={0} rotate={-2} />
        <Photo x={760} y={150} w={120} h={150} variant={1} />
        <Photo x={900} y={180} w={110} h={100} variant={2} rotate={2} />
        <Photo x={660} y={298} w={84} h={74} variant={1} rotate={1} />
        <Photo x={840} y={318} w={80} h={70} variant={0} rotate={-1} />
        {/* calendar */}
        <g transform="translate(1062 168)">
          <rect width="84" height="132" fill="#f3e5c0" stroke="#6b4024" strokeWidth="3" />
          <rect x="6" y="6" width="72" height="56" fill="#b8683f" />
          <circle cx="42" cy="34" r="16" fill="#e8c36f" />
          <text x="42" y="104" textAnchor="middle" fontSize="40" fontFamily="Cormorant Garamond, serif" fontWeight="700" fill="#7a2231">9</text>
          <rect x="30" y="-8" width="24" height="12" rx="4" fill="#c79a3a" />
        </g>
        {/* dining arch */}
        <Archway x={1190} y={220} w={200} h={408} curtain={false} />
        <rect x={1198} y={300} width={184} height={328} fill="#2b170c" opacity="0.7" />
        <g opacity="0.75"><rect x={1230} y={470} width={120} height={14} fill="#4a2a17" /><rect x={1240} y={484} width={8} height={70} fill="#4a2a17" /><rect x={1332} y={484} width={8} height={70} fill="#4a2a17" /></g>
        <circle cx={1290} cy={440} r={90} fill="url(#g-lamp)" opacity="0.6" />
        {/* bedroom door */}
        <Door x={1450} y={270} w={110} h={358} />
        {/* ceiling fan */}
        <g>
          <rect x="797" y="32" width="6" height="40" fill="#3a2112" />
          <ellipse cx="800" cy="82" rx="28" ry="12" fill="#5a3520" />
          <g className="fan-blades">
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx="800" cy="92" rx="190" ry="9" fill="#6b4024" style={{ animationDelay: `${-i * 0.55}s`, transformOrigin: '800px 92px' }} className="fan-blade" />
            ))}
          </g>
          <ellipse cx="800" cy="92" rx="26" ry="9" fill="#c79a3a" />
        </g>
        {/* rug */}
        <Rug x={500} y={690} w={620} h={160} />
        {/* sofa */}
        <g>
          <rect x={540} y={428} width={540} height={150} rx="34" fill="url(#g-sofa)" />
          <rect x={500} y={490} width={70} height={150} rx="22" fill="#6b6836" />
          <rect x={1050} y={490} width={70} height={150} rx="22" fill="#6b6836" />
          <rect x={560} y={530} width={500} height={92} rx="16" fill="#807d49" />
          <rect x={518} y={622} width={12} height={34} fill="#3a2112" />
          <rect x={1090} y={622} width={12} height={34} fill="#3a2112" />
          <rect x={570} y={466} width={110} height={90} rx="14" fill="#7a2231" />
          <path d="M575 500 h100 M575 520 h100" stroke="#d9a441" strokeWidth="3" />
          <rect x={940} y={466} width={110} height={90} rx="14" fill="#c79a3a" />
          <path d="M945 500 h100 M945 520 h100" stroke="#7a2231" strokeWidth="3" />
        </g>
        {/* coffee table */}
        <Shadow x={800} y={760} w={420} />
        <g>
          <rect x={650} y={700} width={300} height={22} rx="6" fill="url(#g-wood-v)" />
          <rect x={662} y={722} width={14} height={50} fill="#3a2112" />
          <rect x={924} y={722} width={14} height={50} fill="#3a2112" />
          <Cup x={716} y={700} chipped />
          <Cup x={796} y={702} />
          <Cup x={876} y={700} />
          <ellipse cx={796} cy={704} rx={70} ry={6} fill="#3a2112" opacity="0.18" />
        </g>
        {/* side table + lamp */}
        <rect x={1112} y={575} width={70} height={14} rx="3" fill="#5a3520" />
        <rect x={1120} y={589} width={8} height={56} fill="#3a2112" />
        <rect x={1166} y={589} width={8} height={56} fill="#3a2112" />
        <Lamp x={1147} y={570} size={0.8} />
        {/* floor plant */}
        <Plant x={560} y={640} scale={1.2} />
      </RoomShell>
    </Frame>
  )
}

/* ---------------------------------------------------------------- */
/* Dining room                                                      */
/* ---------------------------------------------------------------- */
export function DiningRoom({ time }: { time: TimeOfDay }) {
  return (
    <Frame time={time}>
      <RoomShell time={time} floorY={640} dadoY={480}>
        {/* crockery cabinet */}
        <g>
          <rect x={60} y={150} width={280} height={490} rx="6" fill="url(#g-wood-v)" />
          <rect x={80} y={172} width={240} height={250} fill="#2b170c" />
          <rect x={80} y={172} width={240} height={250} fill="#ffe3a1" opacity="0.15" />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={80} y={172 + (r + 1) * 82 - 6} width={240} height={6} fill="#7c4b27" />
              {[0, 1, 2, 3, 4, 5].map((c) => (
                <ellipse key={c} cx={104 + c * 38} cy={172 + (r + 1) * 82 - 14} rx={16} ry={6} fill={c % 2 ? '#f4ead0' : '#c79a3a'} stroke="#8a6a3a" />
              ))}
            </g>
          ))}
          <line x1={200} y1={172} x2={200} y2={422} stroke="#5a3520" strokeWidth="6" />
          <rect x={80} y={440} width={240} height={180} fill="none" stroke="#3a2112" strokeWidth="4" opacity="0.7" />
          <circle cx={196} cy={530} r={6} fill="#c79a3a" />
        </g>
        {/* kitchen door */}
        <Door x={400} y={260} w={120} h={368} />
        <Archway x={400} y={260} w={120} h={368} curtain />
        {/* window */}
        <Window x={700} y={170} w={280} h={250} time={time} arch />
        <LightPool x={720} y={180} w={240} h={440} time={time} />
        {/* school photographs */}
        <Photo x={1040} y={170} w={110} h={90} variant={0} rotate={-1} />
        <Photo x={1170} y={160} w={110} h={100} variant={2} />
        <Photo x={1100} y={285} w={110} h={95} variant={1} rotate={1} />
        {/* living room arch */}
        <Archway x={1380} y={250} w={190} h={378} />
        <rect x={1388} y={330} width={174} height={298} fill="#2b170c" opacity="0.65" />
        <circle cx={1470} cy={470} r={90} fill="url(#g-lamp)" opacity="0.5" />
        {/* table */}
        <Shadow x={800} y={770} w={800} />
        <g>
          <rect x={410} y={520} width={780} height={30} rx="8" fill="url(#g-wood-v)" />
          <rect x={430} y={550} width={740} height={12} fill="#3a2112" opacity="0.6" />
          <rect x={440} y={560} width={26} height={150} fill="#4a2a17" />
          <rect x={1134} y={560} width={26} height={150} fill="#4a2a17" />
        </g>
        {/* table runner + dishes */}
        <rect x={470} y={514} width={660} height={8} fill="#7a2231" />
        <g>
          <ellipse cx={650} cy={512} rx={46} ry={8} fill="#f4ead0" /><ellipse cx={650} cy={510} rx={32} ry={5} fill="#c9a558" />
          <ellipse cx={800} cy={512} rx={50} ry={8} fill="#f4ead0" /><ellipse cx={800} cy={508} rx={34} ry={5} fill="#a65a3a" />
          <ellipse cx={950} cy={512} rx={46} ry={8} fill="#f4ead0" /><ellipse cx={950} cy={510} rx={32} ry={5} fill="#6b7a3a" />
          <Steel x={760} y={470} w={60} h={34} />
        </g>
        {/* chairs */}
        <Chair x={500} y={700} s={1.1} />
        <Chair x={1100} y={700} s={1.1} flip />
        {/* hanging lamp */}
        <line x1={800} y1={32} x2={800} y2={120} stroke="#3a2112" strokeWidth="4" />
        <circle cx={800} cy={170} r={150} fill="url(#g-lamp)" opacity={isDark(time) ? 0.9 : 0.5} className="flicker-slow" />
        <path d="M740 140 Q800 90 860 140 Z" fill="#c79a3a" />
        <ellipse cx={800} cy={144} rx={60} ry={9} fill="#ffd98a" />
      </RoomShell>
    </Frame>
  )
}

/* ---------------------------------------------------------------- */
/* Kitchen                                                          */
/* ---------------------------------------------------------------- */
export function Kitchen({ time }: { time: TimeOfDay }) {
  return (
    <Frame time={time}>
      <RoomShell time={time} floorY={650} dadoY={520} floor="tile">
        {/* tiled splash wall */}
        <rect x={0} y={300} width={1600} height={350} fill="url(#p-kitchen-tile)" />
        <rect x={0} y={296} width={1600} height={10} fill="#6b4024" />
        {/* dining door */}
        <Door x={70} y={250} w={170} h={380} />
        <Archway x={70} y={250} w={170} h={380} curtain />
        {/* shelf with containers */}
        <rect x={310} y={246} width={420} height={14} rx="3" fill="url(#g-wood-v)" />
        <Steel x={330} y={190} w={56} h={52} />
        <Steel x={400} y={176} w={64} h={66} />
        <Steel x={480} y={196} w={52} h={46} />
        <g><rect x={548} y={196} width={64} height={46} rx="4" fill="#a65a3a" /><rect x={556} y={204} width={48} height={8} fill="#e3c27a" /><text x="580" y="236" fontSize="12" textAnchor="middle" fill="#f3e5c0" fontFamily="serif">BISCUIT</text></g>
        <rect x={630} y={218} width={30} height={24} fill="#f3e5c0" stroke="#7a2231" strokeWidth="2" />
        <rect x={634} y={224} width={22} height={4} fill="#7a2231" />
        <rect x={310} y={348} width={420} height={14} rx="3" fill="url(#g-wood-v)" />
        {[0, 1, 2, 3, 4].map((i) => <Steel key={i} x={330 + i * 78} y={296} w={58} h={44} lid={false} />)}
        {/* window over stove */}
        <Window x={780} y={170} w={250} h={230} time={time} arch={false} curtains={false} />
        <LightPool x={800} y={180} w={210} h={440} time={time} />
        {/* calendar */}
        <g transform="translate(1088 176)">
          <rect width="86" height="144" fill="#f3e5c0" stroke="#6b4024" strokeWidth="3" />
          <rect x="6" y="6" width="74" height="30" fill="#7a2231" />
          {Array.from({ length: 20 }).map((_, i) => (
            <circle key={i} cx={14 + (i % 5) * 15} cy={52 + Math.floor(i / 5) * 20} r="2.8" fill={i > 7 ? '#7a2231' : '#6b4024'} />
          ))}
        </g>
        {/* fridge */}
        <g>
          <rect x={1210} y={230} width={170} height={410} rx="10" fill="#d8d0b6" />
          <rect x={1210} y={230} width={170} height={410} rx="10" fill="url(#g-steel)" opacity="0.25" />
          <line x1={1212} y1={400} x2={1378} y2={400} stroke="#8a8573" strokeWidth="4" />
          <rect x={1356} y={280} width={8} height={90} rx="3" fill="#8a8573" />
          <rect x={1356} y={420} width={8} height={120} rx="3" fill="#8a8573" />
          <rect x={1240} y={270} width={34} height={26} fill="#7a2231" /><rect x={1290} y={290} width={30} height={30} fill="#c79a3a" /><rect x={1252} y={320} width={40} height={24} fill="#6b6b3a" />
        </g>
        {/* courtyard door */}
        <Door x={1430} y={260} w={130} h={370} glass time={time} />
        {/* counter with sink (left) */}
        <g>
          <rect x={300} y={470} width={440} height={30} rx="6" fill="#7c4b27" />
          <rect x={312} y={500} width={416} height={150} fill="#5a3520" />
          <rect x={330} y={514} width={180} height={124} rx="6" fill="none" stroke="#3a2112" strokeWidth="4" />
          <rect x={530} y={514} width={180} height={124} rx="6" fill="none" stroke="#3a2112" strokeWidth="4" />
          <rect x={360} y={448} width={140} height={24} rx="8" fill="url(#g-steel)" />
          <path d="M640 470 V430 H610" stroke="#b9b4a6" strokeWidth="8" fill="none" strokeLinecap="round" />
          <Steel x={600} y={430} w={50} h={36} lid={false} />
        </g>
        {/* tap drip */}
        <circle cx={610} cy={444} r="3.5" fill="#cfe3ea" className="drip" />
        {/* stove counter */}
        <g>
          <rect x={780} y={470} width={290} height={30} rx="6" fill="#7c4b27" />
          <rect x={792} y={500} width={266} height={150} fill="#5a3520" />
          <rect x={830} y={448} width={190} height={24} rx="4" fill="#2a1a10" />
          <circle cx={875} cy={456} r={16} fill="#444" /><circle cx={975} cy={456} r={16} fill="#444" />
          <circle cx={875} cy={450} r={9} fill="#f3a94b" opacity="0.8" className="flicker" />
          <path d="M840 440 H910 L900 392 H850 Z" fill="url(#g-steel)" />
          <ellipse cx={875} cy={440} rx={38} ry={6} fill="#6b6b6b" />
          <g className="steam" opacity="0.5" stroke="#fff6df" strokeWidth="4" fill="none" strokeLinecap="round"><path d="M865 420 Q858 396 866 374" /><path d="M885 418 Q878 394 886 370" style={{ animationDelay: '1s' }} /></g>
        </g>
        {/* hanging utensils */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(${810 + i * 52} 410)`} opacity="0">
            <rect width="4" height="2" />
          </g>
        ))}
        <Plant x={1180} y={650} scale={0.7} tulsi />
        <Rug x={540} y={720} w={420} h={120} />
        {/* hanging lamp glow */}
        <circle cx={600} cy={160} r={170} fill="url(#g-lamp)" opacity={isDark(time) ? 0.8 : 0.35} />
      </RoomShell>
    </Frame>
  )
}

/* ---------------------------------------------------------------- */
/* Parents' bedroom                                                 */
/* ---------------------------------------------------------------- */
export function ParentsBedroom({ time }: { time: TimeOfDay }) {
  return (
    <Frame time={time}>
      <RoomShell time={time} floorY={650} dadoY={490}>
        {/* balcony door w/ curtain */}
        <Door x={110} y={190} w={220} h={440} glass time={time} />
        <Curtains x={110} y={190} w={220} h={440} />
        <LightPool x={120} y={200} w={200} h={440} time={time} />
        {/* wedding photograph */}
        <g>
          <rect x={690} y={110} width={220} height={190} fill="#c79a3a" />
          <rect x={700} y={120} width={200} height={170} fill="#3a2112" />
          <rect x={712} y={132} width={176} height={146} fill="#d9c08a" />
          <rect x={712} y={132} width={176} height={146} fill="#7a2231" opacity="0.12" />
          <g fill="#4a3320" opacity="0.85">
            <circle cx={770} cy={185} r={20} /><path d="M735 278 Q770 205 805 278Z" />
            <circle cx={830} cy={190} r={19} /><path d="M795 278 Q830 210 865 278Z" fill="#7a2231" opacity="0.8" />
          </g>
          <path d="M700 120 q100 -30 200 0" stroke="#d9a441" strokeWidth="6" fill="none" />
        </g>
        {/* marigold garland over the photograph */}
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={702 + i * 15} cy={112 + Math.sin(i / 2) * 6} r="8" fill={i % 2 ? '#f0a934' : '#e07a1f'} />
        ))}
        {/* bed */}
        <Shadow x={800} y={745} w={760} />
        <g>
          <path d="M520 400 Q520 330 600 330 H1000 Q1080 330 1080 400 V640 H520 Z" fill="url(#g-wood-v)" />
          <path d="M540 410 Q540 350 610 350 H990 Q1060 350 1060 410 V440 H540 Z" fill="#3a2112" opacity="0.5" />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={600 + i * 100} cy={380} r="14" fill="none" stroke="#c79a3a" strokeWidth="4" />)}
          <rect x={500} y={520} width={600} height={110} rx="12" fill="#8a2a3b" />
          <rect x={500} y={520} width={600} height={30} rx="12" fill="#a63a4c" />
          <path d="M500 575 H1100" stroke="#d9a441" strokeWidth="5" />
          <path d="M500 600 H1100" stroke="#d9a441" strokeWidth="2" opacity="0.7" />
          <rect x={560} y={470} width={200} height={70} rx="26" fill="#f3e5c0" />
          <rect x={840} y={470} width={200} height={70} rx="26" fill="#f3e5c0" />
          <rect x={510} y={630} width={22} height={40} fill="#3a2112" /><rect x={1068} y={630} width={22} height={40} fill="#3a2112" />
        </g>
        {/* bedside tables */}
        <g>
          <rect x={410} y={570} width={90} height={80} fill="#5a3520" /><rect x={410} y={560} width={90} height={12} fill="#7c4b27" />
          <rect x={1100} y={570} width={90} height={80} fill="#5a3520" /><rect x={1100} y={560} width={90} height={12} fill="#7c4b27" />
          <Lamp x={455} y={555} size={0.7} />
          <rect x={1128} y={540} width={34} height={20} fill="#f3e5c0" stroke="#6b4024" strokeWidth="2" />
          <rect x={1136} y={528} width={14} height={14} fill="#a65a3a" />
        </g>
        {/* almirah */}
        <g>
          <rect x={1230} y={150} width={240} height={500} rx="4" fill="#9a968a" />
          <rect x={1230} y={150} width={240} height={500} rx="4" fill="url(#g-steel)" opacity="0.4" />
          <line x1={1350} y1={158} x2={1350} y2={642} stroke="#6b675b" strokeWidth="5" />
          <rect x={1318} y={380} width={10} height={60} rx="4" fill="#4a463a" />
          <rect x={1372} y={380} width={10} height={60} rx="4" fill="#4a463a" />
          <rect x={1246} y={168} width={94} height={200} fill="#d8d3c2" opacity="0.35" />
        </g>
        {/* door to living room */}
        <Door x={1500} y={290} w={85} h={338} />
        {/* rug */}
        <Rug x={560} y={760} w={480} h={100} />
      </RoomShell>
    </Frame>
  )
}

/* ---------------------------------------------------------------- */
/* The boys' room                                                   */
/* ---------------------------------------------------------------- */
function Bed({ x, y, blanket, pillow }: { x: number; y: number; blanket: string; pillow: string }) {
  return (
    <g>
      <rect x={x} y={y - 80} width={300} height={80} rx="8" fill="url(#g-wood-v)" />
      <rect x={x + 6} y={y - 6} width={288} height={110} rx="10" fill="#e9d9ad" />
      <rect x={x + 6} y={y + 26} width={288} height={78} rx="10" fill={blanket} />
      <path d={`M${x + 6} ${y + 50} H${x + 294}`} stroke="#f3e5c0" strokeWidth="4" opacity="0.6" />
      <rect x={x + 14} y={y - 24} width={96} height={42} rx="18" fill={pillow} />
      <rect x={x + 8} y={y + 100} width={14} height={30} fill="#3a2112" /><rect x={x + 278} y={y + 100} width={14} height={30} fill="#3a2112" />
    </g>
  )
}

export function BoysRoom({ time }: { time: TimeOfDay }) {
  return (
    <Frame time={time}>
      <RoomShell time={time} floorY={640} dadoY={500}>
        <Door x={50} y={260} w={110} h={368} />
        {/* posters */}
        <g transform="rotate(-2 280 240)"><rect x={190} y={160} width={140} height={190} fill="#2f4a5a" /><circle cx={260} cy={230} r={34} fill="#e8c36f" /><path d="M190 350 L260 280 L330 350Z" fill="#1e2f3a" /></g>
        <g transform="rotate(2 420 240)"><rect x={350} y={180} width={130} height={160} fill="#a65a3a" /><rect x={365} y={196} width={100} height={30} fill="#f3e5c0" /><rect x={365} y={236} width={70} height={10} fill="#f3e5c0" /><rect x={365} y={256} width={90} height={10} fill="#f3e5c0" /></g>
        <g><rect x={1090} y={150} width={140} height={190} fill="#4c5a3a" /><circle cx={1160} cy={210} r={28} fill="#f3e5c0" /><rect x={1128} y={250} width={64} height={70} fill="#d9a441" /></g>
        <g transform="rotate(-1 1320 240)"><rect x={1250} y={180} width={130} height={150} fill="#7a2231" /><path d="M1262 310 L1315 220 L1368 310Z" fill="#e8c36f" /></g>
        {/* window */}
        <Window x={650} y={140} w={300} h={260} time={time} arch={false} curtains />
        <LightPool x={670} y={150} w={260} h={480} time={time} />
        {/* beds */}
        <Bed x={190} y={520} blanket="#4d5a6a" pillow="#f3e5c0" />
        <Bed x={650} y={520} blanket="#9a6b3f" pillow="#f3e5c0" />
        <Bed x={1110} y={520} blanket="#6f6a3f" pillow="#f3e5c0" />
        {/* trophy shelf above bed 2 */}
        <rect x={680} y={440} width={240} height={12} fill="url(#g-wood-v)" />
        <g fill="#c79a3a">
          <path d="M700 440 v-34 h22 v34Z" /><path d="M740 440 v-44 h22 v44Z" /><path d="M780 440 v-26 h30 v26Z" /><path d="M830 440 v-38 h20 v38Z" fill="#a8a8a0" />
          <path d="M870 440 l12 -34 l12 34Z" fill="#b9732f" />
        </g>
        {/* cricket bat */}
        <g transform="rotate(8 1458 520)">
          <rect x={1442} y={330} width={20} height={80} rx="6" fill="#5a3520" />
          <path d="M1432 410 H1472 L1480 640 H1424 Z" fill="#d6b36e" />
          <path d="M1444 420 V620" stroke="#a8803f" strokeWidth="3" opacity="0.7" />
        </g>
        <Door x={1500} y={310} w={80} h={318} />
        <Rug x={540} y={742} w={520} h={100} />
        {/* desk lamp & books */}
        <g><rect x={90} y={600} width={80} height={14} fill="#5a3520" /><rect x={95} y={560} width={70} height={40} fill="#6b4024" /><rect x={100} y={548} width={14} height={12} fill="#7a2231" /><rect x={118} y={544} width={12} height={16} fill="#6b6b3a" /></g>
      </RoomShell>
    </Frame>
  )
}

/* ---------------------------------------------------------------- */
/* Balcony                                                          */
/* ---------------------------------------------------------------- */
export function Balcony({ time }: { time: TimeOfDay }) {
  const [top, bot] = SKY[time]
  const night = isDark(time)
  return (
    <Frame time={time}>
      <defs>
        <linearGradient id="bal-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bal-sky)" />
      {night && (
        <g fill="#fff0c0">
          {Array.from({ length: 36 }).map((_, i) => (
            <circle key={i} cx={(i * 97) % 1600} cy={20 + ((i * 53) % 330)} r={i % 3 === 0 ? 2.2 : 1.2} opacity={0.5 + (i % 4) * 0.12} className="twinkle" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />
          ))}
          <circle cx={1180} cy={150} r={34} fill="#fff4cf" />
          <circle cx={1192} cy={142} r={32} fill="#14203a" />
        </g>
      )}
      {/* distant skyline */}
      <g fill={night ? '#0a1222' : time === 'evening' ? '#6e4660' : '#b98f62'} opacity="0.95">
        <path d="M0 520 H80 V440 H150 V500 H240 V410 H320 V490 H420 V380 H470 L500 350 L530 380 H560 V480 H700 V430 H780 V500 H900 V420 H960 L990 390 L1020 420 H1080 V510 H1200 V450 H1290 V520 H1400 V400 H1480 V500 H1600 V620 H0Z" />
        <circle cx={500} cy={338} r="8" />
        <circle cx={990} cy={378} r="8" />
      </g>
      <g fill={night ? '#060b17' : '#8a5c3a'} opacity={night ? 1 : 0.75}>
        <path d="M0 560 H110 V480 H200 V540 H330 V500 H420 V560 H600 V470 H690 V540 H830 V490 H940 V560 H1100 V500 H1190 V550 H1340 V470 H1430 V560 H1600 V640 H0Z" />
      </g>
      {/* lit windows at night/evening */}
      {(night || time === 'evening') && (
        <g fill="#ffd98a">
          {[[140, 500], [360, 520], [640, 490], [880, 510], [1130, 520], [1380, 490], [250, 560], [760, 560], [1020, 550]].map(([a, b], i) => (
            <rect key={i} x={a} y={b} width={14} height={20} opacity={0.8} className="twinkle" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </g>
      )}
      {/* wall on the sides */}
      <g>
        <rect x={0} y={0} width={220} height={900} fill="#d3b680" />
        <rect x={1420} y={0} width={180} height={900} fill="#d3b680" />
        <rect x={0} y={0} width={1600} height={80} fill="#6b4024" />
        <rect x={0} y={80} width={1600} height={8} fill="#c79a3a" opacity="0.7" />
        {/* arches overhead */}
        {Array.from({ length: 3 }).map((_, i) => (
          <path key={i} d={`M${230 + i * 400} 90 Q${430 + i * 400} 190 ${630 + i * 400} 90`} fill="none" stroke="#6b4024" strokeWidth="14" opacity="0.85" />
        ))}
      </g>
      {/* doors */}
      <Door x={60} y={230} w={110} h={420} glass time={time} />
      <Door x={1450} y={250} w={110} h={400} />
      {/* tulsi on pedestal */}
      <g>
        <Shadow x={400} y={690} w={200} />
        <rect x={340} y={560} width={120} height={110} fill="#d9c08a" />
        <rect x={330} y={548} width={140} height={16} fill="#b9a06a" />
        <rect x={330} y={668} width={140} height={14} fill="#b9a06a" />
        <path d="M368 580 h64 v50 h-64Z" fill="none" stroke="#a65a3a" strokeWidth="3" />
        <Plant x={400} y={548} scale={0.9} tulsi />
        <Diya x={450} y={540} size={0.7} />
      </g>
      {/* Raj's cane chair */}
      <g transform="translate(1180 690)">
        <rect x={-70} y={-250} width={16} height={260} fill="#4a2a17" />
        <rect x={54} y={-250} width={16} height={260} fill="#4a2a17" />
        <rect x={-72} y={-260} width={146} height={130} rx="14" fill="#6b4024" />
        <rect x={-58} y={-246} width={118} height={102} rx="10" fill="#d6b36e" />
        <path d="M-58 -246 L60 -144 M60 -246 L-58 -144" stroke="#b08a4a" strokeWidth="2" />
        <rect x={-78} y={-76} width={158} height={20} rx="6" fill="#d6b36e" stroke="#6b4024" strokeWidth="6" />
        <rect x={-80} y={-130} width={22} height={80} rx="8" fill="#5a3520" />
        <rect x={58} y={-130} width={22} height={80} rx="8" fill="#5a3520" />
        <rect x={-62} y={-56} width={10} height={70} fill="#3a2112" />
        <rect x={54} y={-56} width={10} height={70} fill="#3a2112" />
        <Cup x={20} y={-80} chipped />
      </g>
      {/* railing */}
      <g>
        <rect x={220} y={640} width={1200} height={18} fill="url(#g-wood)" />
        <rect x={220} y={720} width={1200} height={18} fill="url(#g-wood)" />
        {Array.from({ length: 33 }).map((_, i) => (
          <rect key={i} x={232 + i * 37} y={658} width={10} height={62} rx="4" fill="#3a2112" />
        ))}
        <rect x={0} y={738} width={1600} height={162} fill="#8a5430" />
        <rect x={0} y={738} width={1600} height={12} fill="#3a2112" />
        <rect x={0} y={750} width={1600} height={150} fill="url(#g-floor-tile)" opacity="0.85" />
        <rect x={0} y={750} width={1600} height={150} fill="url(#p-tile)" opacity="0.45" />
      </g>
      {/* hanging lantern */}
      <line x1={820} y1={88} x2={820} y2={150} stroke="#3a2112" strokeWidth="4" />
      <circle cx={820} cy={200} r={150} fill="url(#g-lamp)" opacity={night ? 0.9 : 0.4} className="flicker-slow" />
      <path d="M796 150 h48 l12 60 h-72Z" fill="#c79a3a" />
      <rect x={802} y={160} width={36} height={44} fill="#ffd98a" opacity="0.9" />
    </Frame>
  )
}

/* ---------------------------------------------------------------- */
/* Courtyard (aangan)                                               */
/* ---------------------------------------------------------------- */
export function Courtyard({ time }: { time: TimeOfDay }) {
  const [top, bot] = SKY[time]
  const night = isDark(time)
  return (
    <Frame time={time}>
      <defs>
        <linearGradient id="cy-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#cy-sky)" />
      {night && (
        <g fill="#fff0c0">
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={(i * 83) % 1600} cy={14 + ((i * 47) % 170)} r={i % 3 === 0 ? 2 : 1.2} className="twinkle" style={{ animationDelay: `${(i % 6) * 0.45}s` }} />
          ))}
        </g>
      )}
      {/* surrounding house walls with arcade */}
      <g>
        <rect x={0} y={200} width={1600} height={460} fill="#d6b87c" />
        <rect x={0} y={190} width={1600} height={24} fill="#6b4024" />
        <rect x={0} y={214} width={1600} height={6} fill="#c79a3a" opacity="0.7" />
        {/* eaves tiles */}
        {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={i * 40} y={150} width={38} height={42} fill="#a65a3a" stroke="#7d3f26" strokeWidth="2" />)}
        {/* arcade pillars */}
        {[80, 520, 1060, 1500].map((px) => (
          <g key={px}>
            <rect x={px - 24} y={220} width={48} height={430} fill="#c7a768" />
            <rect x={px - 30} y={620} width={60} height={30} fill="#9a7a44" />
            <rect x={px - 30} y={220} width={60} height={26} fill="#9a7a44" />
          </g>
        ))}
      </g>
      {/* kitchen door (left) */}
      <Door x={150} y={310} w={140} h={340} />
      {/* boys' room door (centre-right) */}
      <Door x={1120} y={310} w={130} h={340} />
      {/* living-room arch (right) */}
      <Archway x={1310} y={270} w={160} h={380} />
      <rect x={1318} y={340} width={144} height={310} fill="#2b170c" opacity="0.6" />
      <circle cx={1390} cy={480} r={90} fill="url(#g-lamp)" opacity="0.5" />
      {/* floor of the courtyard */}
      <rect x={0} y={650} width={1600} height={250} fill="url(#g-floor-tile)" />
      <rect x={0} y={650} width={1600} height={250} fill="url(#p-tile)" opacity="0.65" />
      <rect x={0} y={640} width={1600} height={18} fill="#8a5430" />
      {/* tulsi chaura, centre */}
      <g>
        <Shadow x={780} y={760} w={140} />
        <rect x={730} y={690} width={100} height={70} fill="#d9c08a" /><rect x={720} y={680} width={120} height={14} fill="#b9a06a" />
        <Plant x={780} y={684} scale={0.55} tulsi />
        <Diya x={840} y={678} size={0.5} />
      </g>
      {/* neem tree */}
      <g>
        <Shadow x={500} y={800} w={380} />
        <path d="M468 800 Q480 600 500 420 Q520 600 540 800 Z" fill="#5a3520" />
        <path d="M486 760 L470 560 M520 760 L536 520" stroke="#3a2112" strokeWidth="3" opacity="0.6" />
        <rect x={500} y={560} width={16} height={4} fill="#c79a3a" /><rect x={500} y={640} width={16} height={4} fill="#c79a3a" /><rect x={500} y={700} width={16} height={4} fill="#c79a3a" />
        <g className="sway-tree" style={{ transformOrigin: '510px 420px' }}>
          {[[510, 300, 150], [390, 360, 110], [630, 360, 115], [450, 250, 100], [580, 250, 100], [330, 330, 80], [690, 330, 80]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? '#5d6a35' : '#6f7d3d'} opacity={0.96} />
          ))}
        </g>
      </g>
      {/* charpai */}
      <g>
        <Shadow x={1000} y={800} w={320} />
        <rect x={870} y={732} width={290} height={22} rx="6" fill="#d6b36e" />
        <rect x={870} y={732} width={290} height={22} rx="6" fill="url(#p-jaali)" opacity="0.5" />
        <rect x={866} y={724} width={298} height={14} rx="6" fill="#6b4024" />
        <rect x={874} y={750} width={14} height={50} fill="#4a2a17" /><rect x={1140} y={750} width={14} height={50} fill="#4a2a17" />
        <rect x={900} y={716} width={110} height={20} rx="9" fill="#7a2231" />
      </g>
      {/* old hand pump */}
      <g>
        <Shadow x={1350} y={800} w={90} />
        <rect x={1336} y={680} width={26} height={120} fill="#3f3f3b" />
        <path d="M1349 690 L1316 640 H1296" stroke="#3f3f3b" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M1362 740 h34" stroke="#3f3f3b" strokeWidth="9" strokeLinecap="round" />
        <rect x={1320} y={780} width={58} height={20} fill="#9a968a" />
      </g>
      {/* string of marigolds */}
      <path d="M40 232 Q430 330 840 232 T1580 232" stroke="#6b4024" strokeWidth="3" fill="none" />
      {Array.from({ length: 26 }).map((_, i) => {
        const t = i / 25
        const x = 40 + t * 1540
        const y = 232 + Math.sin(t * Math.PI * 4) * 40 * 0.6 + 20
        return <circle key={i} cx={x} cy={y} r={8} fill={i % 2 ? '#f0a934' : '#e07a1f'} />
      })}
    </Frame>
  )
}

export const ROOM_COMPONENTS: Record<LocationId, (p: { time: TimeOfDay }) => React.JSX.Element> = {
  'living-room': LivingRoom,
  'dining-room': DiningRoom,
  kitchen: Kitchen,
  'parents-bedroom': ParentsBedroom,
  'boys-room': BoysRoom,
  balcony: Balcony,
  courtyard: Courtyard,
}

export { C }
