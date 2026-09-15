import { useNavigate } from 'react-router-dom'
import HeroSection from '../../components/home/HeroSection'
import ValueProps from '../../components/home/ValueProps'
import HowItWorks from '../../components/home/HowItWorks'
import SloganBanner from '../../components/home/SloganBanner'
import ShareCTA from '../../components/home/ShareCTA'
import ExperienceCTA from '../../components/home/ExperienceCTA'
import FaqSection from './components/FaqSection'
import Container from '../../components/ui/Container'

export default function HomePage() {
  const navigate = useNavigate()
  const handleOpenMap = () => navigate('/map')
  const handleOpenNegotiate = () => navigate('/negotiate')
  const handleOpenAffordability = () => navigate('/affordability')

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/50 to-slate-50">
      <HeroSection onOpenMap={handleOpenMap} />
      <ShareCTA />
      <ValueProps />
      <section className="py-10">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
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
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">New</p>
                <h3 className="text-xl font-semibold text-slate-900">Affordability Checker</h3>
                <p className="text-slate-700">
                  Enter your income to get a recommended rent range, and see how many current listings actually fit your budget.
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <button
                  onClick={handleOpenAffordability}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
                >
                  Check My Budget
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>
      <HowItWorks />
      <SloganBanner />
      <ExperienceCTA />
      <FaqSection />
    </div>
  )
}
