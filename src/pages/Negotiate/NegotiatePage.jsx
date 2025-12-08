import { useState } from 'react'
import { FIRESTORE_ENABLED, getDb, getFirestoreHelpers } from '../../services/firebaseConfig.js'

const unitTypes = ['Studio', '1BR', '2BR', '3BR+']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const leaseLengths = ['6', '12', '24']
const winterMonths = new Set(['Nov', 'Dec', 'Jan', 'Feb'])

export default function NegotiatePage() {
  const [form, setForm] = useState({
    city: '',
    neighborhood: '',
    address: '',
    listedRent: '',
    unitType: '',
    leaseStart: '',
    leaseLength: '12',
    isRenewal: false,
    currentRent: '',
  })
  const [reportVisible, setReportVisible] = useState(false)
  const [report, setReport] = useState(null)
  const [errors, setErrors] = useState({})
  const [copied, setCopied] = useState(false)
  const [logEnabled, setLogEnabled] = useState(() => FIRESTORE_ENABLED)

  const formatCurrency = (value) => {
    const numeric = Number(value)
    if (Number.isNaN(numeric)) return '$0'
    return `$${Math.round(numeric).toLocaleString('en-US')}`
  }

  const updateField = (field) => (event) => {
    const value = field === 'isRenewal' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.city.trim()) nextErrors.city = 'City is required.'
    if (!form.listedRent) nextErrors.listedRent = 'Listed / renewal rent is required.'
    if (!form.unitType) nextErrors.unitType = 'Unit type is required.'
    if (!form.leaseLength) nextErrors.leaseLength = 'Lease length is required.'
    if (form.isRenewal && !form.currentRent) nextErrors.currentRent = 'Current rent is required for renewals.'
    return nextErrors
  }

  const logNegotiation = async (payload) => {
    if (!logEnabled || !FIRESTORE_ENABLED) return
    try {
      const db = await getDb()
      const helpers = getFirestoreHelpers()
      if (!db || !helpers?.addDoc || !helpers?.collection || !helpers?.serverTimestamp) return
      await helpers.addDoc(helpers.collection(db, 'negotiationRequests'), {
        ...payload,
        timestamp: helpers.serverTimestamp(),
      })
    } catch (error) {
      console.error('Failed to log negotiation', error)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setReportVisible(false)
      setReport(null)
      return
    }
    setErrors({})

    const listed = Number(form.listedRent) || 0
    const current = Number(form.currentRent) || 0

    if (form.isRenewal) {
      const increaseAmount = listed - current
      const increasePercent = current > 0 ? (increaseAmount / current) * 100 : 0

      let summary = 'Standard increase - negotiation possible but leverage is lower.'
      let counterSuggestion = 'Suggest a small reduction or ask for a concession (e.g. 1 free month).'
      let recommendedRange = null

      if (increasePercent > 10) {
        summary = 'Aggressive increase - strong case for negotiation.'
        const low = current + increaseAmount * 0.25
        const high = current + increaseAmount * 0.5
        recommendedRange = { low, high, note: '50-75% reduction of the increase' }
        counterSuggestion = `Counter between ${formatCurrency(low)} and ${formatCurrency(high)} (50-75% reduction of the increase).`
      } else if (increasePercent >= 5) {
        summary = 'Moderate increase - reasonable to push back.'
        const low = current + increaseAmount * 0.5
        const high = current + increaseAmount * 0.75
        recommendedRange = { low, high, note: '25-50% reduction of the increase' }
        counterSuggestion = `Counter between ${formatCurrency(low)} and ${formatCurrency(high)} (25-50% reduction of the increase).`
      } else {
        const smallReduction = Math.max(50, Math.min(150, increaseAmount || 75))
        const target = Math.max(current, listed - smallReduction)
        recommendedRange = { low: target, high: listed, note: 'Small reduction or concession' }
        counterSuggestion = `Ask for a small reduction (around ${formatCurrency(target)}) or request a concession like 1 free month.`
      }

      const addressLine = form.address ? `${form.address}, ` : ''
      const leverageSummary = `${formatCurrency(listed)} proposed vs ${formatCurrency(current)} current (${increasePercent.toFixed(1)}% increase).`

      const emailScript = [
        `Hi [Name],`,
        '',
        `Thanks for sending the renewal for ${addressLine}${form.city || 'your property'}. The proposed rent is ${formatCurrency(listed)} (up from ${formatCurrency(current)}), a ${increasePercent.toFixed(1)}% increase.`,
        '',
        `Given current market conditions, I'd like to renew at ${recommendedRange ? `${formatCurrency(recommendedRange.low)}-${formatCurrency(recommendedRange.high)}` : 'a modest reduction'} and can sign promptly.`,
        `If that's not workable, I'm open to a small concession (e.g. one free month or minor upgrades).`,
        '',
        `Thanks for considering,`,
        `[Your Name]`,
      ].join('\n')

      const nextReport = {
        mode: 'renewal',
        summary,
        counterSuggestion,
        leverageSummary,
        stats: {
          increaseAmount,
          increasePercent,
        },
        recommendedRange,
        emailScript,
      }

      setReport(nextReport)
      setReportVisible(true)
      void logNegotiation({
        city: form.city,
        neighborhood: form.neighborhood || null,
        address: form.address || null,
        listedRent: listed,
        currentRent: current || null,
        isRenewal: true,
        leaseStartMonth: form.leaseStart || null,
        leaseLength: form.leaseLength,
        unitType: form.unitType,
        increasePercent: Number.isFinite(increasePercent) ? Number(increasePercent.toFixed(2)) : null,
        recommendationSummary: summary,
      })
    } else {
      const isWinterStart = winterMonths.has(form.leaseStart)
      const isLongTerm = form.leaseLength === '24'
      const isShortTerm = form.leaseLength === '6'

      const leverageParts = []
      if (isWinterStart) leverageParts.push('winter start (landlords prioritize occupancy)')
      if (isLongTerm) leverageParts.push('24-month term offers stability')
      if (isShortTerm) leverageParts.push('6-month term is less attractive')
      const leverageSummary = leverageParts.length ? leverageParts.join(' + ') : 'Standard timing and term'

      let counterSuggestion = ''
      let discountRange = ''
      if (listed < 2000) {
        discountRange = '$50-$150 off'
        counterSuggestion = 'Ask for $50-$150 off the monthly rent.'
      } else if (listed < 3500) {
        discountRange = '$100-$300 off'
        counterSuggestion = 'Ask for $100-$300 off the monthly rent.'
      } else {
        discountRange = '$150-$500 off or 1 month free'
        counterSuggestion = 'Ask for $150-$500 off the monthly rent or request 1 month free.'
      }

      const emailScript = [
        `Hi [Name],`,
        '',
        `I'm interested in ${form.address ? `${form.address}, ` : ''}${form.city || 'the unit'} listed at ${formatCurrency(listed)}.`,
        `Given ${leverageSummary.toLowerCase()}, I'd like to propose ${discountRange.toLowerCase()} in exchange for a quick, clean application.`,
        '',
        `If a rent reduction isn't possible, would you consider a concession such as one free month or a minor upgrade?`,
        '',
        `Thanks for considering,`,
        `[Your Name]`,
      ].join('\n')

      const nextReport = {
        mode: 'new',
        summary: leverageParts.length ? 'Winter start +/or term strength = higher leverage.' : 'Normal leverage based on timing and term.',
        counterSuggestion,
        leverageSummary,
        stats: {
          listed,
          leaseStart: form.leaseStart,
          leaseLength: form.leaseLength,
        },
        recommendedRange: null,
        emailScript,
        discountRange,
      }

      setReport(nextReport)
      setReportVisible(true)
      void logNegotiation({
        city: form.city,
        neighborhood: form.neighborhood || null,
        address: form.address || null,
        listedRent: listed,
        currentRent: null,
        isRenewal: false,
        leaseStartMonth: form.leaseStart || null,
        leaseLength: form.leaseLength,
        unitType: form.unitType,
        increasePercent: null,
        recommendationSummary: nextReport.summary,
      })
    }
  }

  const handleCopy = async () => {
    if (!report || !report.emailScript) return
    try {
      await navigator.clipboard.writeText(report.emailScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      setCopied(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Rent Negotiation Tool</h1>
        <p className="text-slate-600">Enter your lease details to generate a negotiation report.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">How this tool works</h2>
          <p className="mt-2 text-sm text-slate-700">
            We apply simple heuristics: renewals compare your current rent to the proposed increase; new leases consider seasonality and lease length. The goal is to help you frame a negotiation, not to predict outcomes.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              id="toggleLogging"
              type="checkbox"
              checked={logEnabled && FIRESTORE_ENABLED}
              onChange={(e) => setLogEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              disabled={!FIRESTORE_ENABLED}
            />
            <label htmlFor="toggleLogging" className="text-xs font-medium text-slate-700">
              Log submissions (Firestore) for analysis
            </label>
            {!FIRESTORE_ENABLED && <span className="text-xs text-slate-500">(disabled in this environment)</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <section className="md:col-span-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Lease details</h2>

            {Object.keys(errors).length > 0 && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Please fill in the required fields below.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={updateField('city')}
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="e.g. San Francisco"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Neighborhood (optional)</label>
                  <input
                    type="text"
                    value={form.neighborhood}
                    onChange={updateField('neighborhood')}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="e.g. Mission District"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Property Address (optional)</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={updateField('address')}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Listed / Renewal Rent</label>
                  <input
                    type="number"
                    value={form.listedRent}
                    onChange={updateField('listedRent')}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="e.g. 3200"
                    min="0"
                  />
                  {errors.listedRent && <p className="mt-1 text-xs text-red-600">{errors.listedRent}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Unit Type</label>
                  <select
                    value={form.unitType}
                    onChange={updateField('unitType')}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="" disabled>
                      Select unit type
                    </option>
                    {unitTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.unitType && <p className="mt-1 text-xs text-red-600">{errors.unitType}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Lease Start Month</label>
                  <select
                    value={form.leaseStart}
                    onChange={updateField('leaseStart')}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="" disabled>
                      Select month
                    </option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Lease Length</label>
                  <select
                    value={form.leaseLength}
                    onChange={updateField('leaseLength')}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    {leaseLengths.map((length) => (
                      <option key={length} value={length}>
                        {length} months
                      </option>
                    ))}
                  </select>
                  {errors.leaseLength && <p className="mt-1 text-xs text-red-600">{errors.leaseLength}</p>}
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="isRenewal"
                    type="checkbox"
                    checked={form.isRenewal}
                    onChange={updateField('isRenewal')}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                  <label htmlFor="isRenewal" className="text-sm font-medium text-slate-700">
                    Is this a renewal?
                  </label>
                </div>
              </div>

              {form.isRenewal && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Current Rent</label>
                  <input
                    type="number"
                    value={form.currentRent}
                    onChange={updateField('currentRent')}
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="e.g. 2950"
                    min="0"
                  />
                  {errors.currentRent && <p className="mt-1 text-xs text-red-600">{errors.currentRent}</p>}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex w-full justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
                >
                  Generate report
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="md:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">RentMagnify Negotiation Report</h2>
            {!reportVisible || !report ? (
              <p className="mt-3 text-sm text-slate-600">Submit the form to generate a tailored negotiation outline.</p>
            ) : (
              <div className="mt-4 space-y-6 text-sm text-slate-800">
                <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                  <div className="grid gap-3">
                    {report.mode === 'renewal' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Current rent</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(form.currentRent)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Proposed rent</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(form.listedRent)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Increase</span>
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(report.stats.increaseAmount)} ({report.stats.increasePercent.toFixed(1)}%)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Listed rent</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(report.stats.listed)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Lease start</span>
                          <span className="font-semibold text-slate-900">{form.leaseStart || 'TBD'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Lease length</span>
                          <span className="font-semibold text-slate-900">{form.leaseLength || '—'} months</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Unit type</span>
                          <span className="font-semibold text-slate-900">{form.unitType || '—'}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-slate-600">Leverage assessment</span>
                      <span className="font-semibold text-slate-900 text-right">{report.leverageSummary}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4">
                  <h3 className="text-sm font-semibold text-indigo-900">Recommended counter-offer</h3>
                  <p className="mt-2 text-base font-semibold text-indigo-900">{report.counterSuggestion}</p>
                  {report.mode === 'renewal' && report.recommendedRange && (
                    <p className="mt-1 text-sm text-indigo-800">
                      Target range: {formatCurrency(report.recommendedRange.low)} - {formatCurrency(report.recommendedRange.high)} ({report.recommendedRange.note})
                    </p>
                  )}
                  {report.mode === 'new' && report.discountRange && (
                    <p className="mt-1 text-sm text-indigo-800">Suggested ask: {report.discountRange}</p>
                  )}
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Email / script</h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        Copy email
                      </button>
                      {copied && <span className="text-xs text-green-600">Copied!</span>}
                    </div>
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-800">
                    {report.emailScript}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Disclaimer</h3>
        <p className="mt-2">
          This tool offers general guidance based on simple rules; it is not legal, financial, or professional housing advice. Always verify information, consider your circumstances, and use your own judgment before making decisions.
        </p>
      </div>
    </div>
  )
}
