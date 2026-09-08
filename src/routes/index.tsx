import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MapPin, Search, Scissors, SlidersHorizontal, Sparkles, Timer, UtensilsCrossed } from 'lucide-react'
import { listRestaurants } from '../server/booking.functions'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

export const Route = createFileRoute('/')({
  loader: async () => {
    const restaurants = await listRestaurants({ data: undefined })
    return { restaurants }
  },
  component: Home,
})

const CATEGORIES = [
  { key: '', label: 'Tout', icon: null },
  { key: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
  { key: 'beauty_salon', label: 'Salons de beauté', icon: Scissors },
  { key: 'spa', label: 'Spa & Bien-être', icon: Sparkles },
  { key: 'football_pitch', label: 'Terrains de foot', icon: Timer },
] as const

const CATEGORY_BADGES: Record<string, { label: string; color: string }> = {
  restaurant: { label: 'Restaurant', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  beauty_salon: { label: 'Salon', color: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300' },
  spa: { label: 'Spa', color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300' },
  football_pitch: { label: 'Terrain', color: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' },
  barbershop: { label: 'Barbier', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
}

const CATEGORY_ICONS: Record<string, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  beauty_salon: Scissors,
  spa: Sparkles,
  football_pitch: Timer,
  barbershop: Scissors,
}

function Home() {
  const { restaurants } = Route.useLoaderData() as { restaurants: any[] }
  const [q, setQ] = useState('')
  const [city, setCity] = useState('all')
  const [cuisine, setCuisine] = useState('all')
  const [category, setCategory] = useState('')

  const cities = Array.from(new Set(restaurants.map((r) => r.city)))

  const catFiltered = category ? restaurants.filter((r) => r.category === category) : restaurants

  const cuisines = Array.from(new Set(catFiltered.map((r) => r.cuisine)))

  const filtered = catFiltered.filter((r) => {
    const term = q.toLowerCase()
    const matchesTerm = !term || r.name.toLowerCase().includes(term) || r.cuisine.toLowerCase().includes(term) || r.city.toLowerCase().includes(term)
    const matchesCity = city === 'all' || r.city === city
    const matchesCuisine = cuisine === 'all' || r.cuisine === cuisine
    return matchesTerm && matchesCity && matchesCuisine
  })

  const categoryCounts = {
    '': restaurants.length,
    restaurant: restaurants.filter((r) => r.category === 'restaurant').length,
    beauty_salon: restaurants.filter((r) => r.category === 'beauty_salon').length,
    spa: restaurants.filter((r) => r.category === 'spa').length,
    football_pitch: restaurants.filter((r) => r.category === 'football_pitch').length,
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="overflow-hidden rounded-lg bg-stone-950 text-white dark:ring-1 dark:ring-stone-700">
          <div className="min-h-[280px] flex flex-col justify-center">
            <div className="p-7 sm:p-10 flex flex-col justify-center">
              <p className="text-sm font-medium text-lime-300">Réservations en temps réel</p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
                Réservez votre place en quelques secondes
              </h1>
              <p className="text-stone-300 mt-4 max-w-xl">
                nreservi.online réunit restaurants, salons de beauté et spas près de chez vous :
                consultez les disponibilités en direct et recevez votre confirmation par WhatsApp.
              </p>
              <div className="mt-6 grid gap-3 rounded-lg bg-white dark:bg-stone-900 p-2 text-stone-900 dark:text-stone-100 shadow-xl sm:grid-cols-[1fr_auto_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom, une catégorie ou une ville" className="w-full rounded-md border border-stone-200 dark:border-stone-800 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500" />
                </div>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-md border border-stone-200 dark:border-stone-800 px-3 py-2.5 text-sm">
                  <option value="all">Toutes les villes</option>
                  {cities.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="rounded-md border border-stone-200 dark:border-stone-800 px-3 py-2.5 text-sm">
                  <option value="all">{category === 'beauty_salon' ? 'Toutes les prestations' : category === 'spa' ? 'Toutes les prestations' : category === 'football_pitch' ? 'Tous les formats' : 'Toutes les catégories'}</option>
                  {cuisines.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.key as keyof typeof categoryCounts] ?? 0
            return (
              <button
                key={cat.key}
                onClick={() => { setCategory(cat.key); setCuisine('all') }}
                className={`flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-medium transition border ${
                  category === cat.key
                    ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-700 dark:hover:bg-stone-800'
                }`}
              >
                {cat.icon && <cat.icon className="h-3.5 w-3.5" />}
                {cat.label}
                <span className={`ml-0.5 text-xs ${category === cat.key ? 'opacity-70' : 'text-stone-400 dark:text-stone-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-stone-400">{filtered.length} établissement{filtered.length === 1 ? '' : 's'} disponible{filtered.length === 1 ? '' : 's'}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-400"><SlidersHorizontal className="h-3.5 w-3.5" /> Filtres intelligents</span>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => {
          const badge = CATEGORY_BADGES[r.category] ?? CATEGORY_BADGES.restaurant
          const CatIcon = CATEGORY_ICONS[r.category] ?? UtensilsCrossed
          return (
            <Link key={r.id} to="/restaurants/$slug" params={{ slug: r.slug }}
              className="group overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative h-44 bg-stone-100 dark:bg-stone-800">
                {r.coverImageUrl ? (
                  <img src={r.coverImageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#fecaca,#fde68a,#bbf7d0)]">
                    <CatIcon className="h-10 w-10 text-stone-700 dark:text-stone-300/60" />
                  </div>
                )}
                <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}>
                  <CatIcon className="h-3 w-3" /> {badge.label}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-lime-700 dark:group-hover:text-lime-300">{r.name}</h3>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{r.cuisine}</p>
                <p className="text-sm text-stone-400 dark:text-stone-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {r.city}
                </p>
              </div>
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-stone-500 dark:text-stone-400 col-span-full text-center py-12">Aucun établissement ne correspond à votre recherche.</p>
        )}
      </section>
      <SiteFooter />
    </div>
  )
}
