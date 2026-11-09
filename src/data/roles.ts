import type { PersonaId, Role, RoleId } from '../types'

export const ROLES: Record<RoleId, Role> = {
  parent: {
    id: 'parent',
    title: 'The Parent',
    tagline: 'Thirty-six years of giving. What is owed — and what is asked?',
    summary:
      'You are Raj or Pooja. You built this house and everyone in it. Now you must decide what to say aloud and what to keep carrying.',
    knows: 'The true state of the savings, the health secrets, the old promises — and what you have never said to your children.',
    decides: 'Whether to ask, to refuse, or to stay silent. How much pride you will trade for help.',
    carries: 'The household, the family name, and the fear of becoming a burden.',
    personas: ['raj', 'pooja'],
  },
  child: {
    id: 'child',
    title: 'The Child',
    tagline: 'Every rupee has a deadline. Every promise has a price.',
    summary:
      'You are Vikram, Rohan or Kabir. You love your parents and you are drowning in your own life. Both are true.',
    knows: 'Your own money, your spouse’s limits and your siblings’ circumstances — but not what your parents hide.',
    decides: 'How much to offer, what to promise, and how honestly to say what you can’t do.',
    carries: 'A spouse, children and a loan — and the guilt of falling short of someone.',
    personas: ['vikram', 'rohan', 'kabir'],
  },
  alok: {
    id: 'alok',
    title: 'Alok',
    tagline: 'No claim, no history — only gratitude and eyes that see.',
    summary:
      'You are the outsider who was loved before you could repay it. You may help. The question is whether you may speak.',
    knows: 'What you can observe and what you are told — never the whole story.',
    decides: 'When to help, when to hold back, and whether kindness gives you the right to judge.',
    carries: 'A shop, a debt of your own, and the fear of overstepping a family that isn’t yours.',
    personas: ['alok'],
  },
}

export function roleOfPersona(p: PersonaId): RoleId {
  if (p === 'raj' || p === 'pooja') return 'parent'
  if (p === 'alok') return 'alok'
  return 'child'
}

/** Duties and starting knowledge shown in the journal — they differ by persona. */
export const PERSONA_BRIEF: Record<PersonaId, { duties: string[]; knowledge: { id: string; title: string; text: string }[] }> = {
  raj: {
    duties: [
      'Protect the house and the family’s standing',
      'Decide what your sons are told about money',
      'Carry the secret of your knee and the fixed deposit',
    ],
    knowledge: [
      { id: 'k-savings', title: 'The account', text: '₹41,000 in savings, and a fixed deposit of ₹4.2 lakh you swore to Pooja you would not touch.' },
      { id: 'k-knee', title: 'The knee', text: 'The surgeon says the knee cannot wait past spring. Three lakh. You have told no one.' },
      { id: 'k-seepage', title: 'The terrace', text: 'The roof has leaked since the monsoon. You have hidden the damp patch behind a calendar.' },
    ],
  },
  pooja: {
    duties: [
      'Keep the house warm and the family together',
      'Read what Raj cannot say',
      'Make the money last without letting anyone see it shrinking',
    ],
    knowledge: [
      { id: 'k-slip', title: 'The doctor’s slip', text: 'You found the surgeon’s note in Raj’s shirt pocket. Knee replacement. He has not mentioned it.' },
      { id: 'k-strip', title: 'The tablets', text: 'You have been taking your blood-pressure tablet every other day to make the strip last.' },
      { id: 'k-milk', title: 'The milk packets', text: 'You count them each morning. You have started buying one fewer.' },
    ],
  },
  vikram: {
    duties: [
      'Pay the EMI and Aarav’s boarding fees',
      'Be the one everyone calls',
      'Keep your bonus news from Meera until you can fix it',
    ],
    knowledge: [
      { id: 'k-emi', title: 'Your budget', text: 'The EMI is ₹58,000. Your bonus was cut by half. Aarav’s fee is due on the fifth. Meera does not know.' },
      { id: 'k-fd', title: 'The old FD', text: 'You remember exactly which fixed deposit paid for Kabir’s degree. You have never mentioned it to him.' },
    ],
  },
  rohan: {
    duties: [
      'Keep the studio alive and its two employees paid',
      'Be there for Simran and baby Ira',
      'Be the son who never says no',
    ],
    knowledge: [
      { id: 'k-invoices', title: 'Your budget', text: 'Three invoices are ninety days overdue. You owe your draughtsman two months’ pay. Simran has been covering gaps without telling you the total.' },
      { id: 'k-yes', title: 'Your habit', text: 'You have already said yes to things you could not afford this year. Simran is keeping a list.' },
    ],
  },
  kabir: {
    duties: [
      'Provide for Ananya and the baby due in March',
      'Pay the education loan on a junior salary',
      'Find some way to repay what you owe your father',
    ],
    knowledge: [
      { id: 'k-spare', title: 'Your budget', text: 'Eleven thousand rupees spare this month. The baby’s expenses will begin in January.' },
      { id: 'k-degree', title: 'Your debt', text: 'Papa’s fixed deposit paid for your first year abroad. No one has ever asked you to repay it; that is the weight of it.' },
    ],
  },
  alok: {
    duties: [
      'Run the shop and repay your father’s creditors',
      'Be useful without being a nuisance',
      'Know when to hold your tongue',
    ],
    knowledge: [
      { id: 'k-debt', title: 'What you owe', text: 'Raj-uncle paid your school fees when your father died. He has never mentioned it. You never forget it.' },
      { id: 'k-visible', title: 'What you can see', text: 'You see the tap he mends himself, the empty biscuit tin Pooja-aunty hides, the damp patch behind the calendar. You do not know what they mean.' },
    ],
  },
}
