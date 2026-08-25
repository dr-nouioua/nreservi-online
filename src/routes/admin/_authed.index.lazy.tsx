import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Building2, Clock, TrendingUp, Users } from 'lucide-react'
import {
  listAllRestaurants,
  getPlatformAnalytics,
  approveRestaurant,
  suspendRestaurant,
  deleteRestaurant,
  impersonateRestaurant,
} from '../../server/admin.functions'

export const Route = createLazyFileRoute('/admin/_authed/')({
  component: AdminIndex,
})

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Neutral stone tones readable on both light and dark cards.
const CHART_TICK = '#a8a29e'
const CHART_GRID = 'rgba(168, 162, 158, 0.25)'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
  suspended: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400',
}

function AdminIndex() {
  const initial = Route.useLoaderData()
  const [restaurants, setRestaurants] = useState(initial.restaurants)
  const [analytics, setAnalytics] = useState(initial.analytics)
  const [visits] = useState(initial.visits)

  async function refresh() {
    const [r, a] = await Promise.all([listAllRestaurants(), getPlatformAnalytics()])
    setRestaurants(r)
    setAnalytics(a)
  }

  async function impersonate(id: number) {
    await impersonateRestaurant({ data: { restaurantId: id } })
    window.location.href = '/owner'
  }


  const stats = [
    { label: "Restaurants au total", value: analytics.totalRestaurants, icon: Building2 },
    { label: "Active", value: analytics.activeRestaurants, icon: TrendingUp },
    { label: "En attente de validation", value: analytics.pendingRestaurants, icon: Clock },
    { label: "Réservations totales", value: analytics.totalBookings, icon: Users },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Vue d'ensemble</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 flex items-center gap-3">
            <div className="bg-stone-900 p-2.5 rounded-lg dark:bg-stone-800"><s.icon className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">{s.label}</p>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Réservations par restaurant</h2>
          <Bar
            data={{
              labels: Object.keys(analytics.byRestaurant),
              datasets: [{ label: "Réservations", data: Object.values(analytics.byRestaurant), backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 6 }],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
                y: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
              },
            }}
          />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-8 mb-3">Visites de la plateforme (30 derniers jours)</h2>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800/60">
            <p className="text-xs uppercase tracking-wide text-stone-400">Aujourd'hui</p>
            <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">{visits.today}</p>
          </div>
          <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-800/60">
            <p className="text-xs uppercase tracking-wide text-stone-400">30 derniers jours</p>
            <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">{visits.last30Days}</p>
          </div>
        </div>
        {visits.perRestaurant.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {visits.perRestaurant.map((r) => (
              <li key={r.slug} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-stone-600 dark:text-stone-300">{r.name}</span>
                <span className="shrink-0 font-medium text-stone-800 dark:text-stone-200">{r.visits} visites</span>
              </li>
            ))}
          </ul>
        )}
        {visits.perRestaurant.length === 0 && (
          <p className="mt-3 text-xs text-stone-400">Aucune visite de page restaurant enregistrée sur la période.</p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-8 mb-3">Restaurants</h2>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Formule</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {restaurants.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.city}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 capitalize">{r.subscriptionTier === 'premium' ? 'Premium' : 'Basique'}</td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {r.status !== 'active' && (
                    <button onClick={async () => { await approveRestaurant({ data: { id: r.id } }); refresh() }} className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs">Valider</button>
                  )}
                  {r.status !== 'suspended' && (
                    <button onClick={async () => { await suspendRestaurant({ data: { id: r.id } }); refresh() }} className="text-amber-600 dark:text-amber-400 hover:underline text-xs">Suspendre</button>
                  )}
                  <button onClick={() => impersonate(r.id)} className="text-blue-600 hover:underline text-xs">Accès support</button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete ${r.name}? This removes all its data.`)) {
                        await deleteRestaurant({ data: { id: r.id } })
                        refresh()
                      }
                    }}
                    className="text-red-600 dark:text-red-400 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
