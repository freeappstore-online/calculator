export function calc(a: number, b: number, op: string): number {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : NaN
    case 'xʸ': return Math.pow(a, b)
    default: return b
  }
}

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

const NEAR_ZERO = 1e-12

export function cleanDisplay(value: number): string {
  if (Number.isNaN(value)) return 'Error'
  if (!Number.isFinite(value)) return 'Error'
  if (value !== 0 && Math.abs(value) < NEAR_ZERO) return '0'
  if (Object.is(value, -0)) return '0'
  const s = String(value)
  if (s.length <= 12) return s
  const precise = parseFloat(value.toPrecision(12))
  if (Math.abs(precise) < NEAR_ZERO) return '0'
  return String(precise)
}

export function canAddDecimal(display: string): boolean {
  return !display.includes('.')
}

export function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function fromRad(radians: number): number {
  return (radians * 180) / Math.PI
}
