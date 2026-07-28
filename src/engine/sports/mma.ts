// Définition du sport MMA : attributs de combat, OVR, score de carrière et
// trophées. Ces formules ÉTAIENT dans score.ts / awards.ts ; elles vivent
// désormais ici, derrière le contrat SportDef (le cœur les appelle par sport).
import type { GameState } from '../state'
import type { Channel } from '../../schema'
import type { Achievement, SportDef } from './types'
import { START_AGE, RETIREMENT_AGE, clampStat, tierIndex } from '../config'
import { nationOf } from '../nation'
import { hasChronicInjury } from '../injuries'
import { generateOpponent as genOpponent, resolveFight } from '../combat'
import { loadOpponentPool } from '../../schema'

const OPPONENT_POOL = loadOpponentPool()

/** Meilleur canal offensif du joueur (tactique par défaut des matchs simulés). */
function bestTactic(game: GameState): Channel {
  const { striking, grappling, ground } = game.stats
  if (ground >= striking && ground >= grappling) return 'ground'
  if (grappling >= striking) return 'grappling'
  return 'striking'
}

const STAT_KEYS = ['striking', 'grappling', 'ground', 'cardio']
const STAT_LABELS: Record<string, string> = {
  striking: 'Frappe',
  grappling: 'Lutte',
  ground: 'Sol',
  cardio: 'Cardio',
}
const INITIAL_STATS: Record<string, number> = { striking: 40, grappling: 40, ground: 40, cardio: 50 }

/** Note générale du combattant (OVR 0-99), façon FIFA. */
function mmaOverall(game: GameState): number {
  const { stats, meta } = game
  const rating =
    stats.striking * 0.3 +
    stats.grappling * 0.28 +
    stats.ground * 0.22 +
    stats.cardio * 0.12 +
    meta.mental * 0.08
  return Math.round(clampStat(rating))
}

/** Score de carrière /100 : niveau, bilan, notoriété, prestige, longévité. */
function mmaScore(game: GameState): number {
  const { stats, meta, fighter, record } = game

  const combat = (stats.striking + stats.grappling + stats.ground + stats.cardio) / 4

  const fights = record.wins + record.losses
  const winRate = fights > 0 ? record.wins / fights : 0
  const volume = Math.min(1, fights / 20)
  const results = clampStat(winRate * 60 + volume * 25 + Math.min(15, record.finishes * 3))

  const reputation = meta.reputation
  const followers = Math.min(100, Math.log10(meta.followers + 1) * 25)

  const tierBonus = tierIndex(game.tier) * 8
  const beltBonus = (game.belt ? 20 : 0) + Math.min(15, game.titleDefenses * 5)
  const prestige = clampStat(tierBonus + beltBonus)

  const span = RETIREMENT_AGE - START_AGE
  const longevity = clampStat(((fighter.age - START_AGE) / span) * 100)

  const raw =
    combat * 0.24 +
    results * 0.24 +
    reputation * 0.2 +
    prestige * 0.14 +
    followers * 0.1 +
    longevity * 0.08
  return Math.round(clampStat(raw))
}

/** Trophées débloqués par la carrière MMA (ordre stable, du + prestigieux au -). */
function mmaAchievements(game: GameState): Achievement[] {
  const { record, meta, stats, fighter } = game
  const out: Achievement[] = []
  const add = (cond: boolean, a: Achievement) => {
    if (cond) out.push(a)
  }

  add(game.flags['titre_monde'] === true, { id: 'immaf-monde', icon: '🌍', label: 'Champion du Monde IMMAF', desc: 'A dominé le sommet de l’amateurisme mondial.' })
  add(game.flags['titre_europe'] === true, { id: 'immaf-europe', icon: '🇪🇺', label: "Champion d'Europe IMMAF", desc: 'Sacré sur le continent en amateur.' })
  add(game.flags['titre_national'] === true, { id: 'champ-national', icon: '🥇', label: `Champion ${nationOf(fighter.country)} (amateur)`, desc: 'Meilleur amateur du pays.' })
  // Les ceintures d'organisation (par promotion) sont ajoutées côté UI, où les
  // libellés d'orga sont disponibles (voir RecapScreen / belts.ts).
  add(game.flags['titre_gp'] === true, { id: 'grand-prix', icon: '🏆', label: 'Vainqueur du Grand Prix mondial', desc: 'A remporté le tournoi le plus dur du sport pro.' })
  add(game.titleDefenses >= 2, { id: 'roi', icon: '🛡️', label: 'Roi de la division', desc: `${game.titleDefenses} défenses de titre réussies.` })
  add(game.tier === 'major' && meta.reputation >= 80, { id: 'icone', icon: '🌍', label: 'Icône mondiale', desc: 'Une superstar reconnue sur toute la planète MMA.' })
  add(record.wins >= 5 && record.losses === 0, { id: 'invaincu', icon: '💯', label: 'Invaincu', desc: 'A raccroché sans la moindre défaite.' })
  add(record.wins >= 10, { id: 'guerrier', icon: '🥊', label: 'Guerrier', desc: `${record.wins} victoires au compteur.` })
  add(record.finishes >= 5, { id: 'finisseur', icon: '💥', label: 'Finisseur', desc: `${record.finishes} victoires avant la limite.` })
  add(meta.followers >= 50000, { id: 'star-reseaux', icon: '📱', label: 'Star des réseaux', desc: `${meta.followers.toLocaleString('fr-FR')} followers.` })
  add(meta.money >= 100000, { id: 'fortune', icon: '💰', label: 'Fortune faite', desc: 'Plus de 100 000 € amassés.' })
  add(stats.striking >= 85, { id: 'puncheur', icon: '👊', label: 'Puncheur d’élite', desc: 'Une frappe redoutée de tous.' })
  add(stats.ground >= 85, { id: 'maitre-sol', icon: '🥋', label: 'Maître du sol', desc: 'Un cauchemar au tapis.' })
  add(stats.grappling >= 85, { id: 'lutteur', icon: '🤼', label: 'Force de la lutte', desc: 'Personne ne reste debout face à lui.' })
  add(fighter.age >= RETIREMENT_AGE && record.wins + record.losses >= 15, { id: 'veteran', icon: '🎖️', label: 'Vétéran', desc: 'Une longue et dense carrière.' })
  add(hasChronicInjury(game), { id: 'corps-marque', icon: '🩹', label: 'Corps marqué', desc: 'A porté ses blessures jusqu’au bout, sans jamais renoncer.' })
  add(
    !!game.nemesis && game.nemesis.playerWins > game.nemesis.playerLosses,
    {
      id: 'nemesis',
      icon: '⚔️',
      label: 'Bête noire domptée',
      desc: game.nemesis
        ? `A dominé ${game.nemesis.name} (${game.nemesis.playerWins}-${game.nemesis.playerLosses}).`
        : '',
    },
  )

  return out
}

export const MMA: SportDef = {
  id: 'mma',
  label: 'MMA',
  icon: '🥊',
  athleteNoun: 'combattant',
  statKeys: STAT_KEYS,
  statLabels: STAT_LABELS,
  initialStats: INITIAL_STATS,
  styles: ['striker', 'wrestler', 'grappler', 'allrounder'],
  styleLabels: { striker: 'Puncheur', wrestler: 'Lutteur', grappler: 'Grappler', allrounder: 'Polyvalent' },
  defaultStyle: 'allrounder',
  positions: [],
  defaultDivision: 'lightweight',
  overall: mmaOverall,
  score: mmaScore,
  achievements: mmaAchievements,
  generateOpponent: (state, rng) => genOpponent(state, OPPONENT_POOL, rng),
  resolveMatch: (state, event, choice, opponent) => resolveFight(state, event, choice, opponent),
  autoTactic: bestTactic,
}
