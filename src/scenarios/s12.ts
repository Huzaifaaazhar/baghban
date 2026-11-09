import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, OFFER, SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const WHERE: Record<string, { city: string; job: string }> = {
  vikram: { city: 'Pune', job: 'the regional head’s role at the Pune office' },
  rohan: { city: 'Hyderabad', job: 'a salaried partnership at a studio in Hyderabad' },
  kabir: { city: 'Bengaluru', job: 'a senior analyst role in Bengaluru' },
}

export const S12: ScenarioDef = {
  id: 's12', n: 12, title: 'Career Decision', month: 'October',
  build: (c) => {
    const S = c.S, sn = N(S), W = c.SW, wn = N(W), J = WHERE[S]
    const warm = (q: import('../sim/types').Q) => q.bond('raj', S, 'trust') >= 56 && q.bond('raj', S, 'resentment') < 26
    return {
      where: 'balcony', time: 'evening',
      background: `${sn} has been offered ${J.job}. It would clear his loan, his household’s anxieties, and probably his marriage’s. It would take him to ${J.city}, five hundred miles from his parents, after a year in which the family has barely held together. He has told no one, and has had the letter in his drawer for eleven days.`,
      conflict: 'Nobody has said the word “leave.” Everybody is already afraid of it.',
      involved: ['raj', S, W, 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: `A son is about to tell you something. You can feel it in the way he stands. You are afraid, and you will hear yourself being formal.`,
          reveals: ['raj-excluded'],
          intro: [
            nar(`The balcony. The lamps along the lane are being lit one at a time. ${sn} has joined you at the rail, which he does not usually do.`),
            th('He has been carrying something for days. He has held a letter in his hand at the breakfast table and put it away unopened. You noticed. You said nothing.', 'worried'),
            say(S, 'Papa — I need to tell you something. I want you to hear all of it before you say anything.', 'worried'),
            nar(`He says: “${J.job}. In ${J.city}.” He says: “It clears the loan.” He says: “I haven’t said yes.” He has not said what he wants.`),
            th('Five hundred miles. The knee. Pooja’s tablets. The Sunday lunch. All the small, specific hooks of a life, and you are being asked to unhook one.', 'hurt'),
          ],
          notice: [{ id: 'hands', kind: 'look', label: `${sn}’s hands`, text: `They are trembling slightly on the rail. He is waiting for you to be a father: to disapprove, so that he may stay; or to approve, so that he may go. Either would be a kind of relief for him. Neither is quite what you have to give.`, fx: [learnFx('raj', OFFER[S]), insightFx(OFFER[S])] }],
          prompt: 'He has stopped speaking. The lamps are almost all lit.',
          options: [
            opt('bless', '“Go. If it’s right for you, go. But Sunday calls, and the first week of every month — those are mine.”', {
              act: act('raj', S, 'compromise', { c: 'belonging', alt: true, hear: true, tone: 'warm', n: `Raj blessed ${sn}’s move, asking for Sunday calls and a week a month.` }),
              fx: [flag('cd-blessed'), { t: 'fact', k: 'relocated', v: S }, { t: 'load', c: S, d: -14 }, { t: 'agree', id: 'sundays', between: ['raj', S], text: `${sn} calls every Sunday and comes home the first week of each month.` }, { t: 'self', c: S, d: { finStress: -8, security: 3 } }, { t: 'self', c: 'raj', d: { security: -3 } }],
              res: [say('raj', 'Go. If it is right for you, go. But Sunday calls, and the first week of every month. Those are mine.', 'tired'), nar('It costs him something you cannot see. You can hear it, in the particular steadiness of the voice.')],
            }),
            opt('guilt', '“Your mother’s health, my knee, and you will take them five hundred miles away. I see.”', {
              act: act('raj', S, 'guilt', { c: 'belonging', tone: 'blunt', n: `Raj told ${sn} that going would mean abandoning his mother’s health and his own knee.` }),
              fx: [flag('cd-guilt'), { t: 'fact', k: 'relocated', v: 'none' }, { t: 'self', c: S, d: { security: -4 } }, later('stayed', 2, [{ t: 'bond', a: S, b: 'raj', d: { resentment: 7, distance: 5 } }], [{ speaker: S, text: 'I turned it down. I did not do it for you, Papa. I did it because you made it impossible to do anything else.' }], { ifFlag: 'cd-guilt' })],
              res: [say('raj', 'Your mother’s health. My knee. And you will take yourself five hundred miles away. I see.', 'stern'), say(S, 'Papa — I wasn’t asking —', 'hurt'), say('raj', 'You are not asking. You are telling.', 'stern')],
            }),
            opt('hide-hurt', '“Congratulations, beta. It is a fine thing. Don’t think about us.”', {
              act: act('raj', S, 'absorb', { c: 'belonging', need: 0.95, n: `Raj congratulated ${sn} and hid how much it hurt.` }),
              fx: [flag('cd-hidden'), { t: 'fact', k: 'relocated', v: S }, { t: 'load', c: S, d: -14 }, { t: 'self', c: 'raj', d: { security: -5 } }, later('quiet', 2, [{ t: 'self', c: 'raj', d: { security: -3 } }], [{ speaker: 'narrator', text: `Raj has told everyone that ${sn} is doing wonderfully. He tells them in the same tone he used on the day of the retirement dinner.` }], { ifFlag: 'cd-hidden' })],
              res: [say('raj', 'Congratulations, beta. It is a fine thing. Don’t think about us.', 'warm'), nar('He means every word of it and the opposite of every word. You are the only one in the family who could hear both.')],
            }),
            opt('ask-need', '“Tell me what you need to decide. I will tell you honestly what I would miss. Then you choose.”', {
              act: act('raj', S, 'listen', { c: 'autonomy', tone: 'warm', hear: true, n: `Raj asked ${sn} what he needed in order to decide, and said what he would miss.` }),
              fx: [flag('cd-asked'), { t: 'comm', d: 2 }, { t: 'self', c: 'raj', d: { security: -2 } }],
              res: [say('raj', 'Tell me what you need to decide. I will tell you honestly what I would miss. Then you choose.', 'tired')],
              branches: [{ when: warm, fx: [{ t: 'fact', k: 'relocated', v: S }, { t: 'load', c: S, d: -14 }, { t: 'self', c: S, d: { finStress: -8, security: 3 } }], res: [say(S, 'I’d miss the Sunday lunches. I’d miss you being near. But it’s the first thing I’ve been offered in six years.', 'worried'), say('raj', 'Then take it. And let me visit.', 'tired')] }, { when: () => true, fx: [{ t: 'fact', k: 'relocated', v: 'undecided' }], res: [say(S, 'I — thank you. I’ll think about it. Let me think.', 'worried'), nar('You have not decided anything. You have, perhaps, kept the door ajar.')] }],
            }),
          ],
          witness: [th('Raj at the rail: five hundred miles is the distance between a man and everything he knows. He will say “congratulations” in the same voice he has used for forty years to say things he does not mean.', 'hurt')],
          witnessLearn: ['raj-excluded'],
        },

        child: {
          who: S,
          stake: `The offer clears your loan, your fear and perhaps your marriage. It also takes you away from the people who most need you — and who, you are beginning to suspect, most need you gone.`,
          reveals: [OFFER[S], SECRET[S]],
          intro: [
            nar('The offer letter has been in your drawer for eleven days. You have read it more often than any book.'),
            th(`${J.city}. ${J.job.charAt(0).toUpperCase() + J.job.slice(1)}. It clears the loan. It would give ${wn} the first uninterrupted year of her life.`, 'hopeful'),
            th('And you would be five hundred miles from Mummy’s tablets and Papa’s knee, and the Sunday lunches, and the whole architecture of a family that has barely held together this year.', 'worried'),
            say('raj', 'You are standing very still, beta. It is a bad sign in a man.', 'neutral'),
          ],
          notice: [{ id: 'letter', kind: 'look', label: 'the letter in your pocket', text: 'The date, the salary, the signature of a stranger who has valued you at a number you did not know you were worth. It says: “We hope to hear from you by the 31st.” It does not say what the 31st will cost.' }],
          prompt: 'He is at the rail. You are standing beside him with a letter in your pocket.',
          options: [
            opt('announce', '“Papa, I’ve accepted. I wanted you to hear it from me.”', {
              act: act(S, 'raj', 'impose', { c: 'autonomy', own: 'autonomy', need: 0.8, tone: 'neutral', n: `${sn} told Raj he had already accepted the offer.` }),
              fx: [flag('cd-announced'), { t: 'fact', k: 'relocated', v: S }, { t: 'load', c: S, d: -14 }, { t: 'self', c: S, d: { finStress: -8 } }],
              res: [say(S, 'Papa, I’ve accepted. I wanted you to hear it from me.', 'worried'), nar('He turns, very slowly. It is not the news; it is the tense. “Accepted.”')],
            }),
            opt('ask-blessing', '“Papa, I haven’t accepted. I’d like your blessing before I do — and I want to hear what you’d miss.”', {
              act: act(S, 'raj', 'request', { c: 'autonomy', tone: 'gentle', hear: true, why: true, n: `${sn} asked Raj for his blessing before accepting the offer.` }),
              fx: [flag('cd-asked-blessing')],
              res: [say(S, 'Papa, I haven’t accepted. I’d like your blessing first. And I want to hear what you’d miss.', 'worried')],
              branches: [{ when: (q) => q.bond('raj', S, 'trust') >= 55, fx: [{ t: 'fact', k: 'relocated', v: S }, { t: 'load', c: S, d: -14 }, { t: 'agree', id: 'sundays', between: ['raj', S], text: `${sn} calls every Sunday and comes home the first week of each month.` }], res: [say('raj', 'I will miss the Sundays. I will miss you walking in without knocking. Go. But call.', 'tired')] }, { when: () => true, fx: [{ t: 'fact', k: 'relocated', v: 'undecided' }], res: [say('raj', 'You are asking me to give you permission.', 'stern'), say(S, 'I’m asking you to tell me what you actually feel.', 'worried'), nar('He doesn’t answer. But he doesn’t leave the balcony either.')] }],
            }),
            opt('hide-delay', 'Say nothing. Let the deadline pass, and decide later. “Maybe it’ll sort itself out.”', {
              act: act(S, 'raj', 'withhold', { c: 'honesty', tone: 'gentle', n: `${sn} kept the job offer to himself until the deadline.` }),
              fx: [flag('cd-hid'), { t: 'fact', k: 'relocated', v: 'none' }, { t: 'issue', id: `raj~${S}~honesty~unvoiced`, a: 'raj', b: S, concern: 'honesty', sev: 0.4, text: 'An offer was hidden until it expired.' }, later('found', 2, [{ t: 'bond', a: 'raj', b: S, d: { trust: -8, heard: -5 } }], [{ speaker: 'raj', text: 'Alok told me. About the letter. I would rather have heard it from you, and I would have said something different.' }], { ifFlag: 'cd-hid' })],
              res: [nar('The 31st goes by. You do not say yes. You do not say no. The silence on the balcony is the silence of a decision made by not making it.')],
            }),
            opt('refuse-silently', 'Turn it down and tell no one. “They need me more. I will pretend it was never offered.”', {
              act: act(S, c.SW, 'absorb', { c: 'autonomy', need: 0.85, n: `${sn} turned down the job offer and told no one why.` }),
              fx: [flag('cd-refused'), { t: 'fact', k: 'relocated', v: 'none' }, { t: 'self', c: S, d: { finStress: 6, security: -4 } }, later('resent', 2, [{ t: 'bond', a: S, b: 'raj', d: { resentment: 6 } }, { t: 'bond', a: S, b: 'pooja', d: { resentment: 4 } }, { t: 'bond', a: c.SW, b: 'raj', d: { resentment: 4 } }], [{ speaker: c.SW, text: 'He turned it down, and he’s been very good about it, and I would rather he had been angry.' }], { ifFlag: 'cd-refused' })],
              res: [nar('You write the refusal on the Friday. You send it on the Saturday. On Sunday you bring Papa his tea, and he says “thank you,” as he always does, and has no idea what he has been given.')],
            }),
          ],
          witness: [th(`${sn}, with a letter in his pocket: he has not told anyone. He has not said whether he wants it, because wanting it feels like a betrayal. He is five hundred miles from where he wants to be, and has not yet moved.`, 'worried')],
          witnessLearn: [OFFER[S]],
        },

        alok: {
          who: 'alok',
          stake: 'You were told first. You were told, in confidence, a thing the family does not yet know. Everyone will ask you what you knew.',
          reveals: ['alok-belong', OFFER[S]],
          intro: [
            nar(`${sn} told you at the press on Thursday, while you were cutting stock. He said it as if reading the sentence from a card, and then said: “Please don’t say a word to anyone.”`),
            th('You said: “Of course.” You meant it. You are now carrying it, which is heavier than the stock.', 'worried'),
            th('It is Sunday. You are at Verma Sadan. Raj-uncle is looking at his son with the particular alertness of a man who senses weather.', 'worried'),
          ],
          prompt: 'Everyone is on the balcony. You are the only one who knows.',
          options: [
            opt('leak', 'Take Raj aside: “Uncle, he has something to tell you. Please be kind when he does.”', {
              act: [act('alok', S, 'intrude', { c: 'privacy', tone: 'gentle', n: `Alok told Raj that ${sn} had something to tell him, against ${sn}’s wishes.` }), act('alok', 'raj', 'confide', { c: 'belonging', tone: 'warm', n: 'Alok warned Raj that his son had news.' })],
              fx: [flag('cd-alok-leaked'), learnFx('raj', OFFER[S]), { t: 'bond', a: S, b: 'alok', d: { trust: -9, respect: -3 } }],
              res: [say('alok', 'Uncle, he has something to tell you. Please be kind when he does.', 'worried'), say('raj', 'What something?', 'stern'), nar('You have said too much and not enough. You see in his face that he has already begun to compose himself for it.')],
            }),
            opt('advise-go', `Say to ${sn} later, on the stairs: “You should go. They’ll cope. You can’t save them by staying.”`, {
              act: act('alok', S, 'support', { c: 'autonomy', tone: 'warm', n: `Alok told ${sn} he should take the job.` }),
              fx: [flag('cd-alok-go'), { t: 'bond', a: 'raj', b: 'alok', d: { trust: -2 } }],
              res: [say('alok', 'You should go. They’ll cope. You can’t save them by staying.', 'warm'), say(S, 'You think so?', 'hopeful'), say('alok', 'I think nobody stays for ever and everyone pretends.', 'tired')],
            }),
            opt('advise-stay', `Say to ${sn}: “They need you. I’d stay. If I had a family, I would never leave them.”`, {
              act: act('alok', S, 'guilt', { c: 'belonging', tone: 'gentle', n: `Alok told ${sn} that he should stay with his parents.` }),
              fx: [flag('cd-alok-stay'), { t: 'bond', a: S, b: 'alok', d: { resentment: 4 } }],
              res: [say('alok', 'They need you. If I had a family I would never leave them.', 'worried'), say(S, 'That’s easy to say when it isn’t yours.', 'hurt'), nar('He is right, and you know it, and you meant it, and you should not have said it.')],
            }),
            opt('just-listen', `Say: “Whatever you decide, I’m here. Tell me what you want, not what you ought.”`, {
              act: act('alok', S, 'listen', { c: 'autonomy', tone: 'warm', hear: true, n: `Alok asked ${sn} what he wanted, not what he ought to do.` }),
              fx: [flag('cd-alok-listened')],
              res: [say('alok', 'Whatever you decide, I’m here. Tell me what you want. Not what you ought.', 'warm'), say(S, 'I want to go. God help me, I want to go.', 'hurt')],
            }),
          ],
          witness: [th(`Alok, who was told first: he sat on a stack of paper and was handed a secret, as if it were a tea cup. He has spent the week holding it very carefully, afraid that the wrong breath would spill it.`, 'worried')],
          witnessLearn: [OFFER[S]],
        },
      },
      aftermathTime: 'night',
      aftermath: [
        nar('Later, on the balcony, the lamps along the lane have all been lit.'),
        ...iff((q) => q.fact('relocated') === S, nar(`A suitcase appears in the passage. ${sn} says “I have not left yet.” Raj says “No.” Neither of them looks at the case.`)),
        ...iff((q) => q.fact('relocated') === 'none', nar(`${sn} will not be going to ${J.city}. The letter is in a drawer. Everyone knows; nobody says what it means.`)),
        ...iff((q) => q.fact('relocated') === 'undecided', nar('Nothing is settled. The deadline is the thirty-first, and it is on everyone’s face.')),
        ...iff((q) => q.flag('cd-guilt'), say('pooja', 'You told him what he was giving up. Did you tell him what he would be getting?', 'stern')),
        ...iff((q) => q.flag('cd-hidden'), nar('Raj puts on the radio. It is a very loud cricket commentary. He turns the volume up.')),
        ...iff((q) => q.flag('cd-alok-leaked'), say(S, 'Who told him? I only told one person.', 'hurt')),
        ...iff((q) => q.flag('cd-refused'), say(c.SW, 'He’ll say it was nothing. It was not nothing.', 'tired')),
        say('raj', 'A man should be allowed one proper decision in his life.', 'tired'),
      ],
    }
  },
}
