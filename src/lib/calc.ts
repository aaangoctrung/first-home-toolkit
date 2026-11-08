// Pure calculation helpers. No React, no side effects.

export interface Scenario {
  price: number
  depositPct: number
  rate: number
  years: number
}

export const DEFAULT_SCENARIO: Scenario = { price: 650000, depositPct: 20, rate: 6, years: 30 }

export type ScenarioErrors = Partial<Record<keyof Scenario, string>>

const ok = (n: number) => Number.isFinite(n)

export function validateScenario(s: Scenario): ScenarioErrors {
  const e: ScenarioErrors = {}
  if (!ok(s.price) || s.price <= 0) e.price = 'Enter a price above $0.'
  else if (s.price > 100_000_000) e.price = 'Enter a price of $100,000,000 or less.'
  if (!ok(s.depositPct) || s.depositPct < 0 || s.depositPct > 100) e.depositPct = 'Deposit must be between 0% and 100%.'
  if (!ok(s.rate) || s.rate < 0 || s.rate > 25) e.rate = 'Interest rate must be between 0% and 25%.'
  if (!ok(s.years) || s.years < 1 || s.years > 40) e.years = 'Loan term must be between 1 and 40 years.'
  return e
}

export const hasErrors = (e: object) => Object.keys(e).length > 0

/** Principal-and-interest repayment, constant rate, monthly compounding. Returns 0 for invalid input. */
export function monthlyRepayment(principal: number, annualRatePct: number, years: number): number {
  if (![principal, annualRatePct, years].every(ok)) return 0
  if (principal <= 0 || annualRatePct < 0 || years <= 0) return 0
  const n = Math.round(years * 12)
  if (n < 1) return 0
  const r = annualRatePct / 100 / 12
  if (r === 0) return principal / n
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}

export interface MortgageResult {
  deposit: number
  principal: number
  monthly: number
  totalRepaid: number
  totalInterest: number
}

export function calcMortgage(s: Scenario): MortgageResult | null {
  if (hasErrors(validateScenario(s))) return null
  const deposit = (s.price * s.depositPct) / 100
  const principal = Math.max(0, s.price - deposit)
  const monthly = monthlyRepayment(principal, s.rate, s.years)
  const totalRepaid = monthly * Math.round(s.years * 12)
  const totalInterest = principal > 0 ? Math.max(0, totalRepaid - principal) : 0
  return { deposit, principal, monthly, totalRepaid, totalInterest }
}

export interface StressRow {
  bump: number
  rate: number
  monthly: number
  increase: number
}

export function calcStress(s: Scenario, bumps: number[] = [0, 1, 2, 3]): StressRow[] | null {
  const base = calcMortgage(s)
  if (!base) return null
  return bumps.map((bump) => {
    const rate = s.rate + bump
    const monthly = monthlyRepayment(base.principal, rate, s.years)
    return { bump, rate, monthly, increase: monthly - base.monthly }
  })
}

export interface SavingsInput {
  price: number
  depositPct: number
  savings: number
  monthly: number
}

export interface SavingsResult {
  targetDeposit: number
  shortfall: number
  months: number | null // null = never (no monthly saving)
  progress: number // 0..1
}

export function validateSavings(i: { savings: number; monthly: number }): Partial<Record<'savings' | 'monthly', string>> {
  const e: Partial<Record<'savings' | 'monthly', string>> = {}
  if (!ok(i.savings) || i.savings < 0) e.savings = 'Enter an amount of $0 or more.'
  if (!ok(i.monthly) || i.monthly < 0) e.monthly = 'Enter an amount of $0 or more.'
  return e
}

export function calcSavings(i: SavingsInput): SavingsResult | null {
  const sc = validateScenario({ price: i.price, depositPct: i.depositPct, rate: 0, years: 1 })
  if (sc.price || sc.depositPct || hasErrors(validateSavings(i))) return null
  const targetDeposit = (i.price * i.depositPct) / 100
  const shortfall = Math.max(0, targetDeposit - i.savings)
  const progress = targetDeposit <= 0 ? 1 : Math.min(1, i.savings / targetDeposit)
  let months: number | null
  if (shortfall <= 0) months = 0
  else if (i.monthly <= 0) months = null
  else months = Math.ceil(shortfall / i.monthly - 1e-9) // zero investment return
  return { targetDeposit, shortfall, months, progress }
}

export interface UpfrontFees {
  conveyancing: number
  inspections: number
  moving: number
  duty: number
  other: number
}

export const DEFAULT_FEES: UpfrontFees = { conveyancing: 1500, inspections: 600, moving: 800, duty: 0, other: 0 }

export function validateFees(f: UpfrontFees): Partial<Record<keyof UpfrontFees, string>> {
  const e: Partial<Record<keyof UpfrontFees, string>> = {}
  for (const k of Object.keys(f) as (keyof UpfrontFees)[]) {
    if (!ok(f[k]) || f[k] < 0) e[k] = 'Enter an amount of $0 or more.'
  }
  return e
}

export function calcUpfront(deposit: number, f: UpfrontFees): { fees: number; total: number } | null {
  if (!ok(deposit) || deposit < 0 || hasErrors(validateFees(f))) return null
  const fees = f.conveyancing + f.inspections + f.moving + f.duty + f.other
  return { fees, total: deposit + fees }
}
