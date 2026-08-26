import { createFileRoute, redirect } from '@tanstack/react-router'
import { listAdminLogs } from '../../server/admin.functions'

export const Route = createFileRoute('/3991/_authed/logs')({
  beforeLoad: ({ context }) => {
    const { session } = context as { session: { adminRole: 'super' | 'admin' } }
    if (session.adminRole !== 'super') throw redirect({ to: '/3991' })
  },
  loader: () => listAdminLogs(),
  component: LogsPage,
})

type LogRow = Awaited<ReturnType<typeof listAdminLogs>>[number]

const ACTION_LABELS: Record<string, string> = {
  'restaurant.approve': 'Restaurant validé',
  'restaurant.suspend': 'Restaurant suspendu',
  'restaurant.delete': 'Restaurant supprimé',
  'restaurant.onboard': 'Restaurant créé',
  'restaurant.impersonate': 'Accès support ouvert',
  'subscription.tier': 'Formule modifiée',
  'subscription.dates': 'Période modifiée',
  'subscription.renew': 'Abonnement renouvelé',
  'ad.create': 'Annonce créée',
  'ad.update': 'Annonce modifiée',
  'ad.toggle': 'Annonce affichée/masquée',
  'ad.delete': 'Annonce supprimée',
  'mail.config': 'Configuration SMTP',
  'admin.create': 'Administrateur créé',
  'admin.delete': 'Administrateur supprimé',
  'admin.permissions': 'Privilèges modifiés',
}

function LogsPage() {
  const logs = Route.useLoaderData()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Journal d'activité</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Les 100 dernières actions effectuées dans l'administration.
        </p>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-sm">
        {logs.length === 0 ? (
          <p className="text-sm text-stone-400">Aucune activité enregistrée.</p>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {logs.map((row: LogRow) => (
              <li key={row.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                    {ACTION_LABELS[row.action] ?? row.action}
                  </p>
                  {row.details && <p className="truncate text-xs text-stone-500 dark:text-stone-400">{row.details}</p>}
                  <p className="text-[11px] text-stone-400">{row.adminEmail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-stone-400">
                  {new Date(row.createdAt ?? '').toLocaleString('fr-FR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
