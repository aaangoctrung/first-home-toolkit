import { TextField, ToolShell } from '../components/ui'
import { money } from '../lib/format'

export interface Property { name: string; price: string; beds: string; commute: string; costs: string; notes: string }
export const EMPTY_PROPERTY: Property = { name: '', price: '', beds: '', commute: '', costs: '', notes: '' }
export const EMPTY_PROPERTIES: Property[] = [EMPTY_PROPERTY, EMPTY_PROPERTY, EMPTY_PROPERTY]

const num = (s: string) => (s.trim() === '' ? null : Number(s.replace(/[$,\s]/g, '')))
const bad = (s: string) => { const n = num(s); return n !== null && (!Number.isFinite(n) || n < 0) }
const err = (s: string) => (bad(s) ? 'Enter a number of 0 or more.' : undefined)
const showMoney = (s: string) => { const n = num(s); return n === null || bad(s) ? '—' : money(n) }
const showNum = (s: string, unit = '') => { const n = num(s); return n === null || bad(s) ? '—' : `${n}${unit}` }

interface Props { items: Property[]; onChange: (i: number, patch: Partial<Property>) => void; onReset: () => void }

export function Compare({ items, onChange, onReset }: Props) {
  const label = (p: Property, i: number) => p.name.trim() || `Property ${i + 1}`
  const rows: [string, (p: Property) => string][] = [
    ['Asking price', (p) => showMoney(p.price)],
    ['Bedrooms', (p) => showNum(p.beds)],
    ['Commute', (p) => showNum(p.commute, ' min')],
    ['Est. monthly costs', (p) => showMoney(p.costs)],
    ['Notes', (p) => p.notes.trim() || '—'],
  ]
  return (
    <section className="tool" aria-labelledby="tool-title">
      <header className="tool-head">
        <div>
          <h2 id="tool-title" tabIndex={-1}>How do my shortlisted homes compare?</h2>
          <p className="lede">Enter up to three properties and see them side by side. Everything here is your own data, saved only in this browser.</p>
        </div>
        <button type="button" className="btn btn-quiet" onClick={onReset}>Clear all</button>
      </header>
      <div className="compare-inputs">
        {items.map((p, i) => (
          <div className="card" key={i}>
            <h3 className="card-title">Property {i + 1}</h3>
            <TextField label="Nickname" value={p.name} onChange={(name) => onChange(i, { name })} placeholder="e.g. Brunswick townhouse" />
            <TextField label="Asking price ($)" value={p.price} inputMode="decimal" error={err(p.price)} onChange={(price) => onChange(i, { price })} />
            <TextField label="Bedrooms" value={p.beds} inputMode="numeric" error={err(p.beds)} onChange={(beds) => onChange(i, { beds })} />
            <TextField label="Commute (minutes)" value={p.commute} inputMode="numeric" error={err(p.commute)} onChange={(commute) => onChange(i, { commute })} />
            <TextField label="Estimated recurring costs ($ per month)" value={p.costs} inputMode="decimal" error={err(p.costs)} onChange={(costs) => onChange(i, { costs })} />
            <div className="field">
              <label htmlFor={`notes-${i}`}>Notes</label>
              <div className="input-wrap"><textarea id={`notes-${i}`} rows={3} value={p.notes} onChange={(e) => onChange(i, { notes: e.target.value })} /></div>
            </div>
          </div>
        ))}
      </div>
      <h3 className="section-sub">Side by side</h3>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Property comparison table, scrollable">
        <table className="compare-table">
          <thead>
            <tr><td />{items.map((p, i) => <th scope="col" key={i}>{label(p, i)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(([name, fn]) => (
              <tr key={name}><th scope="row">{name}</th>{items.map((p, i) => <td key={i}>{fn(p)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="how">
        <summary>How this works</summary>
        <div className="how-body"><p>This table only shows what you type in. It doesn’t score, rank or recommend properties. Recurring costs are whatever you estimate (for example council rates, insurance or strata), excluding your mortgage.</p></div>
      </details>
    </section>
  )
}
