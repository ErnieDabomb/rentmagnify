import { useEffect, useState } from "react";
import Container from "./ui/Container";
import Button from "./ui/Button";
import { Link } from "react-router-dom";

export default function Header() {
  const [theme, setTheme] = useState(() => localStorage.getItem('rm_theme') || 'light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('rm_theme', theme)
  }, [theme])

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 shadow-sm">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">RentMagnify</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700 font-medium">
          <Link className="hover:text-slate-900" to="/">Home</Link>
          <Link className="hover:text-slate-900" to="/about">About</Link>
          <Link className="hover:text-slate-900" to="/map">Map</Link>
          <Link className="hover:text-slate-900" to="/negotiate">Negotiation Tool</Link>
          <Link className="hover:text-slate-900 inline-flex items-center gap-1" to="/submit">
            Share Rent
            <span className="rounded-full bg-emerald-100 px-1.5 py-[1px] text-[10px] font-semibold text-emerald-700">NEW</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
          <Button>Get started</Button>
        </div>
      </Container>
    </header>
  );
}
