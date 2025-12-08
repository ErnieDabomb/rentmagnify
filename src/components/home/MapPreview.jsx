import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useListings } from '../../hooks/useListings'
import { applyFilters } from '../../utils/filters'

export default function MapPreview() {
  const { listings, loading } = useListings()
  const filtered = useMemo(() => applyFilters(listings, {}), [listings])
  const sample = filtered.slice(0, 80)

  const center = useMemo(() => {
    if (!sample.length) return [40.73, -73.93]
    const lat = sample.reduce((s, l) => s + (l.lat || 0), 0) / sample.length
    const lng = sample.reduce((s, l) => s + (l.lng || 0), 0) / sample.length
    return [lat, lng]
  }, [sample])

  const [minRent, maxRent] = useMemo(() => {
    const rents = sample.map((l) => l.rent).filter((n) => typeof n === 'number')
    if (!rents.length) return [0, 0]
    return [Math.min(...rents), Math.max(...rents)]
  }, [sample])

  const colorFor = (rent) => {
    if (typeof rent !== 'number') return '#2563eb'
    if (rent <= 2500) return '#10b981'
    if (rent <= 3500) return '#f59e0b'
    return '#ef4444'
  }

  const radiusFor = (rent) => {
    if (typeof rent !== 'number' || minRent === maxRent) return 6
    const r = 4 + ((rent - minRent) / (maxRent - minRent)) * 6
    return Math.max(4, Math.min(10, Math.round(r)))
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Live Map Peek</div>
          <div className="text-sm text-slate-600">Transit-aware basemap</div>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-blue-700 shadow-sm">
          {loading ? 'Loading...' : `${sample.length} points`}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-[0_14px_36px_rgba(37,99,235,0.12)]">
        <MapContainer
          center={center}
          zoom={12}
          className="h-[260px] w-full bg-white"
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={false}
        >
          {/* Clean base similar to a schematic background */}
          <TileLayer
            attribution="© OpenStreetMap contributors | Carto"
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          />
          {/* Transit overlay to pull subway/rail lines & stations */}
          <TileLayer
            attribution="Transit © openstreetmap.fr contributors"
            url="https://{s}.tile.openstreetmap.fr/transport/{z}/{x}/{y}.png"
            opacity={0.85}
          />
          {sample.map((l) => (
            <CircleMarker
              key={l.id}
              center={[l.lat, l.lng]}
              radius={radiusFor(l.rent)}
              pathOptions={{ color: '#ffffff', weight: 1, fillColor: colorFor(l.rent), fillOpacity: 0.9 }}
            />
          ))}
        </MapContainer>
      </div>
      <div className="grid gap-2 rounded-xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-700 shadow-inner">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Train lines</div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'A', color: '#0039A6' },
            { label: 'C', color: '#0039A6' },
            { label: 'E', color: '#0039A6' },
            { label: '1', color: '#EE352E' },
            { label: '2', color: '#EE352E' },
            { label: '3', color: '#EE352E' },
            { label: '4', color: '#00933C' },
            { label: '5', color: '#00933C' },
            { label: '6', color: '#00933C' },
            { label: '7', color: '#B933AD' },
            { label: 'B', color: '#FF6319' },
            { label: 'D', color: '#FF6319' },
            { label: 'F', color: '#FF6319' },
            { label: 'M', color: '#FF6319' },
            { label: 'G', color: '#6CBE45' },
            { label: 'J', color: '#996633' },
            { label: 'Z', color: '#996633' },
            { label: 'L', color: '#A7A9AC' },
            { label: 'S', color: '#808183' },
            { label: 'N', color: '#FCCC0A' },
            { label: 'Q', color: '#FCCC0A' },
            { label: 'R', color: '#FCCC0A' },
            { label: 'W', color: '#FCCC0A' },
          ].map((line) => (
            <span
              key={line.label}
              className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
              style={{ backgroundColor: line.color }}
            >
              {line.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
