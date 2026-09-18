import { useCallback, useState } from 'react'

const KEY = 'rm_saved_listings_v1'

function readSaved() {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeSaved(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]))
  } catch {
    // ignore cache failures (storage full/private mode)
  }
}

export function useSavedListings() {
  const [saved, setSaved] = useState(() => readSaved())

  const toggleSaved = useCallback((id) => {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      writeSaved(next)
      return next
    })
  }, [])

  const isSaved = useCallback((id) => saved.has(id), [saved])

  return { saved, isSaved, toggleSaved }
}
