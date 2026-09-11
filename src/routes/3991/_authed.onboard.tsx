import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { onboardRestaurant } from '../../server/admin.functions'

export const Route = createFileRoute('/3991/_authed/onboard')({

  beforeLoad: ({ context }) => {
    const { session } = context as { session: { adminRole: 'super' | 'admin'; permissions: string[] } }
    if (session.adminRole !== 'super' && !(session.permissions ?? []).includes('onboard')) {
      throw redirect({ to: '/3991' })
    }
  },
  component: OnboardPage,
})

function OnboardPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'restaurant',
    city: '',
    cuisine: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerName: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const CATEGORIES = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'beauty_salon', label: 'Salon de beauté' },
    { value: 'spa', label: 'Spa & Bien-être' },
    { value: 'football_pitch', label: 'Terrain de foot' },
    { value: 'car_rental', label: 'Location de voitures' },
    { value: 'barbershop', label: 'Barbier' },
    { value: 'doctor', label: 'Médecin' },
  ]

  const CUISINE_HINTS: Record<string, string> = {
    restaurant: 'Ex: Italienne, Algérienne, Japonaise...',
    beauty_salon: 'Ex: Coiffure, Manucure, Soins du visage...',
    spa: 'Ex: Massage, Hammam, Gommage...',
    football_pitch: 'Ex: 5v5 Synthétique, 6v6, 7v7 Indoor...',
    car_rental: 'Ex: Berline, SUV, Utilitaire...',
    barbershop: 'Ex: Coupe homme, Barbe, Soin...',
    doctor: 'Ex: Cardiologue, Généraliste, Dentiste...',
  }

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value, ...(key === 'name' && !f.slug ? { slug: slugify(value) } : {}) }))
  }

  function slugify(v: string) {
    return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onboardRestaurant({ data: form })
      navigate({ to: '/3991' })
    } finally {
      setSubmitting(false)
    }
  }

  const fields: [keyof typeof form, string][] = [
    ['name', "Nom de l'établissement"],
    ['slug', "Identifiant d'URL (slug)"],
    ['city', "Ville"],
    ['cuisine', CUISINE_HINTS[form.category] || 'Type de prestation'],
    ['address', "Adresse"],
    ['contactEmail', "E-mail de contact"],
    ['contactPhone', "Téléphone de contact"],
    ['whatsappNumber', 'WhatsApp Business number'],
    ['ownerName', "Nom du propriétaire"],
    ['ownerEmail', "E-mail de connexion du propriétaire"],
    ['ownerPassword', "Mot de passe du propriétaire"],
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Créer un établissement</h1>
      <form onSubmit={submit} className="mt-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-3">
        <div>
          <label className="text-xs text-stone-500 dark:text-stone-400">Catégorie</label>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([key, label]) => (
          <div key={key} className="min-w-0">
            <label className="text-xs text-stone-500 dark:text-stone-400">{label}</label>
            <input
              required={key !== 'whatsappNumber'}
              type={key === 'ownerPassword' ? 'password' : 'text'}
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm"
            />
          </div>
        ))}
        </div>
        <button disabled={submitting} className="w-full py-2.5 rounded-lg bg-stone-900 text-white dark:ring-1 dark:ring-stone-700 text-sm font-medium disabled:opacity-50">
          {submitting ? 'Création...' : 'Créer l\'établissement + compte propriétaire'}
        </button>
      </form>
    </div>
  )
}
