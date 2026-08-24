import { createLazyFileRoute } from '@tanstack/react-router'
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
import { formatPriceDA } from '../../services/format'

export const Route = createLazyFileRoute('/owner/_authed/analytics')({
  component: AnalyticsPage,
})

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// Neutral stone tones readable on both light and dark cards.
const CHART_TICK = '#a8a29e'
const CHART_GRID = 'rgba(168, 162, 158, 0.25)'
const barScales = {
  x: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
  y: { ticks: { color: CHART_TICK }, grid: { color: CHART_GRID } },
}
const doughnutLegend = { legend: { position: 'bottom' as const, labels: { color: CHART_TICK } } }

function exportCsv(data: any) {
  const rows = [
    ["Indicateur", "Valeur"],
    ["Réservations totales", data.total],
    ["Taux de no-show (%)", data.noShowRate],
    ["Taux d'annulation (%)", data.cancellationRate],
    ["Taux d'occupation (%)", data.occupancyRate],
    ["Revenu estimé (DA)", data.revenueEstimate],
    ["Clients fidèles", data.repeatCustomers],
    ["Nouveaux clients", data.newCustomers],
  ]
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'statistiques-nreservi.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function AnalyticsPage() {
  const data = Route.useLoaderData()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const hourLabels = Object.keys(data.byHour).sort()
  const dayOrder = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const dayLabels = dayOrder.filter((d) => data.byDay[d] !== undefined)

  const stats = [
    { label: "Taux d'occupation", value: `${data.occupancyRate}%`, icon: TrendingUp, color: 'bg-blue-500' },
    { label: "Taux de no-show", value: `${data.noShowRate}%`, icon: AlertTriangle, color: 'bg-red-500' },
    { label: "Clients fidèles", value: data.repeatCustomers, icon: Users, color: 'bg-emerald-500' },
    { label: 'Revenu est.', value: formatPriceDA(data.revenueEstimate), icon: DollarSign, color: 'bg-amber-500' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Statistiques</h1>
        <button onClick={() => exportCsv(data)} className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm hover:bg-stone-100 dark:hover:bg-stone-800">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 flex items-center gap-3">
            <div className={`${s.color} p-2.5 rounded-lg`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">{s.label}</p>
              <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Heures de pointe</h2>
            <Bar
              data={{
                labels: hourLabels.map((h) => `${h}:00`),
                datasets: [{ label: "Réservations", data: hourLabels.map((h) => data.byHour[h]), backgroundColor: 'rgba(217, 119, 6, 0.7)', borderRadius: 6 }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: barScales }}
            />
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Jours de pointe</h2>
            <Bar
              data={{
                labels: dayLabels,
                datasets: [{ label: "Réservations", data: dayLabels.map((d) => data.byDay[d]), backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: 6 }],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: barScales }}
            />
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Réservations par espace</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut
                data={{
                  labels: Object.keys(data.byArea),
                  datasets: [{ data: Object.values(data.byArea) as number[], backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'] }],
                }}
                options={{ responsive: true, plugins: doughnutLegend }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-4">Nouveaux vs clients fidèles</h2>
            <div className="max-w-xs mx-auto">
              <Doughnut
                data={{
                  labels: ["Nouveaux", "Fidèles"],
                  datasets: [{ data: [data.newCustomers, data.repeatCustomers], backgroundColor: ['#d97706', '#065f46'] }],
                }}
                options={{ responsive: true, plugins: doughnutLegend }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
