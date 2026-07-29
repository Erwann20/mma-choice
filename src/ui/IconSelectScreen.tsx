// Mode « Revivre la carrière » : choisir une légende à incarner. Chaque icône
// est un profil préconfiguré (pays, poste/division, style, forces de départ).
import { useMemo } from 'react'
import { loadDivisions, type Icon } from '../schema'
import { sportDef } from '../engine'

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
  // Libellé du poste/division : positions du sport, sinon grille MMA, sinon brut.
  const divLabel = (icon: Icon) => {
    const pos = sportDef(icon.sport).positions.find((p) => p.id === icon.division)
    if (pos) return pos.label
    return divisions.find((d) => d.id === icon.division)?.label ?? icon.division
  }
  const styleLabelOf = (icon: Icon) => sportDef(icon.sport).styleLabels[icon.style] ?? icon.style

  return (
    <main className="screen">
      <h2 className="step-title">Revivre la carrière</h2>
      <p className="text-lead" style={{ marginTop: 0 }}>
        Incarne une légende et réécris son histoire, à ta façon.
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
                « {icon.nickname} » · {divLabel(icon)} · {styleLabelOf(icon)}
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
