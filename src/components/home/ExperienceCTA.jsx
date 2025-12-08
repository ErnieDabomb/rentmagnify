import Container from '../ui/Container'
import { useNavigate } from 'react-router-dom'

export default function ExperienceCTA() {
  const navigate = useNavigate()
  return (
    <section className="relative z-10 pb-12">
      <Container>
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-blue-600/30 bg-white/90 px-5 py-4 shadow-soft sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="text-sm font-semibold text-blue-700">Add your experience</div>
            <div className="text-base text-slate-800">Share what you pay and help other renters make better calls.</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/submit')}
              className="rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,.25)] hover:brightness-105 active:translate-y-px"
            >
              Share your rent
            </button>
            <button
              onClick={() => navigate('/about')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Why we do this
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}
