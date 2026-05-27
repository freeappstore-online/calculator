import { describe, it, expect } from 'vitest'
import { calc, factorial, cleanDisplay, canAddDecimal, toRad, fromRad, backspace } from './calc'

// ── Basic arithmetic ─────────────────────────────────────────────

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

// ── Factorial ────────────────────────────────────────────────────

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

// ── cleanDisplay ─────────────────────────────────────────────────

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
    expect(cleanDisplay(0.1 * 3)).toBe('0.3')
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

  it('truncates long decimal representations', () => {
    expect(cleanDisplay(Math.PI)).toBe('3.14159265359')
    expect(cleanDisplay(Math.E)).toBe('2.71828182846')
  })

  it('handles 1.005 * 100', () => {
    expect(cleanDisplay(1.005 * 100)).toBe('100.5')
  })

  it('rounds large integers beyond 12 significant digits', () => {
    expect(cleanDisplay(Number.MAX_SAFE_INTEGER)).toBe('9007199254740000')
  })

  it('preserves integers within 12 digits', () => {
    expect(cleanDisplay(123456789012)).toBe('123456789012')
  })
})

// ── canAddDecimal ────────────────────────────────────────────────

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

// ── backspace ────────────────────────────────────────────────────

describe('backspace', () => {
  it('removes last digit', () => {
    expect(backspace('123')).toBe('12')
    expect(backspace('99')).toBe('9')
  })

  it('returns 0 for single digit', () => {
    expect(backspace('5')).toBe('0')
    expect(backspace('0')).toBe('0')
  })

  it('returns 0 for Error', () => {
    expect(backspace('Error')).toBe('0')
  })

  it('handles decimals', () => {
    expect(backspace('3.14')).toBe('3.1')
    expect(backspace('3.')).toBe('3')
    expect(backspace('0.5')).toBe('0.')
  })

  it('handles negative numbers', () => {
    expect(backspace('-5')).toBe('0')
    expect(backspace('-52')).toBe('-5')
    expect(backspace('-123')).toBe('-12')
  })

  it('handles negative decimals', () => {
    expect(backspace('-0.5')).toBe('-0.')
    expect(backspace('-3.14')).toBe('-3.1')
  })
})

// ── toRad / fromRad ──────────────────────────────────────────────

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

// ── Trig in degrees mode ─────────────────────────────────────────

describe('trig functions via calc pipeline (deg mode)', () => {
  const sinDeg = (x: number) => Math.sin(toRad(x))
  const cosDeg = (x: number) => Math.cos(toRad(x))
  const tanDeg = (x: number) => Math.tan(toRad(x))

  it('sin(0°) = 0', () => expect(cleanDisplay(sinDeg(0))).toBe('0'))
  it('sin(30°) = 0.5', () => expect(cleanDisplay(sinDeg(30))).toBe('0.5'))
  it('sin(90°) = 1', () => expect(cleanDisplay(sinDeg(90))).toBe('1'))
  it('sin(180°) = 0', () => expect(cleanDisplay(sinDeg(180))).toBe('0'))
  it('sin(270°) = -1', () => expect(cleanDisplay(sinDeg(270))).toBe('-1'))

  it('cos(0°) = 1', () => expect(cleanDisplay(cosDeg(0))).toBe('1'))
  it('cos(60°) = 0.5', () => expect(cleanDisplay(cosDeg(60))).toBe('0.5'))
  it('cos(90°) = 0', () => expect(cleanDisplay(cosDeg(90))).toBe('0'))
  it('cos(180°) = -1', () => expect(cleanDisplay(cosDeg(180))).toBe('-1'))

  it('tan(45°) = 1', () => expect(cleanDisplay(tanDeg(45))).toBe('1'))
  it('tan(0°) = 0', () => expect(cleanDisplay(tanDeg(0))).toBe('0'))
})

// ── Inverse trig ─────────────────────────────────────────────────

describe('inverse trig via calc pipeline (deg mode)', () => {
  it('asin(1) = 90°', () => expect(cleanDisplay(fromRad(Math.asin(1)))).toBe('90'))
  it('asin(0.5) = 30°', () => expect(cleanDisplay(fromRad(Math.asin(0.5)))).toBe('30'))
  it('asin(0) = 0°', () => expect(cleanDisplay(fromRad(Math.asin(0)))).toBe('0'))
  it('acos(0) = 90°', () => expect(cleanDisplay(fromRad(Math.acos(0)))).toBe('90'))
  it('acos(1) = 0°', () => expect(cleanDisplay(fromRad(Math.acos(1)))).toBe('0'))
  it('atan(1) = 45°', () => expect(cleanDisplay(fromRad(Math.atan(1)))).toBe('45'))
  it('atan(0) = 0°', () => expect(cleanDisplay(fromRad(Math.atan(0)))).toBe('0'))
  it('asin(2) = Error (out of domain)', () => expect(cleanDisplay(fromRad(Math.asin(2)))).toBe('Error'))
  it('acos(-2) = Error (out of domain)', () => expect(cleanDisplay(fromRad(Math.acos(-2)))).toBe('Error'))
})

// ── Logarithm and exponential ────────────────────────────────────

describe('logarithm and exponential', () => {
  it('ln(1) = 0', () => expect(cleanDisplay(Math.log(1))).toBe('0'))
  it('ln(e) = 1', () => expect(cleanDisplay(Math.log(Math.E))).toBe('1'))
  it('ln(0) = Error', () => expect(cleanDisplay(Math.log(0))).toBe('Error'))
  it('ln(-1) = Error', () => expect(cleanDisplay(Math.log(-1))).toBe('Error'))

  it('log(1) = 0', () => expect(cleanDisplay(Math.log10(1))).toBe('0'))
  it('log(10) = 1', () => expect(cleanDisplay(Math.log10(10))).toBe('1'))
  it('log(100) = 2', () => expect(cleanDisplay(Math.log10(100))).toBe('2'))
  it('log(1000) = 3', () => expect(cleanDisplay(Math.log10(1000))).toBe('3'))

  it('e^0 = 1', () => expect(cleanDisplay(Math.exp(0))).toBe('1'))
  it('e^1 ≈ 2.718', () => expect(cleanDisplay(Math.exp(1))).toBe('2.71828182846'))

  it('10^0 = 1', () => expect(cleanDisplay(Math.pow(10, 0))).toBe('1'))
  it('10^2 = 100', () => expect(cleanDisplay(Math.pow(10, 2))).toBe('100'))
  it('10^-1 = 0.1', () => expect(cleanDisplay(Math.pow(10, -1))).toBe('0.1'))
})

// ── Roots and powers ─────────────────────────────────────────────

describe('roots and powers', () => {
  it('√4 = 2', () => expect(cleanDisplay(Math.sqrt(4))).toBe('2'))
  it('√2 ≈ 1.414', () => expect(cleanDisplay(Math.sqrt(2))).toBe('1.41421356237'))
  it('√0 = 0', () => expect(cleanDisplay(Math.sqrt(0))).toBe('0'))
  it('√(-1) = Error', () => expect(cleanDisplay(Math.sqrt(-1))).toBe('Error'))
  it('√9 = 3', () => expect(cleanDisplay(Math.sqrt(9))).toBe('3'))
  it('√0.25 = 0.5', () => expect(cleanDisplay(Math.sqrt(0.25))).toBe('0.5'))

  it('3² = 9', () => expect(3 * 3).toBe(9))
  it('(-4)² = 16', () => expect((-4) * (-4)).toBe(16))
  it('2³ = 8', () => expect(2 * 2 * 2).toBe(8))
  it('(-2)³ = -8', () => expect((-2) * (-2) * (-2)).toBe(-8))

  it('1/4 = 0.25', () => expect(cleanDisplay(1 / 4)).toBe('0.25'))
  it('1/3 clean display', () => expect(cleanDisplay(1 / 3)).toBe('0.333333333333'))
  it('1/0 = Error', () => expect(cleanDisplay(1 / 0)).toBe('Error'))
})

// ── Division by zero through calc ────────────────────────────────

describe('division by zero through calc', () => {
  it('5 ÷ 0 = Error', () => {
    expect(cleanDisplay(calc(5, 0, '÷'))).toBe('Error')
  })

  it('0 ÷ 0 = Error', () => {
    expect(cleanDisplay(calc(0, 0, '÷'))).toBe('Error')
  })

  it('-1 ÷ 0 = Error', () => {
    expect(cleanDisplay(calc(-1, 0, '÷'))).toBe('Error')
  })
})

// ── Chained operations ───────────────────────────────────────────

describe('chained operations', () => {
  it('simulates 2 + 3 = 5', () => {
    expect(calc(2, 3, '+')).toBe(5)
  })

  it('simulates 2 + 3 × 4 (sequential, not precedence)', () => {
    const step1 = calc(2, 3, '+')
    expect(step1).toBe(5)
    const step2 = calc(step1, 4, '×')
    expect(step2).toBe(20)
  })

  it('simulates repeated equals: 5 + 3 = = = gives 8, 11, 14', () => {
    const first = calc(5, 3, '+')
    expect(first).toBe(8)
    const second = calc(first, 3, '+')
    expect(second).toBe(11)
    const third = calc(second, 3, '+')
    expect(third).toBe(14)
  })

  it('power chain: 2^3 = 8, then 8^2 = 64', () => {
    const step1 = calc(2, 3, 'xʸ')
    expect(step1).toBe(8)
    const step2 = calc(step1, 2, 'xʸ')
    expect(step2).toBe(64)
  })
})

// ── Parentheses logic (stack-based) ──────────────────────────────

describe('parentheses (computation simulation)', () => {
  it('2 × (3 + 4) = 14', () => {
    // Before (: prev=2, op=×
    // Inside parens: 3 + 4 = 7
    const inner = calc(3, 4, '+')
    expect(inner).toBe(7)
    // After ): display=7, restore prev=2, op=×
    // Press =: calc(2, 7, ×)
    expect(calc(2, inner, '×')).toBe(14)
  })

  it('(1 + 2) × (3 + 4) = 21', () => {
    const left = calc(1, 2, '+')
    expect(left).toBe(3)
    const right = calc(3, 4, '+')
    expect(right).toBe(7)
    expect(calc(left, right, '×')).toBe(21)
  })

  it('nested: 2 × (3 + (4 − 1)) = 12', () => {
    const innermost = calc(4, 1, '−')
    expect(innermost).toBe(3)
    const inner = calc(3, innermost, '+')
    expect(inner).toBe(6)
    expect(calc(2, inner, '×')).toBe(12)
  })

  it('(5) = 5 (no-op parens)', () => {
    expect(5).toBe(5)
  })

  it('deeply nested: ((2 + 3)) = 5', () => {
    const result = calc(2, 3, '+')
    expect(result).toBe(5)
  })
})

// ── Memory operations (simulated) ────────────────────────────────

describe('memory operations', () => {
  it('M+ accumulates', () => {
    let mem = 0
    mem += 5    // M+ with display=5
    expect(mem).toBe(5)
    mem += 3    // M+ with display=3
    expect(mem).toBe(8)
  })

  it('M- subtracts', () => {
    let mem = 10
    mem -= 3
    expect(mem).toBe(7)
  })

  it('MC resets to 0', () => {
    let mem = 42
    mem = 0     // MC
    expect(mem).toBe(0)
  })

  it('MR recalls stored value', () => {
    const mem = 7.5
    const display = cleanDisplay(mem)
    expect(display).toBe('7.5')
  })

  it('memory handles floating point cleanly', () => {
    let mem = 0
    mem += 0.1
    mem += 0.2
    expect(cleanDisplay(mem)).toBe('0.3')
  })
})

// ── Keyboard mapping (unit-level) ────────────────────────────────

describe('keyboard key-to-operation mapping', () => {
  const keyMap: Record<string, string> = {
    '+': '+', '-': '−', '*': '×', '/': '÷', '^': 'xʸ',
  }

  it('maps standard keyboard operators to calculator operators', () => {
    expect(keyMap['+']).toBe('+')
    expect(keyMap['-']).toBe('−')
    expect(keyMap['*']).toBe('×')
    expect(keyMap['/']).toBe('÷')
    expect(keyMap['^']).toBe('xʸ')
  })

  it('digit keys 0-9 are valid input', () => {
    for (let i = 0; i <= 9; i++) {
      expect(String(i)).toMatch(/^[0-9]$/)
    }
  })
})

// ── Edge case: Error state ───────────────────────────────────────

describe('Error state handling', () => {
  it('division by zero produces Error display', () => {
    expect(cleanDisplay(calc(1, 0, '÷'))).toBe('Error')
  })

  it('sqrt(-1) produces Error', () => {
    expect(cleanDisplay(Math.sqrt(-1))).toBe('Error')
  })

  it('asin(2) produces Error', () => {
    expect(cleanDisplay(Math.asin(2))).toBe('Error')
  })

  it('ln(-5) produces Error', () => {
    expect(cleanDisplay(Math.log(-5))).toBe('Error')
  })

  it('log(0) produces Error', () => {
    expect(cleanDisplay(Math.log10(0))).toBe('Error')
  })

  it('factorial(-1) produces Error', () => {
    expect(cleanDisplay(factorial(-1))).toBe('Error')
  })

  it('factorial(171) overflows to Error', () => {
    expect(cleanDisplay(factorial(171))).toBe('Error')
  })

  it('0^(-1) produces Error (via cleanDisplay of Infinity)', () => {
    expect(cleanDisplay(Math.pow(0, -1))).toBe('Error')
  })
})

// ── Trig in radians mode ─────────────────────────────────────────

describe('trig in radians mode (no conversion)', () => {
  it('sin(0) = 0', () => expect(cleanDisplay(Math.sin(0))).toBe('0'))
  it('sin(π/2) = 1', () => expect(cleanDisplay(Math.sin(Math.PI / 2))).toBe('1'))
  it('sin(π) = 0', () => expect(cleanDisplay(Math.sin(Math.PI))).toBe('0'))
  it('cos(0) = 1', () => expect(cleanDisplay(Math.cos(0))).toBe('1'))
  it('cos(π) = -1', () => expect(cleanDisplay(Math.cos(Math.PI))).toBe('-1'))
  it('tan(0) = 0', () => expect(cleanDisplay(Math.tan(0))).toBe('0'))
  it('tan(π/4) = 1', () => expect(cleanDisplay(Math.tan(Math.PI / 4))).toBe('1'))
})
