import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MessageCircle, Plus, RefreshCw, Users } from 'lucide-react'
import {
  getOwnerOverview,
  listReservationsForDate,
  updateReservationStatus,
  updateReservationNotes,
  createWalkIn,
} from '../../server/owner.functions'
import { getWhatsappSettings } from '../../server/whatsapp.functions'
import { WhatsappComposer, type ComposerReservation } from '../../components/WhatsappComposer'

export const Route = createFileRoute('/owner/_authed/')({
  loader: async () => {
    const [overview, reservations, whatsapp] = await Promise.all([
      getOwnerOverview(),
      listReservationsForDate({ data: { date: new Date().toISOString().slice(0, 10) } }),
      getWhatsappSettings(),
    ])
    const today = new Date().toISOString().slice(0, 10)
    return { overview, reservations, today, whatsapp }
  },
  component: OwnerReservationsBoard,
})

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
  confirmed: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300',
  seated: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  completed: 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400',
  no_show: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400',
  cancelled: 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500',
}

const STATUS_OPTIONS = ['confirmed', 'seated', 'completed', 'no_show', 'cancelled']

/** French labels shown everywhere on the board (filters, cards, table). */
const STATUS_LABELS_FR: Record<string, string> = {
  confirmed: 'Confirmée',
  seated: 'Installée',
  completed: 'Terminée',
  no_show: 'No-show',
  cancelled: 'Annulée',
  pending: 'En attente', // legacy rows only
}

function OwnerReservationsBoard() {
  const { overview, today, whatsapp } = Route.useLoaderData()
  const [date, setDate] = useState(today)
  const [reservations, setReservations] = useState<any[]>(Route.useLoaderData().reservations)
  const [areaFilter, setAreaFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all')
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [composing, setComposing] = useState<ComposerReservation | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const whatsappReady = Boolean(whatsapp.whatsappNumber)

  async function refresh(d = date) {
    const rows = await listReservationsForDate({ data: { date: d } })
    setReservations(rows)
  }

  useEffect(() => {
    const interval = setInterval(() => refresh(), 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  async function setStatus(id: number, status: string) {
    await updateReservationStatus({ data: { id, status } })
    refresh()
  }

  async function setNotes(id: number, notes: string) {
    await updateReservationNotes({ data: { id, notes } })
  }

  const tablesById = new Map(overview.tables.map((t: any) => [t.id, t]))
  const filtered = reservations.filter((r) => {
    if (areaFilter !== 'all' && r.areaId !== areaFilter) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    return true
  })

  const statusSelect = (r: any) => (
    <select
      value={r.status}
      onChange={(e) => setStatus(r.id, e.target.value)}
      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${STATUS_COLORS[r.status]}`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS_FR[s]}</option>
      ))}
    </select>
  )

  const whatsappButton = (r: any) =>
    whatsappReady && (
      <button
        type="button"
        onClick={() => setComposing(r as ComposerReservation)}
        title="Préparer un message WhatsApp — vous appuierez sur Envoyer vous-même"
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </button>
    )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">{overview.restaurant?.name}</h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Plateau des réservations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              refresh(e.target.value)
            }}
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
          />
          <button onClick={() => refresh()} className="p-2 rounded-lg border border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800" aria-label="Rafraîchir">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowWalkIn(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-950 text-white text-sm font-medium hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white dark:ring-1 dark:ring-stone-700"
          >
            <Plus className="w-4 h-4" /> Walk-in
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4 sm:mt-6 flex-wrap">
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-sm">
          <option value="all">Tous les espaces</option>
          {overview.areas.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-sm">
          <option value="all">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS_FR[s]}</option>
          ))}
        </select>
      </div>

      {!whatsappReady && (
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <MessageCircle className="h-4 w-4" />
          <span>Configurez votre numéro WhatsApp pour contacter vos clients directement.</span>
          <Link to="/owner/settings/whatsapp" className="font-medium underline">Paramètres → WhatsApp</Link>
        </div>
      )}

      {/* ================= Mobile / tablet: reservation cards ================= */}
      <div className="mt-5 grid gap-3 md:hidden">
        {filtered.map((r) => (
          <article key={r.id} className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-stone-900 dark:text-stone-100">{r.guestName}</p>
                <p className="text-xs text-stone-400">{r.guestPhone}</p>
              </div>
              {statusSelect(r)}
            </div>

            <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-stone-50 py-1.5 dark:bg-stone-800/60">
                <dt className="text-stone-400">Heure</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200">{r.time.slice(0, 5)}</dd>
              </div>
              <div className="rounded-lg bg-stone-50 py-1.5 dark:bg-stone-800/60">
                <dt className="text-stone-400">Personnes</dt>
                <dd className="font-semibold inline-flex items-center gap-1 text-stone-800 dark:text-stone-200">{r.partySize}<Users className="h-3 w-3 text-stone-400" /></dd>
              </div>
              <div className="rounded-lg bg-stone-50 py-1.5 dark:bg-stone-800/60">
                <dt className="text-stone-400">Table</dt>
                <dd className="font-semibold text-stone-800 dark:text-stone-200">{tablesById.get(r.tableId)?.label ?? '—'}</dd>
              </div>
            </dl>

            {r.specialRequests && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">📝 {r.specialRequests}</p>}

            <div className="mt-3 flex items-center justify-between gap-2">
              {whatsappButton(r)}
              <button
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                className="text-xs font-medium text-stone-500 underline underline-offset-2 dark:text-stone-400"
              >
                {expandedId === r.id ? 'Masquer les détails' : 'Voir les détails'}
              </button>
            </div>

            {expandedId === r.id && (
              <div className="mt-3 space-y-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                <label className="block text-xs font-medium text-stone-500 dark:text-stone-400">Notes internes</label>
                <input
                  defaultValue={r.notes}
                  onBlur={(e) => setNotes(r.id, e.target.value)}
                  placeholder="VIP, allergies..."
                  className="w-full px-2.5 py-1.5 rounded border border-stone-200 text-xs dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                />
                <p className="text-[11px] text-stone-400">Enregistré automatiquement en quittant le champ.</p>
              </div>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-400">Aucune réservation pour cette date.</p>
        )}
      </div>

      {/* ================= Desktop: table ================= */}
      <div className="mt-6 hidden md:block bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 dark:text-stone-400 text-left">
            <tr>
              <th className="px-4 py-3">Heure</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Pers.</th>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Notes</th>
              {whatsappReady && <th className="px-4 py-3">Contact</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{r.time.slice(0, 5)}</td>
                <td className="px-4 py-3">
                  {r.guestName}
                  <div className="text-xs text-stone-400">{r.guestPhone}</div>
                  {r.specialRequests && <div className="text-xs text-amber-600 dark:text-amber-400">{r.specialRequests}</div>}
                </td>
                <td className="px-4 py-3">{r.partySize}</td>
                <td className="px-4 py-3">{tablesById.get(r.tableId)?.label ?? '—'}</td>
                <td className="px-4 py-3">{statusSelect(r)}</td>
                <td className="px-4 py-3">
                  <input
                    defaultValue={r.notes}
                    onBlur={(e) => setNotes(r.id, e.target.value)}
                    placeholder="VIP, allergies..."
                    className="w-full px-2 py-1 rounded border border-stone-200 dark:border-stone-800 text-xs"
                  />
                </td>
                {whatsappReady && (
                  <td className="px-4 py-3">{whatsappButton(r)}</td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={whatsappReady ? 7 : 6} className="px-4 py-8 text-center text-stone-400">Aucune réservation pour cette date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 mt-10 mb-2">Plan de salle</h2>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
        {[['confirmed', 'bg-blue-500'], ['seated', 'bg-emerald-500'], ['completed', 'bg-stone-400'], ['no_show', 'bg-red-500']].map(([st, color]) => (
          <span key={st} className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {STATUS_LABELS_FR[st]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-stone-300 dark:border-stone-600" /> Libre
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {overview.areas.map((area: any) => (
          <div key={area.id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-3 sm:p-4">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3 truncate">{area.name}</p>
            <div className="grid grid-cols-3 gap-2">
              {overview.tables.filter((t: any) => t.areaId === area.id).map((t: any) => {
                const res = reservations.find((r) => r.tableId === t.id && ['seated', 'confirmed'].includes(r.status))
                const planColor: Record<string, string> = {
                  confirmed: 'bg-blue-500',
                  seated: 'bg-emerald-500',
                }
                const color = res ? planColor[res.status] ?? 'bg-stone-400' : 'bg-white border-2 border-dashed border-stone-300 text-stone-400 dark:bg-stone-900 dark:border-stone-600 dark:text-stone-500'
                return (
                  <div
                    key={t.id}
                    title={res ? `${res.guestName} — ${STATUS_LABELS_FR[res.status] ?? res.status}` : 'Libre'}
                    className={`aspect-square rounded-lg ${color} ${res ? 'text-white' : ''} text-xs flex flex-col items-center justify-center ${t.shape === 'round' ? 'rounded-full' : ''}`}
                  >
                    <span className="font-semibold">{t.label}</span>
                    <span>{t.capacity}p</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {showWalkIn && (
        <WalkInModal
          tables={overview.tables}
          reservations={reservations}
          date={date}
          onClose={() => setShowWalkIn(false)}
          onCreated={() => {
            setShowWalkIn(false)
            refresh()
          }}
        />
      )}

      {composing && whatsapp.whatsappNumber && (
        <WhatsappComposer
          reservation={composing}
          businessName={whatsapp.businessName || overview.restaurant?.name || ''}
          businessNumber={whatsapp.whatsappNumber}
          templates={whatsapp.templates}
          onClose={() => setComposing(null)}
        />
      )}
    </div>
  )
}

function WalkInModal({ tables, reservations, date, onClose, onCreated }: { tables: any[]; reservations: any[]; date: string; onClose: () => void; onCreated: () => void }) {
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [tableId, setTableId] = useState(tables[0]?.id)
  const [time, setTime] = useState(new Date().toISOString().slice(11, 16))
  const [error, setError] = useState<string | null>(null)

  // Tables already taken at the selected date/time — greyed out in the list.
  const occupiedIds = new Set(
    reservations
      .filter((r) => r.date === date && r.time.slice(0, 5) === time && ['confirmed', 'seated'].includes(r.status))
      .map((r) => r.tableId),
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (occupiedIds.has(tableId)) {
      setError('Cette table est déjà occupée à cette heure.')
      return
    }
    const result = await createWalkIn({ data: { guestName, guestPhone, partySize, date, time, tableId } })
    if ('error' in result && result.error) {
      setError(result.error)
      return
    }
    onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20 px-0 sm:px-4">
      <form onSubmit={submit} className="w-full sm:max-w-sm bg-white dark:bg-stone-900 rounded-t-2xl sm:rounded-xl p-5 sm:p-6 space-y-3 max-h-[92vh] overflow-y-auto">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">Nouvelle arrivée sans réservation</h3>
        <input required placeholder="Nom du client" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
        <input required placeholder="Téléphone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" min={1} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
        </div>
        <select value={tableId} onChange={(e) => setTableId(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-sm">
          {tables.map((t) => (
            <option key={t.id} value={t.id} disabled={occupiedIds.has(t.id)}>
              {t.label} ({t.capacity}p){occupiedIds.has(t.id) ? ' — occupée' : ''}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400">Annuler</button>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-900 dark:ring-1 dark:ring-stone-700 text-sm">Ajouter</button>
        </div>
      </form>
    </div>
  )
}
