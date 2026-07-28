// Orchestration de la boucle de carrière (PURE, testable sans navigateur).
// Enchaîne moteur + contenu ; le store Zustand n'est qu'un conteneur (AD-2).
import type { Channel, Criterion, EventDef, StartingCriteria, OpponentPool, Organization, Icon } from '../schema'
import { CHANNELS, loadOpponentPool, loadOrganizations } from '../schema'
import type { FighterSetup, GameState, Opponent, FightResult, FightChange, Sex, Style, RngState } from '../engine'
import {
  createInitialState,
  DEFAULT_FIGHTER_NAME,
  selectEvent,
  applyChoice,
  applyEffect,
  readChannel,
  reduce,
  generateOpponent,
  resolveFight,
  isEligible,
  markEventConsumed,
  nextInt,
  fightsPerYear,
  PLAYED_FIGHTS_PER_YEAR,
  STORY_EVENTS_PER_YEAR,
} from '../engine'
import {
  createTournament,
  advanceTournament,
  roundNames,
  type Tournament,
} from './tournament'

// Contenu statique chargé une fois (validé au chargement, AD-4).
const OPPONENT_POOL: OpponentPool = loadOpponentPool()
const ORGANIZATIONS: Organization[] = loadOrganizations()

/** Applique la signature d'une organisation / le passage pro portés par un choix. */
function applyCareerMove(game: GameState, choice: { signOrg?: string; turnPro?: boolean }): GameState {
  if (choice.signOrg) {
    const org = ORGANIZATIONS.find((o) => o.id === choice.signOrg)
    if (org) {
      // Expatriation : l'orga est-elle basée dans un autre pays que le combattant ?
      const expatrie = org.country !== game.fighter.country
      const flags = { ...game.flags, expatrie }
      // Une orga PRO fait signer un contrat pro et cale le palier ; une orga
      // AMATEUR donne juste une maison (on reste amateur, palier inchangé).
      if (org.level === 'pro') {
        return { ...game, organization: org.id, tier: org.tier ?? 'regional', pro: true, flags }
      }
      return { ...game, organization: org.id, flags }
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
 * Planifie l'année : N combats garantis (amateur 4 / pro 3) + un créneau TOURNOI
 * si débloqué, ENTRELACÉS avec des Événements narratifs — un récit entre chaque
 * combat (jamais deux combats d'affilée). L'ordre des combats/tournoi est mélangé
 * (le tournoi peut tomber n'importe quand dans l'année).
 */
function planYear(game: GameState, events: EventDef[]): { plan: Slot[]; rng: RngState } {
  const actions: Slot[] = []
  for (let i = 0; i < PLAYED_FIGHTS_PER_YEAR; i++) actions.push('fight')
  if (events.some((e) => isTournament(e) && isEligible(game, e))) actions.push('tournament')
  const [shuffled, rng] = shuffle(actions, game.rng)

  // Autant (+1) de récits que d'actions ⇒ un récit sépare chaque combat.
  const stories = Math.max(STORY_EVENTS_PER_YEAR, actions.length + 1)
  const plan: Slot[] = []
  let ai = 0
  let si = 0
  while (ai < shuffled.length || si < stories) {
    if (si < stories) {
      plan.push('story')
      si++
    }
    if (ai < shuffled.length) {
      plan.push(shuffled[ai])
      ai++
    }
  }
  return { plan, rng }
}

/** Sous-catalogue à tirer pour un créneau ; repli sur tout si rien d'éligible. */
function poolForSlot(game: GameState, events: EventDef[], slot: Slot): EventDef[] {
  const keep = slot === 'fight' ? isRegularFight : slot === 'tournament' ? isTournament : isStory
  const subset = events.filter(keep)
  return subset.some((e) => isEligible(game, e)) ? subset : events
}

// --- Combats de saison simulés (FR-10) -------------------------------------
// Le joueur ne VIT qu'un combat par an ; les autres se déroulent hors caméra
// (simulés avec sa meilleure tactique) et alimentent le palmarès + le bilan.
/** Meilleur canal de frappe/lutte/sol du joueur (tactique par défaut). */
function bestTactic(game: GameState): Channel {
  const { striking, grappling, ground } = game.stats
  if (ground >= striking && ground >= grappling) return 'ground'
  if (grappling >= striking) return 'grappling'
  return 'striking'
}

/** Événement-combat synthétique des combats simulés (ni titre ni drapeau). */
const AUTO_FIGHT_EVENT: EventDef = {
  id: '__season_fight',
  weight: 1,
  repeatable: true,
  text: 'Combat de saison.',
  fight: { titleFight: false },
  choices: [{ label: 'auto', effects: [] }],
  conditions: [],
}

/** Simule N combats de saison (adversaires calibrés) et applique leurs suites. */
function simulateSeasonFights(game: GameState, n: number): { game: GameState; count: number } {
  let g = game
  let count = 0
  for (let i = 0; i < n; i++) {
    const [opp, rng] = generateOpponent(g, OPPONENT_POOL, g.rng)
    g = { ...g, rng }
    const choice = { label: 'auto', effects: [], tactic: bestTactic(g) }
    g = resolveFight(g, AUTO_FIGHT_EVENT, choice, opp).game
    count++
  }
  return { game: g, count }
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
const TITLE_FLAGS = ['titre_monde', 'titre_europe', 'titre_national', 'titre_regional_am'] as const

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
  /** Combats disputés hors caméra (simulés) cette année. */
  autoFights: number
  /** Drapeaux de titres décrochés cette année (clés, formatées côté UI). */
  newTitleFlags: string[]
  /** A décroché la ceinture professionnelle cette année. */
  wonBelt: boolean
}

function buildYearReview(
  before: YearSnapshot,
  after: GameState,
  year: number,
  age: number,
  autoFights: number,
): YearReview {
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
    autoFights,
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
  /** Tournoi en cours (tableau à élimination directe), sinon null. */
  tournament: Tournament | null
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
  tournament: Tournament | null
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
    tournament: s.tournament,
    yearPlan: s.yearPlan,
    year: s.year,
    yearSnapshot: s.yearSnapshot,
    eventsThisYear: s.eventsThisYear,
  }
}

/** Reconstruit l'Événement-combat synthétique du tour courant d'un tournoi. */
function currentRoundEvent(t: Tournament, events: EventDef[]): EventDef | null {
  const base = events.find((e) => e.id === t.eventId)
  if (!base) return null
  const names = roundNames(t.size)
  return roundEvent(base, names[t.round], t.round === t.roundsTotal - 1)
}

export function deserializeSession(saved: SavedSession, events: EventDef[]): Session {
  const tournament = saved.tournament ?? null
  // En plein tournoi, l'Événement courant est synthétique (absent du catalogue) :
  // on le reconstruit depuis l'état du tableau.
  const current =
    tournament && tournament.status === 'fighting'
      ? currentRoundEvent(tournament, events)
      : saved.currentId
        ? (events.find((e) => e.id === saved.currentId) ?? null)
        : null
  return {
    game: saved.game,
    events,
    current,
    opponent: saved.opponent ?? null,
    lastResult: saved.lastResult ?? null,
    lastReveal: saved.lastReveal ?? null,
    yearReview: saved.yearReview ?? null,
    tournament,
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

/** Construit l'Événement-combat synthétique d'un tour de tournoi (choix repris
 *  de l'Événement source ; drapeau de titre seulement en finale). */
function roundEvent(base: EventDef, roundName: string, isFinal: boolean): EventDef {
  return {
    ...base,
    id: `${base.id}__round`,
    repeatable: true,
    cooldown: undefined,
    overline: `${base.overline ?? 'TOURNOI'} · ${roundName.toUpperCase()}`,
    fight: { titleFight: false, winFlag: isFinal ? base.fight?.winFlag : undefined },
    conditions: [],
  }
}

/** Résultat d'ouverture d'un créneau : Événement courant + éventuel tournoi. */
interface Opening {
  game: GameState
  current: EventDef
  opponent: Opponent | null
  tournament: Tournament | null
}

/**
 * Ouvre le créneau : tire l'Événement, et s'il s'agit d'un TOURNOI, initialise
 * le tableau et renvoie le premier combat du joueur (Événement synthétique).
 */
function openSlot(game: GameState, events: EventDef[], slot: Slot): Opening {
  const picked = pickNext(game, events, slot)
  if (picked.current.fight?.winFlag && picked.current.fight?.bracket) {
    const setup = createTournament(picked.game, picked.current, OPPONENT_POOL)
    return {
      game: setup.game,
      current: roundEvent(picked.current, setup.roundName, setup.isFinal),
      opponent: setup.opponent,
      tournament: setup.tournament,
    }
  }
  return { game: picked.game, current: picked.current, opponent: picked.opponent, tournament: null }
}

/** Nom de combattant aléatoire (seedé) tiré de la banque de noms, par sexe (FR-1). */
function randomFighterName(sex: Sex, rng: RngState): [string, RngState] {
  const firsts = OPPONENT_POOL.firstNames[sex]
  const [fi, r1] = nextInt(rng, 0, firsts.length - 1)
  const [li, r2] = nextInt(r1, 0, OPPONENT_POOL.lastNames.length - 1)
  return [`${firsts[fi]} ${OPPONENT_POOL.lastNames[li]}`, r2]
}

/** Assemble une session neuve : planifie l'année puis tire le 1er Événement. */
function beginCareer(game: GameState, events: EventDef[]): Session {
  // Nom généré aléatoirement à chaque carrière si aucun nom explicite (FR-1).
  if (!game.fighter.name || game.fighter.name === DEFAULT_FIGHTER_NAME) {
    const [name, rng] = randomFighterName(game.fighter.sex, game.rng)
    game = { ...game, fighter: { ...game.fighter, name }, rng }
  }
  const { plan, rng } = planYear(game, events)
  const g: GameState = { ...game, rng }
  const opening = openSlot(g, events, plan[0])
  return {
    game: opening.game,
    events,
    current: opening.current,
    opponent: opening.opponent,
    lastResult: null,
    lastReveal: null,
    yearReview: null,
    tournament: opening.tournament,
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

/** Démarre une carrière « Revivre » : profil d'une icône du MMA (FR-2). */
export function startIconCareer(events: EventDef[], seed: number, icon: Icon): Session {
  let game = createInitialState(seed, {
    name: icon.name,
    sex: icon.sex,
    country: icon.country,
    division: icon.division,
    style: icon.style,
    startAge: icon.startAge,
  })
  for (const eff of icon.effects) game = applyEffect(game, eff)
  game = { ...game, flags: { ...game.flags, [`icon_${icon.id}`]: true } }
  return beginCareer(game, events)
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
    const opening = openSlot(game, session.events, session.yearPlan[eventsThisYear])
    return {
      ...session,
      game: opening.game,
      current: opening.current,
      opponent: opening.opponent,
      lastResult: null,
      lastReveal: null,
      yearReview: null,
      tournament: opening.tournament,
      eventsThisYear,
    }
  }

  // Année terminée : on dispute d'abord les combats de saison restants (hors
  // caméra), puis on dresse le bilan (avant vieillissement) et on avance d'âge.
  const autoN = Math.max(0, fightsPerYear(game.pro) - PLAYED_FIGHTS_PER_YEAR)
  const sim = simulateSeasonFights(game, autoN)
  const played = sim.game
  const review = buildYearReview(session.yearSnapshot, played, session.year, played.fighter.age + 1, sim.count)
  const aged = reduce(played, { type: 'ADVANCE_YEAR' })
  if (aged.phase === 'retired') {
    return {
      ...session,
      game: aged,
      current: null,
      opponent: null,
      lastResult: null,
      lastReveal: null,
      yearReview: null,
      tournament: null,
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
    tournament: null,
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

/** Après un combat de tournoi : fait avancer le tableau (tour suivant ou fin). */
function advanceTournamentInSession(session: Session): Session {
  const t = session.tournament as Tournament
  const step = advanceTournament(t, session.game, (session.lastResult as FightResult).win)
  if (step.done) {
    return {
      ...session,
      game: step.game,
      tournament: step.tournament,
      current: null,
      opponent: null,
      lastResult: null,
      lastReveal: null,
    }
  }
  const base = session.events.find((e) => e.id === t.eventId)
  return {
    ...session,
    game: step.game,
    tournament: step.tournament,
    current: base ? roundEvent(base, step.roundName, step.isFinal) : null,
    opponent: step.opponent,
    lastResult: null,
    lastReveal: null,
  }
}

/** Clôt un tournoi terminé (le drapeau de titre est déjà posé par le dernier
 *  combat) puis reprend le cours de l'année (créneau tournoi consommé). */
function finalizeTournament(session: Session): Session {
  const t = session.tournament as Tournament
  const base = session.events.find((e) => e.id === t.eventId)
  const game = base ? markEventConsumed(session.game, base) : session.game
  return advanceAfterEvent({ ...session, tournament: null }, game)
}

/**
 * Reprend le cours après un écran de pause :
 * - bilan annuel → ouvre le 1er créneau de la nouvelle année ;
 * - tournoi en cours → tour suivant, ou clôture si le tableau est terminé ;
 * - conséquences de combat/choix → avance dans l'année.
 */
/** Retraite volontaire (FR-14) : raccroche les gants → écran de fin de carrière. */
export function retireCareer(session: Session): Session {
  return {
    ...session,
    game: reduce(session.game, { type: 'RETIRE' }),
    current: null,
    opponent: null,
    lastResult: null,
    lastReveal: null,
    yearReview: null,
    tournament: null,
  }
}

export function continueSession(session: Session): Session {
  if (session.yearReview) {
    const opening = openSlot(session.game, session.events, session.yearPlan[0])
    return {
      ...session,
      game: opening.game,
      current: opening.current,
      opponent: opening.opponent,
      lastResult: null,
      lastReveal: null,
      yearReview: null,
      tournament: opening.tournament,
      eventsThisYear: 0,
    }
  }
  if (session.tournament) {
    if (session.tournament.status === 'fighting' && session.lastResult) {
      return advanceTournamentInSession(session)
    }
    if (session.tournament.status !== 'fighting') {
      return finalizeTournament(session)
    }
  }
  if (!session.lastResult && !session.lastReveal) return session
  return advanceAfterEvent(session, session.game)
}
