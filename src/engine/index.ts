// Cœur fonctionnel (AD-1) : API publique du moteur pur.
export type {
  GameState,
  Fighter,
  Stats,
  Meta,
  Sex,
  Style,
  Phase,
  Tier,
  FightRecord,
  Flags,
  FighterSetup,
  PendingFlag,
} from './state'
export { createInitialState } from './state'

export type { Opponent, FightResult, FightOutcome, FightMethod, FightChange } from './combat'
export { generateOpponent, resolveFight } from './combat'

export { earnedTier, promoteTier } from './progression'

export { readChannel, writeChannel } from './channels'
export {
  evalCondition,
  isEligible,
  buildPool,
  selectEvent,
  markEventConsumed,
} from './events'
export { applyEffect, applyChoice } from './effects'
export { computeScore, allTimeRank } from './score'

export type { Action } from './actions'
export { reduce } from './reducer'

export type { RngState } from './rng'
export { initRng, nextInt } from './rng'

export * from './config'
