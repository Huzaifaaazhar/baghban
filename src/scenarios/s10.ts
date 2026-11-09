import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name

export const S10: ScenarioDef = {
  id: 's10', n: 10, title: 'Household Rules', month: 'August',
  build: (c) => {
    const H = c.H, hn = N(H), W = c.HW, wn = N(W)
    const own = c.living === 'own' || c.living === 'alok-near'
    const place = own ? 'Verma Sadan, on a Sunday' : `${hn}’s flat`
    const kept = (q: import('../sim/types').Q) => q.agreed('quiet-hours') && !q.broken('quiet-hours')
    return {
      where: 'kitchen', time: 'morning',
      background: `Five-twenty in the morning at ${place}. Raj has been up since four. The household runs, in his mind, on a routine: up at five, bath, puja, newspaper, a walk, tea at six; shoes off at the door; phones away at meals; television off at nine; no meat on Tuesdays; Sunday lunch at one. Nobody else in the house remembers agreeing to any of it.`,
      conflict: 'Raj sees a routine. The household sees a regime. The routine is the only thing that gets him through the day; he has not told them that.',
      involved: ['raj', H, W, 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: 'The routine is how you know it is a day. Without it, you do not know what you are for.',
          reveals: ['raj-lonely'],
          intro: [
            nar('5:20. The kitchen is dark except for the gas ring and the small brass lamp. You are the only person awake in a house with five rooms.'),
            th('Bath, puja, paper, walk, tea. A day with joints in it. Every joint is a hook to hang a person on, and without them a day just slides down.', 'tired'),
            ...iff(kept, th('You have kept the typewriter hours. You have done it without complaint. It seems to you that this ought to earn something.', 'stern')),
            ...iff((q) => q.flag('raj-withdrawn'), th('You told them you had stopped typing. They said “oh.” Nobody asked why.', 'hurt')),
            nar(`${wn} walks in in a dressing gown and stops at the door. She looks at the lamp, the tea, you. It is not hostile; it is exhausted.`),
          ],
          notice: [{ id: 'chair', kind: 'look', label: 'the empty chairs at six', text: 'Six cups on the shelf, one used. Tea at six for six people, for forty years. Now you pour for yourself, and the rest go on the rack until someone remembers they exist.', fx: [insightFx('raj-lonely')] }],
          prompt: 'The kettle is boiling. Nobody else is awake.',
          options: [
            opt('announce', 'Announce the rota at breakfast. “These are the hours of this house. Everyone, please.”', {
              act: act('raj', H, 'impose', { c: 'autonomy', own: 'routine', need: 0.8, tone: 'blunt', pub: [W], n: `Raj announced the household routine at breakfast: “These are the hours of this house.”` }),
              fx: [flag('hr-imposed'), { t: 'fact', k: 'rules', v: 'imposed' }, { t: 'bond', a: W, b: 'raj', d: { resentment: 4, respect: -2 } }],
              res: [say('raj', 'These are the hours of this house. Everyone, please.', 'stern'), nar('There is a silence in which a toast pops, a child looks at the ceiling, and a daughter-in-law very visibly counts to ten.')],
            }),
            opt('three-rules', '“There are only three things I ask. Shoes off, phones away at dinner, and Sunday lunch together. The rest, you arrange yourselves.”', {
              act: act('raj', H, 'compromise', { c: 'autonomy', alt: true, hear: true, tone: 'neutral', n: `Raj narrowed his rules to three: shoes off, phones away at dinner, Sunday lunch.` }),
              fx: [flag('hr-negotiated'), { t: 'fact', k: 'rules', v: 'negotiated' }, { t: 'agree', id: 'house-rules', between: ['raj', H], text: 'Three rules: shoes off, phones away at dinner, Sunday lunch together.' }],
              res: [say('raj', 'Three things only. Shoes off. Phones away at dinner. Sunday lunch together. The rest you arrange.', 'neutral')],
              branches: [{ when: (q) => q.bond(H, 'raj', 'resentment') < 28, res: [say(H, 'That I can do. Three I can actually do.', 'tired'), nar('It is the first time he has agreed without calculating what it costs.')] }, { when: () => true, res: [say(H, 'Three. Just three? You’re sure?', 'worried'), say('raj', 'I am sure that I will notice if it is two.', 'stern')] }],
            }),
            opt('adapt', 'Say nothing. Follow their hours. Eat when they eat, sleep when they sleep.', {
              act: act('raj', H, 'concede', { c: 'routine', tone: 'blunt', n: 'Raj gave up his routine and fitted himself to the household’s hours.' }),
              fx: [flag('hr-adapted'), { t: 'fact', k: 'rules', v: 'abandoned' }, { t: 'self', c: 'raj', d: { security: -4 } }, later('adrift', 2, [{ t: 'self', c: 'raj', d: { security: -3 } }], [{ speaker: 'narrator', text: 'Raj has begun to nap through the afternoon. He wakes disoriented, and asks what day it is.' }], { ifFlag: 'hr-adapted' })],
              res: [nar('You do not announce anything. You wake at seven, as they do, and have your tea at the table with the others. It is quiet and pleasant, and you do not know where you are in the day.')],
            }),
            opt('invite', '“Puja is at five-thirty. Tea after. Come if you wish — nobody is obliged.”', {
              act: act('raj', H, 'offer', { c: 'routine', alt: true, tone: 'warm', n: 'Raj invited the family to join his morning puja and tea, without obligation.' }),
              fx: [flag('hr-invited'), { t: 'fact', k: 'rules', v: 'ritual' }],
              res: [say('raj', 'Puja is at five-thirty. Tea after. Come if you wish. Nobody is obliged.', 'warm')],
              branches: [{ when: (q) => q.bond(W, 'raj', 'resentment') < 22, res: [nar(`The next morning, ${wn} is at the door at five-forty with her hair in a towel. She has brought her own cup.`)] }, { when: () => true, res: [nar('For three days the puja is observed by one man and one cat. On the fourth, a child appears, grumbling, in pyjamas, and sits down.')] }],
            }),
          ],
          witness: [th('Raj at the gas ring: the routine is how he knows he is alive. The family has never once asked what it does for him.', 'tired')],
          witnessLearn: ['raj-lonely'],
        },

        child: {
          who: H,
          stake: 'Your father’s routine is rearranging your own home. You have not said so. You have begun to arrive late to it on purpose.',
          reveals: [SECRET[H]],
          intro: [
            nar('5:15 a.m. The brass lamp is on in the kitchen. You hear the pressure of a tap, a small cough, the sound of a man being quiet on purpose.'),
            th('Aarav’s headphones. The television at eleven. The shoes by the door in a heap. Every week Papa adds a rule, in the tone of someone adding a signature.', 'tired'),
            th(`${wn} has said it plainly: “It’s our home. Please talk to him.”`, 'worried'),
            say('raj', 'You are up late. Tea is at six.', 'neutral'),
          ],
          notice: [{ id: 'kitchen', kind: 'look', label: 'the kitchen at five', text: 'The tea is made. The cups are laid for everybody. The newspaper has been folded, ironed against the table’s edge, and left at your place. It is the nearest thing he can do to a letter.' }],
          prompt: 'The cups are laid. He is looking at you.',
          options: [
            opt('comply', 'Say nothing. Fit in. “Yes, Papa. Tea at six.”', {
              act: act(H, 'raj', 'absorb', { c: 'autonomy', need: 0.7, n: `${hn} fell in with Raj’s routine without saying he minded it.` }),
              fx: [flag('hr-complied'), { t: 'fact', k: 'rules', v: 'imposed' }, { t: 'self', c: H, d: { security: -2 } }],
              res: [say(H, 'Yes, Papa. Tea at six.', 'tired'), nar('It is easy. It is so easy that you feel, for a second, nothing at all. Then you feel everything, and it stays.')],
            }),
            opt('my-house', '“Papa, this is our house. We’ll keep our own hours — and respect yours in yours.”', {
              act: act(H, 'raj', 'refuse', { c: 'routine', own: 'autonomy', need: 0.8, tone: 'blunt', n: `${hn} told Raj that this was their house and they would keep their own hours.` }),
              fx: [flag('hr-refused'), { t: 'fact', k: 'rules', v: 'abandoned' }],
              res: [say(H, 'Papa, this is our house. We’ll keep our own hours, and respect yours in yours.', 'stern'), say('raj', 'I see.', 'stern'), nar('He folds the newspaper once, twice, and sets it down at his own place. He has never in his life looked so small.')],
            }),
            opt('rule-swap', '“Let’s each name three rules we can’t live without — you, us — and keep those. The rest we drop.”', {
              act: act(H, 'raj', 'compromise', { c: 'routine', alt: true, hear: true, tone: 'gentle', n: `${hn} proposed each side naming three rules it could not live without.` }),
              fx: [flag('hr-negotiated'), { t: 'fact', k: 'rules', v: 'negotiated' }, { t: 'agree', id: 'house-rules', between: ['raj', H], text: 'Three rules each; the rest are dropped.' }],
              res: [say(H, 'Let’s each name three rules we can’t live without. You, us. We keep those. The rest we drop.', 'hopeful')],
              branches: [{ when: (q) => q.bond('raj', H, 'trust') >= 52, res: [say('raj', 'Hm. Three. That is — a fair arrangement. Mine: puja, shoes, and Sunday lunch.', 'neutral')] }, { when: () => true, res: [say('raj', 'You have drawn this up already, I imagine.', 'stern'), nar('It is not an agreement. It is an opening bid.')] }],
            }),
            opt('ask-why', '“Papa — why does five o’clock matter so much? What does the puja do for you?”', {
              act: act(H, 'raj', 'listen', { c: 'routine', tone: 'warm', hear: true, n: `${hn} asked Raj what the routine actually did for him.` }),
              fx: [flag('hr-asked'), learnFx(H, 'raj-lonely'), insightFx('raj-lonely')],
              res: [say(H, 'Papa — why five o’clock? What does the puja do for you?', 'worried'), say('raj', 'It tells me it’s the morning. When I wake at four, nothing tells me anything.', 'tired'), nar('He pours the tea. His hand is steady. His voice, for a second, is not.')],
            }),
          ],
          witness: [th(`${hn}, at five in the morning: his father’s routine is crowding his home. He has not asked what it is for. It is, he realises, one of the few things Raj has left that is entirely his.`, 'tired')],
          witnessLearn: [SECRET[H]],
        },

        alok: {
          who: 'alok',
          stake: 'You are a guest in a house that runs to someone else’s clock. Everyone is trying to make you take a side.',
          reveals: ['alok-belong'],
          intro: [
            nar('You arrived Saturday night with sweets. By Sunday morning you have, without intending to, joined a household’s Cold War.'),
            th('Raj-uncle’s routine is perfect in your hands. You love it. It is the first scheduled life you have seen since you were nine.', 'warm'),
            th(`${hn} watches you eat Raj’s tea at six with a look of mild treason.`, 'worried'),
          ],
          prompt: 'Everyone is watching who you side with.',
          options: [
            opt('follow-all', 'Do every part of Raj’s routine, cheerfully. “It suits me, Uncle.”', {
              act: act('alok', 'raj', 'support', { c: 'routine', tone: 'warm', n: 'Alok kept to all of Raj’s routine without being asked.' }),
              fx: [flag('hr-alok-followed'), { t: 'bond', a: H, b: 'alok', d: { respect: -3, resentment: 3 } }, { t: 'bond', a: W, b: 'alok', d: { respect: -2 } }],
              res: [say('alok', 'It suits me, Uncle. I like it.', 'warm'), say('raj', 'Of course it does. You have sense.', 'warm'), nar(`${hn} looks at his tea as if the leaves might explain something.`)],
            }),
            opt('translate', `Take ${hn} aside: “It isn’t a regime. It’s a coat he’s wearing against the cold.”`, {
              act: act('alok', H, 'confide', { c: 'routine', tone: 'warm', n: `Alok explained to ${hn} what the routine meant to Raj.` }),
              fx: [flag('hr-alok-translated'), learnFx(H, 'raj-lonely')],
              res: [say('alok', 'It isn’t a regime. It’s a coat he wears against the cold.', 'worried'), say(H, 'Is that what you think?', 'tired'), say('alok', 'I think it’s what I would do.', 'worried')],
            }),
            opt('quiet-break', 'Quietly break the small rules where Raj won’t notice, so nobody has to quarrel.', {
              act: act('alok', 'raj', 'withhold', { c: 'honesty', tone: 'gentle', n: 'Alok quietly bent the rules in front of the family and hid it from Raj.' }),
              fx: [flag('hr-alok-bent')],
              res: [nar('You leave your shoes on in the passage when he is at the tap. You answer a phone in the toilet. It feels, bizarrely, like the most disloyal thing you have ever done.')],
            }),
            opt('tease', 'Say, grinning: “Uncle, at this rate we’ll have a bell.”', {
              act: act('alok', 'raj', 'dismiss', { c: 'routine', tone: 'gentle', n: 'Alok teased Raj about the routine: “At this rate we’ll have a bell.”' }),
              fx: [flag('hr-alok-teased')],
              res: [say('alok', 'Uncle, at this rate we’ll have a bell.', 'warm')],
              branches: [{ when: (q) => q.bond('raj', 'alok', 'trust') >= 80, res: [say('raj', 'A bell is a good idea. I will have one bought.', 'warm')] }, { when: () => true, res: [say('raj', 'This is not a joke.', 'stern'), nar('It was meant to be one. You realise, a moment late, that it was also the truth.')] }],
            }),
          ],
          witness: [th('Alok, in a house on someone else’s clock: he knows what it is to have a routine and nobody to share it with. He does not know yet which side that puts him on.', 'worried')],
          witnessLearn: ['raj-lonely'],
        },
      },
      aftermathTime: 'morning',
      aftermath: [
        nar('The day proceeds, as days do, to its first sentence.'),
        ...iff((q) => q.fact('rules') === 'negotiated' || q.agreed('house-rules'), nar('A sheet of paper is pinned to the fridge. Six rules in two hands. The handwriting argues; the content does not.')),
        ...iff((q) => q.fact('rules') === 'imposed', nar('Everyone is at the breakfast table at the appointed time. Nobody is happy about it. The tea is, nonetheless, excellent.')),
        ...iff((q) => q.fact('rules') === 'abandoned', nar('By seven the household has fanned out into its own timetables. Raj’s cup sits on the table, cooling, in the shape of a question.')),
        ...iff((q) => q.fact('rules') === 'ritual', nar('Raj is at the puja. He is, for the first time in a long while, not entirely alone in it.')),
        ...iff((q) => q.flag('hr-alok-bent'), nar('Raj has found a shoe in the wrong place. He looks at it for some time.')),
        say('pooja', 'A house is made of routines. It does not matter whose. It matters that someone minds.', 'tired'),
      ],
    }
  },
}
