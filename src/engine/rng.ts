// PRNG à graine, déterministe et sérialisable (AD-3).
// Wrapper PUR autour de pure-rand : ne mute jamais l'état reçu ; l'état est un
// simple number[] stockable dans GameState (JSON-sérialisable, AD-7).
import {
  xoroshiro128plus,
  xoroshiro128plusFromState,
} from 'pure-rand/generator/xoroshiro128plus'
import { uniformInt } from 'pure-rand/distribution/uniformInt'

export type RngState = readonly number[]

/** Initialise l'état RNG à partir d'une graine. */
export function initRng(seed: number): RngState {
  return xoroshiro128plus(seed).getState()
}

/**
 * Tire un entier dans [min, max] (bornes incluses) SANS muter `state`.
 * Renvoie [valeur, état suivant] — l'appelant propage l'état suivant.
 */
export function nextInt(state: RngState, min: number, max: number): [number, RngState] {
  const gen = xoroshiro128plusFromState(state)
  const value = uniformInt(gen, min, max)
  return [value, gen.getState()]
}
