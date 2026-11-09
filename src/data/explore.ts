import type { Localized, LocationId } from '../types'

/** Rectangles are in the 1600×900 art coordinate system. */
export interface Rect { x: number; y: number; w: number; h: number }

export interface Hotspot extends Rect {
  id: string
  label: string
  text: Localized
  learn?: string
}

export interface Exit extends Rect {
  to: LocationId
  label: string
}

export const EXITS: Record<LocationId, Exit[]> = {
  'living-room': [
    { to: 'balcony', label: 'The balcony', x: 68, y: 180, w: 244, h: 460 },
    { to: 'courtyard', label: 'The courtyard', x: 388, y: 240, w: 134, h: 390 },
    { to: 'dining-room', label: 'The dining room', x: 1178, y: 210, w: 224, h: 420 },
    { to: 'parents-bedroom', label: 'Parents’ bedroom', x: 1438, y: 258, w: 134, h: 370 },
  ],
  'dining-room': [
    { to: 'kitchen', label: 'The kitchen', x: 388, y: 250, w: 144, h: 380 },
    { to: 'living-room', label: 'The living room', x: 1368, y: 240, w: 214, h: 390 },
  ],
  kitchen: [
    { to: 'dining-room', label: 'The dining room', x: 58, y: 240, w: 194, h: 392 },
    { to: 'courtyard', label: 'The courtyard', x: 1418, y: 248, w: 154, h: 384 },
  ],
  'parents-bedroom': [
    { to: 'balcony', label: 'The balcony', x: 98, y: 178, w: 244, h: 462 },
    { to: 'living-room', label: 'The living room', x: 1488, y: 278, w: 112, h: 352 },
  ],
  'boys-room': [
    { to: 'living-room', label: 'The living room', x: 38, y: 248, w: 134, h: 384 },
    { to: 'courtyard', label: 'The courtyard', x: 1488, y: 298, w: 112, h: 332 },
  ],
  balcony: [
    { to: 'living-room', label: 'The living room', x: 48, y: 218, w: 134, h: 442 },
    { to: 'parents-bedroom', label: 'Parents’ bedroom', x: 1438, y: 238, w: 134, h: 422 },
  ],
  courtyard: [
    { to: 'kitchen', label: 'The kitchen', x: 138, y: 298, w: 164, h: 354 },
    { to: 'boys-room', label: 'The boys’ room', x: 1108, y: 298, w: 154, h: 354 },
    { to: 'living-room', label: 'The living room', x: 1298, y: 258, w: 184, h: 394 },
  ],
}

export const HOTSPOTS: Record<LocationId, Hotspot[]> = {
  'living-room': [
    {
      id: 'lr-fan', label: 'The ceiling fan', x: 610, y: 30, w: 380, h: 110, learn: 'x-fan',
      text: {
        parent: 'You bought it the year Vikram was born. You remember the argument about whether to splurge. You splurged. You oil it every Diwali, and nobody has ever asked why.',
        child: 'It squeaks at the third revolution. You never knew that was the sound of “home” until you moved out and couldn’t sleep without it.',
        alok: 'It squeaks at the third revolution. Raj-uncle says it keeps the household honest. You have been meaning to oil it properly since March.',
      },
    },
    {
      id: 'lr-photos', label: 'The photograph wall', x: 600, y: 145, w: 420, h: 250, learn: 'x-photo-wall',
      text: {
        raj: 'Your family, in order of arrival. You hung each one yourself, with a spirit level, though no one has ever checked.',
        pooja: 'You dust each frame on Saturday mornings. You know the one you avoid — Vikram’s graduation, where he looks so like Raj at that age that it startles you.',
        child: 'Three boys in school blazers; one wedding photograph; a gap where a fourth frame was meant to hang. You are in the photograph, and you are also, somehow, not.',
        alok: 'You are not in any of these. For three years you have told yourself it does not matter. There is a hook, though, lower down, with no frame on it.',
      },
    },
    {
      id: 'lr-calendar', label: 'The wall calendar', x: 1050, y: 155, w: 110, h: 160, learn: 'x-calendar',
      text: {
        parent: 'You hung it there on purpose. Behind it, the damp has crept past the picture rail. It was a coin-sized mark in July.',
        child: 'You lift a corner out of habit. A stain the size of a map of India. “Papa never said a word,” you think — and then, “and neither did you, to him.”',
        alok: 'It hangs a little too low for a calendar. Behind it: a long brown stain, and the smell of wet plaster. You wonder who else knows.',
      },
    },
  ],
  'dining-room': [
    {
      id: 'dr-cabinet', label: 'The crockery cabinet', x: 60, y: 150, w: 280, h: 490, learn: 'x-crockery',
      text: {
        pooja: 'Eleven plates. You remember how the twelfth sounded when it fell, in 1998. You keep the eleven out of loyalty to the one you lost.',
        raj: 'Pooja’s wedding dinner-set. You told her you’d replace the broken plate. She said “don’t.” That was twenty-six years ago.',
        child: 'You know which plate each of you was given as a child: yours has a blue rim. You still look for it on the shelf.',
        alok: 'Aunty gave you your first plate here, a tin one, before you were old enough to carry a china one safely. You still have it.',
      },
    },
    {
      id: 'dr-table', label: 'The dining table', x: 410, y: 500, w: 790, h: 230, learn: 'x-table',
      text: {
        parent: 'The leaves have not been extended in three years. You still polish them on festival eves, in case.',
        child: 'You can still feel the nick where you carved your initials with a compass when you were nine. Nobody ever scolded you. You are not sure why not.',
        alok: 'The only table at which you have eaten without being a customer. You always take the chair nearest the kitchen door, as if ready to leave.',
      },
    },
    {
      id: 'dr-photos', label: 'The school photographs', x: 1030, y: 150, w: 260, h: 240, learn: 'x-school',
      text: {
        parent: 'You wrote the year’s fee on the back of each one in pencil. You told yourself it was for the records.',
        child: 'Three identical grins. You turn one over and find your father’s handwriting: a year, a figure, a tick. You have never been this aware of being, in a sense, paid for.',
        alok: 'You notice the pencilled figures on the back. Your own school fees were paid in the same neat hand. You never asked to see the figure.',
      },
    },
  ],
  kitchen: [
    {
      id: 'k-shelf', label: 'The biscuit tin', x: 530, y: 180, w: 100, h: 70, learn: 'x-tin',
      text: {
        pooja: 'Your Emergencies tin. Seven hundred rupees folded in a cloth, and a note you wrote yourself: “Do not touch.” You have never been able to touch it.',
        raj: 'Pooja’s tin. You know about the seven hundred. You have always pretended not to.',
        child: 'You lift the lid, as you did when you were nine. No biscuits — only a folded cloth with some notes in it. You close it very quietly.',
        alok: 'It rattles oddly. Not biscuits. A folded cloth with notes in it, and a label in Aunty’s hand: “Emergencies.” You put it back exactly as it was.',
      },
    },
    {
      id: 'k-strip', label: 'The tablet strip', x: 616, y: 200, w: 66, h: 56, learn: 'x-strip',
      text: {
        pooja: 'Nine gone out of twenty-eight, in three weeks. You have been counting them like beads.',
        raj: 'You read the date on the pharmacy sticker. Three weeks. You stand there longer than you need to.',
        child: 'Nine gone, nineteen to go. The sticker is three weeks old. You do the arithmetic and hate it.',
        alok: 'Twenty-eight tablets, nine gone. You photograph the label with your phone without really deciding to.',
      },
    },
    {
      id: 'k-calendar', label: 'The kitchen calendar', x: 1080, y: 166, w: 106, h: 166, learn: 'x-calendar-k',
      text: {
        parent: 'Your system: a dot for each day the budget held. There are more gaps than you would like to admit.',
        child: 'Tiny dots beside the dates, in pencil. You think it is for vegetable deliveries. It is not.',
        alok: 'A dot beside each date. Some are filled in. You have the uncomfortable feeling you are reading a diary.',
      },
    },
  ],
  'parents-bedroom': [
    {
      id: 'pb-bed', label: 'The carved bed', x: 500, y: 330, w: 600, h: 340, learn: 'x-bed',
      text: {
        raj: 'Left side, by the door. You moved there the night Vikram had a fever and have never moved back.',
        pooja: 'You sleep nearer the window. You like to see the sky before you pretend to sleep.',
        child: 'You were never allowed to jump on this bed, so you did, once, when you were six. You remember the exact weight of the silence that followed.',
        alok: 'You have never been in this room. Standing at its edge feels like reading a letter not addressed to you.',
      },
    },
    {
      id: 'pb-almirah', label: 'The steel almirah', x: 1230, y: 150, w: 240, h: 500, learn: 'x-almirah',
      text: {
        raj: 'In your best shirt’s pocket: the surgeon’s slip, folded in eight. You check it is still there the way some people check a lock.',
        pooja: 'You know exactly which shirt it is in. You have never unfolded it again. You read it once and that was enough.',
        child: 'Locked. You were told once that the key was in “a safe place.” You were never told where; you are not sure you ever wanted to know.',
        alok: 'A tall grey almirah, key in the lock. You step back. It is not your business, and you know it.',
      },
    },
    {
      id: 'pb-wedding', label: 'The wedding photograph', x: 690, y: 100, w: 220, h: 200, learn: 'x-wedding',
      text: {
        parent: 'Behind the frame, in blue ink, a line Raj wrote the week of the wedding. Pooja found it in her first month and has told no one.',
        child: 'Your parents at twenty-five and twenty-two, trying not to smile. They look like two people who have no idea what is coming. Neither do you.',
        alok: 'They look so young and so frightened. You feel, absurdly, that you should have been there to hold the camera steady.',
      },
    },
  ],
  'boys-room': [
    {
      id: 'br-posters', label: 'The posters', x: 180, y: 150, w: 310, h: 210, learn: 'x-posters',
      text: {
        parent: 'You told them to take the posters down when they moved out. They never did, and you never asked again.',
        child: 'Layers of teenage obsession pasted over each other. Under the cricketer, a pencil mark: “V + R + K = forever,” in three different hands.',
        alok: 'You were not here for these. They look like the posters of boys who knew exactly who they were going to be.',
      },
    },
    {
      id: 'br-trophies', label: 'The shelf of trophies', x: 680, y: 390, w: 240, h: 70, learn: 'x-trophies',
      text: {
        parent: 'Most are Vikram’s. A small tarnished shield reads “Best Effort — Class 4.” Rohan’s. You polish it weekly and say nothing.',
        child: 'You know whose is whose. You also know that “Best Effort” was the one that made your father cry, once, in the car park.',
        alok: 'You pick up the smallest shield: “Best Effort.” It is the only one without dust.',
      },
    },
    {
      id: 'br-bat', label: 'The cricket bat', x: 1410, y: 320, w: 90, h: 330, learn: 'x-bat',
      text: {
        parent: 'Signed by all three on the back, one rainy June. Aarav asked once if he could use it. You said it belonged to the room.',
        child: 'Three signatures, one cracked handle. You hear the exact sound of the shot that broke it. You were fourteen. You didn’t hit it. You were the wicketkeeper.',
        alok: 'Nobody is allowed to move it. You asked once, and Pooja-aunty’s whole face closed like a door.',
      },
    },
  ],
  balcony: [
    {
      id: 'bc-chair', label: 'Raj’s chair', x: 1090, y: 430, w: 180, h: 270, learn: 'x-chair',
      text: {
        raj: 'The cane seat has been re-woven twice. The left arm is worn pale where your hand rests when you think. You sit here when you are not sure whether to speak.',
        pooja: 'You never sit in it. But you know where the cane is worn, and why.',
        child: 'You were not allowed to touch it as a child. It is still the one chair in the house that feels as though it is waiting.',
        alok: 'Raj-uncle’s chair. You have never sat in it. Once, when no one was home, you stood behind it, and rested your hand on the back.',
      },
    },
    {
      id: 'bc-tulsi', label: 'The tulsi', x: 320, y: 380, w: 180, h: 310, learn: 'x-tulsi',
      text: {
        pooja: 'You water it before sunrise. You tell it things you have not told anyone. It is a good listener, and has never once been disappointed in you.',
        raj: 'You have caught Pooja talking to it. You pretended to be reading the newspaper. You have never mentioned it.',
        child: 'Mummy talks to it. She thinks no one knows. You heard her once, and have never told.',
        alok: 'It is the healthiest thing in the house. It is also the one thing Aunty never seems tired of.',
      },
    },
    {
      id: 'bc-lane', label: 'The lane', x: 520, y: 340, w: 700, h: 240, learn: 'x-lane',
      text: {
        raj: 'The bank’s old branch is three turnings away. You have not walked past it since the farewell. You took the long way to the market.',
        pooja: 'You can see the lit window of every neighbour who will ask about the roof.',
        child: 'You know every window. You also know that the lane knows every secret of this house, and keeps all of them, out of courtesy.',
        alok: 'From here you can see your own shop’s shutter, two lanes away. You have never seen it from the Vermas’ side.',
      },
    },
  ],
  courtyard: [
    {
      id: 'cy-neem', label: 'The neem tree', x: 300, y: 240, w: 420, h: 560, learn: 'x-neem',
      text: {
        parent: 'Three nail-marks on the trunk. You measured them every birthday. You started a fourth, lower, last Diwali, and have said nothing.',
        child: 'Your height at eight, at twelve, at sixteen. The marks stop there; you stopped coming home on birthdays. The fourth mark, lower, is not yours.',
        alok: 'There is no mark for you. You are quietly relieved. Then you look at the new mark, lower down, and feel something close to envy.',
      },
    },
    {
      id: 'cy-charpai', label: 'The charpai', x: 860, y: 700, w: 310, h: 100, learn: 'x-charpai',
      text: {
        parent: 'You re-strung it in summer. A corner is uneven — a boy once tried to mend it himself and nobody had the heart to redo it.',
        child: 'You slept on it on summer nights, in a row, your feet touching your brothers’. It is much smaller than you remember.',
        alok: 'You mended the corner when you were twelve. Raj-uncle never mentioned the uneven weave. He just let it stay.',
      },
    },
    {
      id: 'cy-pump', label: 'The old hand pump', x: 1280, y: 630, w: 130, h: 180, learn: 'x-well',
      text: {
        parent: 'It has not drawn water for fifteen years. You refuse to let anyone remove it. “It remembers,” you say.',
        child: 'Papa says it remembers. As a child you thought he meant the water. Now you think he meant something else.',
        alok: 'Dry as bone. You oil the handle anyway, when no one is looking.',
      },
    },
  ],
}
