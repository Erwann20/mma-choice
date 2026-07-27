import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameRoot } from './GameRoot'
import { useGameStore } from '../store/game'

describe('GameRoot', () => {
  beforeEach(() => useGameStore.getState().reset())

  it('affiche l’écran d’accueil avec le mode carrière', () => {
    render(<GameRoot />)
    expect(screen.getByRole('heading', { name: /mma choice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /faire ma carrière/i })).toBeInTheDocument()
  })
})
