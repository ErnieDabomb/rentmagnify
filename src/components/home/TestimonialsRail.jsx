import Container from '../ui/Container'

const comments = [
  {
    quote: 'I stopped overpaying—seeing nearby rents made negotiations easier.',
    by: 'Anon · Brooklyn',
  },
  {
    quote: 'Submitting my rent felt safe and quick. No ads, no noise.',
    by: 'Subscriber · Upper West Side',
  },
  {
    quote: 'Filters + map clusters = instant clarity. Great for weekend tours.',
    by: 'Anon · Queens',
  },
  {
    quote: 'Love that I can check pet-friendly places without digging through listings.',
    by: 'User · Long Island City',
  },
]

export default function TestimonialsRail() {
  return (
    <section className="relative z-10">
      <Container>
        <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-soft">
            <h3 className="text-lg font-bold text-slate-900">What renters are saying</h3>
            <p className="text-sm text-slate-600">Anonymous notes from subscribers and contributors.</p>
          </div>
          <div className="grid gap-3">
            {comments.map((c, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-900/90 p-4 text-slate-50 shadow-soft"
              >
                <div className="text-sm leading-relaxed">“{c.quote}”</div>
                <div className="mt-2 text-xs text-slate-300">{c.by}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
