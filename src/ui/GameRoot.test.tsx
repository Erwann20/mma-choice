import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GameRoot } from './GameRoot'
import { useGameStore } from '../store/game'

describe('GameRoot', () => {
  beforeEach(() => useGameStore.getState().reset())

  it('ouvre sur la page de choix du sport (MMA jouable, autres « Bientôt »)', () => {
    render(<GameRoot />)
    expect(screen.getByRole('heading', { name: /sport choice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^MMA/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Basket/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vélo.*bientôt/i })).toBeInTheDocument()
  })

  it('mène au hub MMA (mode carrière) après avoir choisi le MMA', () => {
    render(<GameRoot />)
    fireEvent.click(screen.getByRole('button', { name: /^MMA/ }))
    expect(screen.getByRole('button', { name: /faire ma carrière/i })).toBeInTheDocument()
  })
})
