import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { listDoctors, createDoctor, updateDoctor, deleteDoctor, toggleDoctorAvailability } from '../../server/doctor.functions'
import { requireSession } from '../../server/auth.functions'

export const Route = createFileRoute('/owner/_authed/doctors')({
  loader: async () => {
    const session = await requireSession()
    const restaurantId = (session as any).restaurantId
    if (!restaurantId) return { doctors: [] as any[] }
    const doctors = await listDoctors({ data: { restaurantId } })
    return { doctors }
  },
  component: DoctorsPage,
})

interface DoctorForm {
  name: string
  specialty: string
  bio: string
  photoUrl: string
  qualifications: string
  sortOrder: number
}

const EMPTY_FORM: DoctorForm = { name: '', specialty: '', bio: '', photoUrl: '', qualifications: '', sortOrder: 0 }

function DoctorsPage() {
  const initial = Route.useLoaderData()
  const [doctors, setDoctors] = useState(initial.doctors)
  const [form, setForm] = useState<DoctorForm>({ ...EMPTY_FORM })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<DoctorForm>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      const session = await requireSession()
      const restaurantId = (session as any).restaurantId
      if (!restaurantId) return
      const data = await listDoctors({ data: { restaurantId } })
      setDoctors(data)
    } catch {}
  }

  async function addDoctor(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.specialty.trim()) return
    setError(null)
    try {
      await createDoctor({
        data: {
          name: form.name.trim(),
          specialty: form.specialty.trim(),
          bio: form.bio.trim(),
          photoUrl: form.photoUrl || undefined,
          qualifications: form.qualifications.trim(),
          sortOrder: form.sortOrder,
        },
      })
      setForm({ ...EMPTY_FORM })
      refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la création')
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId == null || !editForm.name.trim() || !editForm.specialty.trim()) return
    setError(null)
    try {
      await updateDoctor({
        data: {
          id: editingId,
          name: editForm.name.trim(),
          specialty: editForm.specialty.trim(),
          bio: editForm.bio.trim(),
          photoUrl: editForm.photoUrl || undefined,
          qualifications: editForm.qualifications.trim(),
          sortOrder: editForm.sortOrder,
        },
      })
      setEditingId(null)
      refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Erreur lors de la mise à jour')
    }
  }

  async function removeDoctor(id: number, name: string) {
    if (!window.confirm(`Supprimer le Dr. « ${name} » ?`)) return
    await deleteDoctor({ data: { id } })
    if (editingId === id) setEditingId(null)
    refresh()
  }

  async function toggleAvailability(id: number, available: boolean) {
    await toggleDoctorAvailability({ data: { id, available } })
    refresh()
  }

  function readPhoto(file: File | undefined, setter: (url: string) => void) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div>
        <p className="text-sm font-medium text-[#069494]">Cabinet médical</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight dark:text-stone-50">Gestion des médecins</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          {doctors.length === 0
            ? 'Ajoutez vos médecins pour permettre aux patients de prendre rendez-vous.'
            : `${doctors.length} médecin${doctors.length > 1 ? 's' : ''} dans votre cabinet.`}
        </p>
      </div>

      {/* Doctor list */}
      <div className="grid gap-4 mt-6 sm:grid-cols-2">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-lg border border-stone-200 p-4 shadow-sm dark:bg-stone-900 dark:border-stone-800">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                {doc.photoUrl ? (
                  <img src={doc.photoUrl} alt={doc.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-[#069494]/10 dark:bg-[#069494]/20 flex items-center justify-center text-lg font-bold text-[#069494]">
                    {doc.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">{doc.name}</p>
                <p className="text-sm text-[#069494]">{doc.specialty}</p>
                {doc.bio && <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">{doc.bio}</p>}
                {doc.qualifications && <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{doc.qualifications}</p>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleAvailability(doc.id, !doc.available)}
                className={`px-2 py-1 rounded-full text-xs ${doc.available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'}`}
              >
                {doc.available ? 'Visible' : 'Masqué'}
              </button>
              <button
                onClick={() => { setEditingId(doc.id); setEditForm({ name: doc.name, specialty: doc.specialty, bio: doc.bio ?? '', photoUrl: doc.photoUrl ?? '', qualifications: doc.qualifications ?? '', sortOrder: doc.sortOrder ?? 0 }) }}
                className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                title="Modifier"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeDoctor(doc.id, doc.name)}
                className="rounded-md p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {editingId === doc.id && (
              <form onSubmit={saveEdit} className="mt-4 space-y-3 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10/60 p-3">
                <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                  <div className="relative h-28 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                    {editForm.photoUrl ? (
                      <>
                        <img src={editForm.photoUrl} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => setEditForm((f) => ({ ...f, photoUrl: '' }))} className="absolute right-1 top-1 rounded-full bg-stone-900/70 p-1 text-white hover:bg-stone-900"><X className="h-3.5 w-3.5" /></button>
                      </>
                    ) : (
                      <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-500">
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-xs">Photo</span>
                        <input type="file" accept="image/*" onChange={(e) => readPhoto(e.target.files?.[0], (url) => setEditForm((f) => ({ ...f, photoUrl: url })))} className="sr-only" />
                      </label>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input required placeholder="Nom du médecin" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                    <input required placeholder="Spécialité" value={editForm.specialty} onChange={(e) => setEditForm((f) => ({ ...f, specialty: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                    <input placeholder="Formation / Qualifications" value={editForm.qualifications} onChange={(e) => setEditForm((f) => ({ ...f, qualifications: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                  </div>
                </div>
                <textarea rows={2} placeholder="Bio / Description" value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-stone-950 text-white text-sm font-medium hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Enregistrer</button>
                  <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg border border-stone-300 text-sm text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">Annuler</button>
                </div>
              </form>
            )}
          </div>
        ))}
        {doctors.length === 0 && (
          <p className="text-sm text-stone-500 col-span-full">Aucun médecin. Ajoutez votre premier médecin ci-dessous.</p>
        )}
      </div>

      {/* Add new doctor form */}
      <form onSubmit={addDoctor} className="bg-white rounded-lg border border-stone-200 p-4 mt-6 space-y-3 shadow-sm dark:bg-stone-900 dark:border-stone-800">
        <p className="text-sm font-medium text-stone-700 flex items-center gap-1 dark:text-stone-300"><Plus className="w-4 h-4" /> Nouveau médecin</p>
        <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
          <div className="relative h-28 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
            {form.photoUrl ? (
              <>
                <img src={form.photoUrl} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, photoUrl: '' }))} className="absolute right-1 top-1 rounded-full bg-stone-900/70 p-1 text-white hover:bg-stone-900"><X className="h-3.5 w-3.5" /></button>
              </>
            ) : (
              <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-stone-400 hover:text-stone-500">
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs">Photo</span>
                <input type="file" accept="image/*" onChange={(e) => readPhoto(e.target.files?.[0], (url) => setForm((f) => ({ ...f, photoUrl: url })))} className="sr-only" />
              </label>
            )}
          </div>
          <div className="space-y-2">
            <input required placeholder="Nom du médecin" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
            <input required placeholder="Spécialité (ex: Cardiologue)" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
            <input placeholder="Formation / Qualifications" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
          </div>
        </div>
        <textarea rows={2} placeholder="Bio / Description" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Ordre" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-20 px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
          <label className="text-xs text-stone-400">Ordre d'affichage</label>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-2">
          <input placeholder="URL de la photo ou importer une image" value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className="min-w-0 flex-1 px-3 py-2 rounded-lg border border-stone-300 bg-white text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100" />
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-stone-300 px-3 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
            <Upload className="h-4 w-4" />
            <input type="file" accept="image/*" onChange={(e) => readPhoto(e.target.files?.[0], (url) => setForm((f) => ({ ...f, photoUrl: url })))} className="sr-only" />
          </label>
        </div>
        <button className="px-3 py-1.5 rounded-lg bg-stone-950 text-white text-sm font-medium hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Ajouter le médecin</button>
      </form>
    </div>
  )
}
