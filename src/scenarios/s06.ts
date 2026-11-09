import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const REASON: Record<string, string> = {
  vikram: 'a client review that cannot be moved, and Meera is worn out from a month of term-end marking',
  rohan: 'no money for a present, and a dread of Papa’s kind questions about the studio',
  kabir: 'Ananya is six weeks past the birth, Anvi is fussing, and Kabir cannot face the deposit conversation again',
}
const ESC: Record<string, string> = {
  vikram: 'I have a client review, Mummy. It’s completely unmovable.',
  rohan: 'We’re — the studio has a deadline, Mummy. You know how it is.',
  kabir: 'Anvi’s been up all night, Mummy. Maybe next time?',
}

export const S06: ScenarioDef = {
  id: 's06', n: 6, title: 'Family Gathering', month: 'April',
  build: (c) => {
    const S = c.S, sn = N(S)
    const withdrawn = (q: import('../sim/types').Q) => q.flag('raj-withdrawn')
    return {
      where: 'dining-room', time: 'afternoon',
      background: 'Raj turns sixty-two on Sunday. For thirty years the whole family has lunched together on his birthday. Pooja has been phoning round for a week. Everyone has said “of course,” in the voice people use when they mean “I will try.”',
      conflict: 'The sons have reasons for not coming. Raj has told Pooja “don’t make a fuss.” Both things are true, and neither means what it says.',
      involved: ['raj', 'pooja', S, 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: 'You have said you want nothing. You have checked the phone eleven times since noon.',
          reveals: ['raj-letters', 'raj-lonely'],
          intro: [
            nar('The dining table has been extended for the first time in three years. Pooja has polished the leaves. Nobody has said what they are for.'),
            ...iff(withdrawn, th('You have stopped typing. You told everyone it was your eyes. You did not tell them it was that nobody had asked.', 'tired')),
            th('In the steel almirah is a letter from each son, from hostel years. You read them when you think you have failed. You read them last night.', 'tired'),
            say('pooja', 'I have laid places for all of them. Don’t say anything, Raj.', 'worried'),
            say('raj', 'I have said nothing. I said to make no fuss.', 'stern'),
            nar('She looks at you for a long time. She knows exactly what that sentence is.'),
          ],
          notice: [{ id: 'phone', kind: 'look', label: 'your phone', text: 'Eleven glances at it since noon. Not one message. You tell yourself it is on silent. It is not.' }],
          prompt: 'Places for everyone. The phone is silent. It is half past one.',
          options: [
            opt('text-sons', 'Pick up the phone yourself. “I would like you to come. That is all.”', {
              act: ['vikram', 'rohan', 'kabir'].map((b) => act('raj', b as CharacterId, 'confide', { c: 'belonging', tone: 'warm', n: `Raj told ${N(b as CharacterId)} he wanted him at the table.` })),
              fx: [flag('gt-asked'), { t: 'attend', d: 1 }, { t: 'self', c: 'raj', d: { security: -2 } }],
              res: [say('raj', 'I would like you to come. That is all.', 'tired'), nar('You send the message three times, to three sons. Then you put the phone face-down and cannot look at it. Pooja, silent, puts her hand over yours.')],
            }),
            opt('pretend', '“I told you not to make a fuss. Let them be. They have their own lives.”', {
              act: act('raj', 'pooja', 'absorb', { c: 'belonging', need: 0.9, n: 'Raj said he wanted no fuss and told no one he wanted his sons there.' }),
              fx: [flag('gt-pretend'), { t: 'attend', d: -1 }, later('empty', 1, [{ t: 'self', c: 'raj', d: { security: -4 } }], [{ speaker: 'narrator', text: 'Raj has not mentioned his birthday since. He has been very precise about the dal.' }])],
              res: [say('raj', 'I told you. No fuss. Let them be. They have their own lives.', 'stern'), nar('Pooja says nothing. She rearranges the cutlery, which is a way of agreeing with something you have not said.')],
            }),
            opt('guilt-call', 'Phone the eldest yourself: “Sixty-two years, and one afternoon is too much to ask?”', {
              act: act('raj', 'vikram', 'guilt', { c: 'belonging', tone: 'blunt', n: 'Raj phoned Vikram: “Sixty-two years, and one afternoon is too much to ask?”' }),
              fx: [flag('gt-guilt'), { t: 'attend', d: 0 }],
              res: [say('raj', 'Sixty-two years, and one afternoon is too much to ask?', 'stern'), say('vikram', '(on the phone) Papa, that isn’t fair —', 'hurt'), nar('You hang up first. Nobody wins a phone call like that. You sit with the dial tone.')],
            }),
            opt('ask-pooja', 'Say to Pooja, very quietly: “Ask them to come for an hour. Just an hour. Tell them I said so.”', {
              act: act('raj', 'pooja', 'confide', { c: 'belonging', tone: 'warm', alt: true, n: 'Raj asked Pooja to invite the sons for just an hour.' }),
              fx: [flag('gt-hour'), { t: 'attend', d: 1 }],
              res: [say('raj', 'Ask them for an hour. Just an hour. Tell them I said so.', 'tired'), say('pooja', 'I’ll say you asked.', 'warm'), nar('It is the first time in thirty-seven years that she has heard the word “asked” from you in that voice.')],
            }),
          ],
          witness: [th('Raj, at the extended table: he has said “no fuss” so many times that he no longer remembers what it was protecting. He is not proud of the way he has checked the phone.', 'tired')],
          witnessLearn: ['raj-lonely'],
        },

        child: {
          who: S,
          stake: `You have a reason for not coming and you are not sure it is a good one. ${REASON[S]}`,
          reveals: [SECRET[S]],
          intro: [
            nar('Your phone lights up: “Mummy.” Then, a minute later: “Papa’s birthday.” Then nothing, which is worse.'),
            th(REASON[S].charAt(0).toUpperCase() + REASON[S].slice(1) + '.', 'tired'),
            th('You also remember: eight years old, Papa at the door of the school hall in his bank suit, the only father who had left work early. He never said it was for you.', 'tired'),
            say('pooja', '(on the phone) Beta — we’re at one. Your father said not to fuss. Which means come.', 'warm'),
          ],
          notice: [{ id: 'chat', kind: 'look', label: 'the family chat', text: 'Three unread from Pooja. Two from Vikram: “Are you going?” and, an hour later, “I probably can’t.” Rohan: a thumbs-up and nothing. Kabir has typed something and deleted it, twice.' }],
          prompt: 'The phone is in your hand. It is five past one.',
          options: [
            opt('real-reason', '“Mummy, I want to come. The truth is — ' + (S === 'vikram' ? 'I’m worn out and Meera is too' : S === 'rohan' ? 'I can’t afford a present and I can’t face being asked about the studio' : 'Ananya hasn’t slept and I can’t face the deposit conversation again') + '.”', {
              act: act(S, 'pooja', 'confide', { c: 'honesty', tone: 'warm', n: `${sn} told his mother the real reason he was struggling to come.` }),
              fx: [flag('gt-honest'), { t: 'attend', d: 0 }, { t: 'self', c: S, d: { finStress: -2, security: 2 } }],
              res: [say(S, 'I want to come, Mummy. The truth is…', 'worried'), nar('You say it. It takes a minute. She does not interrupt, which is not like her.')],
              branches: [
                { when: (q) => q.bond('pooja', S, 'trust') >= 55, fx: [{ t: 'attend', d: 1 }], res: [say('pooja', 'Then come as you are, beta. In your old kurta. For one hour. Your father will understand.', 'warm')] },
                { when: () => true, res: [say('pooja', '…I see. I’ll tell your father.', 'tired'), nar('She says it as someone carrying a message she does not want to deliver.')] },
              ],
            }),
            opt('polite-excuse', `“${ESC[S]}”`, {
              act: act(S, 'pooja', 'deflect', { c: 'honesty', tone: 'gentle', n: `${sn} gave his mother a polite excuse for missing Raj’s birthday.` }),
              fx: [flag('gt-excuse'), { t: 'attend', d: -1 }, later('excuse', 2, [{ t: 'bond', a: 'raj', b: S, d: { distance: 4, heard: -2 } }], [{ speaker: 'raj', text: 'It is all right. Everyone is busy. It was only a lunch.' }])],
              res: [say(S, ESC[S], 'worried'), say('pooja', 'Of course, beta. Of course.', 'warm'), nar('You hear the plates move in the background. She is putting one back in the cupboard.')],
            }),
            opt('come-resentfully', 'Go. Say nothing about why you don’t want to be there.', {
              act: act(S, 'raj', 'concede', { c: 'belonging', tone: 'blunt', n: `${sn} came to the birthday but made it clear he did not want to be there.` }),
              fx: [flag('gt-resentful'), { t: 'attend', d: 1 }, { t: 'bond', a: S, b: 'raj', d: { resentment: 4 } }],
              res: [nar('You arrive at one-fifty, check your phone twice before the soup, and leave at 2:40. Papa says “thank you for coming.” It is the most formal sentence he has ever spoken to you.')],
            }),
            opt('counter-offer', '“I can’t do the lunch — can I come at five, with a cake, for chai? Just us.”', {
              act: act(S, 'pooja', 'compromise', { c: 'belonging', alt: true, why: true, hear: true, tone: 'warm', n: `${sn} couldn’t make the lunch but offered tea and cake at five.` }),
              fx: [flag('gt-counter'), { t: 'attend', d: 1 }],
              res: [say(S, 'I can’t do the lunch. Can I come at five with a cake? For chai. Just us.', 'hopeful'), say('pooja', 'Come at five. I’ll keep the chai hot.', 'warm')],
            }),
          ],
          witness: [th(`${sn}, with his phone: he wants to go. He has a good reason not to. He does not know that his father has checked the phone eleven times and told no one.`, 'worried')],
          witnessLearn: [SECRET[S]],
        },

        alok: {
          who: 'alok',
          stake: 'You know who is not coming. You have been told everything and trusted with none of it.',
          reveals: ['alok-belong'],
          intro: [
            nar('You are folding napkins at Verma Sadan. The extended table has been laid for eleven. You count: two, and you.'),
            th('Pooja-aunty said it three times to the phone: “Of course, beta. Of course.” She put the receiver down very gently each time, as if it might bruise.', 'worried'),
            th('Raj-uncle is pretending to read the paper. It is upside down.', 'worried'),
            nar('You could make some calls. You are not anyone’s child. You are, however, very good on the phone.'),
          ],
          notice: [{ id: 'raj-gift', kind: 'look', label: 'Raj’s paper', text: 'The newspaper is yesterday’s. Under it, a small wrapped parcel with a ribbon he has re-tied twice. He sees you looking and puts the paper over it.', fx: [learnFx('alok', 'raj-gift'), insightFx('raj-gift')] }],
          prompt: 'Eleven places. Three sons. One phone.',
          options: [
            opt('press', 'Phone the sons yourself. “He’s sixty-two. Come. It is not complicated.”', {
              act: ['vikram', 'rohan', 'kabir'].map((b) => act('alok', b as CharacterId, 'accuse', { c: 'belonging', own: 'fairness', need: 0.5, tone: 'blunt', n: `Alok phoned ${N(b as CharacterId)} to tell him to come to the birthday.` })),
              fx: [flag('gt-alok-pressed'), { t: 'attend', d: 0 }, { t: 'bond', a: 'vikram', b: 'alok', d: { resentment: 6, respect: -4 } }],
              res: [say('alok', 'He’s sixty-two. Come. It is not complicated.', 'stern'), nar('Three calls. Three polite silences. Two “of course”s. One “who are you to tell me?”')],
            }),
            opt('adapt', 'Offer to bring everything round to a smaller table: “Aunty, a quiet tea at five instead. Shorter. Easier to come to.”', {
              act: act('alok', 'pooja', 'offer', { c: 'belonging', alt: true, tone: 'gentle', n: 'Alok suggested replacing the lunch with a shorter tea at five.' }),
              fx: [flag('gt-alok-adapt'), { t: 'attend', d: 1 }],
              res: [say('alok', 'Aunty — what about tea at five instead? Shorter. Easier to come to.', 'hopeful'), say('pooja', 'He will say it isn’t his birthday if it isn’t lunch.', 'tired'), say('alok', 'Then let him say it, and let them come.', 'warm')],
            }),
            opt('tell-raj', 'Go to Raj. “Uncle, they aren’t coming because they are afraid of disappointing you. Not because they don’t want to.”', {
              act: act('alok', 'raj', 'confide', { c: 'belonging', tone: 'warm', n: 'Alok told Raj the sons were afraid of disappointing him.' }),
              fx: [flag('gt-alok-told'), { t: 'attend', d: 0 }],
              res: [say('alok', 'Uncle, they’re afraid of disappointing you. It’s not that they don’t want to.', 'worried'), say('raj', 'Is that what you think?', 'hurt'), nar('He folds the paper. “You are very young, Alok.” It is not unkind. It is not wrong.')],
            }),
            opt('stay-out', 'Fold the napkins. It is not your birthday, or your family.', {
              act: act('alok', 'raj', 'absorb', { c: 'belonging', need: 0.6, n: 'Alok kept to himself that the sons were not coming.' }),
              fx: [flag('gt-alok-silent'), { t: 'attend', d: -1 }],
              res: [nar('You fold eleven napkins into the shape of birds. They look like a flock waiting for a signal.')],
            }),
          ],
          witness: [th('Alok, among the napkins: Pooja-aunty is on the phone putting a lid on her disappointment. Raj-uncle is reading a newspaper from yesterday, upside down. Alok has never so badly wanted to be someone’s son.', 'worried')],
          witnessLearn: ['raj-lonely'],
        },
      },
      aftermathTime: 'evening',
      aftermath: [
        nar('Evening. The extended table has been shortened again.'),
        ...iff((q) => Number(q.fact('gather_attendance') ?? 0) >= 0.99, nar('All three sons came, and their wives, and the children. The house is a kind of noise it has not been since the roof. Raj is, for forty minutes, a man at the head of a table.')),
        ...iff((q) => { const a = Number(q.fact('gather_attendance') ?? 0); return a >= 0.6 && a < 0.99 }, nar('Two of the three sons came. The third phoned from the car park and stayed on the line while the candles were lit. Everybody pretended not to mind.')),
        ...iff((q) => { const a = Number(q.fact('gather_attendance') ?? 0); return a > 0.1 && a < 0.6 }, nar('One son, briefly. He sat at the corner, checked his watch, and left before the sweet. Pooja packed his share in a tiffin he did not stay to take.')),
        ...iff((q) => Number(q.fact('gather_attendance') ?? 0) <= 0.1, nar('Nobody came. The table was cleared by four. Pooja wrapped the food in foil, label by label, as if it might be sent somewhere.')),
        ...iff((q) => q.flag('gt-pretend'), say('raj', 'There was no need for anything. I said so.', 'stern')),
        ...iff((q) => q.flag('gt-guilt'), nar('Vikram has not rung back.')),
        ...iff((q) => q.flag('gt-alok-pressed'), nar('The sons have already discussed Alok’s phone calls among themselves. The word “nerve” was used.')),
        ...iff((q) => q.flag('gt-hour'), nar('Pooja kept every phone call she made short and every sentence simple. “Your father said to come for an hour.” It worked better than anything else would have.')),
        say('pooja', 'Eat something, Raj. It is a birthday.', 'tired'),
      ],
    }
  },
}
