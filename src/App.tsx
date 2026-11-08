import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from './components/ui'
import { ScenarioFields } from './components/Scenario'
import { Mortgage } from './tools/Mortgage'
import { Savings, SavingsState } from './tools/Savings'
import { RateTest } from './tools/RateTest'
import { Upfront } from './tools/Upfront'
import { Compare, EMPTY_PROPERTIES, Property } from './tools/Compare'
import { DEFAULT_FEES, DEFAULT_SCENARIO, Scenario, UpfrontFees, validateScenario } from './lib/calc'
import { sanitizeNumbers, usePersisted } from './lib/storage'

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'mortgage', label: 'Mortgage' },
  { id: 'savings', label: 'Savings' },
  { id: 'rates', label: 'Rate Test' },
  { id: 'upfront', label: 'Upfront Costs' },
  { id: 'compare', label: 'Compare' },
] as const
type ViewId = (typeof NAV)[number]['id']

const CARDS: { id: ViewId; title: string; text: string }[] = [
  { id: 'mortgage', title: 'Mortgage Repayment Calculator', text: 'See monthly repayments and total interest for your loan.' },
  { id: 'savings', title: 'Deposit Savings Planner', text: 'Work out how long it takes to save your deposit.' },
  { id: 'rates', title: 'Rate Stress Test', text: 'Check repayments if rates rise by 1, 2 or 3 points.' },
  { id: 'upfront', title: 'Upfront Cash Estimator', text: 'Add up your deposit and one-off buying costs.' },
  { id: 'compare', title: 'Property Comparison', text: 'Line up to three homes side by side.' },
]

const DEFAULT_SAVINGS: SavingsState = { savings: 40000, monthly: 2000 }

const readView = (): ViewId => {
  const h = window.location.hash.replace('#', '')
  return (NAV.find((n) => n.id === h)?.id ?? 'overview') as ViewId
}

function sanitizeProperties(raw: unknown): Property[] {
  if (!Array.isArray(raw)) return EMPTY_PROPERTIES
  return EMPTY_PROPERTIES.map((empty, i) => {
    const r = (raw[i] ?? {}) as Record<string, unknown>
    const out = { ...empty }
    for (const k of Object.keys(empty) as (keyof Property)[]) if (typeof r[k] === 'string') out[k] = r[k] as string
    return out
  })
}

export default function App() {
  const [view, setView] = useState<ViewId>(readView)
  const [scenario, setScenario] = usePersisted<Scenario>('scenario', DEFAULT_SCENARIO, (r) => sanitizeNumbers(r, DEFAULT_SCENARIO))
  const [savings, setSavings] = usePersisted<SavingsState>('savings', DEFAULT_SAVINGS, (r) => sanitizeNumbers(r, DEFAULT_SAVINGS))
  const [fees, setFees] = usePersisted<UpfrontFees>('fees', DEFAULT_FEES, (r) => sanitizeNumbers(r, DEFAULT_FEES))
  const [props, setProps] = usePersisted<Property[]>('properties', EMPTY_PROPERTIES, sanitizeProperties)
  const mainRef = useRef<HTMLElement>(null)
  const first = useRef(true)

  useEffect(() => {
    const onHash = () => setView(readView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // On navigation: scroll to top and move focus to the new heading (keyboard / screen reader friendly).
  useEffect(() => {
    if (first.current) { first.current = false; return }
    window.scrollTo(0, 0)
    mainRef.current?.querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true })
  }, [view])

  const patchScenario = useCallback((p: Partial<Scenario>) => setScenario((s) => ({ ...s, ...p })), [setScenario])
  const errors = validateScenario(scenario)
  const resetScenario = () => setScenario(DEFAULT_SCENARIO)

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <div className="strip">Educational estimates only. Not financial or legal advice. Verify duties and eligibility with official sources.</div>
      <header className="hero">
        <div className="wrap">
          <p className="brand"><svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#267A70" /><path d="M7 16 16 8l9 8v9H7z" fill="none" stroke="#F8F7F3" strokeWidth="2.4" strokeLinejoin="round" /><rect x="13.5" y="18" width="5" height="7" fill="#DAA34B" /></svg>First Home Toolkit · Victoria</p>
          <h1>Your first home, made clearer.</h1>
          <p className="sub">Five simple tools to explore your numbers — no sign-up needed.</p>
        </div>
      </header>

      <div className="wrap layout">
        <nav className="nav" aria-label="Tools">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} aria-current={view === n.id ? 'page' : undefined}><Icon name={n.id} /><span>{n.label}</span></a>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" ref={mainRef}>
          {view === 'overview' && (
            <section aria-labelledby="tool-title">
              <h2 id="tool-title" tabIndex={-1}>Start with your scenario</h2>
              <p className="lede">These sample values are illustrative assumptions, not live market rates. Change them once and the Mortgage, Savings, Rate Test and Upfront tools all update.</p>
              <div className="overview-grid">
                <div className="card">
                  <div className="card-row">
                    <h3 className="card-title">Your scenario</h3>
                    <button type="button" className="btn btn-quiet" onClick={resetScenario}>Reset to sample values</button>
                  </div>
                  <ScenarioFields scenario={scenario} errors={errors} onChange={patchScenario} />
                </div>
                <ul className="tool-cards">
                  {CARDS.map((c) => (
                    <li key={c.id}>
                      <a className="tool-card" href={`#${c.id}`}>
                        <Icon name={c.id} />
                        <span><strong>{c.title}</strong><span className="muted">{c.text}</span></span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
          {view === 'mortgage' && <Mortgage scenario={scenario} errors={errors} onChange={patchScenario} onReset={resetScenario} />}
          {view === 'savings' && <Savings scenario={scenario} scenarioErrors={errors} state={savings} onChange={(p) => setSavings((s) => ({ ...s, ...p }))} onReset={() => setSavings(DEFAULT_SAVINGS)} />}
          {view === 'rates' && <RateTest scenario={scenario} onReset={resetScenario} />}
          {view === 'upfront' && <Upfront scenario={scenario} fees={fees} onChange={(p) => setFees((f) => ({ ...f, ...p }))} onReset={() => setFees(DEFAULT_FEES)} />}
          {view === 'compare' && <Compare items={props} onChange={(i, p) => setProps((l) => l.map((x, j) => (j === i ? { ...x, ...p } : x)))} onReset={() => setProps(EMPTY_PROPERTIES)} />}
        </main>
      </div>

      <footer className="footer">
        <div className="wrap">
          <p>Educational estimates only. Not financial or legal advice. Verify duties and eligibility with official sources.</p>
          <p>
            <a href="https://moneysmart.gov.au/home-loans/mortgage-calculator" target="_blank" rel="noopener noreferrer">MoneySmart mortgage calculator</a>
            <a href="https://sro.vic.gov.au/" target="_blank" rel="noopener noreferrer">State Revenue Office Victoria</a>
          </p>
        </div>
      </footer>
    </>
  )
}
