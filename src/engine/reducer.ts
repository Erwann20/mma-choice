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
      // Active les flags différés dus à ce nouvel âge (FR-9).
      const due = state.pending.filter((p) => p.atAge <= age)
      const pending = state.pending.filter((p) => p.atAge > age)
      const flags = due.length
        ? { ...state.flags, ...Object.fromEntries(due.map((p) => [p.flag, p.value])) }
        : state.flags
      // NB : le palier ne progresse plus automatiquement — il change quand le
      // joueur passe pro / signe une organisation (voir store/session).
      return {
        ...state,
        phase,
        fighter: { ...state.fighter, age },
        flags,
        pending,
      }
    }
    default:
      return state
  }
}
