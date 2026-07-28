// Mission du jour (FR-14) : objectif thématique tiré de la graine du jour, avec
// bonus de score si réussi. PUR — dérivé de l'état final, jamais persisté (on le
// recalcule depuis la graine `game.seed`).
import type { GameState } from './state'
import { computeScore } from './score'
import { wasChampion } from './belts'
import { clampStat } from './config'

export interface DailyObjective {
  id: string
  /** Intitulé affiché au joueur. */
  label: string
  /** Bonus de score /100 si l'objectif est atteint. */
  bonus: number
  /** L'objectif est-il rempli par l'état final ? */
  met: (g: GameState) => boolean
}

// Objectifs pensés pour un sprint de quelques années : atteignables, mais qui
// demandent d'orienter ses choix. L'ordre est stable (sélection par graine).
const OBJECTIVES: DailyObjective[] = [
  { id: 'finisher', label: 'Terminer 5 combats avant la limite', bonus: 15, met: (g) => g.record.finishes >= 5 },
  { id: 'champion-national', label: 'Devenir champion national amateur', bonus: 15, met: (g) => g.flags['titre_national'] === true },
  { id: 'pro', label: 'Passer professionnel', bonus: 10, met: (g) => g.pro },
  { id: 'belt', label: 'Décrocher une ceinture pro', bonus: 20, met: (g) => wasChampion(g) },
  { id: 'popular', label: 'Atteindre 8 000 followers', bonus: 15, met: (g) => g.meta.followers >= 8000 },
  { id: 'rich', label: 'Amasser 30 000 €', bonus: 15, met: (g) => g.meta.money >= 30000 },
  { id: 'winner', label: 'Remporter 12 combats', bonus: 10, met: (g) => g.record.wins >= 12 },
  { id: 'major', label: 'Signer dans une organisation majeure', bonus: 20, met: (g) => g.tier === 'major' },
]

/** Objectif du jour dérivé de la graine (le même pour tous ce jour-là). */
export function dailyObjective(seed: number): DailyObjective {
  return OBJECTIVES[seed % OBJECTIVES.length]
}

/** Score d'une Mission du jour : score de carrière + bonus d'objectif (borné 0-100). */
export function dailyScore(game: GameState): number {
  const obj = dailyObjective(game.seed)
  const bonus = obj.met(game) ? obj.bonus : 0
  return clampStat(computeScore(game) + bonus)
}
