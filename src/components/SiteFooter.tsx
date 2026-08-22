import { Link } from '@tanstack/react-router'

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <img
            src="/brand/nreservi-mark.png"
            alt=""
            width={172}
            height={125}
            className="h-7 w-auto"
          />
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">nreservi.online</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              La plateforme de réservation en ligne pour tous vos établissements.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link to="/my-reservations" className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">
            Mes réservations
          </Link>
          <Link to="/owner/login" className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">
            Espace professionnel
          </Link>
        </div>
      </div>
    </footer>
  )
}
