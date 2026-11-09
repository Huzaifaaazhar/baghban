import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name

/** Why the host household cannot afford a noisy night, by son. */
const NEED: Record<string, string> = {
  vikram: 'Aarav has his pre-board exam in the morning, and you present to the regional head at nine.',
  rohan: 'Ira wakes at every clatter, and Simran has a brand deadline at ten.',
  kabir: 'Ananya is eight months along and has not slept two hours together all week.',
}

export const S01: ScenarioDef = {
  id: 's01', n: 1, title: 'Midnight Typewriter', month: 'November',
  build: (c) => {
    const H = c.H, W = c.HW, hn = N(H)
    const blunt = (q: import('../sim/types').Q) => q.bond(H, 'raj', 'resentment') >= 26 || q.bond(H, 'raj', 'heard') < 30
    return {
      where: 'living-room', time: 'night',
      background: `Since the roof came off Verma Sadan, Raj and Pooja have been living in ${hn}’s flat. Raj’s old Remington came with them, wrapped in a bath towel. Every night after half past twelve it clatters from the corner of the living room until nearly two. ${NEED[H]}`,
      conflict: `${hn} wants the noise to stop. Raj wants his hours back. Both have a reason; only one has said it aloud.`,
      involved: ['raj', H, W, 'alok'],
      lenses: {
        /* ------------------------------------------------------------ */
        parent: {
          who: 'raj',
          stake: 'You are typing. It is the only hour of the day you feel like yourself.',
          reveals: ['raj-insomnia', 'raj-booklet', 'raj-lonely'],
          enter: (q) => blunt(q)
            ? [act(H, 'raj', 'request', { c: 'usefulness', own: 'sleep', need: 0.9, tone: 'blunt', unk: 'raj-insomnia', n: `${hn} told Raj, at one in the morning, to stop typing.` })]
            : [act(H, 'raj', 'request', { c: 'usefulness', own: 'sleep', need: 0.9, tone: 'gentle', why: true, unk: 'raj-insomnia', n: `${hn} asked Raj to take the typewriter somewhere quieter.` })],
          intro: [
            nar('12:41 a.m. The carriage bell rings at the end of every line. Somewhere in this flat, someone is awake because of it.'),
            th('Page nineteen: “What a fixed deposit is, and what it is not.” For eleven lines at a stretch you are not an old man in somebody’s spare room.', 'warm'),
            th('The knee will not let you lie flat anyway. And lying down is when you hear them all breathing — the whole flat, asleep, without you.', 'tired'),
            nar(`A door opens. ${hn} stands in it with a hand on the frame.`),
            ...iff(blunt, say(H, 'Papa. It’s one o’clock. Some of us have to work in the morning.', 'stern'), nar(`He does not say please. He does not say sorry. He looks, you think, like his mother.`)),
            ...iff((q) => !blunt(q), say(H, 'Papa — sorry. I know you’re in the middle of something. Could we talk about the typing?', 'worried'), nar('He says it gently. That is somehow harder.')),
          ],
          notice: [
            { id: 'listen', kind: 'look', label: 'Listen to the flat', text: 'Under the clatter: a child’s study lamp still on behind one door, a cough, a phone vibrating on a bedside table. Everyone here is already stretched thin. You had not noticed it from the corner.', fx: [learnFx('raj', 'host-strain'), insightFx('host-strain')] },
            { id: 'pages', kind: 'memory', label: 'your last full night’s sleep', text: 'The night before the retirement dinner. You had slept like a man with an office to go to. You do not remember when you last felt that way.' },
          ],
          prompt: 'He is waiting. The machine is still warm.',
          options: [
            opt('comply-cold', '“Fine.” Cover the typewriter and go to bed without another word.', {
              act: act('raj', H, 'absorb', { c: 'usefulness', need: 0.8, n: 'Raj covered the typewriter without a word and went to bed.' }),
              fx: [flag('tw-withdrew'), later('withdrawn', 2, [flag('raj-withdrawn'), { t: 'bond', a: 'raj', b: H, d: { distance: 8, heard: -3 } }], [{ speaker: 'narrator', text: 'Raj has stopped typing. The Remington is back in its towel. The flat is quiet at night — and somehow quieter than that.' }], { unlessFlag: 'tw-reconciled' })],
              res: [say('raj', 'Fine.', 'stern'), nar('He drapes the towel over the Remington the way one covers a birdcage for the night.'), say(H, 'Papa, I didn’t mean — ', 'worried'), say('raj', 'Goodnight.', 'neutral')],
            }),
            opt('stand', '“I have typed at night for forty years. It is the only hour that is mine.”', {
              act: act('raj', H, 'refuse', { c: 'sleep', own: 'usefulness', need: 0.9, tone: 'blunt', unk: 'host-strain', n: 'Raj refused to stop typing: “It is the only hour that is mine.”' }),
              fx: [flag('tw-standoff'), later('standoff', 1, [{ t: 'bond', a: W, b: 'raj', d: { resentment: 4, distance: 3 } }], [{ speaker: W, text: 'Your father’s machine again. I’ve said nothing — I want that noted.' }])],
              res: [say('raj', 'I have typed at night for forty years. It is the only hour that is mine.', 'stern'), say(H, 'It isn’t only about you, Papa — ', 'stern'), say(W, '(from the passage, half asleep) Is that the typewriter again?', 'tired'), nar('Nobody wins. Everybody is now awake.')],
            }),
            opt('offer-alt', '“Give me ten minutes. I’ll take it to the kitchen, put a felt pad under it, and stop by one.”', {
              act: act('raj', H, 'compromise', { c: 'sleep', alt: true, tone: 'gentle', unk: 'host-strain', n: 'Raj agreed to type in the kitchen on a felt pad and stop by one.' }),
              fx: [flag('tw-agreement'), { t: 'agree', id: 'quiet-hours', between: ['raj', H], text: 'Raj types in the kitchen on a felt pad and stops by one.' }, learnFx(H, 'raj-booklet'),
                later('chapter', 3, [{ t: 'bond', a: H, b: 'raj', d: { respect: 4, heard: 4 } }], [{ speaker: 'narrator', text: `A typed page arrives on ${hn}’s desk with a pencilled note: “Chapter four. For when the home-loan question comes up. — R.”` }])],
              res: [say('raj', 'Give me ten minutes. I will take it to the kitchen, put a felt pad under it, and stop by one.', 'neutral'), say(H, '…Okay. Thank you. Really.', 'warm'), say(H, 'What is it you’re typing, anyway?', 'hopeful'), say('raj', 'Hm. A booklet. For people who were never taught what a bank is for.', 'warm')],
            }),
            opt('confide', '“I can’t sleep, beta. It’s the knee. When I type, I’m — useful. I’m sorry for the noise.”', {
              act: act('raj', H, 'confide', { c: 'belonging', tone: 'warm', n: 'Raj admitted he cannot sleep and that typing is how he feels useful.' }),
              fx: [flag('tw-confided'), learnFx(H, 'raj-insomnia'), learnFx(H, 'raj-booklet'), { t: 'self', c: 'raj', d: { security: -2 } },
                later('lamp', 2, [{ t: 'self', c: 'raj', d: { security: 4 } }], [{ speaker: 'narrator', text: `A small table and a desk lamp have appeared in the spare room. ${hn} says he “found them in the store room.” Nobody believes him.` }])],
              res: [say('raj', 'I can’t sleep, beta. It’s the knee. And when I type I am — useful. I am sorry for the noise.', 'tired'), nar('He has never said any of this to anyone. You can hear that he has not rehearsed it.'), say(H, '…Papa. Why didn’t you say?', 'worried')],
              branches: [
                { when: (q) => q.bond(H, 'raj', 'resentment') < 30, fx: [{ t: 'agree', id: 'quiet-hours', between: ['raj', H], text: 'A desk for Raj in the spare room; typing stops by one.' }], res: [say(H, 'Let’s find you a desk in the spare room. A proper one. Nobody should type on a bath towel.', 'warm'), say('raj', 'It is a very good towel.', 'warm')] },
                { when: () => true, res: [say(H, 'I — thank you for telling me. I need a minute.', 'tired'), nar('It is not a solution. It is not a slammed door either.')] },
              ],
            }),
          ],
          witness: [th('Raj, 12:41. Page nineteen. He types with two fingers and never looks at the keys. He is writing a booklet about banking, because nobody ever explained money to people like his father — and because, between midnight and two, no one is talking over him.', 'warm'), th('He does not tell anyone he cannot sleep. He does not tell anyone the flat is too quiet to lie in.', 'tired')],
          witnessLearn: ['raj-insomnia', 'raj-booklet', 'raj-lonely'],
        },

        /* ------------------------------------------------------------ */
        child: {
          who: H,
          stake: `You are exhausted, you are grateful, and you are about to be unkind. ${NEED[H]}`,
          reveals: H === 'vikram' ? ['vik-judged', 'host-strain'] : ['host-strain'],
          intro: [
            nar('12:52 a.m. The sound comes through the wall like someone dropping a spoon, again and again and again.'),
            th(NEED[H], 'tired'),
            th('You know you should be grateful. Papa gave everything to everyone for forty years. And you would like, very much, to throw the Remington off the balcony.', 'stern'),
            th('Every conversation with him feels like an audit. It is why you have been avoiding him in your own flat.', 'hurt', { for: ['vikram'] }),
            nar(`${N(W)} turns over beside you. “It’s been two hours,” she says, not quite awake.`),
          ],
          notice: [
            { id: 'door', kind: 'look', label: 'Look at the line of light under the door', text: 'The door is ajar. Papa is at the little table with his glasses pushed up on his forehead. Typed pages in neat columns: “What is a fixed deposit?” A knee brace on the arm of the chair. A cold cup of tea. He has been awake a long time.', fx: [learnFx(H, 'raj-booklet'), insightFx('raj-booklet')] },
            { id: 'memory', kind: 'memory', label: 'the Remington', text: 'Every school morning the sound of this machine was how you knew your father was home. You hated it then, too. You never asked him what he was writing.' },
          ],
          prompt: `You are standing in the passage in your socks. His light is on.`,
          options: [
            opt('knock-blunt', '“Papa. It’s one o’clock. Stop.”', {
              act: act(H, 'raj', 'request', { c: 'usefulness', own: 'sleep', need: 0.9, tone: 'blunt', unk: 'raj-insomnia', n: `${hn} told Raj to stop typing: “It’s one o’clock. Stop.”` }),
              fx: [flag('tw-blunt'), later('silent-treatment', 2, [flag('raj-withdrawn'), { t: 'bond', a: 'raj', b: H, d: { distance: 6, heard: -3 } }], [{ speaker: 'narrator', text: `Raj has been polite to ${hn} for two weeks. Perfectly, formally polite.` }])],
              res: [say(H, 'Papa. It’s one o’clock. Stop.', 'stern'), say('raj', 'I see.', 'stern'), nar('He takes his glasses off and folds them, very precisely. He does not argue. That, you realise, is worse.'), say('raj', 'Goodnight, beta.', 'neutral')],
            }),
            opt('knock-gentle', '“Papa, I’m sorry — Aarav has an exam and I’m done in. Could you move it to the kitchen, with a towel under it, and stop by one?”', {
              act: act(H, 'raj', 'request', { c: 'usefulness', own: 'sleep', need: 0.9, tone: 'gentle', why: true, alt: true, hear: true, unk: 'raj-insomnia', n: `${hn} asked Raj, kindly, to type in the kitchen and stop by one.` }),
              res: [say(H, 'Papa, I’m sorry — I know you’re in the middle of something. ' + NEED[H].replace('you present', 'I present').replace('you have', 'I have') + ' Could you move it to the kitchen, with a towel under it, and stop by one?', 'worried')],
              branches: [
                { when: (q) => q.bond('raj', H, 'trust') >= 55 && q.sim.self.raj.compromise >= 30, fx: [flag('tw-agreement'), { t: 'agree', id: 'quiet-hours', between: ['raj', H], text: 'Raj types in the kitchen on a felt pad and stops by one.' }], res: [say('raj', 'Hmm. A felt pad. Yes. That is sensible.', 'neutral'), say('raj', 'One o’clock. But I will not be hurried before then.', 'stern'), nar('It is an agreement. It has Raj’s fingerprints on it — which is why it will hold.')] },
                { when: () => true, fx: [flag('tw-standoff')], res: [say('raj', 'Everyone seems to have a plan for me tonight.', 'stern'), nar('He does not say no. He does not type either. You stand there, and he sits there, and the machine ticks as it cools.')] },
              ],
            }),
            opt('absorb', 'Say nothing. Put in earplugs. Go back to bed.', {
              act: act(H, 'raj', 'absorb', { c: 'sleep', need: 0.9, n: `${hn} lay awake and said nothing about the typing.` }),
              fx: [flag('tw-absorbed'), later('snap', 2, [flag('h-snaps'), { t: 'bond', a: H, b: 'raj', d: { resentment: 6 } }], [{ speaker: 'narrator', text: `By the end of the week ${hn} has said nothing for six nights. Tonight it is not going to stay unsaid.` }])],
              res: [nar('You lie in the dark, counting carriage returns. At 1:58 the bell rings once more and the flat falls silent. You are not rested. You are very, very polite at breakfast.'), say(W, 'You didn’t say anything, did you.', 'tired')],
            }),
            opt('ask', 'Go out. Don’t mention the noise. Ask what he’s typing.', {
              act: act(H, 'raj', 'listen', { c: 'usefulness', tone: 'warm', n: `${hn} asked Raj what he was typing before saying a word about the noise.` }),
              fx: [flag('tw-asked'), learnFx(H, 'raj-booklet')],
              res: [say(H, 'Papa — what are you typing?', 'hopeful'), say('raj', '…A booklet. Banking for Ordinary People. Nobody explained money to my father, and he paid for it.', 'warm'), nar('He holds up page nineteen. His hand is not quite steady.')],
              branches: [
                { when: (q) => q.bond('raj', H, 'trust') >= 55, fx: [{ t: 'agree', id: 'quiet-hours', between: ['raj', H], text: 'Raj stops by one; the machine moves to the kitchen.' }], res: [say('raj', 'It is one o’clock. You have work. I will move to the kitchen. Read page nineteen in the morning.', 'warm')] },
                { when: () => true, res: [say('raj', 'Ten minutes more. I have a line to finish.', 'neutral'), nar('You wait. He finishes. It is 1:25. You are not sure what you have gained, except that you now know what the sound is for.')] },
              ],
            }),
          ],
          witness: [th(`${hn}, 12:52. ${NEED[H]} He lies still, counting carriage returns, and does not know the man at the machine can’t sleep either.`, 'tired')],
          witnessLearn: ['host-strain'],
        },

        /* ------------------------------------------------------------ */
        alok: {
          who: 'alok',
          stake: 'You came with page proofs and stayed because the buses stopped. You are three metres from the machine, and you know more than you should.',
          reveals: ['alok-belong'],
          intro: [
            nar(`You brought the first page proofs of Raj’s booklet at ten. ${N(W)} insisted you stay on the sofa after the buses stopped. You are lying three metres from the Remington.`),
            th('The booklet is good. It is very good. And at one in the morning it is going to end in a quarrel.', 'worried'),
            nar(`Down the passage, a door opens. ${hn} steps out, rubbing his face. He has not seen you yet.`),
            th('Raj told you about the booklet in a whisper, as if it were something shameful. He did not tell you why he is typing at night. You have not asked.', 'worried'),
          ],
          notice: [
            { id: 'watch', kind: 'look', label: 'Watch Raj’s lips', text: 'He is reading each line aloud, under his breath, to the empty chair beside him — where Pooja used to sit when he read her his reports. He is not typing for the booklet. He is typing so that somebody, even nobody, is being told something.', fx: [learnFx('alok', 'raj-insomnia'), insightFx('raj-insomnia'), insightFx('raj-lonely')] },
          ],
          prompt: 'Two men, one machine, and you in the middle on a borrowed sofa.',
          options: [
            opt('warn-raj', 'Get up quietly. “Uncle — let me carry it to the kitchen for you. Please. For tonight.”', {
              act: act('alok', 'raj', 'offer', { c: 'usefulness', alt: true, tone: 'gentle', hear: true, n: 'Alok quietly offered to carry the typewriter to the kitchen.' }),
              fx: [flag('tw-alok-warned'), learnFx('raj', 'host-strain')],
              res: [say('alok', 'Uncle — let me carry it to the kitchen for you. Please. For tonight. I’ll put a towel under it.', 'hopeful')],
              branches: [
                { when: (q) => q.bond('raj', 'alok', 'trust') >= 70, fx: [{ t: 'agree', id: 'quiet-hours', between: ['raj', H], text: 'Raj types in the kitchen; Alok carries the machine.' }, { t: 'bond', a: H, b: 'alok', d: { trust: 4 } }], res: [say('raj', 'You are a nuisance, Alok. Take the legs. Not the carriage — it is delicate.', 'warm'), nar(`The two of you carry it past ${hn}, who watches, blinks, and says nothing at all.`)] },
                { when: () => true, res: [say('raj', 'No. Thank you. I will manage.', 'stern')] },
              ],
            }),
            opt('tell-h', `Go and knock on ${hn}’s door first. Tell him what Raj is writing, and that he doesn’t sleep.`, {
              act: [act('alok', 'raj', 'intrude', { c: 'privacy', tone: 'gentle', why: true, n: `Alok told ${hn} about Raj’s booklet and his sleeplessness without asking.` }), act('alok', H, 'confide', { c: 'honesty', tone: 'warm', n: `Alok explained Raj’s typing to ${hn}.` })],
              fx: [flag('tw-alok-told'), learnFx(H, 'raj-insomnia'), learnFx(H, 'raj-booklet')],
              res: [say('alok', `${hn} — one minute. He’s writing a booklet. He can’t sleep, that’s all. Please don’t be hard on him.`, 'hopeful'), say(H, '…He told you that?', 'worried')],
              branches: [
                { when: (q) => q.bond(H, 'alok', 'trust') >= 45, fx: [{ t: 'bond', a: 'raj', b: 'alok', d: { trust: -6, respect: -2 } }], res: [nar(`${hn} goes in more softly than he would have. It works. Raj notices — and when he realises why, he looks at you across the room for a long moment.`)] },
                { when: () => true, fx: [{ t: 'bond', a: 'raj', b: 'alok', d: { trust: -8 } }], res: [say(H, 'Alok. That isn’t yours to tell.', 'stern'), nar('He is right, and he is also angry at someone else. Raj, in the doorway, has heard every word.')] },
              ],
            }),
            opt('side-h', `When ${hn} confronts Raj, say it plainly: “Uncle, it’s selfish. They have to sleep.”`, {
              act: [act('alok', 'raj', 'accuse', { c: 'dignity', tone: 'blunt', unk: 'raj-insomnia', n: 'Alok told Raj his typing was selfish.' }), act('alok', H, 'defend', { vs: 'raj', tone: 'blunt', n: `Alok took ${hn}’s side against Raj.` })],
              fx: [flag('tw-alok-sided')],
              res: [say('alok', 'Uncle, it’s selfish. They have to sleep.', 'stern'), nar('The room goes very still. Raj looks at you the way one looks at a door that has just been closed from the other side.'), say('raj', 'I see. The guest has opinions.', 'hurt')],
            }),
            opt('company', 'Say nothing. Pull a stool beside Raj, and offer to read him page nineteen back.', {
              act: act('alok', 'raj', 'support', { c: 'belonging', tone: 'warm', n: 'Alok sat with Raj and read his pages back to him.' }),
              fx: [flag('tw-alok-company'), { t: 'self', c: 'raj', d: { security: 4 } }, { t: 'bond', a: H, b: 'alok', d: { trust: -3 } }],
              res: [say('alok', 'Uncle. Read me page nineteen — properly. I’ll tell you if it’s clear.', 'warm'), nar('He reads it. You tell him it’s clear, which is true. By ten to one he has stopped typing, and does not seem to notice that he has.'), say('raj', 'It’s late. Go to sleep, Alok.', 'warm')],
            }),
          ],
          witness: [th('Alok, on the sofa: he can hear everything. Raj reading aloud to an empty chair; the light under one door; a family that loves each other and is two minutes from saying something it can’t take back.', 'worried')],
          witnessLearn: ['raj-insomnia', 'raj-lonely'],
        },
      },
      aftermathWhere: 'kitchen', aftermathTime: 'morning',
      aftermath: [
        nar('Morning. The kitchen smells of cardamom and burnt toast.'),
        ...iff((q) => q.flag('tw-agreement') || q.agreed('quiet-hours'), nar(`The felt pad is on the kitchen table, with a typed page beside ${hn}’s cup. He reads a line. His mouth moves slightly. He folds the page into his shirt pocket.`), say('pooja', 'Whatever you two agreed — keep to it. Both of you.', 'warm')),
        ...iff((q) => q.flag('tw-withdrew') || q.flag('tw-blunt'), nar('Breakfast is toast and no conversation. The Remington stays under its towel.'), say('pooja', 'Raj is very quiet this morning. Has something happened?', 'worried')),
        ...iff((q) => q.flag('tw-standoff'), nar(`${N(W)} pours tea with great care. Neither man looks up.`), say('pooja', 'I have raised three boys. I know what an agreement sounds like. That was not one.', 'stern')),
        ...iff((q) => q.flag('tw-confided'), nar('Raj has not spoken of it. But there is a second cushion on his chair this morning, and nobody mentions it.')),
        ...iff((q) => q.flag('tw-absorbed'), nar(`${hn} looks like a man who has slept in a chair. He has said nothing. It shows.`)),
        ...iff((q) => q.flag('tw-alok-told'), say('raj', 'Who told him?', 'hurt', { for: ['raj'] }), nar('Someone has told someone something. Everybody is being very careful with their toast.')),
        ...iff((q) => q.flag('tw-alok-sided'), nar('Raj addresses everything to the room. Nothing to Alok.')),
        ...iff((q) => q.flag('tw-alok-company'), nar('Raj has slept for the first time in a week. He comes to breakfast with a crease on his cheek and not a word of explanation.')),
        nar('Whatever was settled last night, the house now knows something about itself that it did not know at dinner.'),
      ],
    }
  },
}
