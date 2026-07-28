// Store Zustand : conteneur fin (AD-2) + persistance localStorage (AD-7).
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FighterSetup, GameState } from '../engine'
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

/** Une carrière terminée archivée, consultable depuis l'accueil. */
export interface ArchivedCareer {
  id: string
  /** Horodatage de fin (ms) — sert d'ordre et d'identifiant. */
  endedAt: number
  game: GameState
}

/** Nombre maximum de carrières conservées dans l'historique. */
const MAX_ARCHIVE = 50

interface GameStore {
  session: Session | null
  /** Historique des carrières terminées (plus récentes en tête). */
  archive: ArchivedCareer[]
  newCareer: (setup?: FighterSetup, seed?: number) => void
  createCareer: (choices: CreationChoices, seed?: number) => void
  choose: (choiceIndex: number) => void
  /** Reprend après un écran de conséquences (combat ou choix narratif). */
  advance: () => void
  /** Retraite volontaire : raccroche les gants et bascule sur le récap final. */
  retire: () => void
  /** Repart à zéro (archive d'abord la carrière si elle est terminée). */
  reset: () => void
  /** Supprime une carrière de l'historique. */
  deleteArchived: (id: string) => void
}

// Graine aléatoire par carrière (variété). Math.random hors du moteur = OK.
function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fff_ffff)
}

/** Archive la carrière courante si elle est terminée (retraite), sinon inchangé. */
function archiveIfRetired(archive: ArchivedCareer[], session: Session | null): ArchivedCareer[] {
  if (!session || session.game.phase !== 'retired') return archive
  const entry: ArchivedCareer = {
    id: `${session.game.seed}-${Date.now()}`,
    endedAt: Date.now(),
    game: session.game,
  }
  return [entry, ...archive].slice(0, MAX_ARCHIVE)
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      session: null,
      archive: [],
      newCareer: (setup, seed) =>
        set((s) => ({
          archive: archiveIfRetired(s.archive, s.session),
          session: startCareer(loadEvents(), seed ?? randomSeed(), setup),
        })),
      createCareer: (choices, seed) =>
        set((s) => ({
          archive: archiveIfRetired(s.archive, s.session),
          session: startCareerFromCreation(loadEvents(), loadStartingCriteria(), seed ?? randomSeed(), choices),
        })),
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
      reset: () =>
        set((s) => ({ archive: archiveIfRetired(s.archive, s.session), session: null })),
      deleteArchived: (id) => set((s) => ({ archive: s.archive.filter((a) => a.id !== id) })),
    }),
    {
      // AD-7 : middleware persist = seul écrivain, clé versionnée, refs par id.
      name: 'mmachoice.save.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        saved: s.session ? serializeSession(s.session) : null,
        archive: s.archive,
      }),
      merge: (persisted, current) => {
        const p = persisted as { saved?: SavedSession | null; archive?: ArchivedCareer[] }
        return {
          ...current,
          session: p?.saved ? deserializeSession(p.saved, loadEvents()) : current.session,
          archive: p?.archive ?? [],
        }
      },
    },
  ),
)
