// Définition du sport BASKET : attributs, OVR, score, trophées, et résolution
// du « grand match vécu » (analogue au combat MMA, mais en points). PUR.
import type { GameState, Style } from '../state'
import type { RngState } from '../rng'
import type { Channel, EventDef, Choice } from '../../schema'
import type { Opponent, FightResult, FightChange } from '../combat'
import type { Achievement, SportDef } from './types'
import {
  START_AGE,
  RETIREMENT_AGE,
  clampStat,
  tierIndex,
  TIER_DIFFICULTY,
  OPPONENT_REP_FACTOR,
  OPPONENT_VARIANCE,
  OPPONENT_LEVEL_GAP,
  PURSE_BY_TIER,
} from '../config'
import { nextInt } from '../rng'
import { readChannel } from '../channels'
import { applyEffect } from '../effects'
import { markEventConsumed } from '../events'
import { loadOpponentPool } from '../../schema'

const STAT_KEYS = ['tir', 'dribble', 'passe', 'defense', 'athletisme']
const STAT_LABELS: Record<string, string> = {
  tir: 'Tir',
  dribble: 'Dribble',
  passe: 'Passe',
  defense: 'Défense',
  athletisme: 'Athlétisme',
}
const INITIAL_STATS: Record<string, number> = { tir: 42, dribble: 42, passe: 40, defense: 40, athletisme: 48 }

// Pondération OVR par poste : chaque poste valorise des attributs différents.
const POSITION_WEIGHTS: Record<string, Record<string, number>> = {
  meneur: { tir: 0.22, dribble: 0.28, passe: 0.28, defense: 0.12, athletisme: 0.1 },
  arriere: { tir: 0.34, dribble: 0.24, passe: 0.14, defense: 0.14, athletisme: 0.14 },
  ailier: { tir: 0.26, dribble: 0.2, passe: 0.16, defense: 0.18, athletisme: 0.2 },
  'ailier-fort': { tir: 0.2, dribble: 0.12, passe: 0.14, defense: 0.26, athletisme: 0.28 },
  pivot: { tir: 0.14, dribble: 0.08, passe: 0.12, defense: 0.34, athletisme: 0.32 },
}
const DEFAULT_WEIGHTS = { tir: 0.24, dribble: 0.2, passe: 0.2, defense: 0.18, athletisme: 0.18 }

function weightsFor(game: GameState): Record<string, number> {
  return POSITION_WEIGHTS[game.division] ?? DEFAULT_WEIGHTS
}

/** OVR basketteur (0-99), pondéré selon le poste + un peu de sang-froid. */
function basketOverall(game: GameState): number {
  const w = weightsFor(game)
  const { stats, meta } = game
  const base =
    (stats.tir ?? 0) * w.tir +
    (stats.dribble ?? 0) * w.dribble +
    (stats.passe ?? 0) * w.passe +
    (stats.defense ?? 0) * w.defense +
    (stats.athletisme ?? 0) * w.athletisme
  return Math.round(clampStat(base * 0.92 + meta.mental * 0.08))
}

/** Score de carrière /100 : niveau, bilan, notoriété, prestige, longévité. */
function basketScore(game: GameState): number {
  const { meta, fighter, record } = game
  const skill = basketOverall(game)

  const games = record.wins + record.losses
  const winRate = games > 0 ? record.wins / games : 0
  const volume = Math.min(1, games / 40)
  const results = clampStat(winRate * 60 + volume * 25 + Math.min(15, record.finishes * 2))

  const reputation = meta.reputation
  const followers = Math.min(100, Math.log10(meta.followers + 1) * 25)

  const tierBonus = tierIndex(game.tier) * 8
  const ringBonus = (game.belt ? 20 : 0) + Math.min(15, game.titleDefenses * 5)
  const prestige = clampStat(tierBonus + ringBonus)

  const span = RETIREMENT_AGE - START_AGE
  const longevity = clampStat(((fighter.age - START_AGE) / span) * 100)

  const raw =
    skill * 0.24 +
    results * 0.24 +
    reputation * 0.2 +
    prestige * 0.14 +
    followers * 0.1 +
    longevity * 0.08
  return Math.round(clampStat(raw))
}

/** Trophées de carrière basket (ordre stable, du + prestigieux au -). */
function basketAchievements(game: GameState): Achievement[] {
  const { record, meta, stats } = game
  const out: Achievement[] = []
  const add = (cond: boolean, a: Achievement) => {
    if (cond) out.push(a)
  }
  add(game.belt, { id: 'bague', icon: '💍', label: 'Champion (bague)', desc: 'A soulevé le trophée le plus convoité.' })
  add(game.titleDefenses >= 2, { id: 'dynastie', icon: '🏆', label: 'Dynastie', desc: `${game.titleDefenses} titres en plus.` })
  add(game.tier === 'major' && meta.reputation >= 80, { id: 'franchise', icon: '⭐', label: 'Franchise player', desc: 'Le visage de la ligue.' })
  add(record.wins >= 30, { id: 'gagnant', icon: '🔥', label: 'Machine à gagner', desc: `${record.wins} victoires.` })
  add(record.finishes >= 5, { id: 'clutch', icon: '🎯', label: 'Joueur clutch', desc: `${record.finishes} matchs décisifs remportés.` })
  add(meta.followers >= 50000, { id: 'star-reseaux', icon: '📱', label: 'Star des réseaux', desc: `${meta.followers.toLocaleString('fr-FR')} followers.` })
  add(meta.money >= 100000, { id: 'fortune', icon: '💰', label: 'Contrat max', desc: 'Plus de 100 000 € amassés.' })
  add((stats.tir ?? 0) >= 85, { id: 'sniper', icon: '🎯', label: 'Sniper', desc: 'Une main de velours à trois points.' })
  add((stats.passe ?? 0) >= 85, { id: 'maestro', icon: '🎩', label: 'Maestro', desc: 'La vision du jeu incarnée.' })
  add((stats.defense ?? 0) >= 85, { id: 'verrou', icon: '🔒', label: 'Verrou défensif', desc: 'Le cauchemar des attaquants.' })
  add(game.fighter.age >= RETIREMENT_AGE && record.wins + record.losses >= 30, { id: 'veteran', icon: '🎖️', label: 'Vétéran', desc: 'Une longue et dense carrière.' })
  return out
}

// --- Adversaire (équipe/star adverse) --------------------------------------
const POOL = loadOpponentPool()

function overallOf(game: GameState): number {
  const w = weightsFor(game)
  const { stats } = game
  return (
    (stats.tir ?? 0) * w.tir +
    (stats.dribble ?? 0) * w.dribble +
    (stats.passe ?? 0) * w.passe +
    (stats.defense ?? 0) * w.defense +
    (stats.athletisme ?? 0) * w.athletisme
  )
}

/** Génère une équipe adverse calibrée sur le niveau du joueur (écart borné). */
function generateOpponent(state: GameState, rng: RngState): [Opponent, RngState] {
  const firsts = POOL.firstNames[state.fighter.sex]
  const [fIdx, r1] = nextInt(rng, 0, firsts.length - 1)
  const [lIdx, r2] = nextInt(r1, 0, POOL.lastNames.length - 1)
  const name = `${firsts[fIdx]} ${POOL.lastNames[lIdx]}`

  const overall = overallOf(state)
  const repBump = Math.min(state.meta.reputation, 100) * OPPONENT_REP_FACTOR
  const target = overall + TIER_DIFFICULTY[state.tier] + repBump
  const [variance, r3] = nextInt(r2, -OPPONENT_VARIANCE, OPPONENT_VARIANCE)
  const bounded = Math.max(overall - OPPONENT_LEVEL_GAP, Math.min(Math.round(target + variance), overall + OPPONENT_LEVEL_GAP))
  const level = clampStat(bounded)

  const [wins, r4] = nextInt(r3, Math.floor(level / 3), Math.floor(level / 2) + 10)
  const [losses, r5] = nextInt(r4, 5, Math.max(6, Math.floor((100 - level) / 2)))

  const opponent: Opponent = {
    name,
    archetypeId: 'basket',
    label: 'Équipe adverse',
    style: 'polyvalent',
    level,
    record: `${wins}-${losses}`,
    weakTo: 'defense',
  }
  return [opponent, r5]
}

/** Meilleur canal offensif (tactique par défaut des matchs simulés). */
function autoTactic(game: GameState): Channel {
  const { tir = 0, dribble = 0, passe = 0 } = game.stats
  if (tir >= dribble && tir >= passe) return 'tir'
  if (dribble >= passe) return 'dribble'
  return 'passe'
}

function styleMatchesTactic(style: Style, tactic: Channel): boolean {
  if (style === 'scoreur') return tactic === 'tir'
  if (style === 'meneur') return tactic === 'passe' || tactic === 'dribble'
  if (style === 'defenseur') return tactic === 'defense'
  return false
}

// --- Résolution du match vécu (en points) ----------------------------------
type FightOutcome = FightResult['outcome']
const REWARD: Record<FightOutcome, { rep: number; followersMul: number; healthCost: number }> = {
  clean: { rep: 10, followersMul: 1.0, healthCost: 4 },
  poor: { rep: 3, followersMul: 0.4, healthCost: 3 },
  upset: { rep: 18, followersMul: 1.6, healthCost: 6 },
  loss: { rep: -5, followersMul: 0.1, healthCost: 8 },
}

function resolveMatch(
  state: GameState,
  event: EventDef,
  choice: Choice,
  opponent: Opponent,
): { game: GameState; result: FightResult } {
  const tactic: Channel = choice.tactic ?? 'tir'
  const tacticStat = readChannel(state, tactic)
  const overall = overallOf(state)

  let perf = tacticStat * 0.6 + (state.stats.athletisme ?? 0) * 0.2 + state.meta.mental * 0.2
  if (tactic === opponent.weakTo) perf += 12
  if (styleMatchesTactic(state.style, tactic)) perf += 6

  const [noise, rng1] = nextInt(state.rng, -10, 10)
  const margin = perf - opponent.level + noise
  const win = margin >= 0
  const wasUnderdog = opponent.level - overall >= 8
  const outcome: FightOutcome = win ? (wasUnderdog ? 'upset' : margin >= 20 ? 'clean' : 'poor') : 'loss'
  const bigPerf = win && (outcome === 'clean' || outcome === 'upset')

  // Ligne de score « flavor » : points marqués + score final crédible.
  const [ptsBase, rng2] = nextInt(rng1, 8, 22)
  const pts = Math.round(ptsBase + tacticStat / 6 + (bigPerf ? 8 : 0))
  const [swing, rng3] = nextInt(rng2, 2, 12)
  const teamMe = 92 + (win ? swing + (bigPerf ? 6 : 0) : 0)
  const teamOpp = 92 + (win ? 0 : swing)
  const detail = `${pts} pts · ${teamMe}-${teamOpp}`

  const reward = REWARD[outcome]
  const followers = Math.round(((tierIndex(state.tier) + 1) * 30 + opponent.level) * reward.followersMul)
  const purse = win ? PURSE_BY_TIER[state.tier] : Math.round(PURSE_BY_TIER[state.tier] * 0.5)

  const changes: FightChange[] = []
  const push = (target: Channel, value: number) => {
    if (value !== 0) changes.push({ target, value })
  }
  push('reputation', reward.rep)
  push('followers', followers)
  push('money', purse)
  push('health', -reward.healthCost)
  const titleFight = event.fight?.titleFight ?? false
  if (titleFight && win) {
    push('reputation', 12)
    push('followers', Math.round(followers * 0.5))
  }

  let g: GameState = { ...state, rng: rng3 }
  for (const c of changes) g = applyEffect(g, { target: c.target, op: 'add', value: c.value })

  g = {
    ...g,
    record: {
      wins: g.record.wins + (win ? 1 : 0),
      losses: g.record.losses + (win ? 0 : 1),
      finishes: g.record.finishes + (bigPerf ? 1 : 0),
    },
  }

  // Forme récente (gate des matchs de titre), comme au MMA.
  const prevStreak = typeof g.flags['defaites_daffilee'] === 'number' ? g.flags['defaites_daffilee'] : 0
  const lossStreak = win ? 0 : prevStreak + 1
  g = { ...g, flags: { ...g.flags, defaites_daffilee: lossStreak, serie_negative: lossStreak >= 2 } }

  // Enjeu de la bague (titre) : conquête / défense / perte.
  let wonBelt = false
  let lostBelt = false
  if (titleFight) {
    if (win && !state.belt) {
      g = { ...g, belt: true }
      wonBelt = true
    } else if (win && state.belt) {
      g = { ...g, titleDefenses: g.titleDefenses + 1 }
    } else if (!win && state.belt) {
      g = { ...g, belt: false }
      lostBelt = true
    }
  }

  g = markEventConsumed(g, event)

  const result: FightResult = {
    opponentName: opponent.name,
    opponentLabel: opponent.label,
    opponentRecord: opponent.record,
    outcome,
    win,
    method: 'décision',
    titleFight,
    wonBelt,
    lostBelt,
    changes,
    nemesis: event.fight?.nemesis ?? false,
    detail,
  }
  return { game: g, result }
}

export const BASKET: SportDef = {
  id: 'basket',
  label: 'Basket',
  icon: '🏀',
  athleteNoun: 'joueur',
  statKeys: STAT_KEYS,
  statLabels: STAT_LABELS,
  initialStats: INITIAL_STATS,
  styles: ['scoreur', 'meneur', 'defenseur', 'polyvalent', 'athlete'],
  styleLabels: {
    scoreur: 'Scoreur',
    meneur: 'Meneur de jeu',
    defenseur: 'Défenseur',
    polyvalent: 'Polyvalent',
    athlete: 'Athlète',
  },
  defaultStyle: 'polyvalent',
  positions: [
    { id: 'meneur', label: 'Meneur' },
    { id: 'arriere', label: 'Arrière' },
    { id: 'ailier', label: 'Ailier' },
    { id: 'ailier-fort', label: 'Ailier fort' },
    { id: 'pivot', label: 'Pivot' },
  ],
  defaultDivision: 'ailier',
  overall: basketOverall,
  score: basketScore,
  achievements: basketAchievements,
  generateOpponent,
  resolveMatch,
  autoTactic,
}
