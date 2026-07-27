// Écran d'accueil à 3 modes (UX-DR13). Un seul mode jouable en V1 ; les deux
// autres sont marqués « Bientôt » avec un acquittement inline (sans navigation).
import { useState } from 'react'

interface Mode {
  id: string
  title: string
  desc: string
  soon: boolean
}

const MODES: Mode[] = [
  { id: 'career', title: 'Faire ma carrière', desc: 'Crée ton combattant et écris ta légende, choix après choix.', soon: false },
  { id: 'replay', title: 'Revivre la carrière', desc: 'Une carrière légendaire à rejouer, renouvelée chaque semaine.', soon: true },
  { id: 'daily', title: 'Mission du jour', desc: 'Un défi quotidien, un seul essai.', soon: true },
]

export function HomeScreen({ onStart }: { onStart: () => void }) {
  const [acked, setAcked] = useState<string | null>(null)

  return (
    <main className="center-screen home">
      <div className="home-head">
        <h1>MMA CHOICE</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Forge ta légende, choix après choix.</p>
      </div>
      <div className="mode-list">
        {MODES.map((m) =>
          m.soon ? (
            <button
              key={m.id}
              type="button"
              className="mode-card is-soon"
              onClick={() => setAcked(m.id)}
              aria-disabled="true"
            >
              <span className="mode-title">
                {m.title} <span className="badge-soon">Bientôt</span>
              </span>
              <span className="mode-desc">{acked === m.id ? 'Bientôt disponible — reviens vite !' : m.desc}</span>
            </button>
          ) : (
            <button key={m.id} type="button" className="mode-card is-primary" onClick={onStart}>
              <span className="mode-title">{m.title}</span>
              <span className="mode-desc">{m.desc}</span>
            </button>
          ),
        )}
      </div>
    </main>
  )
}
