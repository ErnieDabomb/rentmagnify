// Lightweight grid-based clustering with an adapter API that can be swapped
// to real `supercluster` later with a one-line change at creation.

const TILE_SIZE = 256

function degPerPixelAtEquator(zoom) {
  return 360 / (TILE_SIZE * Math.pow(2, zoom))
}

function gridClusterer({ cellPx = 60 } = {}) {
  return {
    cluster(points, zoom /*, bounds*/) {
      if (!Array.isArray(points) || points.length === 0) return []
      const dpp = degPerPixelAtEquator(zoom || 12)
      const cellDeg = dpp * cellPx

      const buckets = new Map()
      for (const p of points) {
        const lat = p.lat
        const lng = p.lng
        if (typeof lat !== 'number' || typeof lng !== 'number') continue
        const gx = Math.floor(lng / cellDeg)
        const gy = Math.floor(lat / cellDeg)
        const key = gx + ':' + gy
        let b = buckets.get(key)
        if (!b) {
          b = { count: 0, sumLat: 0, sumLng: 0, items: [] }
          buckets.set(key, b)
        }
        b.count += 1
        b.sumLat += lat
        b.sumLng += lng
        b.items.push(p)
      }

      const clusters = []
      for (const b of buckets.values()) {
        if (b.count === 1) {
          clusters.push({ cluster: false, point: b.items[0] })
        } else {
          clusters.push({
            cluster: true,
            count: b.count,
            lat: b.sumLat / b.count,
            lng: b.sumLng / b.count,
            items: b.items,
          })
        }
      }
      return clusters
    },
  }
}

// Adapter factory. To use real supercluster later:
//   import Supercluster from 'supercluster'
//   const clusterer = createClusterer({ strategy: 'supercluster', SuperclusterCtor: Supercluster, superclusterOptions: { radius: 60 } })
// For now we default to 'grid'.
export function createClusterer({ strategy = 'grid', SuperclusterCtor, superclusterOptions } = {}) {
  if (strategy === 'supercluster' && typeof SuperclusterCtor === 'function') {
    return superclusterAdapter(SuperclusterCtor, superclusterOptions)
  }
  return gridClusterer(superclusterOptions)
}

function superclusterAdapter(SuperclusterCtor, options = {}) {
  const index = new SuperclusterCtor({ radius: 60, maxZoom: 18, ...options })
  // index expects GeoJSON features
  return {
    load(points) {
      const features = (points || []).map((p) => ({
        type: 'Feature',
        properties: { ...p },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      }))
      index.load(features)
    },
    cluster(points, zoom, bounds) {
      // load on each call for simplicity (for small/mid datasets); larger datasets should reuse
      this.load(points)
      const z = Math.max(0, Math.min(zoom || 12, 18))
      const b = bounds
        ? [bounds.west, bounds.south, bounds.east, bounds.north]
        : [-180, -85, 180, 85]
      const results = index.getClusters(b, z)
      return results.map((f) => {
        const [lng, lat] = f.geometry.coordinates
        const count = f.properties.cluster ? f.properties.point_count : 1
        if (count > 1) {
          return { cluster: true, count, lat, lng, id: f.id }
        }
        return { cluster: false, point: f.properties }
      })
    },
  }
}

