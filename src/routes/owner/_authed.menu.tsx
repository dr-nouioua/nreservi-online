import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ImagePlus, Images, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import {
  getMenu,
  addMenuCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  deleteMenuCategory,
  toggleMenuItemAvailability,
  setShowMenuImages,
} from '../../server/owner.functions'
import { formatPriceDA } from '../../services/format'

export const Route = createFileRoute('/owner/_authed/menu')({
  loader: () => getMenu(),
  component: MenuPage,
})

type Category = Awaited<ReturnType<typeof getMenu>>['categories'][number]

interface ItemForm {
  categoryId: number | null
  name: string
  description: string
  price: string
  photoUrl: string
}

const EMPTY_ITEM: ItemForm = { categoryId: null, name: '', description: '', price: '', photoUrl: '' }

function MenuPage() {
  const initial = Route.useLoaderData()
  const [showImages, setShowImages] = useState(initial.showMenuImages)
  const [categories, setCategories] = useState(initial.categories)
  const [newCatName, setNewCatName] = useState('')
  const [newItem, setNewItem] = useState<ItemForm>({ ...EMPTY_ITEM, categoryId: initial.categories[0]?.id ?? null })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<ItemForm>(EMPTY_ITEM)

  async function refresh() {
    const data = await getMenu()
    setShowImages(data.showMenuImages)
    setCategories(data.categories)
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    await addMenuCategory({ data: { name: newCatName.trim() } })
    setNewCatName('')
    refresh()
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItem.categoryId || !newItem.name.trim()) return
    await addMenuItem({ data: { categoryId: newItem.categoryId, name: newItem.name.trim(), description: newItem.description.trim(), price: newItem.price.trim(), photoUrl: newItem.photoUrl } })
    setNewItem((item) => ({ ...item, name: '', description: '', price: '', photoUrl: '' }))
    refresh()
  }

  function startEdit(item: Category['items'][number]) {
    setEditingId(item.id)
    setEditForm({ categoryId: item.categoryId, name: item.name, description: item.description ?? '', price: item.price, photoUrl: item.photoUrl ?? '' })
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId == null) return
    await updateMenuItem({
      data: {
        id: editingId,
        categoryId: editForm.categoryId ?? undefined,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        price: editForm.price.trim(),
        photoUrl: editForm.photoUrl || null,
      },
    })
    setEditingId(null)
    refresh()
  }

  async function removeItem(id: number, name: string) {
    if (!window.confirm(`Supprimer « ${name} » du menu ?`)) return
    await deleteMenuItem({ data: { id } })
    if (editingId === id) setEditingId(null)
    refresh()
  }

  async function removeCategory(id: number, name: string, itemCount: number) {
    const suffix = itemCount > 0 ? ` Cette catégorie contient ${itemCount} plat(s), qui seront également supprimés.` : ''
    if (!window.confirm(`Supprimer la catégorie « ${name} » ?${suffix}`)) return
    await deleteMenuCategory({ data: { id } })
    refresh()
  }

  async function toggleAvailability(id: number, available: boolean) {
    await toggleMenuItemAvailability({ data: { id, available } })
    refresh()
  }

  async function toggleImages() {
    const next = !showImages
    setShowImages(next)
    await setShowMenuImages({ data: { enabled: next } })
  }

  async function readPhoto(file: File | undefined, setter: (url: string) => void) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Catalogue</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight dark:text-stone-50">Gestion du menu</h1>
        </div>
        <ImageToggle enabled={showImages} onToggle={toggleImages} />
      </div>

      <div className="grid gap-5 mt-6 lg:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-lg border border-stone-200 p-4 shadow-sm dark:bg-stone-900 dark:border-stone-800">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-stone-900 dark:text-stone-100">{cat.name}</p>
              <button
                onClick={() => removeCategory(cat.id, cat.name, cat.items.length)}
                aria-label={`Supprimer la catégorie ${cat.name}`}
                title="Supprimer la catégorie"
                className="rounded-md p-1.5 text-stone-400 transition hover:bg-red-50 dark:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-3 space-y-3">
              {cat.items.map((item) => (
                <li key={item.id} className="rounded-lg border border-stone-100 p-2 text-sm dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-md bg-stone-100 shrink-0 dark:bg-stone-800">
                      {item.photoUrl ? <img src={item.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImagePlus className="h-5 w-5 text-stone-400" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={item.available ? 'truncate font-medium text-stone-800 dark:text-stone-200' : 'truncate font-medium text-stone-400 line-through'}>{item.name}</p>
                      <p className="text-xs text-stone-400 truncate">{formatPriceDA(item.price)}{item.description ? ` — ${item.description}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(item)}
                        aria-label={`Modifier ${item.name}`}
                        title="Modifier"
                        className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id, item.name)}
                        aria-label={`Supprimer ${item.name}`}
                        title="Supprimer"
                        className="rounded-md p-1.5 text-stone-400 transition hover:bg-red-50 dark:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 sm:pl-[68px]">
                    <button
                      onClick={() => toggleAvailability(item.id, !item.available)}
                      className={`px-2 py-1 rounded-full text-xs ${item.available ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:bg-red-500/15 dark:text-red-400'}`}
                    >
                      {item.available ? 'Disponible' : 'Indisponible'}
                    </button>
                  </div>
                  {editingId === item.id && (
                    <form onSubmit={saveEdit} className="mt-3 space-y-3 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10/60 p-3 dark:border-amber-400/20 dark:bg-amber-400/5">
                      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                        <PhotoPreview url={editForm.photoUrl} onFile={(f) => readPhoto(f, (url) => setEditForm((form) => ({ ...form, photoUrl: url })))} onClear={() => setEditForm((form) => ({ ...form, photoUrl: '' }))} />
                        <div className="space-y-2">
                          <select value={editForm.categoryId ?? ''} onChange={(e) => setEditForm((form) => ({ ...form, categoryId: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <input required placeholder="Nom" value={editForm.name} onChange={(e) => setEditForm((form) => ({ ...form, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                          <input required placeholder="Prix (DA)" value={editForm.price} onChange={(e) => setEditForm((form) => ({ ...form, price: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                        </div>
                      </div>
                      <textarea rows={2} placeholder="Description" value={editForm.description} onChange={(e) => setEditForm((form) => ({ ...form, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-stone-950 text-white text-sm font-medium hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Enregistrer</button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">Annuler</button>
                      </div>
                    </form>
                  )}
                </li>
              ))}
              {cat.items.length === 0 && (
                <li className="text-xs text-stone-400 px-1 py-2">Aucun plat dans cette catégorie.</li>
              )}
            </ul>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-stone-500">Créez votre première catégorie pour commencer.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[.75fr_1.25fr] gap-4 mt-6">
        <form onSubmit={createCategory} className="bg-white rounded-lg border border-stone-200 p-4 space-y-2 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <p className="text-sm font-medium text-stone-700 flex items-center gap-1 dark:text-stone-300"><Plus className="w-4 h-4" /> Nouvelle catégorie</p>
          <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="ex. Entrées" className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
          <button className="px-3 py-1.5 rounded-lg bg-stone-950 text-white text-sm font-medium hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Ajouter</button>
        </form>

        <form onSubmit={createItem} className="bg-white rounded-lg border border-stone-200 p-4 space-y-3 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <p className="text-sm font-medium text-stone-700 flex items-center gap-1 dark:text-stone-300"><Plus className="w-4 h-4" /> Nouveau plat</p>
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <PhotoPreview url={newItem.photoUrl} onFile={(f) => readPhoto(f, (url) => setNewItem((item) => ({ ...item, photoUrl: url })))} onClear={() => setNewItem((item) => ({ ...item, photoUrl: '' }))} />
            <div className="space-y-2">
              <select value={newItem.categoryId ?? ''} onChange={(e) => setNewItem({ ...newItem, categoryId: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input required placeholder="Nom" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
              <input required placeholder="Prix (DA)" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
            </div>
          </div>
          <input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
          <div className="flex gap-2">
            <input placeholder="URL de la photo ou importer une image" value={newItem.photoUrl} onChange={(e) => setNewItem({ ...newItem, photoUrl: e.target.value })} className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-stone-300 px-3 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
              <Upload className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={(e) => readPhoto(e.target.files?.[0], (url) => setNewItem((item) => ({ ...item, photoUrl: url })))} className="sr-only" />
            </label>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-stone-950 text-white text-sm font-medium hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Ajouter le plat</button>
        </form>
      </div>
    </div>
  )
}

function ImageToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition dark:border-stone-700 dark:bg-stone-900"
      title={enabled ? 'Masquer les photos dans le menu public' : 'Afficher les photos dans le menu public'}
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${enabled ? 'bg-lime-500' : 'bg-stone-300 dark:bg-stone-700'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-200">
        <Images className="h-4 w-4" /> Photos du menu
      </span>
    </button>
  )
}

function PhotoPreview({ url, onFile, onClear }: { url: string; onFile: (file: File | undefined) => void; onClear: () => void }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
      {url ? (
        <>
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            aria-label="Retirer la photo"
            title="Retirer la photo"
            className="absolute right-1 top-1 rounded-full bg-stone-900/70 p-1 text-white hover:bg-stone-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-500">
          <ImagePlus className="h-8 w-8" />
          <span className="text-xs">Photo</span>
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
        </label>
      )}
    </div>
  )
}
