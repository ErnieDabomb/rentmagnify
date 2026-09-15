// Small TTL cache over localStorage. Used to keep repeat page views from
// re-hitting Firestore, since the free Spark plan has a hard daily read quota.

export function readCache(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.ts || Date.now() - parsed.ts >= ttlMs) return null
    return parsed.data ?? null
  } catch {
    return null
  }
}

export function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // ignore cache failures (storage full/private mode)
  }
}
