import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, WIFE_SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const GRIEVE: Record<string, string> = {
  meera: 'Meera is back from school at six. “A home needs a woman’s evening, beta,” you told her, twice. She said nothing, and you took that as agreement.',
  simran: 'Simran takes client calls at the dinner table. “In my time, work stayed at work,” you said — in front of Rohan.',
  ananya: 'Ananya is still at her half-day desk at eight months. You have told her three times to stop, and once to Kabir instead.',
}
const WORRY: Record<string, string> = {
  meera: 'You think Meera should ease off at school and be at home in the evenings; you have told Vikram to say so.',
  simran: 'You think Simran should stop taking calls at the table; Raj has told Rohan “a man holds the purse.”',
  ananya: 'You think Ananya should stop working and keep to the old customs; Raj has told Kabir to “take charge of the accounts.”',
}
const HER: Record<string, string> = { meera: 'her job', simran: 'her work', ananya: 'her desk' }

export const S04: ScenarioDef = {
  id: 's04', n: 4, title: 'Marriage Interference', month: 'February',
  build: (c) => {
    const S = c.S, sn = N(S), W = c.SW, wn = N(W)
    const trusting = (q: import('../sim/types').Q) => q.bond(W, 'pooja', 'trust') >= 56 && q.bond(W, 'pooja', 'resentment') < 24
    return {
      where: 'courtyard', time: 'afternoon',
      background: `Basant Panchami lunch in the courtyard at Verma Sadan, under the neem. Marigolds, a pot of khichdi, the whole family seated on dhurries. ${WORRY[W]} It has been said in private, to ${sn}, and — in pieces, through the kitchen door — to ${wn} herself.`,
      conflict: `${sn} is caught between his parents’ fear and his wife’s life. ${wn} has stopped arguing, which is not the same as agreeing.`,
      involved: ['pooja', 'raj', S, W, 'alok'],
      lenses: {
        parent: {
          who: 'pooja',
          stake: 'You are worried — about the marriage, about the house, about being needed — and you have begun to call it advice.',
          reveals: ['pooja-excluded', 'pooja-sacrificed'],
          intro: [
            nar('The khichdi has been served and the marigolds are going limp in the sun. Raj is holding forth to Alok about the price of pulses.'),
            th(GRIEVE[W], 'worried'),
            th('You gave up your embroidery classes the year Kabir left, so that the pension would stretch. You have never said you missed them. Nobody asked what you would have preferred.', 'tired'),
            say(S, 'Mummy — you wanted to talk to me?', 'neutral'),
            nar(`Across the courtyard, ${wn} is carrying a tray. She is not looking at you with great care.`),
          ],
          notice: [
            { id: 'wife-hands', kind: 'look', label: `${wn}’s hands`, text: `She has been stirring the same cup for a very long time. She laughs when someone speaks to her, a half-second late. ${WIFE_SECRET[W] === 'meera-watched' ? 'She has the look of someone who has not been entirely at ease in her own home for months.' : WIFE_SECRET[W] === 'simran-judged' ? 'She has the look of a woman who has stopped repeating what she has heard.' : 'She has the look of someone who has not slept properly in weeks.'}`, fx: [learnFx('pooja', WIFE_SECRET[W]), insightFx(WIFE_SECRET[W])] },
            { id: 'frame', kind: 'memory', label: 'your embroidery frame', text: 'It is still in the almirah, the cloth half-stitched: a peacock, one tail feather short. You have not looked at it since the year Kabir left.' },
          ],
          prompt: `${sn} is waiting. The marigolds smell of sun and endings.`,
          options: [
            opt('advise', `“Beta, I only say it for your own good: ${HER[W]} — a woman should keep her home first.”`, {
              act: act('pooja', S, 'impose', { c: 'autonomy', own: 'tradition', need: 0.7, tone: 'gentle', unk: WIFE_SECRET[W], n: `Pooja told ${sn} that ${wn} should put her home before ${HER[W]}.` }),
              fx: [flag('mi-advised'), { t: 'issue', id: `${W}~pooja~autonomy`, a: W, b: 'pooja', concern: 'autonomy', sev: 0.35, text: `${wn} was discussed behind her back.` }],
              res: [say('pooja', `Beta, I only say it for your own good. ${HER[W][0].toUpperCase() + HER[W].slice(1)} — a woman should keep her home first.`, 'warm'), say(S, 'Mummy —', 'worried'), nar(`He glances toward the tray in ${wn}’s hands. She has heard. She sets it down with exquisite care.`)],
              branches: [{ when: (q) => !trusting(q), acts: [act('pooja', W, 'shame', { c: 'autonomy', pub: [S], tone: 'gentle', n: `${wn} overheard Pooja discussing her.` })], res: [say(W, 'I’ll bring more water.', 'stern')] }, { when: () => true, res: [nar(`${wn} pretends she has not heard. It costs her something.`)] }],
            }),
            opt('speak-kindly', `Go to ${wn} yourself: “Beta, I worry you’re doing too much. Tell me how I can help — not how you should change.”`, {
              act: act('pooja', W, 'offer', { c: 'autonomy', tone: 'warm', hear: true, alt: true, n: `Pooja asked ${wn} how she could help, rather than how ${wn} should change.` }),
              fx: [flag('mi-kind')],
              res: [say('pooja', 'Beta, I worry you’re doing too much. Tell me how I can help. Not how you should change.', 'warm')],
              branches: [
                { when: trusting, fx: [learnFx('pooja', WIFE_SECRET[W]), insightFx(WIFE_SECRET[W]), { t: 'agree', id: 'mi-rules', between: ['pooja', W], text: `Pooja brings concerns to ${wn} privately, never at the table.` }], res: [say(W, 'Mummyji… thank you. I didn’t think you — can we talk? Properly?', 'tired'), nar('She tells you one thing she has not told Raj’s son. It is not a large thing. It is a door.')] },
                { when: () => true, res: [say(W, 'That’s kind of you, Mummyji. Thank you.', 'neutral'), nar('She says it politely, and with a smile that does not reach her hands. The door is not open yet.')] },
              ],
            }),
            opt('back-off', 'Say nothing. Press your lips together and carry the khichdi round.', {
              act: act('pooja', S, 'absorb', { c: 'tradition', need: 0.7, n: 'Pooja swallowed her worry about the marriage and said nothing.' }),
              fx: [flag('mi-silent'), later('sharp', 2, [{ t: 'bond', a: W, b: 'pooja', d: { distance: 4 } }, { t: 'self', c: 'pooja', d: { security: -3 } }], [{ speaker: 'narrator', text: 'Pooja has become very quiet at meals. Her comments, when they come, have a sharper edge than before.' }])],
              res: [nar('You carry the khichdi. You do not say it. It does not go away; it sits behind your teeth through the rest of the meal.')],
            }),
            opt('ask-her', `Take ${wn} aside: “When I disagree with you, what should I do, beta? Tell me — I honestly don’t know.”`, {
              act: act('pooja', W, 'listen', { c: 'autonomy', tone: 'warm', hear: true, n: `Pooja asked ${wn} what she should do when she disagreed.` }),
              fx: [flag('mi-asked'), learnFx('pooja', WIFE_SECRET[W]), insightFx(WIFE_SECRET[W])],
              res: [say('pooja', 'When I disagree with you, what should I do, beta? Tell me. I honestly don’t know.', 'tired'), say(W, '…Mummyji. Nobody has asked me that before.', 'worried'), nar('She tells you, after a while. It is not what you expected. It is much less than you had feared and a great deal more than you had known.')],
            }),
          ],
          witness: [th(`Pooja, with khichdi in both hands: she gave up the thing that was hers so the house could stretch. Now she holds ${wn} to a standard no one ever held her to. She does not see the connection yet.`, 'tired')],
          witnessLearn: ['pooja-sacrificed'],
        },

        child: {
          who: S,
          stake: `You are standing between two women you love, and neither will say the thing to the other. ${wn} has asked you one thing: “Don’t translate.”`,
          reveals: [WIFE_SECRET[W]],
          intro: [
            nar('Your mother has taken you aside near the tulsi. Your father is watching from the dhurrie pretending to peel an orange.'),
            th(`“I’m not asking you to choose,” ${wn} said last night. “I’m asking you not to translate.”`, 'worried'),
            say('pooja', `Beta, a word. About ${wn}. I say it only because I love you both.`, 'warm'),
            nar(`${wn} is within earshot, holding a tray, being very interested in the marigolds.`),
          ],
          notice: [{ id: 'recall', kind: 'memory', label: 'last night', text: `${wn} sat on the edge of the bed with her back to you. “It isn’t that they’re wrong about everything,” she said. “It’s that they say it to you, and you bring it to me wrapped like a gift.”` }],
          prompt: 'Your mother is waiting. Your wife is carrying a tray.',
          options: [
            opt('defend-public', `“Mummy, that’s her decision. Please don’t talk about her like that — not here.”`, {
              act: act(S, W, 'defend', { vs: 'pooja', tone: 'blunt', n: `${sn} publicly told Pooja to stop discussing ${wn}.` }),
              fx: [flag('mi-defended-public'), { t: 'bond', a: 'pooja', b: S, d: { resentment: 5, heard: -4 } }],
              res: [say(S, 'Mummy, that’s her decision. Please don’t talk about her like that. Not here.', 'stern'), nar('The courtyard goes quiet in ripples. Raj puts down the orange.'), say('pooja', 'I was only —', 'hurt')],
              branches: [{ when: (q) => q.bond(W, S, 'trust') >= 68, res: [nar(`${wn} says nothing. But she steps beside you, and her shoulder is warm against yours.`)] }, { when: () => true, res: [say(W, 'You didn’t need to do that. Not like that.', 'tired')] }],
            }),
            opt('defend-private', `Take Mummy aside: “I know you worry. If you have a concern, tell me — not her, and not in front of everyone.”`, {
              act: [act(S, 'pooja', 'refuse', { c: 'autonomy', own: 'privacy', need: 0.8, tone: 'gentle', why: true, alt: true, hear: true, n: `${sn} quietly asked Pooja to bring her concerns to him, not to ${wn}.` }), act(S, W, 'defend', { vs: 'pooja', tone: 'warm', n: `${sn} stood up for ${wn} to Pooja, in private.` })],
              fx: [flag('mi-private'), { t: 'agree', id: 'mi-rules', between: ['pooja', S], text: `Pooja brings concerns about ${wn} to ${sn} in private, not at the table.` }],
              res: [say(S, 'Mummy, I know you worry. If you have a concern, bring it to me — not to her, and not in front of everyone.', 'worried'), say('pooja', '…I have only ever wanted her to be happy.', 'hurt')],
              branches: [{ when: (q) => q.bond('pooja', S, 'trust') >= 55, res: [say('pooja', 'All right, beta. Privately. I will try.', 'tired'), nar('It is not a promise. It is a woman putting down something heavy and not yet letting go.')] }, { when: () => true, res: [say('pooja', 'You are your father’s son.', 'stern'), nar('It is not a compliment.')] }],
            }),
            opt('side-with-parent', '“Maybe Mummy has a point, ' + wn + '. Let’s at least talk about it.”', {
              act: [act(S, W, 'dismiss', { c: 'autonomy', tone: 'neutral', pub: ['pooja'], n: `${sn} told ${wn}, in front of Pooja, that his mother might have a point.` }), act(S, 'pooja', 'support', { c: 'tradition', tone: 'neutral', n: `${sn} told Pooja she might have a point.` })],
              fx: [flag('mi-sided')],
              res: [say(S, 'Maybe Mummy has a point, ' + wn + '. Let’s at least talk about it.', 'neutral'), nar(`${wn} does not argue. She puts the tray down, which is how you know you have lost something.`)],
            }),
            opt('smooth-over', '“Arre, Mummy — enough. Let’s eat before it goes cold.”', {
              act: act(S, W, 'deflect', { c: 'autonomy', tone: 'neutral', n: `${sn} brushed it aside so lunch could continue.` }),
              fx: [flag('mi-smoothed')],
              res: [say(S, 'Arre, Mummy — enough. Let’s eat before it goes cold.', 'warm'), nar('Everyone laughs, relieved. Only ' + wn + ' does not. She looks at you as if you have put a lid on a pot that is still boiling.')],
            }),
          ],
          witness: [th(`${sn}, near the tulsi: his mother says “for your own good,” his wife says “don’t translate,” and he has been translating for years because it is easier than choosing.`, 'worried')],
          witnessLearn: [WIFE_SECRET[W]],
        },

        alok: {
          who: 'alok',
          stake: 'You were handing out prasad when you heard it. You have no standing here and you are the only one who heard both versions.',
          reveals: ['alok-belong'],
          intro: [
            nar('You are carrying the plate of prasad past the tulsi. You are, for a second, perfectly placed to hear every word.'),
            th(`Pooja-aunty is telling ${sn} something about ${wn}. ${wn} is standing three metres away holding a tray, very still.`, 'worried'),
            th('You have a distinct memory of Pooja-aunty at her embroidery frame, patient as a stone, teaching a girl to hold a needle. You had thought, then, that nothing could be harder than to be taught by her. It is harder to be told.', 'tired'),
          ],
          notice: [{ id: 'frame', kind: 'memory', label: 'Pooja-aunty’s classes', text: 'Years ago, she taught half the lane to stitch. Then, one monsoon, she stopped. She told everyone it was her eyes. Raj paid for new spectacles. She did not start again.', fx: [learnFx('alok', 'pooja-sacrificed'), insightFx('pooja-sacrificed')] }],
          prompt: 'The plate is warm in your hands. Nobody has asked what you think.',
          options: [
            opt('tell-wife', `Find ${wn} afterwards. “Whatever she said — she says it because she is frightened, not because she is right.”`, {
              act: act('alok', W, 'support', { c: 'autonomy', tone: 'warm', n: `Alok told ${wn} that Pooja spoke from fear.` }),
              fx: [flag('mi-alok-comfort'), { t: 'bond', a: 'pooja', b: 'alok', d: { trust: -3 } }],
              res: [say('alok', 'Whatever she said, she says it because she’s frightened. Not because she’s right.', 'warm'), say(W, 'You heard.', 'tired'), say('alok', 'I’m always somewhere I can hear. It’s a bad habit.', 'worried')],
            }),
            opt('correct-pooja', 'Say it to Pooja’s face: “Aunty, it isn’t fair on her.”', {
              act: act('alok', 'pooja', 'accuse', { c: 'tradition', tone: 'blunt', pub: [S, W, 'raj'], n: 'Alok told Pooja in front of the family that she was being unfair.' }),
              fx: [flag('mi-alok-corrected'), { t: 'bond', a: 'raj', b: 'alok', d: { trust: -4, respect: -3 } }],
              res: [say('alok', 'Aunty, it isn’t fair on her.', 'stern'), nar('Pooja’s face does something you have never seen it do: closes. Raj puts the orange down and looks at you as at a tenant who has put a nail through the wall.')],
            }),
            opt('remind', 'Sit beside Pooja afterwards. “Aunty — remember what it was like to be told to stop?”', {
              when: (q) => q.knows('alok', 'pooja-sacrificed'),
              act: act('alok', 'pooja', 'support', { c: 'recognition', tone: 'warm', hear: true, n: 'Alok reminded Pooja of the classes she had given up.' }),
              fx: [flag('mi-alok-remind')],
              res: [say('alok', 'Aunty — do you remember what it felt like, when you were told to stop teaching?', 'worried'), nar('She is silent for so long that you think you have gone too far. Then: “It was my eyes.” And then, quietly: “It was not my eyes.”')],
            }),
            opt('stay-out', 'Hand round the prasad and keep walking.', {
              act: act('alok', W, 'absorb', { c: 'honesty', need: 0.5, n: 'Alok overheard Pooja’s comments about the marriage and said nothing.' }),
              fx: [flag('mi-alok-silent')],
              res: [nar('You offer the prasad to everyone in turn. Most of them take it. The sweetness is thick in your mouth.')],
            }),
          ],
          witness: [th('Alok, at the tulsi with a plate: he heard Pooja-aunty say it. He heard the tray stop moving. He has seen enough weddings to know exactly how long a family can pretend not to hear.', 'worried')],
          witnessLearn: ['pooja-sacrificed'],
        },
      },
      aftermathTime: 'evening',
      aftermath: [
        nar('Late afternoon. The dhurries are rolled up and the marigolds swept into a corner.'),
        ...iff((q) => q.flag('mi-advised'), nar(`${wn} washes the plates alone and will not be helped. Pooja hovers, and goes away.`)),
        ...iff((q) => q.flag('mi-kind') || q.flag('mi-asked'), nar(`Pooja and ${wn} are sitting on the courtyard step. Neither is quite smiling. It is the first time you have seen them side by side without a tray between them.`)),
        ...iff((q) => q.flag('mi-silent'), nar('Pooja counts the steel cups twice. It takes her a long time.')),
        ...iff((q) => q.flag('mi-defended-public'), nar(`Pooja goes in without a word. ${wn} stays with the marigolds; ${sn} does not know which of them to follow.`)),
        ...iff((q) => q.flag('mi-private'), nar(`Pooja and ${sn} have something new between them — a rule. It is uncomfortable, and it is a rule.`)),
        ...iff((q) => q.flag('mi-sided'), nar(`${wn} is not speaking to ${sn}. She is being immaculate about it.`)),
        ...iff((q) => q.flag('mi-smoothed'), nar('The lunch went off beautifully. Nothing has been said at all.')),
        ...iff((q) => q.flag('mi-alok-corrected'), nar('Raj has not looked at Alok since lunch.')),
        say('raj', 'A good lunch. Everyone behaved.', 'neutral'),
      ],
    }
  },
}
