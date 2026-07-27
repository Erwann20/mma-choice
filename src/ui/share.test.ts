import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildShareText, shareScore } from './share'
import { createInitialState } from '../engine'
import type { GameState } from '../engine'

function sampleGame(): GameState {
  const g = createInitialState(1)
  return { ...g, fighter: { ...g.fighter, name: 'Rocky' }, record: { wins: 10, losses: 2, finishes: 5 } }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('partage du score (FR-14, UX-DR15)', () => {
  it('construit une carte de score lisible', () => {
    const text = buildShareText(sampleGame())
    expect(text).toContain('Rocky')
    expect(text).toContain('/100')
    expect(text).toContain('10-2')
  })

  it('utilise Web Share API si disponible', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share })
    expect(await shareScore(sampleGame())).toBe('shared')
    expect(share).toHaveBeenCalledOnce()
  })

  it('retombe sur le presse-papiers sans Web Share API (AD-9, côté client)', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await shareScore(sampleGame())).toBe('copied')
    expect(writeText).toHaveBeenCalledOnce()
  })

  it('renvoie « failed » si aucun canal de partage', async () => {
    vi.stubGlobal('navigator', {})
    expect(await shareScore(sampleGame())).toBe('failed')
  })
})
