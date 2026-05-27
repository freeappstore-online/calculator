export function calc(a: number, b: number, op: string): number {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : 0
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

export function cleanDisplay(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  const s = String(value)
  if (s.length <= 12) return s
  const precise = parseFloat(value.toPrecision(12))
  return String(precise)
}

export function canAddDecimal(display: string): boolean {
  return !display.includes('.')
}
