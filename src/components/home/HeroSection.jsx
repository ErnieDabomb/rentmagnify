import { Link } from 'react-router-dom'
import BubbleBG from '../BubbleBG'
import Container from '../ui/Container'
import MapPreview from './MapPreview'

export default function HeroSection({ onOpenMap }) {
  return (
    <section className="relative z-10 mt-14">
      <Container>
        <div className="relative grid gap-8 overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-8 shadow-soft backdrop-blur lg:grid-cols-[1.1fr,0.9fr]">
          <div className="grid gap-4">
            <span className="w-max rounded-full border border-blue-600/20 bg-blue-600/10 px-3 py-1 text-xs tracking-wide text-blue-900">
              Consumer-first rent transparency
            </span>

            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              See real rents. <span className="text-blue-600">Share what you pay.</span>
            </h1>
            <div className="mt-1 mb-2 text-sm text-slate-500">Privacy-first, ad-free</div>

            <p className="max-w-[62ch] text-[15px] text-slate-600 sm:text-base">
              RentMagnify helps renters compare fair market prices and make confident decisions—all in a privacy-first, ad-free
              experience.
            </p>

            <div className="mt-1 flex flex-wrap gap-3">
              <button
                onClick={onOpenMap}
                className="rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-2 font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,.25)] hover:brightness-105 active:translate-y-px"
              >
                Open Map Tool
              </button>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-900/10 bg-white px-4 py-2 text-slate-900 hover:bg-slate-50"
              >
                Learn more
              </Link>
            </div>

            <p className="text-xs text-slate-500">
              No account required to browse. Sharing your rent is optional and helps others.
            </p>
          </div>

          <MapPreview />
        </div>
      </Container>
      <BubbleBG />
    </section>
  )
}
