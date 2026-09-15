import GeoSearch from './GeoSearch'
import FilterBar from '../../../components/FilterBar'

export default function MapToolControls({
  filters,
  onFiltersChange,
  onClear,
  onResetView,
  canReset,
  onCopyLink,
  copied,
  onPickLocation,
  onShareShort,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" aria-label="Map controls">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <GeoSearch onPick={onPickLocation} />
        <FilterBar value={filters} onChange={onFiltersChange} />
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="View actions">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
          <span className="uppercase tracking-wide text-slate-500">Map style</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">Standard + Transit</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2">
          <button
            onClick={onClear}
            className="h-9 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            aria-label="Clear filters"
          >
            Clear filters
          </button>
          <button
            onClick={onResetView}
            disabled={!canReset}
            className="h-9 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Reset view
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2">
          <button
            onClick={onCopyLink}
            className="h-9 shrink-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button
            onClick={onShareShort}
            className="h-9 shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            Copy short link
          </button>
        </div>
      </div>
    </div>
  )
}
