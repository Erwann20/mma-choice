import { describe, it, expect, beforeEach } from 'vitest'
import { loadEvents, loadIcons, loadDivisions } from '../schema'
import { startIconCareer } from './session'
import { useGameStore } from './game'

const icons = loadIcons()

describe('mode Revivre la carrière (icônes)', () => {
  it('charge 5 icônes valides — divisions existantes et sexe cohérent', () => {
    expect(icons).toHaveLength(5)
    const divs = loadDivisions()
    for (const icon of icons) {
      const d = divs.find((x) => x.id === icon.division)
      expect(d, `division ${icon.division} (${icon.id})`).toBeTruthy()
      expect(d?.sex).toBe(icon.sex)
    }
  })

  it('démarre une carrière avec le profil de l’icône (nom, style, pays, forces)', () => {
    const notorious = icons.find((i) => i.id === 'notorious')
    if (!notorious) throw new Error('icône notorious introuvable')
    const s = startIconCareer(loadEvents(), 1, notorious)
    expect(s.game.fighter.name).toBe('Conor McGregor')
    expect(s.game.style).toBe('striker')
    expect(s.game.fighter.country).toBe('Irlande')
    expect(s.game.division).toBe('lightweight-m')
    expect(s.game.stats.striking).toBeGreaterThan(60) // base 40 + bonus
    expect(s.game.flags['icon_notorious']).toBe(true)
    expect(s.current).not.toBeNull()
  })

  it('respecte le profil féminin (Amanda Nunes)', () => {
    const lioness = icons.find((i) => i.id === 'lioness')
    if (!lioness) throw new Error('icône lioness introuvable')
    const s = startIconCareer(loadEvents(), 2, lioness)
    expect(s.game.fighter.sex).toBe('F')
    expect(s.game.division).toBe('bantamweight-f')
  })
})

describe('store — replayIcon', () => {
  beforeEach(() => useGameStore.setState({ session: null, archive: [] }))

  it('démarre le mode icône et archive la carrière terminée précédente', () => {
    useGameStore.getState().replayIcon(icons[0], 1)
    expect(useGameStore.getState().session?.game.fighter.name).toBe(icons[0].name)
    useGameStore.getState().retire()
    useGameStore.getState().replayIcon(icons[1], 2)
    expect(useGameStore.getState().archive).toHaveLength(1)
    expect(useGameStore.getState().session?.game.phase).toBe('career')
  })
})
