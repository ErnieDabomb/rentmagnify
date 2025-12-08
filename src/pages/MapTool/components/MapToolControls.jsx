import GeoSearch from './GeoSearch'
import FilterBar from '../../../components/FilterBar'

export default function MapToolControls({
  filters,
  onFiltersChange,
  basemap,
  onBasemapChange,
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
        <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700" aria-label="Basemap">
          <span className="text-xs font-medium text-slate-600">Basemap</span>
          <select
            value={basemap}
            onChange={(e) => onBasemapChange(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none"
            >
            <option value="standard">Standard</option>
            <option value="transit">Transit</option>
            <option value="buildings">City details</option>
            <option value="satellite">Satellite</option>
          </select>
        </label>
        <button
          onClick={onClear}
          className="h-10 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          aria-label="Clear filters"
        >
          Clear filters
        </button>
        <button
          onClick={onResetView}
          disabled={!canReset}
          className="h-10 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Reset map view
        </button>
        <button
          onClick={onCopyLink}
          className="h-10 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {copied ? 'Link copied!' : 'Copy share link'}
        </button>
        <button
          onClick={onShareShort}
          className="h-10 shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          Copy short link
        </button>
      </div>
    </div>
  )
}
