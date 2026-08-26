import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Baby, CalendarDays, Car, CheckCircle2, ChevronDown, ImagePlus, MapPin, Sparkles, Users, UtensilsCrossed } from 'lucide-react'
import { getRestaurantBySlug, getAvailability, createReservation } from '../server/booking.functions'
import { formatPriceDA } from '../services/format'
import { type Ad } from '../components/AdCard'
import { AdsCarousel } from '../components/AdsCarousel'
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
      showMenuImages: boolean
      menuFixed: boolean
      babySeatAvailable: boolean
      eventTheme: string
      hasParking: boolean
      subscriptionTier: string
      facebookUrl: string | null
      instagramUrl: string | null
      tiktokUrl: string | null
      mapsUrl: string | null
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

  // Whole menu collapsed by default — long catalogs stay light to load & scan.
  const [menuOpen, setMenuOpen] = useState(restaurant.menuFixed)
  const [date, setDate] = useState(todayISO())
  const [partySize, setPartySize] = useState(2)
  const [babySeats, setBabySeats] = useState(0)
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
          babySeats,
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
            {confirmation.reservation.babySeats > 0 && <p><span className="text-stone-500 dark:text-stone-400">Chaises bébé :</span> {confirmation.reservation.babySeats}</p>}
            <p><span className="text-stone-500 dark:text-stone-400">Code de confirmation :</span> <span className="font-mono font-semibold">{confirmation.reservation.confirmationCode}</span></p>
          </div>
          <a href="/" className="inline-block mt-8 text-lime-700 dark:text-lime-300 hover:underline">Réserver ailleurs</a>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${restaurant.eventTheme ? `event-${restaurant.eventTheme}` : ""}`}>
      {restaurant.eventTheme && EVENT_THEMES[restaurant.eventTheme as keyof typeof EVENT_THEMES] && (
        <div
          className="px-4 py-2.5 text-center text-sm font-medium text-white"
          style={{ background: EVENT_THEMES[restaurant.eventTheme as keyof typeof EVENT_THEMES].gradient }}
        >
          {EVENT_THEMES[restaurant.eventTheme as keyof typeof EVENT_THEMES].banner}
        </div>
      )}
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
              <div className="min-w-0">
                <p className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> {restaurant.cuisine}</span>
                  {restaurant.hasParking && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur"><Car className="h-3.5 w-3.5" /> Parking sur place</span>
                  )}
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight break-words">{restaurant.name}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-stone-200">
                  {(() => {
                    const short = restaurant.address.length > 42 ? restaurant.address.slice(0, 42).trimEnd() + "…" : restaurant.address;
                    const inner = (
                      <>
                        <MapPin className="h-4 w-4 shrink-0" /> {short}
                      </>
                    );
                    return restaurant.mapsUrl ? (
                      <a
                        href={restaurant.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir l'itinéraire sur Google Maps"
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur transition hover:bg-lime-400 hover:text-stone-950"
                      >
                        {inner}
                        <span className="hidden items-center gap-1 text-xs font-medium sm:inline-flex">
                          · Itinéraire
                        </span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1">{inner}</span>
                    );
                  })()}
                  {restaurant.facebookUrl && (
                    <a href={restaurant.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-lime-400 hover:text-stone-950">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.3v3h2.4v7h2.8z"/></svg>
                    </a>
                  )}
                  {restaurant.tiktokUrl && (
                    <a href={restaurant.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-lime-400 hover:text-stone-950">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.77a5.76 5.76 0 0 0-.78-.05 5.66 5.66 0 1 0 5.66 5.66V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.22-1.48z"/></svg>
                    </a>
                  )}
                  {restaurant.instagramUrl && (
                    <a href={restaurant.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-lime-400 hover:text-stone-950">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.8.1-1.1.1-1.4.2-1.7.3-.4.2-.7.4-1 .7-.3.3-.5.6-.7 1-.1.3-.3.6-.3 1.7-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.4.3 1.7.2.4.4.7.7 1 .3.3.6.5 1 .7.3.1.6.3 1.7.3 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.4-.2 1.7-.3.4-.2.7-.4 1-.7.3-.3.5-.6.7-1 .1-.3.3-.6.3-1.7.1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.6-.3-1.7-.3-1.3-.1-1.7-.1-4.8-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z"/></svg>
                    </a>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 relative">
        <p className="text-stone-600 dark:text-stone-400 mt-6 max-w-2xl text-lg">{restaurant.description}</p>

        {ads.length > 0 && <AdsCarousel ads={ads.slice(0, 2)} className="mt-6 max-w-2xl" />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 pb-16">
          <div className="lg:col-span-2 space-y-6">
<div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                className="w-full flex items-center justify-between gap-3 text-left p-4 sm:p-5 bg-stone-50 dark:bg-stone-950/40"
              >
                <span className="flex items-center gap-3.5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-500/15">
                    <UtensilsCrossed className="h-7 w-7 text-lime-700 dark:text-lime-300" />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold text-stone-900 dark:text-stone-100">Menu</span>
                    <span className="block text-sm text-stone-500 dark:text-stone-400">Découvrez nos plats</span>
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-700 dark:text-stone-300">
                  {restaurant.menuFixed ? 'Menu' : menuOpen ? 'Masquer' : 'Voir le menu'}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              <div className={`grid transition-all duration-300 ease-out ${menuOpen ? 'mt-5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="space-y-6 p-4 sm:p-6">
                    {menu.map((cat) => (
                      <div key={cat.id}>
                        <h3 className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-lime-700 dark:text-lime-300">
                          {cat.name}
                          <span className="h-px flex-1 bg-stone-100 dark:bg-stone-800" aria-hidden="true" />
                        </h3>
                        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                          {cat.items.map((item) => (
                            <li key={item.id} className="overflow-hidden rounded-lg border border-stone-100 bg-stone-50 text-sm dark:border-stone-800 dark:bg-stone-950">
                              {restaurant.showMenuImages && (
                                <div className="h-28 bg-stone-100 dark:bg-stone-800">
                                  {item.photoUrl ? <img src={item.photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImagePlus className="h-7 w-7 text-stone-400" /></div>}
                                </div>
                              )}
                              <div className="flex justify-between gap-3 p-3">
                                <div className="min-w-0">
                                  <p className={item.available ? 'font-medium text-stone-800 dark:text-stone-200' : 'font-medium text-stone-400 dark:text-stone-500 line-through'}>{item.name}</p>
                                  <p className="text-stone-500 dark:text-stone-400">{item.description}</p>
                                </div>
                                <span className="shrink-0 font-semibold text-stone-900 dark:text-stone-100">{formatPriceDA(item.price)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          {restaurant.subscriptionTier === 'premium' && (
          <>
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
                  className="h-11 w-full mt-1 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 appearance-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
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
                    className="h-11 w-full mt-1 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 appearance-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
              {restaurant.babySeatAvailable && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <Baby className="h-3.5 w-3.5" /> Chaises bébé
                  </label>
                  <div className="w-full mt-1">
                    <select
                      value={babySeats}
                      onChange={(e) => setBabySeats(Number(e.target.value))}
                      className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n}>{n === 0 ? 'Aucune' : `${n} chaise${n > 1 ? 's' : ''} bébé`}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400">Espace (facultatif)</label>
                <select
                  value={areaId ?? ''}
                  onChange={(e) => setAreaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="h-11 w-full mt-1 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 appearance-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
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
                className="event-cta w-full py-2.5 rounded-lg bg-stone-900 text-white dark:ring-1 dark:ring-stone-700 text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
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
                          ? 'event-slot bg-lime-300 text-stone-950 dark:text-stone-50 border-lime-400 font-medium'
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
                      className="h-11 w-full mt-1 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 appearance-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400">Numéro WhatsApp</label>
                    <input
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+213 555 12 34 56"
                      className="h-11 w-full mt-1 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 appearance-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 dark:text-stone-400">Demandes particulières (facultatif)</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Anniversaire, allergies, chaise haute..."
                      className="h-11 w-full mt-1 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 appearance-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                      rows={2}
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="event-cta w-full py-2.5 rounded-lg bg-stone-950 text-white dark:ring-1 dark:ring-stone-700 text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
                  >
                    {submitting ? 'Réservation...' : `Confirmer pour le ${date} à ${selectedTime}`}
                  </button>
                </form>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
