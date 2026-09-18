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
  basemap,
  onBasemapChange,
  savedOnly,
  onToggleSavedOnly,
  savedCount,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" aria-label="Map controls">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <GeoSearch onPick={onPickLocation} />
        <FilterBar value={filters} onChange={onFiltersChange} />
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="View actions">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
          <label htmlFor="basemap-select" className="uppercase tracking-wide text-slate-500">Map style</label>
          <select
            id="basemap-select"
            value={basemap}
            onChange={(e) => onBasemapChange(e.target.value)}
            className="rounded-full border-none bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="standard">Standard + Transit</option>
            <option value="satellite">Satellite</option>
            <option value="buildings">Streets only</option>
          </select>
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
          <button
            onClick={onToggleSavedOnly}
            aria-pressed={savedOnly}
            className={`h-9 shrink-0 rounded-md border px-3 text-sm font-medium transition ${
              savedOnly
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {savedOnly ? `Saved (${savedCount})` : `★ Saved${savedCount ? ` (${savedCount})` : ''}`}
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
