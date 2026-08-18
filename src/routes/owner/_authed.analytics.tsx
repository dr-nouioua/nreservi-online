import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { TrendingUp, Users, AlertTriangle, DollarSign } from 'lucide-react'
import { getAnalytics } from '../../server/owner.functions'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

export const Route = createFileRoute('/owner/_authed/analytics')({
  loader: () => getAnalytics(),
  component: AnalyticsPage,
})

function exportCsv(data: any) {
  const rows = [
    ['Metric', 'Value'],
    ['Total reservations', data.total],
    ['No-show rate (%)', data.noShowRate],
    ['Cancellation rate (%)', data.cancellationRate],
    ['Occupancy rate (%)', data.occupancyRate],
    ['Revenue estimate ($)', data.revenueEstimate],
    ['Repeat customers', data.repeatCustomers],
    ['New customers', data.newCustomers],
  ]
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'analytics-report.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function AnalyticsPage() {
  const data = Route.useLoaderData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const hourLabels = Object.keys(data.byHour).sort()
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayLabels = dayOrder.filter((d) => data.byDay[d] !== undefined)

  const stats = [
    { label: 'Occupancy rate', value: `${data.occupancyRate}%`, icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'No-show rate', value: `${data.noShowRate}%`, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Repeat customers', value: data.repeatCustomers, icon: Users, color: 'bg-emerald-500' },
    { label: 'Est. revenue', value: `$${data.revenueEstimate.toLocaleString()}`, icon: DollarSign, color: 'bg-amber-500' },
  ]

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Analytics</h1>
        <button onClick={() => exportCsv(data)} className="px-3 py-2 rounded-lg border border-stone-300 text-sm hover:bg-stone-100">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-3">
            <div className={`${s.color} p-2.5 rounded-lg`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-stone-500">{s.label}</p>
              <p className="text-xl font-bold text-stone-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">Peak hours</h2>
            <Bar
              data={{
                labels: hourLabels.map((h) => `${h}:00`),
                datasets: [{ label: 'Reservations', data: hourLabels.map((h) => data.byHour[h]), backgroundColor: 'rgba(217, 119, 6, 0.7)', borderRadius: 6 }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">Peak days</h2>
            <Bar
              data={{
                labels: dayLabels,
                datasets: [{ label: 'Reservations', data: dayLabels.map((d) => data.byDay[d]), backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: 6 }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">Reservations by area</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut
                data={{
                  labels: Object.keys(data.byArea),
                  datasets: [{ data: Object.values(data.byArea) as number[], backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'] }],
                }}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">New vs repeat customers</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut
                data={{
                  labels: ['New', 'Repeat'],
                  datasets: [{ data: [data.newCustomers, data.repeatCustomers], backgroundColor: ['#d97706', '#065f46'] }],
                }}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
