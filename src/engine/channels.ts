// Accès aux canaux de GameState (AD-5). Lecture ici ; l'écriture (effets)
// arrive en Story 1.5.
import type { Channel } from '../schema'
import type { GameState } from './state'

/** Lit la valeur numérique d'un canal dans l'état. */
export function readChannel(state: GameState, ch: Channel): number {
  switch (ch) {
    case 'striking':
      return state.stats.striking
    case 'grappling':
      return state.stats.grappling
    case 'ground':
      return state.stats.ground
    case 'cardio':
      return state.stats.cardio
    case 'health':
      return state.meta.health
    case 'mental':
      return state.meta.mental
    case 'reputation':
      return state.meta.reputation
    case 'followers':
      return state.meta.followers
    case 'money':
      return state.meta.money
  }
}
