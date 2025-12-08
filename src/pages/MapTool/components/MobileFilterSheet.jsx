import { useState } from 'react'
import FilterBar from '../../../components/FilterBar'

const presets = [
  { label: 'Pet-friendly 2bd ≤ $3k', patch: { beds: 2, hasPets: true, rentMax: 3000 } },
  { label: 'Studios ≤ $2.2k', patch: { beds: 0, rentMax: 2200 } },
  { label: 'Washer/Dryer + HVAC', patch: { hasWdryer: true, hasHVAC: true } },
]

export default function MobileFilterSheet({ filters, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 lg:hidden">
      <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.18)] backdrop-blur" aria-label="Mobile filters">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Filters</div>
            <div className="text-[11px] text-slate-500">Tap to edit or pick a preset</div>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
            aria-expanded={open}
          >
            {open ? 'Close' : 'Open'}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange({ ...filters, ...p.patch })}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              {p.label}
            </button>
          ))}
        </div>
        {open && (
          <div className="mt-3 max-h-[60vh] overflow-auto">
            <FilterBar value={filters} onChange={onChange} />
          </div>
        )}
      </div>
    </div>
  )
}
