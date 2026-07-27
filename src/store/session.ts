// Orchestration de la boucle de carrière (PURE, testable sans navigateur).
// Enchaîne moteur + contenu ; le store Zustand n'est qu'un conteneur (AD-2).
import type { Criterion, EventDef, StartingCriteria, OpponentPool } from '../schema'
import { loadOpponentPool } from '../schema'
import type { FighterSetup, GameState, Opponent, FightResult, Sex, Style } from '../engine'
import {
  createInitialState,
  selectEvent,
  applyChoice,
  applyEffect,
  reduce,
  generateOpponent,
  resolveFight,
  EVENTS_PER_YEAR,
} from '../engine'

// Contenu statique chargé une fois (validé au chargement, AD-4).
const OPPONENT_POOL: OpponentPool = loadOpponentPool()

export interface Session {
  game: GameState
  events: EventDef[]
  current: EventDef | null
  /** Adversaire généré quand `current` est un combat (FR-16), sinon null. */
  opponent: Opponent | null
  /** Résultat du dernier combat à afficher (écran résultat), sinon null. */
  lastResult: FightResult | null
  eventsThisYear: number
}

/** Forme persistée (AD-7) : le contenu est référencé par id, jamais embarqué. */
export interface SavedSession {
  game: GameState
  currentId: string | null
  opponent: Opponent | null
  lastResult: FightResult | null
  eventsThisYear: number
}

export function serializeSession(s: Session): SavedSession {
  return {
    game: s.game,
    currentId: s.current?.id ?? null,
    opponent: s.opponent,
    lastResult: s.lastResult,
    eventsThisYear: s.eventsThisYear,
  }
}

export function deserializeSession(saved: SavedSession, events: EventDef[]): Session {
  const current = saved.currentId ? (events.find((e) => e.id === saved.currentId) ?? null) : null
  return {
    game: saved.game,
    events,
    current,
    opponent: saved.opponent ?? null,
    lastResult: saved.lastResult ?? null,
    eventsThisYear: saved.eventsThisYear,
  }
}

/**
 * Sélectionne l'Événement suivant et, si c'est un combat, génère l'adversaire
 * (FR-16). Renvoie l'état RNG déjà propagé.
 */
function pickNext(game: GameState, events: EventDef[]): {
  game: GameState
  current: EventDef
  opponent: Opponent | null
} {
  const { event, rng } = selectEvent(game, events)
  let g: GameState = { ...game, rng }
  let opponent: Opponent | null = null
  if (event.fight) {
    const [opp, rng2] = generateOpponent(g, OPPONENT_POOL, g.rng)
    opponent = opp
    g = { ...g, rng: rng2 }
  }
  return { game: g, current: event, opponent }
}

/** Démarre une carrière : état initial + premier Événement sélectionné. */
export function startCareer(events: EventDef[], seed: number, setup?: FighterSetup): Session {
  const game0 = createInitialState(seed, setup)
  const next = pickNext(game0, events)
  return { game: next.game, events, current: next.current, opponent: next.opponent, lastResult: null, eventsThisYear: 0 }
}

export interface CreationChoices {
  name?: string
  sex: Sex
  country: string
  startAge?: number
  style: Style
  division: string
  originId?: string
  entourageId?: string
}

function applyCriterion(state: GameState, cr: Criterion): GameState {
  let s = state
  for (const eff of cr.effects) s = applyEffect(s, eff)
  if (cr.setFlags) s = { ...s, flags: { ...s.flags, ...cr.setFlags } }
  return s
}

/** Démarre une carrière depuis l'écran de création : applique les critères (FR-2). */
export function startCareerFromCreation(
  events: EventDef[],
  criteria: StartingCriteria,
  seed: number,
  c: CreationChoices,
): Session {
  let game = createInitialState(seed, {
    name: c.name,
    sex: c.sex,
    country: c.country,
    startAge: c.startAge,
    style: c.style,
    division: c.division,
  })
  const origin = criteria.origins.find((o) => o.id === c.originId)
  const entourage = criteria.entourages.find((e) => e.id === c.entourageId)
  if (origin) game = applyCriterion(game, origin)
  if (entourage) game = applyCriterion(game, entourage)

  const next = pickNext(game, events)
  return { game: next.game, events, current: next.current, opponent: next.opponent, lastResult: null, eventsThisYear: 0 }
}

/** Avance après qu'un Événement a été consommé : compte l'année, âge-out, suivant. */
function advanceAfterEvent(session: Session, game: GameState): Session {
  let eventsThisYear = session.eventsThisYear + 1
  if (eventsThisYear >= EVENTS_PER_YEAR) {
    game = reduce(game, { type: 'ADVANCE_YEAR' })
    eventsThisYear = 0
  }
  if (game.phase === 'retired') {
    return { ...session, game, current: null, opponent: null, lastResult: null, eventsThisYear }
  }
  const next = pickNext(game, session.events)
  return {
    ...session,
    game: next.game,
    current: next.current,
    opponent: next.opponent,
    lastResult: null,
    eventsThisYear,
  }
}

/**
 * Résout le choix courant. Événement narratif → applique les effets et avance.
 * Événement de combat → résout le combat (FR-10) et s'arrête sur l'écran
 * résultat ; l'avancée se fait ensuite via `continueAfterFight`.
 */
export function chooseInSession(session: Session, choiceIndex: number): Session {
  if (!session.current) return session
  const choice = session.current.choices[choiceIndex]
  if (!choice) return session

  if (session.current.fight && session.opponent) {
    const { game, result } = resolveFight(session.game, session.current, choice, session.opponent)
    return { ...session, game, lastResult: result }
  }

  const game = applyChoice(session.game, session.current, choice)
  return advanceAfterEvent(session, game)
}

/** Après l'écran résultat de combat : reprend le cours de la carrière. */
export function continueAfterFight(session: Session): Session {
  if (!session.lastResult) return session
  return advanceAfterEvent(session, session.game)
}
