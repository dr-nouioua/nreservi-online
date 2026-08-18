import { Link } from '@tanstack/react-router'

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
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
            <p className="text-sm font-semibold text-stone-900">nreservi.online</p>
            <p className="text-sm text-stone-500">
              La plateforme de réservation en ligne pour tous vos établissements.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link to="/my-reservations" className="text-stone-600 hover:text-stone-900">
            Mes réservations
          </Link>
          <Link to="/owner/login" className="text-stone-500 hover:text-stone-900">
            Espace professionnel
          </Link>
        </div>
      </div>
    </footer>
  )
}
