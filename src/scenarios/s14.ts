import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, nar, opt, say, th, SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const REMARK: Record<string, { harsh: string; mild: string; brag: string }> = {
  vikram: { harsh: 'Vikram is a big manager now. Too big to ring his own father on his birthday.', mild: 'Vikram is a big manager now. We hardly see him, we’re so proud.', brag: 'Vikram has a corner office. Not like some people.' },
  rohan: { harsh: 'Rohan’s studio has been “about to take off” for six years. We have stopped asking when.', mild: 'Rohan has his studio. Nobody gets rich in design, we tell him.', brag: 'Rohan is the artistic one. Somebody has to be.' },
  kabir: { harsh: 'Kabir went abroad on my deposit. The less said about that, the better.', mild: 'Kabir’s the clever one. We sent him abroad. He is still learning to be home.', brag: 'Kabir — well, we all know how Kabir’s degree was paid for.' },
}

export const S14: ScenarioDef = {
  id: 's14', n: 14, title: 'Public Argument', month: 'December',
  build: (c) => {
    const S = c.S, sn = N(S), R = REMARK[S]
    const raw = (q: import('../sim/types').Q) => q.bond('raj', S, 'resentment') >= 24 || q.scar('raj', S) > 3 || q.fam('unresolved') > 40
    const volatile = (q: import('../sim/types').Q) => q.bond(S, 'raj', 'resentment') >= 28 || q.scar(S, 'raj') > 4
    return {
      where: 'courtyard', time: 'afternoon',
      background: `A cousin’s mehendi, held in the courtyard of Verma Sadan, under the neem. Sixty relatives, three generations, a halwai in the kitchen, an aunt on every dhurrie. Bua has asked, over the sound of the dholak, the question every relative asks: “Raj-bhai — and how are the boys?” Raj has a glass of lassi and an audience.`,
      conflict: `Whatever Raj says next will be heard by everyone he has ever wanted to impress. ${sn} is standing eight feet away with a plate of jalebis, holding his face very still.`,
      involved: ['raj', S, 'pooja', 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: 'You are good at an audience. You are less good at knowing when you are the subject of it.',
          reveals: ['vik-judged'],
          intro: [
            nar('The courtyard has been hung with marigold. A hundred glass bangles clink at the women’s end. Somebody has put a plate in your hand.'),
            nar('“Raj-bhai!” Bua’s voice carries over the dholak. “And how are the boys? Sab theek?”'),
            th(`${sn} is within earshot. He is not looking at you.`, 'worried'),
            ...iff(raw, th('There have been months of small silences and one large one. You have the quiet, dangerous feeling that has made you, over the years, say exactly what you should not.', 'stern')),
            nar('Sixty faces turn to you with the pleasant expectancy of people who have been waiting for the next course.'),
          ],
          notice: [{ id: 'son', kind: 'look', label: `${sn}’s plate`, text: `He has not touched the jalebis. He is holding the plate as if it were evidence. When Bua laughed, his jaw went tight — a gesture you know, because it is yours.`, fx: [insightFx('vik-judged')] }],
          prompt: 'Sixty relatives. A lassi. One answer.',
          options: [
            opt('shame', `“${R.harsh}”`, {
              act: act('raj', S, 'shame', { c: 'dignity', tone: 'harsh', pub: ['pooja', 'alok'], own: 'recognition', need: 0.5, n: `Raj said of ${sn}, in front of sixty relatives: “${R.harsh}”` }),
              fx: [flag('pa-shamed'), { t: 'bond', a: 'pooja', b: 'raj', d: { respect: -4 } }, { t: 'bond', a: 'alok', b: 'raj', d: { respect: -3 } }],
              res: [say('raj', R.harsh, 'stern'), nar('A ripple of indulgent laughter. A hundred bangles stop. Then, the ice-cream seller’s bell, somewhere, absurdly.'), say(S, '(very quietly) Papa.', 'hurt')],
            }),
            opt('brag-compare', `Praise a different son loudly: “${R.brag}”`, {
              act: act('raj', S, 'shame', { c: 'recognition', tone: 'blunt', pub: ['pooja', 'alok'], n: `Raj praised another son at ${sn}’s expense: “${R.brag}”` }),
              fx: [flag('pa-compared'), { t: 'bond', a: S, b: 'raj', d: { distance: 3 } }],
              res: [say('raj', R.brag, 'neutral'), nar('It comes out smoothly, like a thing said many times in private. Several uncles nod. One aunt looks at her plate.')],
            }),
            opt('deflect', 'Laugh, raise the lassi, and say: “Boys are boys. Ask me about the roof.”', {
              act: act('raj', S, 'deflect', { c: 'recognition', tone: 'warm', n: `Raj deflected Bua’s question about his sons with a joke.` }),
              fx: [flag('pa-deflected')],
              res: [say('raj', 'Boys are boys. Ask me about the roof.', 'warm'), nar('Laughter. It saves the afternoon. It also tells every son in earshot that he was not, this time, worth a sentence.')],
            }),
            opt('defend', `Say: “${R.mild.split('.')[0]}. They carry more than they show — more than I ever asked.”`, {
              act: act('raj', S, 'support', { c: 'recognition', tone: 'warm', pub: ['pooja', 'alok'], n: `Raj said of ${sn} in public that his sons carried more than they showed.` }),
              fx: [flag('pa-defended'), { t: 'self', c: S, d: { security: 4 } }, { t: 'comm', d: 1 }],
              res: [say('raj', 'They carry more than they show. More than I ever asked.', 'tired'), nar('There is a short, startled hush. Bua puts down her cup. Pooja’s hand moves to her mouth.')],
            }),
          ],
          witness: [th('Raj, with a glass of lassi and a courtyard full of faces: he is better at this than he has ever been at saying a true thing in private. It is the audience, he thinks. It is also the habit.', 'tired')],
          witnessLearn: ['vik-judged'],
        },

        child: {
          who: S,
          stake: 'You have prepared for every kind of argument except this one: in daylight, in front of sixty relatives, with a plate in your hand.',
          reveals: [SECRET[S]],
          enter: (q) => raw(q)
            ? [act('raj', S, 'shame', { c: 'dignity', tone: 'harsh', pub: ['pooja', 'alok'], n: `Raj said of ${sn}, to relatives: “${R.harsh}”` })]
            : [act('raj', S, 'dismiss', { c: 'recognition', tone: 'gentle', pub: ['pooja', 'alok'], n: `Raj spoke of ${sn} to relatives in a way that made him feel small.` })],
          intro: [
            nar('The dholak, the clink of bangles, a plate of jalebis in your hand. You are doing what you do at every family wedding: standing slightly to one side.'),
            ...iff(raw, say('raj', R.harsh, 'stern'), nar('A ripple of indulgent laughter. You feel it in the back of your neck.')),
            ...iff((q) => !raw(q), say('raj', R.mild, 'neutral'), nar('It is said with warmth. It is also, somehow, a dismissal.')),
            th(S === 'vikram' ? 'You have never been mentioned in public except as a manager. You have never once been mentioned as a son.' : S === 'rohan' ? 'The studio has been “about to take off” for six years. It has been said so often that nobody notices the word “about.”' : 'The deposit. It is always the deposit. It follows you at weddings.', 'hurt'),
            nar('The courtyard has gone slightly quieter. Sixty people are pretending to look elsewhere.'),
          ],
          notice: [{ id: 'faces', kind: 'look', label: 'the faces around you', text: 'Bua is looking at her tea. Two cousins have turned their backs, in sympathy or in embarrassment. Mummy is looking directly at you, across the whole courtyard, and her face says: please, not here. Please.' }],
          prompt: 'You have about four seconds. Everyone can see you counting them.',
          options: [
            opt('calm', 'Smile, and say clearly: “Papa, you know that isn’t how I’d put it. Perhaps we can talk about it at home.”', {
              act: act(S, 'raj', 'refuse', { c: 'dignity', own: 'dignity', need: 0.8, tone: 'gentle', pub: ['pooja', 'alok'], n: `${sn} calmly said, in front of the relatives, that he would not put it that way.` }),
              fx: [flag('pa-calm')],
              res: [say(S, 'Papa, you know that isn’t how I’d put it. Perhaps we can talk about it at home.', 'stern')],
              branches: [{ when: (q) => q.bond('raj', S, 'respect') >= 58, res: [say('raj', '…Perhaps. Yes. At home.', 'tired'), nar('A pause. Then, because there is nothing else to do, the dholak starts again.')] }, { when: () => true, res: [say('raj', 'At home. Of course. Everyone in this family discusses things at home.', 'stern'), nar('It is a good line. It is aimed at you.')] }],
            }),
            opt('swallow', 'Smile. Take a jalebi. Say nothing. You will remember every second of this.', {
              act: act(S, 'raj', 'absorb', { c: 'dignity', need: 0.85, n: `${sn} swallowed Raj’s remark in front of the relatives and smiled.` }),
              fx: [flag('pa-swallowed'), { t: 'self', c: S, d: { security: -4 } }, later('echo', 2, [{ t: 'bond', a: S, b: 'raj', d: { resentment: 6, distance: 5 } }], [{ speaker: 'narrator', text: `${sn} has stopped mentioning his father’s name in any conversation that is not strictly necessary.` }], { ifFlag: 'pa-swallowed' })],
              res: [nar('You take a jalebi. It is too sweet. You eat it in four bites and say, to nobody, “Excellent.” Your mother has put down her plate.')],
            }),
            opt('retort', 'Say, loud enough for the whole courtyard: “Perhaps if you’d once asked what it costs us, Papa, you’d have fewer opinions.”', {
              act: act(S, 'raj', 'accuse', { c: 'dignity', tone: 'harsh', pub: ['pooja', 'alok'], own: 'dignity', need: 0.85, n: `${sn} answered Raj back in public: “If you’d once asked what it costs us, you’d have fewer opinions.”` }),
              fx: [flag('pa-retorted'), { t: 'bond', a: 'pooja', b: S, d: { respect: -4, resentment: 3 } }],
              res: [say(S, 'Perhaps if you had once asked what it costs us, Papa, you would have fewer opinions.', 'stern'), nar('The dholak stops. Sixty people discover, simultaneously, something of interest on their plates.')],
              branches: [{ when: volatile, res: [say('raj', 'Costs. You want to speak of costs. In front of your mother’s sisters.', 'stern'), nar('Pooja steps between you. Her voice is quite steady. “Both of you. Not here.”')] }, { when: () => true, res: [say('raj', 'That is — a fair question.', 'tired'), nar('The silence, for a moment, is not hostile. It is stunned.')] }],
            }),
            opt('step-out', 'Put the plate down. Step out of the courtyard. Come back in ten minutes and take him aside.', {
              act: act(S, 'raj', 'deflect', { c: 'dignity', tone: 'gentle', n: `${sn} stepped out of the courtyard rather than answer Raj in public.` }),
              fx: [flag('pa-stepped-out')],
              res: [nar('You walk out under the arch into the lane. The air is cool. You count to fifty and walk back. When you reach him, you say quietly, in his ear, the sentence you would have shouted.')],
              branches: [{ when: (q) => q.bond('raj', S, 'trust') >= 55, fx: [{ t: 'agree', id: 'public-etiquette', between: ['raj', S], text: 'No criticism of each other in front of relatives.' }], res: [say('raj', '…You are right. Not in front of the family. I should not have.', 'tired')] }, { when: () => true, res: [say('raj', 'You walked out. In front of Bua.', 'stern'), nar('He has chosen to be injured by the exit rather than the question.')] }],
            }),
          ],
          witness: [th(`${sn}, in front of sixty relatives, with a plate of jalebis: his father is not usually cruel. He is usually careless, which is, at a wedding, nearly worse.`, 'hurt')],
          witnessLearn: [SECRET[S]],
        },

        alok: {
          who: 'alok',
          stake: 'You were asked who you were, by a stranger, in the middle of the courtyard. You do not have a good answer.',
          reveals: ['alok-belong'],
          intro: [
            nar('You are in the courtyard with a tray of lassi, passing between aunts. An old woman in a purple sari has just taken your sleeve.'),
            nar('“And you are?” says the aunt, kindly, loudly. “Raj-bhai’s — what? Nephew? Driver?”'),
            th('Nobody has ever asked you before, in so many words. You find that you do not have a sentence.', 'hurt'),
            nar('Across the courtyard Raj has begun to answer Bua’s question about his sons. You can hear that tone from here.'),
          ],
          prompt: 'The aunt is still holding your sleeve. Raj is about to speak.',
          options: [
            opt('defend-son', `Step in as Raj speaks. “Uncle, ${sn} is standing right there. Perhaps he can speak for himself.”`, {
              act: [act('alok', 'raj', 'accuse', { c: 'dignity', tone: 'blunt', pub: ['pooja', S], n: `Alok told Raj in public that ${sn} could speak for himself.` }), act('alok', S, 'defend', { vs: 'raj', tone: 'warm', n: `Alok defended ${sn} against Raj in public.` })],
              fx: [flag('pa-alok-defended-son'), { t: 'bond', a: 'raj', b: 'alok', d: { trust: -6, respect: -4 } }, { t: 'bond', a: S, b: 'alok', d: { trust: 4 } }],
              res: [say('alok', 'Uncle, ' + sn + ' is standing right there. Perhaps he can speak for himself.', 'stern'), nar('The words are out before you can weigh them. You see, a half-second later, Raj’s face. You have done it again.')],
            }),
            opt('pull-out', `Slip beside ${sn}: “Come and help me carry the water. Five minutes.”`, {
              act: act('alok', S, 'support', { c: 'dignity', tone: 'warm', n: `Alok drew ${sn} away from the courtyard so he would not have to answer Raj.` }),
              fx: [flag('pa-alok-pulled-out'), { t: 'bond', a: S, b: 'alok', d: { trust: 4 } }],
              res: [say('alok', 'Come and help me carry the water. Five minutes.', 'warm'), say(S, 'Thank you.', 'hurt'), nar('You carry water, in silence, in the cool of the passage. He says nothing. Neither do you. It is, perhaps, what he needed.')],
            }),
            opt('claim-place', 'Answer the aunt, loudly: “I am family, Aunty. I am Raj-uncle’s — I belong here.”', {
              act: act('alok', 'raj', 'impose', { c: 'dignity', own: 'belonging', need: 0.95, tone: 'blunt', pub: ['pooja', S], n: 'Alok announced in front of the relatives that he was family.' }),
              fx: [flag('pa-alok-claimed'), { t: 'bond', a: 'vikram', b: 'alok', d: { resentment: 5 } }, { t: 'bond', a: 'rohan', b: 'alok', d: { resentment: 3 } }],
              res: [say('alok', 'I am family, Aunty. I belong here.', 'stern'), nar('Several heads turn. Raj, mid-sentence, looks at you with the expression of a man being told his coat has been taken by someone who was not asked.')],
            }),
            opt('stay-out', 'Say only: “A friend. I help with the printing.” And carry the lassi on.', {
              act: act('alok', 'raj', 'absorb', { c: 'belonging', need: 0.9, n: 'Alok described himself to the relatives only as “a friend.”' }),
              fx: [flag('pa-alok-friend'), { t: 'self', c: 'alok', d: { security: -3 } }],
              res: [say('alok', 'A friend. I help with the printing.', 'neutral'), nar('It is a modest answer. It costs you something you cannot put a number on.')],
            }),
          ],
          witness: [th('Alok, with a tray of lassi, held by the sleeve by an aunt who has asked what he is: he has never needed a word for it, until he was asked. “Friend” is too small. “Family” is not his to say.', 'worried')],
          witnessLearn: ['alok-belong'],
        },
      },
      aftermathTime: 'evening',
      aftermath: [
        nar('Evening. The tent has been taken down and the marigolds swept to one side.'),
        ...iff((q) => q.flag('pa-shamed') || q.flag('pa-compared'), nar('Several relatives have taken their leave early, with the warmth of people who have seen something they were not meant to.')),
        ...iff((q) => q.flag('pa-defended'), nar('An aunt takes Raj’s arm as she leaves. “You spoke well, Raj-bhai. They are lucky.” He does not reply. It is the first time he has been told so in his own courtyard.')),
        ...iff((q) => q.flag('pa-retorted'), nar('The word “costs” is being repeated in three separate kitchens.')),
        ...iff((q) => q.flag('pa-calm'), nar('A heated discussion, conducted with great politeness, in the study. It lasts forty minutes. Nobody wins. The door is not slammed.')),
        ...iff((q) => q.flag('pa-swallowed'), nar('He helped fold the chairs and said nothing to anyone. His mother brought him tea. He took it with both hands.')),
        ...iff((q) => q.flag('pa-alok-claimed'), say('raj', 'You are fond of us, Alok. I know that. But you are not — we are not — it is not that simple.', 'stern')),
        ...iff((q) => q.flag('pa-alok-defended-son'), nar('Raj does not address Alok for the rest of the evening. He addresses everything in his direction.')),
        say('pooja', 'It is over. Whatever it was, it is over. Come and eat.', 'tired'),
      ],
    }
  },
}
