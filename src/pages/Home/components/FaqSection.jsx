import Container from '../../../components/ui/Container'

const faqs = [
  {
    q: 'Is my submission anonymous?',
    a: 'Yes. We only store the data you provide and a device id for rate limiting. No accounts required to browse.',
  },
  {
    q: 'Where do the listings come from?',
    a: 'We blend a static feed with community submissions. Approved submissions are reviewed before appearing on the map.',
  },
  {
    q: 'Do you sell my data?',
    a: 'No. RentMagnify is ad-free and privacy-first. Data is used solely to improve transparency for renters.',
  },
]

export default function FaqSection() {
  return (
    <section className="relative z-10 mb-14">
      <Container>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-soft">
          <h2 className="text-lg font-bold text-slate-900">FAQs</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="text-sm font-semibold text-slate-900">{item.q}</div>
                <p className="mt-1 text-sm text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
