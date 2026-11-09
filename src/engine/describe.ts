import type { Stat } from '../types'

export const STAT_META: Record<Stat, { label: string; words: [string, string, string]; hint: string }> = {
  warmth: { label: 'Warmth in the house', words: ['Brittle', 'Guarded', 'Glowing'], hint: 'How safe it feels to be tender here.' },
  dignity: { label: 'The parents’ dignity', words: ['Bruised', 'Intact', 'Honoured'], hint: 'How much of themselves Raj and Pooja still hold.' },
  burden: { label: 'Weight on the children', words: ['Light', 'Heavy', 'Crushing'], hint: 'What the sons and their families are carrying.' },
  trust: { label: 'Trust across generations', words: ['Thin', 'Wary', 'Growing'], hint: 'How far each side believes the other means well.' },
}

export function statWord(stat: Stat, v: number): string {
  const w = STAT_META[stat].words
  return v < 34 ? w[0] : v < 67 ? w[1] : w[2]
}

export function relationWord(v: number): string {
  if (v <= -20) return 'Wounded'
  if (v <= -6) return 'Strained'
  if (v < 6) return 'Unchanged'
  if (v < 18) return 'Warmer'
  return 'Deeply moved'
}

export function relationTone(v: number): 'bad' | 'neutral' | 'good' {
  return v <= -6 ? 'bad' : v >= 6 ? 'good' : 'neutral'
}
