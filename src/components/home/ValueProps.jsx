import Container from '../ui/Container'

const items = [
  {
    title: 'Real-world prices',
    body: 'See where asking prices and actual rents differ—across neighborhoods and building types.',
  },
  {
    title: 'Privacy by default',
    body: "We don’t sell your data. Share only what you choose, when you choose.",
  },
  {
    title: 'Fast, clean UI',
    body: 'Modern, distraction-free interface built for quick comparisons and better decisions.',
  },
]

export default function ValueProps() {
  return (
    <section className="relative z-10 mb-2 mt-6">
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <div key={item.title} className="rounded-2xl border border-slate-900/10 bg-white p-5 shadow-soft">
              <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-600/10 text-blue-900 font-semibold">
                {idx + 1}
              </div>
              <h3 className="mb-1 font-bold text-slate-900">{item.title}</h3>
              <p className="leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
