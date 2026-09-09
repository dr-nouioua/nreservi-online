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
import { Building2, Clock, Trash2, TrendingUp, UserCheck, Users, Car, Scissors, Sparkles, Timer, UtensilsCrossed } from 'lucide-react'
import {
  listAllRestaurants,
  getPlatformAnalytics,
  approveRestaurant,
  suspendRestaurant,
  deleteRestaurant,
  impersonateRestaurant,
  setEventTheme as setEventThemeFlag,
} from '../../server/admin.functions'
import { EVENT_THEMES, eventThemeLabel } from '../../services/event-themes'

export const Route = createLazyFileRoute('/3991/_authed/')({
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

function SoccerBall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
      <path d="M12 2c2.5 2.5 3.8 5.5 3.8 10s-1.3 7.5-3.8 10" />
      <path d="M12 2c-2.5 2.5-3.8 5.5-3.8 10s1.3 7.5 3.8 10" />
      <path d="M2 12h20" />
      <path d="M4.5 5l3 3.5" />
      <path d="M19.5 5l-3 3.5" />
      <path d="M4.5 19l3-3.5" />
      <path d="M19.5 19l-3-3.5" />
    </svg>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  beauty_salon: 'Salon',
  spa: 'Spa',
  football_pitch: 'Terrain',
  car_rental: 'Location',
  barbershop: 'Barbier',
}

const CATEGORY_ICONS: Record<string, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  beauty_salon: Scissors,
  spa: Sparkles,
  football_pitch: SoccerBall,
  car_rental: Car,
  barbershop: Scissors,
}

const CATEGORY_COLORS: Record<string, string> = {
  restaurant: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  beauty_salon: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  spa: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  football_pitch: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  car_rental: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  barbershop: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
}

function AdminIndex() {
  const initial = Route.useLoaderData()
  const { session } = Route.useRouteContext() as {
    session: { adminRole: 'super' | 'admin'; analyticsCategories?: string[] | null }
  }
  const isSuper = session.adminRole === 'super'
  const allowedCategories = isSuper ? null : (session.analyticsCategories ?? [])
  const [restaurants, setRestaurants] = useState(() =>
    allowedCategories && allowedCategories.length > 0
      ? initial.restaurants.filter((r: any) => allowedCategories.includes(r.category ?? 'restaurant'))
      : initial.restaurants
  )
  const [allRestaurants] = useState(initial.restaurants)
  const [analytics, setAnalytics] = useState(initial.analytics)
  const [visits] = useState(initial.visits)
  const [eventTheme, setEventTheme] = useState('')
  const [eventScope, setEventScope] = useState<'all' | 'pick'>('all')
  const [eventPicked, setEventPicked] = useState<Set<number>>(new Set())
  const [eventMessage, setEventMessage] = useState<string | null>(null)

  async function refresh() {
    const [r, a] = await Promise.all([listAllRestaurants(), getPlatformAnalytics()])
    setRestaurants(r)
    setAnalytics(a)
  }

  async function applyEventTheme() {
    const ids = eventScope === 'all' ? null : [...eventPicked]
    if (ids !== null && ids.length === 0) {
      setEventMessage('Sélectionnez au moins un établissement.')
      return
    }
    const result = await setEventThemeFlag({ data: { theme: eventTheme, ids } })
    if ('error' in result && result.error) {
      setEventMessage(result.error)
      return
    }
    setEventMessage(`Thème appliqué à ${result.updated} établissement(s).`)
  }

  async function removeEventTheme() {
    const ids = eventScope === 'all' ? null : [...eventPicked]
    const result = await setEventThemeFlag({ data: { theme: '', ids } })
    if ('error' in result && result.error) {
      setEventMessage(result.error)
      return
    }
    setEventMessage('Thème retiré.')
  }

  async function impersonate(id: number) {
    await impersonateRestaurant({ data: { restaurantId: id } })
    window.location.href = '/owner'
  }


  const stats = [
    { label: "Établissements au total", value: isSuper ? analytics.totalEstablishments : restaurants.length, icon: Building2 },
    { label: "Actifs", value: isSuper ? analytics.activeEstablishments : restaurants.filter((r: any) => r.status === 'active').length, icon: TrendingUp },
    { label: "En attente de validation", value: isSuper ? analytics.pendingEstablishments : restaurants.filter((r: any) => r.status === 'pending').length, icon: Clock },
    { label: "Réservations totales", value: analytics.totalBookings, icon: Users },
  ]

  const categoryStats = (isSuper ? Object.entries(analytics.catCounts ?? {}) : Object.entries(analytics.catCounts ?? {}).filter(([cat]) => allowedCategories.length === 0 || allowedCategories.includes(cat))).map(([cat, count]) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    count,
    icon: CATEGORY_ICONS[cat] ?? UtensilsCrossed,
    color: CATEGORY_COLORS[cat] ?? 'bg-stone-100 text-stone-600',
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Dashboard</h1>

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

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
          {categoryStats.map((cs) => (
            <div key={cs.category} className={`rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 flex items-center gap-3`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cs.color}`}>
                <cs.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">{cs.label}s</p>
                <p className="text-lg font-bold text-stone-900 dark:text-stone-100">{cs.count}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
          <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Réservations par établissement</h2>
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
          <p className="mt-3 text-xs text-stone-400">Aucune visite de page établissement enregistrée sur la période.</p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-8 mb-3">Thème d'événement</h2>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-stone-400">Thème</label>
            <select
              value={eventTheme}
              onChange={(e) => setEventTheme(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
            >
              <option value="">Aucun thème</option>
              {Object.entries(EVENT_THEMES).map(([key, t]) => (
                <option key={key} value={key}>{t.emoji} {t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-stone-400">Portée</label>
            <select
              value={eventScope}
              onChange={(e) => setEventScope(e.target.value as 'all' | 'pick')}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
            >
              <option value="all">Tous les établissements</option>
              <option value="pick">Établissements spécifiques…</option>
            </select>
          </div>
        </div>

        {eventScope === 'pick' && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <label key={r.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm dark:border-stone-800">
                <input
                  type="checkbox"
                  checked={eventPicked.has(r.id)}
                  onChange={(e) => {
                    const n = new Set(eventPicked)
                    if (e.target.checked) n.add(r.id)
                    else n.delete(r.id)
                    setEventPicked(n)
                  }}
                  className="accent-lime-500"
                />
                <span className="truncate text-stone-700 dark:text-stone-300">{r.name}</span>
                {r.eventTheme && <span className="text-[10px] text-amber-600 dark:text-amber-400">({eventThemeLabel(r.eventTheme)})</span>}
              </label>
            ))}
          </div>
        )}

        {eventMessage && <p className="text-sm text-lime-700 dark:text-lime-300">{eventMessage}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={applyEventTheme}
            disabled={eventScope === 'pick' && eventPicked.size === 0}
            className="rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            Appliquer le thème
          </button>
          <button
            onClick={removeEventTheme}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Retirer le thème
          </button>
        </div>
        <p className="text-xs text-stone-400">
          Le thème ajoute un bandeau festif et des accents colorés sur la page publique des établissements concernés.
        </p>
      </div>

      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mt-8 mb-3">Établissements</h2>
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3 hidden sm:table-cell">Catégorie</th>
              <th className="px-4 py-3">Ville</th>
              {isSuper && <th className="px-4 py-3 hidden md:table-cell">E-mail</th>}
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Formule</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {restaurants.map((r) => {
              const cat = r.category ?? 'restaurant'
              const CatIcon = CATEGORY_ICONS[cat] ?? UtensilsCrossed
              const catColor = CATEGORY_COLORS[cat] ?? 'bg-stone-100 text-stone-600'
              return (
              <tr key={r.id}>
                <td className="px-3 sm:px-4 py-3 font-medium">{r.name}</td>
                <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${catColor}`}>
                    <CatIcon className="h-3 w-3" /> {CATEGORY_LABELS[cat] ?? cat}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">{r.city}</td>
                {isSuper && <td className="px-3 sm:px-4 py-3 hidden md:table-cell text-xs text-stone-500 dark:text-stone-400">{r.contactEmail}</td>}
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 capitalize">{r.subscriptionTier === 'premium' ? 'Premium' : 'Basique'}</td>
                <td className="px-3 sm:px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={async () => {
                        if (r.status === 'active') { await suspendRestaurant({ data: { id: r.id } }) } else { await approveRestaurant({ data: { id: r.id } }) }
                        refresh()
                      }}
                      title={r.status === 'active' ? "Suspendre l'accès" : "Activer l'accès"}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${r.status === 'active' ? 'bg-lime-500' : 'bg-stone-300 dark:bg-stone-600'}`}
                      aria-label={r.status === 'active' ? "Suspendre l'accès" : "Activer l'accès"}
                    >
                      <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-all ${r.status === 'active' ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                    {isSuper && <button onClick={() => impersonate(r.id)} title="Accès support" className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
                      <UserCheck className="h-4 w-4" />
                    </button>}
                    <button
                      onClick={async () => {
                        // Double confirmation for an irreversible action.
                        if (!confirm(`Supprimer ${r.name} ? Toutes ses données seront définitivement supprimées.`)) return
                        const typed = prompt(`ATTENTION — action irréversible.\nTapez le nom de l'établissement pour confirmer :\n\n${r.name}`)
                        if (typed === null) return
                        if (typed.trim().toLowerCase() !== r.name.toLowerCase()) {
                          alert('Le nom saisi ne correspond pas — suppression annulée.')
                          return
                        }
                        const result = await deleteRestaurant({ data: { id: r.id, confirmName: typed } })
                        if ('error' in result && result.error) {
                          alert(result.error)
                          return
                        }
                        refresh()
                      }}
                      title="Supprimer définitivement"
                      className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
