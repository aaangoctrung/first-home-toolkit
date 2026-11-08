import { ReactNode, useEffect, useId, useState } from 'react'

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const toDraft = (v: number) => (Number.isFinite(v) ? String(v) : '')
const fromDraft = (d: string) => (d.trim() === '' ? NaN : Number(d))

interface NumberFieldProps {
  label: string
  value: number
  onChange: (n: number) => void
  prefix?: string
  suffix?: string
  error?: string
  hint?: string
  slider?: { min: number; max: number; step: number }
}

/** Numeric text input (optionally paired with a slider). Blank input becomes NaN so validation can flag it. */
export function NumberField({ label, value, onChange, prefix, suffix, error, hint, slider }: NumberFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState(toDraft(value))

  useEffect(() => {
    if (!Object.is(fromDraft(draft), value)) setDraft(toDraft(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const describedBy = [error ? `${id}-err` : '', hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap${error ? ' has-error' : ''}`}>
        {prefix && <span className="affix" aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/,/g, '')
            if (!/^\d*\.?\d*$/.test(cleaned)) return
            setDraft(cleaned)
            onChange(fromDraft(cleaned))
          }}
        />
        {suffix && <span className="affix" aria-hidden="true">{suffix}</span>}
      </div>
      {slider && (
        <input
          className="slider"
          type="range"
          aria-label={`${label} slider`}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={clamp(Number.isFinite(value) ? value : slider.min, slider.min, slider.max)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
      {hint && !error && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      <p className="error" id={`${id}-err`} aria-live="polite">{error ?? ''}</p>
    </div>
  )
}

export function TextField(p: { label: string; value: string; onChange: (v: string) => void; inputMode?: 'text' | 'decimal' | 'numeric'; error?: string; placeholder?: string }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{p.label}</label>
      <div className={`input-wrap${p.error ? ' has-error' : ''}`}>
        <input id={id} type="text" inputMode={p.inputMode ?? 'text'} value={p.value} placeholder={p.placeholder}
          aria-invalid={p.error ? true : undefined} aria-describedby={p.error ? `${id}-err` : undefined}
          onChange={(e) => p.onChange(e.target.value)} />
      </div>
      <p className="error" id={`${id}-err`} aria-live="polite">{p.error ?? ''}</p>
    </div>
  )
}

export function Segmented({ label, options, value, onChange, format }: { label: string; options: number[]; value: number; onChange: (n: number) => void; format: (n: number) => string }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={o === value} onClick={() => onChange(o)}>{format(o)}</button>
      ))}
    </div>
  )
}

export function Stat({ label, value, big, note }: { label: string; value: string; big?: boolean; note?: string }) {
  return (
    <div className={`stat${big ? ' stat-big' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pctVal = Math.round(clamp(value, 0, 1) * 100)
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pctVal}>
      <div className="progress-fill" style={{ width: `${pctVal}%` }} />
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  return <div className={`notice notice-${tone}`}>{children}</div>
}

export function ToolShell(p: { title: string; intro: string; onReset: () => void; resetLabel?: string; inputs: ReactNode; results: ReactNode; how: ReactNode }) {
  return (
    <section className="tool" aria-labelledby="tool-title">
      <header className="tool-head">
        <div>
          <h2 id="tool-title" tabIndex={-1}>{p.title}</h2>
          <p className="lede">{p.intro}</p>
        </div>
        <button type="button" className="btn btn-quiet" onClick={p.onReset}>{p.resetLabel ?? 'Reset'}</button>
      </header>
      <div className="tool-grid">
        <div className="card">
          <h3 className="card-title">Your assumptions</h3>
          {p.inputs}
        </div>
        <div className="card card-result" aria-live="polite">
          <h3 className="card-title">Estimated result</h3>
          {p.results}
        </div>
      </div>
      <details className="how">
        <summary>How this works</summary>
        <div className="how-body">{p.how}</div>
      </details>
    </section>
  )
}

const ICONS: Record<string, string> = {
  overview: 'M4 11 12 4l8 7v9H4zM10 20v-5h4v5',
  mortgage: 'M3 10h18M5 10V7l7-3 7 3v3M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18',
  savings: 'M5 19V9M12 19V5M19 19v-7M3 19h18',
  rates: 'M4 19 10 12l4 4 6-9M15 7h5v5',
  upfront: 'M4 7h16v12H4zM4 11h16M8 15h3',
  compare: 'M4 5h7v14H4zM13 5h7v14h-7z',
}

export function Icon({ name }: { name: string }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] ?? ICONS.overview} />
    </svg>
  )
}
