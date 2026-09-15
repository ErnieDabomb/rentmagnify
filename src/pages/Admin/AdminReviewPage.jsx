import { useCallback, useEffect, useMemo, useState } from 'react'
import { listAllReports, updateRentReportStatus } from '../../services/dataStore'
import { getFirebaseApp } from '../../services/firebaseConfig'
import { useToast } from '../../components/ToastProvider'

export default function AdminReviewPage() {
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [iqr, setIqr] = useState({ low: null, high: null })
  const { show } = useToast()

  const PASS = useMemo(() => import.meta.env?.VITE_ADMIN_PASS || 'rentmagnify', [])
  const [ok, setOk] = useState(() => localStorage.getItem('rm_admin_ok') === '1')
  const [pw, setPw] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPw, setAuthPw] = useState('')
  const FIRESTORE_ENABLED = import.meta.env.VITE_ENABLE_FIRESTORE === 'true'
  const USE_EMULATOR = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listAllReports(tab)
      const rents = (list || []).map((s) => Number(s.data?.rent)).filter(Number.isFinite).sort((a,b)=>a-b)
      let low = null, high = null
      if (rents.length >= 4) {
        const q1 = rents[Math.floor(rents.length * 0.25)]
        const q3 = rents[Math.floor(rents.length * 0.75)]
        const iqrVal = q3 - q1
        low = q1 - 3 * iqrVal
        high = q3 + 3 * iqrVal
      }
      setIqr({ low, high })
      setItems(list || [])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { if (ok) refresh() }, [ok, refresh])

  if (!ok) {
    const tryFirebase = async () => {
      try {
        const [app, mod] = await Promise.all([getFirebaseApp(), import('firebase/auth')])
        const auth = mod.getAuth(app)
        if (USE_EMULATOR) {
          mod.connectAuthEmulator(auth, `http://${USE_EMULATOR}`)
        }
        await mod.signInWithEmailAndPassword(auth, authEmail, authPw)
        localStorage.setItem('rm_admin_ok', '1')
        setOk(true)
        show('Signed in', 'success')
      } catch (e) {
        show(e?.message || 'Firebase sign-in failed', 'error')
      }
    }

    return (
      <div className="max-w-sm mx-auto grid gap-3">
        <h1 className="text-xl font-bold">Admin Access</h1>
        <p className="text-sm text-slate-600">Enter passcode to continue.</p>
        <input
          type="password"
          value={pw}
          onChange={(e)=>setPw(e.target.value)}
          className="border rounded-lg px-3 py-2"
          placeholder="Passcode"
        />
        <button
          onClick={() => {
            if ((pw || '') === PASS) {
              localStorage.setItem('rm_admin_ok', '1')
              setOk(true)
              show('Admin unlocked', 'success')
            } else {
              show('Invalid passcode', 'error')
            }
          }}
          className="rounded-lg bg-slate-900 text-white px-3 py-2"
        >
          Unlock
        </button>
        {FIRESTORE_ENABLED && (
          <div className="mt-4 grid gap-2 rounded-lg border border-slate-200 p-3">
            <div className="text-sm font-semibold text-slate-800">Or Firebase sign-in (optional)</div>
            <input
              type="email"
              value={authEmail}
              onChange={(e)=>setAuthEmail(e.target.value)}
              className="border rounded-lg px-3 py-2"
              placeholder="email@example.com"
            />
            <input
              type="password"
              value={authPw}
              onChange={(e)=>setAuthPw(e.target.value)}
              className="border rounded-lg px-3 py-2"
              placeholder="Password"
            />
            <button onClick={tryFirebase} className="rounded-lg bg-indigo-600 text-white px-3 py-2">
              Sign in with Firebase
            </button>
            <p className="text-xs text-slate-500">
              For no-billing path, point FIRESTORE_EMULATOR_HOST to your emulator (e.g., localhost:9099).
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto grid gap-4">
      <h1 className="text-2xl font-bold">Admin Review</h1>
      <div className="flex gap-2">
        <button className={`rounded px-3 py-1.5 border ${tab==='pending'?'bg-slate-900 text-white':'bg-white'}`} onClick={()=>setTab('pending')}>Pending</button>
        <button className={`rounded px-3 py-1.5 border ${tab==='approved'?'bg-slate-900 text-white':'bg-white'}`} onClick={()=>setTab('approved')}>Approved</button>
        <button className={`rounded px-3 py-1.5 border ${tab==='rejected'?'bg-slate-900 text-white':'bg-white'}`} onClick={()=>setTab('rejected')}>Rejected</button>
      </div>
      {loading && <div className="text-sm text-slate-500">Loading...</div>}
      <div className="grid gap-3">
        {items.map((s)=> (
          <div key={s.id} className="rounded-lg border p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{s.data.title || s.data.address || 'Listing'}</div>
              <div className="text-sm text-slate-500">${s.data.rent?.toLocaleString?.() || s.data.rent} · {s.data.beds}bd/{s.data.baths}ba</div>
            </div>
            <div className="text-sm text-slate-600">{s.data.address}</div>
            {iqr.low !== null && iqr.high !== null && (s.data.rent < iqr.low || s.data.rent > iqr.high) && (
              <div className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                Possible outlier vs IQR: outside ${Math.round(iqr.low)} - ${Math.round(iqr.high)}
              </div>
            )}
            {tab==='pending' && (
              <div className="mt-2 flex gap-2">
                <button className="rounded bg-emerald-600 text-white px-3 py-1.5" onClick={async ()=>{await updateRentReportStatus(s.id,'approved'); refresh(); show('Approved', 'success')}}>Approve</button>
                <button className="rounded bg-red-600 text-white px-3 py-1.5" onClick={async ()=>{await updateRentReportStatus(s.id,'rejected'); refresh(); show('Rejected', 'success')}}>Reject</button>
              </div>
            )}
          </div>
        ))}
        {items.length===0 && <div className="text-sm text-slate-600">No items.</div>}
      </div>
    </div>
  )
}
