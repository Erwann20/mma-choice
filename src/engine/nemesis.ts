// Némésis (FR-16) : rival récurrent nommé, recroisé au fil de la carrière.
// PUR. La némésis naît lors du premier « combat de rivalité », est stockée sur
// l'état, et réapparaît identique (même nom) mais renforcée à chaque revanche.
import type { GameState, Nemesis, Style } from './state'
import type { Opponent } from './combat'
import type { Channel } from '../schema'
import { clampStat } from './config'

/** Drapeau posé quand la rivalité est née (gate les événements de revanche). */
export const NEMESIS_BORN_FLAG = 'nemesis_ne'

/** Tactique du joueur qui met la némésis en difficulté, selon son style. */
function weakToForStyle(style: Style): Channel {
  switch (style) {
    // MMA
    case 'striker':
      return 'grappling'
    case 'wrestler':
      return 'striking'
    case 'grappler':
      return 'striking'
    case 'allrounder':
      return 'ground'
    // Basket
    case 'scoreur':
    case 'meneur':
    case 'polyvalent':
      return 'defense'
    case 'defenseur':
    case 'athlete':
      return 'tir'
    default:
      return 'ground'
  }
}

/** Construit l'adversaire de combat à partir de la némésis stockée. */
export function nemesisToOpponent(nem: Nemesis): Opponent {
  const total = nem.playerWins + nem.playerLosses
  return {
    name: nem.name,
    archetypeId: 'nemesis',
    label: 'Ta némésis',
    style: nem.style,
    level: nem.level,
    // Palmarès « flavor » : le face-à-face si déjà disputé, sinon un bilan solide.
    record: total > 0 ? `face-à-face ${nem.playerWins}-${nem.playerLosses}` : `${Math.floor(nem.level / 5)}-1`,
    weakTo: weakToForStyle(nem.style),
  }
}

/** Crée une némésis depuis un adversaire fraîchement généré (naissance de la rivalité). */
export function birthNemesis(opp: Opponent): Nemesis {
  return { name: opp.name, style: opp.style, playerWins: 0, playerLosses: 0, level: opp.level }
}

/** Met à jour le face-à-face après un combat de rivalité et renforce la némésis. */
export function recordNemesisResult(game: GameState, playerWon: boolean): GameState {
  if (!game.nemesis) return game
  const nem = game.nemesis
  const updated: Nemesis = {
    ...nem,
    playerWins: nem.playerWins + (playerWon ? 1 : 0),
    playerLosses: nem.playerLosses + (playerWon ? 0 : 1),
    // La némésis progresse elle aussi : chaque duel la rend plus coriace.
    level: clampStat(nem.level + 3),
  }
  return { ...game, nemesis: updated }
}
