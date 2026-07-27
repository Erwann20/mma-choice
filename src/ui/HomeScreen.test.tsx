import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen (UX-DR13)', () => {
  it('affiche 3 modes dont 2 marqués « Bientôt »', () => {
    render(<HomeScreen onStart={() => {}} />)
    expect(screen.getByRole('button', { name: /faire ma carrière/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Bientôt/i).length).toBeGreaterThanOrEqual(2)
  })

  it('le mode carrière lance la création', () => {
    const onStart = vi.fn()
    render(<HomeScreen onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /faire ma carrière/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('un mode « Bientôt » affiche un acquittement inline sans naviguer', () => {
    const onStart = vi.fn()
    render(<HomeScreen onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /revivre la carrière/i }))
    expect(screen.getByText(/bientôt disponible/i)).toBeInTheDocument()
    expect(onStart).not.toHaveBeenCalled()
  })
})
