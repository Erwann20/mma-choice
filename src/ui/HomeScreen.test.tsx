import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen', () => {
  it('affiche le titre du jeu', () => {
    render(<HomeScreen />)
    expect(screen.getByRole('heading', { name: /mma choice/i })).toBeInTheDocument()
  })
})
