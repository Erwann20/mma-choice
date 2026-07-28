// Page d'entrée de l'app (multi-sports) : on choisit son sport. Le MMA est
// jouable ; les autres sont annoncés « Bientôt » (badges). L'idée : une même
// mécanique de carrière déclinée sur plusieurs sports.
import { useState } from 'react'

interface Sport {
  id: string
  icon: string
  title: string
  desc: string
  soon: boolean
}

const SPORTS: Sport[] = [
  { id: 'mma', icon: '🥊', title: 'MMA', desc: 'Forge ta légende de la cage, combat après combat.', soon: false },
  { id: 'basket', icon: '🏀', title: 'Basket', desc: 'Du playground au sommet : deviens une légende du parquet.', soon: false },
  { id: 'velo', icon: '🚴', title: 'Vélo', desc: 'Des classiques aux grands tours : grimpe vers le maillot jaune.', soon: true },
]

export function SportSelectScreen({ onSelectSport }: { onSelectSport: (id: string) => void }) {
  const [acked, setAcked] = useState<string | null>(null)

  return (
    <main className="center-screen home">
      <div className="home-head">
        <h1>SPORT CHOICE</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Choisis ton sport, écris ta carrière choix après choix.
        </p>
      </div>

      <div className="mode-list">
        {SPORTS.map((s) => {
          if (s.soon) {
            return (
              <button
                key={s.id}
                type="button"
                className="mode-card is-soon"
                onClick={() => setAcked(s.id)}
                aria-disabled="true"
              >
                <span className="mode-title">
                  <span className="sport-icon" aria-hidden="true">
                    {s.icon}
                  </span>{' '}
                  {s.title} <span className="badge-soon">Bientôt</span>
                </span>
                <span className="mode-desc">
                  {acked === s.id ? 'Bientôt disponible — reviens vite !' : s.desc}
                </span>
              </button>
            )
          }
          return (
            <button
              key={s.id}
              type="button"
              className="mode-card is-primary"
              onClick={() => onSelectSport(s.id)}
            >
              <span className="mode-title">
                <span className="sport-icon" aria-hidden="true">
                  {s.icon}
                </span>{' '}
                {s.title}
              </span>
              <span className="mode-desc">{s.desc}</span>
            </button>
          )
        })}
      </div>
    </main>
  )
}
