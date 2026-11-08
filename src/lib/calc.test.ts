import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SCENARIO, calcMortgage, calcSavings, calcStress, calcUpfront, DEFAULT_FEES,
  monthlyRepayment, validateScenario, hasErrors,
} from './calc'

describe('monthlyRepayment', () => {
  it('matches a known regular case ($520k, 6%, 30y)', () => {
    expect(monthlyRepayment(520000, 6, 30)).toBeCloseTo(3117.66, 1)
  })
  it('handles a zero rate', () => {
    expect(monthlyRepayment(360000, 0, 30)).toBeCloseTo(1000, 6)
  })
  it('returns 0 for invalid input, never NaN', () => {
    expect(monthlyRepayment(NaN, 6, 30)).toBe(0)
    expect(monthlyRepayment(-1, 6, 30)).toBe(0)
    expect(monthlyRepayment(100000, 6, 0)).toBe(0)
    expect(monthlyRepayment(100000, Infinity, 30)).toBe(0)
  })
})

describe('calcMortgage', () => {
  it('computes the default scenario', () => {
    const r = calcMortgage(DEFAULT_SCENARIO)!
    expect(r.deposit).toBe(130000)
    expect(r.principal).toBe(520000)
    expect(r.totalInterest).toBeCloseTo(r.monthly * 360 - 520000, 4)
  })
  it('handles a 100% deposit', () => {
    const r = calcMortgage({ ...DEFAULT_SCENARIO, depositPct: 100 })!
    expect(r.principal).toBe(0)
    expect(r.monthly).toBe(0)
    expect(r.totalInterest).toBe(0)
  })
  it('rejects invalid inputs', () => {
    expect(calcMortgage({ ...DEFAULT_SCENARIO, price: -5 })).toBeNull()
    expect(calcMortgage({ ...DEFAULT_SCENARIO, depositPct: 101 })).toBeNull()
    expect(calcMortgage({ ...DEFAULT_SCENARIO, years: NaN })).toBeNull()
    expect(hasErrors(validateScenario({ ...DEFAULT_SCENARIO, rate: -1 }))).toBe(true)
  })
})

describe('calcStress', () => {
  it('increases repayments as rates rise', () => {
    const rows = calcStress(DEFAULT_SCENARIO)!
    expect(rows).toHaveLength(4)
    expect(rows[0].increase).toBeCloseTo(0, 8)
    expect(rows[1].increase).toBeGreaterThan(0)
    expect(rows[3].monthly).toBeGreaterThan(rows[2].monthly)
  })
})

describe('calcSavings', () => {
  const base = { price: 650000, depositPct: 20, savings: 40000, monthly: 2000 }
  it('calculates shortfall and months (zero return)', () => {
    const r = calcSavings(base)!
    expect(r.shortfall).toBe(90000)
    expect(r.months).toBe(45)
    expect(r.progress).toBeCloseTo(40000 / 130000, 8)
  })
  it('rounds months up', () => {
    expect(calcSavings({ ...base, monthly: 2500 })!.months).toBe(36)
    expect(calcSavings({ ...base, monthly: 2600 })!.months).toBe(35)
  })
  it('handles zero monthly contribution', () => {
    expect(calcSavings({ ...base, monthly: 0 })!.months).toBeNull()
  })
  it('is complete when savings already cover the target', () => {
    const r = calcSavings({ ...base, savings: 200000, monthly: 0 })!
    expect(r.months).toBe(0)
    expect(r.progress).toBe(1)
  })
  it('handles a 100% deposit target and invalid inputs', () => {
    expect(calcSavings({ ...base, depositPct: 100 })!.targetDeposit).toBe(650000)
    expect(calcSavings({ ...base, savings: -1 })).toBeNull()
    expect(calcSavings({ ...base, price: NaN })).toBeNull()
  })
})

describe('calcUpfront', () => {
  it('adds deposit and fees', () => {
    const r = calcUpfront(130000, { ...DEFAULT_FEES, duty: 30000 })!
    expect(r.fees).toBe(1500 + 600 + 800 + 30000)
    expect(r.total).toBe(130000 + r.fees)
  })
  it('rejects negative or non-finite values', () => {
    expect(calcUpfront(100, { ...DEFAULT_FEES, other: -1 })).toBeNull()
    expect(calcUpfront(NaN, DEFAULT_FEES)).toBeNull()
  })
})
