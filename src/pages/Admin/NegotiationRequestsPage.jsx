import { useEffect, useState } from 'react'
import { FIRESTORE_ENABLED, getDb, getFirestoreHelpers } from '../../services/firebaseConfig.js'
import { formatCurrency } from '../../utils/currency.js'

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

export default function NegotiationRequestsPage() {
  const [records, setRecords] = useState([])
  const [lastDoc, setLastDoc] = useState(null)
  const [cursorStack, setCursorStack] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!FIRESTORE_ENABLED) {
      setLoaded(true)
    }
  }, [])

  const fetchPage = async (cursor) => {
    setLoading(true)
    setError(null)
    try {
      const db = await getDb()
      const helpers = getFirestoreHelpers()
      if (!db || !helpers?.collection || !helpers?.getDocs || !helpers?.query || !helpers?.orderBy || !helpers?.limit) {
        throw new Error('Firestore not initialized')
      }
      const constraints = [helpers.orderBy('timestamp', 'desc'), helpers.limit(20)]
      if (cursor && helpers.startAfter) constraints.push(helpers.startAfter(cursor))
      const q = helpers.query(helpers.collection(db, 'negotiationRequests'), ...constraints)
      const snapshot = await helpers.getDocs(q)
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setRecords(items)
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
      setLoaded(true)
    } catch (err) {
      console.error('Failed to load negotiation requests', err)
      setError('Could not load requests.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = () => {
    setCursorStack([])
    fetchPage(null)
  }

  const handleNext = () => {
    if (!lastDoc) return
    setCursorStack((prev) => [...prev, lastDoc])
    fetchPage(lastDoc)
  }

  const handlePrev = () => {
    setCursorStack((prev) => {
      const next = [...prev]
      next.pop()
      const cursor = next[next.length - 1] || null
      fetchPage(cursor)
      return next
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Negotiation Requests</h1>
        <p className="text-sm text-slate-600">Latest submissions (most recent 50).</p>
      </div>

      {!FIRESTORE_ENABLED && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Firestore is disabled (set VITE_ENABLE_FIRESTORE=true to enable logging).
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLoad}
          disabled={!FIRESTORE_ENABLED || loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {loaded ? 'Refresh' : 'Load requests'}
        </button>
        {loading && <span className="text-sm text-slate-600">Loading.</span>}
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loaded && !loading && !error && records.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">No records yet.</div>
      )}

      {records.length > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">City</th>
                  <th className="px-4 py-3 text-left">Renewal?</th>
                  <th className="px-4 py-3 text-left">Listed</th>
                  <th className="px-4 py-3 text-left">Current</th>
                  <th className="px-4 py-3 text-left">Increase %</th>
                  <th className="px-4 py-3 text-left">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{formatDate(row.timestamp)}</td>
                    <td className="px-4 py-3 text-slate-700">{row.city || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.isRenewal ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(row.listedRent, '-')}</td>
                    <td className="px-4 py-3 text-slate-700">{row.currentRent ? formatCurrency(row.currentRent) : '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.increasePercent != null ? `${Number(row.increasePercent).toFixed(1)}%` : '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{row.recommendationSummary || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={cursorStack.length === 0 || loading}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!lastDoc || records.length < 20 || loading}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
