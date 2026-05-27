import { useState, useEffect, useCallback } from 'react'
import { Shell } from './components/Shell'
import { calc, factorial, cleanDisplay, canAddDecimal, toRad, fromRad } from './calc'

export interface HistoryEntry {
  expression: string
  result: string
  timestamp: number
}

export type CalcMode = 'basic' | 'scientific'

const STORAGE_KEY = 'calculator-state'
const HISTORY_KEY = 'calculator-history'
const MODE_KEY = 'calculator-mode'
const MAX_HISTORY = 50

function loadState(): { display: string; prev: number | null; op: string | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}

function loadMode(): CalcMode {
  try {
    const raw = localStorage.getItem(MODE_KEY)
    return raw === 'scientific' ? 'scientific' : 'basic'
  } catch { return 'basic' }
}

export default function App() {
  const [display, setDisplay] = useState(() => {
    const s = loadState()
    return s?.display ?? '0'
  })
  const [prev, setPrev] = useState<number | null>(() => {
    const s = loadState()
    return s?.prev ?? null
  })
  const [op, setOp] = useState<string | null>(() => {
    const s = loadState()
    return s?.op ?? null
  })
  const [fresh, setFresh] = useState(true)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [mode, setMode] = useState<CalcMode>(loadMode)
  const [useDeg, setUseDeg] = useState(true)
  const [inv, setInv] = useState(false)
  const [lastOperand, setLastOperand] = useState<number | null>(null)
  const [lastOp, setLastOp] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ display, prev, op }))
  }, [display, prev, op])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode)
  }, [mode])

  const isError = display === 'Error'

  const input = (digit: string) => {
    if (isError && !fresh) {
      setDisplay(digit === '.' ? '0.' : digit)
      setFresh(false)
      return
    }
    if (digit === '.' && !canAddDecimal(fresh ? '' : display)) return
    if (fresh) {
      setDisplay(digit === '.' ? '0.' : digit)
      setFresh(false)
    } else {
      setDisplay(display === '0' && digit !== '.' ? digit : display + digit)
    }
  }

  const operate = (nextOp: string) => {
    if (isError) return
    const current = parseFloat(display)
    if (prev !== null && op && !fresh) {
      const result = calc(prev, current, op)
      setDisplay(cleanDisplay(result))
      setPrev(result)
    } else {
      setPrev(current)
    }
    setOp(nextOp)
    setFresh(true)
    setLastOperand(null)
    setLastOp(null)
  }

  const equals = () => {
    if (isError) return
    const current = parseFloat(display)

    if (prev !== null && op) {
      const result = calc(prev, current, op)
      const resultStr = cleanDisplay(result)
      setDisplay(resultStr)
      setHistory(h => [
        { expression: `${cleanDisplay(prev)} ${op} ${cleanDisplay(current)}`, result: resultStr, timestamp: Date.now() },
        ...h,
      ].slice(0, MAX_HISTORY))
      setLastOperand(current)
      setLastOp(op)
      setPrev(null)
      setOp(null)
      setFresh(true)
    } else if (lastOp && lastOperand !== null) {
      const result = calc(current, lastOperand, lastOp)
      const resultStr = cleanDisplay(result)
      setDisplay(resultStr)
      setHistory(h => [
        { expression: `${cleanDisplay(current)} ${lastOp} ${cleanDisplay(lastOperand)}`, result: resultStr, timestamp: Date.now() },
        ...h,
      ].slice(0, MAX_HISTORY))
      setFresh(true)
    }
  }

  const clear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setFresh(true)
    setLastOperand(null)
    setLastOp(null)
  }

  const percent = () => {
    if (isError) return
    setDisplay(cleanDisplay(parseFloat(display) / 100))
    setFresh(true)
  }

  const negate = () => {
    if (isError) return
    setDisplay(cleanDisplay(-parseFloat(display)))
  }

  const applyUnary = (label: string, fn: (x: number) => number) => {
    if (isError) return
    const x = parseFloat(display)
    const result = fn(x)
    const resultStr = cleanDisplay(result)
    setDisplay(resultStr)
    setHistory(h => [
      { expression: `${label}(${cleanDisplay(x)})`, result: resultStr, timestamp: Date.now() },
      ...h,
    ].slice(0, MAX_HISTORY))
    setFresh(true)
  }

  const degToRad = (x: number) => useDeg ? toRad(x) : x
  const radToDeg = (x: number) => useDeg ? fromRad(x) : x

  const insertConstant = (value: number) => {
    setDisplay(cleanDisplay(value))
    setFresh(true)
  }

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setDisplay(entry.result)
    setPrev(null)
    setOp(null)
    setFresh(true)
  }, [])

  const toggleMode = useCallback((m: CalcMode) => {
    setMode(m)
    setInv(false)
  }, [])

  return (
    <Shell
      history={history}
      onClearHistory={clearHistory}
      onSelectHistory={loadFromHistory}
      mode={mode}
      onModeChange={toggleMode}
    >
      <div className="flex flex-1 items-center justify-center p-4">
        <div className={mode === 'scientific' ? 'w-full max-w-sm' : 'w-full max-w-xs'}>
          <div
            className="mb-4 rounded-2xl px-5 py-4 text-right"
            style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
          >
            <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {prev !== null ? `${cleanDisplay(prev)} ${op}` : ' '}
            </div>
            <div
              className="display-font mt-1 font-bold"
              style={{
                color: isError ? 'var(--error)' : 'var(--ink)',
                fontSize: display.length > 10 ? '1.5rem' : display.length > 7 ? '2rem' : '2.5rem',
              }}
            >
              {display}
            </div>
          </div>

          {mode === 'scientific' && (
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              <CalcBtn
                label="2nd"
                style="function"
                onClick={() => setInv(!inv)}
                active={inv}
                small
              />
              <CalcBtn
                label={useDeg ? 'DEG' : 'RAD'}
                style="function"
                onClick={() => setUseDeg(!useDeg)}
                small
              />
              <CalcBtn label="π" style="function" onClick={() => insertConstant(Math.PI)} small />
              <CalcBtn label="e" style="function" onClick={() => insertConstant(Math.E)} small />
              <CalcBtn label="x!" style="function" onClick={() => applyUnary('!', factorial)} small />

              {inv ? (
                <CalcBtn label="sin⁻¹" style="function" onClick={() => applyUnary('asin', x => radToDeg(Math.asin(x)))} small />
              ) : (
                <CalcBtn label="sin" style="function" onClick={() => applyUnary('sin', x => Math.sin(degToRad(x)))} small />
              )}
              {inv ? (
                <CalcBtn label="cos⁻¹" style="function" onClick={() => applyUnary('acos', x => radToDeg(Math.acos(x)))} small />
              ) : (
                <CalcBtn label="cos" style="function" onClick={() => applyUnary('cos', x => Math.cos(degToRad(x)))} small />
              )}
              {inv ? (
                <CalcBtn label="tan⁻¹" style="function" onClick={() => applyUnary('atan', x => radToDeg(Math.atan(x)))} small />
              ) : (
                <CalcBtn label="tan" style="function" onClick={() => applyUnary('tan', x => Math.tan(degToRad(x)))} small />
              )}
              {inv ? (
                <CalcBtn label="eˣ" style="function" onClick={() => applyUnary('eˣ', x => Math.exp(x))} small />
              ) : (
                <CalcBtn label="ln" style="function" onClick={() => applyUnary('ln', Math.log)} small />
              )}
              {inv ? (
                <CalcBtn label="10ˣ" style="function" onClick={() => applyUnary('10ˣ', x => Math.pow(10, x))} small />
              ) : (
                <CalcBtn label="log" style="function" onClick={() => applyUnary('log', Math.log10)} small />
              )}

              <CalcBtn label="√" style="function" onClick={() => applyUnary('√', Math.sqrt)} small />
              <CalcBtn label="x²" style="function" onClick={() => applyUnary('x²', x => x * x)} small />
              <CalcBtn label="x³" style="function" onClick={() => applyUnary('x³', x => x * x * x)} small />
              <CalcBtn label="xʸ" style="operator" onClick={() => operate('xʸ')} active={op === 'xʸ' && fresh} small />
              <CalcBtn label="1/x" style="function" onClick={() => applyUnary('1/', x => x !== 0 ? 1 / x : NaN)} small />
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            <CalcBtn label="AC" style="function" onClick={clear} />
            <CalcBtn label="+/−" style="function" onClick={negate} />
            <CalcBtn label="%" style="function" onClick={percent} />
            <CalcBtn label="÷" style="operator" onClick={() => operate('÷')} active={op === '÷' && fresh} />

            <CalcBtn label="7" onClick={() => input('7')} />
            <CalcBtn label="8" onClick={() => input('8')} />
            <CalcBtn label="9" onClick={() => input('9')} />
            <CalcBtn label="×" style="operator" onClick={() => operate('×')} active={op === '×' && fresh} />

            <CalcBtn label="4" onClick={() => input('4')} />
            <CalcBtn label="5" onClick={() => input('5')} />
            <CalcBtn label="6" onClick={() => input('6')} />
            <CalcBtn label="−" style="operator" onClick={() => operate('−')} active={op === '−' && fresh} />

            <CalcBtn label="1" onClick={() => input('1')} />
            <CalcBtn label="2" onClick={() => input('2')} />
            <CalcBtn label="3" onClick={() => input('3')} />
            <CalcBtn label="+" style="operator" onClick={() => operate('+')} active={op === '+' && fresh} />

            <CalcBtn label="0" onClick={() => input('0')} wide />
            <CalcBtn label="." onClick={() => input('.')} />
            <CalcBtn label="=" style="operator" onClick={equals} />
          </div>
        </div>
      </div>
    </Shell>
  )
}

function CalcBtn({ label, style, onClick, wide, active, small }: {
  label: string
  style?: 'function' | 'operator'
  onClick: () => void
  wide?: boolean
  active?: boolean
  small?: boolean
}) {
  const base = `rounded-xl font-semibold transition-all active:scale-95 ${small ? 'py-2 text-xs' : 'py-3 text-lg'}`
  const styles = {
    function: `bg-[var(--panel)] text-[var(--ink)] ${active ? 'ring-2 ring-[var(--accent)]' : ''}`,
    operator: active
      ? 'bg-[var(--ink)] text-[var(--paper)]'
      : 'bg-[var(--accent)] text-white',
    default: 'bg-[var(--glass)] text-[var(--ink)] border border-[var(--line)]',
  }

  return (
    <button
      className={`${base} ${styles[style ?? 'default']} ${wide ? 'col-span-2' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
