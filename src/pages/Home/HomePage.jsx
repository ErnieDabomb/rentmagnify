import { useNavigate } from 'react-router-dom'
import HeroSection from '../../components/home/HeroSection'
import ValueProps from '../../components/home/ValueProps'
import HowItWorks from '../../components/home/HowItWorks'
import SloganBanner from '../../components/home/SloganBanner'
import StatsStrip from '../../components/home/StatsStrip'
import TestimonialsRail from '../../components/home/TestimonialsRail'
import ExperienceCTA from '../../components/home/ExperienceCTA'
import FaqSection from './components/FaqSection'
import Container from '../../components/ui/Container'

export default function HomePage() {
  const navigate = useNavigate()
  const handleOpenMap = () => navigate('/map')
  const handleOpenNegotiate = () => navigate('/negotiate')

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/50 to-slate-50">
      <HeroSection onOpenMap={handleOpenMap} />
      <StatsStrip />
      <ValueProps />
      <section className="py-10">
        <Container>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">New</p>
              <h3 className="text-xl font-semibold text-slate-900">Rent Negotiation Tool</h3>
              <p className="text-slate-700">
                Get a quick negotiation report with tailored counter-offer guidance before you respond to a landlord or leasing agent.
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <button
                onClick={handleOpenNegotiate}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
              >
                Analyze My Rent
              </button>
            </div>
          </div>
        </Container>
      </section>
      <HowItWorks />
      <TestimonialsRail />
      <SloganBanner />
      <ExperienceCTA />
      <FaqSection />
    </div>
  )
}
