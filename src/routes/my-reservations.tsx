import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { lookupReservations, cancelReservation, setWhatsappOptIn } from '../server/booking.functions'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

export const Route = createFileRoute('/my-reservations')({
  component: MyReservations,
})

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  seated: 'Installée',
  completed: 'Terminée',
  no_show: 'Non honorée',
  cancelled: 'Annulée',
}

function MyReservations() {
  const [phone, setPhone] = useState('')
  const [data, setData] = useState<Awaited<ReturnType<typeof lookupReservations>> | null>(null)
  const [loading, setLoading] = useState(false)

  async function search(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await lookupReservations({ data: { phone } })
      setData(result)
    } finally {
      setLoading(false)
    }
  }

  async function cancel(id: number) {
    await cancelReservation({ data: { id, phone } })
    const result = await lookupReservations({ data: { phone } })
    setData(result)
  }

  async function toggleOptIn(optIn: boolean) {
    await setWhatsappOptIn({ data: { phone, optIn } })
    if (data?.customer) setData({ ...data, customer: { ...data.customer, whatsappOptIn: optIn } })
  }

  const now = new Date().toISOString().slice(0, 10)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Mes réservations</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">Retrouvez vos réservations avec le numéro de téléphone utilisé lors de la réservation.</p>
        <form onSubmit={search} className="mt-6 flex gap-2">
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+213 555 12 34 56"
            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
          />
          <button className="px-4 py-2 rounded-lg bg-stone-900 text-white dark:ring-1 dark:ring-stone-700 text-sm font-medium">
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>

        {data && (
          <div className="mt-8 space-y-4">
            {data.customer && (
              <div className="flex items-center justify-between text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-4">
                <span className="text-stone-600 dark:text-stone-400">Notifications WhatsApp</span>
                <button
                  onClick={() => toggleOptIn(!data.customer!.whatsappOptIn)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    data.customer.whatsappOptIn ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {data.customer.whatsappOptIn ? 'Activées' : 'Désactivées'}
                </button>
              </div>
            )}

            {data.reservations.length === 0 && (
              <p className="text-stone-500 dark:text-stone-400 text-sm text-center py-8">Aucune réservation trouvée pour ce numéro.</p>
            )}

            {data.reservations.map(({ reservation, restaurant }) => (
              <div key={reservation.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{restaurant.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {reservation.date} à {reservation.time.slice(0, 5)} &middot; {reservation.partySize} personne{reservation.partySize === 1 ? '' : 's'}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      {STATUS_LABELS[reservation.status] ?? reservation.status.replace('_', ' ')}
                    </span>
                  </div>
                  {reservation.date >= now && reservation.status !== 'cancelled' && (
                    <button
                      onClick={() => cancel(reservation.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
