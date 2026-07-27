// Orchestration de la boucle de carrière (PURE, testable sans navigateur).
// Enchaîne moteur + contenu ; le store Zustand n'est qu'un conteneur (AD-2).
import type { Channel, Criterion, EventDef, StartingCriteria, OpponentPool, Organization } from '../schema'
import { CHANNELS, loadOpponentPool, loadOrganizations } from '../schema'
import type { FighterSetup, GameState, Opponent, FightResult, FightChange, Sex, Style } from '../engine'
import {
  createInitialState,
  selectEvent,
  applyChoice,
  applyEffect,
  readChannel,
  reduce,
  generateOpponent,
  resolveFight,
  EVENTS_PER_YEAR,
} from '../engine'

// Contenu statique chargé une fois (validé au chargement, AD-4).
const OPPONENT_POOL: OpponentPool = loadOpponentPool()
const ORGANIZATIONS: Organization[] = loadOrganizations()

/** Applique la signature d'une organisation / le passage pro portés par un choix. */
function applyCareerMove(game: GameState, choice: { signOrg?: string; turnPro?: boolean }): GameState {
  if (choice.signOrg) {
    const org = ORGANIZATIONS.find((o) => o.id === choice.signOrg)
    if (org) {
      // Une orga PRO fait signer un contrat pro et cale le palier ; une orga
      // AMATEUR donne juste une maison (on reste amateur, palier inchangé).
      if (org.level === 'pro') {
        return { ...game, organization: org.id, tier: org.tier ?? 'regional', pro: true }
      }
      return { ...game, organization: org.id }
    }
  }
  if (choice.turnPro && !game.pro) {
    return { ...game, pro: true }
  }
  return game
}

/** Variations de canaux entre deux états — révélées APRÈS le choix (découverte). */
function channelDeltas(before: GameState, after: GameState): FightChange[] {
  const out: FightChange[] = []
  for (const ch of CHANNELS as readonly Channel[]) {
    const delta = readChannel(after, ch) - readChannel(before, ch)
    if (delta !== 0) out.push({ target: ch, value: delta })
  }
  return out
}

/** Conséquences d'un choix narratif à révéler avant de reprendre (Destiny-like). */
export interface ChoiceReveal {
  changes: FightChange[]
}

export interface Session {
  game: GameState
  events: EventDef[]
  current: EventDef | null
  /** Adversaire généré quand `current` est un combat (FR-16), sinon null. */
  opponent: Opponent | null
  /** Résultat du dernier combat à afficher (écran résultat), sinon null. */
  lastResult: FightResult | null
  /** Conséquences d'un choix narratif à révéler (écran découverte), sinon null. */
  lastReveal: ChoiceReveal | null
  eventsThisYear: number
}

/** Forme persistée (AD-7) : le contenu est référencé par id, jamais embarqué. */
export interface SavedSession {
  game: GameState
  currentId: string | null
  opponent: Opponent | null
  lastResult: FightResult | null
  lastReveal: ChoiceReveal | null
  eventsThisYear: number
}

export function serializeSession(s: Session): SavedSession {
  return {
    game: s.game,
    currentId: s.current?.id ?? null,
    opponent: s.opponent,
    lastResult: s.lastResult,
    lastReveal: s.lastReveal,
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
    lastReveal: saved.lastReveal ?? null,
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
  return { game: next.game, events, current: next.current, opponent: next.opponent, lastResult: null, lastReveal: null, eventsThisYear: 0 }
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
  return { game: next.game, events, current: next.current, opponent: next.opponent, lastResult: null, lastReveal: null, eventsThisYear: 0 }
}

/** Avance après qu'un Événement a été consommé : compte l'année, âge-out, suivant. */
function advanceAfterEvent(session: Session, game: GameState): Session {
  let eventsThisYear = session.eventsThisYear + 1
  if (eventsThisYear >= EVENTS_PER_YEAR) {
    game = reduce(game, { type: 'ADVANCE_YEAR' })
    eventsThisYear = 0
  }
  if (game.phase === 'retired') {
    return { ...session, game, current: null, opponent: null, lastResult: null, lastReveal: null, eventsThisYear }
  }
  const next = pickNext(game, session.events)
  return {
    ...session,
    game: next.game,
    current: next.current,
    opponent: next.opponent,
    lastResult: null,
    lastReveal: null,
    eventsThisYear,
  }
}

/**
 * Résout le choix courant. Aucun n'avance immédiatement : on s'arrête toujours
 * sur un écran de conséquences (deltas révélés APRÈS coup, Destiny-like), repris
 * ensuite via `continueSession`.
 * - Combat → résout (FR-10) et pose `lastResult`.
 * - Narratif → applique effets/critères et pose `lastReveal` (deltas de canaux).
 *   Si le choix ne change aucun canal, on avance directement (rien à révéler).
 */
export function chooseInSession(session: Session, choiceIndex: number): Session {
  if (!session.current) return session
  const choice = session.current.choices[choiceIndex]
  if (!choice) return session

  if (session.current.fight && session.opponent) {
    const { game, result } = resolveFight(session.game, session.current, choice, session.opponent)
    return { ...session, game, lastResult: result, lastReveal: null }
  }

  let game = applyChoice(session.game, session.current, choice)
  game = applyCareerMove(game, choice)
  const changes = channelDeltas(session.game, game)
  if (changes.length === 0) return advanceAfterEvent(session, game)
  return { ...session, game, lastResult: null, lastReveal: { changes } }
}

/** Après l'écran de conséquences (combat ou choix narratif) : reprend le cours. */
export function continueSession(session: Session): Session {
  if (!session.lastResult && !session.lastReveal) return session
  return advanceAfterEvent(session, session.game)
}
