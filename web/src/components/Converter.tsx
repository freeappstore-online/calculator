import { useState, useEffect } from 'react'
import { categories, convert } from '../convert'
import { cleanDisplay } from '../calc'

export function Converter() {
  const [catIndex, setCatIndex] = useState(0)
  const [inputVal, setInputVal] = useState('1')
  const [fromUnit, setFromUnit] = useState(categories[0]!.units[0]!.id)
  const [toUnit, setToUnit] = useState(categories[0]!.units[1]!.id)

  const cat = categories[catIndex]!

  useEffect(() => {
    setFromUnit(cat.units[0]!.id)
    setToUnit(cat.units[1]!.id)
    setInputVal('1')
  }, [catIndex, cat.units])

  const numVal = parseFloat(inputVal)
  const result = Number.isFinite(numVal)
    ? cleanDisplay(convert(numVal, fromUnit, toUnit, cat))
    : ''

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    if (result && result !== 'Error') setInputVal(result)
  }

  const fromDef = cat.units.find(u => u.id === fromUnit)
  const toDef = cat.units.find(u => u.id === toUnit)

  return (
    <div className="flex flex-1 justify-center p-2 md:p-4 overflow-auto">
      <div className="my-auto w-full max-w-sm">
        {/* Category tabs */}
        <div className="flex gap-1 mb-3 md:mb-4 overflow-x-auto pb-1">
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setCatIndex(i)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: i === catIndex ? 'var(--accent)' : 'transparent',
                color: i === catIndex ? 'white' : 'var(--muted)',
                border: `1px solid ${i === catIndex ? 'var(--accent)' : 'var(--line)'}`,
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* From */}
        <div
          className="rounded-2xl px-4 py-3 md:px-5 md:py-4 mb-2"
          style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <select
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              className="rounded-lg px-2 py-1 text-xs font-medium"
              style={{
                background: 'var(--glass)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
              }}
            >
              {cat.units.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {fromDef?.symbol}
            </span>
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="w-full bg-transparent text-right text-2xl font-bold outline-none"
            style={{ color: 'var(--ink)' }}
            placeholder="0"
          />
        </div>

        {/* Swap button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={swap}
            className="rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
            style={{
              background: 'var(--accent)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
            title="Swap units"
          >
            ⇅
          </button>
        </div>

        {/* To */}
        <div
          className="rounded-2xl px-4 py-3 md:px-5 md:py-4 mt-2"
          style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <select
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
              className="rounded-lg px-2 py-1 text-xs font-medium"
              style={{
                background: 'var(--glass)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
              }}
            >
              {cat.units.map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
            <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {toDef?.symbol}
            </span>
          </div>
          <div
            className="w-full text-right text-2xl font-bold select-all cursor-pointer"
            style={{ color: result === 'Error' ? 'var(--error)' : 'var(--ink)' }}
            title="Click to select"
          >
            {result || '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
