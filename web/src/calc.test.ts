import { describe, it, expect } from 'vitest'
import { calc, factorial, cleanDisplay, canAddDecimal, toRad, fromRad } from './calc'

describe('calc — basic arithmetic', () => {
  it('adds', () => {
    expect(calc(2, 3, '+')).toBe(5)
    expect(calc(-1, 1, '+')).toBe(0)
    expect(calc(0, 0, '+')).toBe(0)
  })

  it('subtracts', () => {
    expect(calc(10, 4, '−')).toBe(6)
    expect(calc(3, 5, '−')).toBe(-2)
  })

  it('multiplies', () => {
    expect(calc(3, 7, '×')).toBe(21)
    expect(calc(-3, -5, '×')).toBe(15)
    expect(calc(0, 999, '×')).toBe(0)
  })

  it('divides', () => {
    expect(calc(10, 4, '÷')).toBe(2.5)
    expect(calc(1, 3, '÷')).toBeCloseTo(0.333333, 5)
  })

  it('returns NaN for division by zero', () => {
    expect(calc(5, 0, '÷')).toBeNaN()
    expect(calc(0, 0, '÷')).toBeNaN()
    expect(calc(-1, 0, '÷')).toBeNaN()
  })

  it('handles power operator', () => {
    expect(calc(2, 10, 'xʸ')).toBe(1024)
    expect(calc(3, 0, 'xʸ')).toBe(1)
    expect(calc(5, -1, 'xʸ')).toBe(0.2)
    expect(calc(4, 0.5, 'xʸ')).toBe(2)
    expect(calc(0, 0, 'xʸ')).toBe(1)
  })

  it('returns b for unknown operator', () => {
    expect(calc(1, 2, '???')).toBe(2)
  })

  it('handles floating-point edge cases', () => {
    expect(calc(0.1, 0.2, '+')).toBeCloseTo(0.3, 15)
    expect(calc(0.3, 0.1, '−')).toBeCloseTo(0.2, 15)
    expect(calc(0.1, 0.1, '×')).toBeCloseTo(0.01, 15)
  })

  it('handles large numbers', () => {
    expect(calc(1e15, 1e15, '+')).toBe(2e15)
    expect(calc(1e100, 2, '×')).toBe(2e100)
  })
})

describe('factorial', () => {
  it('computes small factorials', () => {
    expect(factorial(0)).toBe(1)
    expect(factorial(1)).toBe(1)
    expect(factorial(2)).toBe(2)
    expect(factorial(3)).toBe(6)
    expect(factorial(5)).toBe(120)
    expect(factorial(10)).toBe(3628800)
  })

  it('computes 20!', () => {
    expect(factorial(20)).toBe(2432902008176640000)
  })

  it('returns NaN for negative numbers', () => {
    expect(factorial(-1)).toBeNaN()
    expect(factorial(-100)).toBeNaN()
  })

  it('returns NaN for non-integers', () => {
    expect(factorial(2.5)).toBeNaN()
    expect(factorial(0.1)).toBeNaN()
  })

  it('handles large factorials (overflow to Infinity)', () => {
    expect(factorial(171)).toBe(Infinity)
  })
})

describe('cleanDisplay', () => {
  it('leaves short numbers unchanged', () => {
    expect(cleanDisplay(42)).toBe('42')
    expect(cleanDisplay(3.14)).toBe('3.14')
    expect(cleanDisplay(0)).toBe('0')
    expect(cleanDisplay(1)).toBe('1')
    expect(cleanDisplay(-7)).toBe('-7')
  })

  it('cleans floating-point noise', () => {
    expect(cleanDisplay(0.1 + 0.2)).toBe('0.3')
    expect(cleanDisplay(0.3 - 0.1)).toBe('0.2')
    expect(cleanDisplay(1.1 + 2.2)).toBe('3.3')
  })

  it('shows Error for NaN', () => {
    expect(cleanDisplay(NaN)).toBe('Error')
  })

  it('shows Error for Infinity', () => {
    expect(cleanDisplay(Infinity)).toBe('Error')
    expect(cleanDisplay(-Infinity)).toBe('Error')
  })

  it('shows 0 for negative zero', () => {
    expect(cleanDisplay(-0)).toBe('0')
  })

  it('rounds near-zero values to 0', () => {
    expect(cleanDisplay(6.123233995736766e-17)).toBe('0')
    expect(cleanDisplay(-1e-13)).toBe('0')
    expect(cleanDisplay(1e-15)).toBe('0')
  })

  it('preserves small but meaningful values', () => {
    expect(cleanDisplay(0.001)).toBe('0.001')
    expect(cleanDisplay(1e-10)).toBe('1e-10')
    expect(cleanDisplay(-0.0001)).toBe('-0.0001')
  })

  it('handles scientific notation for large numbers', () => {
    expect(cleanDisplay(1e20)).toBe('100000000000000000000')
    expect(cleanDisplay(1e21)).toBe('1e+21')
  })

  it('truncates long decimal representations', () => {
    expect(cleanDisplay(Math.PI)).toBe('3.14159265359')
    expect(cleanDisplay(Math.E)).toBe('2.71828182846')
  })
})

describe('canAddDecimal', () => {
  it('allows decimal when none present', () => {
    expect(canAddDecimal('123')).toBe(true)
    expect(canAddDecimal('0')).toBe(true)
    expect(canAddDecimal('-5')).toBe(true)
  })

  it('blocks decimal when already present', () => {
    expect(canAddDecimal('1.5')).toBe(false)
    expect(canAddDecimal('0.')).toBe(false)
    expect(canAddDecimal('3.14159')).toBe(false)
  })

  it('handles empty string', () => {
    expect(canAddDecimal('')).toBe(true)
  })
})

describe('toRad / fromRad', () => {
  it('converts 0° to 0 rad', () => {
    expect(toRad(0)).toBe(0)
  })

  it('converts 180° to π rad', () => {
    expect(toRad(180)).toBeCloseTo(Math.PI, 10)
  })

  it('converts 90° to π/2 rad', () => {
    expect(toRad(90)).toBeCloseTo(Math.PI / 2, 10)
  })

  it('converts 360° to 2π rad', () => {
    expect(toRad(360)).toBeCloseTo(2 * Math.PI, 10)
  })

  it('converts 45° to π/4 rad', () => {
    expect(toRad(45)).toBeCloseTo(Math.PI / 4, 10)
  })

  it('round-trips degrees through toRad/fromRad', () => {
    for (const deg of [0, 30, 45, 60, 90, 120, 180, 270, 360]) {
      expect(fromRad(toRad(deg))).toBeCloseTo(deg, 10)
    }
  })

  it('converts π rad to 180°', () => {
    expect(fromRad(Math.PI)).toBeCloseTo(180, 10)
  })

  it('handles negative angles', () => {
    expect(toRad(-90)).toBeCloseTo(-Math.PI / 2, 10)
    expect(fromRad(-Math.PI)).toBeCloseTo(-180, 10)
  })
})

describe('trig functions via calc pipeline (deg mode)', () => {
  const sinDeg = (x: number) => Math.sin(toRad(x))
  const cosDeg = (x: number) => Math.cos(toRad(x))
  const tanDeg = (x: number) => Math.tan(toRad(x))

  it('sin(0°) = 0', () => {
    expect(cleanDisplay(sinDeg(0))).toBe('0')
  })

  it('sin(30°) = 0.5', () => {
    expect(cleanDisplay(sinDeg(30))).toBe('0.5')
  })

  it('sin(90°) = 1', () => {
    expect(cleanDisplay(sinDeg(90))).toBe('1')
  })

  it('cos(0°) = 1', () => {
    expect(cleanDisplay(cosDeg(0))).toBe('1')
  })

  it('cos(90°) = 0 (not 6.12e-17)', () => {
    expect(cleanDisplay(cosDeg(90))).toBe('0')
  })

  it('cos(60°) = 0.5', () => {
    expect(cleanDisplay(cosDeg(60))).toBe('0.5')
  })

  it('tan(45°) = 1', () => {
    expect(cleanDisplay(tanDeg(45))).toBe('1')
  })

  it('sin(180°) = 0 (not 1.22e-16)', () => {
    expect(cleanDisplay(sinDeg(180))).toBe('0')
  })

  it('cos(180°) = -1', () => {
    expect(cleanDisplay(cosDeg(180))).toBe('-1')
  })
})

describe('inverse trig via calc pipeline (deg mode)', () => {
  it('asin(1) = 90°', () => {
    expect(cleanDisplay(fromRad(Math.asin(1)))).toBe('90')
  })

  it('asin(0.5) = 30°', () => {
    expect(cleanDisplay(fromRad(Math.asin(0.5)))).toBe('30')
  })

  it('acos(0) = 90°', () => {
    expect(cleanDisplay(fromRad(Math.acos(0)))).toBe('90')
  })

  it('atan(1) = 45°', () => {
    expect(cleanDisplay(fromRad(Math.atan(1)))).toBe('45')
  })

  it('asin(2) = Error (out of domain)', () => {
    expect(cleanDisplay(fromRad(Math.asin(2)))).toBe('Error')
  })

  it('acos(-2) = Error (out of domain)', () => {
    expect(cleanDisplay(fromRad(Math.acos(-2)))).toBe('Error')
  })
})

describe('logarithm and exponential', () => {
  it('ln(1) = 0', () => {
    expect(cleanDisplay(Math.log(1))).toBe('0')
  })

  it('ln(e) = 1', () => {
    expect(cleanDisplay(Math.log(Math.E))).toBe('1')
  })

  it('ln(0) = Error (-Infinity)', () => {
    expect(cleanDisplay(Math.log(0))).toBe('Error')
  })

  it('ln(-1) = Error (NaN)', () => {
    expect(cleanDisplay(Math.log(-1))).toBe('Error')
  })

  it('log(1) = 0', () => {
    expect(cleanDisplay(Math.log10(1))).toBe('0')
  })

  it('log(100) = 2', () => {
    expect(cleanDisplay(Math.log10(100))).toBe('2')
  })

  it('log(1000) = 3', () => {
    expect(cleanDisplay(Math.log10(1000))).toBe('3')
  })

  it('e^0 = 1', () => {
    expect(cleanDisplay(Math.exp(0))).toBe('1')
  })

  it('e^1 ≈ 2.718', () => {
    expect(cleanDisplay(Math.exp(1))).toBe('2.71828182846')
  })

  it('10^2 = 100', () => {
    expect(cleanDisplay(Math.pow(10, 2))).toBe('100')
  })

  it('10^0 = 1', () => {
    expect(cleanDisplay(Math.pow(10, 0))).toBe('1')
  })
})

describe('roots and powers', () => {
  it('√4 = 2', () => {
    expect(cleanDisplay(Math.sqrt(4))).toBe('2')
  })

  it('√2 ≈ 1.414', () => {
    expect(cleanDisplay(Math.sqrt(2))).toBe('1.41421356237')
  })

  it('√0 = 0', () => {
    expect(cleanDisplay(Math.sqrt(0))).toBe('0')
  })

  it('√(-1) = Error', () => {
    expect(cleanDisplay(Math.sqrt(-1))).toBe('Error')
  })

  it('3² = 9', () => {
    expect(3 * 3).toBe(9)
  })

  it('2³ = 8', () => {
    expect(2 * 2 * 2).toBe(8)
  })

  it('1/4 = 0.25', () => {
    expect(cleanDisplay(1 / 4)).toBe('0.25')
  })

  it('1/3 clean display', () => {
    expect(cleanDisplay(1 / 3)).toBe('0.333333333333')
  })

  it('1/0 = Error', () => {
    expect(cleanDisplay(1 / 0)).toBe('Error')
  })
})

describe('division by zero through calc', () => {
  it('returns NaN → "Error"', () => {
    const result = calc(5, 0, '÷')
    expect(result).toBeNaN()
    expect(cleanDisplay(result)).toBe('Error')
  })

  it('0 ÷ 0 = Error', () => {
    expect(cleanDisplay(calc(0, 0, '÷'))).toBe('Error')
  })
})

describe('chained operations', () => {
  it('2 + 3 × (via operate) computes intermediate', () => {
    const afterPlus = 2
    const afterSecondOperand = 3
    const intermediate = calc(afterPlus, afterSecondOperand, '+')
    expect(intermediate).toBe(5)
  })

  it('power chains correctly', () => {
    expect(calc(2, 3, 'xʸ')).toBe(8)
    expect(calc(8, 2, 'xʸ')).toBe(64)
  })
})

describe('edge cases for cleanDisplay precision', () => {
  it('handles 0.1 * 3', () => {
    expect(cleanDisplay(0.1 * 3)).toBe('0.3')
  })

  it('handles 1.005 * 100', () => {
    const result = 1.005 * 100
    expect(cleanDisplay(result)).toBe('100.5')
  })

  it('rounds large integers beyond 12 significant digits', () => {
    expect(cleanDisplay(Number.MAX_SAFE_INTEGER)).toBe('9007199254740000')
  })

  it('preserves integers within 12 digits', () => {
    expect(cleanDisplay(123456789012)).toBe('123456789012')
  })
})
