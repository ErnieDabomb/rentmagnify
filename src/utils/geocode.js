// Free, no-key address -> coordinates lookup via OpenStreetMap's Nominatim
// service (same free ecosystem as the map tiles). Nominatim's usage policy
// caps this at ~1 request/second with no bulk/automated querying — fine here
// since this only ever fires once per real form submission, not in a loop.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export async function geocodeAddress(address, { signal } = {}) {
  const query = (address || '').trim()
  if (!query) return null

  const params = new URLSearchParams({
    format: 'jsonv2',
    q: query,
    limit: '1',
    countrycodes: 'us',
  })

  const resp = await fetch(`${NOMINATIM_URL}?${params.toString()}`, { signal })
  if (!resp.ok) throw new Error('Geocoding request failed')

  const results = await resp.json()
  if (!Array.isArray(results) || !results.length) return null

  const best = results[0]
  const lat = Number(best.lat)
  const lng = Number(best.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

  return { lat, lng, displayName: best.display_name }
}
