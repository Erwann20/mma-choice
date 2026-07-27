import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecapScreen } from './RecapScreen'
import { createInitialState, computeScore } from '../engine'

describe('RecapScreen', () => {
  it('affiche le score /100, le rang et déclenche une nouvelle carrière', () => {
    const game = createInitialState(1)
    const onNew = vi.fn()
    render(<RecapScreen game={game} onNew={onNew} />)
    expect(screen.getByText(String(computeScore(game)))).toBeInTheDocument()
    expect(screen.getByText(/meilleur combattant de tous les temps/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /nouvelle carrière/i }))
    expect(onNew).toHaveBeenCalled()
  })

  it("propose un retour à l'accueil", () => {
    const onHome = vi.fn()
    render(<RecapScreen game={createInitialState(1)} onNew={() => {}} onHome={onHome} />)
    fireEvent.click(screen.getByRole('button', { name: /retour à l'accueil/i }))
    expect(onHome).toHaveBeenCalled()
  })
})
