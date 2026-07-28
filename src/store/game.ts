// Store Zustand : conteneur fin (AD-2) + persistance localStorage (AD-7).
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FighterSetup, GameState } from '../engine'
import type { Icon } from '../schema'
import { dailyScore } from '../engine'
import { loadEvents, loadStartingCriteria } from '../schema'
import {
  startCareer,
  startCareerFromCreation,
  startIconCareer,
  startDailyCareer,
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

/** Résultat de la Mission du jour déjà tentée (verrou « un seul essai »). */
export interface DailyResult {
  date: string
  score: number
}

/** Nombre maximum de carrières conservées dans l'historique. */
const MAX_ARCHIVE = 50
/** Durée (années) d'un sprint « Mission du jour ». */
const DAILY_YEARS = 6
/** Nombre de résultats de Mission du jour conservés dans l'historique. */
const MAX_DAILY_HISTORY = 30

interface GameStore {
  session: Session | null
  /** Historique des carrières terminées (plus récentes en tête). */
  archive: ArchivedCareer[]
  /** Dernière Mission du jour tentée (verrou quotidien). */
  dailyResult: DailyResult | null
  /** Série de jours consécutifs avec une Mission du jour terminée. */
  dailyStreak: number
  /** Historique des Missions du jour (plus récentes en tête). */
  dailyHistory: DailyResult[]
  newCareer: (setup?: FighterSetup, seed?: number) => void
  createCareer: (choices: CreationChoices, seed?: number) => void
  /** Démarre le mode « Revivre la carrière » avec le profil d'une icône. */
  replayIcon: (icon: Icon, seed?: number) => void
  /** Démarre la « Mission du jour » (une seule tentative par jour). */
  startDaily: () => void
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

/** Clé du jour (AAAA-M-J) — la Mission du jour est partagée par tous ce jour-là. */
export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Clé de la veille (pour détecter une série de jours consécutifs). */
export function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** Graine déterministe dérivée d'une clé de jour (FNV-1a). */
function dailySeed(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 0x7fff_ffff
}

const DAILY_STYLES = ['striker', 'wrestler', 'grappler', 'allrounder'] as const
const DAILY_DIVISIONS = [
  'flyweight-m',
  'bantamweight-m',
  'featherweight-m',
  'lightweight-m',
  'welterweight-m',
  'middleweight-m',
]

/** Profil du combattant du jour (style/division variant selon la graine). */
function dailySetup(seed: number): FighterSetup {
  return {
    style: DAILY_STYLES[seed % DAILY_STYLES.length],
    division: DAILY_DIVISIONS[seed % DAILY_DIVISIONS.length],
    country: 'France',
    startAge: 18,
  }
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
      dailyResult: null,
      dailyStreak: 0,
      dailyHistory: [],
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
      replayIcon: (icon, seed) =>
        set((s) => ({
          archive: archiveIfRetired(s.archive, s.session),
          session: startIconCareer(loadEvents(), seed ?? randomSeed(), icon),
        })),
      startDaily: () =>
        set((s) => {
          const today = todayKey()
          if (s.dailyResult?.date === today) return {} // déjà tentée aujourd'hui
          const seed = dailySeed(today)
          return {
            archive: archiveIfRetired(s.archive, s.session),
            session: startDailyCareer(loadEvents(), seed, DAILY_YEARS, dailySetup(seed)),
          }
        }),
      choose: (choiceIndex) => {
        const s = get().session
        if (s) set({ session: chooseInSession(s, choiceIndex) })
      },
      advance: () => {
        const s = get().session
        if (s) set(recordDaily(get, continueSession(s)))
      },
      retire: () => {
        const s = get().session
        if (s) set(recordDaily(get, retireCareer(s)))
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
        dailyResult: s.dailyResult,
        dailyStreak: s.dailyStreak,
        dailyHistory: s.dailyHistory,
      }),
      merge: (persisted, current) => {
        const p = persisted as {
          saved?: SavedSession | null
          archive?: ArchivedCareer[]
          dailyResult?: DailyResult | null
          dailyStreak?: number
          dailyHistory?: DailyResult[]
        }
        return {
          ...current,
          session: p?.saved ? deserializeSession(p.saved, loadEvents()) : current.session,
          archive: p?.archive ?? [],
          dailyResult: p?.dailyResult ?? null,
          dailyStreak: p?.dailyStreak ?? 0,
          dailyHistory: p?.dailyHistory ?? [],
        }
      },
    },
  ),
)

/** À la fin d'une Mission du jour, enregistre le score (verrou du jour). */
function recordDaily(
  get: () => GameStore,
  next: Session,
): Partial<GameStore> {
  if (next.daily && next.game.phase === 'retired') {
    const today = todayKey()
    const state = get()
    if (state.dailyResult?.date !== today) {
      const entry: DailyResult = { date: today, score: dailyScore(next.game) }
      // Série : +1 si la dernière mission datait d'hier, sinon on repart à 1.
      const streak = state.dailyResult?.date === yesterdayKey() ? state.dailyStreak + 1 : 1
      const history = [entry, ...state.dailyHistory].slice(0, MAX_DAILY_HISTORY)
      return { session: next, dailyResult: entry, dailyStreak: streak, dailyHistory: history }
    }
  }
  return { session: next }
}
