import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ImagePlus, Plus, Upload } from 'lucide-react'
import { getMenu, addMenuCategory, addMenuItem, toggleMenuItemAvailability } from '../../server/owner.functions'

export const Route = createFileRoute('/owner/_authed/menu')({
  loader: () => getMenu(),
  component: MenuPage,
})

function MenuPage() {
  const initial = Route.useLoaderData()
  const [categories, setCategories] = useState(initial)
  const [newCatName, setNewCatName] = useState('')
  const [newItem, setNewItem] = useState<{ categoryId: number | null; name: string; description: string; price: string; photoUrl: string }>({
    categoryId: initial[0]?.id ?? null,
    name: '',
    description: '',
    price: '',
    photoUrl: '',
  })

  async function refresh() {
    setCategories(await getMenu())
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault()
    await addMenuCategory({ data: { name: newCatName } })
    setNewCatName('')
    refresh()
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newItem.categoryId) return
    await addMenuItem({ data: { categoryId: newItem.categoryId, name: newItem.name, description: newItem.description, price: newItem.price, photoUrl: newItem.photoUrl } })
    setNewItem({ ...newItem, name: '', description: '', price: '', photoUrl: '' })
    refresh()
  }

  async function setPhotoFromFile(file: File | undefined) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setNewItem((item) => ({ ...item, photoUrl: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  async function toggleAvailability(id: number, available: boolean) {
    await toggleMenuItemAvailability({ data: { id, available } })
    refresh()
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-amber-700">Kitchen catalog</p>
          <h1 className="text-3xl font-bold text-stone-950 tracking-tight">Menu management</h1>
        </div>
      </div>

      <div className="grid gap-5 mt-6 lg:grid-cols-2">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-lg border border-stone-200 p-4 shadow-sm">
            <p className="font-semibold text-stone-900">{cat.name}</p>
            <ul className="mt-3 space-y-3">
              {cat.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-lg border border-stone-100 p-2 text-sm">
                  <div className="h-14 w-14 overflow-hidden rounded-md bg-stone-100 shrink-0">
                    {item.photoUrl ? <img src={item.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImagePlus className="h-5 w-5 text-stone-400" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={item.available ? 'truncate font-medium text-stone-800' : 'truncate font-medium text-stone-400 line-through'}>{item.name} — ${item.price}</p>
                    <p className="text-xs text-stone-400">{item.description}</p>
                  </div>
                  <button
                    onClick={() => toggleAvailability(item.id, !item.available)}
                    className={`px-2 py-1 rounded-full text-xs ${item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {item.available ? 'Available' : "86'd"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[.75fr_1.25fr] gap-4 mt-6">
        <form onSubmit={createCategory} className="bg-white rounded-lg border border-stone-200 p-4 space-y-2 shadow-sm">
          <p className="text-sm font-medium text-stone-700 flex items-center gap-1"><Plus className="w-4 h-4" /> New category</p>
          <input required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Specials" className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
          <button className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-sm">Add category</button>
        </form>

        <form onSubmit={createItem} className="bg-white rounded-lg border border-stone-200 p-4 space-y-3 shadow-sm">
          <p className="text-sm font-medium text-stone-700 flex items-center gap-1"><Plus className="w-4 h-4" /> New item</p>
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <div className="h-28 overflow-hidden rounded-lg bg-stone-100">
              {newItem.photoUrl ? <img src={newItem.photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImagePlus className="h-8 w-8 text-stone-400" /></div>}
            </div>
            <div className="space-y-2">
              <select value={newItem.categoryId ?? ''} onChange={(e) => setNewItem({ ...newItem, categoryId: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input required placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
              <input required placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
            </div>
          </div>
          <input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
          <div className="flex gap-2">
            <input placeholder="Photo URL or upload an image" value={newItem.photoUrl} onChange={(e) => setNewItem({ ...newItem, photoUrl: e.target.value })} className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm" />
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-stone-300 px-3 text-stone-600 hover:bg-stone-50">
              <Upload className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={(e) => setPhotoFromFile(e.target.files?.[0])} className="sr-only" />
            </label>
          </div>
          <button className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-sm">Add item</button>
        </form>
      </div>
    </div>
  )
}
