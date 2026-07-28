import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultBanner } from './ResultBanner'
import type { FightResult } from '../engine'

const base: FightResult = {
  opponentName: 'Diego Volkov',
  opponentLabel: 'Cogneur',
  opponentRecord: '8-2',
  outcome: 'upset',
  win: true,
  method: 'KO',
  titleFight: false,
  wonBelt: false,
  lostBelt: false,
  nemesis: false,
  changes: [
    { target: 'reputation', value: 18 },
    { target: 'health', value: -9 },
  ],
}

describe('ResultBanner (UX-DR9)', () => {
  it('affiche le degré, la méthode et les deltas', () => {
    render(<ResultBanner result={base} />)
    expect(screen.getByText(/UPSET/i)).toBeInTheDocument()
    expect(screen.getByText(/KO/)).toBeInTheDocument()
    expect(screen.getByText(/Réputation \+18/)).toBeInTheDocument()
    expect(screen.getByText(/Forme −9/)).toBeInTheDocument()
  })

  it('affiche la mention de ceinture gagnée le cas échéant', () => {
    render(<ResultBanner result={{ ...base, titleFight: true, wonBelt: true }} />)
    expect(screen.getByText(/remportes la ceinture/i)).toBeInTheDocument()
  })
})
