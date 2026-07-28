// Accessibilité (NFR-10, UX-DR17) : formulation des variations de stats pour
// annonce en live region aux lecteurs d'écran. Générique (multi-sports).
import type { GameState } from '../engine'
import type { Channel } from '../schema'
import { readChannel, sportDef } from '../engine'
import { CHANNEL_LABEL } from './labels'

/** Canaux méta communs à tous les sports. */
const META_CHANNELS: Channel[] = ['health', 'mental', 'reputation', 'followers', 'money']

/**
 * Décrit les variations de canaux entre deux états (chaîne vide si aucune),
 * ex. « Réputation +8, Forme −5 ». Pour annonce via aria-live (UX-DR17).
 */
export function describeStatChanges(prev: GameState, next: GameState): string {
  const channels = [...sportDef(next.sport).statKeys, ...META_CHANNELS] as Channel[]
  const parts: string[] = []
  for (const ch of channels) {
    const delta = readChannel(next, ch) - readChannel(prev, ch)
    if (delta === 0) continue
    const sign = delta > 0 ? '+' : '−'
    const unit = ch === 'money' ? ' €' : ''
    parts.push(`${CHANNEL_LABEL[ch]} ${sign}${Math.abs(delta)}${unit}`)
  }
  return parts.join(', ')
}
