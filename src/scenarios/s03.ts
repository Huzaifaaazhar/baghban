import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, WIFE_SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const HOME: Record<string, string> = {
  vikram: 'a two-bedroom flat that has held six people for ten weeks',
  rohan: 'a one-bedroom rented flat where your parents have slept in the study among the drawing rolls',
  kabir: 'a flat with a box room, a staircase, and a baby due in weeks',
}
const WIFE_LINE: Record<string, string> = {
  meera: 'Meera has not taken a phone call inside the flat in ten weeks. She goes down to the car.',
  simran: 'Simran works at the kitchen counter at midnight, because the study is a bedroom now.',
  ananya: 'Ananya sleeps in snatches. Mummy’s help arrives as instruction; yours arrives as apology.',
}

export const S03: ScenarioDef = {
  id: 's03', n: 3, title: 'Living Arrangements', month: 'January',
  build: (c) => {
    const H = c.H, W = c.HW, hn = N(H), wn = N(W)
    const warm = (q: import('../sim/types').Q) => q.bond(H, 'pooja', 'trust') >= 55 && q.bond(W, 'pooja', 'resentment') < 25
    return {
      where: 'living-room', time: 'afternoon',
      background: `The roof is mended. The workmen have gone, and Verma Sadan smells of fresh whitewash and nobody. For ten weeks Raj and Pooja have lived in ${hn}’s home — ${HOME[H]}. Today Raj says the house is “ready, whenever you are.” Pooja says nothing at all.`,
      conflict: 'Both parents want, in different ways, to stay with their children. The children have homes, spouses, and limits. Nobody has yet said the true reasons.',
      involved: ['raj', 'pooja', H, W, 'alok'],
      lenses: {
        parent: {
          who: 'pooja',
          stake: 'You would like to stay. You have not found a way to say it that does not sound like a complaint.',
          reveals: ['pooja-quiet-home', 'pooja-excluded'],
          intro: [
            nar('The whitewash smell has followed you back from Verma Sadan on your sari. The workmen have left their ladders in the courtyard.'),
            th('You went back on Tuesday for the post and stood in the hall a long time. The radio was still on, as you left it. It has been playing to an empty house for ten weeks, for company.', 'tired'),
            say('raj', 'Verma Sadan is ready. Whenever you are.', 'neutral'),
            nar('He says it as if reading a notice. He is looking at the floor.'),
            say(H, 'Whatever you want, Papa, Mummy. Really.', 'worried'),
            nar(`${wn}’s eyes go to ${hn} and away again. It is very quick. You see everything.`),
          ],
          notice: [
            { id: 'raj-face', kind: 'look', label: 'Raj’s face', text: 'When he said “ready,” his jaw moved as if he were swallowing something. He does not want to go back either. He cannot say so; he has never been a man who asks.', fx: [learnFx('pooja', 'raj-lonely'), insightFx('raj-lonely')] },
            { id: 'radio', kind: 'memory', label: 'the radio in the hall', text: 'A man reading cricket scores to an empty hall. You left it on so there would be a voice in the house when you returned. It has been the only one.' },
          ],
          prompt: 'They are waiting for you to say what you want.',
          options: [
            opt('ask-straight', '“I don’t want to go back to that quiet house. I would like to live with you. Please.”', {
              act: [act('pooja', H, 'confide', { c: 'belonging', tone: 'warm', n: 'Pooja admitted she could not bear the quiet house and asked to stay.' }), act('pooja', H, 'request', { c: 'privacy', own: 'belonging', need: 0.95, tone: 'gentle', why: true, n: `Pooja asked ${hn}’s household to take her and Raj in.` })],
              fx: [flag('lv-asked'), learnFx(H, 'pooja-quiet-home'), { t: 'self', c: 'pooja', d: { security: -2 } }],
              res: [say('pooja', 'I don’t want to go back to that quiet house, beta. I would like to live with you. Please.', 'tired'), nar('It is the longest sentence you have said aloud about yourself in years. Your hands are shaking in your lap.')],
              branches: [
                { when: warm, fx: [{ t: 'fact', k: 'living', v: 'host' }, flag('lv-host'), { t: 'agree', id: 'host-terms', between: [H, 'pooja'], text: `Pooja and Raj stay with ${hn}’s family, with a month’s review.` }], res: [say(H, 'Then you stay. We will make it work. I’ll talk to ' + wn + ' about how.', 'warm'), say(W, 'We’ll make it work. But we’ll make a plan. Both of us.', 'neutral')] },
                { when: () => true, fx: [{ t: 'fact', k: 'living', v: 'undecided' }], res: [say(H, 'Mummy… I — I need to talk to ' + wn + '. It’s not a no. It’s not a yes.', 'worried'), nar('You nod. You have nodded at this expression on your sons’ faces since they were nine.')] },
              ],
            }),
            opt('logical-case', '“The stairs, Raj’s knee, the pharmacy — it only makes sense for us to be where you are.”', {
              act: act('pooja', H, 'request', { c: 'privacy', own: 'belonging', need: 0.9, tone: 'neutral', why: true, n: 'Pooja argued that staying with the children was only sensible.' }),
              fx: [flag('lv-logic'), { t: 'issue', id: 'pooja~' + H + '~belonging~unvoiced', a: 'pooja', b: H, concern: 'belonging', sev: 0.35, text: 'Pooja gave reasons, not the reason.' }, { t: 'fact', k: 'living', v: 'host' }],
              res: [say('pooja', 'The stairs. Raj’s knee. The pharmacy at the corner is shut by eight. It only makes sense for us to be where you are.', 'neutral'), say(H, '…That does make sense. Yes. Of course it does.', 'tired'), nar('It is all true. It is not the reason, and you know the difference, and no one else in the room does.')],
            }),
            opt('hint-and-wait', '“Your flat has such lovely light, beta… I always say sunlight is half of health.”', {
              act: act('pooja', H, 'withhold', { c: 'belonging', tone: 'gentle', n: 'Pooja hinted about the light in the flat without saying she wanted to stay.' }),
              fx: [flag('lv-hint'), { t: 'fact', k: 'living', v: 'undecided' }, later('hint', 1, [{ t: 'bond', a: W, b: 'pooja', d: { heard: -2 } }], [{ speaker: W, text: 'Your mother wants to live with us, and cannot say it. I would rather she said it.' }])],
              res: [say('pooja', 'Your flat has such lovely light, beta. I always say sunlight is half of health.', 'warm'), say(H, 'Yes, Mummy. It’s a good flat.', 'neutral'), nar('The conversation moves on to the price of vegetables. You have said everything and nothing.')],
            }),
            opt('offer-return', '“We’ll go home. You have your own lives.”', {
              act: act('pooja', H, 'absorb', { c: 'belonging', need: 0.95, n: 'Pooja said she and Raj would go home, though she did not want to.' }),
              fx: [flag('lv-own'), { t: 'fact', k: 'living', v: 'own' }, later('alone', 2, [{ t: 'self', c: 'pooja', d: { security: -6 } }, flag('pooja-alone')], [{ speaker: 'narrator', text: 'Pooja telephones every evening at six. She says it is to ask about the children.' }], { ifFlag: 'lv-own' })],
              res: [say('pooja', 'We will go home. You have your own lives.', 'warm'), say(H, 'Mummy — are you sure?', 'worried'), say('pooja', 'Of course. Of course I’m sure.', 'warm'), nar('You say it brightly. It is your best performance in thirty-seven years.')],
            }),
          ],
          witness: [th('Pooja, on the sofa, listing the knee and the stairs. She keeps the radio on in an empty hall for company. She will argue about stairs for an hour before she says the word “lonely.”', 'tired')],
          witnessLearn: ['pooja-quiet-home'],
        },

        child: {
          who: H,
          stake: `You love them and you have a household to protect. ${WIFE_LINE[W]}`,
          reveals: [SECRET[H], WIFE_SECRET[W]],
          intro: [
            nar(`Your home is ${HOME[H]}. Everyone has been kind about it. Nobody has been comfortable.`),
            th(WIFE_LINE[W], 'tired'),
            say('raj', 'Verma Sadan is ready. Whenever you are.', 'neutral'),
            nar('Pooja does not move. She is looking at you with an expression you cannot place.'),
            th('If you say yes, you will say it with your mouth. If you say no, you will say it with your whole childhood.', 'worried'),
          ],
          notice: [{ id: 'radio', kind: 'look', label: 'Mummy’s radio', text: 'She brought it from Verma Sadan, and keeps it on the kitchen shelf, volume low, even when no one else is in. When you turn it off she turns it on again without looking at you.', fx: [learnFx(H, 'pooja-quiet-home'), insightFx('pooja-quiet-home')] }],
          prompt: 'Everyone is being very polite. It is up to you.',
          options: [
            opt('welcome', '“Stay. Properly. We’ll make room.”', {
              act: [act(H, 'pooja', 'offer', { c: 'belonging', tone: 'warm', n: `${hn} told his parents to stay properly.` }), act(H, W, 'impose', { c: 'privacy', own: 'belonging', need: 0.7, tone: 'neutral', n: `${hn} promised his parents a permanent room without asking ${wn}.` })],
              fx: [flag('lv-welcomed'), { t: 'fact', k: 'living', v: 'host' }, { t: 'self', c: H, d: { finStress: 5 } }],
              res: [say(H, 'Stay. Properly. We’ll make room.', 'warm'), say('pooja', 'Oh, beta —', 'warm'), nar('She presses your hand to her cheek. Over her shoulder, ' + wn + ' looks at the wall.')],
              branches: [
                { when: (q) => q.bond(W, H, 'trust') >= 72, res: [say(W, 'We’ll manage. But next time, you ask me first.', 'neutral')] },
                { when: () => true, fx: [flag('w-resents-host')], res: [say(W, 'I’ll be in the kitchen.', 'stern'), nar('That is all she says. It is not nothing.')] },
              ],
            }),
            opt('consult', '“I want to say yes. Let me talk to ' + wn + ' tonight and give you a real answer — not a polite one.”', {
              act: act(H, 'pooja', 'deflect', { c: 'belonging', tone: 'gentle', why: true, hear: true, alt: true, n: `${hn} asked for a night to give his parents a real answer.` }),
              fx: [flag('lv-consulted')],
              res: [say(H, 'I want to say yes. Let me talk to ' + wn + ' tonight and give you a real answer — not a polite one.', 'worried'), say('pooja', 'That’s fair, beta. That’s more than fair.', 'warm')],
              branches: [
                { when: (q) => q.bond(W, 'pooja', 'resentment') < 22 && q.bond(W, H, 'trust') >= 60, fx: [{ t: 'fact', k: 'living', v: 'host' }, { t: 'agree', id: 'host-terms', between: [H, W], text: `Pooja and Raj stay; ${wn} and ${hn} agree quiet hours, a phone-call hour for ${wn}, and a review in three months.` }, flag('lv-host')], res: [nar(`By morning you and ${wn} have a plan on one sheet of paper: terms, and a review in three months. She wrote the last line.`)] },
                { when: () => true, fx: [{ t: 'fact', k: 'living', v: 'rotate' }, flag('lv-rotation')], res: [nar(`By morning you have agreed on something smaller: a few months here, a few elsewhere. It is not what anyone wanted. It is what ${wn} can bear.`)] },
              ],
            }),
            opt('rotation', '“A few months with each of us. It’s the fairest way.”', {
              act: [act(H, 'pooja', 'impose', { c: 'belonging', own: 'fairness', need: 0.6, tone: 'neutral', why: true, alt: true, n: `${hn} proposed a rotation: a few months with each son.` }), ...(['vikram', 'rohan', 'kabir'] as CharacterId[]).filter((x) => x !== H).map((b) => act(H, b, 'impose', { c: 'autonomy', own: 'fairness', need: 0.6, tone: 'neutral', n: `${hn} volunteered his brothers’ homes.` }))],
              fx: [{ t: 'fact', k: 'living', v: 'rotate' }, flag('lv-rotation')],
              res: [say(H, 'A few months with each of us. It’s the fairest way.', 'neutral'), say('pooja', 'Like a library book.', 'hurt'), nar('She says it lightly and then looks surprised at herself.')],
            }),
            opt('honest-no', '“Not full-time. But Verma Sadan with a helper, and one of us there every evening — I’ll do that, I promise.”', {
              act: act(H, 'pooja', 'refuse', { c: 'belonging', own: 'privacy', need: 0.8, tone: 'gentle', why: true, alt: true, hear: true, n: `${hn} could not take his parents in full-time but promised evenings at Verma Sadan.` }),
              fx: [flag('lv-own'), { t: 'fact', k: 'living', v: 'own' }, { t: 'agree', id: 'evening-visits', between: [H, 'pooja'], text: `${hn} will be at Verma Sadan every evening, with a helper by day.` }],
              res: [say(H, 'Not full-time. But Verma Sadan, with a helper, and one of us there every evening. I’ll do that. I promise.', 'worried'), say('pooja', 'Every evening?', 'hopeful'), say(H, 'Every evening, Mummy.', 'warm'), nar('It is not what she asked for. She is nodding as if it is more than she hoped.')],
            }),
          ],
          witness: [th(`${hn}, in his own living room: ${WIFE_LINE[W]} He cannot say that to his mother. He is terrified she will hear it as “no.”`, 'tired')],
          witnessLearn: [WIFE_SECRET[W]],
        },

        alok: {
          who: 'alok',
          stake: 'You see a mother afraid of an empty house and a family afraid of a full one. You have a room and a rent you cannot afford.',
          reveals: ['alok-belong'],
          intro: [
            nar('You were asked to bring the last of the paint tins back. You are sitting on a stool at the edge of a family decision.'),
            th('You have heard that radio. You walked into Verma Sadan on Tuesday with a spanner and it was playing in the hall, to nobody, at full volume. You stood there until the song ended.', 'worried'),
            say('raj', 'Verma Sadan is ready. Whenever you are.', 'neutral'),
            nar('Nobody has asked you anything.'),
          ],
          prompt: 'You are not family. You have eyes.',
          options: [
            opt('move-in', 'Offer to move into the ground floor of Verma Sadan yourself — “so the house is not empty, Aunty.”', {
              act: act('alok', 'pooja', 'offer', { c: 'belonging', own: 'belonging', need: 0.95, tone: 'warm', n: 'Alok offered to move into Verma Sadan so the house would not be empty.' }),
              fx: [flag('lv-alok'), { t: 'fact', k: 'living', v: 'alok-near' }, { t: 'bond', a: H, b: 'alok', d: { respect: -3, resentment: 5 } }],
              res: [say('alok', 'Aunty — I could take the ground floor. So the house isn’t empty. I’d pay rent.', 'hopeful'), say('pooja', 'You would do that?', 'warm'), nar(`${hn} looks at you for a long moment. Gratitude and humiliation are, in his face, entirely mixed.`)],
            }),
            opt('tell-sons', `Tell ${hn}, gently, what you saw on Tuesday: the radio, the empty hall.`, {
              act: [act('alok', 'pooja', 'intrude', { c: 'privacy', tone: 'gentle', why: true, n: `Alok told ${hn} that Pooja keeps the radio on to hear a voice.` }), act('alok', H, 'confide', { c: 'honesty', tone: 'warm', n: 'Alok told the son what the empty hall was like.' })],
              fx: [flag('lv-alok-told'), learnFx(H, 'pooja-quiet-home'), { t: 'fact', k: 'living', v: 'rotate' }],
              res: [say('alok', hn + ' — forgive me. I was at Verma Sadan on Tuesday. The radio was on. At full volume. In the empty hall.', 'worried'), nar(`${hn} says nothing for a moment. Pooja, across the room, has gone very still.`), say('pooja', 'Alok.', 'hurt')],
            }),
            opt('trial', 'Propose a month’s trial: they go home, and each son takes a weekday evening — with you on Sundays.', {
              act: act('alok', H, 'offer', { c: 'belonging', alt: true, hear: true, tone: 'gentle', n: 'Alok proposed a month’s trial at home with a roster of evenings.' }),
              fx: [flag('lv-trial'), { t: 'fact', k: 'living', v: 'own' }, { t: 'agree', id: 'evening-roster', between: ['alok', H], text: 'A month at Verma Sadan, an evening each, Alok on Sundays.' }, { t: 'load', c: 'alok', d: 4 }],
              res: [say('alok', 'A month’s trial. They go home. Each of you takes an evening; I’ll take Sundays. Then we see.', 'hopeful')],
              branches: [
                { when: (q) => q.bond(H, 'alok', 'trust') >= 48, res: [say(H, 'That — might actually work. Thank you, Alok.', 'warm')] },
                { when: () => true, res: [say(H, 'It’s not your arrangement to make.', 'stern'), say('pooja', 'It’s a kind one, beta.', 'warm')] },
              ],
            }),
            opt('stay-out', 'Say nothing. It is the family’s to decide.', {
              act: act('alok', 'pooja', 'absorb', { c: 'belonging', need: 0.6, n: 'Alok heard what Pooja was not saying and held his tongue.' }),
              fx: [flag('lv-alok-silent'), { t: 'fact', k: 'living', v: 'undecided' }],
              res: [nar('You wipe a paint splash off the stool with your thumb. Nobody notices that you have not said what you know.')],
            }),
          ],
          witness: [th('Alok, on the stool: he heard the radio on Tuesday. He heard Raj say “ready” in the voice he uses when he means “don’t make me go.” He could say it. It would be so easy, and it would not be his to say.', 'worried')],
          witnessLearn: ['pooja-quiet-home', 'raj-lonely'],
        },
      },
      aftermathTime: 'evening',
      aftermath: [
        nar('Evening. Someone has put the kettle on; nobody has asked who.'),
        ...iff((q) => q.fact('living') === 'host', nar(`A mattress is moved, a drawer is cleared. ${hn}’s home absorbs two more people with the sound of a held breath.`)),
        ...iff((q) => q.fact('living') === 'rotate', nar('A calendar goes up on the fridge with three colours of ink. Raj reads it twice and says nothing about it.')),
        ...iff((q) => q.fact('living') === 'own', nar('The ladders are carried out of Verma Sadan’s courtyard. Pooja checks the radio is where she left it and, for once, does not switch it on.')),
        ...iff((q) => q.fact('living') === 'alok-near', nar('Alok’s bags are in the ground-floor room by nightfall. Raj hovers at the door and then, without a word, carries in the second pillow himself.')),
        ...iff((q) => q.fact('living') === 'undecided', nar('Nothing has been settled. Everyone is being kind in the particular way of people with something to say.')),
        ...iff((q) => q.flag('lv-logic'), say('pooja', 'It is only the stairs, beta. Only the stairs.', 'tired')),
        ...iff((q) => q.flag('w-resents-host'), nar(`${wn} sets the plates down a little harder than necessary.`)),
        ...iff((q) => q.flag('lv-alok-told'), say('pooja', 'Some things I would rather have said myself.', 'hurt')),
        say('raj', 'We will see how it goes.', 'neutral'),
      ],
    }
  },
}
