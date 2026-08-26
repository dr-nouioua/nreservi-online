import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { getSiteContent, saveSiteContent } from '../../server/admin.functions'

export const Route = createFileRoute('/3991/_authed/landing')({
  beforeLoad: ({ context }) => {
    const { session } = context as { session: { adminRole: 'super' | 'admin' } }
    if (session.adminRole !== 'super') throw redirect({ to: '/3991' })
  },
  loader: () => getSiteContent(),
  component: LandingEditorPage,
})

type PackageRow = { name: string; price: string; period?: string; features: string[]; kind: string; popular?: boolean }
type Content = {
  about: string
  contactEmail: string
  contactPhone: string
  homeHeroImageUrl: string | null
  packages: PackageRow[]
}

function LandingEditorPage() {
  const initial = Route.useLoaderData() as Content
  const [about, setAbout] = useState(initial.about)
  const [contactEmail, setContactEmail] = useState(initial.contactEmail)
  const [contactPhone, setContactPhone] = useState(initial.contactPhone)
  const [heroImage, setHeroImage] = useState(initial.homeHeroImageUrl ?? '')
  const [packages, setPackages] = useState<PackageRow[]>(
    (initial.packages as PackageRow[]).map((p) => ({ ...p, features: p.features ?? [] })),
  )
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function updatePackage(i: number, patch: Partial<PackageRow>) {
    setPackages(packages.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await saveSiteContent({
      data: { about, contactEmail, contactPhone, homeHeroImageUrl: heroImage || null, packages },
    })
    setSaving(false)
    if ('error' in result && result.error) {
      setMessage(result.error)
      return
    }
    setMessage('Page de présentation mise à jour.')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Page de présentation</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Contenu public de <a href="/about" target="_blank" className="underline">/about</a> : à propos, coordonnées et tarifs.
        </p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* À propos */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-3 shadow-sm">
          <p className="font-semibold text-stone-900 dark:text-stone-100">À propos</p>
          <textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
        </div>

        {/* Contact */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-3 shadow-sm">
          <p className="font-semibold text-stone-900 dark:text-stone-100">Contact</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400">E-mail public</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@nreservi.online" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Téléphone public</label>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+213 555 00 00 00" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
            </div>
          </div>
        </div>

        {/* Image accueil */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-3 shadow-sm">
          <p className="font-semibold text-stone-900 dark:text-stone-100">Image de la page d'accueil client</p>
          <input
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            placeholder="https://… (image sous la carte de recherche)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
            🖼️ Importer une image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  const img = new Image()
                  img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const scale = Math.min(1, 1600 / img.width)
                    canvas.width = Math.round(img.width * scale)
                    canvas.height = Math.round(img.height * scale)
                    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
                    setHeroImage(canvas.toDataURL('image/jpeg', 0.82))
                  }
                  img.src = String(reader.result)
                }
                reader.readAsDataURL(file)
              }}
            />
          </label>
          {heroImage && <img src={heroImage} alt="" className="h-32 rounded-lg object-cover" />}
        </div>

        {/* Formules */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-4 shadow-sm">
          <p className="font-semibold text-stone-900 dark:text-stone-100">Formules & publicité</p>
          {packages.map((p, i) => (
            <div key={i} className="rounded-lg border border-stone-200 p-4 space-y-2.5 dark:border-stone-800">
              <div className="flex items-center justify-between gap-2">
                <input value={p.name} onChange={(e) => updatePackage(i, { name: e.target.value })} placeholder="Nom de la formule" className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                <button type="button" onClick={() => setPackages(packages.filter((_, idx) => idx !== i))} aria-label="Supprimer" className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={p.price} onChange={(e) => updatePackage(i, { price: e.target.value })} placeholder="Prix (ex. 2 500 DA)" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                <input value={p.period ?? ''} onChange={(e) => updatePackage(i, { period: e.target.value })} placeholder="Période (par mois)" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
              </div>
              <textarea
                rows={3}
                value={(p.features ?? []).join('\n')}
                onChange={(e) => updatePackage(i, { features: e.target.value.split('\n') })}
                placeholder="Caractéristiques (une par ligne)"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700"
              />
              <div className="flex flex-wrap items-center gap-4">
                <select value={p.kind} onChange={(e) => updatePackage(i, { kind: e.target.value })} className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700">
                  <option value="subscription">Abonnement restaurant</option>
                  <option value="ads">Publicité (marque)</option>
                </select>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                  <input type="checkbox" checked={Boolean(p.popular)} onChange={(e) => updatePackage(i, { popular: e.target.checked })} className="accent-lime-500" />
                  Mettre en avant
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPackages([...packages, { name: '', price: '', period: 'par mois', features: [], kind: 'subscription', popular: false }])}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" /> Ajouter une formule
          </button>
        </div>

        {message && (
          <p className={`text-sm ${message === 'Page de présentation mise à jour.' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{message}</p>
        )}
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
          <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
