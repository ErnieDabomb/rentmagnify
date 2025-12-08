export default function MapToolHeader({ filteredCount, totalCount, loading }) {
  return (
    <div className="space-y-1">
      <span className="inline-block rounded-full border border-indigo-600/25 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 px-2 py-0.5 text-xs font-medium text-indigo-900">
        Explore
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        RentMagnify <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Map Tool</span>
      </h1>
      <p className="text-sm text-slate-500">Privacy-first, ad-free</p>
      <p className="text-slate-600">Explore rent prices geographically. Adjust filters to refine results.</p>
      {!loading && (
        <p className="text-sm text-slate-500">
          Showing {filteredCount} of {totalCount} listings
        </p>
      )}
    </div>
  )
}
