import { Segmented, NumberField } from './ui'
import { Scenario, ScenarioErrors } from '../lib/calc'
import { money, pct } from '../lib/format'

interface Props {
  scenario: Scenario
  errors: ScenarioErrors
  onChange: (patch: Partial<Scenario>) => void
}

/** The four shared assumptions used by tools 1–4. */
export function ScenarioFields({ scenario, errors, onChange }: Props) {
  return (
    <>
      <NumberField label="Property price" prefix="$" value={scenario.price} error={errors.price}
        onChange={(price) => onChange({ price })} slider={{ min: 200000, max: 2000000, step: 5000 }} />
      <NumberField label="Deposit" suffix="%" value={scenario.depositPct} error={errors.depositPct}
        onChange={(depositPct) => onChange({ depositPct })} slider={{ min: 0, max: 50, step: 1 }}
        hint="Deposits under 20% may add costs such as lenders mortgage insurance, which isn’t included here." />
      <NumberField label="Interest rate (per year)" suffix="%" value={scenario.rate} error={errors.rate}
        onChange={(rate) => onChange({ rate })} slider={{ min: 0, max: 12, step: 0.05 }} />
      <NumberField label="Loan term" suffix="years" value={scenario.years} error={errors.years}
        onChange={(years) => onChange({ years })} slider={{ min: 5, max: 40, step: 1 }} />
      <Segmented label="Loan term presets" options={[15, 20, 25, 30]} value={scenario.years}
        onChange={(years) => onChange({ years })} format={(n) => `${n} yrs`} />
    </>
  )
}

/** Read-only recap of the shared scenario, with a link back to edit it. */
export function ScenarioSummary({ scenario }: { scenario: Scenario }) {
  const items: [string, string][] = [
    ['Price', money(scenario.price)],
    ['Deposit', pct(scenario.depositPct)],
    ['Rate', pct(scenario.rate)],
    ['Term', `${Number.isFinite(scenario.years) ? scenario.years : '—'} yrs`],
  ]
  return (
    <div className="summary">
      <dl>
        {items.map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <a href="#mortgage">Edit in Mortgage</a>
    </div>
  )
}
