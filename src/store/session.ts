// Orchestration de la boucle de carrière (PURE, testable sans navigateur).
// Enchaîne moteur + contenu ; le store Zustand n'est qu'un conteneur (AD-2).
import type { Criterion, EventDef, StartingCriteria } from '../schema'
import type { FighterSetup, GameState, Sex, Style } from '../engine'
import {
  createInitialState,
  selectEvent,
  applyChoice,
  applyEffect,
  reduce,
  EVENTS_PER_YEAR,
} from '../engine'

export interface Session {
  game: GameState
  events: EventDef[]
  current: EventDef | null
  eventsThisYear: number
}

/** Démarre une carrière : état initial + premier Événement sélectionné. */
export function startCareer(events: EventDef[], seed: number, setup?: FighterSetup): Session {
  const game0 = createInitialState(seed, setup)
  const { event, rng } = selectEvent(game0, events)
  return { game: { ...game0, rng }, events, current: event, eventsThisYear: 0 }
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

  const { event, rng } = selectEvent(game, events)
  return { game: { ...game, rng }, events, current: event, eventsThisYear: 0 }
}

/**
 * Résout le choix courant : applique ses effets, avance d'une année tous les
 * EVENTS_PER_YEAR Événements, termine à la retraite, sinon sélectionne le suivant.
 */
export function chooseInSession(session: Session, choiceIndex: number): Session {
  if (!session.current) return session
  const choice = session.current.choices[choiceIndex]
  if (!choice) return session

  let game = applyChoice(session.game, session.current, choice)
  let eventsThisYear = session.eventsThisYear + 1

  if (eventsThisYear >= EVENTS_PER_YEAR) {
    game = reduce(game, { type: 'ADVANCE_YEAR' })
    eventsThisYear = 0
  }

  if (game.phase === 'retired') {
    return { ...session, game, current: null, eventsThisYear }
  }

  const { event, rng } = selectEvent(game, session.events)
  return { ...session, game: { ...game, rng }, current: event, eventsThisYear }
}
