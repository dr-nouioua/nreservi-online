import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Edit2,
  Eye,
  FileText,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { listProspects, getProspectStats, createProspect, updateProspect, deleteProspect, listProspectActivities, createProspectActivity, updateProspectActivity, deleteProspectActivity } from '../../server/admin.functions'

export const Route = createFileRoute('/3991/_authed/contacts')({
  component: ContactsPage,
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

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'beauty_salon', label: 'Salon de beauté' },
  { value: 'spa', label: 'Spa' },
  { value: 'football_pitch', label: 'Terrain de foot' },
  { value: 'car_rental', label: 'Location de voitures' },
  { value: 'barbershop', label: 'Barbier' },
  { value: 'doctor', label: 'Médecin' },
]

const SOURCE_LABELS: Record<string, string> = {
  google: 'Google',
  referral: 'Bouche à oreille',
  walk_in: 'Visite',
  social: 'Réseau social',
  other: 'Autre',
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Appel', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'visit', label: 'Visite', icon: MapPin },
  { value: 'meeting', label: 'Réunion', icon: Users },
  { value: 'note', label: 'Note', icon: FileText },
]

const OUTCOME_LABELS: Record<string, string> = {
  positive: 'Positif',
  neutral: 'Neutre',
  negative: 'Négatif',
  no_answer: 'Pas de réponse',
}

function ContactsPage() {
  const [prospects, setProspects] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editProspect, setEditProspect] = useState<any>(null)
  const [selectedProspect, setSelectedProspect] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [p, s] = await Promise.all([listProspects(), getProspectStats()])
    setProspects(p)
    setStats(s)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (selectedProspect) {
      listProspectActivities({ data: { prospectId: selectedProspect.id } }).then(setActivities)
    }
  }, [selectedProspect])

  const filtered = prospects.filter((p) => {
    const term = search.toLowerCase()
    return !term || p.businessName.toLowerCase().includes(term) || p.city.toLowerCase().includes(term) || p.contactName.toLowerCase().includes(term)
  })

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Prospection</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')} className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800">
            {view === 'kanban' ? 'Liste' : 'Kanban'}
          </button>
          <button onClick={() => { setEditProspect(null); setShowForm(true) }} className="inline-flex items-center gap-2 rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white hover:bg-lime-700">
            <Plus className="h-4 w-4" /> Nouveau
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Nouveaux ce mois" value={stats.newThisMonth} color="text-stone-900 dark:text-stone-100" />
          <StatCard label="En cours" value={stats.inProgress} color="text-amber-600 dark:text-amber-400" />
          <StatCard label="Convertis" value={stats.converted} color="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="Taux de conversion" value={`${stats.conversionRate}%`} color="text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un prospect..." className="w-full rounded-lg border border-stone-200 dark:border-stone-700 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500" />
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
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
                    <span className="text-xs text-stone-500 dark:text-stone-400">{stageProspects.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageProspects.map((p) => (
                      <ProspectCard key={p.id} prospect={p} onClick={() => setSelectedProspect(p)} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List */}
      {view === 'list' && (
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-left text-xs text-stone-500 dark:text-stone-400">
                  <th className="px-4 py-3 font-medium">Entreprise</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Priorité</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer" onClick={() => setSelectedProspect(p)}>
                    <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">{p.businessName}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{p.contactName || '—'}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{p.city || '—'}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{BUSINESS_TYPES.find((t) => t.value === p.businessType)?.label ?? p.businessType}</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">{STATUS_LABELS[p.status ?? 'new']}</span></td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[p.priority ?? 'medium']}`}>{p.priority === 'high' ? 'Haute' : p.priority === 'low' ? 'Basse' : 'Moyenne'}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedProspect(p) }} className="rounded p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"><Eye className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <ProspectForm
          prospect={editProspect}
          onClose={() => { setShowForm(false); setEditProspect(null) }}
          onSaved={() => { setShowForm(false); setEditProspect(null); refresh() }}
        />
      )}

      {/* Detail Modal */}
      {selectedProspect && (
        <ProspectDetail
          prospect={selectedProspect}
          activities={activities}
          onClose={() => { setSelectedProspect(null); setActivities([]) }}
          onRefresh={refresh}
          onAddActivity={() => setShowActivityForm(true)}
        />
      )}

      {/* Activity Form Modal */}
      {showActivityForm && selectedProspect && (
        <ActivityForm
          prospectId={selectedProspect.id}
          onClose={() => setShowActivityForm(false)}
          onSaved={() => { setShowActivityForm(false); listProspectActivities({ data: { prospectId: selectedProspect.id } }).then(setActivities) }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4">
      <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

function ProspectCard({ prospect, onClick }: { prospect: any; onClick: () => void }) {
  return (
    <div onClick={onClick} className="rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-3 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{prospect.businessName}</p>
        <span className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[prospect.priority ?? 'medium']}`}>
          {prospect.priority === 'high' ? '!' : prospect.priority === 'low' ? '↓' : '·'}
        </span>
      </div>
      {prospect.contactName && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{prospect.contactName}</p>}
      {prospect.city && <p className="text-xs text-stone-400 dark:text-stone-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {prospect.city}</p>}
    </div>
  )
}

function ProspectForm({ prospect, onClose, onSaved }: { prospect: any | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    businessName: prospect?.businessName ?? '',
    businessType: prospect?.businessType ?? 'restaurant',
    city: prospect?.city ?? '',
    address: prospect?.address ?? '',
    contactName: prospect?.contactName ?? '',
    contactPhone: prospect?.contactPhone ?? '',
    contactEmail: prospect?.contactEmail ?? '',
    source: prospect?.source ?? 'other',
    priority: prospect?.priority ?? 'medium',
    status: prospect?.status ?? 'new',
    notes: prospect?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (prospect) {
      await updateProspect({ data: { id: prospect.id, ...form } })
    } else {
      await createProspect({ data: form })
    }
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{prospect ? 'Modifier le prospect' : 'Nouveau prospect'}</h2>
          <button onClick={onClose} className="rounded p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom de l'entreprise *" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} required />
            <Select label="Type" value={form.businessType} options={BUSINESS_TYPES} onChange={(v) => setForm({ ...form, businessType: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Input label="Adresse" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
            <Input label="Téléphone" value={form.contactPhone} onChange={(v) => setForm({ ...form, contactPhone: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" value={form.contactEmail} onChange={(v) => setForm({ ...form, contactEmail: v })} />
            <Select label="Source" value={form.source} options={Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))} onChange={(v) => setForm({ ...form, source: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priorité" value={form.priority} options={[{ value: 'low', label: 'Basse' }, { value: 'medium', label: 'Moyenne' }, { value: 'high', label: 'Haute' }]} onChange={(v) => setForm({ ...form, priority: v })} />
            <Select label="Statut" value={form.status} options={STAGES.map((s) => ({ value: s.key, label: s.label }))} onChange={(v) => setForm({ ...form, status: v })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800">Annuler</button>
            <button type="submit" disabled={saving || !form.businessName} className="rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white hover:bg-lime-700 disabled:opacity-50">{saving ? 'Enregistrement...' : prospect ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProspectDetail({ prospect, activities, onClose, onRefresh, onAddActivity }: { prospect: any; activities: any[]; onClose: () => void; onRefresh: () => void; onAddActivity: () => void }) {
  const [editMode, setEditMode] = useState(false)

  async function handleStatusChange(status: string) {
    await updateProspect({ data: { id: prospect.id, status } })
    onRefresh()
    onClose()
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce prospect ?')) return
    await deleteProspect({ data: { id: prospect.id } })
    onRefresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{prospect.businessName}</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">{BUSINESS_TYPES.find((t) => t.value === prospect.businessType)?.label} · {prospect.city || 'Ville non renseignée'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditMode(true)} className="rounded p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"><Edit2 className="h-4 w-4" /></button>
            <button onClick={handleDelete} className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
            <button onClick={onClose} className="rounded p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"><X className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Contact</p>
            <p className="font-medium text-stone-900 dark:text-stone-100">{prospect.contactName || '—'}</p>
            {prospect.contactPhone && <p className="text-stone-600 dark:text-stone-400 flex items-center gap-1"><Phone className="h-3 w-3" /> {prospect.contactPhone}</p>}
            {prospect.contactEmail && <p className="text-stone-600 dark:text-stone-400 flex items-center gap-1"><Mail className="h-3 w-3" /> {prospect.contactEmail}</p>}
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400">Statut</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`h-2.5 w-2.5 rounded-full ${STAGES.find((s) => s.key === (prospect.status ?? 'new'))?.dot ?? 'bg-stone-400'}`} />
              <span className="font-medium text-stone-900 dark:text-stone-100">{STATUS_LABELS[prospect.status ?? 'new']}</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">Source</p>
            <p className="text-stone-600 dark:text-stone-400">{SOURCE_LABELS[prospect.source] ?? prospect.source}</p>
          </div>
          {prospect.notes && (
            <div className="col-span-2">
              <p className="text-xs text-stone-500 dark:text-stone-400">Notes</p>
              <p className="text-stone-600 dark:text-stone-400 whitespace-pre-wrap">{prospect.notes}</p>
            </div>
          )}
        </div>

        {/* Status Actions */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {STAGES.filter((s) => s.key !== (prospect.status ?? 'new')).slice(0, 4).map((s) => (
            <button key={s.key} onClick={() => handleStatusChange(s.key)} className="inline-flex items-center gap-1 rounded-full border border-stone-200 dark:border-stone-700 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label}
            </button>
          ))}
        </div>

        {/* Activities */}
        <div className="border-t border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Activités</h3>
            <button onClick={onAddActivity} className="inline-flex items-center gap-1 rounded-lg bg-lime-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-lime-700">
              <Plus className="h-3 w-3" /> Ajouter
            </button>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-stone-400">Aucune activité enregistrée.</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => {
                const TypeIcon = ACTIVITY_TYPES.find((t) => t.value === a.type)?.icon ?? FileText
                return (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg bg-stone-50 dark:bg-stone-800/50 p-3">
                    <div className="mt-0.5 rounded-full bg-stone-200 dark:bg-stone-700 p-1.5">
                      <TypeIcon className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{ACTIVITY_TYPES.find((t) => t.value === a.type)?.label}</span>
                        {a.outcome && <span className="text-xs text-stone-500 dark:text-stone-400">· {OUTCOME_LABELS[a.outcome]}</span>}
                      </div>
                      {a.subject && <p className="text-xs text-stone-600 dark:text-stone-400">{a.subject}</p>}
                      {a.notes && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{a.notes}</p>}
                    </div>
                    <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr') : ''}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {editMode && (
        <ProspectForm prospect={prospect} onClose={() => setEditMode(false)} onSaved={() => { setEditMode(false); onRefresh(); onClose() }} />
      )}
    </div>
  )
}

function ActivityForm({ prospectId, onClose, onSaved }: { prospectId: number; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    type: 'call',
    direction: 'outbound',
    subject: '',
    notes: '',
    outcome: 'neutral',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await createProspectActivity({ data: { ...form, prospectId, completedAt: new Date() } })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Nouvelle activité</h2>
          <button onClick={onClose} className="rounded p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} options={ACTIVITY_TYPES.map((t) => ({ value: t.value, label: t.label }))} onChange={(v) => setForm({ ...form, type: v })} />
            <Select label="Direction" value={form.direction} options={[{ value: 'outbound', label: 'Sortant' }, { value: 'inbound', label: 'Entrant' }]} onChange={(v) => setForm({ ...form, direction: v })} />
          </div>
          <Input label="Sujet" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
          <Textarea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <Select label="Résultat" value={form.outcome} options={Object.entries(OUTCOME_LABELS).map(([value, label]) => ({ value, label }))} onChange={(v) => setForm({ ...form, outcome: v })} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800">Annuler</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-lime-600 px-4 py-2 text-sm font-medium text-white hover:bg-lime-700 disabled:opacity-50">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full rounded-lg border border-stone-200 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500" />
    </div>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-stone-200 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-lg border border-stone-200 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500" />
    </div>
  )
}