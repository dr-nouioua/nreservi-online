import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { MessageCircle, Plus, RefreshCw } from 'lucide-react'
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
    const overview = await getOwnerOverview()
    const today = new Date().toISOString().slice(0, 10)
    const reservations = await listReservationsForDate({ data: { date: today } })
    const whatsapp = await getWhatsappSettings()
    return { overview, reservations, today, whatsapp }
  },
  component: OwnerReservationsBoard,
})

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  seated: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-stone-200 text-stone-600',
  no_show: 'bg-red-100 text-red-700',
  cancelled: 'bg-stone-100 text-stone-400',
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'seated', 'completed', 'no_show', 'cancelled']

function OwnerReservationsBoard() {
  const { overview, today, whatsapp } = Route.useLoaderData()
  const [date, setDate] = useState(today)
  const [reservations, setReservations] = useState<any[]>(Route.useLoaderData().reservations)
  const [areaFilter, setAreaFilter] = useState<number | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all')
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [composing, setComposing] = useState<ComposerReservation | null>(null)
  const whatsappReady = Boolean(whatsapp.whatsappNumber)

  async function refresh(d = date) {
    const rows = await listReservationsForDate({ data: { date: d } })
    setReservations(rows)
  }

  useEffect(() => {
    const interval = setInterval(() => refresh(), 15000)
    return () => clearInterval(interval)
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

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{overview.restaurant?.name}</h1>
          <p className="text-stone-500 text-sm">Live reservation board</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              refresh(e.target.value)
            }}
            className="px-3 py-2 rounded-lg border border-stone-300 text-sm"
          />
          <button onClick={() => refresh()} className="p-2 rounded-lg border border-stone-300 hover:bg-stone-100">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowWalkIn(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-stone-900 text-white text-sm"
          >
            <Plus className="w-4 h-4" /> Walk-in
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-6 flex-wrap">
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm">
          <option value="all">All areas</option>
          {overview.areas.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm">
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {!whatsappReady && (
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <MessageCircle className="h-4 w-4" />
          <span>Configurez votre numéro WhatsApp pour contacter vos clients directement.</span>
          <Link to="/owner/settings/whatsapp" className="font-medium underline">
            Paramètres → WhatsApp
          </Link>
        </div>
      )}

      <div className="mt-6 bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              {whatsappReady && <th className="px-4 py-3">Contact</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{r.time.slice(0, 5)}</td>
                <td className="px-4 py-3">
                  {r.guestName}
                  <div className="text-xs text-stone-400">{r.guestPhone}</div>
                  {r.specialRequests && <div className="text-xs text-amber-600">{r.specialRequests}</div>}
                </td>
                <td className="px-4 py-3">{r.partySize}</td>
                <td className="px-4 py-3">{tablesById.get(r.tableId)?.label ?? '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${STATUS_COLORS[r.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    defaultValue={r.notes}
                    onBlur={(e) => setNotes(r.id, e.target.value)}
                    placeholder="VIP, allergies..."
                    className="w-full px-2 py-1 rounded border border-stone-200 text-xs"
                  />
                </td>
                {whatsappReady && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setComposing(r as ComposerReservation)}
                      title="Préparer un message WhatsApp — vous appuierez sur Envoyer vous-même"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-emerald-800 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={whatsappReady ? 7 : 6} className="px-4 py-8 text-center text-stone-400">No reservations for this date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-stone-900 mt-10 mb-3">Floor plan</h2>
      <div className="grid grid-cols-3 gap-4">
        {overview.areas.map((area: any) => (
          <div key={area.id} className="bg-white rounded-xl border border-stone-200 p-4">
            <p className="text-sm font-medium text-stone-700 mb-3">{area.name}</p>
            <div className="grid grid-cols-3 gap-2">
              {overview.tables.filter((t: any) => t.areaId === area.id).map((t: any) => {
                const res = reservations.find((r) => r.tableId === t.id && ['seated', 'confirmed', 'pending'].includes(r.status))
                const color = res?.status === 'seated' ? 'bg-emerald-500' : res ? 'bg-amber-400' : 'bg-stone-200'
                return (
                  <div
                    key={t.id}
                    title={res ? `${res.guestName} (${res.status})` : 'Available'}
                    className={`aspect-square rounded-lg ${color} text-white text-xs flex flex-col items-center justify-center ${t.shape === 'round' ? 'rounded-full' : ''}`}
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

function WalkInModal({ tables, date, onClose, onCreated }: { tables: any[]; date: string; onClose: () => void; onCreated: () => void }) {
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [tableId, setTableId] = useState(tables[0]?.id)
  const [time, setTime] = useState(new Date().toISOString().slice(11, 16))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await createWalkIn({ data: { guestName, guestPhone, partySize, date, time, tableId } })
    onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-20 px-4">
      <form onSubmit={submit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3">
        <h3 className="font-semibold text-stone-900">Add walk-in / phone booking</h3>
        <input required placeholder="Guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
        <input required placeholder="Phone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <input type="number" min={1} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-stone-300 text-sm" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-300 text-sm" />
        </div>
        <select value={tableId} onChange={(e) => setTableId(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm">
          {tables.map((t) => (
            <option key={t.id} value={t.id}>{t.label} ({t.capacity}p)</option>
          ))}
        </select>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-stone-500">Cancel</button>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-sm">Add</button>
        </div>
      </form>
    </div>
  )
}
