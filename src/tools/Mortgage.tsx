import { ToolShell, Stat, Notice } from '../components/ui'
import { ScenarioFields } from '../components/Scenario'
import { Scenario, ScenarioErrors, calcMortgage, hasErrors } from '../lib/calc'
import { money, moneyCents } from '../lib/format'

interface Props {
  scenario: Scenario
  errors: ScenarioErrors
  onChange: (patch: Partial<Scenario>) => void
  onReset: () => void
}

export function Mortgage({ scenario, errors, onChange, onReset }: Props) {
  const r = calcMortgage(scenario)
  const interestShare = r && r.totalRepaid > 0 ? (r.totalInterest / r.totalRepaid) * 100 : 0

  return (
    <ToolShell
      title="What would my repayments be?"
      intro="Adjust the price, deposit, rate and term. These values are shared with the Rate Test and Upfront Costs tools."
      onReset={onReset}
      resetLabel="Reset to sample values"
      inputs={<ScenarioFields scenario={scenario} errors={errors} onChange={onChange} />}
      results={
        r ? (
          <>
            <Stat big label="Monthly repayment" value={moneyCents(r.monthly)} note="Principal and interest" />
            <div className="stat-grid">
              <Stat label="Loan amount (principal)" value={money(r.principal)} />
              <Stat label="Your deposit" value={money(r.deposit)} />
              <Stat label="Total interest" value={money(r.totalInterest)} />
              <Stat label="Total repaid" value={money(r.totalRepaid)} />
            </div>
            <div className="split" role="img" aria-label={`Of everything repaid, ${Math.round(100 - interestShare)}% is principal and ${Math.round(interestShare)}% is interest.`}>
              <div className="split-principal" style={{ width: `${100 - interestShare}%` }} />
              <div className="split-interest" style={{ width: `${interestShare}%` }} />
            </div>
            <p className="legend"><span className="dot dot-teal" />Principal {Math.round(100 - interestShare)}% <span className="dot dot-amber" />Interest {Math.round(interestShare)}%</p>
          </>
        ) : (
          <Notice tone="warn">{hasErrors(errors) ? 'Fix the highlighted inputs to see your results.' : 'Enter your assumptions to see results.'}</Notice>
        )
      }
      how={
        <>
          <p>Repayment = P × r ÷ (1 − (1 + r)<sup>−n</sup>), where P is the loan amount, r is the annual rate ÷ 12 and n is the number of months. At 0% the loan is simply split evenly across all months.</p>
          <p>It assumes a principal-and-interest loan with a constant rate and no fees, offsets or extra repayments. The default values are sample assumptions, not live market rates.</p>
        </>
      }
    />
  )
}
