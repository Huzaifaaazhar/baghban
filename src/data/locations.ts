import type { Location, LocationId } from '../types'

export const LOCATIONS: Record<LocationId, Location> = {
  'living-room': {
    id: 'living-room',
    name: 'The Living Room',
    hindi: 'बैठक',
    blurb: 'Where thirty years of Sunday chai have been poured. The good sofa, the old fan, the photographs.',
    exits: ['dining-room', 'balcony', 'courtyard', 'parents-bedroom'],
  },
  'dining-room': {
    id: 'dining-room',
    name: 'The Dining Room',
    hindi: 'भोजन कक्ष',
    blurb: 'A heavy teak table that has seated eleven at its busiest — and two at its quietest.',
    exits: ['living-room', 'kitchen'],
  },
  kitchen: {
    id: 'kitchen',
    name: 'The Kitchen',
    hindi: 'रसोई',
    blurb: 'Steel containers, mustard oil, and a calendar that records what the house can afford.',
    exits: ['dining-room', 'courtyard'],
  },
  'parents-bedroom': {
    id: 'parents-bedroom',
    name: 'Raj & Pooja’s Bedroom',
    hindi: 'शयन कक्ष',
    blurb: 'A carved bed, a steel almirah, a wedding photograph that has faded to gold.',
    exits: ['living-room', 'balcony'],
  },
  'boys-room': {
    id: 'boys-room',
    name: 'The Boys’ Room',
    hindi: 'बच्चों का कमरा',
    blurb: 'Three beds, three eras of posters, and a cricket bat nobody dares move.',
    exits: ['living-room', 'courtyard'],
  },
  balcony: {
    id: 'balcony',
    name: 'The Balcony',
    hindi: 'छज्जा',
    blurb: 'Raj’s evening chair, a tulsi in a chipped pot, and the whole lane in lamplight.',
    exits: ['living-room', 'parents-bedroom'],
  },
  courtyard: {
    id: 'courtyard',
    name: 'The Courtyard',
    hindi: 'आँगन',
    blurb: 'Where festivals, weddings and quarrels have all been held under the same neem tree.',
    exits: ['living-room', 'kitchen', 'boys-room'],
  },
}

export const LOCATION_ORDER: LocationId[] = [
  'living-room', 'dining-room', 'kitchen', 'courtyard', 'balcony', 'parents-bedroom', 'boys-room',
]
