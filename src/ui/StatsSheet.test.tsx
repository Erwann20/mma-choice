import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatsSheet } from './StatsSheet'
import { createInitialState } from '../engine'

describe('StatsSheet', () => {
  it('affiche les stats de combat et se ferme', () => {
    const onClose = vi.fn()
    render(<StatsSheet game={createInitialState(1)} onClose={onClose} />)
    expect(screen.getByRole('dialog', { name: /statistiques/i })).toBeInTheDocument()
    expect(screen.getByText('Frappe')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /fermer/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
