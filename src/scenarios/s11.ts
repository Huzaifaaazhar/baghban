import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name

export const S11: ScenarioDef = {
  id: 's11', n: 11, title: 'Forgotten Anniversary', month: 'September',
  build: (c) => {
    const S = c.S, sn = N(S)
    const tense = (q: import('../sim/types').Q) => q.bond('pooja', S, 'distance') > 40 || q.flag('gt-excuse') || q.flag('sa-retaliated') || q.flag('sa-walked')
    return {
      where: 'dining-room', time: 'evening',
      background: 'Today, the fourteenth of September, Raj and Pooja have been married for thirty-seven years. They have not mentioned it. The table is laid for two. The telephone has rung three times — a wrong number, a pharmacy, a cousin — and nobody has said the word.',
      conflict: 'Each of the sons has forgotten. Pooja is performing indifference with the discipline of a lifetime. Raj has told no one that he remembered.',
      involved: ['pooja', 'raj', S, 'alok'],
      lenses: {
        parent: {
          who: 'pooja',
          stake: 'You did not expect a fuss. You expected a call. You are beginning to hear what a house sounds like when it has forgotten you.',
          reveals: ['pooja-excluded'],
          intro: [
            nar('Seven in the evening. The table is laid for two, as for any Tuesday. You have made the kheer anyway, in the small pan, and put it on the back burner where nobody would think to look.'),
            th('Thirty-seven years. The first was the damp room at Aminabad, a stove that smoked, a husband who recited the interest rate on a fixed deposit as a form of courtship.', 'tired'),
            ...iff(tense, th('The boys are not speaking to each other, or to you in the old way. You have learned to expect less. You did not know you could expect less than this.', 'hurt')),
            say('raj', 'Is there any more dal?', 'neutral'),
            nar('He is looking at his plate. His left hand is in his kurta pocket, closed around something.'),
          ],
          notice: [{ id: 'pocket', kind: 'look', label: 'Raj’s kurta pocket', text: 'The corner of a small wrapped parcel, with a paper ribbon he has re-tied more than once. It has been in that pocket since breakfast. He has not taken his hand away from it all evening.', fx: [learnFx('pooja', 'raj-gift'), insightFx('raj-gift')] }],
          prompt: 'The kheer is cooling on the back burner. The phone is silent.',
          options: [
            opt('laugh-off', '“Anniversary? At our age? Arre, eat, the dal is getting cold.”', {
              act: act('pooja', 'raj', 'withhold', { c: 'recognition', tone: 'gentle', n: 'Pooja laughed off the thirty-seventh anniversary so nobody would feel bad.' }),
              fx: [flag('an-laughed'), { t: 'self', c: 'pooja', d: { security: -3 } }],
              res: [say('pooja', 'Anniversary? At our age? Arre, eat. The dal is getting cold.', 'warm'), nar('Raj’s hand tightens on the parcel. He does not take it out. He does not look at you. Both of you are being very, very kind.')],
            }),
            opt('say-plainly', 'Phone the eldest yourself. “It’s our anniversary, beta. I would have liked to be remembered.”', {
              act: act('pooja', S, 'confide', { c: 'recognition', tone: 'gentle', n: `Pooja phoned ${sn} and said she would have liked to be remembered on her anniversary.` }),
              fx: [flag('an-plain'), { t: 'comm', d: 2 }],
              res: [say('pooja', 'It’s our anniversary, beta. I would have liked to be remembered.', 'tired'), nar('A long silence on the line. You can hear him computing the whole day.')],
              branches: [{ when: (q) => q.bond(S, 'pooja', 'trust') >= 55, res: [say(S, 'Mummy — oh, no. I’m so sorry. I’m coming. Now.', 'hurt')] }, { when: () => true, res: [say(S, 'Mummy… I’ll — can we do it at the weekend?', 'worried'), nar('You say yes. It is the way of saying yes that is a no.')] }],
            }),
            opt('get-angry', 'Slam the ladle down. “Not one of them remembered. Thirty-seven years, and not one!”', {
              act: act('pooja', S, 'accuse', { c: 'recognition', own: 'belonging', need: 0.9, tone: 'harsh', n: `Pooja said, in anger, that not one of her sons had remembered her anniversary.` }),
              fx: [flag('an-angry'), { t: 'bond', a: 'raj', b: 'pooja', d: { heard: -3 } }],
              res: [say('pooja', 'Not one of them remembered. Thirty-seven years and not one!', 'stern'), nar('Raj looks at you. It is the first time in thirty-seven years that you have raised your voice about a thing you actually wanted.'), say('raj', 'Pooja —', 'worried')],
            }),
            opt('ask-raj', 'Say, gently, to Raj: “Is that for me? In your pocket?”', {
              when: (q) => q.knows('pooja', 'raj-gift'),
              act: act('pooja', 'raj', 'listen', { c: 'recognition', tone: 'warm', hear: true, n: 'Pooja asked Raj about the parcel in his pocket.' }),
              fx: [flag('an-raj-gave'), { t: 'bond', a: 'raj', b: 'pooja', d: { trust: 6, heard: 8, distance: -6 } }, { t: 'self', c: 'raj', d: { security: 4 } }],
              res: [say('pooja', 'Raj. Is that for me?', 'warm'), nar('He takes his hand out of his pocket as though a clamp had been loosened. The parcel is small and slightly squashed.'), say('raj', 'I did not know how to give it without sounding as if I were apologising.', 'tired'), say('pooja', 'You could try giving it and apologising separately.', 'warm')],
            }),
          ],
          witness: [th('Pooja, at the stove: she made the kheer anyway. She said “anniversary at our age?” in the voice she uses to take the sting out of things. She wanted, very much, to be asked.', 'tired')],
          witnessLearn: ['pooja-excluded'],
        },

        child: {
          who: S,
          stake: 'It is nine at night when you realise. You can do the right thing, or the easy thing, and they are not the same.',
          reveals: [SECRET[S]],
          intro: [
            nar(`Nine at night. ${N(c.SW)} is sitting up in bed with her laptop. “Isn’t it —” she begins, and stops, and looks at the date, and puts her hand over her mouth.`),
            th('The fourteenth of September. Mummy and Papa. Thirty-seven years. You have known the date since you were eight. You had it in your calendar. You had put it in your calendar for the wrong year.', 'hurt'),
            ...iff(tense, th('You are not on the best of terms with them just now. You would, in fact, have preferred a different anniversary on which to prove otherwise.', 'worried')),
            th('You can ring now. You can pretend you did not forget. You can say nothing and hope it was missed.', 'tired'),
          ],
          notice: [{ id: 'chat', kind: 'look', label: 'the family chat', text: 'Nothing today. Rohan’s thumbs-up from yesterday is still the last message. Nobody has said a word. It means nobody remembered. It also means nobody will say so.' }],
          prompt: 'It is nine. The phone is in your hand.',
          options: [
            opt('confess', 'Ring, now. “Mummy — I forgot. I’m sorry. No excuse. I’m coming round tomorrow morning, and I’ll bring breakfast.”', {
              act: act(S, 'pooja', 'apologize', { c: 'recognition', apology: { own: true, spec: true, nobut: true, change: true, for: 'recognition' }, tone: 'warm', n: `${sn} rang at nine to say he had forgotten the anniversary, with no excuse.` }),
              fx: [flag('an-confessed'), { t: 'comm', d: 1 }],
              res: [say(S, 'Mummy — I forgot. I’m sorry. No excuse. I’m coming tomorrow morning, and I’ll bring breakfast.', 'hurt')],
              branches: [{ when: (q) => q.bond('pooja', S, 'resentment') < 28, res: [say('pooja', 'Oh, beta. Bring jalebis. Your father pretends he doesn’t like them.', 'warm')] }, { when: () => true, res: [say('pooja', 'It is all right.', 'tired'), nar('It is not all right, and she is telling you so in the only way available to her.')] }],
            }),
            opt('excuse-and-gift', 'Ring: “Mummy, I am so sorry — work has been murder this week — I’ll bring a gift tomorrow, you’ll see.”', {
              act: act(S, 'pooja', 'apologize', { c: 'recognition', apology: { own: true, spec: false, nobut: false, change: false, for: 'recognition' }, tone: 'gentle', n: `${sn} apologised for forgetting but blamed the week and promised a gift.` }),
              fx: [flag('an-excuse')],
              res: [say(S, 'Mummy, I’m so sorry — work has been murder this week — I’ll bring a gift tomorrow, you’ll see.', 'worried'), say('pooja', 'It is fine, beta. Work is work.', 'tired'), nar('She says it kindly. It is as if a shutter has gone down in a house you have visited all your life.')],
            }),
            opt('pretend', 'Ring and say, breezily: “Happy anniversary, Mummy! Sorry for the late call — I was waiting till the end of the day.”', {
              act: act(S, 'pooja', 'withhold', { c: 'honesty', tone: 'warm', n: `${sn} pretended he had remembered the anniversary all day.` }),
              fx: [flag('an-pretended'), later('found-out', 2, [{ t: 'bond', a: 'pooja', b: S, d: { trust: -7, respect: -3 } }, { t: 'bond', a: 'raj', b: S, d: { trust: -4 } }], [{ speaker: 'pooja', text: 'You said you were waiting for the end of the day. I never told your wife that the call came at nine. She told me.' }], { ifFlag: 'an-pretended' })],
              res: [say(S, 'Happy anniversary, Mummy! Sorry for the late call — I was waiting till the end of the day.', 'warm'), say('pooja', 'Oh. Thank you, beta.', 'tired'), nar('She says it very brightly. She knows exactly what time it is.')],
            }),
            opt('do-nothing', 'Put the phone down. Hope it was missed. Tomorrow you will say “sorry for the delay.”', {
              act: act(S, 'pooja', 'absorb', { c: 'recognition', need: 0.6, n: `${sn} realised he had forgotten the anniversary and did nothing.` }),
              fx: [flag('an-nothing'), { t: 'self', c: S, d: { security: -3 } }, { t: 'issue', id: `pooja~${S}~recognition`, a: 'pooja', b: S, concern: 'recognition', sev: 0.5, text: 'The anniversary was forgotten and never addressed.' }],
              res: [nar('You put the phone face-down on the bedside table. It lies there all night like something with a pulse.')],
            }),
          ],
          witness: [th(`${sn}, at nine at night, at the edge of a bed: the date was in his calendar, for the wrong year. He had heard his mother’s voice in the afternoon, in the middle of a conversation about something else, and had not understood.`, 'hurt')],
          witnessLearn: [SECRET[S]],
        },

        alok: {
          who: 'alok',
          stake: 'You remembered. You are not the one who should have.',
          reveals: ['alok-belong'],
          intro: [
            nar('You remembered because Raj-uncle asked you, on a Tuesday, in a voice casual enough to carry an anvil, whether you knew a place that did good bangles.'),
            th('He said: “For a — colleague’s wife.” You said: “Of course.” You put it on your phone as: “14 Sept. Raj-uncle’s secret.”', 'warm'),
            th('Nobody has called. You have been at the table since six. Pooja-aunty has made kheer, as if nobody would notice.', 'worried'),
          ],
          notice: [{ id: 'parcel', kind: 'look', label: 'Raj’s pocket', text: 'The bangles in a paper parcel. He has had them since the morning. His left hand has not left his pocket in five hours.', fx: [learnFx('alok', 'raj-gift'), insightFx('raj-gift')] }],
          prompt: 'You could fix this. You are not sure it is yours to fix.',
          options: [
            opt('surprise-dinner', 'Slip out, buy sweets and flowers, and set a proper table with candles in the next ten minutes.', {
              act: act('alok', 'pooja', 'offer', { c: 'recognition', tone: 'warm', n: 'Alok improvised an anniversary dinner for Raj and Pooja.' }),
              fx: [flag('an-alok-dinner'), ...(['vikram', 'rohan', 'kabir'] as CharacterId[]).map((b) => ({ t: 'bond' as const, a: b, b: 'alok' as CharacterId, d: { resentment: 4, respect: -3 } }))],
              res: [nar('You are back in twelve minutes with flowers and a box of sweets. Pooja-aunty’s hand goes to her mouth. Raj-uncle says, gruffly, “This is not necessary.” He stays at the table for two hours.')],
            }),
            opt('nudge-sons', 'Message the three sons privately: “Today. Please ring. Don’t make me say why.”', {
              act: ['vikram', 'rohan', 'kabir'].map((b) => act('alok', b as CharacterId, 'support', { c: 'recognition', tone: 'gentle', n: `Alok quietly reminded ${N(b as CharacterId)} of the anniversary.` })),
              fx: [flag('an-alok-nudged'), { t: 'bond', a: 'raj', b: 'alok', d: { trust: 2 } }],
              res: [nar('Three phones buzz in three homes. Within ten minutes the first call comes through. Pooja-aunty’s voice changes mid-sentence; you hear it from the passage.')],
            }),
            opt('own-gift', 'Hand Pooja-aunty a small box you have brought yourself. “Many happy returns, Aunty. From someone who is not family.”', {
              act: act('alok', 'pooja', 'offer', { c: 'recognition', tone: 'warm', n: 'Alok gave Pooja a small gift on her anniversary.' }),
              fx: [flag('an-alok-gift'), { t: 'bond', a: 'vikram', b: 'alok', d: { resentment: 3 } }],
              res: [say('alok', 'Many happy returns, Aunty. From someone who is not family.', 'warm'), say('pooja', 'Not family. Hm. That is not what I would call it.', 'warm')],
            }),
            opt('say-nothing', 'Say nothing. It is their marriage and their sons.', {
              act: act('alok', 'pooja', 'absorb', { c: 'recognition', need: 0.6, n: 'Alok remembered the anniversary and said nothing.' }),
              fx: [flag('an-alok-silent')],
              res: [nar('You eat your dal. You look at your plate. You decide that being right about when to hold your tongue is a poor consolation.')],
            }),
          ],
          witness: [th('Alok, at the table: he is the only one who knew. Raj-uncle had asked him about bangles in a voice carefully free of everything. Pooja-aunty has made kheer in the small pan. They are two people who do not know how to say it.', 'worried')],
          witnessLearn: ['raj-gift'],
        },
      },
      aftermathTime: 'night',
      aftermath: [
        nar('Late. The kheer pan has been washed and put away.'),
        ...iff((q) => q.flag('an-raj-gave'), nar('On the sideboard is a small paper parcel, opened. The bangles are not an expensive pair. Pooja is wearing them. She is making a great fuss of not looking at her wrists.')),
        ...iff((q) => q.flag('an-confessed') || q.flag('an-plain'), nar('Breakfast, tomorrow: jalebis. Someone has promised. It is not much, and it is specific.')),
        ...iff((q) => q.flag('an-excuse'), nar('A gift will arrive tomorrow. Nobody is under any illusion about what it will mean.')),
        ...iff((q) => q.flag('an-pretended'), nar('Pooja goes to bed and lies awake counting. She does not sleep till three.')),
        ...iff((q) => q.flag('an-nothing'), nar('The phone does not ring. It does not ring for another day.')),
        ...iff((q) => q.flag('an-angry'), say('raj', 'You are right, Pooja. They should have remembered. So should I have said so.', 'tired')),
        ...iff((q) => q.flag('an-alok-dinner'), nar('The sons will hear that Alok arranged the dinner, and that they did not. It will be remembered for some time.')),
        say('raj', 'Thirty-seven years. It was a good deal, on the whole.', 'warm'),
      ],
    }
  },
}
