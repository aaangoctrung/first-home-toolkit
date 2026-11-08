const aud0 = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 })
const aud2 = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const money = (n: number) => (Number.isFinite(n) ? aud0.format(n) : '—')
export const moneyCents = (n: number) => (Number.isFinite(n) ? aud2.format(n) : '—')
export const pct = (n: number) => `${Number.isFinite(n) ? +n.toFixed(2) : '—'}%`

export function monthsLabel(months: number): string {
  if (months <= 0) return 'Now'
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts: string[] = []
  if (y) parts.push(`${y} ${y === 1 ? 'year' : 'years'}`)
  if (m) parts.push(`${m} ${m === 1 ? 'month' : 'months'}`)
  return parts.join(' ')
}

export function monthYearFromNow(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })
}
