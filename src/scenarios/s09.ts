import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name

export const S09: ScenarioDef = {
  id: 's09', n: 9, title: 'The Sacrifice Argument', month: 'July',
  build: (c) => {
    const S = c.S, sn = N(S)
    const raw = (q: import('../sim/types').Q) => q.bond(S, 'raj', 'resentment') >= 24 || q.scar('raj', S) > 3 || q.flag('pb-harsh') || q.flag('pb-lock') || q.flag('mi-defended-public')
    return {
      where: 'dining-room', time: 'night',
      background: `Dinner, a week of monsoon, a long month of small arguments. Somebody has asked for something — a door to be knocked at, a rule to be bent, a Sunday to be skipped — and it has been heard as “you are in the way.” Raj puts down his spoon. ${sn} has just finished a sentence. The room waits.`,
      conflict: 'Raj has a ledger in his head: the fixed deposit, the fees, forty years at the bank, Pooja’s classes. He has never read it aloud. Tonight he might.',
      involved: ['raj', 'pooja', S, 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: 'You have never said what it cost. You have never been asked. You are very close to saying it in the worst possible way.',
          reveals: ['raj-lonely', 'raj-letters'],
          intro: [
            nar('The dal has gone cold. The monsoon is beating on the terrace you paid, eventually, to have mended.'),
            th(`“Our space.” “Our rules.” “Please, Papa, not at the table.” ${sn} has said all of it in the voice of a man being patient with an old person.`, 'hurt'),
            th('The ledger is there in your head, a clean double-entry: the fees, the weddings, the deposit that went abroad with someone, forty years of a bank’s door opening at ten. Pooja’s classes. The knee. And on the other side — you cannot find a figure.', 'tired'),
            nar('Pooja has put her hand flat on the table, as she does when she can feel you about to say something.'),
          ],
          notice: [{ id: 'letters', kind: 'memory', label: 'the letters in the almirah', text: 'One letter from each son, hostel years: “Papa, thank you for the money. Papa, I will make you proud.” You read them when you think you have failed. You have not told anyone that they exist.', fx: [insightFx('raj-letters')] }],
          prompt: 'The sentence is already in your mouth.',
          options: [
            opt('recite', 'Say all of it. “I gave you everything. Forty years. The deposit. Your mother’s classes. And I am told to knock.”', {
              act: act('raj', S, 'guilt', { c: 'recognition', tone: 'harsh', pub: ['pooja'], n: `Raj recited his sacrifices to ${sn}: the deposit, the fees, Pooja’s classes — “and I am told to knock.”` }),
              fx: [flag('sa-recited'), { t: 'bond', a: 'pooja', b: 'raj', d: { respect: -3, heard: -3 } }],
              res: [say('raj', 'I gave you everything. Forty years. The deposit. Your mother’s classes. And I am told to knock.', 'stern'), nar('Pooja closes her eyes. She had said she could never forgive herself for not stopping it. She had meant: you.'), say(S, 'Papa —', 'hurt')],
            }),
            opt('one-sentence', '“I gave it gladly. I did not know I needed to be thanked until I wasn’t.”', {
              act: act('raj', S, 'confide', { c: 'recognition', tone: 'warm', n: `Raj told ${sn} he had given gladly and had not known how much he needed to be thanked.` }),
              fx: [flag('sa-honest'), learnFx(S, 'raj-lonely'), { t: 'self', c: 'raj', d: { security: -3 } }],
              res: [say('raj', 'I gave it gladly. I did not know I needed to be thanked until I wasn’t.', 'tired'), nar('The room goes very quiet. It is not an accusation. It is the nearest thing to nakedness that Raj has ever done at this table.')],
            }),
            opt('swallow', 'Pick up the spoon. “It is nothing. Eat your dinner.”', {
              act: act('raj', S, 'absorb', { c: 'recognition', need: 0.9, n: 'Raj swallowed what he wanted to say about what he had given.' }),
              fx: [flag('sa-swallowed'), later('sourness', 2, [{ t: 'bond', a: 'raj', b: S, d: { resentment: 5, distance: 4 } }], [{ speaker: 'narrator', text: 'Raj has begun to keep a small notebook. Nobody has seen what is written in it.' }], { ifFlag: 'sa-swallowed' })],
              res: [say('raj', 'It is nothing. Eat your dinner.', 'neutral'), nar('He eats. The spoon is very steady. It is the steadiness that is frightening.')],
            }),
            opt('ask-thanks', '“I would like to be thanked. Once. That is all I want. I have not said it before.”', {
              act: act('raj', S, 'request', { c: 'recognition', tone: 'gentle', why: true, hear: true, n: `Raj asked ${sn} to thank him — once — for what he had given.` }),
              fx: [flag('sa-asked'), { t: 'comm', d: 2 }],
              res: [say('raj', 'I would like to be thanked. Once. That is all I want. I have never said it.', 'tired')],
              branches: [{ when: (q) => q.bond(S, 'raj', 'resentment') < 26, res: [say(S, 'Thank you, Papa. Truly. I should have said it ten years ago.', 'hurt'), nar('It is the first time. It is not the last time either, and you both know it.')] }, { when: () => true, res: [say(S, 'You want a thank-you. After this?', 'hurt'), nar('He did not mean it as a bargain. It lands as one.')] }],
            }),
          ],
          witness: [th('Raj, with his spoon down: he has a ledger. He keeps one letter from each son in the almirah and reads them when he thinks he has failed. If someone had asked, he would have said “nothing owed.” He would not have meant it.', 'tired')],
          witnessLearn: ['raj-letters', 'raj-lonely'],
        },

        child: {
          who: S,
          stake: 'You asked for something reasonable. You have just been handed a bill.',
          reveals: [SECRET[S]],
          enter: (q) => raw(q)
            ? [act('raj', S, 'guilt', { c: 'recognition', tone: 'harsh', pub: ['pooja'], n: `Raj recited his sacrifices to ${sn} at dinner.` })]
            : [act('raj', S, 'guilt', { c: 'recognition', tone: 'gentle', n: `Raj reminded ${sn} of what he and Pooja had given.` })],
          intro: [
            nar('The soup has stopped steaming. Papa has put his spoon down, with the exactness of a man making an entry.'),
            ...iff(raw, say('raj', 'I gave you everything. Forty years. The deposit. Your mother’s classes. And I am told to knock.', 'stern'), nar('He says it to the table. His voice does not rise. It is a list, with the heat of a coal.')),
            ...iff((q) => !raw(q), say('raj', 'I only say — we did a great deal. For all of you. It is worth remembering.', 'tired'), nar('He says it softly. It is almost worse.')),
            th('The deposit. The fees. You know all of it. You have never said thank you the way he wanted it said.', 'hurt'),
            th(S === 'kabir' ? 'It is your degree on the ledger. You have known it was there for eleven years.' : S === 'rohan' ? 'You are the middle one. The one who was never on the ledger at all — and you are not sure whether that is better.' : 'You have been the one who “did it right.” You have never been told so.', 'tired'),
          ],
          notice: [{ id: 'mother', kind: 'look', label: 'your mother’s hand', text: 'Flat on the table. She is pressing it down as if holding something under water. She is not looking at you, and she is not looking at Papa. She is looking at the dal.' }],
          prompt: 'He has finished. Everyone is looking at you.',
          options: [
            opt('retaliate', '“And what did you ask in return, Papa? Everything you gave, you gave with strings.”', {
              act: act(S, 'raj', 'accuse', { c: 'dignity', tone: 'harsh', pub: ['pooja'], n: `${sn} told Raj that everything he had given came with strings.` }),
              fx: [flag('sa-retaliated'), { t: 'bond', a: 'pooja', b: S, d: { resentment: 6, respect: -3 } }],
              res: [say(S, 'And what did you ask in return, Papa? Everything you gave came with strings.', 'stern'), nar('The sentence is true enough to be unforgivable. Pooja stands up, picks up a dish, and sits down again with nothing in her hands.')],
            }),
            opt('thank', '“You gave us everything, Papa. I don’t say thank you enough. I’m — thank you.”', {
              act: act(S, 'raj', 'thank', { c: 'recognition', tone: 'warm', hear: true, n: `${sn} thanked Raj, plainly, for what he had given.` }),
              fx: [flag('sa-thanked')],
              res: [say(S, 'You gave us everything. I don’t say thank you enough. Thank you, Papa.', 'hurt')],
              branches: [{ when: (q) => q.scar('raj', S) < 6, res: [say('raj', 'I — yes. Well. You are welcome.', 'tired'), nar('He looks, for a moment, as if someone has handed him back a coat he had left somewhere long ago.')] }, { when: () => true, res: [say('raj', 'Thank you. That is — thank you.', 'neutral'), nar('He says it like a man accepting a cheque he is not sure will clear.')] }],
            }),
            opt('walk-out', 'Push back your chair. “I can’t do this tonight.” And go out.', {
              act: act(S, 'raj', 'deflect', { c: 'recognition', tone: 'blunt', pub: ['pooja'], n: `${sn} walked out of the dinner when Raj listed his sacrifices.` }),
              fx: [flag('sa-walked'), { t: 'bond', a: 'raj', b: S, d: { heard: -3 } }],
              res: [nar('You walk out. The chair scrapes. In the passage you stand with your forehead against the cool wall and do not know where you are going.')],
            }),
            opt('ask-need', '“I know what you gave. Tell me what you need now. Not what you gave — what you need.”', {
              act: act(S, 'raj', 'listen', { c: 'recognition', tone: 'warm', hear: true, n: `${sn} asked Raj what he needed now, rather than what he had given.` }),
              fx: [flag('sa-asked-need'), learnFx(S, 'raj-lonely'), insightFx('raj-lonely')],
              res: [say(S, 'I know what you gave, Papa. Tell me what you need now. Not what you gave — what you need.', 'worried'), nar('He opens his mouth to say it is nothing. He does not.')],
              branches: [{ when: (q) => q.bond('raj', S, 'trust') >= 55, res: [say('raj', 'I need to be — someone in this house. Not a guest, and not a patient. Someone.', 'tired')] }, { when: () => true, res: [say('raj', 'It is late. Another time.', 'neutral'), nar('He is almost there. You can feel it, like a door that has been opened an inch.')] }],
            }),
          ],
          witness: [th(`${sn}, at the dinner table: he knows exactly what is on the ledger. He had not understood that his father would one day read it aloud, or that it would sound — in that voice, in that room — less like an account than a plea.`, 'hurt')],
          witnessLearn: [SECRET[S]],
        },

        alok: {
          who: 'alok',
          stake: 'You have been at this table for years without being on the ledger. You have your own opinion of what is owed.',
          reveals: ['alok-belong'],
          intro: [
            nar('You were asked to stay for dinner. You were the only one who ate fast, as if every mouthful might be taken away.'),
            th('Raj-uncle has put his spoon down. You know that gesture. It is the one he used when he was a bank manager and a loan had been refused.', 'worried'),
            th('You know what he gave. You were one of the things he gave it to.', 'tired'),
          ],
          notice: [{ id: 'pooja', kind: 'memory', label: 'Aunty’s classes', text: 'The year Kabir went abroad, Pooja-aunty stopped teaching. She said her eyes. Raj paid for new spectacles. She did not start again. You were twelve and she was teaching you to thread a needle; you remember that she stopped mid-stitch.', fx: [learnFx('alok', 'pooja-sacrificed'), insightFx('pooja-sacrificed')] }],
          prompt: 'The room is waiting for someone to say something. It is not clear who.',
          options: [
            opt('defend-raj', `Turn to ${sn}: “He gave everything. You could at least say thank you.”`, {
              act: [act('alok', S, 'accuse', { c: 'recognition', tone: 'blunt', pub: ['raj', 'pooja'], n: `Alok told ${sn} at the table that he should be thankful.` }), act('alok', 'raj', 'defend', { vs: S, tone: 'warm', n: `Alok took Raj’s side at dinner.` })],
              fx: [flag('sa-alok-defended'), { t: 'bond', a: S, b: 'alok', d: { resentment: 6, respect: -4 } }],
              res: [say('alok', 'He gave everything. You could at least say thank you.', 'stern'), say(S, 'Nobody asked you.', 'stern'), nar('Nobody did. It sits on the table like a dropped plate.')],
            }),
            opt('remind-sons', 'Say, quietly: “Aunty gave up her classes for this. Nobody thanked her either.”', {
              when: (q) => q.knows('alok', 'pooja-sacrificed'),
              act: act('alok', S, 'listen', { c: 'recognition', tone: 'gentle', hear: true, n: 'Alok reminded the family that Pooja had given up her classes and been thanked by no one.' }),
              fx: [flag('sa-alok-reminded'), learnFx(S, 'pooja-sacrificed')],
              res: [say('alok', 'Aunty gave up her classes for this. Nobody thanked her either.', 'worried'), nar('Everyone looks at Pooja. She looks at the dal. Her hand, very slowly, comes off the table.')],
            }),
            opt('defuse', 'Take the dish of rice round: “Aunty, this is the best you’ve made. Please, someone, tell me what is in it?”', {
              act: act('alok', 'raj', 'deflect', { c: 'recognition', tone: 'warm', n: 'Alok broke the silence at dinner by praising the rice.' }),
              fx: [flag('sa-alok-defused')],
              res: [say('alok', 'Aunty, this rice — what is in it? Please, tell me.', 'warm'), say('pooja', 'It is only cumin, Alok.', 'tired'), nar('A tiny pause. Then the clink of a spoon. You have bought four minutes. It was something.')],
            }),
            opt('call-out', '“Stop keeping accounts, all of you. Nobody here is a creditor.”', {
              act: ['raj', S].map((x) => act('alok', x as CharacterId, 'accuse', { c: 'dignity', tone: 'blunt', n: `Alok told ${N(x as CharacterId)} to stop keeping accounts.` })),
              fx: [flag('sa-alok-callout')],
              res: [say('alok', 'Stop keeping accounts, all of you. Nobody here is a creditor.', 'stern'), nar('Raj looks at you for a long moment. Then at his son. Then at the dal. He has never been spoken to like that at his own table, and he is not quite certain he minds.')],
            }),
          ],
          witness: [th('Alok, at the table: he was once on the ledger himself — school fees, never mentioned. He cannot say which side he sits on tonight. He does not think there are sides, only a very old unpaid kindness that has turned into something harder.', 'worried')],
          witnessLearn: ['pooja-sacrificed'],
        },
      },
      aftermathTime: 'night',
      aftermath: [
        nar('Later, the dishes. The monsoon has moved to the next lane.'),
        ...iff((q) => q.flag('sa-recited'), nar('Nobody has spoken since the word “knock.” The knock has been added to the family’s vocabulary like an old scar.')),
        ...iff((q) => q.flag('sa-honest') || q.flag('sa-asked') || q.flag('sa-asked-need'), nar('Raj is on the balcony. He is not alone. It is, for him, a considerable event.')),
        ...iff((q) => q.flag('sa-thanked'), nar('Raj has said nothing about the thanks. But the notebook he keeps on the hall table has been moved, and the tea has come with two biscuits instead of one.')),
        ...iff((q) => q.flag('sa-swallowed'), nar('Raj goes to bed early. The notebook goes with him.')),
        ...iff((q) => q.flag('sa-retaliated'), say('pooja', 'I do not know which of you I am more ashamed of.', 'stern')),
        ...iff((q) => q.flag('sa-alok-defended'), nar('The sons have not spoken to Alok since. Raj has not thanked him either.')),
        ...iff((q) => q.flag('sa-alok-reminded'), say('pooja', 'I have not been thanked in a long time. I had not noticed until just now.', 'tired')),
        say('raj', 'We said what we said.', 'tired'),
      ],
    }
  },
}
