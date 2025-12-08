import Container from '../ui/Container'

export default function SloganBanner() {
  return (
    <section className="relative z-10 mb-20">
      <Container>
        <div className="rounded-2xl border border-blue-600/30 bg-white/80 p-4 text-center text-slate-900 shadow-soft">
          <p className="m-0 text-sm sm:text-base">
            “Take advantage of your renter information—your landlord is, and you should too.”
          </p>
        </div>
      </Container>
    </section>
  )
}
