import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, learnFx, nar, opt, say, th, SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name

export const S15: ScenarioDef = {
  id: 's15', n: 15, title: 'The Apology', month: 'January',
  build: (c) => {
    const S = c.S, sn = N(S)
    const hurtR = (q: import('../sim/types').Q) => q.bond('raj', S, 'resentment') >= 20 || q.scar('raj', S) > 2 || q.count({ actor: S, target: 'raj', open: true, kind: ['shame', 'guilt', 'accuse', 'dismiss', 'refuse', 'request'] }) > 0
    const alokWrong = (q: import('../sim/types').Q) => q.flag('p1:alok-overstepped') || q.flag('tw-alok-sided') || q.flag('sa-alok-defended') || q.flag('pa-alok-defended-son') || q.flag('pa-alok-claimed') || q.flag('mc-alok-accused') || q.flag('pb-alok-told') || q.flag('ex-alok-exposed') || q.flag('gt-alok-pressed') || q.flag('cd-alok-leaked')
    return {
      where: 'courtyard', time: 'evening',
      background: 'A year since the roof came off. The neem has shed and started again. Diwali lamps are being set along the wall of the courtyard. Raj and Pooja are at home; their sons will come for the evening. Each side has, for months, been waiting to be apologised to. Each has the same plan: wait.',
      conflict: 'The parents think the children owe them an apology. The children think the parents do. Both are partly right — and neither will go first.',
      involved: ['raj', 'pooja', S, 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: 'You have been right about many things this year, and wrong about the ones that mattered. You know which. You have not said so.',
          reveals: ['raj-letters'],
          intro: [
            nar('The courtyard at dusk. The diyas are in a row along the wall, unlit, and the neem has begun, in the damp, to put out its small, bitter leaves.'),
            th('You have read the letters in the almirah again. Four lines from each boy, in a hand you taught: “Papa, thank you.” “Papa, I will make you proud.” You have known for months that you should have answered them.', 'tired'),
            ...iff(hurtR, th(`${sn} will arrive at seven. Something between you is unfinished. You are not sure whether it is his to finish or yours.`, 'worried')),
            ...iff((q) => !hurtR(q), th(`${sn} will arrive at seven. Things between you are better than they have been. You do not entirely trust that.`, 'worried')),
            say('pooja', 'You are rehearsing, Raj. You do it with your shoulders.', 'tired'),
          ],
          notice: [{ id: 'letters', kind: 'memory', label: 'the letters', text: 'The oldest is from the first week at the hostel. The last, eleven years old, ends: “I miss your typewriter.” You have never answered it.', fx: [insightFx('raj-letters')] }],
          prompt: 'The diyas are not yet lit. You have the whole evening to say it, and about four minutes to decide how.',
          options: [
            opt('full', 'Say it plainly. “I was wrong — about the table, and the wedding, and a great deal else. I am sorry. I will do differently.”', {
              act: act('raj', S, 'apologize', { apology: { own: true, spec: true, nobut: true, change: true }, tone: 'warm', n: `Raj apologised to ${sn}, plainly and specifically, and promised to do differently.` }),
              fx: [flag('pa15-full'), { t: 'comm', d: 3 }, { t: 'self', c: 'raj', d: { security: 2 } }],
              res: [say('raj', 'I was wrong. About a great deal, and you know which. I am sorry. I will do differently.', 'tired')],
              branches: [{ when: (q) => q.scar('raj', S) < 6 || q.scar(S, 'raj') < 6, res: [say(S, '…Papa. I should have said — I should have said thank you a long time ago.', 'hurt'), nar('You stand, two men in a courtyard at dusk, saying things you taught each other not to say. It is awkward. It is the best thing that has happened all year.')] }, { when: () => true, res: [say(S, 'I hear you.', 'neutral'), say('raj', 'That is not “I forgive you.”', 'tired'), say(S, 'No. It is not. It is “I hear you.” It is what I have.', 'tired'), nar('It is not nothing. It is not a beginning, either. It is an honest place to stand.')] }],
            }),
            opt('with-but', '“I am sorry — but you must understand what it cost to hold this family together for forty years.”', {
              act: act('raj', S, 'apologize', { apology: { own: true, spec: true, nobut: false, change: false }, tone: 'neutral', n: `Raj apologised to ${sn} but explained that holding the family together had cost him.` }),
              fx: [flag('pa15-but')],
              res: [say('raj', 'I am sorry. But you must understand what it cost to hold this family together for forty years.', 'neutral'), nar(`${sn}’s face does something small. He has heard everything before the “but,” and none of it since.`)],
            }),
            opt('wait', 'Say nothing. They are the ones who owe you. “I will not be the first.”', {
              act: act('raj', S, 'absorb', { c: 'recognition', need: 0.95, n: 'Raj decided to wait for his children to apologise first.' }),
              fx: [flag('pa15-wait'), { t: 'self', c: 'raj', d: { security: -3 } }],
              res: [nar('You light the diyas yourself, in order, from left to right. Pooja watches you from the doorway. She does not say what she is thinking, and neither do you.')],
            }),
            opt('act-not-words', 'Say nothing, but give them something: take the first typed pages of the booklet. “I should like your opinion of Chapter Four.”', {
              act: act('raj', S, 'offer', { c: 'recognition', tone: 'warm', alt: true, hear: true, n: `Raj offered ${sn} the first pages of his booklet and asked for his opinion.` }),
              fx: [flag('pa15-gesture'), { t: 'bond', a: S, b: 'raj', d: { respect: 5, heard: 4 } }, learnFx(S, 'raj-booklet')],
              res: [say('raj', 'I should like your opinion of Chapter Four.', 'warm'), nar(`${sn} turns the pages slowly. He is looking for something in them and finds it. “Papa. This is — this is very good.”`)],
              branches: [{ when: hurtR, res: [say('raj', 'It is not an apology. It is the beginning of one.', 'tired')] }, { when: () => true, res: [nar('You are not sure either of you has understood that this is, in your family’s language, as good as it gets.')] }],
            }),
          ],
          witness: [th('Raj, in the courtyard, with the diyas still unlit: he has a drawer of letters and a lifetime of reasons. He is rehearsing a sentence with his shoulders.', 'tired')],
          witnessLearn: ['raj-letters'],
        },

        child: {
          who: S,
          stake: 'You have been right about many things this year, and cruel about a few of them. You know which.',
          reveals: [SECRET[S]],
          intro: [
            nar('The courtyard at dusk. The diyas are in a row along the wall, unlit. Papa is standing under the neem with his hands behind his back.'),
            ...iff(hurtR, th('There is a particular thing — you know exactly which — that you said, and cannot unsay. You have been waiting for him to apologise first. You have been waiting for a year.', 'hurt')),
            ...iff((q) => !hurtR(q), th('Things between you are better than they were. You are suspicious of it, as you are of any good weather.', 'worried')),
            th('You know what you were wrong about. You have rehearsed it in the car. You have not once rehearsed what to do if he says it first.', 'tired'),
            say('raj', 'You are early. Come and help me with the lamps.', 'neutral'),
          ],
          notice: [{ id: 'tree', kind: 'look', label: 'the neem tree', text: 'Three nail-marks, and the new one, lower, for the grandchild. There is a fifth mark, much higher, very faint: “Papa — 5’11”.” Someone has been measuring him too.' }],
          prompt: 'He is holding out a box of matches. Neither of you is lighting anything.',
          options: [
            opt('full', 'Say it plainly. “I was wrong about the dinner, and the wedding, and a lot else. I’m sorry. I’ll do it differently.”', {
              act: act(S, 'raj', 'apologize', { apology: { own: true, spec: true, nobut: true, change: true }, tone: 'warm', n: `${sn} apologised to Raj plainly and specifically.` }),
              fx: [flag('pa15-full'), { t: 'comm', d: 3 }],
              res: [say(S, 'I was wrong about the dinner, and the wedding, and a lot else. I’m sorry. I’ll do it differently.', 'hurt')],
              branches: [{ when: (q) => q.scar(S, 'raj') < 6 && q.scar('raj', S) < 6, res: [say('raj', 'I — yes. Thank you. And I am sorry too. For the table. For the wedding.', 'tired'), nar('Two men in a courtyard. One of them holds out a match. It is accepted.')] }, { when: () => true, res: [say('raj', 'I heard you.', 'neutral'), say(S, 'Is that all?', 'hurt'), say('raj', 'For tonight. It is a great deal.', 'tired')] }],
            }),
            opt('with-but', '“I’m sorry — but you have to see what it was like, being measured against everything you gave us.”', {
              act: act(S, 'raj', 'apologize', { apology: { own: true, spec: true, nobut: false, change: false }, tone: 'neutral', n: `${sn} apologised to Raj but explained how it felt to be measured against everything he had given.` }),
              fx: [flag('pa15-but')],
              res: [say(S, 'I’m sorry — but you have to see what it was like, being measured against everything you gave us.', 'hurt'), nar('He nods slowly. He has heard the “but,” and nothing before it.')],
            }),
            opt('wait', 'Say nothing. “I won’t be the first. It’s his turn.”', {
              act: act(S, 'raj', 'absorb', { c: 'recognition', need: 0.95, n: `${sn} decided to wait for Raj to apologise first.` }),
              fx: [flag('pa15-wait'), { t: 'self', c: S, d: { security: -3 } }],
              res: [nar('You light the lamps without a word. Papa lights his own. You do not speak. You stand next to each other, in the clean amber light, and you wait, and so does he.')],
            }),
            opt('ask-first', '“I’ll say sorry if you will. For all of it. At the same time.”', {
              act: act(S, 'raj', 'request', { c: 'recognition', tone: 'neutral', alt: true, hear: true, n: `${sn} proposed that he and Raj apologise to each other at the same time.` }),
              fx: [flag('pa15-trade')],
              res: [say(S, 'I’ll say sorry if you will. For all of it. At the same time.', 'worried')],
              branches: [{ when: (q) => q.bond('raj', S, 'trust') >= 55, fx: [{ t: 'bond', a: 'raj', b: S, d: { trust: 4, heard: 4, resentment: -4 } }, { t: 'bond', a: S, b: 'raj', d: { trust: 4, heard: 4, resentment: -4 } }], res: [say('raj', 'On three, then. Like children.', 'warm'), nar('It is absurd. You count. You both say it. You both laugh, once, and it is the first time you have laughed together in a year.')] }, { when: () => true, res: [say('raj', 'A trade. As at the bank.', 'stern'), nar('It is an apology made in the language of a ledger. Neither of you has the other language.')] }],
            }),
          ],
          witness: [th(`${sn}, in a courtyard at dusk: he has rehearsed a long speech in the car. He is about to find out how much of it is true.`, 'tired')],
          witnessLearn: [SECRET[S]],
        },

        alok: {
          who: 'alok',
          stake: 'You have been right and wrong this year, and you are not sure which hurts more.',
          reveals: ['alok-belong'],
          intro: [
            nar('The courtyard at dusk. You are on a ladder with a string of lights. Raj-uncle is at the foot of it, holding the matches.'),
            ...iff(alokWrong, th('There are two or three things you said this year that were true and should never have been said. You have kept them in a drawer, very neatly. They are heavier than they look.', 'hurt')),
            ...iff((q) => !alokWrong(q), th('You have kept out of most of it, this year. You are not sure whether that is wisdom or cowardice.', 'worried')),
            th('You know both sides now. It does not make it easier. It makes you sorry for both, and furious with the whole arrangement of a family, which asks the people it loves to wait for each other.', 'tired'),
          ],
          prompt: 'The lights are half up. You could do something — or hand the matches over and watch.',
          options: [
            opt('broker', 'Put the lights down. “Uncle — Vikram’s coming. Say it to him first. Not tonight. Now. Before he gets here.”', {
              act: act('alok', 'raj', 'support', { c: 'recognition', tone: 'warm', hear: true, n: 'Alok urged Raj to say it first, before his son arrived.' }),
              fx: [flag('pa15-alok-broker'), { t: 'comm', d: 1 }],
              res: [say('alok', 'Uncle, say it before he gets here. Not tonight. Now.', 'worried')],
              branches: [{ when: (q) => q.bond('raj', 'alok', 'trust') >= 70, res: [say('raj', 'You are a nuisance, Alok. And you are correct.', 'tired'), nar('He takes the matches into the house. You hear him dial.')] }, { when: () => true, res: [say('raj', 'You are young. These things are not done that way.', 'stern')] }],
            }),
            opt('own-apology', 'Climb down. Say to Raj: “Uncle, I said things this year that weren’t mine to say. I am sorry — for each.”', {
              when: alokWrong,
              act: act('alok', 'raj', 'apologize', { apology: { own: true, spec: true, nobut: true, change: true }, tone: 'warm', n: 'Alok apologised to Raj for the things he had said that were not his to say.' }),
              fx: [flag('pa15-alok-apologised'), { t: 'bond', a: 'vikram', b: 'alok', d: { resentment: -3, trust: 3 } }],
              res: [say('alok', 'Uncle, I said things this year that weren’t mine to say. I am sorry — for each.', 'hurt'), say('raj', 'You said them because you cared. That is not nothing.', 'tired'), say('alok', 'It is not enough. That is what I am saying.', 'worried')],
            }),
            opt('tell-both', 'Tell Raj, then his son, separately, what the other has told you. “He’s as afraid of this as you are.”', {
              act: [act('alok', 'raj', 'confide', { c: 'recognition', tone: 'warm', n: `Alok told Raj that ${sn} was as afraid of the apology as he was.` }), act('alok', S, 'confide', { c: 'recognition', tone: 'warm', n: `Alok told ${sn} that Raj was as afraid of the apology as he was.` })],
              fx: [flag('pa15-alok-told'), { t: 'comm', d: 1 }],
              res: [say('alok', 'He is as afraid of this as you are.', 'warm'), nar('It is true. It is the kind of truth that goes either way, and you have chosen, this once, to be the courier.')],
            }),
            opt('stay-out', 'Say nothing. Hang the lights. It is for them.', {
              act: act('alok', 'raj', 'absorb', { c: 'recognition', need: 0.5, n: 'Alok kept out of Raj’s apology to his son.' }),
              fx: [flag('pa15-alok-out')],
              res: [nar('The last bulb goes in. You switch on the string. The courtyard fills with small, warm light. It is beautiful. You are not sure it is yours.')],
            }),
          ],
          witness: [th('Alok, on the ladder: he has said things this year that were true and unforgivable. He would take most of them back. He suspects the family is the same: sorry for specific moments, and too proud to name them.', 'worried')],
          witnessLearn: ['alok-belong'],
        },
      },
      aftermathTime: 'night',
      aftermath: [
        nar('Night. The lamps are lit. The first rocket goes up over the lane.'),
        ...iff((q) => q.flag('pa15-full'), nar('Two men, side by side, watching the sparks. They are not touching. They are standing, nevertheless, in the same direction.')),
        ...iff((q) => q.flag('pa15-but'), nar('An apology has been made and received. Neither side is entirely certain it counted.')),
        ...iff((q) => q.flag('pa15-wait'), nar('The lamps are lit. Nobody has said anything. They stand a little apart, both waiting, and the evening goes by like a train.')),
        ...iff((q) => q.flag('pa15-gesture'), nar('Raj has put the booklet pages in his son’s coat pocket. Neither will mention them. They will be read tonight.')),
        ...iff((q) => q.flag('pa15-trade'), nar('Both laughed, once, at the same moment. They look, momentarily, like brothers.')),
        ...iff((q) => q.flag('pa15-alok-apologised'), say('pooja', 'It is rare for a person to apologise for the right thing. Alok did. Take note.', 'warm')),
        say('pooja', 'Light the last lamp, Raj. It is Diwali.', 'warm'),
        say('raj', 'Light it with me, beta.', 'neutral'),
      ],
    }
  },
}
