import type { Character, CharacterId, PersonaId } from '../types'

/**
 * The Verma household. Everyone is written with a reason for how they behave —
 * no one here is a villain and no one is a saint.
 */
export const CHARACTERS: Record<CharacterId, Character> = {
  raj: {
    id: 'raj',
    name: 'Raj',
    fullName: 'Raj Verma',
    age: 61,
    title: 'Father · Retired bank manager',
    group: 'parents',
    occupation:
      'Thirty-eight years at a cooperative bank, the last twelve as branch manager. Retired fourteen months ago and still wakes at five to a day with no office in it.',
    responsibilities: [
      'Keeps the household accounts and the house papers',
      'Keeps the roof, the pension and the family’s good name',
      'Promised Pooja the fixed deposit would never be touched',
    ],
    finances:
      'A modest pension of ₹21,000 a month, ₹41,000 in savings, and a fixed deposit of about ₹4.2 lakh. Most of his retirement money already went into his sons’ education, weddings and first leaps.',
    personality: {
      traits: ['Proud', 'Disciplined', 'Dryly funny', 'Private'],
      portrait:
        'A man who measures love in provision. He can recite every rupee he has ever given and cannot say “I need help” without feeling he has failed. He is generous, fair-minded in his own way — and quietly controlling, because being needed was the only language he was ever taught.',
    },
    relationships: [
      { with: 'pooja', text: 'Thirty-six years of marriage. He relies on her to read what he cannot say.' },
      { with: 'vikram', text: 'Proud of his eldest, wounded by how often Vikram sounds like a manager addressing a file.' },
      { with: 'rohan', text: 'Loves his warmth, worries about his money, and has never said either aloud.' },
      { with: 'kabir', text: 'Gave Kabir the most — and quietly expects the most gratitude, which Kabir feels.' },
      { with: 'alok', text: 'Paid for Alok’s schooling years ago and never mentioned it again. Alok’s visits are the best part of his week.' },
    ],
    motivation: 'To stay the man his family leans on — and to keep his dignity intact while he leans.',
    frustration: 'That his sons speak to him as a problem to be solved, and that he has taught them to.',
    expectation: 'That his children will simply know what he needs, without being told.',
    quote: '“A man holds his own roof up. That is what my father taught me. I am trying to unlearn it.”',
    portrait: {
      skin: '#c9996b', hair: '#d8d3c8', hairStyle: 'bald-grey', grey: true, glasses: true, moustache: true,
      clothing: 'kurta', clothColor: '#e8dcc0', clothAccent: '#b48a4a', age: 'old',
    },
    playable: true,
  },

  pooja: {
    id: 'pooja',
    name: 'Pooja',
    fullName: 'Pooja Verma',
    age: 58,
    title: 'Mother · Homemaker, former tutor',
    group: 'parents',
    occupation:
      'Raised three sons and ran the household. For twenty years she also taught embroidery and music to neighbourhood girls, and made pickles that half the lane still orders.',
    responsibilities: [
      'Runs the kitchen, the calendar of festivals and the family’s moods',
      'Keeps the Sunday chai ritual alive',
      'Quietly stretches a small budget so nobody notices it is small',
    ],
    finances:
      'No income of her own now. She spends frugally and hides it: she stretches blood-pressure tablets, buys fewer vegetables and says she “isn’t hungry.”',
    personality: {
      traits: ['Warm', 'Conflict-averse', 'Observant', 'Self-sacrificing'],
      portrait:
        'Pooja loves the way a lamp loves oil — by burning down. She sees everything and says little, and her silences can weigh as much as an accusation. She is not a martyr by nature; she simply never learned that wanting something was allowed.',
    },
    relationships: [
      { with: 'raj', text: 'She knows about his knee and the doctor’s slip. She waits for him to tell her.' },
      { with: 'vikram', text: 'Afraid of him a little, as one is afraid of a person who is always tired.' },
      { with: 'rohan', text: 'Her softest heart. She also overlooks his debts because he makes her laugh.' },
      { with: 'kabir', text: 'Her youngest, still her baby; she is anxious about Ananya’s pregnancy.' },
      { with: 'alok', text: 'Feeds him, scolds him, and has quietly adopted him.' },
    ],
    motivation: 'To keep the family under one roof, loud and together, for as long as possible.',
    frustration: 'That her love has become a thing everyone expects and nobody asks about.',
    expectation: 'That someone will notice — without her having to complain.',
    quote: '“I am not unwell. I am only tired in a way medicine does not reach.”',
    portrait: {
      skin: '#d3a679', hair: '#a8a29a', hairStyle: 'bun', grey: true, bindi: true, sindoor: true, woman: true,
      clothing: 'saree', clothColor: '#8a2d3c', clothAccent: '#d9a441', dupatta: '#8a2d3c', age: 'old',
    },
    playable: true,
  },

  vikram: {
    id: 'vikram',
    name: 'Vikram',
    fullName: 'Vikram Verma',
    age: 37,
    title: 'Eldest son · Senior manager, logistics',
    group: 'children',
    occupation:
      'Regional operations manager at a logistics company. Leaves at seven, returns at nine, answers calls at dinner. Responsible for everything that runs late.',
    responsibilities: [
      'Pays a home-loan EMI of ₹58,000 a month',
      'Pays boarding-school fees for his son Aarav (15) and day-school for Tia (9)',
      'Is the one everyone calls when something breaks',
    ],
    finances:
      'Comfortable on paper, stretched in practice. His bonus was cut this year; he has not told Meera. He could carry a large expense but not quietly, and not for long.',
    personality: {
      traits: ['Dutiful', 'Rigid', 'Exhausted', 'Secretly tender'],
      portrait:
        'Vikram organises love into spreadsheets because spreadsheets don’t disappoint him. He resents being the responsible one but is terrified of being the one who isn’t. He is often right — and rarely kind about it.',
    },
    relationships: [
      { with: 'raj', text: 'Wants his father’s approval; gets it only as instructions.' },
      { with: 'meera', text: 'Loves her, hides money trouble from her, and knows exactly how that sounds.' },
      { with: 'rohan', text: 'Thinks Rohan is charming and unreliable. Envies how easily Rohan is forgiven.' },
      { with: 'kabir', text: 'Cannot forget whose degree the family FD paid for.' },
      { with: 'alok', text: 'Grateful on the surface, suspicious underneath: why does a stranger give what his own sons did not?' },
    ],
    motivation: 'To be dependable — and to be seen being dependable.',
    frustration: 'That he is the budget, the driver and the villain, and nobody has asked how he is.',
    expectation: 'That his siblings carry their fair share without being reminded.',
    quote: '“I am not angry that we have to pay. I am angry that I am the only one counting.”',
    portrait: {
      skin: '#c89468', hair: '#1f1a17', hairStyle: 'side-part', glasses: true,
      clothing: 'shirt-tie', clothColor: '#4d5a6a', clothAccent: '#7a2231', age: 'mid',
    },
    playable: true,
  },

  meera: {
    id: 'meera',
    name: 'Meera',
    fullName: 'Meera Verma',
    age: 35,
    title: 'Vikram’s wife · School vice-principal',
    group: 'spouses',
    occupation: 'Vice-principal at a girls’ school. Mediates teenagers all day and, at home, mediates her husband.',
    responsibilities: [
      'Runs the children’s homework, health and the household rhythm in a small flat',
      'Handles the school-fee paperwork',
      'Quietly holds her marriage together when Vikram goes silent',
    ],
    finances:
      'Earns ₹62,000 a month. Their combined income looks healthy, but she senses money is being kept from her and is waiting for Vikram to tell her.',
    personality: {
      traits: ['Fair', 'Direct', 'Perceptive', 'Protective of her space'],
      portrait:
        'Meera says what she means, which people mistake for coldness. She respects Raj and Pooja deeply — and has seen enough “temporary” arrangements turn permanent to be wary of any plan that begins with “just for six weeks.”',
    },
    relationships: [
      { with: 'vikram', text: 'She will take his side in public and argue with him in private.' },
      { with: 'pooja', text: 'Likes her, and feels guilty that liking her is not the same as being able to host her.' },
      { with: 'simran', text: 'The one daughter-in-law she can speak plainly to.' },
    ],
    motivation: 'To be fair to her in-laws without disappearing inside their needs.',
    frustration: 'That she is expected to be endlessly accommodating, and judged if she is not.',
    expectation: 'That Vikram will trust her with the truth about money.',
    quote: '“I can love them and still say that our flat has two bedrooms.”',
    portrait: {
      skin: '#cd9a72', hair: '#2a1e1a', hairStyle: 'bob',
      clothing: 'salwar', clothColor: '#5c6b44', clothAccent: '#d9a441', dupatta: '#c9b27a', age: 'mid', woman: true, bindi: true,
    },
    playable: false,
  },

  rohan: {
    id: 'rohan',
    name: 'Rohan',
    fullName: 'Rohan Verma',
    age: 34,
    title: 'Middle son · Independent architect',
    group: 'children',
    occupation:
      'Runs a two-person design studio from a rented room. Talented, well-liked and paid late. Has been “one big project away” from stability for six years.',
    responsibilities: [
      'Pays rent, a studio loan and two employees’ salaries',
      'Looks after his infant daughter Ira on weekends',
      'Is the family’s unofficial peacemaker',
    ],
    finances:
      'Three client invoices are ninety days overdue. Savings: almost nothing. He would give his last rupee to anyone who asked — which is the problem.',
    personality: {
      traits: ['Warm', 'Funny', 'Avoidant', 'Over-promising'],
      portrait:
        'Rohan makes every room lighter and leaves every promise heavier. He says yes to dodge conflict and then lies awake paying for the yes. His charm is real; so is his habit of using it to escape.',
    },
    relationships: [
      { with: 'simran', text: 'She backs him fiercely and is quietly furious when he commits them to things.' },
      { with: 'vikram', text: 'Admires him, bristles at being managed by him.' },
      { with: 'pooja', text: 'His mother’s favourite audience; she laughs at his jokes even when she is crying.' },
      { with: 'raj', text: 'Wants to impress him; suspects he never quite has.' },
    ],
    motivation: 'To be the son who made his parents laugh — and then the son who finally made them proud.',
    frustration: 'That kindness doesn’t pay invoices, and that no one lets him just be kind.',
    expectation: 'That others will believe his intentions even when his numbers fall short.',
    quote: '“If I say yes, nobody’s hurt tonight. Tomorrow I’ll work out how.”',
    portrait: {
      skin: '#cf9d72', hair: '#3a2a20', hairStyle: 'short', beard: true,
      clothing: 'shirt', clothColor: '#9a6b3f', clothAccent: '#4b3a2a', age: 'mid',
    },
    playable: true,
  },

  simran: {
    id: 'simran',
    name: 'Simran',
    fullName: 'Simran Verma',
    age: 32,
    title: 'Rohan’s wife · Brand designer',
    group: 'spouses',
    occupation: 'Freelance brand designer working in the corners of a toddler’s day. Her income keeps the studio alive more often than anyone admits.',
    responsibilities: [
      'Looks after baby Ira, mostly alone',
      'Quietly funds the studio’s gaps from her freelance work',
      'Keeps the peace between Rohan’s promises and their reality',
    ],
    finances: 'Earns ₹38,000 a month, irregularly. Their rented one-bedroom has no room for guests, and no cushion for Rohan’s generosity.',
    personality: {
      traits: ['Sharp', 'Loyal', 'Overextended', 'Quietly kind'],
      portrait:
        'Simran smiles with her mouth and counts with her eyes. She is often cast as the difficult daughter-in-law when she is simply the only person naming the limits. In private, she is the one who brings Pooja soup.',
    },
    relationships: [
      { with: 'rohan', text: 'Loves him; cannot keep absorbing his yeses.' },
      { with: 'pooja', text: 'Respects her more than she lets on, and resents being praised for “adjusting.”' },
      { with: 'meera', text: 'Her ally in practicality.' },
    ],
    motivation: 'To protect her small family’s footing before offering anything to the larger one.',
    frustration: 'That her “no” is heard as selfishness, and Rohan’s “yes” as generosity.',
    expectation: 'That Rohan will consult her before promising her time and money.',
    quote: '“I’m not against helping. I’m against finding out about it afterwards.”',
    portrait: {
      skin: '#d6a77f', hair: '#2d1f1a', hairStyle: 'long', woman: true, bindi: true,
      clothing: 'salwar', clothColor: '#a65a3a', clothAccent: '#e3c27a', dupatta: '#e3c27a', age: 'young',
    },
    playable: false,
  },

  kabir: {
    id: 'kabir',
    name: 'Kabir',
    fullName: 'Kabir Verma',
    age: 29,
    title: 'Youngest son · Product analyst',
    group: 'children',
    occupation: 'Product analyst at a start-up two cities away, back in Lucknow on contract. His first-year fees abroad came from Raj’s fixed deposit.',
    responsibilities: [
      'Supports his pregnant wife Ananya',
      'Pays rent and an education loan on a junior salary',
      'Carries the unspoken debt of being the one his parents invested most in',
    ],
    finances: 'Eleven thousand rupees spare this month, an education loan, and a baby due in March. He has never repaid or even properly thanked his father for the FD.',
    personality: {
      traits: ['Gentle', 'Guilty', 'Anxious', 'Idealistic'],
      portrait:
        'Kabir grew up as the family’s hope and has been apologising for it ever since. He avoids his father because Raj’s generosity feels like an invoice no one has sent. Underneath the guilt is a young man who badly wants to be useful.',
    },
    relationships: [
      { with: 'ananya', text: 'She is his anchor and his mirror — she tells him what he avoids.' },
      { with: 'raj', text: 'Loves and avoids him in the same breath.' },
      { with: 'vikram', text: 'Feels judged by him, and suspects he is right.' },
      { with: 'pooja', text: 'Still “baby” to her; he hates that he likes it.' },
    ],
    motivation: 'To earn the right to be called a good son, not just a favoured one.',
    frustration: 'That he cannot repay what he owes, and everyone can see he can’t.',
    expectation: 'That his family will let him contribute in other ways than money.',
    quote: '“Everyone remembers what Papa gave me. Nobody asks what it cost me to carry it.”',
    portrait: {
      skin: '#d3a177', hair: '#241a15', hairStyle: 'crop',
      clothing: 'sweater', clothColor: '#6f6a3f', clothAccent: '#2a2a28', age: 'young',
    },
    playable: true,
  },

  ananya: {
    id: 'ananya',
    name: 'Ananya',
    fullName: 'Ananya Verma',
    age: 28,
    title: 'Kabir’s wife · Expecting, on leave',
    group: 'spouses',
    occupation: 'Content editor, on partial leave in her seventh month. Her mother lives far away, which makes Pooja’s fussing both a comfort and a pressure.',
    responsibilities: [
      'Her pregnancy, appointments and diet',
      'Keeping Kabir from spiralling about money',
      'Wanting to be a good bahu without losing herself',
    ],
    finances: 'Earns a reduced half-salary while on leave. They have a due date, a small flat with a box room, and almost no margin.',
    personality: {
      traits: ['Gentle', 'Honest', 'Worried', 'Surprisingly firm'],
      portrait:
        'Ananya is the quietest person in the room and often the clearest. She is afraid of being a burden and refuses to pretend otherwise. She likes Pooja without reservation and wishes she could say so without it becoming a debt.',
    },
    relationships: [
      { with: 'kabir', text: 'She believes in him more than he does.' },
      { with: 'pooja', text: 'Treats her as a mother — and is aware Pooja has no one doing the same for her.' },
    ],
    motivation: 'To bring a baby into a family that is still speaking to one another.',
    frustration: 'That everyone treats her as fragile when she is simply expecting.',
    expectation: 'That the family will make room — in words first, and rooms second.',
    quote: '“A box room is still a room. What I’m afraid of is a house with no room to be honest.”',
    portrait: {
      skin: '#d9ae88', hair: '#352620', hairStyle: 'pulled-back', woman: true, bindi: true,
      clothing: 'salwar', clothColor: '#c6a655', clothAccent: '#7a2231', dupatta: '#7a2231', age: 'young',
    },
    playable: false,
  },

  alok: {
    id: 'alok',
    name: 'Alok',
    fullName: 'Alok Saxena',
    age: 30,
    title: 'Family friend · Small-press printer',
    group: 'outsider',
    occupation: 'Runs a small printing and stationery shop in Aminabad, inherited in debt from his father. Visits the Vermas every Sunday with sweets and a screwdriver.',
    responsibilities: [
      'Keeps the shop and two employees afloat',
      'Repays his late father’s creditors, slowly',
      'Fixes the Vermas’ taps, fans and WiFi without being asked',
    ],
    finances: 'Comfortable enough to be generous, not comfortable enough to be careless. A good month leaves ₹15,000 spare; most months it is less.',
    personality: {
      traits: ['Open-hearted', 'Impulsive', 'Observant', 'Quick to judge'],
      portrait:
        'Alok lost his parents young, and Raj paid his school fees without ever being thanked or reminded. He gives the Vermas what he never had: a family he can be useful to. Because he arrives with gratitude and without history, he sees clearly — and sometimes unfairly. He does not know what the sons have carried.',
    },
    relationships: [
      { with: 'raj', text: 'Raj is the father he borrowed. He would do almost anything for him.' },
      { with: 'pooja', text: 'Eats whatever she puts in front of him; she mends his shirts.' },
      { with: 'all', text: 'Thinks the sons are careless with what he would treasure. He has never asked what they are afraid of.' },
    ],
    motivation: 'To repay a kindness that was never meant as a loan — and to belong somewhere.',
    frustration: 'That the sons appear to take their parents for granted, and that he has no standing to say so.',
    expectation: 'That being useful will earn him a place at the table.',
    quote: '“I am not their son. But I know what it is to have no one to sit across from.”',
    portrait: {
      skin: '#c48f65', hair: '#17110e', hairStyle: 'short',
      clothing: 'kurta', clothColor: '#506a58', clothAccent: '#d9a441', age: 'young', beard: true,
    },
    playable: true,
  },
}

export const FAMILY_ORDER: CharacterId[] = [
  'raj', 'pooja', 'vikram', 'meera', 'rohan', 'simran', 'kabir', 'ananya', 'alok',
]

export const PERSONA_PARTNER: Partial<Record<PersonaId, CharacterId>> = {
  vikram: 'meera',
  rohan: 'simran',
  kabir: 'ananya',
  raj: 'pooja',
  pooja: 'raj',
}
