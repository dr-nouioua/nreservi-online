import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { CalendarClock, History, RefreshCw, Save } from 'lucide-react'
import {
  listSubscriptions,
  updateSubscriptionDates,
  renewSubscription,
  setSubscriptionTier,
} from '../../server/admin.functions'

export const Route = createFileRoute('/admin/_authed/subscriptions')({
  loader: () => listSubscriptions(),
  component: SubscriptionsPage,
})

type Sub = Awaited<ReturnType<typeof listSubscriptions>>[number]

const BADGES: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  expiring_soon: { label: 'Expire bientôt', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  expired: { label: 'Expiré', className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' },
  suspended: { label: 'Suspendu', className: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300' },
  pending: { label: 'En attente', className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function daysLabel(sub: Sub): string {
  if (sub.daysLeft == null) return 'Illimité'
  if (sub.daysLeft >= 0) return `${sub.daysLeft} j restants`
  return `expiré depuis ${Math.abs(sub.daysLeft)} j`
}

function SubscriptionsPage() {
  const initial = Route.useLoaderData()
  const [subs, setSubs] = useState(initial)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [renewMonths, setRenewMonths] = useState<Record<number, number>>({})

  async function refresh() {
    setSubs(await listSubscriptions())
  }

  function startEdit(sub: Sub) {
    setEditingId(sub.id)
    setEditStart(sub.start ?? '')
    setEditEnd(sub.end ?? '')
    setMessage(null)
  }

  async function saveDates(id: number) {
    const result = await updateSubscriptionDates({
      data: { id, start: editStart || null, end: editEnd || null },
    })
    if ('error' in result && result.error) {
      setMessage(result.error)
      return
    }
    setEditingId(null)
    setMessage('Période enregistrée.')
    refresh()
  }

  async function renew(id: number) {
    const months = renewMonths[id] ?? 12
    const result = await renewSubscription({ data: { id, months } })
    if ('error' in result && result.error) {
      setMessage(result.error)
      return
    }
    setMessage('Abonnement renouvelé.')
    refresh()
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Abonnements</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Un abonnement expiré suspend automatiquement l'accès professionnel du restaurant — sans supprimer ses données.
          Un restaurant redevient actif dès qu'une nouvelle période valide lui est attribuée.
        </p>
      </div>

      {message && (
        <p className="rounded-lg bg-lime-50 px-4 py-2 text-sm text-lime-800 dark:bg-lime-500/10 dark:text-lime-300">{message}</p>
      )}

      <div className="space-y-4">
        {subs.map((sub) => {
          const badge = BADGES[sub.status] ?? BADGES.active
          return (
            <div key={sub.id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
                    {sub.name}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{sub.city}</p>
                </div>
                <span className="text-sm font-medium text-stone-600 dark:text-stone-300 whitespace-nowrap">{daysLabel(sub)}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-stone-400">Début</label>
                  {editingId === sub.id ? (
                    <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                  ) : (
                    <p className="mt-1 text-sm text-stone-800 dark:text-stone-200">{formatDate(sub.start)}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-stone-400">Fin</label>
                  {editingId === sub.id ? (
                    <input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                  ) : (
                    <p className="mt-1 text-sm text-stone-800 dark:text-stone-200">{formatDate(sub.end)}</p>
                  )}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {editingId === sub.id ? (
                    <>
                      <button onClick={() => saveDates(sub.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-stone-950 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"><Save className="h-4 w-4" /> Enregistrer</button>
                      <button onClick={() => setEditingId(null)} className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">Annuler</button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(sub)} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"><CalendarClock className="h-4 w-4" /> Modifier les dates</button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                <label className="text-xs text-stone-500 dark:text-stone-400">Formule</label>
                <select
                  value={sub.tier}
                  onChange={async (e) => {
                    const result = await setSubscriptionTier({ data: { id: sub.id, tier: e.target.value } })
                    if ('error' in result && result.error) { setMessage(result.error); return }
                    setMessage('Formule mise à jour.')
                    refresh()
                  }}
                  className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-700"
                >
                  <option value="basic">Basique</option>
                  <option value="premium">Premium</option>
                </select>
                <RefreshCw className="ml-2 h-4 w-4 text-stone-400" />
                <select
                  value={renewMonths[sub.id] ?? 12}
                  onChange={(e) => setRenewMonths({ ...renewMonths, [sub.id]: Number(e.target.value) })}
                  className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-700"
                >
                  {[1, 3, 6, 12].map((m) => (
                    <option key={m} value={m}>{m} mois</option>
                  ))}
                </select>
                <button onClick={() => renew(sub.id)} className="rounded-lg bg-lime-400 px-3 py-1.5 text-sm font-medium text-stone-950 hover:bg-lime-300">
                  Renouveler
                </button>
                <span className="ml-auto text-xs text-stone-400">
                  {Array.isArray(sub.history) && sub.history.length > 0 ? `${sub.history.length} modification(s)` : ''}
                </span>
              </div>

              {Array.isArray(sub.history) && sub.history.length > 0 && (
                <details className="text-xs text-stone-500 dark:text-stone-400">
                  <summary className="flex cursor-pointer select-none items-center gap-1.5"><History className="h-3.5 w-3.5" /> Historique</summary>
                  <ul className="mt-2 space-y-1 pl-5">
                    {(sub.history as { start: string | null; end: string | null; tier: string; changedAt: string }[]).map((h, i) => (
                      <li key={i}>
                        {new Date(h.changedAt).toLocaleString('fr-FR')} — période {formatDate(h.start)} → {formatDate(h.end)} ({h.tier})
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
