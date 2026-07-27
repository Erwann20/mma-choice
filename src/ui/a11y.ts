// Accessibilité (NFR-10, UX-DR17) : formulation des variations de stats pour
// annonce en live region aux lecteurs d'écran.
import type { GameState } from '../engine'
import type { Channel } from '../schema'
import { CHANNEL_LABEL } from './labels'

const CHANNELS: Channel[] = [
  'striking',
  'grappling',
  'ground',
  'cardio',
  'health',
  'mental',
  'reputation',
  'followers',
  'money',
]

function read(game: GameState, ch: Channel): number {
  switch (ch) {
    case 'striking':
      return game.stats.striking
    case 'grappling':
      return game.stats.grappling
    case 'ground':
      return game.stats.ground
    case 'cardio':
      return game.stats.cardio
    case 'health':
      return game.meta.health
    case 'mental':
      return game.meta.mental
    case 'reputation':
      return game.meta.reputation
    case 'followers':
      return game.meta.followers
    case 'money':
      return game.meta.money
  }
}

/**
 * Décrit les variations de canaux entre deux états (chaîne vide si aucune),
 * ex. « Réputation +8, Forme −5 ». Pour annonce via aria-live (UX-DR17).
 */
export function describeStatChanges(prev: GameState, next: GameState): string {
  const parts: string[] = []
  for (const ch of CHANNELS) {
    const delta = read(next, ch) - read(prev, ch)
    if (delta === 0) continue
    const sign = delta > 0 ? '+' : '−'
    const unit = ch === 'money' ? ' €' : ''
    parts.push(`${CHANNEL_LABEL[ch]} ${sign}${Math.abs(delta)}${unit}`)
  }
  return parts.join(', ')
}
