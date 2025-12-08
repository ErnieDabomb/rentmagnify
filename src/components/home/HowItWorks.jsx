import Container from '../ui/Container'

const steps = [
  { title: 'Browse the map', body: 'Explore rents by area. No login needed.' },
  { title: 'Filter what matters', body: 'Narrow by price, beds/baths, type, amenities, and more.' },
  { title: 'Share to help others', body: 'Anonymously submit what you pay to improve accuracy for everyone.' },
]

export default function HowItWorks() {
  return (
    <section className="relative z-10 my-10">
      <Container>
        <h2 className="mb-4 text-[22px] font-extrabold sm:text-[28px]">How RentMagnify works</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="grid grid-cols-[44px,1fr] items-start gap-3 rounded-2xl border border-slate-900/10 bg-white p-4 shadow-soft"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-100 font-extrabold text-indigo-800">
                {idx + 1}
              </div>
              <div>
                <div className="mb-1 font-bold text-slate-900">{step.title}</div>
                <div className="text-slate-600">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
