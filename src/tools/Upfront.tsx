import { ToolShell, Stat, Notice, NumberField } from '../components/ui'
import { ScenarioSummary } from '../components/Scenario'
import { Scenario, UpfrontFees, calcMortgage, calcUpfront, validateFees } from '../lib/calc'
import { money } from '../lib/format'

interface Props {
  scenario: Scenario
  fees: UpfrontFees
  onChange: (patch: Partial<UpfrontFees>) => void
  onReset: () => void
}

export function Upfront({ scenario, fees, onChange, onReset }: Props) {
  const errors = validateFees(fees)
  const mortgage = calcMortgage(scenario)
  const r = mortgage ? calcUpfront(mortgage.deposit, fees) : null
  const lines: [string, number][] = r && mortgage
    ? [['Deposit', mortgage.deposit], ['Conveyancing', fees.conveyancing], ['Inspections', fees.inspections], ['Moving costs', fees.moving], ['Stamp duty (your estimate)', fees.duty], ['Other fees', fees.other]]
    : []

  return (
    <ToolShell
      title="How much cash do I need upfront?"
      intro="Your deposit plus the one-off costs of buying. All amounts are editable estimates."
      onReset={onReset}
      resetLabel="Reset fees"
      inputs={
        <>
          <ScenarioSummary scenario={scenario} />
          <NumberField label="Conveyancing" prefix="$" value={fees.conveyancing} error={errors.conveyancing} onChange={(conveyancing) => onChange({ conveyancing })} />
          <NumberField label="Inspections (building, pest)" prefix="$" value={fees.inspections} error={errors.inspections} onChange={(inspections) => onChange({ inspections })} />
          <NumberField label="Moving costs" prefix="$" value={fees.moving} error={errors.moving} onChange={(moving) => onChange({ moving })} />
          <NumberField label="Stamp duty estimate" prefix="$" value={fees.duty} error={errors.duty} onChange={(duty) => onChange({ duty })}
            hint="Enter estimate from official SRO calculator. $0 here is a placeholder, not the duty you will pay." />
          <NumberField label="Other fees" prefix="$" value={fees.other} error={errors.other} onChange={(other) => onChange({ other })} />
        </>
      }
      results={
        r ? (
          <>
            <Stat big label="Estimated cash needed" value={money(r.total)} note={`${money(r.fees)} in fees on top of your deposit`} />
            {fees.duty === 0 && (
              <Notice tone="warn">Stamp duty hasn’t been entered, so this total is incomplete. Get an estimate from the <a href="https://sro.vic.gov.au/" target="_blank" rel="noopener noreferrer">State Revenue Office</a>.</Notice>
            )}
            <table className="lines">
              <tbody>
                {lines.map(([k, v]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{k.startsWith('Stamp') && v === 0 ? 'Not entered' : money(v)}</td></tr>
                ))}
                <tr className="total"><th scope="row">Total</th><td>{money(r.total)}</td></tr>
              </tbody>
            </table>
          </>
        ) : (
          <Notice tone="warn">Fix the highlighted inputs, or your scenario in the Mortgage tool, to see your total.</Notice>
        )
      }
      how={<p>Total = deposit (price × deposit %) + conveyancing + inspections + moving + stamp duty + other fees. This tool does not calculate stamp duty or check eligibility for concessions or grants. Use the official State Revenue Office calculator and enter its result.</p>}
    />
  )
}
