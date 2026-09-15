import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useListings } from '../../hooks/useListings'
import { formatCurrency } from '../../utils/currency'

const COMFORTABLE_SHARE = 0.25
const MAX_SHARE = 0.3

export default function AffordabilityPage() {
  const navigate = useNavigate()
  const { listings, loading } = useListings()
  const [income, setIncome] = useState('')

  const annualIncome = Number(income) || 0
  const hasIncome = annualIncome > 0
  const monthlyIncome = annualIncome / 12
  const comfortable = monthlyIncome * COMFORTABLE_SHARE
  const maxRecommended = monthlyIncome * MAX_SHARE

  const matches = useMemo(() => {
    if (!hasIncome) return []
    return listings.filter((l) => typeof l.rent === 'number' && l.rent >= comfortable && l.rent <= maxRecommended)
  }, [listings, hasIncome, comfortable, maxRecommended])

  const viewOnMap = () => {
    const params = new URLSearchParams({
      rentMin: String(Math.round(comfortable)),
      rentMax: String(Math.round(maxRecommended)),
    })
    navigate(`/map?${params.toString()}`)
  }

  return (
    <div className="max-w-2xl mx-auto grid gap-4">
      <div className="mb-1 inline-block rounded-full border border-indigo-600/25 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 px-2 py-0.5 text-xs font-medium text-indigo-900">
        Tool
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Affordability Checker</h1>
      <p className="text-slate-600">
        Enter your gross annual income to see a recommended rent range, and how many current listings actually fall
        within it.
      </p>

      <div className="grid gap-1">
        <label className="text-sm text-slate-700" htmlFor="income">
          Annual income (gross, before taxes)
        </label>
        <input
          id="income"
          type="number"
          min={0}
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="e.g., 85000"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {hasIncome && (
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended rent range</div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(comfortable)} &ndash; {formatCurrency(maxRecommended)}{' '}
            <span className="text-sm font-normal text-slate-500">/ month</span>
          </div>
          <div className="text-xs text-slate-500">
            Based on the standard guideline of spending 25&ndash;30% of your gross monthly income (
            {formatCurrency(monthlyIncome)}/mo) on rent. This is a general guideline, not financial advice &mdash;
            your own budget and debts matter too.
          </div>

          <div className="mt-2 border-t border-slate-200 pt-3">
            {loading ? (
              <div className="text-sm text-slate-500">Checking current listings...</div>
            ) : (
              <>
                <div className="text-sm text-slate-700">
                  <span className="font-semibold">{matches.length}</span> of {listings.length} current listing
                  {listings.length === 1 ? '' : 's'} fall in this range.
                </div>
                <button
                  onClick={viewOnMap}
                  className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
                >
                  View matching listings on map
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
