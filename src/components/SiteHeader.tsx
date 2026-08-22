import { Link } from '@tanstack/react-router'
import { ThemeToggle } from './ThemeToggle'
import { BrandLogo } from './BrandLogo'

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-10 dark:border-stone-800 dark:bg-stone-900/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-3">
        <Link to="/" className="flex min-w-0 items-center" aria-label="nreservi.online — accueil">
          <BrandLogo className="h-6 w-auto max-w-full object-contain object-left sm:h-8" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <nav aria-label="Navigation client">
            <Link
              to="/my-reservations"
              className="rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition sm:px-4 dark:border-stone-700 dark:text-stone-200 dark:hover:border-lime-500 dark:hover:bg-lime-50 dark:hover:bg-lime-500/100/10"
              activeProps={{ className: 'border-lime-400 bg-lime-50 text-stone-900 dark:border-lime-500/60 dark:bg-lime-500/15 dark:text-lime-300' }}
              inactiveProps={{
                className:
                  'border-stone-200 text-stone-700 hover:border-lime-400 hover:bg-lime-50 dark:hover:bg-lime-500/10 hover:text-stone-900',
              }}
            >
              Mes réservations
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
