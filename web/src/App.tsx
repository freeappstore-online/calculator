import { useState, useEffect, useCallback, useRef } from 'react'
import { Shell } from './components/Shell'
import { calc, factorial, cleanDisplay, canAddDecimal, toRad, fromRad, backspace } from './calc'

export interface HistoryEntry {
  expression: string
  result: string
  timestamp: number
}

export type CalcMode = 'basic' | 'scientific'

const STORAGE_KEY = 'calculator-state'
const HISTORY_KEY = 'calculator-history'
const MODE_KEY = 'calculator-mode'
const MEMORY_KEY = 'calculator-memory'
const MAX_HISTORY = 50

interface CalcState {
  display: string
  prev: number | null
  op: string | null
}

interface ParenFrame {
  prev: number | null
  op: string | null
}

function loadState(): CalcState | null {
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

function loadMemory(): number {
  try {
    const raw = localStorage.getItem(MEMORY_KEY)
    if (!raw) return 0
    const n = parseFloat(raw)
    return Number.isFinite(n) ? n : 0
  } catch { return 0 }
}

export default function App() {
  const [display, setDisplay] = useState(() => loadState()?.display ?? '0')
  const [prev, setPrev] = useState<number | null>(() => loadState()?.prev ?? null)
  const [op, setOp] = useState<string | null>(() => loadState()?.op ?? null)
  const [fresh, setFresh] = useState(true)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [mode, setMode] = useState<CalcMode>(loadMode)
  const [useDeg, setUseDeg] = useState(true)
  const [inv, setInv] = useState(false)
  const [lastOperand, setLastOperand] = useState<number | null>(null)
  const [lastOp, setLastOp] = useState<string | null>(null)
  const [memory, setMemory] = useState(loadMemory)
  const [parenStack, setParenStack] = useState<ParenFrame[]>([])
  const [copied, setCopied] = useState(false)
  const displayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ display, prev, op }))
  }, [display, prev, op])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode)
  }, [mode])

  useEffect(() => {
    localStorage.setItem(MEMORY_KEY, String(memory))
  }, [memory])

  const isError = display === 'Error'

  const input = useCallback((digit: string) => {
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
  }, [display, fresh, isError])

  const operate = useCallback((nextOp: string) => {
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
  }, [display, fresh, isError, op, prev])

  const equals = useCallback(() => {
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
  }, [display, isError, lastOp, lastOperand, op, prev])

  const clear = useCallback(() => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setFresh(true)
    setLastOperand(null)
    setLastOp(null)
    setParenStack([])
  }, [])

  const percent = useCallback(() => {
    if (isError) return
    setDisplay(cleanDisplay(parseFloat(display) / 100))
    setFresh(true)
  }, [display, isError])

  const negate = useCallback(() => {
    if (isError) return
    setDisplay(cleanDisplay(-parseFloat(display)))
  }, [display, isError])

  const handleBackspace = useCallback(() => {
    if (isError || fresh) return
    setDisplay(backspace(display))
  }, [display, fresh, isError])

  const applyUnary = useCallback((label: string, fn: (x: number) => number) => {
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
  }, [display, isError])

  const degToRad = useCallback((x: number) => useDeg ? toRad(x) : x, [useDeg])
  const radToDeg = useCallback((x: number) => useDeg ? fromRad(x) : x, [useDeg])

  const insertConstant = useCallback((value: number) => {
    setDisplay(cleanDisplay(value))
    setFresh(true)
  }, [])

  const memoryClear = useCallback(() => setMemory(0), [])
  const memoryRecall = useCallback(() => {
    setDisplay(cleanDisplay(memory))
    setFresh(true)
  }, [memory])
  const memoryAdd = useCallback(() => {
    if (isError) return
    setMemory(m => m + parseFloat(display))
  }, [display, isError])
  const memorySub = useCallback(() => {
    if (isError) return
    setMemory(m => m - parseFloat(display))
  }, [display, isError])

  const openParen = useCallback(() => {
    if (isError) return
    setParenStack(s => [...s, { prev, op }])
    setPrev(null)
    setOp(null)
    setFresh(true)
  }, [isError, prev, op])

  const closeParen = useCallback(() => {
    if (isError || parenStack.length === 0) return
    const current = parseFloat(display)
    let result = current
    if (prev !== null && op) {
      result = calc(prev, current, op)
    }
    const frame = parenStack[parenStack.length - 1]!
    setParenStack(s => s.slice(0, -1))
    setDisplay(cleanDisplay(result))
    setPrev(frame.prev)
    setOp(frame.op)
    setFresh(true)
  }, [display, isError, op, parenStack, prev])

  const copyDisplay = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(display)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch { /* clipboard not available */ }
  }, [display])

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      const n = parseFloat(text.trim())
      if (Number.isFinite(n)) {
        setDisplay(cleanDisplay(n))
        setFresh(true)
      }
    } catch { /* clipboard not available */ }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === 'c') { copyDisplay(); return }
      if (meta && e.key === 'v') { e.preventDefault(); pasteFromClipboard(); return }

      if (e.key >= '0' && e.key <= '9') { input(e.key); return }
      if (e.key === '.') { input('.'); return }

      switch (e.key) {
        case '+': operate('+'); break
        case '-': operate('−'); break
        case '*': operate('×'); break
        case '/': e.preventDefault(); operate('÷'); break
        case '^': operate('xʸ'); break
        case 'Enter': case '=': e.preventDefault(); equals(); break
        case 'Escape': clear(); break
        case 'Backspace': handleBackspace(); break
        case '%': percent(); break
        case '(': openParen(); break
        case ')': closeParen(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [input, operate, equals, clear, handleBackspace, percent, openParen, closeParen, copyDisplay, pasteFromClipboard])

  const clearHistory = useCallback(() => setHistory([]), [])

  const deleteHistoryEntry = useCallback((index: number) => {
    setHistory(h => h.filter((_, i) => i !== index))
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

  const parenDepth = parenStack.length

  return (
    <Shell
      history={history}
      onClearHistory={clearHistory}
      onDeleteEntry={deleteHistoryEntry}
      onSelectHistory={loadFromHistory}
      mode={mode}
      onModeChange={toggleMode}
    >
      <div className="flex flex-1 justify-center p-2 md:p-4 overflow-auto">
        <div className={`my-auto ${mode === 'scientific' ? 'w-full max-w-sm' : 'w-full max-w-xs'}`}>
          {/* Display */}
          <div
            ref={displayRef}
            className="relative mb-2 md:mb-4 rounded-2xl px-4 py-3 md:px-5 md:py-4 text-right cursor-pointer select-none"
            style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
            onClick={copyDisplay}
            title="Click to copy"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {parenDepth > 0 && <span style={{ color: 'var(--accent)' }}>{'('.repeat(parenDepth)} </span>}
                {prev !== null ? `${cleanDisplay(prev)} ${op}` : ' '}
              </div>
              {!fresh && !isError && (
                <button
                  className="rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-[var(--glass)]"
                  style={{ color: 'var(--muted)' }}
                  onClick={(e) => { e.stopPropagation(); handleBackspace() }}
                  title="Backspace"
                >
                  ⌫
                </button>
              )}
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
            {copied && (
              <div
                className="absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-medium"
                style={{ background: 'var(--success)', color: 'white' }}
              >
                Copied
              </div>
            )}
          </div>

          {/* Memory bar */}
          <div className={`grid gap-1 md:gap-1.5 mb-1.5 md:mb-2 ${mode === 'scientific' ? 'grid-cols-6' : 'grid-cols-4'}`}>
            <CalcBtn label="MC" style="function" onClick={memoryClear} small />
            <CalcBtn label="MR" style="function" onClick={memoryRecall} small active={memory !== 0} />
            <CalcBtn label="M+" style="function" onClick={memoryAdd} small />
            <CalcBtn label="M−" style="function" onClick={memorySub} small />
            {mode === 'scientific' && (
              <>
                <CalcBtn label="(" style="function" onClick={openParen} small shortcut="(" />
                <CalcBtn label=")" style="function" onClick={closeParen} small active={parenDepth > 0} shortcut=")" />
              </>
            )}
          </div>

          {/* Scientific buttons */}
          {mode === 'scientific' && (
            <div className="grid grid-cols-5 gap-1 md:gap-1.5 mb-1.5 md:mb-2">
              <CalcBtn label="2nd" style="function" onClick={() => setInv(!inv)} active={inv} small />
              <CalcBtn label={useDeg ? 'DEG' : 'RAD'} style="function" onClick={() => setUseDeg(!useDeg)} small />
              <CalcBtn label="π" style="function" onClick={() => insertConstant(Math.PI)} small />
              <CalcBtn label="e" style="function" onClick={() => insertConstant(Math.E)} small />
              <CalcBtn label="x!" style="function" onClick={() => applyUnary('!', factorial)} small />

              {inv
                ? <CalcBtn label="sin⁻¹" style="function" onClick={() => applyUnary('asin', x => radToDeg(Math.asin(x)))} small />
                : <CalcBtn label="sin" style="function" onClick={() => applyUnary('sin', x => Math.sin(degToRad(x)))} small />}
              {inv
                ? <CalcBtn label="cos⁻¹" style="function" onClick={() => applyUnary('acos', x => radToDeg(Math.acos(x)))} small />
                : <CalcBtn label="cos" style="function" onClick={() => applyUnary('cos', x => Math.cos(degToRad(x)))} small />}
              {inv
                ? <CalcBtn label="tan⁻¹" style="function" onClick={() => applyUnary('atan', x => radToDeg(Math.atan(x)))} small />
                : <CalcBtn label="tan" style="function" onClick={() => applyUnary('tan', x => Math.tan(degToRad(x)))} small />}
              {inv
                ? <CalcBtn label="eˣ" style="function" onClick={() => applyUnary('eˣ', x => Math.exp(x))} small />
                : <CalcBtn label="ln" style="function" onClick={() => applyUnary('ln', Math.log)} small />}
              {inv
                ? <CalcBtn label="10ˣ" style="function" onClick={() => applyUnary('10ˣ', x => Math.pow(10, x))} small />
                : <CalcBtn label="log" style="function" onClick={() => applyUnary('log', Math.log10)} small />}

              <CalcBtn label="√" style="function" onClick={() => applyUnary('√', Math.sqrt)} small />
              <CalcBtn label="x²" style="function" onClick={() => applyUnary('x²', x => x * x)} small />
              <CalcBtn label="x³" style="function" onClick={() => applyUnary('x³', x => x * x * x)} small />
              <CalcBtn label="xʸ" style="operator" onClick={() => operate('xʸ')} active={op === 'xʸ' && fresh} small shortcut="^" />
              <CalcBtn label="1/x" style="function" onClick={() => applyUnary('1/', x => x !== 0 ? 1 / x : NaN)} small />
            </div>
          )}

          {/* Main grid */}
          <div className="grid grid-cols-4 gap-1.5 md:gap-2">
            <CalcBtn label="AC" style="function" onClick={clear} shortcut="Esc" />
            <CalcBtn label="+/−" style="function" onClick={negate} />
            <CalcBtn label="%" style="function" onClick={percent} shortcut="%" />
            <CalcBtn label="÷" style="operator" onClick={() => operate('÷')} active={op === '÷' && fresh} shortcut="/" />

            <CalcBtn label="7" onClick={() => input('7')} shortcut="7" />
            <CalcBtn label="8" onClick={() => input('8')} shortcut="8" />
            <CalcBtn label="9" onClick={() => input('9')} shortcut="9" />
            <CalcBtn label="×" style="operator" onClick={() => operate('×')} active={op === '×' && fresh} shortcut="*" />

            <CalcBtn label="4" onClick={() => input('4')} shortcut="4" />
            <CalcBtn label="5" onClick={() => input('5')} shortcut="5" />
            <CalcBtn label="6" onClick={() => input('6')} shortcut="6" />
            <CalcBtn label="−" style="operator" onClick={() => operate('−')} active={op === '−' && fresh} shortcut="-" />

            <CalcBtn label="1" onClick={() => input('1')} shortcut="1" />
            <CalcBtn label="2" onClick={() => input('2')} shortcut="2" />
            <CalcBtn label="3" onClick={() => input('3')} shortcut="3" />
            <CalcBtn label="+" style="operator" onClick={() => operate('+')} active={op === '+' && fresh} shortcut="+" />

            <CalcBtn label="0" onClick={() => input('0')} wide shortcut="0" />
            <CalcBtn label="." onClick={() => input('.')} shortcut="." />
            <CalcBtn label="=" style="operator" onClick={equals} shortcut="Enter" />
          </div>
        </div>
      </div>
    </Shell>
  )
}

function CalcBtn({ label, style, onClick, wide, active, small, shortcut }: {
  label: string
  style?: 'function' | 'operator'
  onClick: () => void
  wide?: boolean
  active?: boolean
  small?: boolean
  shortcut?: string
}) {
  const base = small
    ? 'rounded-lg md:rounded-xl py-1.5 md:py-2 text-[11px] md:text-xs font-semibold transition-all active:scale-95'
    : 'rounded-xl py-2.5 md:py-3 text-base md:text-lg font-semibold transition-all active:scale-95'
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
      title={shortcut ? `Keyboard: ${shortcut}` : undefined}
    >
      {label}
    </button>
  )
}
