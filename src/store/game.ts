// Store Zustand : conteneur fin (AD-2) + persistance localStorage (AD-7).
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FighterSetup } from '../engine'
import { loadEvents, loadStartingCriteria } from '../schema'
import {
  startCareer,
  startCareerFromCreation,
  chooseInSession,
  continueSession,
  retireCareer,
  serializeSession,
  deserializeSession,
  type CreationChoices,
  type SavedSession,
  type Session,
} from './session'

interface GameStore {
  session: Session | null
  newCareer: (setup?: FighterSetup, seed?: number) => void
  createCareer: (choices: CreationChoices, seed?: number) => void
  choose: (choiceIndex: number) => void
  /** Reprend après un écran de conséquences (combat ou choix narratif). */
  advance: () => void
  /** Retraite volontaire : raccroche les gants et bascule sur le récap final. */
  retire: () => void
  reset: () => void
}

// Graine aléatoire par carrière (variété). Math.random hors du moteur = OK.
function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fff_ffff)
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
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
      advance: () => {
        const s = get().session
        if (s) set({ session: continueSession(s) })
      },
      retire: () => {
        const s = get().session
        if (s) set({ session: retireCareer(s) })
      },
      reset: () => set({ session: null }),
    }),
    {
      // AD-7 : middleware persist = seul écrivain, clé versionnée, refs par id.
      name: 'mmachoice.save.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ saved: s.session ? serializeSession(s.session) : null }),
      merge: (persisted, current) => {
        const p = persisted as { saved?: SavedSession | null }
        if (!p?.saved) return current
        return { ...current, session: deserializeSession(p.saved, loadEvents()) }
      },
    },
  ),
)
