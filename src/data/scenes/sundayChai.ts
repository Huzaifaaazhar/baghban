import type { Option, StoryNode, StoryScene } from '../../types'

/**
 * Scene 1 — "Sunday Chai"
 * Original dialogue. One roof, one quote, three generations of silence.
 * Writing rules: nobody is a villain; every option costs something; role changes what you know and what you can say.
 */

const nodes: Record<string, StoryNode> = {}
const add = (n: StoryNode) => {
  nodes[n.id] = n
}

/* ------------------------------------------------------------------ */
/* 1. The room fills                                                   */
/* ------------------------------------------------------------------ */
add({
  id: 'open',
  location: 'living-room',
  time: 'golden',
  cast: ['pooja', 'raj', 'rohan', 'simran'],
  lines: [
    { speaker: 'narrator', text: 'Sunday, half past five. The ceiling fan turns its slow circle over a room that has held thirty years of chai.' },
    { speaker: 'pooja', mood: 'warm', text: 'Mind the good cups. Rohan — your father’s is the chipped one. He will take no other.' },
    { speaker: 'raj', mood: 'warm', text: 'The chip has a history. Everything in this house has a history.' },
    { speaker: 'simran', mood: 'tired', text: 'Mummyji, let me carry the tray. You’ve been on your feet since morning.' },
    { speaker: 'pooja', mood: 'warm', text: 'Feet were made for standing on, beta. Sit. Sit.' },
    {
      speaker: 'narrator',
      for: ['alok'],
      text: 'You came in with a box of jalebis and a screwdriver — the corridor tap again. No one asks why you are here. That is the gift of it, and the danger.',
    },
    {
      speaker: 'narrator',
      for: ['child'],
      text: 'The smell is exactly the same: cardamom, floor polish, and the faint damp of a house that is not quite waterproof.',
    },
    {
      speaker: 'narrator',
      for: ['parent'],
      text: 'Thirty years you have poured this tea. You know who takes sugar, who pretends not to, and who needs a second cup before the bad news.',
    },
  ],
  next: 'arrive',
})

/* ------------------------------------------------------------------ */
/* 2. The quote                                                        */
/* ------------------------------------------------------------------ */
add({
  id: 'arrive',
  location: 'living-room',
  time: 'golden',
  cast: ['raj', 'pooja', 'vikram', 'kabir', 'alok'],
  lines: [
    { speaker: 'narrator', text: 'Vikram arrives last, as he always does — phone in one hand, a folded paper in the other.' },
    { speaker: 'vikram', mood: 'tired', text: 'Papa. The contractor’s quote for the terrace. Six lakh. Seven, if the beams are rotten.' },
    { speaker: 'narrator', text: 'Nobody reaches for a biscuit.' },
    {
      speaker: 'thought', for: ['raj'], mood: 'worried',
      text: 'You have known about the seepage since the monsoon. There is forty-one thousand in your account, and a fixed deposit you promised Pooja you would never touch.',
    },
    {
      speaker: 'thought', for: ['pooja'], mood: 'worried',
      text: 'The doctor’s slip is still in his shirt pocket: knee replacement, three lakh. He has said nothing, so you have said nothing. Thirty-six years of marriage is mostly this.',
    },
    {
      speaker: 'thought', for: ['vikram'], mood: 'tired',
      text: 'The EMI is fifty-eight thousand. Aarav’s fee is due on the fifth. Your bonus was halved and Meera does not know. You can carry six lakh. You cannot carry it quietly.',
    },
    {
      speaker: 'thought', for: ['rohan'], mood: 'worried',
      text: 'Three invoices are ninety days overdue. You could say “I’ll take care of it” and mean every word — and have no idea how.',
    },
    {
      speaker: 'thought', for: ['kabir'], mood: 'worried',
      text: 'Papa’s fixed deposit paid for your first year abroad. Everyone knows; no one says it. Ananya is due in March. You have eleven thousand to your name this month.',
    },
    {
      speaker: 'thought', for: ['alok'], mood: 'worried',
      text: 'This is not your conversation. Raj-uncle once paid your school fees and never mentioned it again. You know what the roof looks like; you have no idea what it costs the people inside.',
    },
  ],
  next: 'roof',
})

/* ------------------------------------------------------------------ */
/* 3. The roof — the first decision                                    */
/* ------------------------------------------------------------------ */

const roofOptions: Option[] = [
  /* ---- Raj ---- */
  {
    id: 'r-pride', for: ['raj'],
    label: '“Don’t trouble yourselves. It’s an old roof. I will manage.”',
    hint: 'Because a man holds his own roof up.',
    effects: {
      stats: { dignity: 8, burden: -4, trust: -8, warmth: -3 },
      relations: { vikram: -6, pooja: -4, kabir: -2 },
      flags: ['roof-hidden'],
    },
    ledger: {
      title: 'You kept the door closed',
      note: 'Your sons were spared a bill and denied the chance to share it. Pooja saw both things at once.',
      leans: ['parents'],
    },
    response: [
      { speaker: 'vikram', mood: 'stern', text: 'With what, Papa?' },
      { speaker: 'pooja', mood: 'hurt', text: 'The tea is getting cold.' },
      { speaker: 'narrator', text: 'The roof remains exactly where it was. So does the silence.' },
    ],
  },
  {
    id: 'r-honest', for: ['raj'],
    label: '“Sit, all of you. The roof is not the only thing I haven’t told you.”',
    hint: 'Because you are tired of carrying it alone.',
    effects: {
      stats: { dignity: -6, trust: 14, warmth: 8, burden: 6 },
      relations: { vikram: 8, pooja: 8, kabir: 4 },
      flags: ['raj-disclosed', 'knee-known'],
      learn: ['k-knee-public'],
    },
    ledger: {
      title: 'You said it aloud',
      note: 'The knee, the fixed deposit, the damp patch behind the calendar. It cost you your composure. It bought you your sons’ full attention.',
      leans: ['parents', 'children'],
    },
    response: [
      { speaker: 'raj', mood: 'tired', text: 'The knee needs replacing before spring. Three lakh. The fixed deposit is there — and I made your mother a promise about it.' },
      { speaker: 'narrator', text: 'Kabir’s eyes go to the floor. Everyone in the room knows whose degree that deposit paid for.' },
      { speaker: 'pooja', mood: 'warm', text: 'Thank you.' },
    ],
  },
  {
    id: 'r-deflect', for: ['raj'],
    label: '“Drink your tea before it goes cold. We’ll talk roofs on a weekday.”',
    hint: 'Because tonight you cannot.',
    effects: { stats: { trust: -3, warmth: 1 }, flags: ['roof-postponed'] },
    ledger: {
      title: 'You bought a week',
      note: 'Nothing was settled; nothing was broken. The damp patch grew, quietly, by seven days.',
      leans: ['parents'],
    },
    response: [{ speaker: 'narrator', text: 'The conversation turns, gratefully, to cricket. The roof listens from above.' }],
  },

  /* ---- Pooja ---- */
  {
    id: 'p-shield', for: ['pooja'],
    label: 'Touch Raj’s wrist. “The roof can wait a week. Let the children eat.”',
    hint: 'Protecting his pride is the oldest habit you have.',
    effects: { stats: { dignity: 4, trust: -3, warmth: 2 }, relations: { raj: 6 }, flags: ['pooja-shielded'] },
    ledger: {
      title: 'You covered for him',
      note: 'You spared Raj in front of his sons. You also spared your sons the truth. You are very good at this. It is not the same as helping.',
      leans: ['parents'],
    },
    response: [
      { speaker: 'raj', mood: 'warm', text: 'Your mother is right. Eat.' },
      { speaker: 'narrator', text: 'Vikram looks at the folded paper, then puts it away, as one puts away a letter that has not been answered.' },
    ],
  },
  {
    id: 'p-reveal', for: ['pooja'],
    label: '“Raj, show them the doctor’s slip. Or I will.”',
    hint: 'Thirty-six years of waiting for him to speak.',
    effects: {
      stats: { dignity: -10, trust: 10, warmth: 2 },
      relations: { raj: -10, vikram: 6, kabir: 3 },
      flags: ['pooja-revealed-knee', 'knee-known'],
      learn: ['k-knee-public'],
    },
    ledger: {
      title: 'You said what he couldn’t',
      note: 'You broke his silence — and perhaps a little of his trust. His sons now know. So does he, that it was you.',
      leans: ['parents', 'children'],
    },
    response: [
      { speaker: 'raj', mood: 'hurt', text: 'Pooja.' },
      { speaker: 'vikram', mood: 'worried', text: 'Papa… what slip?' },
      { speaker: 'narrator', text: 'Raj does not look at you. The hand he lays flat on his knee says everything the slip would.' },
    ],
  },
  {
    id: 'p-pivot', for: ['pooja'],
    label: 'Ask Meera, brightly, about Aarav’s school results.',
    hint: 'Change the weather. It has always worked.',
    effects: { stats: { trust: -5, warmth: 2 }, flags: ['pooja-deflected'] },
    ledger: {
      title: 'You changed the weather',
      note: 'The tension passed, as it always has. It also went nowhere, as it always has.',
      leans: ['parents'],
    },
    response: [
      { speaker: 'meera', mood: 'tired', text: 'Good, Mummyji. He topped maths.' },
      { speaker: 'narrator', text: 'The question hangs behind the conversation like a coat on a nail.' },
    ],
  },

  /* ---- Children ---- */
  {
    id: 'c-take-v', for: ['vikram'],
    label: '“Leave it with me, Papa. I will pay for the roof.”',
    hint: 'Because someone has to, and it is usually you.',
    effects: {
      stats: { burden: 14, dignity: -4, warmth: 5, trust: 4 },
      relations: { raj: 2, meera: -6 },
      flags: ['vikram-paid'],
    },
    ledger: {
      title: 'You took the whole weight',
      note: 'It was generous. It was also a decision about Meera’s money that you made without Meera, with money you have not told her has shrunk.',
      leans: ['children'],
    },
    response: [
      { speaker: 'raj', mood: 'stern', text: 'I did not ask you to.' },
      { speaker: 'meera', mood: 'worried', text: 'Vikram.' },
      { speaker: 'narrator', text: 'She says only your name. In your marriage it can mean a whole conversation.' },
    ],
  },
  {
    id: 'c-take-r', for: ['rohan'],
    label: '“Done. I’ll take care of the roof.”',
    hint: 'Because yes is easier tonight than the truth.',
    effects: {
      stats: { burden: 10, warmth: 6, trust: -4 },
      relations: { raj: 3, simran: -10 },
      flags: ['rohan-overpromised'],
    },
    ledger: {
      title: 'You said yes',
      note: 'The relief in the room was real. So is the debt you just took on, and the conversation Simran now has to have with you.',
      leans: ['children'],
    },
    response: [
      { speaker: 'pooja', mood: 'warm', text: 'My Rohan.' },
      { speaker: 'simran', mood: 'stern', text: 'Rohan. A word, later.' },
      { speaker: 'narrator', text: 'Vikram’s eyebrow rises very slightly. He has heard this yes before.' },
    ],
  },
  {
    id: 'c-cant-k', for: ['kabir'],
    label: '“I can’t give much this year, Papa. But please don’t count me out.”',
    hint: 'The most honest thing you have said in months.',
    effects: {
      stats: { trust: 8, warmth: 4, dignity: 1 },
      relations: { raj: 5, vikram: -4 },
      flags: ['kabir-honest'],
    },
    ledger: {
      title: 'You said what you couldn’t',
      note: 'It took courage to admit a limit in front of Vikram. Raj looked, for a moment, almost relieved to hear it.',
      leans: ['children'],
    },
    response: [
      { speaker: 'vikram', mood: 'stern', text: 'Nobody is counting you out. We are counting the money.' },
      { speaker: 'narrator', text: 'Ananya’s hand finds yours under the table. It is the only warm thing said so far.' },
    ],
  },
  {
    id: 'c-split', for: ['child'],
    label: '“Let’s split it three ways. Equal shares. It’s only fair.”',
    hint: 'Fair, clean — and blind to who has what.',
    effects: {
      stats: { burden: 6, warmth: -2, trust: 2 },
      relations: { vikram: -5, rohan: -5, kabir: -5 },
      flags: ['proposed-equal-split'],
    },
    ledger: {
      title: 'You proposed equal shares',
      note: 'Equal is a clean idea. It treats the one with an overdue invoice and the one with a bonus as the same man.',
      leans: ['children'],
    },
    response: [
      { speaker: 'simran', mood: 'stern', text: 'Equal. Of course.' },
      { speaker: 'kabir', mood: 'worried', text: 'I’ll… I’ll find my share.', notFor: ['kabir'] },
      { speaker: 'narrator', text: 'Fair, in the way a ruler is fair.' },
    ],
  },
  {
    id: 'c-ask', for: ['child'],
    label: '“Papa, how much is actually in the account? I can’t help if I don’t know.”',
    hint: 'Honest, direct — and a little cruel in public.',
    effects: {
      stats: { trust: 6, dignity: -8, warmth: -1 },
      relations: { raj: -4 },
      flags: ['asked-for-the-truth'],
    },
    ledger: {
      title: 'You asked for the number',
      note: 'You offered help and asked for the truth in the same breath. He heard only the second half.',
      leans: ['children'],
    },
    response: [
      { speaker: 'raj', mood: 'stern', text: 'That is between me and the bank.' },
      { speaker: 'pooja', mood: 'hurt', text: 'Raj.' },
      { speaker: 'narrator', text: 'Forty-one thousand rupees, and a lifetime of pride. He will not say it in front of the family.' },
    ],
  },
  {
    id: 'c-quote', for: ['child'],
    label: '“Let’s not decide tonight. I’ll get a second quote.”',
    hint: 'Practical. Slow. Safe.',
    effects: { stats: { trust: -1 }, flags: ['second-quote'] },
    ledger: {
      title: 'You asked for time',
      note: 'A second quote is sensible. It is also what sensible people say when they have not yet decided to stand beside someone.',
      leans: ['children'],
    },
    response: [
      { speaker: 'raj', mood: 'neutral', text: 'Good. A man should compare.' },
      { speaker: 'narrator', text: 'He says it lightly. His hand, on the arm of the chair, has gone still.' },
    ],
  },

  /* ---- Alok ---- */
  {
    id: 'a-mason', for: ['alok'],
    label: '“Uncle, I know a mason in Aminabad who works at cost. May I bring him on Tuesday — if you allow it?”',
    hint: 'Useful, and careful to ask permission.',
    effects: {
      stats: { warmth: 6, dignity: 2, trust: 4 },
      relations: { raj: 8, pooja: 6, vikram: -4 },
      flags: ['alok-offered-mason'],
    },
    ledger: {
      title: 'You offered a hand and asked first',
      note: 'You helped without stepping over the threshold. Vikram noticed anyway — a stranger solving the problem his family had only quoted.',
      leans: ['alok'],
    },
    response: [
      { speaker: 'raj', mood: 'warm', text: 'Hari the mason? Come Tuesday. We shall see.' },
      { speaker: 'vikram', mood: 'stern', text: 'That would be… generous of you.' },
      { speaker: 'narrator', text: 'The word is polite. The tone is not.' },
    ],
  },
  {
    id: 'a-rebuke', for: ['alok'],
    label: '“Forgive me — you three live twenty minutes from this door. Does the roof need a quote, or a conscience?”',
    hint: 'It is true. It is not yours to say.',
    effects: {
      stats: { trust: -14, warmth: -10, dignity: -8 },
      relations: { vikram: -14, rohan: -8, kabir: -8, raj: -6, pooja: -4 },
      flags: ['alok-overstepped'],
    },
    ledger: {
      title: 'You said the true thing in the wrong room',
      note: 'Perhaps you are right. But you named your friends’ failure in front of everyone who loves them, without knowing what each of them carries.',
      leans: ['parents', 'alok'],
    },
    response: [
      { speaker: 'vikram', mood: 'stern', text: 'I think you’ve said enough, Alok.' },
      { speaker: 'raj', mood: 'hurt', text: 'Alok.' },
      { speaker: 'narrator', text: 'No one has ever raised their voice in this room. You have just taught it how.' },
    ],
  },
  {
    id: 'a-wait', for: ['alok'],
    label: 'Say nothing. Gather the cups. Watch who looks at whom.',
    hint: 'A guest listens before a friend speaks.',
    effects: { stats: { trust: 1, warmth: 2 }, learn: ['k-looks'], flags: ['alok-watched'] },
    ledger: {
      title: 'You listened first',
      note: 'You saw Vikram’s thumb on a calculator, Kabir’s eyes on the floor, Pooja’s hand finding Raj’s sleeve. You do not understand all of it. You know that it is not simple.',
      leans: ['alok'],
    },
    response: [
      { speaker: 'narrator', text: 'You carry the tray to the kitchen door and look back. The room has rearranged itself around the paper in Vikram’s hand.' },
    ],
  },
]

add({
  id: 'roof',
  location: 'living-room',
  time: 'golden',
  cast: ['raj', 'pooja', 'vikram', 'kabir', 'alok'],
  lines: [
    {
      speaker: 'raj', mood: 'stern', notFor: ['raj'],
      text: 'Don’t trouble yourselves. It is an old roof. It has leaked before. I will manage.',
    },
    {
      speaker: 'narrator', notFor: ['raj'],
      text: 'He says it the way he has said everything for thirty years — as a closed door.',
    },
    { speaker: 'narrator', for: ['child', 'alok'], text: 'Across the room, Pooja studies her cup.' },
    { speaker: 'narrator', for: ['pooja'], text: 'Raj has closed the door again. He does not look at you; he is certain that you will not mind.' },
  ],
  decision: {
    prompt: {
      raj: 'Your son has laid a quote on the table. The room waits for you.',
      pooja: 'The room waits to see whether you will let the door stay shut.',
      child: 'Everyone is looking at their cup — and at you.',
      alok: 'A silence you have no right to fill. Or do you?',
    },
    options: roofOptions,
  },
  next: 'stay',
})

/* ------------------------------------------------------------------ */
/* 4. Where will they live while the roof is mended?                   */
/* ------------------------------------------------------------------ */

const stayOptions: Option[] = [
  /* ---- Parents ---- */
  {
    id: 's-accept', for: ['parent'],
    label: 'Accept Rohan’s offer — he asked first, and he meant it.',
    hint: 'Take what is warmly offered, even if the warmth costs someone else.',
    effects: {
      stats: { warmth: 6, burden: 10, trust: 1 },
      relations: { rohan: 10, simran: -8 },
      flags: ['stay-with-rohan'],
    },
    ledger: {
      title: 'You accepted the first open door',
      note: 'Rohan’s offer was sincere. Simran’s silence was also sincere. You chose which one to hear.',
      leans: ['parents', 'children'],
    },
    response: [
      { speaker: 'rohan', mood: 'warm', text: 'It’s settled, then!' },
      { speaker: 'simran', mood: 'tired', text: 'Of course. Of course it is.' },
    ],
  },
  {
    id: 's-refuse', for: ['parent'],
    label: '“We’ll stay. A little plaster never hurt anyone.”',
    hint: 'Because being a guest feels like a sentence.',
    effects: {
      stats: { dignity: 10, burden: -4, trust: -4 },
      relations: { vikram: -4 },
      flags: ['parents-stay-home'],
    },
    ledger: {
      title: 'You chose the dust over the door',
      note: 'Your pride is intact. So are the damp, the stairs and the knee.',
      leans: ['parents'],
    },
    response: [
      { speaker: 'vikram', mood: 'worried', text: 'Papa, with the knee — with the dust —' },
      { speaker: 'narrator', text: 'He stops. He has just said aloud a thing he was not sure he knew.', for: ['child', 'alok'] },
    ],
  },
  {
    id: 's-together', for: ['parent'],
    label: '“We won’t be divided like furniture. Wherever we go, we go together — and you decide fairly.”',
    hint: 'The only condition you are certain of.',
    effects: {
      stats: { trust: 6, warmth: 4, burden: 2 },
      relations: { pooja: 6 },
      flags: ['parents-together'],
    },
    ledger: {
      title: 'You drew one line',
      note: 'You asked for fairness and togetherness at once. Both are fair to ask; neither is easy to give.',
      leans: ['parents', 'children'],
    },
    response: [
      { speaker: 'meera', mood: 'tired', text: 'Together is — possible. For some weeks. If we plan it.' },
      { speaker: 'narrator', text: 'It is not a yes. It is the first thing in the room that sounds like arithmetic and kindness at once.' },
    ],
  },

  /* ---- Children ---- */
  {
    id: 's-offer-v', for: ['vikram'],
    label: '“They’ll stay with us. Meera and I will manage.”',
    hint: 'Because you cannot bear to be the one who said no.',
    effects: {
      stats: { burden: 10, warmth: 10, trust: 3 },
      relations: { raj: 5, pooja: 6, meera: -8 },
      flags: ['offered-home-vikram'],
    },
    ledger: {
      title: 'You offered your home',
      note: 'The words were generous. The flat has two bedrooms, and the person who has to live inside the sentence was not consulted.',
      leans: ['children'],
    },
    response: [
      { speaker: 'meera', mood: 'stern', text: 'We will discuss it. Tonight.' },
      { speaker: 'pooja', mood: 'warm', text: 'We don’t want to be a trouble, beta.' },
    ],
  },
  {
    id: 's-offer-k', for: ['kabir'],
    label: '“They should have our room. Ananya and I will take the box room.”',
    hint: 'Because you owe more than you can say.',
    effects: {
      stats: { burden: 10, warmth: 10, trust: 3 },
      relations: { raj: 5, pooja: 6, ananya: -4 },
      flags: ['offered-home-kabir'],
    },
    ledger: {
      title: 'You gave up your own room',
      note: 'Seven months pregnant, in a box room, so that your parents could sleep comfortably. A loving gesture, and a large one.',
      leans: ['children'],
    },
    response: [
      { speaker: 'ananya', mood: 'worried', text: 'Kabir. The stairs.' },
      { speaker: 'pooja', mood: 'hurt', text: 'No, no. Not at the cost of the baby.' },
    ],
  },
  {
    id: 's-stand-r', for: ['rohan'],
    label: '“I meant it. They come to us. We’ll make it work.”',
    hint: 'Because retreating now would feel like lying.',
    effects: {
      stats: { burden: 10, warmth: 10 },
      relations: { simran: -10, raj: 6, pooja: 6 },
      flags: ['rohan-doubled-down'],
    },
    ledger: {
      title: 'You stood by your yes',
      note: 'You kept your word to your parents. You broke an unspoken one to Simran: that she would be asked.',
      leans: ['children'],
    },
    response: [
      { speaker: 'pooja', mood: 'warm', text: 'My Rohan.' },
      { speaker: 'simran', mood: 'stern', text: 'We’ll speak at home.' },
    ],
  },
  {
    id: 's-admit-r', for: ['rohan'],
    label: '“I said that too fast. Let me talk to Simran — but you will not be homeless, I promise.”',
    hint: 'The first time you have ever taken back a yes.',
    effects: {
      stats: { trust: 8, warmth: 2, burden: 2 },
      relations: { simran: 8, raj: -1 },
      flags: ['rohan-paused'],
    },
    ledger: {
      title: 'You took back a yes',
      note: 'Embarrassing, and the most grown-up thing you have done this year. Simran turned and looked at you properly.',
      leans: ['children'],
    },
    response: [
      { speaker: 'simran', mood: 'warm', text: 'Thank you.' },
      { speaker: 'raj', mood: 'neutral', text: 'A promise you say twice is worth more than one you say fast.' },
    ],
  },
  {
    id: 's-rent', for: ['child'],
    label: '“What if we rent a small furnished flat nearby for six weeks and share the cost? No one’s house is strained.”',
    hint: 'Fair, practical — and it keeps your parents at arm’s length.',
    effects: {
      stats: { burden: 6, trust: 3, warmth: -3, dignity: 2 },
      relations: { raj: -2 },
      flags: ['proposed-rental'],
    },
    ledger: {
      title: 'You offered a flat instead of a room',
      note: 'It protects every household’s budget. It also tells two elderly people that they are a logistics problem with a rent figure.',
      leans: ['children'],
    },
    response: [
      { speaker: 'raj', mood: 'stern', text: 'A flat. For us.' },
      { speaker: 'pooja', mood: 'hurt', text: 'It would be — sensible.' },
    ],
  },
  {
    id: 's-honest', for: ['vikram', 'kabir'],
    label: '“Our place is too small for two more. I’ll come every day and bring food — but I can’t promise a room.”',
    hint: 'True, necessary, and heavy in the air.',
    effects: {
      stats: { trust: 4, warmth: -8, dignity: -3 },
      relations: { pooja: -6, raj: -6, meera: 6, ananya: 6 },
      flags: ['said-no-room'],
    },
    ledger: {
      title: 'You told the truth about your walls',
      note: 'It was honest and it was needed. It was also the sentence your mother had been bracing for since the quote arrived.',
      leans: ['children'],
    },
    response: [
      { speaker: 'pooja', mood: 'warm', text: 'Of course, beta. Of course.' },
      { speaker: 'narrator', text: 'She says it a little too quickly. It is her way of saying it does not matter, which is how you know that it does.' },
    ],
  },

  /* ---- Alok ---- */
  {
    id: 's-room', for: ['alok'],
    label: '“There’s a room above my shop. It’s plain, but it’s warm — only if you’d be comfortable.”',
    hint: 'A real bed, a real offer — and a quiet embarrassment for the sons.',
    effects: {
      stats: { warmth: 8, dignity: -4, trust: -2 },
      relations: { raj: 6, pooja: 8, vikram: -8, rohan: -3 },
      flags: ['alok-offered-room'],
    },
    ledger: {
      title: 'You offered a bed',
      note: 'Your offer was sincere. Whether it relieved the family or shamed it depends on who was listening.',
      leans: ['alok', 'parents'],
    },
    response: [
      { speaker: 'pooja', mood: 'warm', text: 'You would give us your own room, Alok?' },
      { speaker: 'vikram', mood: 'stern', text: 'That won’t be necessary.' },
    ],
  },
  {
    id: 's-carry', for: ['alok'],
    label: '“Whoever’s house it is, Uncle, I’ll carry the boxes. Name the day.”',
    hint: 'Help that asks for nothing and claims nothing.',
    effects: {
      stats: { warmth: 4, trust: 2 },
      relations: { raj: 4, vikram: 2 },
      flags: ['alok-carries'],
    },
    ledger: {
      title: 'You offered your arms, not your opinion',
      note: 'A smaller offer, and a safer one. Not every kindness has to change the plan.',
      leans: ['alok'],
    },
    response: [
      { speaker: 'raj', mood: 'warm', text: 'You will break your back and say it is the cold.' },
      { speaker: 'narrator', text: 'It is the first time anyone has laughed in twenty minutes.' },
    ],
  },
  {
    id: 's-silent', for: ['alok'],
    label: 'Say nothing. It’s their house to arrange.',
    hint: 'Even the kindest guest knows the limits of a sofa.',
    effects: { stats: { trust: 1 }, flags: ['alok-silent'] },
    ledger: {
      title: 'You let them arrange it',
      note: 'Silence honours the family’s right to decide. It also means a decision is being made without the person who sees them most clearly.',
      leans: ['alok'],
    },
    response: [
      { speaker: 'narrator', text: 'You study the pattern of the rug. Someone has darned the corner by hand, in a thread that almost matches.' },
    ],
  },
]

add({
  id: 'stay',
  location: 'living-room',
  time: 'evening',
  cast: ['raj', 'pooja', 'vikram', 'meera', 'rohan', 'simran', 'kabir', 'ananya'],
  lines: [
    { speaker: 'narrator', text: 'The light has gone amber. The tea has gone lukewarm. Vikram clears his throat — the sound of a man about to say the practical thing.' },
    { speaker: 'vikram', mood: 'tired', text: 'There is a bigger problem. For the repair, the terrace will be open to the sky. Plaster, dust, rain if it comes early. You can’t stay here for six weeks.' },
    { speaker: 'raj', mood: 'stern', text: 'Six weeks. In someone else’s house.' },
    { speaker: 'rohan', mood: 'warm', text: 'They can come to us. Obviously.' },
    { speaker: 'simran', mood: 'worried', text: 'Rohan —' },
    { speaker: 'kabir', mood: 'worried', text: 'We’ve the box room. It’s small, but —' },
    { speaker: 'ananya', mood: 'worried', text: 'Kabir. The stairs.' },
    { speaker: 'meera', mood: 'tired', text: 'Vikram, our flat is —' },
    { speaker: 'narrator', text: 'Meera stops. She does not finish the sentence, and everyone hears the end of it anyway.' },
    { speaker: 'pooja', mood: 'worried', text: 'Nobody has asked whether we want to go anywhere.', notFor: ['pooja'] },
    { speaker: 'thought', for: ['parent'], text: 'You imagine your own pillow. Your own tap, which runs a little warm if you leave it on. Your own bed, with its dent exactly the shape of you.' },
    { speaker: 'thought', for: ['child'], mood: 'worried', text: 'A house can be offered by a mouth that has no bed to give it with. Everyone at this table has done their sums, and the sums do not agree.' },
    { speaker: 'thought', for: ['alok'], text: 'Your room above the shop smells of paper and glue, and the door sticks. It also has a bed, and a window that faces the right way.' },
  ],
  decision: {
    prompt: {
      parent: 'The sons are arranging your life in whispers. What do you say?',
      child: 'Six weeks, two elderly parents, four households. What do you offer — and what do you admit?',
      alok: 'The sons are deciding. You are not a son. What do you do?',
    },
    options: stayOptions,
  },
  next: 'dusk',
})

/* ------------------------------------------------------------------ */
/* 5. Where to go — navigation as story                                */
/* ------------------------------------------------------------------ */
add({
  id: 'dusk',
  location: 'living-room',
  time: 'evening',
  cast: ['raj', 'vikram', 'rohan', 'kabir', 'alok'],
  lines: [
    { speaker: 'narrator', text: 'By seven, the room has loosened into small conversations. Cups clink in the kitchen. Two voices rise and fall in the dining room. On the balcony, a door has been left ajar.' },
    { speaker: 'narrator', text: 'You cannot be in all three places. Where you stand will decide what you hear.' },
  ],
  decision: {
    prompt: 'Where do you go?',
    options: [
      {
        id: 'go-kitchen',
        label: 'Follow the sound of cups to the kitchen.',
        hint: 'Where Pooja is “only rinsing.”',
        next: 'v-kitchen',
      },
      {
        id: 'go-dining',
        label: 'Follow the low voices to the dining room.',
        hint: 'Where the brothers think they are alone.',
        next: 'v-dining',
      },
      {
        id: 'go-balcony',
        label: 'Step out onto the balcony.',
        hint: 'Where Raj stands with his hands behind his back.',
        next: 'v-balcony',
      },
    ],
  },
})

/* ------------------------------------------------------------------ */
/* 6a. Kitchen                                                         */
/* ------------------------------------------------------------------ */
add({
  id: 'v-kitchen',
  location: 'kitchen',
  time: 'evening',
  cast: ['pooja', 'meera', 'simran', 'ananya'],
  lines: [
    { speaker: 'narrator', text: 'The kitchen smells of cardamom and hot steel. The tap runs over a cup that is already clean.' },
    { speaker: 'pooja', mood: 'warm', text: 'Go, go, sit with the others. I’m only rinsing.' },
    { speaker: 'simran', mood: 'tired', text: 'Mummyji, you’ve rinsed that cup four times.' },
    { speaker: 'meera', mood: 'worried', text: 'The blood-pressure strip on the shelf, Mummyji — it’s nearly full. It’s been three weeks.' },
    { speaker: 'pooja', mood: 'tired', text: 'I take it when I remember. The pharmacy is dear, beta. And I’m not ill.' },
    { speaker: 'ananya', mood: 'warm', text: 'I buy mine monthly. I’ll buy yours as well. It’s nothing.' },
    { speaker: 'pooja', mood: 'hurt', text: 'No, no. It’s — ' },
    { speaker: 'narrator', text: 'She laughs, a little too long. She has told the truth by accident, and now she does not know what to do with her hands.' },
  ],
  decision: {
    prompt: {
      pooja: 'Three young women are looking at you with the same expression. What do you give them?',
      raj: 'You stand at the kitchen door with an empty cup. You have heard it all.',
      child: 'You came to carry cups. You have been handed something heavier.',
      alok: 'You are in the doorway with a tray. This was not meant for your ears.',
    },
    options: [
      {
        id: 'k-truth', for: ['parent'],
        label: {
          pooja: '“I’ve been stretching the strip. It’s the money, nothing more.”',
          raj: '“Pooja. Why didn’t you tell me?”',
        },
        hint: 'Saying it ends the pretence — for both of you.',
        effects: { stats: { trust: 8, dignity: -4, warmth: 6 }, flags: ['bp-strip-known'], relations: { meera: 4, simran: 4, ananya: 4 } },
        ledger: {
          title: 'The strip came out of hiding',
          note: 'A small plastic strip carried more truth than the whole family meeting. It cost a little pride and bought a little relief.',
          leans: ['parents', 'children'],
        },
        response: [
          { speaker: 'pooja', mood: 'warm', text: 'It is only that I did not want to be another number on the budget.' },
          { speaker: 'simran', mood: 'warm', text: 'You are not a number, Mummyji. You are the reason there is a budget.' },
        ],
      },
      {
        id: 'k-laugh', for: ['parent'],
        label: {
          pooja: '“Nonsense. I’m made of mustard oil and stubbornness.”',
          raj: '“Come, Pooja. The tea is cold. Leave the cups.”',
        },
        hint: 'Shield the family from your needs.',
        effects: { stats: { dignity: 4, trust: -4 }, flags: ['bp-strip-hidden'] },
        ledger: {
          title: 'You laughed it off',
          note: 'The women in the kitchen did not believe it. They let it pass. That, too, is a kind of sorrow.',
          leans: ['parents'],
        },
        response: [
          { speaker: 'meera', mood: 'worried', text: 'Of course, Mummyji.' },
          { speaker: 'narrator', text: 'Three women exchange a glance across the steam, and agree to bring it up again.' },
        ],
      },
      {
        id: 'k-take', for: ['child'],
        label: 'Take the strip. “Mummy, I’ll refill it every month. No arguments.”',
        hint: 'Care, handed over as a task.',
        effects: { stats: { warmth: 7, burden: 4, trust: 3, dignity: -2 }, flags: ['child-refills-meds'] },
        ledger: {
          title: 'You took the tablets over',
          note: 'The medicine will be taken. Whether your mother will feel looked after or looked over is a different matter.',
          leans: ['children'],
        },
        response: [
          { speaker: 'pooja', mood: 'warm', text: 'You sound exactly like your father at the bank.' },
          { speaker: 'narrator', text: 'She says it as a complaint. She takes the strip anyway.' },
        ],
      },
      {
        id: 'k-chide', for: ['child'],
        label: '“Why didn’t you tell us? We would have helped.”',
        hint: 'True, loving, and slightly accusing.',
        effects: { stats: { trust: 4, warmth: 1, dignity: -4 }, relations: { pooja: -2 }, flags: ['asked-why-not-told'] },
        ledger: {
          title: 'You asked why she hadn’t told you',
          note: 'It is the question every child asks. It is rarely answered, because the true answer is “because you would have worried,” and that is the whole problem.',
          leans: ['children'],
        },
        response: [
          { speaker: 'pooja', mood: 'tired', text: 'Because then you would have worried.' },
          { speaker: 'narrator', text: 'It is the entire problem, said in seven words, over a steel tumbler.' },
        ],
      },
      {
        id: 'k-note', for: ['alok'],
        label: 'Quietly note the name on the strip. Tell no one.',
        hint: 'To act without being asked.',
        effects: { stats: { trust: 2, warmth: 1 }, learn: ['k-strip-name'], flags: ['alok-noted-strip'] },
        ledger: {
          title: 'You kept a secret kindly',
          note: 'You will fix the problem without making her say that it was one. That is a gift — unless it becomes a habit of knowing more than the family does.',
          leans: ['alok'],
        },
        response: [{ speaker: 'narrator', text: 'You read the name on the foil — a common one, cheaply made, easily bought — and put the tray down, and say nothing.' }],
      },
      {
        id: 'k-ask', for: ['alok'],
        label: 'Ask the daughters-in-law, softly, to share the cost — without making Aunty feel like charity.',
        hint: 'Organise their kindness. Don’t claim your own.',
        effects: { stats: { warmth: 5, trust: 4 }, relations: { meera: 4, simran: 2, ananya: 4 }, flags: ['alok-organised-care'] },
        ledger: {
          title: 'You enlisted them quietly',
          note: 'You asked the people with the right to help to help. No one mentioned the word charity. You noticed how rare that is.',
          leans: ['alok', 'children'],
        },
        response: [
          { speaker: 'meera', mood: 'warm', text: 'Leave it with us. We’ll make it a monthly thing — from the three of us. She won’t have to hear the word.' },
        ],
      },
    ],
  },
  next: 'close',
})

/* ------------------------------------------------------------------ */
/* 6b. Dining room                                                     */
/* ------------------------------------------------------------------ */
add({
  id: 'v-dining',
  location: 'dining-room',
  time: 'evening',
  cast: ['vikram', 'rohan', 'meera'],
  lines: [
    { speaker: 'narrator', text: 'The dining table has seated eleven at its busiest. Tonight it seats two angry brothers speaking in whispers, which is the loudest kind of speaking.' },
    { speaker: 'vikram', mood: 'stern', text: 'Seven lakh, Rohan. And you nod, and offer a house you haven’t got a room in.' },
    { speaker: 'rohan', mood: 'hurt', text: 'I offered what I had. What did you offer — a quotation?' },
    { speaker: 'vikram', mood: 'tired', text: 'I’m the one who will be writing the cheque. Do you remember which fixed deposit paid for Kabir’s degree? And which one didn’t pay for ours?' },
    { speaker: 'meera', mood: 'worried', text: 'Vikram. Not here. Not under the school photographs.' },
    { speaker: 'rohan', mood: 'hurt', text: 'You think I don’t know? I count my debts at night. You count Papa’s.' },
    { speaker: 'narrator', text: 'On the wall behind them, three small boys in school blazers grin at the camera — equal in every way that was ever photographed.' },
  ],
  decision: {
    prompt: {
      parent: 'You stand in the doorway with the sugar bowl. Your sons have not seen you.',
      child: 'The quarrel is going nowhere, and it is going there loudly.',
      alok: 'You are passing with a tray. You are not meant to hear this.',
    },
    options: [
      {
        id: 'd-enter', for: ['parent'],
        label: 'Step in. Let them see that you’ve heard.',
        hint: 'Better ashamed than believing you deaf.',
        effects: { stats: { trust: 4, dignity: -6, warmth: -3 }, relations: { vikram: -4, rohan: -4 }, flags: ['sons-saw-parent-overhear'] },
        ledger: {
          title: 'You let them see you',
          note: 'They stopped at once, as boys do. They were ashamed. They have also learned that their quarrel is something their parents can hear.',
          leans: ['parents', 'children'],
        },
        response: [
          { speaker: 'vikram', mood: 'worried', text: 'Papa — we didn’t —' },
          { speaker: 'rohan', mood: 'hurt', text: 'We were only —' },
          { speaker: 'narrator', text: 'The sugar bowl clinks as it is set down. Nobody says what they were only doing.' },
        ],
      },
      {
        id: 'd-withdraw', for: ['parent'],
        label: 'Step back unseen. A quarrel between brothers is theirs to finish.',
        hint: 'You will carry what you heard.',
        effects: { stats: { dignity: 3, trust: -2 }, learn: ['k-brothers'], flags: ['parent-overheard'] },
        ledger: {
          title: 'You heard and let it be',
          note: 'You respected their privacy and kept your hurt. Neither of your sons knows that the fixed deposit has been quarrelled over in your own dining room.',
          leans: ['parents'],
        },
        response: [{ speaker: 'narrator', text: 'You return to the living room. The sugar bowl is still in your hands. You cannot remember what you wanted it for.' }],
      },
      {
        id: 'd-defend-v', for: ['vikram'],
        label: '“I’m saying what’s true, Rohan. Somebody has to.”',
        hint: 'Fairness without softness.',
        effects: { stats: { trust: -6, warmth: -6 }, relations: { rohan: -10, kabir: -3 }, flags: ['vikram-pressed'] },
        ledger: {
          title: 'You pressed the point',
          note: 'It is true that the deposit paid for one degree and not another. It is also true that your brother lies awake over his debts, and you just told him he is only the fun one.',
          leans: ['children'],
        },
        response: [
          { speaker: 'rohan', mood: 'hurt', text: 'And you’re saying it like a judge. I’m your brother, not your staff.' },
          { speaker: 'meera', mood: 'stern', text: 'Both of you. Enough.' },
        ],
      },
      {
        id: 'd-defend-r', for: ['rohan'],
        label: '“And you say it like a judge. I’m your brother, not your staff.”',
        hint: 'You have been silent too long.',
        effects: { stats: { trust: -4, warmth: -4 }, relations: { vikram: -10 }, flags: ['rohan-answered-back'] },
        ledger: {
          title: 'You answered back',
          note: 'For once the avoider did not avoid. The brothers have said what they have wanted to say for ten years — loudly, in the wrong room.',
          leans: ['children'],
        },
        response: [
          { speaker: 'vikram', mood: 'stern', text: 'Then act like one. Show up with a number.' },
          { speaker: 'meera', mood: 'stern', text: 'Both of you. Enough.' },
        ],
      },
      {
        id: 'd-defend-k', for: ['kabir'],
        label: 'Walk in. “Stop. It’s my degree you’re fighting over. If you’re angry, be angry at me.”',
        hint: 'You have been waiting to say this for years.',
        effects: { stats: { trust: 4, warmth: -2, dignity: 2 }, relations: { vikram: -4, rohan: 4 }, flags: ['kabir-confronted'] },
        ledger: {
          title: 'You stood in the line of fire',
          note: 'You took the quarrel on yourself, which is brave and a little theatrical. Vikram heard: you do not deny the debt. Rohan heard: you are not hiding behind it.',
          leans: ['children'],
        },
        response: [
          { speaker: 'vikram', mood: 'tired', text: 'Kabir — I wasn’t angry at you. I’m angry that it’s only ever one person’s fault.' },
          { speaker: 'rohan', mood: 'hurt', text: 'It’s no one’s fault. It’s the fixed deposit. It’s just a number.' },
        ],
      },
      {
        id: 'd-peace', for: ['child'],
        label: '“We’re all tired. We’ll sort the money out tomorrow — together, with Papa. Not like this.”',
        hint: 'Break the fight. Leave the fairness for later.',
        effects: { stats: { trust: 6, warmth: 6 }, relations: { vikram: 4, rohan: 4, kabir: 4 }, flags: ['brothers-paused'] },
        ledger: {
          title: 'You put the fight down',
          note: 'Nothing was resolved. But for the first time that evening, two angry men breathed out.',
          leans: ['children'],
        },
        response: [
          { speaker: 'meera', mood: 'warm', text: 'Thank you. Come, sit. The sabzi’s gone cold, but we can complain about it properly.' },
          { speaker: 'narrator', text: 'Someone laughs. It is a small laugh. It is the first one that is not for show.' },
        ],
      },
      {
        id: 'd-tray', for: ['alok'],
        label: 'Keep walking. Set the tray down, say nothing, leave them their privacy.',
        hint: 'Some rooms are not yours.',
        effects: { stats: { trust: 1 }, learn: ['k-brothers'], flags: ['alok-respected-privacy'] },
        ledger: {
          title: 'You walked past',
          note: 'You respected a quarrel that was not yours. You also heard it, and you will not unhear it.',
          leans: ['alok'],
        },
        response: [{ speaker: 'narrator', text: 'You set the tray down very gently, as if the table might wake. You hear the words “fixed deposit” and then you do not.' }],
      },
      {
        id: 'd-speak-a', for: ['alok'],
        label: '“You are both measuring the wrong thing. Your mother hides an empty biscuit tin behind the rice.”',
        hint: 'True, uninvited, and sharper than you meant.',
        effects: { stats: { trust: -6, warmth: -2 }, relations: { vikram: -8, rohan: -4 }, flags: ['alok-told-the-sons'] },
        ledger: {
          title: 'You told them what you saw',
          note: 'Everything you said was true. Every word was also an accusation, from someone who has visited for four years and has never once been asked to pay a bill.',
          leans: ['alok'],
        },
        response: [
          { speaker: 'vikram', mood: 'stern', text: 'We know what our mother hides, Alok. We have lived with it longer than you.' },
          { speaker: 'rohan', mood: 'hurt', text: 'He isn’t wrong, though.' },
        ],
      },
    ],
  },
  next: 'close',
})

/* ------------------------------------------------------------------ */
/* 6c. Balcony                                                         */
/* ------------------------------------------------------------------ */
add({
  id: 'v-balcony',
  location: 'balcony',
  time: 'night',
  cast: (persona) => (persona === 'raj' ? ['pooja'] : persona === 'pooja' ? ['raj'] : ['raj']),
  lines: [
    { speaker: 'narrator', text: 'The lane is lighting its lamps one window at a time. Raj stands at the rail with his hands behind his back, the way he once stood at the bank’s front counter at closing.' },
    { speaker: 'raj', mood: 'tired', text: 'Your mother counts the milk packets when she thinks I’m not looking. I count them when she isn’t.' },
    {
      speaker: 'pooja', mood: 'warm',
      for: ['raj'],
      text: 'Then we are two fools counting the same packets.',
    },
    {
      speaker: 'vikram', mood: 'worried', for: ['vikram'],
      text: 'Papa, I could —',
    },
    { speaker: 'rohan', mood: 'worried', for: ['rohan'], text: 'Papa — I’ll make it work, I swear —' },
    { speaker: 'kabir', mood: 'worried', for: ['kabir'], text: 'Papa, I’m sorry. About the — about everything.' },
    { speaker: 'alok', mood: 'worried', for: ['alok'], text: 'Uncle, I’m sorry. I didn’t mean to intrude.' },
    { speaker: 'raj', mood: 'hurt', notFor: ['raj'], text: 'No. Stay. It is easier to say to someone who is not looking at me.' },
    { speaker: 'raj', mood: 'tired', text: 'A man who asks is a man who has stopped providing. That is what my father taught me. I am trying to unlearn it, at sixty-one, on a balcony.' },
    { speaker: 'narrator', text: 'A scooter hums past below. Somewhere a pressure cooker whistles. The ordinary world, going on.' },
  ],
  decision: {
    prompt: {
      raj: 'You have said more in one breath than in a year. What do you do with the silence you have made?',
      pooja: 'He has said the thing out loud. What do you give back?',
      child: 'Your father is, for once, speaking to you as a person. Do not waste it.',
      alok: 'He is speaking to you as he would to a son. You are not one. What do you do?',
    },
    options: [
      {
        id: 'b-ask', for: ['parent'],
        label: {
          raj: '“I need help. I don’t know how to ask for it.”',
          pooja: '“Then ask me first, Raj. Practise on me.”',
        },
        hint: { raj: 'The sentence your pride has never allowed.', pooja: 'Offer him a smaller door first.' },
        effects: { stats: { warmth: 10, trust: 10, dignity: 2 }, flags: ['admitted-need'], relations: { pooja: 6, raj: 6 } },
        ledger: {
          title: 'You said the sentence',
          note: 'Four words and thirty-six years. No one was there to applaud. That was the point.',
          leans: ['parents'],
        },
        response: [
          { speaker: 'narrator', text: 'Below, a vendor calls out the last of his guavas. The two of you stand and listen to it as if it were music.' },
        ],
      },
      {
        id: 'b-hold', for: ['parent'],
        label: {
          raj: '“A man holds his own roof up. We shall see.”',
          pooja: 'Say nothing. Rest your hand over his on the rail.',
        },
        hint: { raj: 'The old rule again.', pooja: 'Be there. Do not push.' },
        effects: { stats: { dignity: 4, warmth: 3, trust: -3 }, flags: ['held-the-line'] },
        ledger: {
          title: 'You kept the old rule',
          note: 'The rule has held you up for sixty-one years. It has also held you apart from the people most willing to take your weight.',
          leans: ['parents'],
        },
        response: [{ speaker: 'narrator', text: 'The streetlamp across the lane flickers on. Neither of you says what you are both thinking.' }],
      },
      {
        id: 'b-want', for: ['child'],
        label: '“Papa — not how much. What do you want? Tell me, and I’ll take it from there.”',
        hint: 'Ask the better question.',
        effects: { stats: { trust: 10, warmth: 8, dignity: 3 }, relations: { raj: 10 }, flags: ['asked-what-papa-wants'] },
        ledger: {
          title: 'You asked the better question',
          note: 'He did not answer at once. He has never been asked what he wants rather than what he needs. It will take a day or two to find the words.',
          leans: ['children', 'parents'],
        },
        response: [
          { speaker: 'raj', mood: 'warm', text: 'I want to be there when the baby’s born. I want to walk to the market without counting steps.' },
          { speaker: 'narrator', text: 'It is not a long list. It is the longest list he has ever made out loud.' },
        ],
      },
      {
        id: 'b-insist', for: ['child'],
        label: 'Press an envelope into his hand. “No arguments, Papa.”',
        hint: 'Generous, quick — and a little like being handled.',
        effects: { stats: { burden: 8, dignity: -6, warmth: 3, trust: -2 }, relations: { raj: -2 }, flags: ['pressed-envelope'] },
        ledger: {
          title: 'You handed him an envelope',
          note: 'It was sincere and it helped. He took it as men of his generation take such things: with thanks, and a small, private shrinking.',
          leans: ['children'],
        },
        response: [
          { speaker: 'raj', mood: 'tired', text: 'Thank you, beta.' },
          { speaker: 'narrator', text: 'He puts it in his kurta pocket without opening it, the way one pockets a bill one will have to pay.' },
        ],
      },
      {
        id: 'b-listen', for: ['alok'],
        label: '“I’m not family, Uncle. But I’m here. Say whatever you need to say.”',
        hint: 'Presence, not a plan.',
        effects: { stats: { warmth: 8, trust: 8 }, relations: { raj: 10 }, flags: ['alok-listened'] },
        ledger: {
          title: 'You offered your ears',
          note: 'It was less than a solution and more than a gesture. He told you something he had not told his sons. Be careful what you do with it.',
          leans: ['alok', 'parents'],
        },
        response: [
          { speaker: 'raj', mood: 'warm', text: 'You have your father’s patience. He would have been proud of the printer you’ve become.' },
          { speaker: 'narrator', text: 'You had not known how long you had been waiting to hear someone say it.' },
        ],
      },
      {
        id: 'b-promise', for: ['alok'],
        label: '“Leave Aunty’s medicines and your knee to me, Uncle. I’ll see to it all.”',
        hint: 'Loving — and very large.',
        effects: { stats: { warmth: 4, burden: 6, dignity: -6, trust: -6 }, relations: { raj: 4, vikram: -10 }, flags: ['alok-promised-too-much'] },
        ledger: {
          title: 'You promised too much',
          note: 'You meant every word. But a stranger who promises to carry a father’s knee and a mother’s medicines has just told that father’s sons something about themselves.',
          leans: ['alok'],
        },
        response: [
          { speaker: 'raj', mood: 'worried', text: 'Beta — you have a shop to run, and a father’s debts. Don’t take on mine.' },
          { speaker: 'narrator', text: 'He says it kindly. He also says it the way one declines a gift one cannot afford to accept.' },
        ],
      },
    ],
  },
  next: 'close',
})

/* ------------------------------------------------------------------ */
/* 7. End of the evening                                               */
/* ------------------------------------------------------------------ */
add({
  id: 'close',
  location: 'living-room',
  time: 'night',
  cast: ['pooja'],
  lines: [
    { speaker: 'narrator', text: 'By nine the cars have gone and the fan has been switched off. Pooja hangs the chipped cup back on its hook. The house settles on its old beams.' },
    { speaker: 'narrator', text: 'No one has won tonight, and no one has lost. Somewhere between the roof and the cups, a family has begun to decide who it is.' },
  ],
  ends: true,
})

export const SUNDAY_CHAI: StoryScene = {
  id: 'sunday-chai',
  title: 'Sunday Chai',
  subtitle: 'A quote on the table. A family trying not to say what it means.',
  start: 'open',
  nodes,
}

