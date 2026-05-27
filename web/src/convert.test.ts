import { describe, it, expect } from 'vitest'
import { convert, categories } from './convert'

function cat(id: string) {
  return categories.find(c => c.id === id)!
}

describe('length conversions', () => {
  const length = cat('length')

  it('meters to meters = identity', () => {
    expect(convert(1, 'm', 'm', length)).toBe(1)
  })

  it('1 km = 1000 m', () => {
    expect(convert(1, 'km', 'm', length)).toBe(1000)
  })

  it('1 m = 100 cm', () => {
    expect(convert(1, 'm', 'cm', length)).toBe(100)
  })

  it('1 mi ≈ 1609.344 m', () => {
    expect(convert(1, 'mi', 'm', length)).toBeCloseTo(1609.344, 3)
  })

  it('1 ft = 12 in', () => {
    expect(convert(1, 'ft', 'in', length)).toBeCloseTo(12, 5)
  })

  it('1 yd = 3 ft', () => {
    expect(convert(1, 'yd', 'ft', length)).toBeCloseTo(3, 5)
  })

  it('1 in = 2.54 cm', () => {
    expect(convert(1, 'in', 'cm', length)).toBeCloseTo(2.54, 5)
  })

  it('1 mi = 5280 ft', () => {
    expect(convert(1, 'mi', 'ft', length)).toBeCloseTo(5280, 1)
  })
})

describe('weight conversions', () => {
  const weight = cat('weight')

  it('1 kg = 1000 g', () => {
    expect(convert(1, 'kg', 'g', weight)).toBe(1000)
  })

  it('1 lb ≈ 0.4536 kg', () => {
    expect(convert(1, 'lb', 'kg', weight)).toBeCloseTo(0.45359237, 5)
  })

  it('1 lb = 16 oz', () => {
    expect(convert(1, 'lb', 'oz', weight)).toBeCloseTo(16, 3)
  })

  it('1 ton = 1000 kg', () => {
    expect(convert(1, 'ton', 'kg', weight)).toBe(1000)
  })

  it('1 kg = 1000000 mg', () => {
    expect(convert(1, 'kg', 'mg', weight)).toBe(1000000)
  })
})

describe('temperature conversions', () => {
  const temp = cat('temperature')

  it('0°C = 32°F', () => {
    expect(convert(0, 'c', 'f', temp)).toBeCloseTo(32, 5)
  })

  it('100°C = 212°F', () => {
    expect(convert(100, 'c', 'f', temp)).toBeCloseTo(212, 5)
  })

  it('32°F = 0°C', () => {
    expect(convert(32, 'f', 'c', temp)).toBeCloseTo(0, 5)
  })

  it('0°C = 273.15 K', () => {
    expect(convert(0, 'c', 'k', temp)).toBeCloseTo(273.15, 5)
  })

  it('0 K = -273.15°C', () => {
    expect(convert(0, 'k', 'c', temp)).toBeCloseTo(-273.15, 5)
  })

  it('-40°C = -40°F', () => {
    expect(convert(-40, 'c', 'f', temp)).toBeCloseTo(-40, 5)
  })

  it('round-trip °C → °F → °C', () => {
    expect(convert(convert(37, 'c', 'f', temp), 'f', 'c', temp)).toBeCloseTo(37, 10)
  })

  it('round-trip °C → K → °C', () => {
    expect(convert(convert(25, 'c', 'k', temp), 'k', 'c', temp)).toBeCloseTo(25, 10)
  })
})

describe('volume conversions', () => {
  const volume = cat('volume')

  it('1 L = 1000 mL', () => {
    expect(convert(1, 'l', 'ml', volume)).toBe(1000)
  })

  it('1 gal ≈ 3.785 L', () => {
    expect(convert(1, 'gal', 'l', volume)).toBeCloseTo(3.785411784, 5)
  })

  it('1 gal = 4 qt', () => {
    expect(convert(1, 'gal', 'qt', volume)).toBeCloseTo(4, 3)
  })

  it('1 qt = 2 pt', () => {
    expect(convert(1, 'qt', 'pt', volume)).toBeCloseTo(2, 3)
  })

  it('1 cup = 8 fl oz', () => {
    expect(convert(1, 'cup', 'floz', volume)).toBeCloseTo(8, 3)
  })
})

describe('speed conversions', () => {
  const speed = cat('speed')

  it('1 m/s = 3.6 km/h', () => {
    expect(convert(1, 'ms', 'kmh', speed)).toBeCloseTo(3.6, 5)
  })

  it('100 km/h ≈ 62.137 mph', () => {
    expect(convert(100, 'kmh', 'mph', speed)).toBeCloseTo(62.137, 2)
  })

  it('1 kn ≈ 1.852 km/h', () => {
    expect(convert(1, 'kn', 'kmh', speed)).toBeCloseTo(1.852, 2)
  })

  it('round-trip km/h → mph → km/h', () => {
    expect(convert(convert(120, 'kmh', 'mph', speed), 'mph', 'kmh', speed)).toBeCloseTo(120, 8)
  })
})

describe('edge cases', () => {
  const length = cat('length')

  it('0 converts to 0', () => {
    expect(convert(0, 'km', 'mi', length)).toBe(0)
  })

  it('negative values convert correctly', () => {
    expect(convert(-5, 'km', 'm', length)).toBe(-5000)
  })

  it('unknown unit returns NaN', () => {
    expect(convert(1, 'bogus', 'm', length)).toBeNaN()
  })
})
