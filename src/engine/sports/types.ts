// Définition d'un sport (couche générique multi-sports). Chaque sport fournit
// ses attributs, ses valeurs de départ et ses formules (OVR, score, trophées),
// ET sa résolution de « match vécu ». Le cœur (state/score/awards/session) est
// PARAMÉTRÉ par cette définition.
import type { GameState } from '../state'
import type { RngState } from '../rng'
import type { Opponent, FightResult } from '../combat'
import type { Channel, EventDef, Choice } from '../../schema'

/** Identifiant de sport (s'enrichit quand on ajoute un sport). */
export type SportId = 'mma' | 'basket'

/** Trophée de fin de carrière (générique). */
export interface Achievement {
  id: string
  icon: string
  label: string
  desc: string
}

/** Contrat qu'un sport doit remplir pour être jouable par le cœur commun. */
export interface SportDef {
  id: SportId
  label: string
  icon: string
  /** Nom du sportif (« combattant », « joueur »…). */
  athleteNoun: string
  /** Clés d'attributs sportifs (canaux d'effet propres au sport). */
  statKeys: string[]
  /** Libellés d'affichage des attributs. */
  statLabels: Record<string, string>
  /** Attributs de départ d'une nouvelle carrière. */
  initialStats: Record<string, number>
  /** Styles/profils jouables + libellés ; style par défaut. */
  styles: string[]
  styleLabels: Record<string, string>
  defaultStyle: string
  /** Postes/divisions (id + libellé) ; division par défaut. */
  positions: { id: string; label: string }[]
  defaultDivision: string
  /** Libellés des paliers de carrière (amateur → régional → majeur). */
  tierLabels: Record<'immaf' | 'regional' | 'major', string>
  /** Note générale (OVR 0-99), façon FIFA. */
  overall: (game: GameState) => number
  /** Score de carrière /100. */
  score: (game: GameState) => number
  /** Trophées débloqués par la carrière. */
  achievements: (game: GameState) => Achievement[]

  // --- Résolution du « match vécu » (propre au sport) ---
  /** Génère un adversaire calibré (propage l'état RNG). */
  generateOpponent: (state: GameState, rng: RngState) => [Opponent, RngState]
  /** Résout un match/combat vécu et renvoie l'état + le résultat à afficher. */
  resolveMatch: (
    state: GameState,
    event: EventDef,
    choice: Choice,
    opponent: Opponent,
  ) => { game: GameState; result: FightResult }
  /** Tactique par défaut pour les matchs SIMULÉS (hors caméra). */
  autoTactic: (state: GameState) => Channel
}
