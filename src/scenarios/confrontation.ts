import { CHARACTERS } from '../data/characters'
import type { CharacterId, Line, Option, StoryNode, StoryScene } from '../types'
import { ALL, SONS } from '../sim/data'
import { allStances, analyse, stanceOf, type Stance } from '../sim/analyse'
import { getBond } from '../sim/engine'
import type { Act, Fx, Sim } from '../sim/types'
import { act, iff, nar, opt, say, th, type Ctx, type LensKey, type LensDef, type ScenarioBody } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name

type Voice = Record<'accuse' | 'neglected' | 'hesitant' | 'apologise' | 'refuse' | 'open', string>
const VOICE: Record<CharacterId, Voice> = {
  raj: { accuse: 'I have kept an account in my head for a year, and I am too old to pretend I have not.', neglected: 'I was told things after they were decided. I would have liked to be asked, once.', hesitant: 'There is a good deal I had meant to say. I find it is not coming in the right order.', apologise: 'I was not fair. I know which times. I should have said so before this table.', refuse: 'I will not be told I gave too much, or that it was not enough. I am finished with being measured.', open: 'I should like us to leave this table having said the truth. That is all.' },
  pooja: { accuse: 'I have been quiet for thirty-seven years. I am not going to be quiet tonight.', neglected: 'I hear what you have all decided in the corridor — afterwards. I smile. I am tired of smiling.', hesitant: 'Don’t — I don’t want to be the reason that — it’s nothing. It doesn’t matter.', apologise: 'I should have told you what I was afraid of, instead of saying it as advice.', refuse: 'No. I will not go back to being a guest in my own life.', open: 'Eat something, all of you. And then say what you came to say.' },
  vikram: { accuse: 'I pay, I drive, I ring the plumber — and I am the one who is told he is cold.', neglected: 'Nobody here has asked how I am in two years. I would like that noted.', hesitant: 'Look — I’m not — I don’t know how to say this without it sounding like an audit.', apologise: 'I was short with you. More than once. I’m sorry. That’s — I’m sorry.', refuse: 'No. I’ve done my share. Someone else can carry the next piece.', open: 'Let’s do this properly. Numbers on the table, then feelings. If we can.' },
  meera: { accuse: 'I love you both. I have also not changed in front of a closed door for a year.', neglected: 'I have been polite for twelve months. Nobody has asked what it costs.', hesitant: 'It isn’t my place. It’s Vikram’s family.', apologise: 'I held back kindness to protect my privacy, and some of that was unfair.', refuse: 'I am not agreeing to a rota I was never asked about.', open: 'I’d like to talk. Calmly. All of us, actually.' },
  rohan: { accuse: 'I’ve said yes to everything for six years, and everyone was thrilled until it cost them.', neglected: 'Thirty-one pharmacy runs. I’m not complaining. I’m telling you.', hesitant: 'Arre, it’s fine, it’s — honestly, can we just — it’s fine.', apologise: 'I promised things I couldn’t deliver. That’s on me. I’m sorry.', refuse: 'No more yeses. I’m out of them.', open: 'I’ll start. I’m tired. There.' },
  simran: { accuse: 'I’m not against helping. I’m against finding out about it afterwards.', neglected: 'Nobody asked me. Not about the flat, not about the money, not about me.', hesitant: 'It isn’t — I don’t want to make it worse.', apologise: 'I was sharp. I’m sorry. It was easier than being sad.', refuse: 'I’m not agreeing to anything I haven’t read.', open: 'I’ll listen. Properly. Go on.' },
  kabir: { accuse: 'Everyone remembers what Papa gave me. Nobody asks what it cost to carry.', neglected: 'I keep being treated as the one who left. I’m right here.', hesitant: 'Sorry — I mean — sorry. Go on. It’s fine.', apologise: 'I stayed away because I was ashamed. That wasn’t fair on you. I’m sorry.', refuse: 'I can’t promise more than I can give. I won’t.', open: 'I want to say something. Let me say it before I lose my nerve.' },
  ananya: { accuse: 'I have been alone with a baby and told it was a blessing.', neglected: 'Nobody sat with me. Not once.', hesitant: 'I don’t — maybe someone else.', apologise: 'I stopped telling you what I needed. That part is mine to own.', refuse: 'No. Not one more thing decided for me.', open: 'I’d like us to be honest. All of us. Please.' },
  alok: { accuse: 'I have been in every room and in none of them. I would like to say what I have seen.', neglected: 'I am useful, and I am never asked. It is not the same as belonging.', hesitant: 'I have no right to be at this table. But I am here.', apologise: 'I said things that were not mine to say. I am sorry — all of you.', refuse: 'I won’t stand in the middle any more. It is no place for a person.', open: 'Whatever is said tonight, I am staying till it is finished.' },
}
const MOOD: Record<CharacterId, Line['mood']> = { raj: 'stern', pooja: 'tired', vikram: 'stern', meera: 'neutral', rohan: 'tired', simran: 'stern', kabir: 'worried', ananya: 'worried', alok: 'worried' }

/** What a character says as the circle opens, drawn from where they actually stand. */
function voiceLines(s: Stance): Line[] {
  const n = N(s.id), v = VOICE[s.id]
  if (s.speak === 'silent') return [nar(`${n} has come, and sits at the edge of the circle, and says nothing. ${s.neglected ? 'A year of not being heard has taught them not to start.' : 'It is the silence of someone who no longer expects to be answered.'}`)]
  const out: Line[] = []
  const g = s.holds[0]
  if (s.speak === 'hesitant') return [say(s.id, v.hesitant, 'worried')]
  if (g) out.push(nar(`${n} keeps returning to one thing: “${g.note}”`))
  if (s.resentful && s.refusesToCompromise) out.push(say(s.id, v.refuse, MOOD[s.id]))
  else if (s.resentful) out.push(say(s.id, v.accuse, MOOD[s.id]))
  else if (s.neglected) out.push(say(s.id, v.neglected, 'hurt'))
  else out.push(say(s.id, v.open, 'neutral'))
  return out
}

export function confrontationLens(_sim: Sim, ctx: Ctx): Record<LensKey, CharacterId> {
  const persona = ctx.persona
  return { parent: persona === 'pooja' ? 'pooja' : 'raj', child: ctx.S, alok: 'alok' }
}

export function confrontationBody(sim: Sim, ctx: Ctx): ScenarioBody & { stances: Record<CharacterId, Stance> } {
  const st = allStances(sim)
  const lens = confrontationLens(sim, ctx)
  const silent = ALL.filter((c) => st[c].speak === 'silent').map(N)
  const resentful = ALL.filter((c) => st[c].resentful).map(N)
  const an = analyse(sim)
  const bg = `A year to the week since the roof came off. Diwali lamps are lit along the courtyard wall, and for the first time in years every one of them has come: Raj and Pooja, three sons and their wives, and Alok, who was not asked and would not have stayed away. Nobody has served the food. ${silent.length ? `${silent.join(' and ')} ${silent.length > 1 ? 'have' : 'has'} not yet said a word. ` : ''}${resentful.length ? `${resentful.slice(0, 3).join(', ')} ${resentful.length > 3 ? 'and others ' : ''}arrived with something prepared.` : 'Nobody arrived with a speech — which is, in this family, its own kind of alarm.'}`
  const conflict = an.fam.unresolved > 40
    ? 'Too much has gone unsaid for too long. Tonight someone will say it — and what has already been done will decide who is heard.'
    : an.fam.communication > 55 ? 'There is more honesty in this family than there was. It has not yet been tested by everything at once.' : 'Everything that has been avoided this year is sitting at the same table.'
  const mk = (k: LensKey, stake: string): LensDef => ({ who: lens[k], stake, reveals: [], intro: [], prompt: '', options: [], witness: [], })
  return {
    where: 'courtyard', time: 'night', background: bg, conflict, involved: ['raj', 'pooja', 'vikram', 'rohan', 'kabir', 'alok'],
    lenses: {
      parent: mk('parent', 'You have been right about some things and wrong about others. You will have to say which, aloud, to the people you raised.'),
      child: mk('child', 'You have a list. So does everyone else. Tonight is the only evening in which you can find out whether anyone will read yours.'),
      alok: mk('alok', 'You have been the one who watched, helped and judged. Tonight you are in the circle, with no one’s permission and no one’s side.'),
    },
    aftermath: [], stances: st,
  }
}

/* ------------------------------------------------------------------ */
/* the scene                                                           */
/* ------------------------------------------------------------------ */
const ASK: Record<LensKey, string> = { parent: 'raj', child: 'raj', alok: 'raj' }
void ASK

export function compileConfrontation(sim: Sim, ctx: Ctx, lens: LensKey): StoryScene {
  const body = confrontationBody(sim, ctx)
  const st = body.stances
  const me = body.lenses[lens].who
  const others = ALL.filter((c) => c !== me)

  // who the player can turn to first: those holding the heaviest, real grievance against someone present
  const holders = others
    .map((c) => ({ c, s: st[c], score: (st[c].holds[0]?.felt ?? 0) * 40 + st[c].resentment + (st[c].neglected ? 12 : 0) + (st[c].speak === 'silent' ? 6 : 0) }))
    .filter((x) => x.s.holds.length > 0 || x.s.neglected || x.s.resentful)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  const fallback = others.filter((c) => !holders.some((h) => h.c === c)).slice(0, 3 - holders.length)
  const picks: CharacterId[] = [...holders.map((h) => h.c), ...fallback]

  const opening: Line[] = [
    nar(body.background),
    ...(['raj', 'pooja'] as CharacterId[]).filter((c) => c !== me).flatMap((c) => voiceLines(st[c])),
  ]
  const kids = SONS.filter((c) => c !== me).map((c) => st[c]).sort((a, b) => b.resentment - a.resentment)
  for (const s of kids.slice(0, 2)) opening.push(...voiceLines(s))
  if (me !== 'alok') opening.push(...voiceLines(st.alok))
  opening.push(nar('Nobody is eating. The lamps burn down a little. Everyone is waiting to see who the first person to be honest will be.'))

  const mineOwes = st[me].owes
  const nodes: Record<string, StoryNode> = {}
  const cast = body.involved

  /* ---- decision A: whom do you turn to ---- */
  const aOptions: Option[] = picks.map((c) => {
    const g = st[c].holds[0], s = st[c]
    return opt(`turn-${c}`, `Turn to ${N(c)}, and let ${N(c)} say it.`, {
      act: act(me, c, 'listen', { c: g?.concern ?? 'recognition', tone: 'warm', hear: true, n: `${N(me)} turned to ${N(c)} first at the family table, and listened.` }),
      res: [
        say(c, s.speak === 'silent' ? 'I — thank you for asking. I didn’t think anyone was going to.' : s.resentful ? VOICE[c].accuse : VOICE[c].neglected, s.speak === 'silent' ? 'hurt' : MOOD[c]),
        ...(g ? [nar(`It is the same thing as before, only now it is being said to a face: “${g.note}”`)] : []),
        ...(s.refusesToCompromise ? [say(c, 'And do not tell me it was a misunderstanding.', 'stern')] : s.willingToApologise ? [say(c, `I’ll say my part as well. I just wanted to be heard first.`, 'tired')] : []),
      ],
      next: `b-${c}`,
    })
  })
  aOptions.push(opt('speak-first', 'Say it first yourself — before anyone else has to.', {
    act: others.filter((c) => c === 'raj' || c === 'pooja' || SONS.includes(c)).slice(0, 3).map((c) => act(me, c, 'confide', { c: 'honesty', tone: 'warm', n: `${N(me)} spoke first at the family table, honestly.` })),
    fx: [{ t: 'comm', d: 2 }],
    res: [say(me, me === 'raj' || me === 'pooja' ? 'Let me go first. I’ve been waiting for one of you to, and I think we’ll all wait until morning.' : me === 'alok' ? 'I’ll go first. I’ve no right — which is why it should be me.' : 'I’ll go first. I’d rather say it badly than wait for it to be said for me.', 'worried'), nar('The circle shifts. Something in it, very slightly, unclenches.')],
    next: `b-${picks[0]}`,
  }))

  nodes.c0 = { id: 'c0', location: 'courtyard', time: 'night', cast, lines: opening, decision: { prompt: 'Everyone is looking at the lamps. Someone has to begin. Whose voice will you make room for?', options: aOptions }, next: `b-${picks[0]}` }

  /* ---- decision B (one node per person you turned to) ---- */
  for (const c of picks) {
    const s = st[c], g = s.holds[0]
    const wronged = mineOwes.find((o) => o.who === c)
    const bOpts: Option[] = []
    if (wronged) {
      bOpts.push(opt('own-it', 'Own it plainly. “That was mine. I am sorry — for that specific thing. I will do it differently.”', {
        act: act(me, c, 'apologize', { c: wronged.concern, apology: { own: true, spec: true, nobut: true, change: true }, tone: 'warm', n: `${N(me)} owned, at the family table, what they had done to ${N(c)}.` }),
        fx: [{ t: 'comm', d: 2 }, { t: 'flag', f: 'cf-owned' }],
        res: [say(me, 'That was mine. I am sorry — for that, exactly. And I will do it differently.', 'hurt'), nar('There is a long pause, in which it becomes clear that this is, for most of the people present, a new sentence.')],
      }))
      bOpts.push(opt('explain', 'Explain what you were dealing with at the time. “I’m sorry it landed that way — but you have to understand…”', {
        act: act(me, c, 'apologize', { c: wronged.concern, apology: { own: true, spec: true, nobut: false, change: false }, tone: 'neutral', n: `${N(me)} apologised to ${N(c)} but explained what they had been dealing with.` }),
        fx: [{ t: 'flag', f: 'cf-explained' }],
        res: [say(me, 'I’m sorry it landed that way. But you have to understand what that month was like.', 'worried'), nar(`${N(c)} listens to the first half and, visibly, stops at the “but.”`)],
      }))
    } else {
      bOpts.push(opt('acknowledge', 'Acknowledge it. “I hadn’t understood how heavy that was. Tell me the rest.”', {
        act: act(me, c, 'listen', { c: g?.concern ?? 'recognition', tone: 'warm', hear: true, n: `${N(me)} told ${N(c)} they had not understood how heavy it had been, and asked for the rest.` }),
        fx: [{ t: 'comm', d: 2 }, { t: 'flag', f: 'cf-acknowledged' }],
        res: [say(me, 'I hadn’t understood how heavy that was. Tell me the rest.', 'worried'), nar(`${N(c)} tells you. It takes a while. Nobody interrupts, which is itself unusual.`)],
      }))
    }
    bOpts.push(opt('counter', 'Answer it. “If we’re counting, there are things on my side of the ledger too.”', {
      act: act(me, c, 'accuse', { c: 'fairness', tone: 'blunt', pub: others.slice(0, 3), n: `${N(me)} answered ${N(c)}'s grievance with a list of their own.` }),
      fx: [{ t: 'flag', f: 'cf-countered' }],
      res: [say(me, 'If we are counting, there are things on my side of the ledger as well.', 'stern'), nar('A hush. Three people draw breath at once. The word “ledger” does what it always does at this family’s table.')],
    }))
    bOpts.push(opt('silent', 'Say nothing. Look at the lamp. Wait for it to pass.', {
      act: act(me, c, 'absorb', { c: g?.concern ?? 'recognition', need: 0.6, n: `${N(me)} said nothing when ${N(c)} spoke at the family table.` }),
      fx: [{ t: 'flag', f: 'cf-silent' }],
      res: [nar(`${N(c)} waits for an answer. The lamp gutters. It does not come, and everyone present learns something about silence.`)],
    }))
    nodes[`b-${c}`] = {
      id: `b-${c}`, location: 'courtyard', time: 'night', cast,
      lines: [
        ...(g ? [nar(`${N(c)} is looking at you. “${g.note}”`)] : [nar(`${N(c)} has been waiting a long time to say something to you.`)]),
        ...(wronged ? [th('You know exactly which moment this is. You have been rehearsing the defence for a year. It sounds, now, thinner than it did in the car.', 'hurt')] : [th('You are not sure this is yours to answer. You are not sure it is not.', 'worried')]),
      ],
      decision: { prompt: `${N(c)} has finished speaking. What do you say?`, options: bOpts }, next: 'c2',
    }
  }

  /* ---- the rest of the circle ---- */
  const circle: Line[] = []
  const willing = ALL.filter((c) => c !== me && st[c].willingToApologise && st[c].owes[0])
  for (const s of willing.slice(0, 2).map((c) => st[c])) {
    const o = s.owes[0]
    circle.push(say(s.id, VOICE[s.id].apologise, 'tired'), nar(`It is addressed to ${N(o.who)}. It is about “${o.note}”`))
  }
  const refusers = ALL.filter((c) => c !== me && st[c].refusesToCompromise && st[c].speak !== 'silent')
  for (const s of refusers.slice(0, 2).map((c) => st[c])) circle.push(say(s.id, VOICE[s.id].refuse, MOOD[s.id]))
  const neglected = ALL.filter((c) => c !== me && st[c].neglected && st[c].speak !== 'silent' && !refusers.includes(c))
  for (const c of neglected.slice(0, 1)) circle.push(say(c, VOICE[c].neglected, 'hurt'))
  if (circle.length === 0) circle.push(nar('The others speak in turn, briefly and carefully, in the manner of people who have already said most of this to themselves.'))
  circle.push(nar(`${refusers.length ? `${refusers.slice(0, 3).map(N).join(' and ')} ${refusers.length > 1 ? 'have' : 'has'} made it plain that ${refusers.length > 1 ? 'they will' : 'they will'} not bend. ` : ''}${willing.length ? `${willing.slice(0, 3).map(N).join(' and ')} ${willing.length > 1 ? 'are' : 'is'} ready to give ground — if someone else does too.` : 'Nobody has yet offered to go first.'}`))

  /* ---- decision C: what will actually change ---- */
  const everyone = ALL.filter((c) => c !== me).slice(0, 4)
  const lessLoad = (c: CharacterId): Fx => ({ t: 'load', c, d: -12 })
  const settle = (id: string, label: string, a: Act[], fx: Fx[], text: string, res: Line[]) =>
    opt(id, label, { act: a, fx: [{ t: 'agree', id, between: [me, everyone[0]], text }, { t: 'fact', k: 'conf_settlement', v: id }, ...fx], res })
  const cOpts: Option[] = [
    settle('rota', 'Put it in writing: a shared care rota, by day, with one week a month off for whoever has done most.',
      everyone.map((c) => act(me, c, 'compromise', { c: 'fairness', alt: true, hear: true, tone: 'neutral', n: `${N(me)} proposed a written rota for caring for the parents, with a rest week for whoever carries most.` })),
      [lessLoad(sonMost(sim)), { t: 'load', c: SONS.find((x) => x !== sonMost(sim) && x !== me) ?? 'kabir', d: 8 }, { t: 'load', c: me === 'raj' || me === 'pooja' || me === 'alok' ? 'vikram' : me, d: 6 }],
      'A written care rota, with a rest week each month for the one who carries most.',
      [say(me, 'Put it in writing. A rota. By day. And one week off a month for whoever has done the most.', 'neutral')]),
    settle('open-books', 'Open everything: money, health, what each of you can and cannot give. Once, completely, so nobody has to guess again.',
      everyone.map((c) => act(me, c, 'confide', { c: 'honesty', tone: 'warm', n: `${N(me)} proposed that money, health and limits be laid completely on the table.` })),
      [{ t: 'comm', d: 3 }], 'Money, health and limits are discussed openly, once a month.',
      [say(me, 'Open everything. Money, health, what each of us can and can’t give. Once, completely.', 'worried')]),
    settle('respect', 'Agree three rules of respect: knock first; ask before deciding for someone; no airing each other in front of others.',
      everyone.map((c) => act(me, c, 'compromise', { c: 'privacy', alt: true, hear: true, tone: 'gentle', n: `${N(me)} proposed three rules of respect for the household.` })),
      [], 'Three rules: knock first, ask before deciding for someone, never air each other in front of others.',
      [say(me, 'Three rules. Knock first. Ask before deciding for someone. And no airing each other in front of relatives.', 'neutral')]),
    settle('table', 'Keep a standing Sunday table — and one hour each month, alone, between each parent and each child.',
      everyone.map((c) => act(me, c, 'offer', { c: 'belonging', alt: true, tone: 'warm', n: `${N(me)} proposed a standing Sunday table and a monthly hour for each parent and child.` })),
      [{ t: 'comm', d: 2 }], 'A standing Sunday table, and a monthly hour alone between each parent and child.',
      [say(me, 'A Sunday table. Every week. And once a month, one hour alone between each of us. Not to fix anything. To be there.', 'hopeful')]),
    opt('nothing', 'Say nothing is decided tonight. “Time will tell us what to change.”', {
      act: everyone.map((c) => act(me, c, 'deflect', { c: 'honesty', tone: 'neutral', n: `${N(me)} proposed nothing be decided that night at the family table.` })),
      fx: [{ t: 'fact', k: 'conf_settlement', v: 'nothing' }],
      res: [say(me, 'Nothing is decided tonight. Time will tell us what to change.', 'tired'), nar('It is said with great reasonableness. Several people look at the lamps.')],
    }),
  ]
  nodes.c2 = {
    id: 'c2', location: 'courtyard', time: 'night', cast, lines: circle,
    decision: { prompt: 'Words have been spoken. What will actually change on Monday?', options: cOpts }, next: 'c3',
  }

  /* ---- the reaction + the silence before an apology ---- */
  const target = mineOwes[0]?.who ?? (me === 'raj' || me === 'pooja' ? (kids[0]?.id ?? 'vikram') : me === 'alok' ? 'raj' : 'raj')
  const dOpts: Option[] = [
    opt('full', `Go first. Say it to ${N(target)} with nothing added: what you did, that you are sorry, what will be different.`, {
      act: act(me, target, 'apologize', { apology: { own: true, spec: true, nobut: true, change: true }, tone: 'warm', n: `${N(me)} apologised to ${N(target)} at the family table, plainly, with nothing added.` }),
      fx: [{ t: 'flag', f: 'cf-apologised' }, { t: 'comm', d: 2 }],
      res: [say(me, `${N(target)}. I was wrong, and you know which times. I am sorry. I will do differently.`, 'hurt')],
    }),
    opt('but', `Go first — but explain. “${N(target)}, I’m sorry. You must understand how much we were all carrying.”`, {
      act: act(me, target, 'apologize', { apology: { own: true, spec: false, nobut: false, change: false }, tone: 'neutral', n: `${N(me)} apologised to ${N(target)} at the family table but explained how much everyone had been carrying.` }),
      fx: [{ t: 'flag', f: 'cf-half-apology' }],
      res: [say(me, `${N(target)}, I’m sorry. You must understand how much we were all carrying.`, 'worried')],
    }),
    opt('wait', 'Wait. Let them go first. You have said what you had to.', {
      act: act(me, target, 'absorb', { c: 'recognition', need: 0.8, n: `${N(me)} waited for ${N(target)} to apologise first at the family table.` }),
      fx: [{ t: 'flag', f: 'cf-waited' }],
      res: [nar('The silence goes on. Someone shifts a lamp a quarter-inch. Everybody understands that three generations are each waiting for the other.')],
    }),
    opt('together', 'Suggest it together: “Both sides. At once. On three.”', {
      act: act(me, target, 'request', { c: 'recognition', tone: 'neutral', alt: true, hear: true, n: `${N(me)} proposed that both generations apologise at the same moment.` }),
      fx: [{ t: 'flag', f: 'cf-together' }],
      res: [say(me, 'Both sides. At once. On three.', 'hopeful')],
      branches: [
        { when: (q) => q.bond(target, me, 'resentment') < 40 && q.sim.self[target].compromise >= 44, acts: [act(target, me, 'apologize', { apology: { own: true, spec: true, nobut: true, change: true }, tone: 'warm', n: `${N(target)} apologised to ${N(me)} at the same moment, at the family table.` })], res: [nar(`On three, two people say the same word. It is the loudest thing anyone has said all year.`)] },
        { when: () => true, res: [nar(`${N(target)} does not move. It is not contempt; it is a wall built over a year, and it will not come down on a count.`)] },
      ],
    }),
  ]
  nodes.c3 = {
    id: 'c3', location: 'courtyard', time: 'night', cast,
    lines: [
      ...iff((q) => q.fact('conf_settlement') !== 'nothing', nar('Something has been agreed. It is written on the back of a sweet-box lid, in two hands. It is not an apology. It is the scaffolding for one.')),
      ...iff((q) => q.fact('conf_settlement') === 'nothing', nar('Nothing has been agreed. The lamps are burning lower. Everyone knows that this is the moment when families go home.')),
      nar(`It is very quiet now. ${N(target)} is looking at you. Whatever the evening has been, there is one thing left that nobody has said.`),
      th('The year is on the table, in every line of every face. You could end it with a sentence.', 'worried'),
    ],
    decision: { prompt: 'Someone has to go first.', options: dOpts }, next: 'c4',
  }

  /* ---- the last lines ---- */
  const closing: Line[] = [
    nar('Later. The lamps have been trimmed twice and nobody has gone home.'),
    ...iff((q) => q.flag('cf-apologised') || q.flag('cf-owned'), nar(`${N(target)} comes and stands beside you. Neither of you says anything for a while. Then: “I heard you.”`)),
    ...iff((q) => q.flag('cf-half-apology') || q.flag('cf-explained'), nar('It was an apology, of a kind, and it has been received in the same spirit: gratefully, and with reservations.')),
    ...iff((q) => q.flag('cf-waited') || q.flag('cf-silent'), nar('The silence has lasted too long to be broken now. People begin, one by one, to look for their shoes.')),
    ...iff((q) => q.flag('cf-countered'), say('pooja', 'Both of you. Enough. We came to be heard, not to be right.', 'stern', { for: ['raj', 'vikram', 'rohan', 'kabir', 'alok'], notFor: ['pooja'] })),
    ...iff((q) => q.flag('cf-together'), nar('Someone laughs — a short, surprised sound. It is not a joke. It is what happens when a tightrope turns out to be a rope.')),
    ...iff((q) => q.fact('conf_settlement') === 'rota', nar('The rota is stuck to the fridge with a magnet shaped like a mango. Three names have signed. One has signed and underlined it.')),
    ...iff((q) => q.fact('conf_settlement') === 'open-books', nar('Raj has brought out the passbook. This time nobody makes a speech about it.')),
    ...iff((q) => q.fact('conf_settlement') === 'respect', nar('A card is taped inside the front door in Pooja’s handwriting: “Please knock.” Under it, in a younger hand: “We will.”')),
    ...iff((q) => q.fact('conf_settlement') === 'table', nar('Someone has already put “Sunday” in the calendar. In ink.')),
    nar('Nobody has been declared right. Everybody has been, in some way, heard — or has noticed that they were not.'),
    say('pooja', 'It is late. Eat. Whatever it was, we are still a family. That is the only fact I am certain of.', 'tired'),
  ]
  nodes.c4 = { id: 'c4', location: 'courtyard', time: 'night', cast, lines: closing, ends: true }
  return { id: 's16', who: me, title: 'The Reckoning', subtitle: 'Diwali', start: 'c0', nodes }
}

function sonMost(sim: Sim): CharacterId {
  return SONS.reduce((best, c) => ((sim.load[c] ?? 0) > (sim.load[best] ?? 0) ? c : best), 'rohan' as CharacterId)
}

void getBond; void stanceOf
