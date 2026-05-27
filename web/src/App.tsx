import { useState, useEffect, useCallback } from 'react'
import { Shell } from './components/Shell'

export interface HistoryEntry {
  expression: string
  result: string
  timestamp: number
}

const STORAGE_KEY = 'calculator-state'
const HISTORY_KEY = 'calculator-history'
const MAX_HISTORY = 50

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { display: string; prev: number | null; op: string | null }
  } catch { return null }
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch { return [] }
}

export default function App() {
  const saved = loadState()
  const [display, setDisplay] = useState(saved?.display ?? '0')
  const [prev, setPrev] = useState<number | null>(saved?.prev ?? null)
  const [op, setOp] = useState<string | null>(saved?.op ?? null)
  const [fresh, setFresh] = useState(true)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ display, prev, op }))
  }, [display, prev, op])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  const input = (digit: string) => {
    if (fresh) {
      setDisplay(digit)
      setFresh(false)
    } else {
      setDisplay(display === '0' && digit !== '.' ? digit : display + digit)
    }
  }

  const operate = (nextOp: string) => {
    const current = parseFloat(display)
    if (prev !== null && op && !fresh) {
      const result = calc(prev, current, op)
      setDisplay(String(result))
      setPrev(result)
    } else {
      setPrev(current)
    }
    setOp(nextOp)
    setFresh(true)
  }

  const equals = () => {
    if (prev === null || !op) return
    const current = parseFloat(display)
    const result = calc(prev, current, op)
    const resultStr = String(result)
    setDisplay(resultStr)
    setHistory(h => [
      { expression: `${prev} ${op} ${current}`, result: resultStr, timestamp: Date.now() },
      ...h,
    ].slice(0, MAX_HISTORY))
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const clear = () => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setFresh(true)
  }

  const percent = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  const negate = () => {
    setDisplay(String(-parseFloat(display)))
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

  return (
    <Shell history={history} onClearHistory={clearHistory} onSelectHistory={loadFromHistory}>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-xs">
          <div
            className="mb-4 rounded-2xl px-5 py-4 text-right"
            style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
          >
            <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {prev !== null ? `${prev} ${op}` : ' '}
            </div>
            <div
              className="display-font mt-1 font-bold"
              style={{
                color: 'var(--ink)',
                fontSize: display.length > 10 ? '1.5rem' : display.length > 7 ? '2rem' : '2.5rem',
              }}
            >
              {display}
            </div>
          </div>

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

function calc(a: number, b: number, op: string): number {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : 0
    default: return b
  }
}

function CalcBtn({ label, style, onClick, wide, active }: {
  label: string
  style?: 'function' | 'operator'
  onClick: () => void
  wide?: boolean
  active?: boolean
}) {
  const base = 'rounded-xl py-3 text-lg font-semibold transition-all active:scale-95'
  const styles = {
    function: 'bg-[var(--panel)] text-[var(--ink)]',
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
