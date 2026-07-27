// Orchestration de la boucle de carrière (PURE, testable sans navigateur).
// Enchaîne moteur + contenu ; le store Zustand n'est qu'un conteneur (AD-2).
import type { EventDef } from '../schema'
import type { FighterSetup, GameState } from '../engine'
import {
  createInitialState,
  selectEvent,
  applyChoice,
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
