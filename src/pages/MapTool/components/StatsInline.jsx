import { useMemo } from 'react'

function median(nums) {
  if (!nums.length) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function Sparkline({ values }) {
  if (!values.length) return <div className="h-8" />
  const w = 80, h = 32
  const min = Math.min(...values)
  const max = Math.max(...values)
  const norm = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w
    const y = h - ((v - min) / Math.max(max - min || 1, 1)) * h
    return [x, y]
  })
  const d = norm.map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-20 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function StatsInline({ listings }) {
  const { med, medByBeds, spark } = useMemo(() => {
    const rents = listings.map((l) => Number(l.rent)).filter(Number.isFinite)
    const med = Math.round(median(rents) || 0)
    const medByBeds = {}
    listings.forEach((l) => {
      const b = l.beds ?? 'any'
      medByBeds[b] = medByBeds[b] || []
      medByBeds[b].push(Number(l.rent))
    })
    const medBedsList = Object.entries(medByBeds)
      .map(([b, rs]) => ({ b, val: Math.round(median(rs) || 0) }))
      .filter((x) => x.val > 0)
      .sort((a, b) => Number(a.b) - Number(b.b))
    return { med, medByBeds: medBedsList, spark: rents.slice(-12) }
  }, [listings])

  return (
    <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-soft" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Live stats</div>
          <div className="text-[11px] text-slate-500">Updates with filters</div>
        </div>
        <Sparkline values={spark} />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-800">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Median ${med.toLocaleString()}
        </span>
        {medByBeds.slice(0, 3).map((m) => (
          <span key={m.b} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {m.b} bd: ${m.val.toLocaleString()}
          </span>
        ))}
      </div>
    </div>
  )
}
