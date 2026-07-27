// Cœur fonctionnel (AD-1) : API publique du moteur pur.
export type {
  GameState,
  Fighter,
  Stats,
  Meta,
  Sex,
  Style,
  Phase,
  FighterSetup,
  PendingFlag,
} from './state'
export { createInitialState } from './state'

export { readChannel } from './channels'
export {
  evalCondition,
  isEligible,
  buildPool,
  selectEvent,
  markEventConsumed,
} from './events'

export type { Action } from './actions'
export { reduce } from './reducer'

export type { RngState } from './rng'
export { initRng, nextInt } from './rng'

export * from './config'
