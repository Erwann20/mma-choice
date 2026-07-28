// Création d'un basketteur (FR-1/2) : nom, pays, poste, profil. Simple et
// direct — pas d'origine/entourage (spécifiques au MMA). Démarre via newCareer.
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

export function BasketCreationScreen({
  onCreate,
  onCancel,
}: {
  onCreate: (setup: FighterSetup) => void
  onCancel: () => void
}) {
  const def = sportDef('basket')
  const [name, setName] = useState('')
  const [country, setCountry] = useState(COUNTRIES[0].name)
  const [division, setDivision] = useState(def.defaultDivision)
  const [style, setStyle] = useState(def.defaultStyle)

  return (
    <main className="screen">
      <button type="button" className="home-back" onClick={onCancel}>
        ← Retour
      </button>
      <div className="home-head">
        <h1>🏀 Nouveau joueur</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Façonne ton basketteur, puis écris ta légende.</p>
      </div>

      <label className="overline" htmlFor="bk-name">Nom (facultatif)</label>
      <input
        id="bk-name"
        className="text-input"
        type="text"
        value={name}
        placeholder="Laisser vide = nom aléatoire"
        onChange={(e) => setName(e.target.value)}
      />

      <div className="overline" style={{ marginTop: 'var(--space-4)' }}>Pays</div>
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

      <button
        type="button"
        className="btn-primary"
        style={{ marginTop: 'var(--space-6)' }}
        onClick={() => onCreate({ sport: 'basket', name: name.trim() || undefined, country, division, style })}
      >
        Lancer ma carrière
      </button>
    </main>
  )
}
