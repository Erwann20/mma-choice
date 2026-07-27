import './game.css'
import { useEffect, useState } from 'react'
import { useGameStore } from '../store/game'
import { CareerScreen } from './CareerScreen'
import { CreationScreen } from './CreationScreen'
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
      <section className="center-screen">
        <h1>MMA CHOICE</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Forge ta légende, choix après choix.</p>
        <button className="btn-primary" type="button" onClick={() => setCreating(true)}>
          Créer mon combattant
        </button>
        {resumeToast}
      </section>
    )
  }

  if (!session.current) {
    return (
      <section className="center-screen">
        <h1>Carrière terminée</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {session.game.fighter.name} a raccroché les gants à {session.game.fighter.age} ans.
        </p>
        <button className="btn-primary" type="button" onClick={() => setConfirmNew(true)}>
          Nouvelle carrière
        </button>
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
      </section>
    )
  }

  return (
    <>
      <CareerScreen />
      {resumeToast}
    </>
  )
}
