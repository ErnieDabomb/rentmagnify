import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useListings } from '../../hooks/useListings'
import { useSavedListings } from '../../hooks/useSavedListings'
import { applyFilters } from '../../utils/filters'
import MapToolHeader from './components/MapToolHeader'
import MapToolControls from './components/MapToolControls'
import ResultsList from './components/ResultsList'
import MobileFilterSheet from './components/MobileFilterSheet'
import StatsInline from './components/StatsInline'
import { logEvent } from '../../utils/analytics'

const MapView = lazy(() => import('../../components/MapView'))

export default function MapToolPage() {
  const { listings, loading, error } = useListings()
  const { saved, isSaved, toggleSaved } = useSavedListings()
  const [savedOnly, setSavedOnly] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const decodeShort = () => {
    const packed = searchParams.get('s')
    if (!packed) return null
    try {
      const json = atob(packed)
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  const [filters, setFilters] = useState(() => {
    const getNum = (key, fallback) => {
      const v = searchParams.get(key)
      return v !== null && v !== '' ? Number(v) : fallback
    }
    const getIntOrNull = (key) => {
      const v = searchParams.get(key)
      if (v === null || v === '') return null
      const n = Number(v)
      return Number.isNaN(n) ? null : n
    }
    const getBoolOrNull = (key) => {
      const v = searchParams.get(key)
      if (v === 'true') return true
      if (v === 'false') return false
      return null
    }
    const shortState = decodeShort()
    if (shortState?.filters) {
      return { ...shortState.filters }
    }
    return {
      rentMin: getNum('rentMin', 0),
      rentMax: getNum('rentMax', 10000),
      beds: getIntOrNull('beds'),
      baths: getIntOrNull('baths'),
      type: searchParams.get('type') || 'any',
      hasWdryer: getBoolOrNull('hasWdryer'),
      hasHVAC: getBoolOrNull('hasHVAC'),
      hasPets: getBoolOrNull('hasPets'),
      keyword: searchParams.get('keyword') || '',
      availableOn: searchParams.get('availableOn') || null,
    }
  })

  const [viewport, setViewport] = useState(() => {
    const lat = parseFloat(searchParams.get('lat'))
    const lng = parseFloat(searchParams.get('lng'))
    const zoom = parseInt(searchParams.get('zoom') || '', 10)
    const north = parseFloat(searchParams.get('north'))
    const south = parseFloat(searchParams.get('south'))
    const east = parseFloat(searchParams.get('east'))
    const west = parseFloat(searchParams.get('west'))
    const bounds = Number.isFinite(north) && Number.isFinite(south) && Number.isFinite(east) && Number.isFinite(west)
      ? { north, south, east, west }
      : undefined
    const shortState = decodeShort()
    if (shortState?.viewport) return shortState.viewport
    if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(zoom)) return { lat, lng, zoom, bounds }
    return null
  })

  const [basemap, setBasemap] = useState(() => {
    const shortState = decodeShort()
    return (
      shortState?.basemap ||
      (searchParams.get('basemap') === 'satellite' ? 'satellite' : (searchParams.get('basemap') || 'standard'))
    )
  })

  const urlTimer = useRef(null)
  useEffect(() => {
    const params = new URLSearchParams()
    const add = (k, v) => {
      if (v === null || v === undefined) return
      if (typeof v === 'string' && v.trim() === '') return
      params.set(k, String(v))
    }
    add('rentMin', filters.rentMin)
    add('rentMax', filters.rentMax)
    if (filters.beds !== null) add('beds', filters.beds)
    if (filters.baths !== null) add('baths', filters.baths)
    if (filters.type && filters.type !== 'any') add('type', filters.type)
    if (filters.hasWdryer !== null) add('hasWdryer', filters.hasWdryer)
    if (filters.hasHVAC !== null) add('hasHVAC', filters.hasHVAC)
    if (filters.hasPets !== null) add('hasPets', filters.hasPets)
    add('keyword', filters.keyword)
    if (filters.availableOn) add('availableOn', filters.availableOn)
    if (basemap && basemap !== 'standard') add('basemap', basemap)
    if (viewport) {
      add('lat', viewport.lat)
      add('lng', viewport.lng)
      add('zoom', viewport.zoom)
      if (viewport.bounds) {
        add('north', viewport.bounds.north)
        add('south', viewport.bounds.south)
        add('east', viewport.bounds.east)
        add('west', viewport.bounds.west)
      }
    }
    if (urlTimer.current) clearTimeout(urlTimer.current)
    urlTimer.current = setTimeout(() => setSearchParams(params), 250)
    return () => { if (urlTimer.current) clearTimeout(urlTimer.current) }
  }, [filters, viewport, basemap, setSearchParams])

  useEffect(() => {
    logEvent('filters_change', { filters })
  }, [filters])

  const buildShortUrl = () => {
    const payload = { filters, viewport, basemap }
    const packed = btoa(JSON.stringify(payload))
    const url = new URL(window.location.href)
    url.search = `?s=${packed}`
    return url.toString()
  }

  const filtered = useMemo(() => applyFilters(listings, filters), [listings, filters])
  const visibleListings = useMemo(
    () => (savedOnly ? filtered.filter((l) => saved.has(l.id)) : filtered),
    [filtered, savedOnly, saved]
  )
  const missingCoords = useMemo(
    () => visibleListings.filter((l) => !Number.isFinite(l.lat) || !Number.isFinite(l.lng)).length,
    [visibleListings]
  )
  const dataBounds = useMemo(() => {
    if (!visibleListings?.length) return null
    let north = -90, south = 90, east = -180, west = 180
    for (const l of visibleListings) {
      if (typeof l.lat !== 'number' || typeof l.lng !== 'number') continue
      if (l.lat > north) north = l.lat
      if (l.lat < south) south = l.lat
      if (l.lng > east) east = l.lng
      if (l.lng < west) west = l.lng
    }
    if (north < south || east < west) return null
    return { north, south, east, west }
  }, [visibleListings])

  const [fitVersion, setFitVersion] = useState(0)
  const [copied, setCopied] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [focusedListingName, setFocusedListingName] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  const resetFilters = () => {
    setFilters({
      rentMin: 0,
      rentMax: 10000,
      beds: null,
      baths: null,
      type: 'any',
      hasWdryer: null,
      hasHVAC: null,
      hasPets: null,
      keyword: '',
      availableOn: null,
    })
    setViewport(null)
    setStatusMsg('Filters reset')
    setTimeout(() => setStatusMsg(''), 1200)
  }

  return (
    <div className="grid gap-6">
      {statusMsg && <div className="sr-only" aria-live="polite">{statusMsg}</div>}
      {import.meta.env.DEV && missingCoords > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 shadow-sm">
          {missingCoords} listings are missing coordinates and will not render on the map.
        </div>
      )}
      <MapToolHeader filteredCount={visibleListings.length} totalCount={listings?.length || 0} loading={loading} />

      <StatsInline listings={visibleListings} />

      <MapToolControls
        filters={filters}
        onFiltersChange={setFilters}
        basemap={basemap}
        onBasemapChange={setBasemap}
        onClear={resetFilters}
        onResetView={() => { if (dataBounds) setFitVersion((v) => v + 1) }}
        canReset={Boolean(dataBounds)}
        savedOnly={savedOnly}
        onToggleSavedOnly={() => setSavedOnly((v) => !v)}
        savedCount={saved.size}
        onCopyLink={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
            logEvent('share_full_link', { url: window.location.href })
          } catch {
            setCopied(false)
          }
        }}
        onShareShort={async () => {
          try {
            const url = buildShortUrl()
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setStatusMsg('Short link copied')
            logEvent('share_short_link', { url })
            setTimeout(() => { setCopied(false); setStatusMsg('') }, 1200)
          } catch {
            setCopied(false)
          }
        }}
        copied={copied}
        onPickLocation={(c) => setViewport({ lat: c.lat, lng: c.lng, zoom: c.zoom || 12 })}
      />

      {!loading && visibleListings.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-slate-700">
          {savedOnly
            ? "You haven't saved any listings that match your current filters."
            : 'No results match your filters. Try widening price, beds, or clearing the keyword.'}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load listings. {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
        <div>
          {!error && (
            <Suspense
              fallback={
                <div className="relative h-[70vh] min-h-[500px] max-h-[760px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="animate-pulse text-sm text-slate-500">Loading map...</div>
                  </div>
                </div>
              }
            >
              <MapView
                listings={visibleListings}
                center={viewport ? [viewport.lat, viewport.lng] : undefined}
                zoom={viewport?.zoom || 12}
                onViewportChange={(v) => setViewport(v)}
                fitBounds={fitVersion ? dataBounds : undefined}
                fitVersion={fitVersion}
                basemap={basemap}
                loading={loading}
                hoveredId={hoveredId}
                onHoverListing={setHoveredId}
                onResetFilters={resetFilters}
                focusedListingName={focusedListingName}
                isSaved={isSaved}
                onToggleSaved={toggleSaved}
              />
            </Suspense>
          )}
        </div>
      <ResultsList
        listings={visibleListings}
        loading={loading}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        isSaved={isSaved}
        onToggleSaved={toggleSaved}
        onSelect={(l) => {
            setFocusedListingName(l.title || l.address || 'Listing')
            if (Number.isFinite(l.lat) && Number.isFinite(l.lng)) {
              setViewport({ lat: l.lat, lng: l.lng, zoom: 15 })
            }
          }}
        />
      </div>

      <MobileFilterSheet filters={filters} onChange={setFilters} />
    </div>
  )
}
