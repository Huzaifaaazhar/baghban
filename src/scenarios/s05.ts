import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, later, nar, opt, say, th, WIFE_SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const KID: Record<string, { k: string; age: string; rule: string; quirk: string }> = {
  vikram: { k: 'Tia', age: 'nine', rule: 'no sweets on weekdays, and no marks talk at the table', quirk: 'Pooja slips Tia a laddoo before dinner, and Raj has begun quizzing Aarav on percentages over the dal' },
  rohan: { k: 'Ira', age: 'two', rule: 'Ira has to learn to settle herself to sleep', quirk: 'Pooja carries Ira everywhere so that she never cries, and Simran’s sleep-training collapses every evening at six' },
  kabir: { k: 'Anvi', age: 'six days old', rule: 'no oil massage and no visitors in the first week, on the paediatrician’s advice', quirk: 'Pooja massages Anvi with warm mustard oil every morning and wants her kept indoors for forty days' },
}

export const S05: ScenarioDef = {
  id: 's05', n: 5, title: 'Grandchildren', month: 'March',
  build: (c) => {
    const S = c.S, sn = N(S), W = c.SW, wn = N(W), K = KID[S], kid = K.k
    const trusts = (q: import('../sim/types').Q) => q.bond(W, 'pooja', 'trust') >= 55
    return {
      where: 'living-room', time: 'afternoon',
      background: `${kid} is ${K.age}. ${wn} and ${sn} have rules for ${kid}: ${K.rule}. ${K.quirk}. Neither side thinks it is breaking anything; both think they are being kind.`,
      conflict: `Pooja is trying to love ${kid} the way she knows. ${wn} is trying to bring ${kid} up the way she has chosen. Raj is quietly on Pooja’s side and says it as a joke.`,
      involved: ['pooja', 'raj', S, W, 'alok'],
      lenses: {
        parent: {
          who: 'pooja',
          stake: `You are holding the one thing in this house that still needs you. You do not want to be told how.`,
          reveals: ['pooja-excluded'],
          intro: [
            nar(`${kid} is asleep against your shoulder, or very nearly. ${wn} has gone to the kitchen to “answer a call,” which you know is a way of leaving the room.`),
            th(`${K.quirk.charAt(0).toUpperCase() + K.quirk.slice(1)}. Both of those are true. Both of those are love. You do not understand why the second feels like a crime.`, 'worried'),
            th('When the boys were small, no one gave you a list. You were handed a house and told to be sensible. Now there is a list on the fridge in someone else’s neat hand, and the word “Mummyji” is written next to the rules, as if you were a topic.', 'hurt'),
            say(S, 'Mummy — a minute? About ' + kid + '.', 'worried'),
          ],
          notice: [
            { id: 'fridge', kind: 'look', label: 'the list on the fridge', text: `${wn}’s handwriting: the rules, and at the bottom, in smaller letters, “Ask Mummyji to check with us first.” It is polite. It is a fence.` },
            { id: 'cupboard', kind: 'look', label: 'your cupboard', text: 'In the corner of the steel almirah, a tin of the sweets you give ' + kid + ' when no one is looking. You did not know you were hiding them until you saw how well they were hidden.' },
          ],
          prompt: `${sn} is standing in the doorway. ${kid} stirs.`,
          options: [
            opt('keep-quietly', 'Smile, agree, and go on doing it when no one is looking.', {
              act: act('pooja', W, 'withhold', { c: 'autonomy', tone: 'gentle', n: `Pooja agreed to ${wn}’s rules for ${kid} and went on breaking them privately.` }),
              fx: [flag('gc-secret'), later('caught', 1, [{ t: 'bond', a: W, b: 'pooja', d: { trust: -9, resentment: 6 } }, flag('gc-caught')], [{ speaker: W, text: 'I found the wrapper. It isn’t the sweet. It’s that you looked me in the face.' }], { ifFlag: 'gc-secret' })],
              res: [say('pooja', 'Of course, beta. Whatever you and ' + wn + ' say.', 'warm'), nar(`You say it fondly, and you mean it exactly as much as you meant it with the boys when they said they’d be home by nine.`)],
            }),
            opt('ask-rules', '“Tell me the rules, beta — I’ll follow them. But let me have one thing with her that is mine.”', {
              act: act('pooja', W, 'compromise', { c: 'autonomy', alt: true, hear: true, tone: 'warm', n: `Pooja asked for ${wn}’s rules, and for one thing that was hers to do with ${kid}.` }),
              fx: [flag('gc-rules'), { t: 'agree', id: 'gc-rules', between: ['pooja', W], text: `Pooja follows ${wn}’s rules for ${kid} and has one ritual of her own.` }],
              res: [say('pooja', 'Tell me the rules, beta. I’ll follow them. But let me have one thing with her that’s mine.', 'tired')],
              branches: [
                { when: trusts, res: [say(W, 'Bedtime songs. The ones you sang the boys. I’d like her to have those.', 'warm'), nar('Something in your throat gives way.')] },
                { when: () => true, res: [say(W, 'I — will think about what that could be, Mummyji.', 'neutral'), nar('It is not a refusal. It is a woman checking whether you are still holding something behind your back.')] },
              ],
            }),
            opt('insist', '“I raised three of you. Who do you think knows better?”', {
              act: act('pooja', W, 'dismiss', { c: 'autonomy', own: 'tradition', need: 0.8, tone: 'blunt', n: `Pooja told ${wn}: “I raised three of you — who knows better?”` }),
              fx: [flag('gc-insist')],
              res: [say('pooja', 'I raised three of you. Who do you think knows better?', 'stern'), nar(`There is a very quiet moment. ${sn} says “Mummy,” in the voice he used at fourteen; ${wn} says nothing at all.`)],
            }),
            opt('withdraw-hurt', '“Fine. I won’t touch her. What am I for, then?”', {
              act: act('pooja', W, 'guilt', { c: 'belonging', tone: 'gentle', n: `Pooja said: “If I’m not allowed to hold ${kid}, what am I for?”` }),
              fx: [flag('gc-guilt'), { t: 'self', c: 'pooja', d: { security: -3 } }],
              res: [say('pooja', 'Fine. I won’t touch her. What am I for, then?', 'hurt'), say(S, 'Mummy, nobody said that.', 'worried'), nar('She said it softly, which is why it lands so hard.')],
            }),
          ],
          witness: [th(`Pooja, with ${kid} against her shoulder: the sweets and the oil are not about sugar or skin. They are what she has instead of a role. She does not know how to ask for a smaller one.`, 'tired')],
          witnessLearn: ['pooja-excluded'],
        },
        child: {
          who: S,
          stake: `${wn} has her rules and your mother has her habits, and you are the corridor between them.`,
          reveals: [WIFE_SECRET[W]],
          intro: [
            nar(`${kid} is on your mother’s shoulder. ${wn} is in the kitchen, with a hand flat on the counter, breathing in a particular way.`),
            th(`${wn} said it plainly: “I am not asking her to stop loving ${kid}. I’m asking her to stop deciding.”`, 'worried'),
            th('You remember Mummy’s hands when you had a fever, how competent they were. You remember being very small in a house where someone always knew what to do. You miss it, and you cannot tell which of you it was safe for.', 'tired'),
          ],
          notice: [{ id: 'frame', kind: 'look', label: 'your mother’s face', text: 'When ' + wn + ' went into the kitchen, Mummy’s hands tightened on ' + kid + ' and then, very carefully, loosened. She is trying to hold on without gripping.' }],
          prompt: `Mummy is looking at ${kid}. ${wn} is not looking at anyone.`,
          options: [
            opt('rules-firmly', '“Mummy, these are our rules for ' + kid + '. Please — no exceptions, no secret sweets.”', {
              act: act(S, 'pooja', 'refuse', { c: 'belonging', own: 'autonomy', need: 0.85, tone: 'blunt', n: `${sn} told Pooja the rules for ${kid} were not up for discussion.` }),
              fx: [flag('gc-firm'), { t: 'bond', a: W, b: S, d: { trust: 3, respect: 2 } }],
              res: [say(S, 'Mummy, these are our rules for ' + kid + '. No exceptions. No secret sweets.', 'stern'), say('pooja', 'I only —', 'hurt'), nar('You know she was going to say “I only wanted to help.” You did not want to hear it.')],
            }),
            opt('give-role', '“Mummy — there’s one thing I’d like you to do for her that nobody else can. Will you take it on?”', {
              act: act(S, 'pooja', 'offer', { c: 'belonging', alt: true, hear: true, tone: 'warm', n: `${sn} gave Pooja a role of her own with ${kid}.` }),
              fx: [flag('gc-role'), { t: 'agree', id: 'gc-rules', between: ['pooja', S], text: `Pooja has a part of ${kid}’s day that is hers: songs, stories, and the first walk.` }],
              res: [say(S, 'Mummy, there’s something I’d like you to do that nobody else can. Will you take it on?', 'hopeful'), say('pooja', 'Tell me.', 'hopeful')],
              branches: [{ when: trusts, res: [say(S, `Bedtime songs. Every night. ${wn} agrees.`, 'warm'), say(W, 'I do.', 'warm')] }, { when: () => true, res: [say(S, 'Bedtime songs. And the first walk. We’ll work out the rest.', 'neutral'), say(W, '…Songs I can live with.', 'tired')] }],
            }),
            opt('avoid', 'Smile at everyone, leave it. It’s only sweets. It’s only oil.', {
              act: act(S, W, 'absorb', { c: 'autonomy', need: 0.7, n: `${sn} left ${wn} to cope with the grandparents’ rule-breaking alone.` }),
              fx: [flag('gc-avoid')],
              res: [nar('You say “it’s nothing,” to the room in general. In the kitchen, the tap goes on and stays on.')],
            }),
            opt('ask-wife-bend', `Go to the kitchen: “${wn}, please — let it go this once. She means well.”`, {
              act: act(S, W, 'impose', { c: 'autonomy', own: 'belonging', need: 0.6, tone: 'gentle', n: `${sn} asked ${wn} to let his mother’s rule-breaking go.` }),
              fx: [flag('gc-bend')],
              res: [say(S, wn + ', please. Let it go this once. She means well.', 'worried'), say(W, 'She always means well. That is exactly the difficulty.', 'tired')],
            }),
          ],
          witness: [th(`${sn} in the doorway, watching his mother hold his child, and his wife not watch. He wants it all to be simple. It has been simple for him for years — because the two women who made it complicated were being polite.`, 'tired')],
          witnessLearn: [WIFE_SECRET[W]],
        },
        alok: {
          who: 'alok',
          stake: 'You came to see ' + kid + ' and found yourself in the middle of something older than you.',
          reveals: ['alok-belong'],
          intro: [
            nar(`You are on the floor with ${kid}’s toy blocks. You see Pooja-aunty’s hand go, very slowly, to the sweet tin in the cupboard.`),
            th(`You see ${wn} see it. She says nothing. You see her decide to say nothing.`, 'worried'),
          ],
          prompt: 'You are holding a wooden block and a family’s whole silence.',
          options: [
            opt('report', `Later, tell ${wn} quietly what you saw.`, {
              act: [act('alok', W, 'confide', { c: 'honesty', tone: 'gentle', n: `Alok told ${wn} about Pooja’s sweets.` }), act('alok', 'pooja', 'intrude', { c: 'dignity', tone: 'gentle', n: 'Alok reported Pooja to her daughter-in-law.' })],
              fx: [flag('gc-alok-reported'), { t: 'bond', a: 'pooja', b: 'alok', d: { trust: -6, respect: -2 } }],
              res: [say('alok', `${wn} — Aunty gave ${kid} sweets again. I thought you’d want to know.`, 'worried'), say(W, 'Thank you. I — I wish I didn’t.', 'tired')],
            }),
            opt('cover', 'Look away and say nothing. It’s not yours to police.', {
              act: act('alok', W, 'withhold', { c: 'honesty', tone: 'gentle', n: 'Alok saw Pooja’s sweets and said nothing to the child’s mother.' }),
              fx: [flag('gc-alok-covered')],
              res: [nar('You build the tower another block higher. It is steady. You are surprised.')],
            }),
            opt('suggest-role', 'Say to Pooja: “Aunty, ' + kid + ' loves the songs you hum. Will you teach them to me?”', {
              act: act('alok', 'pooja', 'offer', { c: 'belonging', alt: true, tone: 'warm', n: 'Alok asked Pooja to teach him her songs, in front of the child.' }),
              fx: [flag('gc-alok-role')],
              res: [say('alok', 'Aunty, ' + kid + ' loves it when you hum. Will you teach me the song?', 'hopeful'), say('pooja', 'Oh, it’s just an old one.', 'warm'), nar('She sings it. Not for the child. For you. It is the first time she has sung in front of anyone in a year.')],
            }),
            opt('side-with-w', 'Say, lightly: “Aunty, the doctor’s rules are the doctor’s rules.”', {
              act: act('alok', 'pooja', 'accuse', { c: 'tradition', tone: 'blunt', n: 'Alok told Pooja to respect the rules for the child.' }),
              fx: [flag('gc-alok-corrected')],
              res: [say('alok', 'Aunty, the rules are the rules.', 'stern'), say('pooja', 'Since when do you hand out rules in this house?', 'hurt')],
            }),
          ],
          witness: [th(`Alok, on the floor with blocks: he sees both women, and what each will not say. He knows what it is to want to be needed. He does not know what it is to be the one who must decide how much.`, 'worried')],
          witnessLearn: ['pooja-excluded'],
        },
      },
      aftermathTime: 'evening',
      aftermath: [
        nar(`${kid} is asleep, finally. The house exhales.`),
        ...iff((q) => q.flag('gc-rules') || q.flag('gc-role'), nar(`From the next room, Pooja’s voice, low and cracked and sure, singing. ${wn} is standing in the doorway with her arms folded and her eyes closed.`)),
        ...iff((q) => q.flag('gc-secret'), nar('Nobody mentions the sweets. The tin is a little emptier.')),
        ...iff((q) => q.flag('gc-insist') || q.flag('gc-firm'), nar('Pooja takes her handloom shawl and goes up to the roof. It is not cold.')),
        ...iff((q) => q.flag('gc-guilt'), say('raj', 'What did you say to her?', 'worried'), nar('Raj’s question is for the room. The room does not answer.')),
        ...iff((q) => q.flag('gc-avoid'), nar(`${wn} loads the dishwasher with great force. ${sn} says “need a hand?” and is told, brightly, that it is fine.`)),
        ...iff((q) => q.flag('gc-bend'), nar(`${wn} has said “it’s fine” four times this evening. None of them was.`)),
        ...iff((q) => q.flag('gc-alok-reported'), nar('Pooja has noticed that you and her daughter-in-law have been speaking. She says nothing.')),
        say('raj', 'A child needs everybody. That is the whole of it.', 'neutral'),
      ],
    }
  },
}
