import { describe, it, expect } from 'vitest'
import { formatCompact, formatMoney } from './labels'

describe('formatage compact des nombres', () => {
  it('laisse les petits nombres tels quels', () => {
    expect(formatCompact(0)).toBe('0')
    expect(formatCompact(950)).toBe('950')
  })

  it('abrège les milliers en « k » (1 décimale sous 10 k)', () => {
    expect(formatCompact(1000)).toBe('1 k')
    expect(formatCompact(1234)).toBe('1,2 k')
    expect(formatCompact(9900)).toBe('9,9 k')
    expect(formatCompact(12345)).toBe('12 k')
    expect(formatCompact(123456)).toBe('123 k')
  })

  it('abrège les millions en « M »', () => {
    expect(formatCompact(1000000)).toBe('1 M')
    expect(formatCompact(3400000)).toBe('3,4 M')
  })

  it('formate l’argent avec le symbole €', () => {
    expect(formatMoney(0)).toBe('0 €')
    expect(formatMoney(850)).toBe('850 €')
    expect(formatMoney(50000)).toBe('50 k €')
    expect(formatMoney(1200000)).toBe('1,2 M €')
  })
})
