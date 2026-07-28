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
  Nemesis,
} from './state'
export { createInitialState, DEFAULT_FIGHTER_NAME } from './state'
export type { SportId, SportDef, Achievement as SportAchievement } from './sports/types'
export { sportDef, playableSports } from './sports/registry'
export {
  NEMESIS_BORN_FLAG,
  nemesisToOpponent,
  birthNemesis,
  recordNemesisResult,
} from './nemesis'

export type { Opponent, FightResult, FightOutcome, FightMethod, FightChange } from './combat'
export { generateOpponent, resolveFight } from './combat'

export { earnedTier } from './progression'

export { readChannel, writeChannel } from './channels'
export {
  evalCondition,
  isEligible,
  buildPool,
  selectEvent,
  markEventConsumed,
} from './events'
export { applyEffect, applyChoice } from './effects'
export { computeScore, allTimeRank, fighterOverall } from './score'
export type { Achievement, TitleTone } from './awards'
export { careerTitle, careerAchievements, nationOf } from './awards'
export { beltOrgsWon, wasChampion } from './belts'
export { CITIES_BY_COUNTRY, citiesForCountry, cityForSlot } from './cities'
export type { Sequela } from './injuries'
export { SEQUELAE, SEQUELA_LABEL, activeSequelae, hasChronicInjury } from './injuries'
export type { SignatureTactic } from './coaching'
export { MENTOR_FLAG, SIGNATURE_LABEL, SIGNATURE_BONUS, signatureTactic } from './coaching'
export type { DailyObjective } from './daily'
export { dailyObjective, dailyScore } from './daily'

export type { Action } from './actions'
export { reduce } from './reducer'

export type { RngState } from './rng'
export { initRng, nextInt } from './rng'

export * from './config'
