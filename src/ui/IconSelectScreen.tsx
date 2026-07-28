// Mode « Revivre la carrière » : choisir une icône du MMA à incarner. Chaque
// icône est un profil préconfiguré (pays, division, style, forces de départ).
import { useMemo } from 'react'
import { loadDivisions, type Icon } from '../schema'
import { STYLE_LABEL } from './labels'

export function IconSelectScreen({
  icons,
  onPick,
  onCancel,
}: {
  icons: Icon[]
  onPick: (icon: Icon) => void
  onCancel: () => void
}) {
  const divisions = useMemo(() => loadDivisions(), [])
  const divLabel = (id: string) => divisions.find((d) => d.id === id)?.label ?? id

  return (
    <main className="screen">
      <h2 className="step-title">Revivre la carrière</h2>
      <p className="event-text" style={{ marginTop: 0 }}>
        Incarne une icône du MMA et réécris sa légende, à ta façon.
      </p>

      <div className="icon-grid">
        {icons.map((icon) => (
          <button key={icon.id} type="button" className="icon-card" onClick={() => onPick(icon)}>
            <span className="icon-flag" aria-hidden="true">
              {icon.flag}
            </span>
            <span className="icon-body">
              <span className="icon-name">{icon.name}</span>
              <span className="icon-nick">
                « {icon.nickname} » · {divLabel(icon.division)} · {STYLE_LABEL[icon.style]}
              </span>
              <span className="icon-blurb">{icon.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Retour
        </button>
      </div>
    </main>
  )
}
