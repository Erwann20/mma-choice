import './game.css'
import { useState } from 'react'
import { useGameStore } from '../store/game'
import { CareerScreen } from './CareerScreen'
import { CreationScreen } from './CreationScreen'

export function GameRoot() {
  const session = useGameStore((s) => s.session)
  const createCareer = useGameStore((s) => s.createCareer)
  const reset = useGameStore((s) => s.reset)
  const [creating, setCreating] = useState(false)

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
      </section>
    )
  }

  if (!session.current) {
    // Carrière terminée — récap minimal (Story 1.11 le remplacera).
    return (
      <section className="center-screen">
        <h1>Carrière terminée</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {session.game.fighter.name} a raccroché les gants à {session.game.fighter.age} ans.
        </p>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            reset()
            setCreating(true)
          }}
        >
          Nouvelle carrière
        </button>
      </section>
    )
  }

  return <CareerScreen />
}
