import './game.css'
import { useEffect, useState } from 'react'
import { useGameStore } from '../store/game'
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
  const reset = useGameStore((s) => s.reset)
  const deleteArchived = useGameStore((s) => s.deleteArchived)
  const [creating, setCreating] = useState(false)
  const [pickingIcon, setPickingIcon] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [resumed, setResumed] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)

  // Toast « Reprise sauvegardée » si une carrière a été rechargée au démarrage.
  useEffect(() => {
    if (useGameStore.getState().session) {
      setResumed(true)
      const t = setTimeout(() => setResumed(false), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const resumeToast = resumed ? <Toast message="Reprise sauvegardée." /> : null

  if (!session) {
    // Consultation d'une carrière archivée depuis l'accueil.
    const viewing = viewingId ? (archive.find((a) => a.id === viewingId) ?? null) : null
    if (viewing) {
      return <RecapScreen game={viewing.game} onBack={() => setViewingId(null)} />
    }
    if (creating) {
      return (
        <CreationScreen
          onCreate={(c) => {
            createCareer(c)
            setCreating(false)
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
            setPickingIcon(false)
          }}
          onCancel={() => setPickingIcon(false)}
        />
      )
    }
    return (
      <>
        <HomeScreen
          onStart={() => setCreating(true)}
          onReplay={() => setPickingIcon(true)}
          archive={archive}
          onOpenCareer={(c) => setViewingId(c.id)}
          onDeleteCareer={deleteArchived}
        />
        {resumeToast}
      </>
    )
  }

  // Récap de FIN DE CARRIÈRE uniquement à la retraite (le bilan annuel et la
  // fin de tournoi mettent aussi `current` à null, mais sont gérés par CareerScreen).
  if (session.game.phase === 'retired') {
    return (
      <>
        <RecapScreen
          game={session.game}
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

  return (
    <>
      <CareerScreen />
      {resumeToast}
    </>
  )
}
