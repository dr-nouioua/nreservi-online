import { createFileRoute } from '@tanstack/react-router'
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
import { Building2, Clock, KeyRound, Save, TrendingUp, Users } from 'lucide-react'
import { changePassword } from '../../server/auth.functions'
import {
  listAllRestaurants,
  getPlatformAnalytics,
  approveRestaurant,
  suspendRestaurant,
  deleteRestaurant,
  setSubscriptionTier,
  impersonateRestaurant,
} from '../../server/admin.functions'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const Route = createFileRoute('/admin/_authed/')({
  loader: async () => {
    const [restaurants, analytics] = await Promise.all([listAllRestaurants(), getPlatformAnalytics()])
    return { restaurants, analytics }
  },
  component: AdminIndex,
})

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
}

function AdminIndex() {
  const initial = Route.useLoaderData()
  const [restaurants, setRestaurants] = useState(initial.restaurants)
  const [analytics, setAnalytics] = useState(initial.analytics)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  async function refresh() {
    const [r, a] = await Promise.all([listAllRestaurants(), getPlatformAnalytics()])
    setRestaurants(r)
    setAnalytics(a)
  }

  async function impersonate(id: number) {
    await impersonateRestaurant({ data: { restaurantId: id } })
    window.location.href = '/owner'
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    const result = await changePassword({ data: passwords })
    if ('error' in result && result.error) {
      setPasswordMessage(result.error)
      return
    }
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordMessage('Password updated.')
  }

  const stats = [
    { label: 'Total restaurants', value: analytics.totalRestaurants, icon: Building2 },
    { label: 'Active', value: analytics.activeRestaurants, icon: TrendingUp },
    { label: 'Pending approval', value: analytics.pendingRestaurants, icon: Clock },
    { label: 'Total bookings', value: analytics.totalBookings, icon: Users },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Platform overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-3">
            <div className="bg-stone-900 p-2.5 rounded-lg"><s.icon className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs text-stone-500">{s.label}</p>
              <p className="text-xl font-bold text-stone-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-[1fr_340px]">
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-700 mb-4">Bookings by restaurant</h2>
          <Bar
            data={{
              labels: Object.keys(analytics.byRestaurant),
              datasets: [{ label: 'Bookings', data: Object.values(analytics.byRestaurant), backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 6 }],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
          />
        </div>

        <form onSubmit={updatePassword} className="bg-white rounded-xl border border-stone-200 p-6 h-fit space-y-3">
          <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Admin password</h2>
          <input required type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder="Current password" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <input required type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="New password" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <input required type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} placeholder="Confirm new password" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          {passwordMessage && <p className={`text-sm ${passwordMessage.includes('updated') ? 'text-emerald-600' : 'text-red-600'}`}>{passwordMessage}</p>}
          <button className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800"><Save className="h-4 w-4" /> Change password</button>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-stone-900 mt-8 mb-3">Restaurants</h2>
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {restaurants.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">{r.city}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.subscriptionTier}
                    onChange={async (e) => {
                      await setSubscriptionTier({ data: { id: r.id, tier: e.target.value } })
                      refresh()
                    }}
                    className="px-2 py-1 rounded border border-stone-200 text-xs"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                  {r.status !== 'active' && (
                    <button onClick={async () => { await approveRestaurant({ data: { id: r.id } }); refresh() }} className="text-emerald-600 hover:underline text-xs">Approve</button>
                  )}
                  {r.status !== 'suspended' && (
                    <button onClick={async () => { await suspendRestaurant({ data: { id: r.id } }); refresh() }} className="text-amber-600 hover:underline text-xs">Suspend</button>
                  )}
                  <button onClick={() => impersonate(r.id)} className="text-blue-600 hover:underline text-xs">Support login</button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete ${r.name}? This removes all its data.`)) {
                        await deleteRestaurant({ data: { id: r.id } })
                        refresh()
                      }
                    }}
                    className="text-red-600 hover:underline text-xs"
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
