// Carte d'adversaire avant le combat : identité + niveau estimé (FR-16).
import type { Opponent } from '../engine'

export function OpponentCard({ opponent }: { opponent: Opponent }) {
  return (
    <div className="opponent-card">
      <div className="opponent-head">
        <span className="overline">En face</span>
        <span className="opponent-record">{opponent.record}</span>
      </div>
      <p className="opponent-name">{opponent.name}</p>
      <p className="opponent-label">{opponent.label}</p>
      <div className="opponent-level" aria-label={`Niveau estimé ${opponent.level} sur 100`}>
        <div className="opponent-level-track">
          <div className="opponent-level-fill" style={{ width: `${opponent.level}%` }} />
        </div>
        <span className="opponent-level-value">{opponent.level}</span>
      </div>
    </div>
  )
}
