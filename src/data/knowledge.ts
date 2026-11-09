/** Things a player can come to know during play (beyond their starting knowledge). */
export const KNOWLEDGE: Record<string, { title: string; text: string }> = {
  'k-knee-public': {
    title: 'Out in the open',
    text: 'Raj’s knee needs replacing before spring: about three lakh. It is no longer a secret in this family.',
  },
  'k-looks': {
    title: 'Small signs',
    text: 'Vikram had a calculator open on his phone. Kabir could not meet his father’s eyes. Pooja’s hand found Raj’s sleeve whenever the roof was mentioned.',
  },
  'k-strip-name': {
    title: 'The tablet',
    text: 'You have the name of Pooja’s blood-pressure tablet. It is cheap. She still rations it.',
  },
  'k-brothers': {
    title: 'The brothers’ quarrel',
    text: 'Vikram and Rohan are fighting over the old fixed deposit, which paid for Kabir’s degree and nobody else’s. Neither knows how much the other lies awake over it.',
  },
  // Items found while exploring rooms
  'x-calendar': { title: 'The calendar', text: 'A damp patch the size of a map of India hides behind the wall calendar. It has been growing since July.' },
  'x-photo-wall': { title: 'The photograph wall', text: 'The wedding photograph is the only one in which Raj is smiling with his teeth.' },
  'x-fan': { title: 'The fan', text: 'The ceiling fan was bought the year Vikram was born. Raj oils it himself every Diwali.' },
  'x-table': { title: 'The dining table', text: 'The leaf extensions have not been used in three years. Pooja still polishes them on festival eves.' },
  'x-ledger': { title: 'The household ledger', text: 'Raj’s neat handwriting records every rupee. The last four months show a column headed “Medicines (P.)” that has been crossed out.' },
  'x-tin': { title: 'The biscuit tin', text: 'Pooja’s biscuit tin holds seven hundred rupees folded in a cloth. A label says “Emergencies.” Nobody has ever been allowed to touch it.' },
  'x-calendar-k': { title: 'The kitchen calendar', text: 'Pooja marks what the house can afford in tiny dots beside each date. There are more dots than there should be.' },
  'x-bed': { title: 'The carved bed', text: 'Raj sleeps on the left, closest to the door. He has done so since the night Vikram was born with a fever.' },
  'x-almirah': { title: 'The steel almirah', text: 'A shirt pocket in the almirah holds a surgeon’s slip: “Total knee replacement — recommend before March.”' },
  'x-wedding': { title: 'The wedding photograph', text: 'Behind the frame, in blue ink: “For Pooja, who made a house of two rooms.”' },
  'x-posters': { title: 'The posters', text: 'Three decades of teenage obsessions have been papered over one another. A faded cricket star still presides above the middle bed.' },
  'x-bat': { title: 'The cricket bat', text: 'Signed by all three brothers on the back. No one is allowed to move it. Aarav asked once and was told, gravely, that it belonged to the room.' },
  'x-trophies': { title: 'The shelf of trophies', text: 'Most are Vikram’s. One small, tarnished shield reads “Best Effort — Class 4” and is Rohan’s. It is polished weekly.' },
  'x-chair': { title: 'Raj’s chair', text: 'The cane seat has been re-woven twice. The left arm is worn pale where his hand rests when he thinks.' },
  'x-tulsi': { title: 'The tulsi', text: 'Pooja waters it before the sun comes up. She talks to it. Nobody has caught her at it.' },
  'x-lane': { title: 'The lane', text: 'From here Raj can see the bank’s old branch, three turnings away. He has not walked past it since he retired.' },
  'x-neem': { title: 'The neem tree', text: 'Three heights are marked on its trunk with a nail: Vikram’s, Rohan’s, Kabir’s. There is a fourth mark, lower, unlabelled. Someone has started measuring Aarav.' },
  'x-charpai': { title: 'The charpai', text: 'The weave is uneven in one corner where a boy once tried to repair it himself. Alok, aged twelve, according to Raj.' },
  'x-well': { title: 'The old pump', text: 'The hand pump no longer works. Raj refuses to let anyone remove it. “It remembers,” he says.' },
}

KNOWLEDGE['x-crockery'] = { title: 'The good dinner set', text: 'The dinner set from Pooja’s wedding has eleven plates. One broke in 1998; she kept the other eleven, in case the twelfth came back.' }
KNOWLEDGE['x-school'] = { title: 'The school photographs', text: 'Three boys in blazers, identical grins. On the back of each, in Raj’s handwriting, is the year’s fee paid — a ledger kept in photograph form.' }
KNOWLEDGE['x-strip'] = { title: 'The tablet strip', text: 'Twenty-eight tablets in the strip; nine are gone. The date on the pharmacy sticker is three weeks old.' }
