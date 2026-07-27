import type { GameState } from '../engine'

interface ChipDef {
  label: string
  value: string
}

function chips(game: GameState): ChipDef[] {
  return [
    { label: 'Forme', value: String(game.meta.health) },
    { label: 'Mental', value: String(game.meta.mental) },
    { label: 'Répu.', value: String(game.meta.reputation) },
    { label: 'Follow.', value: String(game.meta.followers) },
    { label: '€', value: String(game.meta.money) },
  ]
}

export function DataChipRow({ game, onOpen }: { game: GameState; onOpen?: () => void }) {
  return (
    <button className="chip-row" type="button" onClick={onOpen} aria-label="Voir les statistiques">
      {chips(game).map((c) => (
        <span className="chip" key={c.label}>
          <span className="chip-label">{c.label}</span>
          <span className="chip-value">{c.value}</span>
        </span>
      ))}
    </button>
  )
}
