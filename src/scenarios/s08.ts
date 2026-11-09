import { CHARACTERS } from '../data/characters'
import type { CharacterId } from '../types'
import { act, flag, iff, insightFx, later, learnFx, nar, opt, say, th, SECRET, WIFE_SECRET, type ScenarioDef } from './kit'

const N = (c: CharacterId) => CHARACTERS[c].name
const PAPERS: Record<string, string> = {
  vikram: 'a printout headed “Performance Bonus — Revised” and three loan statements with a total circled twice',
  rohan: 'a stack of overdue-payment letters in a studio folder, and a bank notice about the studio account',
  kabir: 'a loan reminder, and — folded in thirds — an offer letter from a company in Bengaluru',
}

export const S08: ScenarioDef = {
  id: 's08', n: 8, title: 'Personal Boundaries', month: 'June',
  build: (c) => {
    const S = c.S, sn = N(S), W = c.SW, wn = N(W)
    const warm = (q: import('../sim/types').Q) => q.bond('pooja', S, 'trust') >= 58 && q.bond(S, 'pooja', 'heard') >= 35
    return {
      where: 'parents-bedroom', time: 'afternoon',
      background: `The monsoon has started and the house smells of wet cloth. While ${sn} and ${wn} were out, Pooja went into their bedroom “to do the almirah, since the damp gets everywhere.” She found ${PAPERS[S]}. She put everything back exactly as it was. She has been very quiet since.`,
      conflict: `${sn} has noticed that a folder is a centimetre out of line. ${wn} has already said she cannot go on this way. Pooja knows something she was never meant to, and cannot say how.`,
      involved: ['pooja', S, W, 'alok'],
      lenses: {
        parent: {
          who: 'pooja',
          stake: 'You went in to help, and found something that was not yours. You are afraid for him, and you are ashamed of how you know.',
          reveals: ['pooja-found-papers', SECRET[S]],
          intro: [
            nar('The bedroom is tidy. You tidied it. The almirah smells of cedar and damp.'),
            th(`${PAPERS[S].charAt(0).toUpperCase() + PAPERS[S].slice(1)}. You read them standing up, the way you read a letter that is not yours, and then you read them again.`, 'worried'),
            th('You have not slept. You cannot tell him that you know. You cannot tell him how you know. And you cannot not tell him — he is your son and he is drowning, and he smiles at dinner.', 'hurt'),
            say(S, 'Mummy — did you do the almirah today?', 'neutral'),
            nar('He says it lightly. He is holding the folder.'),
          ],
          notice: [{ id: 'frame', kind: 'memory', label: 'what you saw', text: 'The numbers. And, in the same drawer, a photograph of the four of you from last Diwali, face-up, with its corner softened by a thumb.' }],
          prompt: 'He is holding the folder, and looking at you.',
          options: [
            opt('confess', '“Yes. And I looked at the papers. I’m sorry, beta. I won’t say a word to your father unless you want me to.”', {
              act: [act('pooja', S, 'intrude', { c: 'privacy', tone: 'gentle', why: true, hear: true, n: `Pooja tidied ${sn}’s almirah and read his private papers.` }), act('pooja', S, 'apologize', { c: 'privacy', apology: { own: true, spec: true, nobut: true, change: true, for: 'privacy' }, n: `Pooja owned up to reading ${sn}’s papers and apologised.` })],
              fx: [flag('pb-confessed'), learnFx(S, 'pooja-found-papers'), { t: 'comm', d: 2 }],
              res: [say('pooja', 'Yes. And I looked at the papers. I am sorry, beta. I will not say a word to your father unless you want me to.', 'tired')],
              branches: [{ when: warm, res: [say(S, '…Mummy. I wanted to tell you. I couldn’t find the way.', 'hurt'), nar('He sits down on the bed. You sit beside him. It is the first time in twenty years that you have not known what to do with your hands.')] }, { when: () => true, res: [say(S, 'You read my papers.', 'stern'), nar('He says it flatly. Then, much more quietly: “I’m not sure whether I’m angry or relieved.”')] }],
            }),
            opt('hide', 'Say you only dusted. Say nothing about the papers.', {
              act: act('pooja', S, 'withhold', { c: 'honesty', tone: 'gentle', n: `Pooja saw ${sn}’s private papers and let him think she had not.` }),
              fx: [flag('pb-hid'), { t: 'issue', id: `pooja~${S}~honesty~unvoiced`, a: 'pooja', b: S, concern: 'honesty', sev: 0.4, text: 'Pooja knows something she has not said.' }],
              res: [say('pooja', 'Only the dust, beta. The damp gets in everywhere.', 'warm'), nar('He looks at you a moment too long. Then he nods. You have both lied; one of you does not know it yet.')],
            }),
            opt('confront', '“Why didn’t you tell us you were in trouble? Your own mother — and I have to find out from a folder?”', {
              act: [act('pooja', S, 'intrude', { c: 'privacy', tone: 'blunt', n: `Pooja read ${sn}’s papers and then confronted him with what she had read.` }), act('pooja', S, 'accuse', { c: 'honesty', own: 'belonging', need: 0.9, tone: 'blunt', n: `Pooja asked ${sn} why he had hidden his trouble from her.` })],
              fx: [flag('pb-confronted'), learnFx(S, 'pooja-found-papers')],
              res: [say('pooja', 'Why didn’t you tell us you were in trouble? Your own mother — and I find out from a folder?', 'hurt'), say(S, 'You read my papers.', 'stern'), say('pooja', 'I was doing the almirah!', 'hurt')],
            }),
            opt('tell-raj', 'Say nothing to him — and tell Raj, that night, in bed.', {
              act: [act('pooja', S, 'intrude', { c: 'privacy', tone: 'gentle', n: `Pooja read ${sn}’s papers.` }), act('pooja', 'raj', 'confide', { c: 'honesty', tone: 'warm', n: `Pooja told Raj what she had read in ${sn}’s papers.` })],
              fx: [flag('pb-told-raj'), learnFx('raj', SECRET[S]), insightFx(SECRET[S]), later('raj-knows', 1, [{ t: 'bond', a: S, b: 'raj', d: { trust: -6, heard: -4 } }, flag('raj-knows-secret')], [{ speaker: 'raj', text: 'Your mother and I have been discussing your finances. I should have asked you first. I did not.' }], { ifFlag: 'pb-told-raj' })],
              res: [nar('In the dark you tell Raj what you saw. He is silent for a long time. “We will say nothing,” he says, in the voice he uses for decisions that he is about to break.')],
            }),
          ],
          witness: [th(`Pooja, with a dust-cloth: she went in to do the almirah and found a drawer that said what her son would not. She has been standing in a doorway ever since, between her love and his privacy, and she is not good at being in a doorway.`, 'tired')],
          witnessLearn: ['pooja-found-papers', SECRET[S]],
        },

        child: {
          who: S,
          stake: `Your home is not entirely yours. ${wn} has said so. And your folder has moved a centimetre.`,
          reveals: [SECRET[S], WIFE_SECRET[W]],
          enter: [act('pooja', S, 'intrude', { c: 'privacy', tone: 'gentle', n: `Pooja tidied ${sn}’s almirah and went through his papers.` })],
          intro: [
            nar('You come home and the bedroom smells of cedar. Everything is where it should be. That is how you know.'),
            th(`${wn} said it last week at midnight: “I have not changed in this flat in front of a closed door for six months. I love them. I cannot do this.”`, 'worried'),
            th(`The folder is a centimetre out of line. Your mother tidied your almirah. She is in the kitchen being very cheerful, and she has not once met your eye.`, 'stern'),
            say('pooja', 'Beta, I did the almirah. The damp gets everywhere.', 'warm'),
          ],
          notice: [{ id: 'folder', kind: 'look', label: 'the folder', text: `The papers are in order. They are in the wrong order — the order of a person who has read them with care and put them back as they were. You can see her putting them back.` }],
          prompt: 'Your mother is in the doorway with a cloth in her hand.',
          options: [
            opt('ask-gently', '“Mummy — thank you for the almirah. But I need our room to be ours. Could you knock, and leave our things be?”', {
              act: act(S, 'pooja', 'request', { c: 'belonging', own: 'privacy', need: 0.9, tone: 'gentle', why: true, alt: true, hear: true, n: `${sn} asked Pooja to knock and leave their room alone.` }),
              fx: [flag('pb-gentle')],
              res: [say(S, 'Mummy, thank you for the almirah. But I need our room to be ours. Could you knock, and leave our things be?', 'worried')],
              branches: [
                { when: (q) => q.bond('pooja', S, 'trust') >= 55, fx: [{ t: 'agree', id: 'boundary', between: ['pooja', S], text: `Pooja knocks, and ${sn}’s room is not hers to tidy.` }], res: [say('pooja', 'Of course, beta. I should have asked.', 'tired'), nar('She means it. She also looks, for a moment, like a woman who has been told her own house is a smaller place than she thought.')] },
                { when: () => true, res: [say('pooja', 'It’s only dust, beta. I am your mother.', 'hurt'), nar('It is not a refusal. It is not the end of it either.')] },
              ],
            }),
            opt('blunt-rule', '“Don’t come into our room. Ever. That’s the rule.”', {
              act: act(S, 'pooja', 'request', { c: 'belonging', own: 'privacy', need: 0.9, tone: 'harsh', n: `${sn} told Pooja never to enter their room.` }),
              fx: [flag('pb-harsh')],
              res: [say(S, 'Don’t come into our room. Ever. That’s the rule.', 'stern'), nar('Your mother’s hand tightens on the cloth. She nods once, with her face the way it is at funerals.')],
            }),
            opt('lock-silently', 'Say nothing. Buy a lock. Fit it tonight.', {
              act: act(S, 'pooja', 'absorb', { c: 'privacy', need: 0.9, n: `${sn} said nothing and fitted a lock on the bedroom door.` }),
              fx: [flag('pb-lock'), { t: 'issue', id: `${S}~pooja~privacy~unvoiced`, a: S, b: 'pooja', concern: 'privacy', sev: 0.4, text: 'A lock appeared without a word.' }],
              res: [nar('The lock is fitted by eight. Pooja finds it by nine. She says nothing, and the not-saying fills the flat.')],
            }),
            opt('ask-wife', `Ask ${wn} to talk to your mother: “It’s your home too. You’re better at this than I am.”`, {
              act: act(S, W, 'deflect', { c: 'privacy', tone: 'gentle', n: `${sn} left it to ${wn} to raise the boundary with his mother.` }),
              fx: [flag('pb-wife'), { t: 'bond', a: W, b: S, d: { resentment: 4, heard: -3 } }],
              res: [say(W, 'You’re asking me to say what you can’t.', 'tired'), say(S, 'You’re better at it.', 'worried'), say(W, 'I know. That’s the problem.', 'stern')],
            }),
          ],
          witness: [th(`${sn}, in the doorway: the folder is a centimetre out of line. His mother’s eyes slide off his face. He is not angry, yet. He is afraid of what she read, and more afraid of what it means that she read it.`, 'worried')],
          witnessLearn: [WIFE_SECRET[W]],
        },

        alok: {
          who: 'alok',
          stake: 'You are the one person who saw it — and the one with the least right to say.',
          reveals: ['alok-belong'],
          intro: [
            nar(`You came to fix the bathroom tap. You were in the passage when Pooja-aunty came out of the bedroom, closing the door with both hands, the way you close a door on something sleeping.`),
            th('You saw her face. Then you saw the folder she carried back in, and the way she squared its corners.', 'worried'),
          ],
          notice: [{ id: 'corner', kind: 'look', label: 'the almirah door', text: 'Left ajar. Inside, a folder of papers set at a right angle too precisely. Something typed at the top: figures, a circled total, a letterhead. Aunty has read it, and put it back like a thief who loves the house.', fx: [learnFx('alok', 'pooja-found-papers'), insightFx('pooja-found-papers')] }],
          prompt: 'The tap is dripping. So, very slightly, is Pooja-aunty.',
          options: [
            opt('tell-son', `Tell ${sn} quietly: “Your mother went through your papers. I thought you should know.”`, {
              act: [act('alok', S, 'confide', { c: 'honesty', tone: 'gentle', n: `Alok told ${sn} that Pooja had read his papers.` }), act('alok', 'pooja', 'intrude', { c: 'dignity', tone: 'gentle', n: 'Alok exposed Pooja’s snooping to her son.' })],
              fx: [flag('pb-alok-told'), learnFx(S, 'pooja-found-papers'), { t: 'bond', a: 'pooja', b: 'alok', d: { trust: -7, respect: -3 } }],
              res: [say('alok', 'Your mother went through your papers. I thought you should know.', 'worried'), say(S, '…Why are you telling me?', 'stern'), say('alok', 'Because I would want to be told.', 'worried')],
            }),
            opt('talk-pooja', 'Find Pooja-aunty at the tulsi. “Aunty, I saw. I won’t say anything. But I think you should — to him.”', {
              act: act('alok', 'pooja', 'support', { c: 'honesty', tone: 'warm', hear: true, n: 'Alok told Pooja he had seen, and urged her to tell her son herself.' }),
              fx: [flag('pb-alok-nudged')],
              res: [say('alok', 'Aunty, I saw. I won’t say a word. But I think you should tell him, yourself, before the folder does.', 'worried')],
              branches: [{ when: (q) => q.bond('pooja', 'alok', 'trust') >= 80, res: [say('pooja', 'You are a good boy, Alok. A tiresome one.', 'warm'), nar('She goes inside. You hear the almirah door open and close, as if someone were testing a conscience.')] }, { when: () => true, res: [say('pooja', 'It is not your business.', 'stern')] }],
            }),
            opt('warn-son', `Say to ${sn}, lightly: “If you want your room kept as yours, lock it.”`, {
              act: act('alok', S, 'support', { c: 'privacy', tone: 'gentle', n: `Alok hinted to ${sn} that he should lock his room.` }),
              fx: [flag('pb-alok-hint'), { t: 'bond', a: 'pooja', b: 'alok', d: { trust: -2 } }],
              res: [say('alok', 'If you want your room kept as yours — lock it.', 'neutral'), say(S, 'Why would I need to —', 'stern'), say('alok', 'No reason. Forget it.', 'worried')],
            }),
            opt('say-nothing', 'Fix the tap. Say nothing. It is a family’s business.', {
              act: act('alok', 'pooja', 'absorb', { c: 'honesty', need: 0.5, n: 'Alok saw Pooja read her son’s papers and said nothing.' }),
              fx: [flag('pb-alok-silent')],
              res: [nar('The tap stops. The silence is heavier than the drip was.')],
            }),
          ],
          witness: [th('Alok, with a spanner: he saw Pooja-aunty come out of the bedroom with her hands full of nothing. He knows the look of someone who has committed a love-shaped crime.', 'worried')],
          witnessLearn: ['pooja-found-papers'],
        },
      },
      aftermathTime: 'evening',
      aftermath: [
        nar('Evening. The monsoon is coming in sideways against the window.'),
        ...iff((q) => q.agreed('boundary'), nar(`Someone has stuck a card to the door: “Please knock.” It is in Pooja’s handwriting. She chose the colour of ink.`)),
        ...iff((q) => q.flag('pb-confessed'), nar('Pooja and her son are sitting side by side, not speaking, on the edge of the bed. There is a document between them that has not been mentioned. It is the first time in months that anyone has been honest.')),
        ...iff((q) => q.flag('pb-hid'), nar('Pooja is making tea she does not want to drink. She knows. He thinks she does not. That asymmetry is going to cost someone.')),
        ...iff((q) => q.flag('pb-harsh') || q.flag('pb-lock'), nar('A new lock, and a silence the width of a door.')),
        ...iff((q) => q.flag('pb-confronted'), nar('The word “folder” is not spoken for the rest of the evening. Nothing else is, either.')),
        ...iff((q) => q.flag('pb-told-raj'), say('raj', 'Your mother worries. It is not a crime to worry. Do not look at me like that.', 'stern')),
        ...iff((q) => q.flag('pb-alok-told'), say('pooja', 'Alok has been telling tales. I should have expected it. I did not.', 'hurt')),
        say('raj', 'It is raining. Let the matter rest for the evening.', 'neutral'),
      ],
    }
  },
}
