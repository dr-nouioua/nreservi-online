import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  listAds,
  listAllRestaurants,
  createAd,
  updateAd,
  setAdActive,
  deleteAd,
} from '../../server/admin.functions'

export const Route = createFileRoute('/admin/_authed/ads')({
  loader: () => Promise.all([listAds(), listAllRestaurants()]),
  component: AdminAdsPage,
})

type Ad = Awaited<ReturnType<typeof listAds>>[number]

interface AdForm {
  title: string
  body: string
  imageUrl: string
  linkUrl: string
  ctaLabel: string
  sortOrder: number
  restaurantId: number | null
}

const EMPTY_FORM: AdForm = { title: '', body: '', imageUrl: '', linkUrl: '', ctaLabel: 'Découvrir', sortOrder: 0, restaurantId: null }

function adToForm(ad: Ad): AdForm {
  return {
    title: ad.title,
    body: ad.body ?? '',
    imageUrl: ad.imageUrl ?? '',
    linkUrl: ad.linkUrl ?? '',
    ctaLabel: ad.ctaLabel ?? 'Découvrir',
    sortOrder: ad.sortOrder,
    restaurantId: ad.restaurantId,
  }
}

function AdminAdsPage() {
  const [adsList, setAdsList] = useState(Route.useLoaderData()[0])
  const restaurants = Route.useLoaderData()[1]
  const [form, setForm] = useState<AdForm>(EMPTY_FORM)
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<AdForm>(EMPTY_FORM)
  const [editMessage, setEditMessage] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  async function refresh() {
    setAdsList(await listAds())
  }

  function errorMessage(result: unknown): string | null {
    if (result && typeof result === 'object' && 'error' in result && (result as any).error) {
      return (result as any).error as string
    }
    return null
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const result = await createAd({ data: form })
    const error = errorMessage(result)
    if (error) {
      setFormMessage(error)
      return
    }
    setForm(EMPTY_FORM)
    setFormMessage('Publicité créée.')
    refresh()
  }

  function startEdit(ad: Ad) {
    setEditingId(ad.id)
    setEditForm(adToForm(ad))
    setEditMessage(null)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId == null) return
    const result = await updateAd({ data: { id: editingId, ...editForm } })
    const error = errorMessage(result)
    if (error) {
      setEditMessage(error)
      return
    }
    setEditingId(null)
    refresh()
  }

  async function toggleActive(ad: Ad) {
    await setAdActive({ data: { id: ad.id, active: !ad.active } })
    refresh()
  }

  async function remove(ad: Ad) {
    if (!window.confirm(`Supprimer définitivement « ${ad.title} » ?`)) return
    await deleteAd({ data: { id: ad.id } })
    if (editingId === ad.id) setEditingId(null)
    refresh()
  }

  const visible = adsList.filter((ad) =>
    filter === 'all' ? true : filter === 'active' ? ad.active : !ad.active,
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Publicités intégrées</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Cartes « Annonce » affichées dynamiquement dans les pages des restaurants.
        </p>
      </div>

      {/* ---- Create ---- */}
      <form onSubmit={create} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><Plus className="h-4 w-4" /> Nouvelle publicité</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre *" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <select
            value={form.restaurantId ?? ''}
            onChange={(e) => setForm({ ...form, restaurantId: e.target.value ? Number(e.target.value) : null })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700"
          >
            <option value="">Tous les restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL de l'image (facultatif)" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="Lien https://… (facultatif)" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Texte de la publicité" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm sm:col-span-2 dark:border-stone-700" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="Libellé du bouton" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} placeholder="Ordre" title="Ordre d'affichage (les plus petits d'abord)" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          </div>
        </div>
        {formMessage && (
          <p className={`text-sm ${formMessage === 'Publicité créée.' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formMessage}</p>
        )}
        <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Créer</button>
      </form>

      {/* ---- Filters ---- */}
      <div className="flex gap-2">
        {(['all', 'active', 'inactive'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              filter === value
                ? 'border-lime-500 bg-lime-500/10 text-lime-700 dark:text-lime-300'
                : 'border-stone-200 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800'
            }`}
          >
            {value === 'all' ? 'Toutes' : value === 'active' ? 'Actives' : 'Désactivées'}
          </button>
        ))}
      </div>

      {/* ---- List ---- */}
      <div className="space-y-3">
        {visible.map((ad) => (
          <div key={ad.id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex items-start gap-3">
                {ad.imageUrl && <img src={ad.imageUrl} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />}
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-stone-900 dark:text-stone-100 truncate">
                    {ad.title}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${ad.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'}`}>
                      {ad.active ? 'Active' : 'Masquée'}
                    </span>
                  </p>
                  <p className="truncate text-sm text-stone-500 dark:text-stone-400">{ad.body || '—'}</p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {ad.restaurantId ? restaurants.find((r) => r.id === ad.restaurantId)?.name ?? 'Restaurant inconnu' : 'Tous les restaurants'}
                    {' · ordre '}
                    {ad.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-600 dark:text-stone-400" title={ad.active ? 'Masquer la publicité' : 'Afficher la publicité'}>
                  <input type="checkbox" checked={ad.active} onChange={() => toggleActive(ad)} className="peer sr-only" />
                  <span className="relative h-5 w-9 rounded-full bg-stone-300 transition peer-checked:bg-lime-500 dark:bg-stone-700">
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${ad.active ? 'left-[18px]' : 'left-0.5'}`} />
                  </span>
                  {ad.active ? 'Visible' : 'Cachée'}
                </label>
                <button onClick={() => startEdit(ad)} aria-label="Modifier" className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(ad)} aria-label="Supprimer" className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {editingId === ad.id && (
              <form onSubmit={saveEdit} className="mt-4 space-y-3 rounded-lg border border-lime-200 bg-lime-50/60 p-4 dark:border-lime-500/20 dark:bg-lime-500/5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Titre" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                  <select
                    value={editForm.restaurantId ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, restaurantId: e.target.value ? Number(e.target.value) : null })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700"
                  >
                    <option value="">Tous les restaurants</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <input value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} placeholder="URL de l'image" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                  <input value={editForm.linkUrl} onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })} placeholder="Lien https://…" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                  <input value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} placeholder="Texte" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={editForm.ctaLabel} onChange={(e) => setEditForm({ ...editForm, ctaLabel: e.target.value })} placeholder="Libellé bouton" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                    <input type="number" value={editForm.sortOrder} onChange={(e) => setEditForm({ ...editForm, sortOrder: Number(e.target.value) })} title="Ordre d'affichage" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
                  </div>
                </div>
                {editMessage && <p className="text-sm text-red-600 dark:text-red-400">{editMessage}</p>}
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-stone-950 text-white text-sm font-medium hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Enregistrer</button>
                  <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"><X className="h-3.5 w-3.5" /> Annuler</button>
                </div>
              </form>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <p className="flex items-center gap-2 py-10 text-center text-sm text-stone-500 dark:text-stone-400 justify-center">
            <Megaphone className="h-4 w-4" /> Aucune publicité {filter === 'all' ? '' : filter === 'active' ? 'active' : 'désactivée'} pour l'instant.
          </p>
        )}
      </div>
    </div>
  )
}
