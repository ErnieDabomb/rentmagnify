const CACHE_NAME = 'rm-static-v1'
const LISTINGS_URL = '/data/listings.json'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  LISTINGS_URL,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Cache-first for listings.json
  if (request.url.includes(LISTINGS_URL)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((resp) => {
            const clone = resp.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            return resp
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  // Tiles: try network, fall back to cache
  if (request.url.includes('tile.openstreetmap') || request.url.includes('tile.memomaps') || request.url.includes('basemaps.cartocdn.com') || request.url.includes('tile.openstreetmap.fr')) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const clone = resp.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return resp
        })
        .catch(() => caches.match(request))
    )
    return
  }
})
