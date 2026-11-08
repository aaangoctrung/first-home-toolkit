import { ToolShell, Notice } from '../components/ui'
import { ScenarioSummary } from '../components/Scenario'
import { Scenario, calcStress } from '../lib/calc'
import { moneyCents, pct } from '../lib/format'

export function RateTest({ scenario, onReset }: { scenario: Scenario; onReset: () => void }) {
  const rows = calcStress(scenario)
  const max = rows ? Math.max(...rows.map((r) => r.monthly), 1) : 1

  return (
    <ToolShell
      title="What if interest rates rise?"
      intro="See how your monthly repayment changes if your rate goes up by 1, 2 or 3 percentage points."
      onReset={onReset}
      resetLabel="Reset scenario"
      inputs={
        <>
          <ScenarioSummary scenario={scenario} />
          <p className="hint">This tool reuses your scenario. Change the rate in the Mortgage tool to move the baseline.</p>
        </>
      }
      results={
        rows ? (
          <ul className="bars">
            {rows.map((r) => (
              <li key={r.bump}>
                <div className="bar-row">
                  <span className="bar-label">{r.bump === 0 ? 'Current' : `+${r.bump}%`} <span className="muted">({pct(r.rate)})</span></span>
                  <span className="bar-value">{moneyCents(r.monthly)}</span>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className={`bar-fill${r.bump === 0 ? ' base' : ''}`} style={{ width: `${(r.monthly / max) * 100}%` }} />
                </div>
                <div className="bar-note">{r.bump === 0 ? 'Baseline repayment per month' : `${moneyCents(r.increase)} more per month`}</div>
              </li>
            ))}
          </ul>
        ) : (
          <Notice tone="warn">Fix your scenario in the Mortgage tool to see the stress test.</Notice>
        )
      }
      how={<p>The loan amount and term stay the same while the interest rate is raised by 1, 2 and 3 percentage points. Each bar shows the new monthly principal-and-interest repayment. Bars are scaled to the highest repayment.</p>}
    />
  )
}
