import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameRoot } from './GameRoot'
import { useGameStore } from '../store/game'

describe('GameRoot', () => {
  beforeEach(() => useGameStore.getState().reset())

  it('affiche l’écran de départ', () => {
    render(<GameRoot />)
    expect(screen.getByRole('heading', { name: /mma choice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /commencer/i })).toBeInTheDocument()
  })
})
