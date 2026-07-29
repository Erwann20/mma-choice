// Création d'un basketteur (FR-1/2) : pays, poste, profil — RIEN n'est
// présélectionné. Le nom est toujours aléatoire (généré par le moteur). Tout
// champ laissé libre est tiré au hasard au lancement.
import { useState } from 'react'
import { sportDef } from '../engine'
import type { FighterSetup } from '../engine'

const COUNTRIES: { name: string; flag: string }[] = [
  { name: 'France', flag: '🇫🇷' },
  { name: 'États-Unis', flag: '🇺🇸' },
  { name: 'Espagne', flag: '🇪🇸' },
  { name: 'Brésil', flag: '🇧🇷' },
  { name: 'Nigéria', flag: '🇳🇬' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Royaume-Uni', flag: '🇬🇧' },
]

/** Tirage aléatoire (shell : Math.random autorisé hors moteur). */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function BasketCreationScreen({
  onCreate,
  onCancel,
}: {
  onCreate: (setup: FighterSetup) => void
  onCancel: () => void
}) {
  const def = sportDef('basket')
  // null = non choisi (rien de présélectionné) ⇒ tiré au hasard au lancement.
  const [country, setCountry] = useState<string | null>(null)
  const [division, setDivision] = useState<string | null>(null)
  const [style, setStyle] = useState<string | null>(null)

  const launch = () =>
    onCreate({
      sport: 'basket',
      // Nom omis ⇒ généré aléatoirement par le moteur (FR-1).
      country: country ?? pick(COUNTRIES).name,
      division: division ?? pick(def.positions).id,
      style: style ?? pick(def.styles),
    })

  return (
    <main className="screen">
      <button type="button" className="home-back" onClick={onCancel}>
        ← Retour
      </button>
      <div className="home-head">
        <h1>🏀 Nouveau joueur</h1>
        <p className="text-lead">Choisis ce que tu veux — le reste (nom compris) est tiré au hasard.</p>
      </div>

      <div className="overline">Pays</div>
      <div className="flag-grid">
        {COUNTRIES.map((c) => (
          <button
            key={c.name}
            type="button"
            className={`flag-option ${country === c.name ? 'selected' : ''}`}
            aria-pressed={country === c.name}
            onClick={() => setCountry(c.name)}
          >
            <span aria-hidden="true">{c.flag}</span> {c.name}
          </button>
        ))}
      </div>

      <div className="overline" style={{ marginTop: 'var(--space-4)' }}>Poste</div>
      <div className="flag-grid">
        {def.positions.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`flag-option ${division === p.id ? 'selected' : ''}`}
            aria-pressed={division === p.id}
            onClick={() => setDivision(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="overline" style={{ marginTop: 'var(--space-4)' }}>Profil</div>
      <div className="flag-grid">
        {def.styles.map((s) => (
          <button
            key={s}
            type="button"
            className={`flag-option ${style === s ? 'selected' : ''}`}
            aria-pressed={style === s}
            onClick={() => setStyle(s)}
          >
            {def.styleLabels[s] ?? s}
          </button>
        ))}
      </div>

      <button type="button" className="btn-primary" style={{ marginTop: 'var(--space-6)' }} onClick={launch}>
        Lancer ma carrière
      </button>
    </main>
  )
}
