import { createFileRoute } from '@tanstack/react-router'
import { Fragment, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock, ImagePlus, MapPin, Sparkles, Star, Users } from 'lucide-react'
import { getRestaurantBySlug, getAvailability, createReservation } from '../server/booking.functions'
import { formatPriceDA } from '../services/format'
import { AdCard, type Ad } from '../components/AdCard'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

export const Route = createFileRoute('/restaurants/$slug')({
  loader: async ({ params }) => {
    const data = await getRestaurantBySlug({ data: { slug: params.slug } })
    if (!data) throw new Error('Restaurant not found')
    return data
  },
  component: RestaurantPage,
})

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function RestaurantPage() {
  // Loader typing flows through the generated route tree, which this
  // TanStack Start beta leaves as `{}` — annotate explicitly here.
  const { restaurant, areas, menu, ads = [] } = Route.useLoaderData() as {
    restaurant: {
      id: number
      slug: string
      name: string
      description: string | null
      coverImageUrl: string | null
      logoUrl: string | null
      cuisine: string
      address: string
      rating: string | null
      showMenuImages: boolean
    }
    areas: { id: number; name: string }[]
    tables: unknown[]
    menu: {
      id: number
      name: string
      items: { id: number; name: string; description: string | null; price: string; photoUrl: string | null; available: boolean }[]
    }[]
    ads: Ad[]
  }
  const [date, setDate] = useState(todayISO())
  const [partySize, setPartySize] = useState(2)
  const [areaId, setAreaId] = useState<number | undefined>(undefined)
  const [slots, setSlots] = useState<{ time: string; available: boolean; tableCount: number }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [confirmation, setConfirmation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function checkAvailability() {
    setLoadingSlots(true)
    setSelectedTime(null)
    setError(null)
    try {
      const result = await getAvailability({ data: { restaurantId: restaurant.id, date, partySize } })
      setSlots(result)
    } finally {
      setLoadingSlots(false)
    }
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTime) return
    setSubmitting(true)
    setError(null)
    try {
      const result = (await createReservation({
        data: {
          restaurantId: restaurant.id,
          guestName,
          guestPhone,
          partySize,
          date,
          time: selectedTime,
          areaId,
          specialRequests,
        },
      })) as
        | { error: string }
        | { reservation: Record<string, unknown>; restaurant: Record<string, unknown> }
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setConfirmation(result)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 w-full max-w-lg mx-auto px-4 py-20 text-center">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Réservation confirmée</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-2">
            Une confirmation WhatsApp a été envoyée au {confirmation.reservation.guestPhone}.
          </p>
          <div className="mt-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 text-left space-y-2">
            <p><span className="text-stone-500 dark:text-stone-400">Établissement :</span> {confirmation.restaurant.name}</p>
            <p><span className="text-stone-500 dark:text-stone-400">Date :</span> {confirmation.reservation.date}</p>
            <p><span className="text-stone-500 dark:text-stone-400">Heure :</span> {confirmation.reservation.time.slice(0, 5)}</p>
            <p><span className="text-stone-500 dark:text-stone-400">Nombre de personnes :</span> {confirmation.reservation.partySize}</p>
            <p><span className="text-stone-500 dark:text-stone-400">Code de confirmation :</span> <span className="font-mono font-semibold">{confirmation.reservation.confirmationCode}</span></p>
          </div>
          <a href="/" className="inline-block mt-8 text-lime-700 dark:text-lime-300 hover:underline">Réserver ailleurs</a>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="relative h-[360px] bg-stone-900">
        {restaurant.coverImageUrl ? (
          <img src={restaurant.coverImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80" alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-8 sm:px-6">
          <div className="flex items-end justify-between gap-4 flex-wrap text-white">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-lg border-4 border-white bg-white dark:bg-stone-900 shadow-lg">
                {restaurant.logoUrl ? <img src={restaurant.logoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-2xl font-bold text-stone-700 dark:text-stone-300">{restaurant.name.slice(0, 1)}</div>}
              </div>
              <div>
                <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> {restaurant.cuisine}</p>
                <h1 className="text-4xl font-bold tracking-tight">{restaurant.name}</h1>
                <p className="mt-2 flex items-center gap-1 text-stone-200"><MapPin className="h-4 w-4" /> {restaurant.address}</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-white dark:bg-stone-900 px-3 py-1.5 font-medium text-stone-900 dark:text-stone-100">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {restaurant.rating}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 relative">
        <p className="text-stone-600 dark:text-stone-400 mt-6 max-w-2xl text-lg">{restaurant.description}</p>

        {ads[0] && <AdCard ad={ads[0]} className="mt-6 max-w-2xl" />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Menu</h2>
              <div className="space-y-5">
                {/* Inline ad slots: one card after every second menu category. */}
                {menu.map((cat, catIndex) => (
                  <Fragment key={cat.id}>
                  <div>
                    <h3 className="text-sm font-semibold text-lime-700 dark:text-lime-300 uppercase tracking-wide">{cat.name}</h3>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {cat.items.map((item) => (
                        <li key={item.id} className="overflow-hidden rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-sm">
                          {restaurant.showMenuImages && (
                            <div className="h-28 bg-stone-100 dark:bg-stone-800">
                              {item.photoUrl ? <img src={item.photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImagePlus className="h-7 w-7 text-stone-400" /></div>}
                            </div>
                          )}
                          <div className="flex justify-between gap-3 p-3">
                            <div>
                              <p className={item.available ? 'font-medium text-stone-800 dark:text-stone-200' : 'font-medium text-stone-400 dark:text-stone-500 line-through'}>{item.name}</p>
                              <p className="text-stone-500 dark:text-stone-400">{item.description}</p>
                            </div>
                            <span className="shrink-0 font-semibold text-stone-900 dark:text-stone-100">{formatPriceDA(item.price)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {catIndex % 2 === 1 && ads[Math.floor(catIndex / 2) + 1] && (
                    <AdCard ad={ads[Math.floor(catIndex / 2) + 1]} className="mt-5" />
                  )}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Espaces
              </h2>
              <div className="flex gap-2 flex-wrap">
                {areas.map((a) => (
                  <span key={a.id} className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm">{a.name}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 h-fit sticky top-20 shadow-xl">
            <h2 className="font-semibold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Réserver</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400">Date</label>
                <input
                  type="date"
                  value={date}
                  min={todayISO()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400">Nombre de personnes</label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-stone-400" />
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400">Espace (facultatif)</label>
                <select
                  value={areaId ?? ''}
                  onChange={(e) => setAreaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
                >
                  <option value="">Tous les espaces</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={checkAvailability}
                disabled={loadingSlots}
                className="w-full py-2.5 rounded-lg bg-stone-900 text-white dark:ring-1 dark:ring-stone-700 text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
              >
                {loadingSlots ? 'Recherche...' : 'Voir les disponibilités'}
              </button>

              {slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setSelectedTime(s.time)}
                    className={`py-2 rounded-lg text-sm border transition ${
                        selectedTime === s.time
                          ? 'bg-lime-300 text-stone-950 dark:text-stone-50 border-lime-400 font-medium'
                          : s.available
                          ? 'border-stone-300 dark:border-stone-700 hover:border-lime-500 hover:bg-lime-50 dark:hover:bg-lime-500/10 text-stone-700 dark:text-stone-300'
                          : 'border-stone-100 dark:border-stone-800 text-stone-300 cursor-not-allowed'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}

              {selectedTime && (
                <form onSubmit={submitBooking} className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3 mt-2">
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400">Votre nom</label>
                    <input
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400">Numéro WhatsApp</label>
                    <input
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+213 555 12 34 56"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400">Demandes particulières (facultatif)</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Anniversaire, allergies, chaise haute..."
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
                      rows={2}
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-lg bg-stone-950 text-white dark:ring-1 dark:ring-stone-700 text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
                  >
                    {submitting ? 'Réservation...' : `Confirmer pour le ${date} à ${selectedTime}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
