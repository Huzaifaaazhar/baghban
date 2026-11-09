import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, sonsExcept, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const FIN: Record<string, string> = {
  vikram: 'Your bonus was halved this year and Meera does not know.',
  rohan: 'Three of your invoices are ninety days overdue; Simran has been covering the studio’s gaps.',
  kabir: 'You have eleven thousand to spare, a baby due soon, and a loan that has not moved.',
}

export const S02: ScenarioDef = {
  id: 's02', n: 2, title: 'Monthly Expenses', month: 'December',
  build: (c) => {
    const S = c.S, sn = N(S), SW = c.SW, oth = sonsExcept(S)
    return {
      where: 'dining-room', time: 'evening',
      background: 'The surgeon wants ₹3 lakh in advance for Raj’s knee, and the parents’ monthly costs — tablets, a helper, physiotherapy — come to about ₹26,000 against a pension of ₹21,000. Vikram has called a meeting and laid a printed spreadsheet on the table beside the chai. It already has three columns.',
      conflict: 'The sons agree that something must be done. They do not agree on what is fair — and not one of them has said what they can actually afford.',
      involved: ['raj', 'vikram', 'rohan', 'kabir', 'alok'],
      lenses: {
        parent: {
          who: 'raj',
          stake: 'You are being discussed over your own tea. You would rather be generous than helped.',
          reveals: ['raj-excluded'],
          enter: [act('vikram', 'raj', 'impose', { c: 'autonomy', tone: 'neutral', own: 'money', need: 0.7, n: 'Vikram divided Raj’s expenses into three columns before asking Raj.' })],
          intro: [
            nar('The spreadsheet has been printed and, you notice, laminated. Vikram has the look of a man who sat up with it.'),
            say('vikram', 'Papa — medicines, the helper, physio: about twenty-six thousand a month. The surgery advance is three lakh. I’ve split it three ways so nobody carries more than they should.', 'tired'),
            th('You hear it the way you hear all of it: after the decision, not before. “Split it three ways.” As if you were a bill that had arrived.', 'hurt'),
            nar('Rohan studies his tea. Kabir studies Rohan. Nobody has said what they can actually afford.'),
          ],
          notice: [
            { id: 'bonus', kind: 'look', label: 'Vikram’s hands', text: 'He keeps pressing one temple. Under his chair, a crumpled printout: “Performance Bonus — Revised.” He has rewritten the “Vikram” column twice.', fx: [learnFx('raj', 'vik-bonus'), insightFx('vik-bonus')] },
            { id: 'blank', kind: 'look', label: 'The blank row', text: 'At the bottom of the sheet there is a row marked “Mummy.” Every cell is empty. Nobody has asked her either.' },
          ],
          prompt: 'Three sons are waiting for you to say yes.',
          options: [
            opt('decline', '“I don’t need your money. My pension and my deposit will do.”', {
              act: act('raj', 'vikram', 'refuse', { c: 'approval', own: 'dignity', need: 0.95, tone: 'blunt', n: 'Raj turned down his sons’ help: “I don’t need your money.”' }),
              fx: [flag('ex-pride'), { t: 'fact', k: 'support', v: 'declined' }, later('knee', 2, [{ t: 'self', c: 'raj', d: { security: -4 } }, flag('knee-postponed')], [{ speaker: 'narrator', text: 'Raj has put the surgery off “until the deposit matures.” He is limping more, and saying less.' }], { ifFlag: 'ex-pride' })],
              res: [say('raj', 'I don’t need your money. My pension and my deposit will do.', 'stern'), say('vikram', 'Papa, they won’t. That’s what the sheet is for.', 'stern'), nar('Kabir, very softly: “…Papa, please.” Raj does not look up.')],
            }),
            opt('open-books', '“Sit. All of you. I’ll show you the passbook — every line.”', {
              act: ['vikram', 'rohan', 'kabir'].map((b) => act('raj', b as CharacterId, 'confide', { c: 'honesty', tone: 'warm', n: `Raj showed ${N(b as CharacterId)} the passbook.` })),
              fx: [flag('ex-open'), { t: 'fact', k: 'support', v: 'shared' }, { t: 'self', c: 'raj', d: { security: -2 } }, learnFx('kabir', 'raj-excluded'), learnFx('vikram', 'raj-excluded')],
              res: [say('raj', 'Sit. I will show you the passbook. All of it.', 'tired'), nar('He lays it on the table like a hand of cards he has been refusing to play. Forty-one thousand. A deposit with a name on it. Nobody speaks for a while.'), say('rohan', '…Papa. I didn’t know it was so little.', 'hurt')],
            }),
            opt('fair-shares', '“Not equal. Let each give what he can bear — and tell me what that is.”', {
              act: act('raj', 'vikram', 'impose', { c: 'recognition', own: 'fairness', need: 0.7, tone: 'neutral', why: true, alt: true, n: 'Raj rejected the equal split: shares should follow what each can bear.' }),
              fx: [flag('ex-fair'), { t: 'fact', k: 'support', v: 'proportional' }],
              res: [say('raj', 'Not equal. Let each give what he can bear. And let each tell me what that is.', 'neutral')],
              branches: [
                { when: (q) => q.bond('vikram', 'raj', 'resentment') < 28, res: [say('vikram', '…Fine. That’s — actually fairer than mine.', 'tired'), nar('He crosses out a column. It is the first time in months he has agreed with his father without a sigh.')] },
                { when: () => true, res: [say('vikram', 'Based on what? You haven’t asked what any of us earns.', 'stern'), say('raj', 'No. I am asking now.', 'stern'), nar('Nobody answers. The question stays on the table beside the sheet.')] },
              ],
            }),
            opt('postpone', '“Not tonight. Let us see after the surgery.”', {
              act: act('raj', 'vikram', 'deflect', { c: 'honesty', tone: 'neutral', n: 'Raj put off the money question until after the surgery.' }),
              fx: [flag('ex-postponed'), { t: 'fact', k: 'support', v: 'none' }],
              res: [say('raj', 'Not tonight. We will see after the surgery.', 'neutral'), say('vikram', 'The advance is due on the fifth, Papa.', 'tired'), nar('“Then we will see on the fourth,” says Raj, and reaches for his tea.')],
            }),
          ],
          witness: [th('Raj, at the table: forty-one thousand rupees and a deposit he promised Pooja he would never touch. Every sentence he is offered sounds, to him, like a verdict on whether he has failed.', 'hurt')],
          witnessLearn: ['raj-excluded'],
        },

        /* ------------------------------------------------------------ */
        child: {
          who: S,
          stake: `Everyone is about to talk about money, and you are carrying a number you haven’t said aloud. ${FIN[S]}`,
          reveals: [SECRET[S]],
          intro: [
            nar(S === 'vikram' ? 'You printed the spreadsheet yourself. It took you two nights and you told no one why it took so long.' : 'Vikram’s spreadsheet has been printed and laminated. You find you cannot look at the third column.'),
            th(FIN[S], 'worried'),
            say('vikram', S === 'vikram' ? 'It’s simple. Medicines, the helper, physio — twenty-six thousand a month. The advance is three lakh. Three equal parts.' : 'Equal thirds. It’s the only way nobody can say it was unfair.', 'tired'),
            nar('Raj says nothing. His hand has gone flat on the passbook he did not bring.'),
          ],
          notice: [
            ...(S !== 'rohan' ? [{ id: 'napkin', kind: 'look' as const, label: 'Rohan’s napkin', text: 'Rohan has been folding and unfolding a paper napkin with a column of figures on it. He crumples it each time you glance across. A studio invoice number is printed at the top, ringed twice.', fx: [learnFx(S, 'rohan-invoices'), insightFx('rohan-invoices')] }] : []),
            ...(S !== 'kabir' ? [{ id: 'phone', kind: 'look' as const, label: 'Kabir’s phone', text: 'Kabir’s phone is face-down, buzzing. He turns it over for half a second: a loan-reminder banner. He turns it back and stirs his tea.', fx: [learnFx(S, 'kabir-debt'), insightFx('kabir-debt')] }] : []),
            { id: 'recall', kind: 'memory' as const, label: 'Papa and the fixed deposit', text: 'Everyone in this room knows whose degree that deposit paid for. No one has said it. It is in the sheet anyway: a blank row where nobody has dared to write “Kabir — repay.”' },
          ],
          prompt: 'They are all looking at the sheet. Then, one by one, they look at you.',
          options: [
            opt('equal', '“Three equal shares. It’s the only fair way.”', {
              act: oth.map((b) => act(S, b, 'impose', { c: 'money', own: 'fairness', need: 0.7, tone: 'neutral', n: `${sn} backed equal thirds without asking what each could bear.` })),
              fx: [flag('ex-equal'), { t: 'fact', k: 'support', v: 'equal' }, { t: 'self', c: S, d: { finStress: 4 } }],
              res: [say(S, 'Three equal shares. It’s the only fair way.', 'neutral'), nar('It is the sound of a ruler laid on a table. Nobody can quite argue with it. Nobody looks pleased either.')],
              branches: [
                { when: (q) => q.self(oth[0], 'finStress') > 60 || q.self(oth[1], 'finStress') > 60, res: [say(oth[1], 'Equal. Of course. Equal is easy for the person whose month works.', 'hurt'), nar('The remark is aimed at no one. Everyone flinches.')] },
                { when: () => true, res: [nar('A grudging nod goes round the table.')] },
              ],
            }),
            opt('truth', '“I’ll tell you honestly what I can give. I’d like us all to do the same.”', {
              act: oth.map((b) => act(S, b, 'confide', { c: 'honesty', tone: 'warm', n: `${sn} told his brothers, honestly, what he could afford.` })),
              fx: [flag('ex-truth'), { t: 'fact', k: 'support', v: 'proportional' }, learnFx(oth[0], SECRET[S]), learnFx(oth[1], SECRET[S]), { t: 'self', c: S, d: { finStress: -4 } }],
              res: [say(S, 'I’ll tell you what I can give — honestly. And I’d like us all to.', 'worried'), nar(S === 'vikram' ? 'You tell them about the bonus. Hearing it aloud makes it smaller, and not much.' : S === 'rohan' ? 'You tell them about the invoices. It is easier than you feared, and worse.' : 'You tell them about the loan. Your voice does a thing you would have preferred it not to.')],
              branches: [
                { when: (q) => q.bond(oth[0], S, 'trust') >= 52 && q.bond(oth[1], S, 'trust') >= 52, fx: [learnFx(S, SECRET[oth[0]]), insightFx(SECRET[oth[0]]), learnFx(S, SECRET[oth[1]]), insightFx(SECRET[oth[1]])], res: [nar(`${N(oth[0])} goes next, carefully. Then ${N(oth[1])}. By the end three men know three numbers they had each been carrying alone.`)] },
                { when: () => true, res: [say(oth[0], 'Well. That’s your business, I suppose.', 'neutral'), nar('Nobody follows. You are left standing alone in your own honesty.')] },
              ],
            }),
            opt('cover', '“Leave it with me. I’ll cover the whole thing. No need to divide anything.”', {
              act: [act(S, 'raj', 'offer', { c: 'dignity', tone: 'warm', n: `${sn} offered to cover everything himself.` }), act(S, SW, 'absorb', { c: 'money', need: 0.8, n: `${sn} promised the whole sum without telling ${N(SW)}.` })],
              fx: [flag('ex-cover'), { t: 'fact', k: 'support', v: 'covered' }, { t: 'self', c: S, d: { finStress: 12 } }, { t: 'load', c: S, d: 4 },
                later('statement', 2, [flag('sw-knows'), { t: 'bond', a: SW, b: S, d: { trust: -8, resentment: 8, heard: -6 } }], [{ speaker: SW, text: 'I saw the statement. I am not angry about the money. I am angry about being the last to know.' }], { ifFlag: 'ex-cover' })],
              res: [say(S, 'Leave it with me. I’ll cover the whole thing.', 'neutral'), say('raj', 'I did not ask you to carry it alone.', 'stern'), nar('Relief goes round the table so fast it looks like politeness. Only Raj does not look relieved.')],
            }),
            opt('ask-papa', '“Before we divide anything — Papa, what do you actually want? What matters most?”', {
              act: act(S, 'raj', 'listen', { c: 'autonomy', tone: 'warm', n: `${sn} asked Raj what he actually wanted before anyone divided the money.` }),
              fx: [flag('ex-asked'), learnFx(S, 'raj-excluded'), insightFx('raj-excluded')],
              res: [say(S, 'Papa — before we divide a rupee: what do you want?', 'hopeful'), say('raj', 'Hm. The knee done before March. And Pooja’s tablets never to run out. That is all.', 'tired'), nar('It is a short list. You realise it is the first time he has been asked for one in this room.')],
            }),
          ],
          witness: [th(`${sn}, at the table, with a number he cannot say. ${FIN[S]} He proposes something that sounds like fairness, and means something else.`, 'worried')],
          witnessLearn: [SECRET[S]],
        },

        /* ------------------------------------------------------------ */
        alok: {
          who: 'alok',
          stake: 'You were brought in to carry chai. You know something about one brother’s money that he does not know you know.',
          reveals: ['rohan-invoices', 'alok-paid'],
          intro: [
            nar('You came to deliver Rohan’s brochures and were handed a tray. You are standing at the edge of a conversation about a family’s money.'),
            th('Rohan owes your press ₹14,000. You have not asked once. He has not brought it up. Every time you pass him, he looks away.', 'worried'),
            th('Pooja-aunty’s tablets: three months now, from your pocket. Your own supplier has had two polite reminders.', 'worried'),
            say('vikram', 'Three equal shares, Rohan. Can you do ₹9,000 a month?', 'tired'),
            say('rohan', 'Of course. Of course I can. Yes.', 'worried'),
          ],
          notice: [{ id: 'rohan-eyes', kind: 'look', label: 'Rohan’s face', text: 'He says yes before Vikram finishes. His smile arrives a second late, and stays too long.' }],
          prompt: 'He has just promised nine thousand rupees a month he does not have. You are the only other person who knows.',
          options: [
            opt('quiet-pay', 'Offer, quietly, to pay the surgeon’s advance yourself. “Uncle, please. Let me.”', {
              act: act('alok', 'raj', 'offer', { c: 'dignity', own: 'usefulness', need: 0.9, tone: 'gentle', n: 'Alok offered to pay the surgeon’s advance himself.' }),
              fx: [flag('ex-alok-paid'), { t: 'self', c: 'alok', d: { finStress: 12 } }, { t: 'bond', a: 'vikram', b: 'alok', d: { respect: -3, resentment: 5 } }, { t: 'fact', k: 'support', v: 'alok' }],
              res: [say('alok', 'Uncle, please. Let me pay the advance. It is only money.', 'hopeful'), say('raj', 'No, Alok. That is not — you are not to do this.', 'hurt'), nar('Vikram looks at you the way a man looks at a stranger who has picked up a bill he was still reading.')],
            }),
            opt('expose', '“Rohan — you still owe me ₹14,000. How will you find nine thousand a month?”', {
              act: act('alok', 'rohan', 'accuse', { c: 'dignity', own: 'fairness', need: 0.4, tone: 'harsh', pub: ['raj', 'vikram', 'kabir'], n: 'Alok announced, in front of the family, that Rohan owed him money.' }),
              fx: [flag('ex-alok-exposed'), { t: 'bond', a: 'vikram', b: 'rohan', d: { respect: -4 } }, learnFx('vikram', 'rohan-invoices'), learnFx('kabir', 'rohan-invoices')],
              res: [say('alok', 'Rohan — you owe me ₹14,000. How will you find nine thousand a month?', 'stern'), nar('The room goes silent in layers: first the words, then the spoons, then Rohan’s face.'), say('rohan', 'You — you said you’d never mention —', 'hurt')],
            }),
            opt('ask-rohan', 'Say nothing now. Catch Rohan on the stairs afterwards: “Whatever you’re carrying, I won’t make it heavier.”', {
              act: act('alok', 'rohan', 'support', { c: 'money', tone: 'warm', n: 'Alok told Rohan privately that the debt could wait.' }),
              fx: [flag('ex-alok-private'), learnFx('rohan', 'alok-paid')],
              res: [nar('Afterwards, on the stairs: “Whatever you’re carrying, I won’t make it heavier. The brochures can wait.”'), say('rohan', 'Alok — I swear I’ll —', 'hurt'), say('alok', 'I know. But don’t promise anyone else what you can’t. Not tonight.', 'warm')],
            }),
            opt('stay-out', 'Excuse yourself to the kitchen. It is not your family’s money.', {
              act: act('alok', 'rohan', 'absorb', { c: 'honesty', need: 0.5, n: 'Alok knew Rohan had promised more than he had, and said nothing.' }),
              fx: [flag('ex-alok-silent'), later('rohan-late', 2, [{ t: 'self', c: 'rohan', d: { finStress: 8 } }, flag('rohan-overpromised')], [{ speaker: 'narrator', text: 'Rohan’s first ₹9,000 has not arrived. He has stopped answering Vikram’s calls after seven in the evening.' }])],
              res: [nar('In the kitchen the tap runs over a cup that is already clean. Through the wall, you hear Rohan say “Done.”')],
            }),
          ],
          witness: [th('Alok, with the tray, knows more than anyone: Rohan’s invoices, Pooja’s tablets paid out of his own pocket. He is nobody’s son and everyone’s keeper of secrets — which is exactly the position he cannot afford to abuse.', 'worried')],
          witnessLearn: ['rohan-invoices', 'alok-paid'],
        },
      },
      aftermathTime: 'night',
      aftermath: [
        nar('Later, the spreadsheet lies on the table beside the cold chai.'),
        ...iff((q) => q.flag('ex-pride'), nar('Raj has folded his napkin into a very small square. He has told his sons they have no part in this, and is now alone with that.')),
        ...iff((q) => q.flag('ex-open'), nar('Raj’s passbook is still open. It has been a long time since the family has all seen the same number at once.')),
        ...iff((q) => q.flag('ex-fair'), nar('The sheet has been crossed out and rewritten in three hands. The numbers are uneven. It is somehow harder to argue with.')),
        ...iff((q) => q.flag('ex-equal'), nar('Thirds. Perfectly equal. Kabir is doing arithmetic on his thumb.')),
        ...iff((q) => q.flag('ex-truth'), nar('Three men, three honest numbers. Nobody is comfortable. Everybody is less afraid.')),
        ...iff((q) => q.flag('ex-cover'), nar('Nothing more is said. The money will simply appear. Whose it is, nobody asks.')),
        ...iff((q) => q.flag('ex-asked'), say('raj', 'The knee, then Pooja’s tablets. Do those two things and I will argue about the rest.', 'tired')),
        ...iff((q) => q.flag('ex-postponed'), nar('The advance is due on the fifth. It is the third.')),
        ...iff((q) => q.flag('ex-alok-exposed'), say('rohan', 'He told everyone. In front of Papa.', 'hurt'), nar('Alok sits very still, as if he might still take it back.')),
        ...iff((q) => q.flag('ex-alok-paid'), say('pooja', 'Alok has been paying for my tablets. Did none of you ask where they came from?', 'stern')),
        say('pooja', 'Eat something. All of you. Nobody decides anything better on an empty stomach.', 'tired'),
      ],
    }
  },
}
