import { ToolShell, Stat, Notice, NumberField, ProgressBar } from '../components/ui'
import { ScenarioSummary } from '../components/Scenario'
import { Scenario, ScenarioErrors, calcSavings, hasErrors, validateSavings } from '../lib/calc'
import { money, monthsLabel, monthYearFromNow, pct } from '../lib/format'

export interface SavingsState { savings: number; monthly: number }

interface Props {
  scenario: Scenario
  scenarioErrors: ScenarioErrors
  state: SavingsState
  onChange: (patch: Partial<SavingsState>) => void
  onReset: () => void
}

export function Savings({ scenario, scenarioErrors, state, onChange, onReset }: Props) {
  const errors = validateSavings(state)
  const r = calcSavings({ price: scenario.price, depositPct: scenario.depositPct, ...state })
  const scenarioBad = !!(scenarioErrors.price || scenarioErrors.depositPct)

  return (
    <ToolShell
      title="How long until I reach my deposit?"
      intro="Uses the home price and deposit percentage from your scenario. Enter what you have saved and what you can add each month."
      onReset={onReset}
      inputs={
        <>
          <ScenarioSummary scenario={scenario} />
          <NumberField label="Current savings" prefix="$" value={state.savings} error={errors.savings}
            onChange={(savings) => onChange({ savings })} slider={{ min: 0, max: 300000, step: 1000 }} />
          <NumberField label="Monthly contribution" prefix="$" value={state.monthly} error={errors.monthly}
            onChange={(monthly) => onChange({ monthly })} slider={{ min: 0, max: 8000, step: 50 }}
            hint="Set to $0 to see only your shortfall." />
        </>
      }
      results={
        r ? (
          <>
            <Stat big label="Time to reach your target"
              value={r.months === null ? 'Not reachable yet' : monthsLabel(r.months)}
              note={r.months === null ? 'Add a monthly contribution to estimate a timeframe.' : r.months === 0 ? 'Your savings already cover the target deposit.' : `About ${monthYearFromNow(r.months)}`} />
            <ProgressBar value={r.progress} label="Progress towards deposit target" />
            <p className="legend">{Math.round(r.progress * 100)}% of {money(r.targetDeposit)} saved</p>
            <div className="stat-grid">
              <Stat label={`Target deposit (${pct(scenario.depositPct)})`} value={money(r.targetDeposit)} />
              <Stat label="Shortfall" value={money(r.shortfall)} />
            </div>
          </>
        ) : (
          <Notice tone="warn">{scenarioBad ? 'Fix the price or deposit in your scenario first.' : hasErrors(errors) ? 'Fix the highlighted inputs to see your results.' : 'Enter your savings to see results.'}</Notice>
        )
      }
      how={
        <p>Target deposit = home price × deposit %. Shortfall = target − current savings. Months = shortfall ÷ monthly contribution, rounded up. It assumes zero investment return, so interest earned on your savings isn’t counted.</p>
      }
    />
  )
}
