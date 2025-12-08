export default function FiltersBar({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })

  const clearField = (key) => {
    const resets = { beds: null, baths: null, hasWdryer: null, hasHVAC: null, hasPets: null, availableOn: null, keyword: '' }
    if (key === 'rent') {
      set({ rentMin: 0, rentMax: 10000 })
    } else {
      set({ [key]: resets[key] ?? '' })
    }
  }

  const resetAll = () => {
    onChange({
      rentMin: 0,
      rentMax: 10000,
      beds: null,
      baths: null,
      type: 'any',
      hasWdryer: null,
      hasHVAC: null,
      hasPets: null,
      keyword: '',
      availableOn: null,
    })
  }

  const activeFilters = (() => {
    const pills = []
    if (value.rentMin || value.rentMax < 10000) pills.push({ label: `$${value.rentMin} - $${value.rentMax}`, key: 'rent' })
    if (value.beds != null) pills.push({ label: `${value.beds} bd`, key: 'beds' })
    if (value.baths != null) pills.push({ label: `${value.baths} ba`, key: 'baths' })
    if (value.type && value.type !== 'any') pills.push({ label: value.type, key: 'type', clear: () => set({ type: 'any' }) })
    if (value.hasWdryer != null) pills.push({ label: value.hasWdryer ? 'W/D' : 'No W/D', key: 'hasWdryer' })
    if (value.hasHVAC != null) pills.push({ label: value.hasHVAC ? 'HVAC' : 'No HVAC', key: 'hasHVAC' })
    if (value.hasPets != null) pills.push({ label: value.hasPets ? 'Pets ok' : 'No pets', key: 'hasPets' })
    if (value.keyword) pills.push({ label: `“${value.keyword}”`, key: 'keyword' })
    if (value.availableOn) pills.push({ label: `Available ${value.availableOn}`, key: 'availableOn' })
    return pills
  })()

  return (
    <details className="group w-full rounded-2xl border border-slate-200 bg-white/90 shadow-[0_6px_16px_rgba(15,23,42,0.06)] transition hover:border-slate-300 lg:w-auto">
      <summary className="sticky top-2 z-10 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur">
        <span>Filters</span>
        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              {activeFilters.length} active
            </span>
          )}
          <span className="text-xs text-slate-500 group-open:hidden">Show</span>
          <span className="hidden text-xs text-slate-500 group-open:inline">Hide</span>
        </div>
      </summary>

      <div className="grid gap-4 border-t border-slate-200 px-4 py-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Rent Min</label>
          <input
            type="number"
            value={value.rentMin}
            onChange={(e) => set({ rentMin: +e.target.value || 0 })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Rent Max</label>
          <input
            type="number"
            value={value.rentMax}
            onChange={(e) => set({ rentMax: +e.target.value || 0 })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Bedrooms</label>
          <select
            value={value.beds ?? ''}
            onChange={(e) => set({ beds: e.target.value === '' ? null : +e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">Any</option>
            <option>0</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Bathrooms</label>
          <select
            value={value.baths ?? ''}
            onChange={(e) => set({ baths: e.target.value === '' ? null : +e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">Any</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Property Type</label>
          <select
            value={value.type}
            onChange={(e) => set({ type: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          >
            <option value="any">Any</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">In-Unit W/D</label>
          <select
            value={value.hasWdryer ?? ''}
            onChange={(e) => set({ hasWdryer: e.target.value === '' ? null : e.target.value === 'true' })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Heating/Cooling</label>
          <select
            value={value.hasHVAC ?? ''}
            onChange={(e) => set({ hasHVAC: e.target.value === '' ? null : e.target.value === 'true' })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Pet Friendly</label>
          <select
            value={value.hasPets ?? ''}
            onChange={(e) => set({ hasPets: e.target.value === '' ? null : e.target.value === 'true' })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none"
          >
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Keyword</label>
          <input
            value={value.keyword}
            onChange={(e) => set({ keyword: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none"
            placeholder="e.g., balcony, doorman"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600">Available On</label>
          <input
            type="date"
            value={value.availableOn ?? ''}
            onChange={(e) => set({ availableOn: e.target.value || null })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-3">
        {activeFilters.map((p) => (
          <button
            key={`${p.key}-${p.label}`}
            onClick={() => (p.clear ? p.clear() : clearField(p.key))}
            className="group flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:border-indigo-200 hover:bg-indigo-100"
          >
            <span>{p.label}</span>
            <span className="text-indigo-500 group-hover:text-indigo-700">✕</span>
          </button>
        ))}
        {activeFilters.length === 0 && (
          <span className="text-xs text-slate-500">No active filters</span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={resetAll}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
    </details>
  )
}
