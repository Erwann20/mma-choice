// Application des effets d'un Choix (AD-5, FR-2) : effets déclarés → mutations
// bornées, pose de flags, arme les conséquences différées, marque l'Événement vu.
import type { Choice, Effect, EventDef } from '../schema'
import type { GameState } from './state'
import { readChannel, writeChannel } from './channels'
import { markEventConsumed } from './events'

/** Applique un effet déclaré `{target, op, value}` (borné par writeChannel). */
export function applyEffect(state: GameState, e: Effect): GameState {
  const current = readChannel(state, e.target)
  const next = e.op === 'add' ? current + e.value : e.op === 'sub' ? current - e.value : e.value
  return writeChannel(state, e.target, next)
}

/**
 * Résout un Choix : applique ses effets (bornés), pose ses flags, arme ses
 * conséquences différées, puis marque l'Événement comme consommé.
 */
export function applyChoice(state: GameState, event: EventDef, choice: Choice): GameState {
  let s = state
  for (const eff of choice.effects) s = applyEffect(s, eff)
  // Évolution du style (FR-15) : un entraînement/événement dédié réoriente le combattant.
  if (choice.setStyle) {
    s = { ...s, style: choice.setStyle }
  }
  // Changement de division (FR-13) : déclenche une coupe de poids (flag consommé
  // par un événement dédié) tant que la cible diffère de la division courante.
  if (choice.setDivision && choice.setDivision !== s.division) {
    s = { ...s, division: choice.setDivision, flags: { ...s.flags, coupe_de_poids: true } }
  }
  if (choice.setFlags) {
    s = { ...s, flags: { ...s.flags, ...choice.setFlags } }
  }
  if (choice.armFlags && choice.armFlags.length > 0) {
    const armed = choice.armFlags.map((a) => ({
      flag: a.flag,
      value: a.value,
      atAge: s.fighter.age + a.inYears,
    }))
    s = { ...s, pending: [...s.pending, ...armed] }
  }
  return markEventConsumed(s, event)
}
