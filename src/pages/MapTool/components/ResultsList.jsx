function SkeletonItem({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`sk-${idx}`}
          className="animate-pulse rounded-lg border border-slate-200 bg-slate-100 p-2"
          aria-hidden
        >
          <div className="h-3 w-2/3 rounded bg-slate-200" />
          <div className="mt-2 h-2.5 w-1/2 rounded bg-slate-200" />
          <div className="mt-1 h-2 w-3/4 rounded bg-slate-200" />
        </div>
      ))}
    </>
  )
}

export default function ResultsList({ listings, onSelect, loading, hoveredId, onHover, isSaved, onToggleSaved }) {
  return (
    <aside className="hidden lg:block" aria-label="Listings sidebar">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
        <div className="mb-2 text-sm font-semibold text-slate-700" aria-live="polite">Results</div>
        <div className="grid max-h-[460px] gap-2 overflow-auto pr-1">
          {loading && <SkeletonItem />}
          {listings.map((l) => (
            <div
              key={l.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(l)}
              onMouseEnter={() => onHover?.(l.id)}
              onMouseLeave={() => onHover?.(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(l)
                }
              }}
              className={`relative cursor-pointer rounded-lg border bg-white p-2 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${hoveredId === l.id ? 'border-indigo-400 shadow-sm' : 'border-slate-200'}`}
            >
              {onToggleSaved && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleSaved(l.id)
                  }}
                  aria-label={isSaved?.(l.id) ? 'Remove from saved listings' : 'Save this listing'}
                  aria-pressed={isSaved?.(l.id)}
                  className="absolute right-1.5 top-1.5 text-base leading-none text-amber-500 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {isSaved?.(l.id) ? '★' : '☆'}
                </button>
              )}
              <div className="truncate pr-5 text-sm font-medium text-slate-900">{l.title}</div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>${l.rent.toLocaleString()} · {l.beds}bd/{l.baths}ba</span>
                {l.source === 'verified' ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700" title="Verified source">Verified</span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700" title="Community submission">Community</span>
                )}
              </div>
              <div className="truncate text-xs text-slate-500">{l.address}</div>
              {(l.washerDryer || l.hvac || l.pets) && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {l.washerDryer && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">W/D</span>
                  )}
                  {l.hvac && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">HVAC</span>
                  )}
                  {l.pets && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">Pets OK</span>
                  )}
                </div>
              )}
            </div>
          ))}
          {!loading && listings.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-500">
              No listings to show.
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
