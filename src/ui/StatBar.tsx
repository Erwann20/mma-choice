/** Jauge 0–100 (statBar). Valeur bornée pour l'affichage. */
export function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="stat-bar">
      <div className="stat-bar-head">
        <span className="stat-bar-label">{label}</span>
        <span className="stat-bar-value">{value}</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
