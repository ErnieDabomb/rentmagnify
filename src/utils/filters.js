export function applyFilters(listings, filters = {}) {
  const min = Number(filters.rentMin) || 0
  const max = Number(filters.rentMax) || 1_000_000
  const needBeds = filters.beds ?? null
  const needBaths = filters.baths ?? null
  const needWD = filters.hasWdryer ?? null
  const needHVAC = filters.hasHVAC ?? null
  const needPets = filters.hasPets ?? null
  const keyword = (filters.keyword || '').trim().toLowerCase()
  const availableOn = filters.availableOn || null // ISO string (YYYY-MM-DD)
  const type = filters.type || 'any'

  return (listings || []).filter((l) => {
    if (typeof l.rent === 'number') {
      if (l.rent < min || l.rent > max) return false
    }

    if (needBeds !== null && Number(l.beds) !== Number(needBeds)) return false
    if (needBaths !== null && Number(l.baths) !== Number(needBaths)) return false
    if (needWD !== null && Boolean(l.washerDryer) !== Boolean(needWD)) return false
    if (needHVAC !== null && Boolean(l.hvac) !== Boolean(needHVAC)) return false
    if (needPets !== null && Boolean(l.pets) !== Boolean(needPets)) return false

    if (type && type !== 'any') {
      // Listings currently have no `type`; treat missing as pass unless explicitly set and mismatched
      if (l.type && l.type !== type) return false
    }

    if (keyword) {
      const hay = `${l.title || ''} ${l.address || ''} ${(l.amenities || []).join(' ')}`.toLowerCase()
      if (!hay.includes(keyword)) return false
    }

    if (availableOn && l.available) {
      // Keep listings with availability on or after the chosen date
      const avail = Date.parse(l.available)
      const need = Date.parse(availableOn)
      if (!Number.isNaN(avail) && !Number.isNaN(need)) {
        if (avail < need) return false
      }
    }

    return true
  })
}
