// Tournoi à élimination directe (FR-10) : le joueur vit chaque combat un par un,
// les autres matchs sont simulés (à graine), et un tableau (bracket) se remplit
// au fil des tours. PUR/déterministe : tout l'aléa passe par le RNG à graine.
import type { EventDef, OpponentPool } from '../schema'
import type { GameState, Opponent, RngState } from '../engine'
import { generateOpponent, nextInt } from '../engine'

/** Un participant du tableau (le joueur, ou un adversaire généré). */
export interface BracketSlot {
  id: string
  name: string
  isPlayer: boolean
  /** Données de combat de l'adversaire (null pour le joueur). */
  opponent: Opponent | null
}

/** Un match du tableau, à afficher (vainqueur par id, null tant qu'indécis). */
export interface BracketMatch {
  aId: string
  bId: string
  aName: string
  bName: string
  winnerId: string | null
  /** Le joueur combat-il dans ce match ? */
  isPlayer: boolean
}

export interface Tournament {
  eventId: string
  overline: string
  /** Drapeau de titre posé si le joueur gagne la finale (null sinon). */
  winFlag: string | null
  size: number
  roundsTotal: number
  round: number
  playerId: string
  /** Participants encore en lice entrant dans le tour courant (ordre du tableau). */
  slots: BracketSlot[]
  /** Tableau complet par tour (matchs joués + tour courant), pour l'affichage. */
  bracket: BracketMatch[][]
  status: 'fighting' | 'won' | 'eliminated'
}

const PLAYER_ID = 'p'

/** Noms des tours selon la taille du tableau. */
export function roundNames(size: number): string[] {
  return size >= 8 ? ['Quart de finale', 'Demi-finale', 'Finale'] : ['Demi-finale', 'Finale']
}

/** Résultat d'une préparation de tour : adversaire du joueur + méta d'affichage. */
export interface RoundSetup {
  tournament: Tournament
  game: GameState
  opponent: Opponent
  roundName: string
  isFinal: boolean
}

/** Simule un match IA vs IA (niveaux + bruit à graine) ; true = A gagne. */
function simMatch(a: Opponent, b: Opponent, rng: RngState): [boolean, RngState] {
  const [noise, r] = nextInt(rng, -15, 15)
  return [a.level + noise >= b.level, r]
}

/**
 * Prépare le tour courant : apparie les slots (0,1)(2,3)…, simule les matchs
 * SANS le joueur, laisse le match du joueur en attente et renvoie son adversaire.
 */
function startRound(t: Tournament, game: GameState): RoundSetup {
  const names = roundNames(t.size)
  const roundName = names[t.round]
  const isFinal = t.round === t.roundsTotal - 1

  let rng = game.rng
  const matches: BracketMatch[] = []
  let playerOpp: Opponent | null = null
  for (let i = 0; i < t.slots.length; i += 2) {
    const A = t.slots[i]
    const B = t.slots[i + 1]
    const base = { aId: A.id, bId: B.id, aName: A.name, bName: B.name }
    if (A.isPlayer || B.isPlayer) {
      playerOpp = (A.isPlayer ? B.opponent : A.opponent) as Opponent
      matches.push({ ...base, winnerId: null, isPlayer: true })
    } else {
      const [aWins, r2] = simMatch(A.opponent as Opponent, B.opponent as Opponent, rng)
      rng = r2
      matches.push({ ...base, winnerId: aWins ? A.id : B.id, isPlayer: false })
    }
  }

  return {
    tournament: { ...t, bracket: [...t.bracket, matches] },
    game: { ...game, rng },
    opponent: playerOpp as Opponent,
    roundName,
    isFinal,
  }
}

/**
 * Ouvre un tournoi : génère les participants (joueur en tête), puis prépare le
 * premier tour. Renvoie l'adversaire du joueur pour son premier match.
 */
export function createTournament(game: GameState, event: EventDef, pool: OpponentPool): RoundSetup {
  const size = event.fight?.bracket ?? 4
  let rng = game.rng
  const slots: BracketSlot[] = [
    { id: PLAYER_ID, name: game.fighter.name, isPlayer: true, opponent: null },
  ]
  for (let i = 0; i < size - 1; i++) {
    const [opp, r2] = generateOpponent({ ...game, rng }, pool, rng)
    rng = r2
    slots.push({ id: `s${i}`, name: opp.name, isPlayer: false, opponent: opp })
  }
  const t: Tournament = {
    eventId: event.id,
    overline: event.overline ?? 'TOURNOI',
    winFlag: event.fight?.winFlag ?? null,
    size,
    roundsTotal: roundNames(size).length,
    round: 0,
    playerId: PLAYER_ID,
    slots,
    bracket: [],
    status: 'fighting',
  }
  return startRound(t, { ...game, rng })
}

/** Le tournoi est terminé (joueur sacré ou éliminé). */
export interface TournamentEnd {
  done: true
  tournament: Tournament
  game: GameState
}
/** Le joueur enchaîne sur le tour suivant. */
export type TournamentStep = ({ done: false } & RoundSetup) | TournamentEnd

/**
 * Enregistre le résultat du match du joueur puis fait avancer le tournoi :
 * défaite ⇒ éliminé ; victoire en finale ⇒ sacré ; sinon prépare le tour suivant
 * (vainqueurs de ce tour appariés, matchs IA simulés).
 */
export function advanceTournament(t: Tournament, game: GameState, playerWon: boolean): TournamentStep {
  const bracket = t.bracket.slice()
  bracket[t.round] = bracket[t.round].map((m) => {
    if (!m.isPlayer) return m
    const opponentId = m.aId === t.playerId ? m.bId : m.aId
    return { ...m, winnerId: playerWon ? t.playerId : opponentId }
  })

  if (!playerWon) {
    return { done: true, tournament: { ...t, bracket, status: 'eliminated' }, game }
  }
  if (t.round >= t.roundsTotal - 1) {
    return { done: true, tournament: { ...t, bracket, status: 'won' }, game }
  }

  // Vainqueurs de ce tour (dans l'ordre du tableau) → participants du tour suivant.
  const winners: BracketSlot[] = bracket[t.round].map((m) => {
    const slot = t.slots.find((s) => s.id === m.winnerId)
    return slot as BracketSlot
  })
  const next: Tournament = { ...t, bracket, slots: winners, round: t.round + 1 }
  return { done: false, ...startRound(next, game) }
}
