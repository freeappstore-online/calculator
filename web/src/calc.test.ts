import { describe, it, expect } from 'vitest'
import { calc, factorial, cleanDisplay, canAddDecimal } from './calc'

describe('calc', () => {
  it('adds two numbers', () => {
    expect(calc(2, 3, '+')).toBe(5)
  })

  it('subtracts', () => {
    expect(calc(10, 4, '−')).toBe(6)
  })

  it('multiplies', () => {
    expect(calc(3, 7, '×')).toBe(21)
  })

  it('divides', () => {
    expect(calc(10, 4, '÷')).toBe(2.5)
  })

  it('returns 0 for division by zero', () => {
    expect(calc(5, 0, '÷')).toBe(0)
  })

  it('handles power operator', () => {
    expect(calc(2, 10, 'xʸ')).toBe(1024)
    expect(calc(3, 0, 'xʸ')).toBe(1)
    expect(calc(5, -1, 'xʸ')).toBe(0.2)
  })

  it('returns b for unknown operator', () => {
    expect(calc(1, 2, '???')).toBe(2)
  })

  it('handles negative numbers', () => {
    expect(calc(-3, 5, '+')).toBe(2)
    expect(calc(-3, -5, '×')).toBe(15)
  })

  it('handles decimals', () => {
    expect(calc(0.1, 0.2, '+')).toBeCloseTo(0.3)
  })
})

describe('factorial', () => {
  it('computes 0! = 1', () => {
    expect(factorial(0)).toBe(1)
  })

  it('computes 1! = 1', () => {
    expect(factorial(1)).toBe(1)
  })

  it('computes 5! = 120', () => {
    expect(factorial(5)).toBe(120)
  })

  it('computes 10! = 3628800', () => {
    expect(factorial(10)).toBe(3628800)
  })

  it('returns NaN for negative numbers', () => {
    expect(factorial(-1)).toBeNaN()
  })

  it('returns NaN for non-integers', () => {
    expect(factorial(2.5)).toBeNaN()
  })
})

describe('cleanDisplay', () => {
  it('leaves short numbers unchanged', () => {
    expect(cleanDisplay(42)).toBe('42')
    expect(cleanDisplay(3.14)).toBe('3.14')
    expect(cleanDisplay(0)).toBe('0')
  })

  it('cleans floating-point noise', () => {
    const result = 0.1 + 0.2
    expect(cleanDisplay(result)).toBe('0.3')
  })

  it('cleans another floating-point case', () => {
    const result = 0.3 - 0.1
    expect(cleanDisplay(result)).toBe('0.2')
  })

  it('preserves Infinity', () => {
    expect(cleanDisplay(Infinity)).toBe('Infinity')
    expect(cleanDisplay(-Infinity)).toBe('-Infinity')
  })

  it('preserves NaN', () => {
    expect(cleanDisplay(NaN)).toBe('NaN')
  })

  it('preserves negative zero display', () => {
    expect(cleanDisplay(-0)).toBe('0')
  })
})

describe('canAddDecimal', () => {
  it('allows decimal when none present', () => {
    expect(canAddDecimal('123')).toBe(true)
    expect(canAddDecimal('0')).toBe(true)
  })

  it('blocks decimal when already present', () => {
    expect(canAddDecimal('1.5')).toBe(false)
    expect(canAddDecimal('0.')).toBe(false)
    expect(canAddDecimal('3.14159')).toBe(false)
  })
})
