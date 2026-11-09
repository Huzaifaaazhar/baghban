import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, sonsExcept, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const SONS: CharacterId[] = ['vikram', 'rohan', 'kabir']

export const S07: ScenarioDef = {
  id: 's07', n: 7, title: 'Medical Emergency', month: 'May',
  build: (c) => {
    const S = c.S, sn = N(S), oth = sonsExcept(S)
    return {
      where: 'living-room', time: 'night',
      background: 'At four o’clock Pooja’s blood pressure reached 210 over 120 in the kitchen. She is in hospital — stable, watched for five days, then a ward for a week. The doctor said “missed doses” and looked at Raj. The bills so far are ₹1.2 lakh. Somebody must sit with her at night; somebody must run the pharmacy and the forms. Raj cannot manage the hospital stairs on that knee.',
      conflict: 'Everyone wants to help. Nobody has agreed on who does what — and each of them has something at home that cannot be left.',
      involved: ['raj', 'vikram', 'rohan', 'kabir', 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: 'You cannot sit with her. You will not be told to rest. You have never been more afraid, and you have never been worse at saying so.',
          reveals: [],
          intro: [
            nar('2 a.m. The sofa. The house is full of people who have come in with their coats on and not taken them off.'),
            th('“Missed doses.” The doctor said it very kindly and he looked at you, not at the chart. You had not known. You had not asked.', 'hurt'),
            th('Thirty-seven years, and you could not have said what tablet she took, or how often. She was the one who knew where things were.', 'tired'),
            say('vikram', 'Papa — somebody needs to be with her at night. I can do Monday and — I think I can do Wednesday.', 'tired'),
            say('rohan', 'I’ve done the pharmacy twice already today, I’ll — I’ll just keep —', 'tired'),
            say('kabir', 'I can do forms from home. Ananya’s — I can’t leave her, Papa. Not with Anvi.', 'worried'),
          ],
          notice: [{ id: 'chart', kind: 'look', label: 'the doctor’s note', text: '“Hypertensive crisis — consistent with missed or reduced doses over weeks.” A pharmacy sticker: the same strip, nine tablets gone in three weeks. She took one every other day. She called it “remembering when I remember.”', fx: [learnFx('raj', 'pooja-pills'), insightFx('pooja-pills')] }],
          prompt: 'Three sons are looking at you, and waiting to be told.',
          options: [
            opt('take-command', 'Draw up the rota yourself: nights, days, forms, pharmacy. “Nobody argues.”', {
              act: SONS.map((b) => act('raj', b, 'impose', { c: 'autonomy', own: 'usefulness', need: 0.9, tone: 'blunt', n: `Raj assigned ${N(b)} his share of Pooja’s care without asking.` })),
              fx: [flag('mc-command'), { t: 'fact', k: 'care', v: 'raj-controlled' }, { t: 'load', c: 'vikram', d: 10 }, { t: 'load', c: 'rohan', d: 10 }, { t: 'load', c: 'kabir', d: 3 }],
              res: [say('raj', 'Vikram: nights, Monday, Wednesday, Friday. Rohan: days and the pharmacy. Kabir: forms and bills. Nobody argues.', 'stern'), nar('Nobody argues. It is how you know it will not work.')],
              branches: [{ when: (q) => q.self('rohan', 'finStress') > 65, res: [say('rohan', 'Yes, Papa. Of course.', 'tired'), nar('Rohan has not told him that he did the pharmacy, the forms and the night before too.')] }, { when: () => true, res: [say('vikram', 'Fine. Fine, Papa.', 'tired')] }],
            }),
            opt('ask-capacity', '“Tell me what you can each do — honestly — and we will fit the rest together.”', {
              act: SONS.map((b) => act('raj', b, 'listen', { c: 'fairness', tone: 'warm', n: `Raj asked ${N(b)} what he could honestly do for Pooja.` })),
              fx: [flag('mc-asked'), { t: 'fact', k: 'care', v: 'capacity' }, { t: 'load', c: 'vikram', d: 6 }, { t: 'load', c: 'rohan', d: 4 }, { t: 'load', c: 'kabir', d: 6 }],
              res: [say('raj', 'Tell me what you can each do. Honestly. We will fit the rest together.', 'tired'), nar('It is the first time you have handed a decision to someone else. It feels like standing on one leg.')],
              branches: [{ when: (q) => q.bond('rohan', 'raj', 'trust') >= 58, fx: [{ t: 'load', c: 'rohan', d: -4 }], res: [say('rohan', 'Papa — honestly? I’ve done most of it for a year. I’d like to not do most of it for the next month.', 'worried'), nar('Nobody breathes. Raj looks at Rohan as if for the first time.')] }, { when: () => true, res: [nar('They tell you, one at a time. They tell you less than is true. Something, you understand, is being left out.')] }],
            }),
            opt('refuse-help', '“I will sit with her myself. Nobody else needs to.”', {
              act: SONS.map((b) => act('raj', b, 'refuse', { c: 'usefulness', own: 'belonging', need: 0.95, tone: 'blunt', n: `Raj refused ${N(b)}’s help at Pooja’s bedside.` })),
              fx: [flag('mc-refuse'), { t: 'fact', k: 'care', v: 'raj-alone' }, later('fall', 1, [{ t: 'self', c: 'raj', d: { security: -5 } }, flag('raj-fell')], [{ speaker: 'narrator', text: 'On the third night Raj’s knee gives way on the hospital stairs. He sits on the landing a long time before anyone finds him.' }], { ifFlag: 'mc-refuse' })],
              res: [say('raj', 'I will sit with her myself. Nobody else needs to.', 'stern'), say('vikram', 'Papa, you can’t even climb —', 'worried'), say('raj', 'I will sit with her.', 'stern')],
            }),
            opt('break-down', '“I’m afraid. I can’t do this alone — someone tell me what to do.”', {
              act: SONS.map((b) => act('raj', b, 'confide', { c: 'belonging', tone: 'warm', n: `Raj told ${N(b)} he was afraid.` })),
              fx: [flag('mc-vulnerable'), { t: 'fact', k: 'care', v: 'shared' }, { t: 'self', c: 'raj', d: { security: -3 } }, { t: 'load', c: 'vikram', d: 6 }, { t: 'load', c: 'rohan', d: 4 }, { t: 'load', c: 'kabir', d: 6 }],
              res: [say('raj', 'I am afraid. I can’t do this alone. Someone tell me what to do.', 'tired'), nar('Nobody has seen him like this. It lasts eleven seconds. When it is over he is sitting very straight, with something quite different in his shoulders.'), say('vikram', 'Papa. We’re here.', 'worried')],
            }),
          ],
          witness: [th('Raj on the sofa: he did not know what tablet she took. He cannot climb the hospital stairs. He is, for the first time in his life, the person who has to be told what to do — and he does not know how to ask for it.', 'hurt')],
          witnessLearn: ['pooja-pills'],
        },

        child: {
          who: S,
          stake: `Your mother is in a hospital bed and you cannot be there as much as you want to. ${sn === 'Rohan' ? 'You are already doing most of it, and no one knows.' : 'You have a life that cannot be left, and so does everyone else.'}`,
          reveals: [SECRET[S]],
          intro: [
            nar('2 a.m. The living room is full of coats nobody has taken off. Papa has the posture of a man bracing for a verdict.'),
            th(`Hypertensive crisis. “Missed doses.” You think of the strip on the kitchen shelf, nine tablets gone in three weeks, and how you stood in front of it and did not do the sum.`, 'hurt'),
            th(S === 'rohan' ? 'You have done the pharmacy, the doctors and the forms for a year. You don’t mind. You mind. You have no idea any more.' : S === 'vikram' ? 'You can do two nights. Maybe three. Aarav has an exam; you have a boss; you have a wife who has not slept either.' : 'Ananya cannot be alone with Anvi. You can do forms by phone. Everything else you can do is a lie.', 'tired'),
          ],
          notice: [{ id: 'phone-list', kind: 'look', label: 'the hospital’s visitor list', text: 'A notice by the door: “Overnight attendant required: 10 p.m.–6 a.m.” Beneath it, in Rohan’s handwriting, a schedule going back eleven days, with only his initials.' }],
          prompt: 'Five days of nights. Four people in the room. One list that needs names.',
          options: [
            opt('equal-rota', '“Equal nights — one each — and the weekend by lot. That’s fair.”', {
              act: oth.map((b) => act(S, b, 'impose', { c: 'autonomy', own: 'fairness', need: 0.7, tone: 'neutral', n: `${sn} proposed equal nights for everyone.` })),
              fx: [flag('mc-equal'), { t: 'fact', k: 'care', v: 'equal' }, ...SONS.map((x) => ({ t: 'load' as const, c: x, d: 8 }))],
              res: [say(S, 'Equal nights. One each. The weekend by lot. It’s fair.', 'neutral'), nar('It is fair. It is also a roster that assumes everyone has the same night to give.')],
              branches: [{ when: (q) => oth.some((o) => q.self(o, 'finStress') > 65), res: [say(oth[1], 'I’ll do it. I’ll just have to — move something.', 'tired'), nar('He means a deadline, a creditor or a night’s sleep. You will not ask which.')] }, { when: () => true, res: [nar('A reluctant nod goes round the room. It is accepted the way a prescription is.')] }],
            }),
            opt('by-capacity', '“Each of us says honestly what we can do. Then we fill the gaps together.”', {
              act: oth.map((b) => act(S, b, 'listen', { c: 'fairness', tone: 'warm', n: `${sn} asked his brothers to say what they honestly could do.` })),
              fx: [flag('mc-capacity'), { t: 'fact', k: 'care', v: 'capacity' }, { t: 'load', c: S, d: 6 }, { t: 'load', c: oth[0], d: 6 }, { t: 'load', c: oth[1], d: 4 }],
              res: [say(S, 'Each of us says honestly what we can do. Then we fill the gaps.', 'worried')],
              branches: [{ when: (q) => q.bond(oth[0], S, 'trust') >= 52 && q.bond(oth[1], S, 'trust') >= 52, fx: [learnFx(S, SECRET[oth[0]]), insightFx(SECRET[oth[0]]), learnFx(S, SECRET[oth[1]]), insightFx(SECRET[oth[1]])], res: [nar('You go round the room. By the end three men have said out loud what they cannot give, and nobody has been shamed. It is the longest conversation your family has ever had without raising its voice.')] }, { when: () => true, res: [say(oth[0], 'I can do whatever’s needed.', 'neutral'), nar('It is the sound of a man declining to say anything specific. You have heard it, from yourself, many times.')] }],
            }),
            opt('take-most', '“Leave it to me. I’ll do the nights. All of them.”', {
              act: act(S, c.SW, 'absorb', { c: 'belonging', need: 0.8, n: `${sn} promised to cover almost every night himself.` }),
              fx: [flag('mc-martyr'), { t: 'fact', k: 'care', v: 'one-carries' }, { t: 'load', c: S, d: 28 }, { t: 'self', c: S, d: { finStress: 6, security: -4 } }, later('burnout', 2, [{ t: 'self', c: S, d: { security: -5 } }, { t: 'bond', a: S, b: oth[0], d: { resentment: 5 } }, { t: 'bond', a: S, b: oth[1], d: { resentment: 5 } }], [{ speaker: S, text: 'I did five nights. Nobody counted. I counted.' }], { ifFlag: 'mc-martyr' })],
              res: [say(S, 'Leave it to me. I’ll do the nights. All of them.', 'tired'), say('raj', 'You are certain?', 'worried'), say(S, 'I’m certain.', 'tired'), nar('Relief goes round the room so fast that nobody asks you twice. You hear it, and you are quietly furious, and you cannot tell at whom.')],
            }),
            opt('pay-delegate', '“I can’t be there — but I’ll pay for a private nurse and a room. Whatever it costs.”', {
              act: [act(S, 'raj', 'offer', { c: 'money', tone: 'neutral', n: `${sn} offered to pay for a nurse rather than sit at the bedside.` }), ...oth.map((b) => act(S, b, 'dismiss', { c: 'fairness', tone: 'neutral', n: `${sn} offered money in place of his presence.` }))],
              fx: [flag('mc-pay'), { t: 'fact', k: 'care', v: 'paid' }, { t: 'self', c: S, d: { finStress: 10 } }],
              res: [say(S, 'I can’t be there. But I’ll pay for a nurse and a room. Whatever it costs.', 'worried'), say('raj', 'She does not want a nurse. She wants you.', 'hurt'), nar('He says it to the carpet. You have no answer that is not an excuse.')],
            }),
          ],
          witness: [th(`${sn}, in the living room, still wearing his coat: the strip of tablets on the kitchen shelf, the sums he did not do. He would sit with her every night if he could. He cannot, and it is eating him.`, 'tired')],
          witnessLearn: [SECRET[S]],
        },

        alok: {
          who: 'alok',
          stake: 'You paid for her tablets for three months — and it still was not enough. You also know something about who has been carrying all this.',
          reveals: ['alok-paid', 'pooja-pills'],
          intro: [
            nar('2 a.m., the corridor outside the ward. You have been at the pharmacy counter eleven times since morning, and each time the pharmacist has said: “Rohan-bhaiya has been coming for a year.”'),
            th('You have been paying for her tablets. You had not known she was taking half. You had thought it was enough.', 'hurt'),
            th('The sons are in a circle at the end of the corridor, tired and polite and about to disagree.', 'worried'),
          ],
          notice: [{ id: 'slip', kind: 'look', label: 'the pharmacist’s register', text: 'The pharmacist turns the register toward you. A year of refills, one name in the signature column, repeated: Rohan Verma. “He never asks for a discount,” she says. “He just says thank you.”', fx: [learnFx('alok', 'rohan-overload'), insightFx('rohan-overload')] }],
          prompt: 'They are about to divide a week of nights among themselves. You know how the arithmetic really stands.',
          options: [
            opt('volunteer-nights', '“I’ll take the nights. Let me. I’ve nowhere I need to be.”', {
              act: act('alok', 'raj', 'offer', { c: 'belonging', own: 'usefulness', need: 0.9, tone: 'warm', n: 'Alok offered to do the nights at Pooja’s bedside.' }),
              fx: [flag('mc-alok-nights'), { t: 'fact', k: 'care', v: 'alok' }, { t: 'load', c: 'alok', d: 25 }, { t: 'self', c: 'alok', d: { finStress: 8 } }, { t: 'bond', a: 'vikram', b: 'alok', d: { resentment: 4, respect: -2 } }],
              res: [say('alok', 'I’ll take the nights. I’ve nowhere I need to be.', 'warm'), say('raj', 'You have a shop, beta. And a life.', 'worried'), say('alok', 'Please, Uncle. Let me.', 'hopeful'), nar('Vikram watches you the way people watch a stranger lifting something that is theirs to lift.')],
            }),
            opt('accuse-sons', 'Say it to all of them: “She’d been halving her tablets for months. Did none of you look?”', {
              act: SONS.map((b) => act('alok', b, 'accuse', { c: 'dignity', own: 'fairness', need: 0.7, tone: 'harsh', pub: SONS.filter((x) => x !== b), n: `Alok told ${N(b)}, in the corridor, that he had not noticed Pooja halving her tablets.` })),
              fx: [flag('mc-alok-accused'), learnFx('vikram', 'pooja-pills'), learnFx('rohan', 'pooja-pills'), learnFx('kabir', 'pooja-pills')],
              res: [say('alok', 'She’d been halving her tablets for months. Did none of you look?', 'stern'), nar('Three men, three silences. It is true, and it is the worst possible moment for it to be true.')],
            }),
            opt('reveal-rohan', 'Tell them about the register: “Rohan has done almost every refill for a year. Has anyone thanked him?”', {
              when: (q) => q.knows('alok', 'rohan-overload'),
              act: [act('alok', 'rohan', 'intrude', { c: 'privacy', tone: 'gentle', pub: ['vikram', 'kabir'], n: 'Alok announced in the corridor that Rohan had done almost every refill for a year.' }), act('alok', 'vikram', 'accuse', { c: 'fairness', tone: 'blunt', n: 'Alok said none of the brothers had thanked Rohan.' })],
              fx: [flag('mc-alok-revealed'), learnFx('vikram', 'rohan-overload'), learnFx('kabir', 'rohan-overload'), { t: 'load', c: 'rohan', d: -8 }],
              res: [say('alok', 'Rohan has done almost every refill for a year. Has anyone thanked him?', 'stern'), say('rohan', 'It’s — it’s nothing, Alok —', 'hurt'), nar('Vikram looks at him as if for the first time since they were boys.')],
            }),
            opt('run-errands', 'Say nothing. Take the pharmacy list from Rohan’s hand. “Sit. I’ll do these.”', {
              act: act('alok', 'rohan', 'support', { c: 'usefulness', tone: 'warm', n: 'Alok took the pharmacy list from Rohan so he could rest.' }),
              fx: [flag('mc-alok-errands'), { t: 'load', c: 'alok', d: 8 }, { t: 'load', c: 'rohan', d: -6 }, { t: 'bond', a: 'rohan', b: 'alok', d: { trust: 6 } }],
              res: [say('alok', 'Sit. I’ll do these.', 'warm'), say('rohan', 'Alok, I can —', 'tired'), say('alok', 'I know you can. That’s why.', 'warm')],
            }),
          ],
          witness: [th('Alok, in the corridor: he has paid for her tablets. He has stood in a queue behind Rohan. He knows, without anyone telling him, who has been carrying this — and who has been standing in coats.', 'worried')],
          witnessLearn: ['rohan-overload', 'pooja-pills'],
        },
      },
      aftermathTime: 'morning',
      aftermath: [
        nar('Dawn, the fifth day. Pooja is awake in the ward and asking, with great dignity, for tea.'),
        ...iff((q) => q.fact('care') === 'raj-controlled', nar('The rota Raj wrote is stuck to the wall. It has been crossed out twice and rewritten in a smaller hand.')),
        ...iff((q) => q.fact('care') === 'capacity', nar('A sheet of paper in three hands: Vikram, nights; Kabir, forms; Rohan, pharmacy — and, in the margin, “Rohan: one week off.”')),
        ...iff((q) => q.fact('care') === 'equal', nar('A neat chart on the ward door. Fair on paper, grim on the ground: two sons look as if they have run a marathon, one looks fine.')),
        ...iff((q) => q.fact('care') === 'one-carries', nar('Someone has been at the bedside every night. It is the same someone. He looks, this morning, like a man who has not been asked how he is.')),
        ...iff((q) => q.fact('care') === 'paid', nar('A private nurse in a pale uniform, perfectly efficient, perfectly polite, perfectly a stranger. Pooja smiles at her and asks twice for her sons.')),
        ...iff((q) => q.fact('care') === 'raj-alone', nar('Raj has been on the ward stairs since the third night. He has been told off by three nurses. He has not been moved.')),
        ...iff((q) => q.flag('mc-vulnerable'), nar('Pooja has been told Raj said he was afraid. She has looked at him all morning as if he had performed a small miracle.')),
        ...iff((q) => q.flag('mc-alok-accused'), say('pooja', 'Alok shouted at my sons in a hospital corridor. He was right. I do not forgive him.', 'stern')),
        say('pooja', 'Whoever told you I was ill was exaggerating. Now — who brought tea?', 'warm'),
      ],
    }
  },
}
