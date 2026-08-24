import { createFileRoute } from '@tanstack/react-router'
import { getOwnSubscription } from '../../server/owner.functions'

export const Route = createFileRoute('/owner/_authed/billing')({
  loader: () => getOwnSubscription(),
  component: BillingPage,
})

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  expiring_soon: { label: 'Expire bientôt', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  expired: { label: 'Expiré', className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
  suspended: { label: 'Suspendu', className: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300' },
  pending: { label: 'En attente de validation', className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function BillingPage() {
  const sub = Route.useLoaderData()
  const badge = STATUS_LABELS[sub.effective] ?? STATUS_LABELS.active
  const locked = sub.effective === 'expired' || sub.effective === 'suspended' || sub.effective === 'pending'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Facturation</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight dark:text-stone-50">Abonnement</h1>
      </div>

      {locked && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {sub.effective === 'expired' && (
            <>
              <p className="font-semibold">Votre abonnement a expiré.</p>
              <p className="mt-1">Votre accès à l'espace professionnel est actuellement suspendu. Veuillez contacter l'administration pour renouveler votre abonnement.</p>
            </>
          )}
          {sub.effective === 'suspended' && (
            <p>Votre compte est actuellement suspendu par l'administration. Contactez-nous pour rétablir votre accès.</p>
          )}
          {sub.effective === 'pending' && (
            <p>Votre établissement est en attente de validation par l'administration.</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">{sub.name}</p>
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">Formule : {sub.tier === 'premium' ? 'Premium' : 'Basique'}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${badge.className}`}>{badge.label}</span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Début</dt>
            <dd className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">{formatDate(sub.start)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Fin</dt>
            <dd className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">{formatDate(sub.end)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Jours restants</dt>
            <dd className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">
              {sub.daysLeft == null ? 'Illimité' : sub.daysLeft >= 0 ? `${sub.daysLeft} jour${sub.daysLeft === 1 ? '' : 's'}` : `Expiré depuis ${Math.abs(sub.daysLeft)} j`}
            </dd>
          </div>
        </dl>

        <p className="mt-6 border-t border-stone-100 pt-4 text-xs text-stone-400 dark:border-stone-800">
          Pour renouveler ou changer de formule, contactez l'administration nreservi.online.
        </p>
      </div>
    </div>
  )
}
