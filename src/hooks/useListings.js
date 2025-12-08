import { useEffect, useState } from "react";
import { listApproved } from "../services/dataStore";

const CACHE_KEY = 'rm_listings_cache_v1';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

export function useListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        let base = []
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed?.ts && Date.now() - parsed.ts < CACHE_TTL) {
            base = parsed.data || []
          }
        }
        if (!base.length) {
          const resp = await fetch("/data/listings.json")
          base = await resp.json()
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: base }))
          } catch {
            // ignore cache failures
          }
        }

        const approved = await listApproved()
        const merged = Array.isArray(approved) && approved.length
          ? [
              ...base.map((b) => ({ ...b, source: 'verified' })),
              ...approved.map((a, i) => ({
                id: a.id || `sub-${i}-${a.address || a.title || 'listing'}`,
                title: a.title || a.address || 'Submitted Listing',
                rent: Number(a.rent) || 0,
                beds: Number(a.beds) || 0,
                baths: Number(a.baths) || 1,
                washerDryer: Boolean(a.washerDryer),
                hvac: Boolean(a.hvac),
                pets: Boolean(a.pets),
                lat: Number(a.lat),
                lng: Number(a.lng),
                address: a.address || '',
                available: a.available || null,
                source: 'community',
              }))
            ]
          : base.map((b) => ({ ...b, source: 'verified' }))
        if (alive) setListings(merged)
      } catch (e) {
        if (alive) setError(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, []);

  return { listings, loading, error };
}
