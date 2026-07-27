// reduce : l'UNIQUE voie de mutation de GameState (AD-2). Fonction PURE —
// ne mute jamais `state`, renvoie toujours un nouvel objet.
import type { GameState } from './state'
import type { Action } from './actions'
import { RETIREMENT_AGE } from './config'

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADVANCE_YEAR': {
      const age = state.fighter.age + 1
      const phase = age >= RETIREMENT_AGE ? 'retired' : state.phase
      return {
        ...state,
        phase,
        fighter: { ...state.fighter, age },
      }
    }
    default:
      return state
  }
}
