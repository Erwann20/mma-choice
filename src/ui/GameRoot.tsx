import './game.css'
import { useEffect, useState } from 'react'
import { useGameStore } from '../store/game'
import { CareerScreen } from './CareerScreen'
import { CreationScreen } from './CreationScreen'
import { RecapScreen } from './RecapScreen'
import { HomeScreen } from './HomeScreen'
import { ConfirmDialog } from './ConfirmDialog'
import { Toast } from './Toast'

export function GameRoot() {
  const session = useGameStore((s) => s.session)
  const createCareer = useGameStore((s) => s.createCareer)
  const reset = useGameStore((s) => s.reset)
  const [creating, setCreating] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [resumed, setResumed] = useState(false)

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
    return (
      <>
        <HomeScreen onStart={() => setCreating(true)} />
        {resumeToast}
      </>
    )
  }

  if (!session.current) {
    return (
      <>
        <RecapScreen game={session.game} onNew={() => setConfirmNew(true)} />
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
