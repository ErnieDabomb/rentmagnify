import Container from '../ui/Container'

const stats = [
  { label: 'Verified listings', value: '1,240', hint: 'Refreshed weekly' },
  { label: 'Community submissions', value: '380+', hint: 'Reviewed for accuracy' },
  { label: 'Avg review time', value: '< 24h', hint: 'No paywall, no ads' },
]

export default function StatsStrip() {
  return (
    <section className="relative z-10">
      <Container>
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-soft sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 shadow-inner">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</div>
              <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.hint}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
