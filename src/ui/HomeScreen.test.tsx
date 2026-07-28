import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen (UX-DR13)', () => {
  it('affiche les trois modes de jeu (hub avec mission du jour)', () => {
    render(<HomeScreen onStart={() => {}} onDaily={() => {}} />)
    expect(screen.getByRole('button', { name: /faire ma carrière/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /revivre la carrière/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mission du jour/i })).toBeInTheDocument()
  })

  it('le hub basket masque la mission du jour', () => {
    render(<HomeScreen sport="basket" onStart={() => {}} />)
    expect(screen.getByRole('button', { name: /faire ma carrière/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mission du jour/i })).toBeNull()
  })

  it('le mode carrière lance la création', () => {
    const onStart = vi.fn()
    render(<HomeScreen onStart={onStart} />)
    fireEvent.click(screen.getByRole('button', { name: /faire ma carrière/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('le mode « Revivre la carrière » déclenche onReplay', () => {
    const onStart = vi.fn()
    const onReplay = vi.fn()
    render(<HomeScreen onStart={onStart} onReplay={onReplay} />)
    fireEvent.click(screen.getByRole('button', { name: /revivre la carrière/i }))
    expect(onReplay).toHaveBeenCalledOnce()
    expect(onStart).not.toHaveBeenCalled()
  })

  it('le mode « Mission du jour » déclenche onDaily', () => {
    const onDaily = vi.fn()
    render(<HomeScreen onStart={() => {}} onDaily={onDaily} />)
    fireEvent.click(screen.getByRole('button', { name: /mission du jour/i }))
    expect(onDaily).toHaveBeenCalledOnce()
  })

  it('propose de reprendre la carrière en pause', () => {
    const onResume = vi.fn()
    render(<HomeScreen onStart={() => {}} onResume={onResume} resumeName="Tyrone Larsson" />)
    expect(screen.getByText('Tyrone Larsson')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reprendre ma carrière/i }))
    expect(onResume).toHaveBeenCalledOnce()
  })

  it('sans carrière en pause, aucune carte de reprise', () => {
    render(<HomeScreen onStart={() => {}} />)
    expect(screen.queryByRole('button', { name: /reprendre ma carrière/i })).toBeNull()
  })

  it('une mission du jour déjà tentée affiche le score et ne relance pas', () => {
    const onDaily = vi.fn()
    render(<HomeScreen onStart={() => {}} onDaily={onDaily} dailyDoneScore={62} />)
    expect(screen.getByText(/Score du jour : 62/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /mission du jour/i }))
    expect(onDaily).not.toHaveBeenCalled()
  })
})
