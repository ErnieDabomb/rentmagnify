import { useEffect, useMemo, useState } from 'react'
import { addSubmission, getDeviceId, lastSubmissionAtForDevice, listSubmissions } from '../../services/dataStore'
import { useToast } from '../../components/ToastProvider'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const HOURS_72 = 72 * 60 * 60 * 1000

export default function SubmitPage() {
  const [form, setForm] = useState({
    title: '',
    rent: '',
    beds: 1,
    baths: 1,
    washerDryer: false,
    hvac: false,
    pets: false,
    address: '',
    lat: '',
    lng: '',
    available: '',
    notes: '',
  })
  const [status, setStatus] = useState('idle') // idle | saving | success | error
  const [error, setError] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [lastTime, setLastTime] = useState(0)
  const [successListing, setSuccessListing] = useState(null)
  const { show } = useToast()

  const deviceId = useMemo(() => getDeviceId(), [])
  const nextAllowedAt = useMemo(() => (lastTime ? lastTime + HOURS_72 : 0), [lastTime])
  const now = Date.now()
  const rateLimited = nextAllowedAt && now < nextAllowedAt
  const waitHrs = Math.ceil((nextAllowedAt - now) / (60 * 60 * 1000))

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const [list, last] = await Promise.all([
          listSubmissions(),
          lastSubmissionAtForDevice(deviceId),
        ])
        if (alive) {
          setSubmissions(list || [])
          setLastTime(last || 0)
        }
      } catch {
        // silent fallback
      }
    }
    load()
    return () => { alive = false }
  }, [deviceId])

  const duplicateWarning = useMemo(() => {
    const addr = (form.address || '').trim().toLowerCase()
    if (!addr || !submissions.length) return ''
    const THIRTY_D = 30 * 24 * 60 * 60 * 1000
    const since = Date.now() - THIRTY_D
    const dupe = submissions.some((s) => {
      const a = (s.data.address || '').trim().toLowerCase()
      return s.createdAt >= since && a === addr
    })
    return dupe ? 'Similar address was submitted recently. Please ensure your info is up to date.' : ''
  }, [form.address, submissions])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  function validate() {
    const errors = []
    const r = Number(form.rent)
    const lat = Number(form.lat)
    const lng = Number(form.lng)
    if (!form.address && (!Number.isFinite(lat) || !Number.isFinite(lng))) errors.push('Provide an address or coordinates')
    if (!Number.isFinite(r) || r <= 0) errors.push('Rent must be a positive number')
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.push('Latitude must be between -90 and 90')
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) errors.push('Longitude must be between -180 and 180')
    // Basic duplicate hygiene: same address+rent within last 30 days
    const normAddr = (form.address || '').trim().toLowerCase()
    const THIRTY_D = 30 * 24 * 60 * 60 * 1000
    const since = Date.now() - THIRTY_D
    const existing = submissions.some((s) => {
      const a = (s.data.address || '').trim().toLowerCase()
      return s.createdAt >= since && a === normAddr && Number(s.data.rent) === r
    })
    if (existing) errors.push('A similar submission was recently received for this address and rent')
    return errors
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (rateLimited) return
    const errs = validate()
    if (errs.length) {
      setError(errs[0])
      return
    }
    setStatus('saving')
    try {
      await addSubmission({ ...form, rent: Number(form.rent), beds: Number(form.beds), baths: Number(form.baths), lat: Number(form.lat), lng: Number(form.lng) })
      const list = await listSubmissions()
      setSubmissions(list || [])
      setLastTime(Date.now())
      setSuccessListing({ ...form })
      setStatus('success')
      show('Thanks for sharing! Submitted for review.', 'success')
    } catch (e) {
      setStatus('error')
      setError(e?.message || 'Failed to submit')
    }
  }

  return (
    <div className="max-w-2xl mx-auto grid gap-4">
      <div className="mb-1 inline-block rounded-full border border-indigo-600/25 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 px-2 py-0.5 text-xs font-medium text-indigo-900">Contribute</div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Share</span> Your Rent
      </h1>
      <div className="mt-1 mb-2 text-sm text-slate-500">Anonymous, privacy-first</div>
      <p className="text-slate-600">Help other renters by anonymously sharing your rent. Submissions are reviewed before appearing on the map.</p>

      {rateLimited && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
          Thanks for contributing! You can submit again in ~{waitHrs}h.
        </div>
      )}

      {status === 'success' ? (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-3 text-emerald-800 grid gap-2">
          <div className="font-semibold">Submission received. We’ll review it soon. Thank you!</div>
          {successListing && (
            <div className="flex flex-wrap gap-2 text-sm text-emerald-900">
              <span className="rounded-full bg-white/70 px-2 py-1 font-semibold">${Number(successListing.rent).toLocaleString()}</span>
              <span className="rounded-full bg-white/70 px-2 py-1 font-semibold">{successListing.beds} bd / {successListing.baths} ba</span>
              {successListing.address && <span className="rounded-full bg-white/70 px-2 py-1">{successListing.address}</span>}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => window.location.assign('/map')}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:brightness-105"
            >
              Watch on map
            </button>
            <button
              onClick={() => setStatus('idle')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Submit another
            </button>
          </div>
        </div>
      ) : (
        <form className="grid gap-3" onSubmit={onSubmit}>
          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Address (or building)</label>
            <input className={`border rounded-lg px-3 py-2 ${error && !form.address ? 'border-red-400' : ''}`} value={form.address} onChange={(e)=>set({address:e.target.value})} placeholder="123 Main St, City" />
            {!!duplicateWarning && (
              <div className="text-xs text-amber-700">{duplicateWarning}</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-700">Monthly Rent (USD)</label>
              <input className={`border rounded-lg px-3 py-2 w-full ${error && (!form.rent || Number(form.rent) <= 0) ? 'border-red-400' : ''}`} type="number" value={form.rent} onChange={(e)=>set({rent:e.target.value})} />
              <div className="text-xs text-slate-500">Enter whole dollars, e.g., 2450</div>
            </div>
            <div>
              <label className="text-sm text-slate-700">Available On</label>
              <input className="border rounded-lg px-3 py-2 w-full" type="date" value={form.available} onChange={(e)=>set({available:e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-slate-700">Beds</label>
              <input className="border rounded-lg px-3 py-2 w-full" type="number" value={form.beds} min={0} onChange={(e)=>set({beds:e.target.value})} />
            </div>
            <div>
              <label className="text-sm text-slate-700">Baths</label>
              <input className="border rounded-lg px-3 py-2 w-full" type="number" value={form.baths} min={1} onChange={(e)=>set({baths:e.target.value})} />
            </div>
            <div className="grid grid-cols-3 items-end gap-2">
              <label className="text-sm text-slate-700 col-span-3">Amenities</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.washerDryer} onChange={(e)=>set({washerDryer:e.target.checked})}/> In-unit W/D</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.hvac} onChange={(e)=>set({hvac:e.target.checked})}/> HVAC</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.pets} onChange={(e)=>set({pets:e.target.checked})}/> Pet friendly</label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-700">Latitude</label>
              <input className={`border rounded-lg px-3 py-2 w-full ${error && (!form.lat || Number(form.lat) < -90 || Number(form.lat) > 90) ? 'border-red-400' : ''}`} value={form.lat} onChange={(e)=>set({lat:e.target.value})} placeholder="40.7128" />
            </div>
            <div>
              <label className="text-sm text-slate-700">Longitude</label>
              <input className={`border rounded-lg px-3 py-2 w-full ${error && (!form.lng || Number(form.lng) < -180 || Number(form.lng) > 180) ? 'border-red-400' : ''}`} value={form.lng} onChange={(e)=>set({lng:e.target.value})} placeholder="-74.0060" />
            </div>
          </div>
          <PickOnMap lat={form.lat} lng={form.lng} onPick={(lat,lng)=>set({lat, lng})} />
          <div className="grid gap-1">
            <label className="text-sm text-slate-700">Notes (optional)</label>
            <textarea className="border rounded-lg px-3 py-2" rows={3} value={form.notes} onChange={(e)=>set({notes:e.target.value})} />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button disabled={status==='saving'||rateLimited} className="rounded-lg bg-indigo-600 text-white px-4 py-2 disabled:opacity-50">
              {status==='saving' ? 'Submitting...' : 'Submit'}
            </button>
            {rateLimited && <span className="text-sm text-slate-600">Limit: 1 submission per 72h</span>}
          </div>
        </form>
      )}
    </div>
  )
}

function PickOnMap({ lat, lng, onPick }) {
  const center = useMemo(() => {
    const la = Number(lat), ln = Number(lng)
    if (Number.isFinite(la) && Number.isFinite(ln)) return [la, ln]
    return [40.73, -73.93] // NYC default
  }, [lat, lng])

  function ClickHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        onPick(Number(lat.toFixed(6)), Number(lng.toFixed(6)))
      }
    })
    return null
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-700">Pick on map (click to set coordinates)</label>
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const la = Number(pos.coords.latitude.toFixed(6))
                const ln = Number(pos.coords.longitude.toFixed(6))
                onPick(la, ln)
              })
            }
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50"
        >
          Use my location
        </button>
      </div>
      <div style={{ height: 260 }} className="overflow-hidden rounded-xl border border-slate-200">
        <MapContainer center={center} zoom={12} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='\u00A9 OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            errorTileUrl={"data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='256' height='256' fill='#f1f5f9'/><path d='M0 0L256 256M256 0L0 256' stroke='#cbd5e1' stroke-width='1'/></svg>")}
          />
          <ClickHandler />
          {Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) && (
            <Marker position={[Number(lat), Number(lng)]} />
          )}
        </MapContainer>
      </div>
    </div>
  )
}
