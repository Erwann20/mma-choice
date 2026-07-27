import './game.css'
import { useGameStore } from '../store/game'
import { CareerScreen } from './CareerScreen'

export function GameRoot() {
  const session = useGameStore((s) => s.session)
  const newCareer = useGameStore((s) => s.newCareer)
  const reset = useGameStore((s) => s.reset)

  if (!session) {
    return (
      <section className="center-screen">
        <h1>MMA CHOICE</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Forge ta légende, choix après choix.</p>
        <button className="btn-primary" type="button" onClick={() => newCareer()}>
          Commencer une carrière
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
            newCareer()
          }}
        >
          Nouvelle carrière
        </button>
      </section>
    )
  }

  return <CareerScreen />
}
