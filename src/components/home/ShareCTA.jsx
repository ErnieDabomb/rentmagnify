import Container from '../ui/Container'
import { useNavigate } from 'react-router-dom'

export default function ShareCTA() {
  const navigate = useNavigate()
  return (
    <section className="relative z-10 py-10">
      <Container>
        <div className="grid gap-3 rounded-2xl border border-indigo-200 bg-white/95 px-5 py-6 shadow-soft sm:grid-cols-[1.3fr,auto] sm:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Community powered
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Share your rent and help other renters</h3>
            <p className="text-sm text-slate-700">
              Submit anonymously in under a minute. We review each report before it appears on the map.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              onClick={() => navigate('/share')}
              className="rounded-xl bg-gradient-to-b from-indigo-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,.25)] hover:brightness-105 active:translate-y-px"
            >
              Share your rent
            </button>
            <button
              onClick={() => navigate('/map')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View map
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}
