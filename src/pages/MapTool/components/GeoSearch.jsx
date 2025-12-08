import { useMemo, useState } from 'react'

const PLACES = [
  { name: 'New York, NY', lat: 40.7128, lng: -74.006, zoom: 12 },
  { name: 'Manhattan, NY', lat: 40.7831, lng: -73.9712, zoom: 13 },
  { name: 'Brooklyn, NY', lat: 40.6782, lng: -73.9442, zoom: 12 },
  { name: 'Queens, NY', lat: 40.7282, lng: -73.7949, zoom: 12 },
  { name: 'Hoboken, NJ', lat: 40.743, lng: -74.0324, zoom: 13 },
  { name: 'Jersey City, NJ', lat: 40.7178, lng: -74.0431, zoom: 12 },
]

export default function GeoSearch({ onPick }) {
  const [q, setQ] = useState('')
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return PLACES.filter(p => p.name.toLowerCase().includes(s)).slice(0, 6)
  }, [q])

  function choose(p) {
    onPick?.(p)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="Search city or area"
        className="h-10 w-64 rounded-lg border border-slate-300 bg-white px-3 text-sm"
      />
      {matches.length > 0 && (
        <div className="absolute mt-12 w-64 rounded-lg border border-slate-200 bg-white shadow">
          {matches.map((p) => (
            <button key={p.name} onClick={()=>choose(p)} className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50">
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

