import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, type Ctx, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const SONS: CharacterId[] = ['vikram', 'rohan', 'kabir']

export const S13: ScenarioDef = {
  id: 's13', n: 13, title: 'Unequal Responsibility', month: 'November',
  build: (c: Ctx) => {
    const S = c.S, sn = N(S), car = c.carer, cn = N(car), isCarer = S === car
    const oth = SONS.filter((x) => x !== car)
    return {
      where: 'kitchen', time: 'night',
      background: `Diwali week, and the lists are out: the pharmacy, the doctor’s appointments, the bank, the electricity bill, the helper’s pay, the prescription refills. For a year the same name has been beside most of them, in a small pencilled hand in a diary on Pooja’s kitchen shelf: ${cn}. Nobody has said so. Nobody has counted — except ${cn}.`,
      conflict: `${cn} has done almost all of it, and said almost nothing. His brothers are about to find out how much, in a kitchen, at night, by accident.`,
      involved: ['pooja', car, ...oth.slice(0, 1), 'alok'],
      lenses: {
        parent: {
          who: 'pooja',
          stake: `You have leaned on one son because he picks up the phone. You know it. You have not said it.`,
          reveals: ['rohan-overload'],
          intro: [
            nar('Midnight. The kitchen. The diary on the shelf is open at November.'),
            th(`${cn}. ${cn}. ${cn}. ${cn}. A column of his name, in pencil, in Pooja’s own handwriting, because she wrote it down for him when he forgot.`, 'hurt'),
            th('He picks up the phone. That is the whole of it. The others are busy, or far, or — you tell yourself — it is easier if one person knows where everything is.', 'tired'),
            say(car, 'Mummy, your tablets are on the second shelf. I got the new strip today.', 'tired'),
            nar('He says it like a man reporting from a trench. He has not slept properly in eleven months.'),
          ],
          notice: [{ id: 'diary', kind: 'look', label: 'the diary', text: `Thirty-one pharmacy runs. Nineteen doctor’s appointments. Seven bank queues. Four nights at the hospital. One name, in your handwriting. You have not once written another.`, fx: [insightFx('rohan-overload')] }],
          prompt: `${cn} is waiting, with a pharmacy bag in each hand, to be told he can go.`,
          options: [
            opt('admit', `“I called you because you picked up. That’s all it was. And it was unfair. I’m sorry, beta.”`, {
              act: act('pooja', car, 'apologize', { c: 'fairness', apology: { own: true, spec: true, nobut: true, change: false, for: 'fairness' }, tone: 'warm', n: `Pooja admitted she had called ${cn} because he picked up, and apologised.` }),
              fx: [flag('ur-admitted'), { t: 'comm', d: 2 }],
              res: [say('pooja', 'I called you because you picked up. That’s all it was. It was unfair. I’m sorry, beta.', 'tired'), say(car, 'Mummy — it’s all right —', 'worried'), say('pooja', 'It’s not. Don’t say it is.', 'warm')],
            }),
            opt('defend', 'Say it at the table tomorrow, in front of all of them: “Rohan has done more than all of you put together.”', {
              act: oth.map((b) => act('pooja', b, 'accuse', { c: 'fairness', own: 'fairness', need: 0.8, tone: 'blunt', pub: [car], n: `Pooja told ${N(b)} in front of the family that ${cn} had done more than all of them.` })),
              fx: [flag('ur-defended'), { t: 'bond', a: car, b: 'pooja', d: { trust: 4, heard: 6 } }, { t: 'bond', a: 'vikram', b: 'pooja', d: { respect: -2 } }],
              res: [say('pooja', `${cn} has done more than all of you put together.`, 'stern'), nar('It is true. It is also the first time she has ever said it, and she says it like a stone through a window.')],
            }),
            opt('keep-peace', '“Everyone does what they can, beta. Don’t count. It isn’t good for a family.”', {
              act: act('pooja', car, 'deflect', { c: 'fairness', tone: 'gentle', n: `Pooja told ${cn} that a family should not count who does what.` }),
              fx: [flag('ur-peace'), { t: 'issue', id: `${car}~pooja~fairness`, a: car, b: 'pooja', concern: 'fairness', sev: 0.5, text: 'The imbalance was waved away.' }],
              res: [say('pooja', 'Everyone does what they can, beta. Don’t count. It isn’t good for a family.', 'warm'), nar(`He nods. He has the diary in his coat pocket. He has been counting for a year, and you have just told him that he shouldn’t.`)],
            }),
            opt('redistribute', 'Ask each of them, one by one: “Which day of the week is yours? Not a favour. A day.”', {
              act: oth.map((b) => act('pooja', b, 'request', { c: 'fairness', own: 'fairness', need: 0.8, tone: 'gentle', why: true, alt: true, n: `Pooja asked ${N(b)} to take a fixed day each week for her care.` })),
              fx: [flag('ur-redistributed'), { t: 'fact', k: 'rota', v: 'fixed-days' }, { t: 'load', c: oth[0], d: 10 }, { t: 'load', c: oth[1], d: 10 }, { t: 'load', c: car, d: -14 }],
              res: [say('pooja', 'Which day of the week is yours? Not a favour. A day.', 'stern')],
              branches: [{ when: (q) => q.bond(oth[0], 'pooja', 'resentment') < 25, res: [say(oth[0], 'Tuesdays. I’ll take Tuesdays.', 'worried'), say(oth[1], 'Fridays. And — I’ll learn the pharmacy.', 'worried')] }, { when: () => true, res: [say(oth[0], 'I — Mummy, I’d have to check —', 'worried'), say('pooja', 'Then check. And tell me by Sunday.', 'stern')] }],
            }),
          ],
          witness: [th(`Pooja, with the diary: she wrote ${cn}’s name in her own hand, thirty-one times. She has leaned on him as one leans on a wall — without asking whether the wall is tired.`, 'tired')],
          witnessLearn: ['rohan-overload'],
        },

        child: {
          who: S,
          stake: isCarer ? 'You have done almost everything. You have said almost nothing. You are tired in a way that sleep is not going to fix.' : 'You have just learned that someone else has been doing the work you assumed was shared. You are about to find out what kind of person that makes you.',
          reveals: [SECRET[S], 'rohan-overload'],
          intro: isCarer ? [
            nar('Midnight in the kitchen. Your mother’s diary, open on the shelf. A column of your own name.'),
            th('Thirty-one pharmacy runs. Nineteen appointments. Seven queues at the bank. You have never once counted them aloud — and you have never once forgotten them.', 'tired'),
            th(`${N(oth[0])}’s voice: “Rohan’s always the one who picks up.” It is a fact; it was said as a compliment.`, 'hurt'),
            say(oth[0], `Hey — I didn’t realise you were still up. What’s that in your hand?`, 'neutral'),
          ] : [
            nar('Midnight in the kitchen. You came down for water and found Mummy’s diary open on the shelf.'),
            th(`${cn}. ${cn}. ${cn}. A column of his name, pages of it, in pencil. You flip back. It goes on for a year.`, 'hurt'),
            th(`You thought it was a shared thing. You thought you were all doing a bit. You have done three of the thirty-one runs. You can count them, because you were thanked for each.`, 'worried'),
            say(car, 'Oh. That’s — don’t read that. It’s only a list.', 'worried'),
          ],
          notice: [{ id: 'diary', kind: 'look', label: 'the diary', text: isCarer ? 'The column of your name. A single entry in another’s hand: “Vikram — 2 Mar — brought mangoes.” It is the only other name on the page.' : 'You turn pages. Your own name appears four times: a bank visit, a birthday, a lift to the clinic, “Vikram — mangoes.” His name appears everywhere else.', fx: [insightFx('rohan-overload')] }],
          prompt: isCarer ? `${N(oth[0])} is looking at the diary in your hand.` : `${cn} is looking at the diary in your hand, and at you.`,
          options: isCarer ? [
            opt('say-it', '“Thirty-one pharmacy runs. You’ve done three. I’m not complaining. I’m telling you.”', {
              act: oth.map((b) => act(S, b, 'accuse', { c: 'fairness', own: 'fairness', need: 0.9, tone: 'blunt', n: `${sn} told his brothers how many of Pooja’s errands he had done compared to them.` })),
              fx: [flag('ur-said'), { t: 'comm', d: 1 }, learnFx(oth[0], 'rohan-overload'), learnFx(oth[1], 'rohan-overload')],
              res: [say(S, 'Thirty-one pharmacy runs. You’ve done three. I’m not complaining. I’m telling you.', 'stern')],
              branches: [{ when: (q) => q.bond(oth[0], S, 'trust') >= 52, fx: [{ t: 'load', c: oth[0], d: 8 }, { t: 'load', c: S, d: -8 }], res: [say(oth[0], '…I didn’t know. I’m sorry. Give me the list.', 'hurt')] }, { when: () => true, res: [say(oth[0], 'You never said.', 'stern'), say(S, 'I’m saying now.', 'stern'), nar('It is fair. It sounds like a counter-attack. Both of you hear it.')] }],
            }),
            opt('ask-rota', '“Can we make a rota? I’d like one week off a month. Not a favour — a week.”', {
              act: oth.map((b) => act(S, b, 'request', { c: 'fairness', own: 'sleep', need: 0.8, tone: 'gentle', why: true, alt: true, hear: true, n: `${sn} asked his brothers for a rota and a week off a month.` })),
              fx: [flag('ur-rota'), { t: 'fact', k: 'rota', v: 'fixed-days' }, { t: 'load', c: oth[0], d: 6 }, { t: 'load', c: oth[1], d: 6 }, { t: 'load', c: S, d: -12 }],
              res: [say(S, 'Can we make a rota? One week off a month. Not a favour. A week.', 'worried')],
              branches: [{ when: (q) => q.bond(oth[0], S, 'respect') >= 52, res: [say(oth[0], 'Of course. I’ll start Monday. And I’m sorry it needed asking.', 'warm')] }, { when: () => true, res: [say(oth[0], 'A rota. Right. I’ll — have to check my calendar.', 'neutral')] }],
            }),
            opt('keep-absorbing', 'Put the diary back. “It’s only a list. I’m fine.”', {
              act: act(S, 'pooja', 'absorb', { c: 'fairness', need: 0.9, n: `${sn} put the diary back and said he was fine.` }),
              fx: [flag('ur-absorbed'), { t: 'self', c: S, d: { security: -4 } }, later('crack', 2, [{ t: 'self', c: S, d: { security: -5, finStress: 4 } }, { t: 'bond', a: S, b: 'raj', d: { resentment: 4 } }, { t: 'bond', a: S, b: 'pooja', d: { resentment: 4 } }], [{ speaker: S, text: 'I forgot the refill. First time in a year. Nobody said a word. Everyone saw.' }], { ifFlag: 'ur-absorbed' })],
              res: [say(S, 'It’s only a list. I’m fine.', 'tired'), nar('You put the diary back on the shelf. You will not forget its weight.')],
            }),
            opt('quit', '“I’m done. From tomorrow, someone else does the pharmacy, the bank and the doctors. I’m done.”', {
              act: [...oth.map((b) => act(S, b, 'refuse', { c: 'usefulness', own: 'sleep', need: 0.9, tone: 'harsh', n: `${sn} announced he was finished doing the parents’ errands.` })), act(S, 'pooja', 'refuse', { c: 'usefulness', tone: 'blunt', n: `${sn} told Pooja he could not do it any more.` })],
              fx: [flag('ur-quit'), { t: 'load', c: S, d: -22 }, { t: 'load', c: 'vikram', d: 6 }, { t: 'load', c: 'kabir', d: 6 }, { t: 'self', c: S, d: { security: 2 } }],
              res: [say(S, 'I’m done. From tomorrow someone else does it. I am done.', 'stern'), nar('The kitchen goes very quiet. Your mother, who has come in without a sound, is standing in the doorway with her hand at her mouth.')],
            }),
          ] : [
            opt('pay-more', '“I’ll put in more money, for a helper. That way you don’t have to.”', {
              act: act(S, car, 'offer', { c: 'fairness', tone: 'neutral', n: `${sn} offered to pay for more help instead of doing more himself.` }),
              fx: [flag('ur-money'), { t: 'self', c: S, d: { finStress: 6 } }, { t: 'load', c: S, d: 2 }],
              res: [say(S, 'I’ll put in more money. For a helper. So you don’t have to.', 'worried'), say(car, 'It’s not the money.', 'tired'), nar('He says it without heat. You know, at once, that it is the most useful thing anyone has said all year.')],
            }),
            opt('take-half', '“I’ll take half. From Monday. Teach me the pharmacy, and the doctors.”', {
              act: act(S, car, 'compromise', { c: 'fairness', alt: true, hear: true, tone: 'warm', n: `${sn} offered to take half of ${cn}’s errands, starting Monday.` }),
              fx: [flag('ur-half'), { t: 'load', c: S, d: 16 }, { t: 'load', c: car, d: -16 }, { t: 'fact', k: 'rota', v: 'split' }, { t: 'self', c: S, d: { finStress: 3 } }],
              res: [say(S, 'I’ll take half. From Monday. Teach me the pharmacy.', 'worried'), say(car, 'You’d have to — learn where everything is.', 'tired'), say(S, 'Then show me.', 'warm')],
            }),
            opt('defend', '“You never asked. If you’d said, I’d have done it.”', {
              act: act(S, car, 'dismiss', { c: 'fairness', tone: 'blunt', unk: 'rohan-overload', n: `${sn} told ${cn} that he should have asked if he wanted help.` }),
              fx: [flag('ur-defensive'), { t: 'bond', a: car, b: S, d: { resentment: 4 } }],
              res: [say(S, 'You never asked. If you’d said, I’d have done it.', 'stern'), say(car, 'That is what everyone says.', 'tired'), nar('He says it with no anger at all, which is why it hurts.')],
            }),
            opt('apologise', `“I didn’t see it. I should have. I’m sorry — and tomorrow I’ll start taking my share.”`, {
              act: act(S, car, 'apologize', { c: 'fairness', apology: { own: true, spec: true, nobut: true, change: true, for: 'fairness' }, tone: 'warm', n: `${sn} apologised to ${cn} for not seeing how much he did, and offered to take a share.` }),
              fx: [flag('ur-apologised'), { t: 'load', c: S, d: 12 }, { t: 'load', c: car, d: -12 }, { t: 'fact', k: 'rota', v: 'split' }],
              res: [say(S, 'I didn’t see it. I should have. I’m sorry. And tomorrow I start taking my share.', 'hurt')],
            }),
          ],
          witness: [th(`${sn}, at the shelf with the diary: ${isCarer ? 'he has counted every run, every queue, every night — and told no one, because he feared they would say it was nothing.' : `he has read the pages and done the sums. He sees that "shared" had meant "assumed." He will be ashamed for some time, and then, with luck, useful.`}`, 'tired')],
          witnessLearn: ['rohan-overload'],
        },

        alok: {
          who: 'alok',
          stake: 'You have stood in the pharmacy queue behind the same man for a year. You know what it costs.',
          reveals: ['alok-belong'],
          intro: [
            nar('Midnight in the kitchen. You came in for a glass of water and found the diary open, and ' + cn + ' reading it by the light of the open fridge.'),
            th(`You have seen him at the pharmacy. You have seen him in the hospital corridor. You have seen him say “it’s no trouble” in four different tones.`, 'worried'),
          ],
          notice: [{ id: 'queue', kind: 'memory', label: 'the pharmacy queue', text: 'Four in the evening, a hot Tuesday. A man in front of you with a bag of strips, rubbing his eyes. He turned and saw you and said “Don’t tell anyone I’m this tired.” You have not.', fx: [learnFx('alok', 'rohan-overload'), insightFx('rohan-overload')] }],
          prompt: 'He is right there, with the diary in his hand. The others are asleep.',
          options: [
            opt('tell-sons', 'Tell the other two, tomorrow, frankly: “He’s done nearly everything. He never said. I think you should know.”', {
              act: [act('alok', car, 'intrude', { c: 'privacy', tone: 'gentle', n: `Alok told ${cn}’s brothers how much ${cn} had done.` }), ...oth.map((b) => act('alok', b, 'accuse', { c: 'fairness', tone: 'blunt', n: `Alok told ${N(b)} his brother had done nearly everything.` }))],
              fx: [flag('ur-alok-told'), { t: 'load', c: car, d: -4 }, learnFx(oth[0], 'rohan-overload'), learnFx(oth[1], 'rohan-overload'), { t: 'bond', a: car, b: 'alok', d: { trust: -4 } }],
              res: [say('alok', 'He’s done nearly everything. He never said. I think you should know.', 'worried'), nar('It is true, and it is yours to say only because nobody else has.')],
            }),
            opt('cover', 'Say nothing to the sons — but take the pharmacy list from his hand. “From Friday I do these.”', {
              act: act('alok', car, 'support', { c: 'fairness', tone: 'warm', n: `Alok took over ${cn}’s pharmacy runs.` }),
              fx: [flag('ur-alok-cover'), { t: 'load', c: 'alok', d: 10 }, { t: 'load', c: car, d: -10 }, { t: 'self', c: 'alok', d: { finStress: 5 } }],
              res: [say('alok', 'From Friday I do these.', 'warm'), say(car, 'Alok, you’re not —', 'tired'), say('alok', 'I know I’m not. I’m doing it anyway.', 'warm')],
            }),
            opt('urge-ask', `Say to ${cn}: “You have to tell them. Not for them. For you.”`, {
              act: act('alok', car, 'support', { c: 'fairness', tone: 'warm', hear: true, n: `Alok told ${cn} he must say how much he was carrying.` }),
              fx: [flag('ur-alok-urged')],
              res: [say('alok', 'You have to tell them. Not for them. For you.', 'warm'), say(car, 'It will sound like a complaint.', 'tired'), say('alok', 'It will sound like a fact. Which it is.', 'warm')],
            }),
            opt('stay-out', 'Close the fridge door, say good night. It is a family’s matter.', {
              act: act('alok', car, 'absorb', { c: 'fairness', need: 0.6, n: `Alok found ${cn} reading the diary and said nothing.` }),
              fx: [flag('ur-alok-silent')],
              res: [nar('You drink your water. You put the glass in the rack. Tomorrow there will be a reason not to have said it.')],
            }),
          ],
          witness: [th(`Alok at the fridge: a year of pharmacy queues, always behind the same man. He has never said what he knows. It is the habit of an outsider who has made himself useful by being quiet.`, 'worried')],
          witnessLearn: ['rohan-overload'],
        },
      },
      aftermathTime: 'morning',
      aftermath: [
        nar('Morning. Diwali week. The diary is on the shelf where it always is.'),
        ...iff((q) => q.fact('rota') === 'fixed-days', nar('A chart on the fridge, in three hands: Tuesday, Friday, and a column of Rohan’s name with one fewer entry.')),
        ...iff((q) => q.fact('rota') === 'split', nar(`${N(S)} has been taught where everything is. He has already got the wrong strength twice. He has been forgiven twice.`)),
        ...iff((q) => q.flag('ur-absorbed') || q.flag('ur-peace'), nar('Nothing changed. The pencilled column keeps going.')),
        ...iff((q) => q.flag('ur-quit'), nar('Raj spent the night on the sofa. In the morning he says: “If someone must go to the pharmacy, I will go.” He walks, on that knee, the length of the lane.')),
        ...iff((q) => q.flag('ur-defensive'), say(car, 'He said “you never asked.” They all say that.', 'tired')),
        ...iff((q) => q.flag('ur-admitted'), nar('Pooja is at the shelf writing a second name beside the first. Her hand is slow, but it does not stop.')),
        say('pooja', 'I have been unfair for a year. I do not know how to be fair now. Help me.', 'tired'),
      ],
    }
  },
}
