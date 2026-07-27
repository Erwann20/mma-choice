// Store Zustand : conteneur fin (AD-2). Délègue à la logique pure de session.
import { create } from 'zustand'
import type { FighterSetup } from '../engine'
import { loadEvents, loadStartingCriteria } from '../schema'
import {
  startCareer,
  startCareerFromCreation,
  chooseInSession,
  type CreationChoices,
  type Session,
} from './session'

interface GameStore {
  session: Session | null
  newCareer: (setup?: FighterSetup, seed?: number) => void
  createCareer: (choices: CreationChoices, seed?: number) => void
  choose: (choiceIndex: number) => void
  reset: () => void
}

// Graine aléatoire par carrière (variété). Math.random hors du moteur = OK.
function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff)
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  newCareer: (setup, seed) => set({ session: startCareer(loadEvents(), seed ?? randomSeed(), setup) }),
  createCareer: (choices, seed) =>
    set({
      session: startCareerFromCreation(loadEvents(), loadStartingCriteria(), seed ?? randomSeed(), choices),
    }),
  choose: (choiceIndex) => {
    const s = get().session
    if (s) set({ session: chooseInSession(s, choiceIndex) })
  },
  reset: () => set({ session: null }),
}))
