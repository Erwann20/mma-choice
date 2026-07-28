import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './game'

describe('historique des carrières', () => {
  beforeEach(() => useGameStore.setState({ session: null, archive: [] }))

  it('archive une carrière terminée (retraite) au reset', () => {
    useGameStore.getState().newCareer(undefined, 1)
    useGameStore.getState().retire()
    expect(useGameStore.getState().session?.game.phase).toBe('retired')
    useGameStore.getState().reset()
    const archive = useGameStore.getState().archive
    expect(archive).toHaveLength(1)
    expect(archive[0].game.phase).toBe('retired')
    expect(archive[0].id).toContain('1-')
  })

  it("n'archive pas une carrière encore en cours", () => {
    useGameStore.getState().newCareer(undefined, 2)
    useGameStore.getState().reset()
    expect(useGameStore.getState().archive).toHaveLength(0)
  })

  it('archive la carrière terminée quand on en démarre une nouvelle', () => {
    useGameStore.getState().newCareer(undefined, 3)
    useGameStore.getState().retire()
    useGameStore.getState().newCareer(undefined, 4)
    expect(useGameStore.getState().archive).toHaveLength(1)
    expect(useGameStore.getState().session?.game.phase).toBe('career')
  })

  it('supprime une carrière de l’historique', () => {
    useGameStore.getState().newCareer(undefined, 5)
    useGameStore.getState().retire()
    useGameStore.getState().reset()
    const id = useGameStore.getState().archive[0].id
    useGameStore.getState().deleteArchived(id)
    expect(useGameStore.getState().archive).toHaveLength(0)
  })
})
