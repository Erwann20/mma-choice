import './game.css'
import { useEffect, useState } from 'react'
import { useGameStore, todayKey, yesterdayKey } from '../store/game'
import { CareerScreen } from './CareerScreen'
import { CreationScreen } from './CreationScreen'
import { IconSelectScreen } from './IconSelectScreen'
import { RecapScreen } from './RecapScreen'
import { HomeScreen } from './HomeScreen'
import { ConfirmDialog } from './ConfirmDialog'
import { Toast } from './Toast'
import { loadIcons } from '../schema'

export function GameRoot() {
  const session = useGameStore((s) => s.session)
  const archive = useGameStore((s) => s.archive)
  const createCareer = useGameStore((s) => s.createCareer)
  const replayIcon = useGameStore((s) => s.replayIcon)
  const startDaily = useGameStore((s) => s.startDaily)
  const dailyResult = useGameStore((s) => s.dailyResult)
  const dailyStreak = useGameStore((s) => s.dailyStreak)
  const dailyHistory = useGameStore((s) => s.dailyHistory)
  const reset = useGameStore((s) => s.reset)
  const deleteArchived = useGameStore((s) => s.deleteArchived)
  const [creating, setCreating] = useState(false)
  const [pickingIcon, setPickingIcon] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [resumed, setResumed] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)
  // Consulter l'accueil sans terminer la carrière en cours (reprise possible).
  const [atHome, setAtHome] = useState(false)

  // Toast « Reprise sauvegardée » si une carrière a été rechargée au démarrage.
  useEffect(() => {
    if (useGameStore.getState().session) {
      setResumed(true)
      const t = setTimeout(() => setResumed(false), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const resumeToast = resumed ? <Toast message="Reprise sauvegardée." /> : null
  const pausedCareer = session != null && session.game.phase === 'career'

  /** Démarre proprement un nouveau mode : quitte l'écran d'accueil temporaire. */
  const leaveHome = () => {
    setAtHome(false)
    setCreating(false)
    setPickingIcon(false)
  }

  // Récap de FIN DE CARRIÈRE (retraite) — prioritaire sur tout le reste.
  if (session && session.game.phase === 'retired') {
    return (
      <>
        <RecapScreen
          game={session.game}
          daily={session.daily}
          onNew={() => setConfirmNew(true)}
          onHome={() => {
            reset()
            setCreating(false)
          }}
        />
        {confirmNew ? (
          <ConfirmDialog
            title="Nouvelle carrière ?"
            body="Ta carrière actuelle sera remplacée."
            confirmLabel="Commencer"
            onConfirm={() => {
              reset()
              setConfirmNew(false)
              setCreating(true)
            }}
            onCancel={() => setConfirmNew(false)}
          />
        ) : null}
        {resumeToast}
      </>
    )
  }

  // Zone « accueil » : aucune carrière, ou l'on a mis la carrière en pause.
  if (!session || atHome) {
    const viewing = viewingId ? (archive.find((a) => a.id === viewingId) ?? null) : null
    if (viewing) {
      return <RecapScreen game={viewing.game} onBack={() => setViewingId(null)} />
    }
    if (creating) {
      return (
        <CreationScreen
          onCreate={(c) => {
            createCareer(c)
            leaveHome()
          }}
          onCancel={() => setCreating(false)}
        />
      )
    }
    if (pickingIcon) {
      return (
        <IconSelectScreen
          icons={loadIcons()}
          onPick={(icon) => {
            replayIcon(icon)
            leaveHome()
          }}
          onCancel={() => setPickingIcon(false)}
        />
      )
    }
    return (
      <>
        <HomeScreen
          onStart={() => (pausedCareer ? setConfirmNew(true) : setCreating(true))}
          onReplay={() => setPickingIcon(true)}
          onDaily={() => {
            startDaily()
            leaveHome()
          }}
          onResume={pausedCareer ? () => setAtHome(false) : undefined}
          resumeName={pausedCareer ? session.game.fighter.name : undefined}
          dailyDoneScore={dailyResult && dailyResult.date === todayKey() ? dailyResult.score : null}
          dailyStreak={
            dailyResult && (dailyResult.date === todayKey() || dailyResult.date === yesterdayKey())
              ? dailyStreak
              : 0
          }
          dailyHistory={dailyHistory}
          archive={archive}
          onOpenCareer={(c) => setViewingId(c.id)}
          onDeleteCareer={deleteArchived}
        />
        {confirmNew ? (
          <ConfirmDialog
            title="Remplacer la carrière en cours ?"
            body="La carrière que tu as en cours sera définitivement perdue."
            confirmLabel="Nouvelle carrière"
            onConfirm={() => {
              setConfirmNew(false)
              setCreating(true)
            }}
            onCancel={() => setConfirmNew(false)}
          />
        ) : null}
        {resumeToast}
      </>
    )
  }

  // Carrière active.
  return (
    <>
      <CareerScreen
        onExitToHome={() => setAtHome(true)}
        onAbandon={() => {
          reset()
          setAtHome(false)
        }}
      />
      {resumeToast}
    </>
  )
}
