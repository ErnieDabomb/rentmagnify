export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto grid gap-4">
      <div className="mb-1 inline-block rounded-full border border-blue-600/20 bg-gradient-to-r from-indigo-600/10 to-blue-600/10 px-2 py-0.5 text-xs font-medium text-blue-900">About</div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">About RentMagnify</h1>
      <div className="mt-1 mb-2 text-sm text-slate-500">Our mission: fair, transparent rentals</div>
      <p className="text-slate-700">
        RentMagnify is a consumer-first tool to bring transparency to rental markets. We aggregate community submissions and public data so renters can compare fair prices and make confident decisions — without ads or dark patterns.
      </p>
      <h2 className="text-xl font-semibold mt-4">FAQ</h2>
      <div className="grid gap-3">
        <div>
          <div className="font-semibold">How is data collected?</div>
          <div className="text-slate-700 text-sm">From anonymous community submissions and public sources. Submissions are moderated before appearing on the map.</div>
        </div>
        <div>
          <div className="font-semibold">Is my data private?</div>
          <div className="text-slate-700 text-sm">Yes. We only store the fields you provide to help others compare rents. No third‑party tracking or ads.</div>
        </div>
        <div>
          <div className="font-semibold">Why can I submit only once every 72 hours?</div>
          <div className="text-slate-700 text-sm">To reduce spam while keeping the barrier to contribute low. We may adjust limits over time.</div>
        </div>
        <div>
          <div className="font-semibold">Can I request a data correction?</div>
          <div className="text-slate-700 text-sm">
            Absolutely. Contact us via the footer links with the listing ID and details, or email
            {' '}<a className="text-blue-600 hover:underline" href="mailto:corrections@rentmagnify.com">corrections@rentmagnify.com</a>.
          </div>
        </div>
      </div>
      <h2 id="contact" className="text-xl font-semibold mt-4">Contact</h2>
      <p className="text-slate-700 text-sm">Questions or feedback? Email <a className="text-blue-600 hover:underline" href="mailto:contact@rentmagnify.com">contact@rentmagnify.com</a>.</p>
    </div>
  )
}
