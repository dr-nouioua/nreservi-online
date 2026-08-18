import { Link } from '@tanstack/react-router'

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-3">
        <Link to="/" className="flex min-w-0 items-center" aria-label="nreservi.online — accueil">
          <img
            src="/brand/nreservi-logo.png"
            alt="nreservi.online"
            width={815}
            height={125}
            className="h-6 w-auto max-w-full object-contain object-left sm:h-8"
          />
        </Link>
        <nav aria-label="Navigation client">
          <Link
            to="/my-reservations"
            className="rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition sm:px-4"
            activeProps={{ className: 'border-lime-400 bg-lime-50 text-stone-900' }}
            inactiveProps={{
              className:
                'border-stone-200 text-stone-700 hover:border-lime-400 hover:bg-lime-50 hover:text-stone-900',
            }}
          >
            Mes réservations
          </Link>
        </nav>
      </div>
    </header>
  )
}
