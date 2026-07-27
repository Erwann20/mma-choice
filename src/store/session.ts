// Orchestration de la boucle de carrière (PURE, testable sans navigateur).
// Enchaîne moteur + contenu ; le store Zustand n'est qu'un conteneur (AD-2).
import type { Channel, Criterion, EventDef, StartingCriteria, OpponentPool, Organization } from '../schema'
import { CHANNELS, loadOpponentPool, loadOrganizations } from '../schema'
import type { FighterSetup, GameState, Opponent, FightResult, FightChange, Sex, Style, RngState } from '../engine'
import {
  createInitialState,
  selectEvent,
  applyChoice,
  applyEffect,
  readChannel,
  reduce,
  generateOpponent,
  resolveFight,
  isEligible,
  nextInt,
  fightsPerYear,
  STORY_EVENTS_PER_YEAR,
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

// --- Structure d'une année : créneaux planifiés (FR-8) ---------------------
/** Type de créneau dans le plan d'une année. */
export type Slot = 'fight' | 'tournament' | 'story'

const isTournament = (e: EventDef): boolean => !!e.fight?.winFlag
const isRegularFight = (e: EventDef): boolean => !!e.fight && !e.fight.winFlag
const isStory = (e: EventDef): boolean => !e.fight

/** Mélange déterministe (Fisher-Yates à graine) — propage l'état RNG. */
function shuffle<T>(items: T[], rng: RngState): [T[], RngState] {
  const out = items.slice()
  let r = rng
  for (let i = out.length - 1; i > 0; i--) {
    const [j, r2] = nextInt(r, 0, i)
    r = r2
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return [out, r]
}

/**
 * Planifie l'année : N combats garantis (amateur 4 / pro 3) + les Événements
 * narratifs, plus un créneau TOURNOI si un tournoi est débloqué. Ordre mélangé
 * pour que les combats ne tombent pas toujours en début d'année.
 */
function planYear(game: GameState, events: EventDef[]): { plan: Slot[]; rng: RngState } {
  const slots: Slot[] = []
  for (let i = 0; i < fightsPerYear(game.pro); i++) slots.push('fight')
  if (events.some((e) => isTournament(e) && isEligible(game, e))) slots.push('tournament')
  for (let i = 0; i < STORY_EVENTS_PER_YEAR; i++) slots.push('story')
  const [plan, rng] = shuffle(slots, game.rng)
  return { plan, rng }
}

/** Sous-catalogue à tirer pour un créneau ; repli sur tout si rien d'éligible. */
function poolForSlot(game: GameState, events: EventDef[], slot: Slot): EventDef[] {
  const keep = slot === 'fight' ? isRegularFight : slot === 'tournament' ? isTournament : isStory
  const subset = events.filter(keep)
  return subset.some((e) => isEligible(game, e)) ? subset : events
}

// --- Bilan de fin d'année (FR-8) -------------------------------------------
/** Instantané des compteurs au début d'une année, pour en dresortir le bilan. */
interface YearSnapshot {
  stats: GameState['stats']
  meta: GameState['meta']
  record: GameState['record']
  belt: boolean
  titleFlags: string[]
}

/** Drapeaux de titres suivis dans le bilan annuel (du + prestigieux au -). */
const TITLE_FLAGS = ['titre_monde', 'titre_europe', 'titre_france', 'titre_regional_am'] as const

function snapshot(game: GameState): YearSnapshot {
  return {
    stats: game.stats,
    meta: game.meta,
    record: game.record,
    belt: game.belt,
    titleFlags: TITLE_FLAGS.filter((f) => game.flags[f] === true),
  }
}

/** Bilan d'une année : progrès de stats, palmarès de l'année, titres décrochés. */
export interface YearReview {
  /** Numéro d'année de carrière (1 = première année). */
  year: number
  /** Âge atteint à la fin de l'année. */
  age: number
  /** Variations de canaux non nulles sur l'année (stats + réputation, etc.). */
  changes: FightChange[]
  wins: number
  losses: number
  finishes: number
  /** Drapeaux de titres décrochés cette année (clés, formatées côté UI). */
  newTitleFlags: string[]
  /** A décroché la ceinture professionnelle cette année. */
  wonBelt: boolean
}

function buildYearReview(before: YearSnapshot, after: GameState, year: number, age: number): YearReview {
  // État « début d'année » reconstitué pour diffusion des canaux (stats/méta).
  const pseudoBefore: GameState = { ...after, stats: before.stats, meta: before.meta }
  const changes = channelDeltas(pseudoBefore, after)
  const newTitleFlags = TITLE_FLAGS.filter(
    (f) => after.flags[f] === true && !before.titleFlags.includes(f),
  )
  return {
    year,
    age,
    changes,
    wins: after.record.wins - before.record.wins,
    losses: after.record.losses - before.record.losses,
    finishes: after.record.finishes - before.record.finishes,
    newTitleFlags,
    wonBelt: after.belt && !before.belt,
  }
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
  /** Bilan de fin d'année à afficher (écran récap annuel), sinon null. */
  yearReview: YearReview | null
  /** Plan de l'année en cours : suite ordonnée de créneaux (combat/tournoi/récit). */
  yearPlan: Slot[]
  /** Numéro de l'année de carrière en cours (1-based). */
  year: number
  /** Instantané des compteurs au début de l'année (pour le bilan). */
  yearSnapshot: YearSnapshot
  eventsThisYear: number
}

/** Forme persistée (AD-7) : le contenu est référencé par id, jamais embarqué. */
export interface SavedSession {
  game: GameState
  currentId: string | null
  opponent: Opponent | null
  lastResult: FightResult | null
  lastReveal: ChoiceReveal | null
  yearReview: YearReview | null
  yearPlan: Slot[]
  year: number
  yearSnapshot: YearSnapshot
  eventsThisYear: number
}

export function serializeSession(s: Session): SavedSession {
  return {
    game: s.game,
    currentId: s.current?.id ?? null,
    opponent: s.opponent,
    lastResult: s.lastResult,
    lastReveal: s.lastReveal,
    yearReview: s.yearReview,
    yearPlan: s.yearPlan,
    year: s.year,
    yearSnapshot: s.yearSnapshot,
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
    yearReview: saved.yearReview ?? null,
    yearPlan: saved.yearPlan ?? [],
    year: saved.year ?? 1,
    yearSnapshot: saved.yearSnapshot ?? snapshot(saved.game),
    eventsThisYear: saved.eventsThisYear,
  }
}

/**
 * Sélectionne l'Événement du créneau demandé et, si c'est un combat, génère
 * l'adversaire (FR-16). Renvoie l'état RNG déjà propagé.
 */
function pickNext(game: GameState, events: EventDef[], slot: Slot): {
  game: GameState
  current: EventDef
  opponent: Opponent | null
} {
  const { event, rng } = selectEvent(game, poolForSlot(game, events, slot))
  let g: GameState = { ...game, rng }
  let opponent: Opponent | null = null
  if (event.fight) {
    const [opp, rng2] = generateOpponent(g, OPPONENT_POOL, g.rng)
    opponent = opp
    g = { ...g, rng: rng2 }
  }
  return { game: g, current: event, opponent }
}

/** Assemble une session neuve : planifie l'année puis tire le 1er Événement. */
function beginCareer(game: GameState, events: EventDef[]): Session {
  const { plan, rng } = planYear(game, events)
  const g: GameState = { ...game, rng }
  const next = pickNext(g, events, plan[0])
  return {
    game: next.game,
    events,
    current: next.current,
    opponent: next.opponent,
    lastResult: null,
    lastReveal: null,
    yearReview: null,
    yearPlan: plan,
    year: 1,
    yearSnapshot: snapshot(g),
    eventsThisYear: 0,
  }
}

/** Démarre une carrière : état initial + première année planifiée. */
export function startCareer(events: EventDef[], seed: number, setup?: FighterSetup): Session {
  return beginCareer(createInitialState(seed, setup), events)
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
  return beginCareer(game, events)
}

/**
 * Avance après qu'un Événement a été consommé. Tant que l'année n'est pas
 * complète (tous les créneaux du plan joués), on enchaîne sur le créneau
 * suivant. À la fin de l'année : bilan annuel (écran récap), avancée d'âge,
 * puis nouvelle année planifiée.
 */
function advanceAfterEvent(session: Session, game: GameState): Session {
  const eventsThisYear = session.eventsThisYear + 1

  if (eventsThisYear < session.yearPlan.length) {
    const next = pickNext(game, session.events, session.yearPlan[eventsThisYear])
    return {
      ...session,
      game: next.game,
      current: next.current,
      opponent: next.opponent,
      lastResult: null,
      lastReveal: null,
      yearReview: null,
      eventsThisYear,
    }
  }

  // Année terminée : bilan (avant vieillissement) puis avancée d'âge.
  const review = buildYearReview(session.yearSnapshot, game, session.year, game.fighter.age + 1)
  const aged = reduce(game, { type: 'ADVANCE_YEAR' })
  if (aged.phase === 'retired') {
    return {
      ...session,
      game: aged,
      current: null,
      opponent: null,
      lastResult: null,
      lastReveal: null,
      yearReview: null,
      eventsThisYear: 0,
    }
  }
  const { plan, rng } = planYear(aged, session.events)
  const g: GameState = { ...aged, rng }
  return {
    ...session,
    game: g,
    current: null,
    opponent: null,
    lastResult: null,
    lastReveal: null,
    yearReview: review,
    yearPlan: plan,
    year: session.year + 1,
    yearSnapshot: snapshot(g),
    eventsThisYear: 0,
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

/**
 * Reprend le cours après un écran de pause : conséquences de combat/choix
 * (on avance) OU bilan annuel (on démarre le 1er Événement de la nouvelle année).
 */
export function continueSession(session: Session): Session {
  if (session.yearReview) {
    const next = pickNext(session.game, session.events, session.yearPlan[0])
    return {
      ...session,
      game: next.game,
      current: next.current,
      opponent: next.opponent,
      lastResult: null,
      lastReveal: null,
      yearReview: null,
      eventsThisYear: 0,
    }
  }
  if (!session.lastResult && !session.lastReveal) return session
  return advanceAfterEvent(session, session.game)
}
