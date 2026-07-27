import { describe, it, expect } from 'vitest'
import { initRng, nextInt } from './rng'

describe('rng', () => {
  it('ne mute pas l’état reçu : même entrée => même tirage', () => {
    const s = initRng(42)
    const [a] = nextInt(s, 1, 100)
    const [b] = nextInt(s, 1, 100)
    expect(a).toBe(b)
  })

  it('round-trip : l’état renvoyé (sérialisable) reproduit la même suite', () => {
    const s0 = initRng(7)
    const [, s1] = nextInt(s0, 1, 1000)
    const [x] = nextInt(s1, 1, 1000)
    const [y] = nextInt(s1, 1, 1000)
    expect(x).toBe(y)
    expect(Array.isArray(s1)).toBe(true)
    // sérialisable JSON (AD-7)
    expect(nextInt(JSON.parse(JSON.stringify(s1)), 1, 1000)[0]).toBe(x)
  })

  it('deux graines différentes divergent', () => {
    expect(nextInt(initRng(1), 1, 1_000_000)[0]).not.toBe(nextInt(initRng(2), 1, 1_000_000)[0])
  })
})
