import { MapContainer, TileLayer, CircleMarker, Popup, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import { useListings } from '../hooks/useListings'
import { applyFilters } from '../utils/filters'
import { createClusterer } from '../utils/clustering'
import L from 'leaflet'

const ERROR_TILE = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'>"
  + "<rect width='256' height='256' fill='#f1f5f9'/>"
  + "<path d='M0 0L256 256M256 0L0 256' stroke='#cbd5e1' stroke-width='1'/>"
  + "</svg>"
)

function SetViewOnChange({ center, zoom }) {
  const map = useMap()
  const cx = Array.isArray(center) ? center[0] : null
  const cy = Array.isArray(center) ? center[1] : null
  const stableCenter = useMemo(() => (cx != null && cy != null ? [cx, cy] : null), [cx, cy])
  useEffect(() => {
    if (stableCenter && typeof zoom === 'number') {
      map.setView(stableCenter, zoom)
    }
  }, [map, stableCenter, zoom])
  return null
}

function ViewportReporter({ onViewportChange }) {
  useMapEvents({
    moveend: (e) => {
      const m = e.target
      const c = m.getCenter()
      onViewportChange?.({ lat: c.lat, lng: c.lng, zoom: m.getZoom() })
    },
    zoomend: (e) => {
      const m = e.target
      const c = m.getCenter()
      onViewportChange?.({ lat: c.lat, lng: c.lng, zoom: m.getZoom() })
    },
  })
  return null
}

function FitBoundsOnChange({ bounds, version }) {
  const map = useMap()
  useEffect(() => {
    if (!bounds) return
    const pad = { padding: [24, 24] }
    map.fitBounds([[bounds.south, bounds.west], [bounds.north, bounds.east]], pad)
  }, [map, version, bounds])
  return null
}

export default function MapView({
  filters,
  listings: propListings,
  center,
  zoom = 12,
  onViewportChange,
  fitBounds,
  fitVersion,
  basemap = 'standard',
  loading: loadingProp,
  hoveredId,
  onHoverListing,
  onResetFilters,
  focusedListingName,
}) {
  const { listings, loading: internalLoading, error } = useListings()

  const filtered = useMemo(() => {
    if (propListings) return propListings
    return applyFilters(listings, filters)
  }, [propListings, listings, filters])

  const computedCenter = useMemo(() => {
    const src = filtered?.length ? filtered : propListings || listings
    if (!src?.length) return [40.73, -73.93]
    const lat = src.reduce((s, l) => s + (l.lat || 0), 0) / src.length
    const lng = src.reduce((s, l) => s + (l.lng || 0), 0) / src.length
    return [lat, lng]
  }, [filtered, propListings, listings])

const [minRent, maxRent] = useMemo(() => {
  const rents = (filtered || []).map((l) => l.rent).filter((n) => typeof n === 'number')
  if (!rents.length) return [0, 0]
  return [Math.min(...rents), Math.max(...rents)]
}, [filtered])

const TRANSIT_TILE_URL = import.meta.env.VITE_TRANSIT_TILE_URL
const TRANSIT_TILE_TOKEN = import.meta.env.VITE_TRANSIT_TILE_TOKEN

  const colorFor = (rent) => {
    if (typeof rent !== 'number') return '#2563eb'
    if (rent <= 2500) return '#10b981'
    if (rent <= 3500) return '#f59e0b'
    return '#ef4444'
  }

  const radiusFor = (rent) => {
    if (typeof rent !== 'number' || minRent === maxRent) return 8
    const r = 6 + ((rent - minRent) / (maxRent - minRent)) * 8
    return Math.max(6, Math.min(14, Math.round(r)))
  }

  const clusterer = useMemo(() => createClusterer({ strategy: 'grid', superclusterOptions: { radius: 64 } }), [])
  const clusters = useMemo(() => clusterer.cluster(filtered, zoom || 12), [clusterer, filtered, zoom])

  const clusterIcon = (count) => L.divIcon({
    className: 'rm-cluster',
    html: `<div style="display:inline-grid;place-items:center;width:38px;height:38px;border-radius:9999px;background:#1d4ed8;color:#fff;font-weight:700;box-shadow:0 8px 18px rgba(2,6,23,0.18);border:1px solid #fff;text-shadow:0 0 2px #fff, 0 0 1px #fff;">${count}</div>`,
    iconSize: [38, 38],
  })

  const isLoading = loadingProp ?? internalLoading
  const prefersDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  if (error) {
    return <div className="text-red-600">Failed to load listings: {error}</div>
  }

  return (
    <div className="relative z-0 isolate h-[500px] w-full" role="region" aria-label="Map view">
      {focusedListingName && (
        <div className="sr-only" aria-live="polite">
          Focusing map on {focusedListingName}
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/80 text-sm font-medium text-slate-600" aria-live="polite">
          Loading map...
        </div>
      )}
      <MapContainer
        center={center || computedCenter}
        zoom={zoom}
        className="h-full w-full overflow-hidden rounded-2xl shadow-[0_10px_24px_rgba(2,6,23,0.12)]"
      >
        <SetViewOnChange center={center} zoom={zoom} />
        <ViewportReporter onViewportChange={onViewportChange} />
        <FitBoundsOnChange bounds={fitBounds} version={fitVersion} />
        {basemap === 'satellite' ? (
          <>
            <TileLayer
              attribution="Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
              errorTileUrl={ERROR_TILE}
            />
            <TileLayer
              attribution="© OpenStreetMap contributors & CARTO"
              url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
              errorTileUrl={ERROR_TILE}
            />
          </>
        ) : basemap === 'transit' ? (
          <>
            <TileLayer
              attribution="© OpenStreetMap contributors | Carto"
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
              errorTileUrl={ERROR_TILE}
            />
            <TileLayer
              attribution="Transit © openstreetmap.fr contributors"
              url={
                TRANSIT_TILE_URL
                  ? `${TRANSIT_TILE_URL}${TRANSIT_TILE_TOKEN ? `?access_token=${TRANSIT_TILE_TOKEN}` : ''}`
                  : "https://{s}.tile.openstreetmap.fr/transport/{z}/{x}/{y}.png"
              }
              errorTileUrl={ERROR_TILE}
              opacity={0.9}
            />
          </>
        ) : basemap === 'buildings' ? (
          <TileLayer
            attribution="© OpenStreetMap contributors | CARTO Voyager"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            errorTileUrl={ERROR_TILE}
          />
        ) : (
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url={
              prefersDark
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            errorTileUrl={ERROR_TILE}
          />
        )}
        {!isLoading && clusters.map((c, idx) => {
          if (!c.cluster) {
            const l = c.point
            const isActive = hoveredId && l.id === hoveredId
            return (
              <CircleMarker
                key={l.id}
                center={[l.lat, l.lng]}
                radius={radiusFor(l.rent) + (isActive ? 2 : 0)}
                pathOptions={{
                  color: isActive ? '#1d4ed8' : '#ffffff',
                  weight: isActive ? 2 : 1,
                  fillColor: colorFor(l.rent),
                  fillOpacity: 0.9,
                }}
                eventHandlers={{
                  mouseover: () => onHoverListing?.(l.id),
                  mouseout: () => onHoverListing?.(null),
                  click: () => {
                    const nextZoom = Math.min((zoom || 12) + 2, 18)
                    onViewportChange?.({ lat: l.lat, lng: l.lng, zoom: nextZoom })
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[180px] space-y-1">
                    <div className="font-bold text-slate-900">{l.title}</div>
                    <div className="text-slate-800">${l.rent.toLocaleString()} · {l.beds}bd/{l.baths}ba</div>
                    <div className="text-slate-600">{l.address}</div>
                    <div className="text-[11px] font-semibold">
                      {l.source === 'verified' ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Verified source</span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">Community</span>
                      )}
                    </div>
                    {l.available && <div className="mt-1 text-slate-500">Available {l.available}</div>}
                  </div>
                </Popup>
              </CircleMarker>
            )
          }
          const count = c.count
          return (
            <Marker
              key={`cluster-${idx}`}
              position={[c.lat, c.lng]}
              icon={clusterIcon(count)}
              eventHandlers={{
                click: () => {
                  const nextZoom = Math.min((zoom || 12) + 2, 18)
                  onViewportChange?.({ lat: c.lat, lng: c.lng, zoom: nextZoom })
                },
              }}
            />
          )
        })}
      </MapContainer>

      <div
        className="absolute bottom-3 right-3 rounded-lg border border-slate-200 bg-white/90 p-3 text-xs text-slate-700 shadow-[0_6px_18px_rgba(2,6,23,0.08)]"
        role="group"
        aria-label="Legend and quick actions"
      >
        <div className="mb-2 font-semibold text-slate-800">Rent Legend</div>
        <div className="grid gap-2">
          <div className="flex items-center gap-2" aria-label="Up to $2,500">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#10b981' }} />
            <span>&lt;= $2,500</span>
          </div>
          <div className="flex items-center gap-2" aria-label="Up to $3,500">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#f59e0b' }} />
            <span>&lt;= $3,500</span>
          </div>
          <div className="flex items-center gap-2" aria-label="Above $3,500">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#ef4444' }} />
            <span>&gt; $3,500</span>
          </div>
          <div className="mt-1 text-slate-500">Circle size scales with rent</div>
        </div>
        {onResetFilters && (
          <button
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={onResetFilters}
          >
            Reset filters
          </button>
        )}
      </div>

      {!isLoading && (propListings || filtered)?.length === 0 && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/80 text-sm font-medium text-slate-500" aria-live="polite">
          No listings to display. Adjust filters to see results.
        </div>
      )}
    </div>
  )
}
