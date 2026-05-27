import { type ReactNode, useState, useRef, useCallback } from "react";
import type { HistoryEntry, CalcMode } from "../App";

interface ShellProps {
  children: ReactNode;
  history: HistoryEntry[];
  onClearHistory: () => void;
  onDeleteEntry: (index: number) => void;
  onSelectHistory: (entry: HistoryEntry) => void;
  mode: CalcMode;
  onModeChange: (mode: CalcMode) => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const SWIPE_THRESHOLD = 80;

function SwipeableHistoryItem({ entry, onSelect, onDelete }: {
  entry: HistoryEntry;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0]!.clientX;
    currentX.current = 0;
    swiping.current = false;
    if (itemRef.current) {
      itemRef.current.style.transition = "none";
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0]!.clientX - startX.current;
    if (Math.abs(dx) > 10) swiping.current = true;
    const clamped = Math.min(0, dx);
    currentX.current = clamped;
    if (itemRef.current) {
      itemRef.current.style.transform = `translateX(${clamped}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (itemRef.current) {
      itemRef.current.style.transition = "transform 0.2s ease";
    }
    if (currentX.current < -SWIPE_THRESHOLD) {
      if (itemRef.current) {
        itemRef.current.style.transform = "translateX(-100%)";
      }
      setTimeout(onDelete, 200);
    } else {
      if (itemRef.current) {
        itemRef.current.style.transform = "translateX(0)";
      }
    }
    currentX.current = 0;
  }, [onDelete]);

  const handleClick = useCallback(() => {
    if (!swiping.current) onSelect();
  }, [onSelect]);

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className="absolute inset-0 flex items-center justify-end px-4"
        style={{ background: "var(--error)" }}
      >
        <span className="text-white text-xs font-semibold">Delete</span>
      </div>
      <div
        ref={itemRef}
        className="relative rounded-lg px-3 py-2 text-left cursor-pointer transition-colors hover:bg-[var(--glass)] group"
        style={{ background: "var(--panel)", border: "1px solid transparent" }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--line)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {entry.expression}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
            = {entry.result}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              className="hidden group-hover:inline-block rounded px-1 py-0.5 text-[10px] transition-colors hover:bg-[var(--glass)]"
              style={{ color: "var(--error)" }}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete entry"
            >
              ✕
            </button>
            <span className="text-[10px] shrink-0" style={{ color: "var(--muted)" }}>
              {formatTime(entry.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryList({ history, onClear, onSelect, onDelete }: {
  history: HistoryEntry[];
  onClear: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (index: number) => void;
}) {
  if (history.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
        No history yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-3">
      {history.map((entry, i) => (
        <SwipeableHistoryItem
          key={entry.timestamp + '-' + i}
          entry={entry}
          onSelect={() => onSelect(entry)}
          onDelete={() => onDelete(i)}
        />
      ))}
      <button
        onClick={onClear}
        className="mt-2 mb-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--glass)]"
        style={{ color: "var(--error)" }}
      >
        Clear all history
      </button>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: CalcMode; onChange: (m: CalcMode) => void }) {
  return (
    <div
      className="flex rounded-lg p-0.5 text-xs font-medium"
      style={{ background: "var(--glass)", border: "1px solid var(--line)" }}
    >
      {(["basic", "scientific"] as const).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="rounded-md px-3 py-1 transition-colors capitalize"
          style={{
            background: mode === m ? "var(--accent)" : "transparent",
            color: mode === m ? "white" : "var(--muted)",
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

export function Shell({ children, history, onClearHistory, onDeleteEntry, onSelectHistory, mode, onModeChange }: ShellProps) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <>
      {/* Desktop: sidebar + main */}
      <div className="hidden md:flex h-screen">
        <aside
          className="flex flex-col border-r h-full shrink-0"
          style={{
            width: "17rem",
            borderColor: "var(--line)",
            background: "var(--panel)",
          }}
        >
          <div className="p-6 font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>
            calculator
          </div>
          <div className="px-4 pb-3">
            <ModeToggle mode={mode} onChange={onModeChange} />
          </div>
          <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            History
          </div>
          <nav className="flex-1 overflow-auto">
            <HistoryList history={history} onClear={onClearHistory} onSelect={onSelectHistory} onDelete={onDeleteEntry} />
          </nav>
          <div className="p-4 text-xs" style={{ color: "var(--muted)" }}>
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Part of FreeAppStore — free forever
            </a>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>

      {/* Mobile: header + main + dock */}
      <div className="flex flex-col h-screen md:hidden">
        <header
          className="flex items-center justify-between px-4 h-14 border-b shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <span className="font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            calculator
          </span>
          <div className="flex items-center gap-2">
            <ModeToggle mode={mode} onChange={onModeChange} />
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
              style={{
                color: showHistory ? "var(--paper)" : "var(--accent)",
                background: showHistory ? "var(--accent)" : "transparent",
                border: `1px solid ${showHistory ? "var(--accent)" : "var(--line)"}`,
              }}
            >
              History{history.length > 0 ? ` (${history.length})` : ""}
            </button>
          </div>
        </header>
        {showHistory ? (
          <main className="flex-1 overflow-auto py-2">
            <HistoryList history={history} onClear={onClearHistory} onSelect={(entry) => {
              onSelectHistory(entry);
              setShowHistory(false);
            }} onDelete={onDeleteEntry} />
          </main>
        ) : (
          <main className="flex-1 overflow-auto p-4">{children}</main>
        )}
        <nav
          className="flex items-center justify-around h-16 border-t shrink-0"
          style={{
            borderColor: "var(--line)",
            background: "var(--dock)",
          }}
        >
          {/* Add dock items here */}
        </nav>
      </div>
    </>
  );
}
