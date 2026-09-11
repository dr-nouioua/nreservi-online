import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Eye, Users } from 'lucide-react'
import { listAllAgents, getAgentStats } from '../../server/admin.functions'

export const Route = createFileRoute('/3991/_authed/commercials')({
  component: CommercialsPage,
})

function CommercialsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [agentStats, setAgentStats] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const allAgents = await listAllAgents()
      setAgents(allAgents)
      const statsMap: Record<number, any> = {}
      await Promise.all(
        allAgents.map(async (a) => {
          const s = await getAgentStats({ data: { agentId: a.id } })
          statsMap[a.id] = s
        })
      )
      setAgentStats(statsMap)
      setLoading(false)
    })()
  }, [])

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Commerciaux</h1>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-left text-xs text-stone-500 dark:text-stone-400">
                  <th className="px-4 py-3 font-medium">Agent</th>
                  <th className="px-4 py-3 font-medium text-center">Total</th>
                  <th className="px-4 py-3 font-medium text-center">Nouveaux</th>
                  <th className="px-4 py-3 font-medium text-center">En cours</th>
                  <th className="px-4 py-3 font-medium text-center">Convertis</th>
                  <th className="px-4 py-3 font-medium text-center">Taux</th>
                  <th className="px-4 py-3 font-medium">Dernière activité</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const s = agentStats[agent.id] ?? { total: 0, newThisMonth: 0, inProgress: 0, converted: 0, conversionRate: 0, lastActivityDate: null }
                  return (
                    <tr key={agent.id} className="border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-900 dark:text-stone-100">{agent.name}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{agent.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-stone-900 dark:text-stone-100">{s.total}</td>
                      <td className="px-4 py-3 text-center text-stone-600 dark:text-stone-400">{s.newThisMonth}</td>
                      <td className="px-4 py-3 text-center text-amber-600 dark:text-amber-400">{s.inProgress}</td>
                      <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400">{s.converted}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.conversionRate >= 40 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : s.conversionRate >= 20 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>{s.conversionRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500 dark:text-stone-400">
                        {s.lastActivityDate ? new Date(s.lastActivityDate).toLocaleDateString('fr') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link to="/3991/commercials/$id" params={{ id: String(agent.id) }} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-700 px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800">
                          <Eye className="h-3.5 w-3.5" /> Voir
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {agents.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">Aucun agent commercial.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}