export interface UnitDef {
  id: string
  label: string
  symbol: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

export interface Category {
  id: string
  name: string
  units: UnitDef[]
}

function linear(factor: number): Pick<UnitDef, 'toBase' | 'fromBase'> {
  return { toBase: v => v * factor, fromBase: v => v / factor }
}

export const categories: Category[] = [
  {
    id: 'length', name: 'Length',
    units: [
      { id: 'mm', label: 'Millimeters', symbol: 'mm', ...linear(0.001) },
      { id: 'cm', label: 'Centimeters', symbol: 'cm', ...linear(0.01) },
      { id: 'm', label: 'Meters', symbol: 'm', ...linear(1) },
      { id: 'km', label: 'Kilometers', symbol: 'km', ...linear(1000) },
      { id: 'in', label: 'Inches', symbol: 'in', ...linear(0.0254) },
      { id: 'ft', label: 'Feet', symbol: 'ft', ...linear(0.3048) },
      { id: 'yd', label: 'Yards', symbol: 'yd', ...linear(0.9144) },
      { id: 'mi', label: 'Miles', symbol: 'mi', ...linear(1609.344) },
    ],
  },
  {
    id: 'weight', name: 'Weight',
    units: [
      { id: 'mg', label: 'Milligrams', symbol: 'mg', ...linear(0.000001) },
      { id: 'g', label: 'Grams', symbol: 'g', ...linear(0.001) },
      { id: 'kg', label: 'Kilograms', symbol: 'kg', ...linear(1) },
      { id: 'lb', label: 'Pounds', symbol: 'lb', ...linear(0.45359237) },
      { id: 'oz', label: 'Ounces', symbol: 'oz', ...linear(0.028349523125) },
      { id: 'ton', label: 'Metric Tons', symbol: 't', ...linear(1000) },
    ],
  },
  {
    id: 'temperature', name: 'Temperature',
    units: [
      { id: 'c', label: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v },
      { id: 'f', label: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
      { id: 'k', label: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  {
    id: 'volume', name: 'Volume',
    units: [
      { id: 'ml', label: 'Milliliters', symbol: 'mL', ...linear(0.001) },
      { id: 'l', label: 'Liters', symbol: 'L', ...linear(1) },
      { id: 'gal', label: 'Gallons (US)', symbol: 'gal', ...linear(3.785411784) },
      { id: 'qt', label: 'Quarts (US)', symbol: 'qt', ...linear(0.946352946) },
      { id: 'pt', label: 'Pints (US)', symbol: 'pt', ...linear(0.473176473) },
      { id: 'cup', label: 'Cups (US)', symbol: 'cup', ...linear(0.2365882365) },
      { id: 'floz', label: 'Fluid Ounces (US)', symbol: 'fl oz', ...linear(0.0295735295625) },
    ],
  },
  {
    id: 'speed', name: 'Speed',
    units: [
      { id: 'ms', label: 'Meters/second', symbol: 'm/s', ...linear(1) },
      { id: 'kmh', label: 'Kilometers/hour', symbol: 'km/h', ...linear(1 / 3.6) },
      { id: 'mph', label: 'Miles/hour', symbol: 'mph', ...linear(0.44704) },
      { id: 'kn', label: 'Knots', symbol: 'kn', ...linear(0.514444) },
    ],
  },
]

export function convert(value: number, fromId: string, toId: string, category: Category): number {
  const from = category.units.find(u => u.id === fromId)
  const to = category.units.find(u => u.id === toId)
  if (!from || !to) return NaN
  return to.fromBase(from.toBase(value))
}
