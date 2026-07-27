import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton (UX-DR12)', () => {
  it('signale un chargement accessible', () => {
    render(<Skeleton />)
    const el = screen.getByLabelText('Chargement')
    expect(el).toHaveAttribute('aria-busy', 'true')
  })
})
