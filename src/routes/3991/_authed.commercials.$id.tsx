import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { listProspects, getAgentStats, listProspectActivities, createProspectActivity } from '../../server/admin.functions'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/3991/_authed/commercials/$id')({
  component: AgentDetailPage,
})

const STAGES = [
  { key: 'new', label: 'Nouveau', color: 'bg-stone-100 dark:bg-stone-800', dot: 'bg-stone-400' },
  { key: 'contacted', label: 'Contacté', color: 'bg-blue-50 dark:bg-blue-500/10', dot: 'bg-blue-500' },
  { key: 'qualified', label: 'Qualifié', color: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-500' },
  { key: 'proposal', label: 'Proposition', color: 'bg-purple-50 dark:bg-purple-500/10', dot: 'bg-purple-500' },
  { key: 'negotiation', label: 'Négociation', color: 'bg-orange-50 dark:bg-orange-500/10', dot: 'bg-orange-500' },
  { key: 'onboarded', label: 'Converti', color: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-500' },
  { key: 'lost', label: 'Perdu', color: 'bg-red-50 dark:bg-red-500/10', dot: 'bg-red-400' },
]

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  proposal: 'Proposition',
  negotiation: 'Négociation',
  onboarded: 'Converti',
  lost: 'Perdu',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

const BUSINESS_TYPES: Record<string, string> = {
  restaurant: 'Restaurant',
  beauty_salon: 'Salon',
  spa: 'Spa',
  football_pitch: 'Terrain',
  car_rental: 'Location',
  barbershop: 'Barbier',
  doctor: 'Médecin',
}

const ACTIVITY_TYPES: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  visit: MapPin,
  meeting: Users,
  note: FileText,
}

const OUTCOME_LABELS: Record<string, string> = {
  positive: 'Positif',
  neutral: 'Neutre',
  negative: 'Négatif',
  no_answer: 'Pas de réponse',
}

function AgentDetailPage() {
  const { id } = Route.useParams()
  const agentId = Number(id)

  const [prospects, setProspects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [selectedProspect, setSelectedProspect] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const [p, s] = await Promise.all([
      listProspects({ data: undefined }),
      getAgentStats({ data: { agentId } }),
    ])
    // Filter by agentId client-side since listProspects respects role
    setProspects(p.filter((r: any) => r.agentId === agentId))
    setStats(s)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [agentId])

  useEffect(() => {
    if (selectedProspect) {
      listProspectActivities({ data: { prospectId: selectedProspect.id } }).then(setActivities)
    }
  }, [selectedProspect])

  const filtered = prospects.filter((p) => {
    const term = search.toLowerCase()
    return !term || p.businessName.toLowerCase().includes(term) || p.city?.toLowerCase().includes(term)
  })

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/3991/commercials" className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Agent Commercial</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">ID #{agentId}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4">
            <p className="text-xs text-stone-500">Total</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4">
            <p className="text-xs text-stone-500">En cours</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4">
            <p className="text-xs text-stone-500">Convertis</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.converted}</p>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4">
            <p className="text-xs text-stone-500">Taux</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.conversionRate}%</p>
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full rounded-lg border border-stone-200 dark:border-stone-700 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500" />
      </div>

      {loading ? (
        <p className="text-sm text-stone-500">Chargement...</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageProspects = filtered.filter((p) => (p.status ?? 'new') === stage.key)
            return (
              <div key={stage.key} className="min-w-[260px] flex-1">
                <div className={`rounded-lg p-3 ${stage.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{stage.label}</span>
                    </div>
                    <span className="text-xs text-stone-500">{stageProspects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageProspects.map((p) => (
                      <div key={p.id} onClick={() => setSelectedProspect(p)} className="rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{p.businessName}</p>
                          <span className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[p.priority ?? 'medium']}`}>
                            {p.priority === 'high' ? '!' : p.priority === 'low' ? '↓' : '·'}
                          </span>
                        </div>
                        {p.contactName && <p className="text-xs text-stone-500 mt-1">{p.contactName}</p>}
                        {p.city && <p className="text-xs text-stone-400 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {p.city}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setSelectedProspect(null); setActivities([]) }}>
          <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{selectedProspect.businessName}</h2>
                <p className="text-sm text-stone-500">{BUSINESS_TYPES[selectedProspect.businessType] ?? selectedProspect.businessType} · {selectedProspect.city || '—'}</p>
              </div>
              <button onClick={() => { setSelectedProspect(null); setActivities([]) }} className="rounded p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">✕</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-stone-500">Contact</p>
                <p className="font-medium text-stone-900 dark:text-stone-100">{selectedProspect.contactName || '—'}</p>
                {selectedProspect.contactPhone && <p className="text-stone-600 flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedProspect.contactPhone}</p>}
                {selectedProspect.contactEmail && <p className="text-stone-600 flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedProspect.contactEmail}</p>}
              </div>
              <div>
                <p className="text-xs text-stone-500">Statut</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${STAGES.find((s) => s.key === (selectedProspect.status ?? 'new'))?.dot ?? 'bg-stone-400'}`} />
                  <span className="font-medium text-stone-900 dark:text-stone-100">{STATUS_LABELS[selectedProspect.status ?? 'new']}</span>
                </div>
              </div>
              {selectedProspect.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-stone-500">Notes</p>
                  <p className="text-stone-600 whitespace-pre-wrap">{selectedProspect.notes}</p>
                </div>
              )}
            </div>
            <div className="border-t border-stone-200 dark:border-stone-800 p-4">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">Activités</h3>
              {activities.length === 0 ? (
                <p className="text-sm text-stone-400">Aucune activité.</p>
              ) : (
                <div className="space-y-2">
                  {activities.map((a) => {
                    const TypeIcon = ACTIVITY_TYPES[a.type] ?? FileText
                    return (
                      <div key={a.id} className="flex items-start gap-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 p-3">
                        <div className="mt-0.5 rounded-full bg-stone-200 dark:bg-stone-700 p-1.5">
                          <TypeIcon className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{a.type}</span>
                            {a.outcome && <span className="text-xs text-stone-500">· {OUTCOME_LABELS[a.outcome]}</span>}
                          </div>
                          {a.subject && <p className="text-xs text-stone-600">{a.subject}</p>}
                          {a.notes && <p className="text-xs text-stone-500 mt-1">{a.notes}</p>}
                        </div>
                        <span className="text-xs text-stone-400 shrink-0">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr') : ''}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}