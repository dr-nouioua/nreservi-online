import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AtSign, ChevronRight, ImagePlus, KeyRound, MessageCircle, Plus, Save, Trash2, Upload } from 'lucide-react'
import { getOwnerOverview, updateRestaurantSettings, addArea, addTable, deleteTable } from '../../server/owner.functions'
import { changePassword, updateAccountEmail } from '../../server/auth.functions'

export const Route = createFileRoute('/owner/_authed/settings')({
  loader: () => getOwnerOverview(),
  component: SettingsPage,
})

const DAYS = [
  ['mon', 'Lun'], ['tue', 'Mar'], ['wed', 'Mer'], ['thu', 'Jeu'],
  ['fri', 'Ven'], ['sat', 'Sam'], ['sun', 'Dim'],
] as const

function SettingsPage() {
  const initial = Route.useLoaderData()
  const { session } = Route.useRouteContext() as { session: { name: string; email: string } }
  const router = useRouter()
  const [overview, setOverview] = useState(initial)
  const [name, setName] = useState(initial.restaurant?.name ?? '')
  const [description, setDescription] = useState(initial.restaurant?.description ?? '')
  const [logoUrl, setLogoUrl] = useState(initial.restaurant?.logoUrl ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(initial.restaurant?.coverImageUrl ?? '')
  const [avgTicketPrice, setAvgTicketPrice] = useState(initial.restaurant?.avgTicketPrice ?? '0')
  const [hours, setHours] = useState<Record<string, { open: string; close: string }[]>>(
    (initial.restaurant?.openingHours as any) ?? {},
  )
  const [newAreaName, setNewAreaName] = useState('')
  const [newTable, setNewTable] = useState({ areaId: initial.areas[0]?.id, label: '', capacity: 2, shape: 'square' })
  const [saved, setSaved] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailMessage, setEmailMessage] = useState<string | null>(null)

  async function refresh() {
    setOverview(await getOwnerOverview())
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    await updateRestaurantSettings({ data: { name, description, logoUrl, coverImageUrl, avgTicketPrice, openingHours: hours } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function setImageFromFile(file: File | undefined, setter: (value: string) => void) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(String(reader.result))
    reader.readAsDataURL(file)
  }

  async function createArea(e: React.FormEvent) {
    e.preventDefault()
    await addArea({ data: { name: newAreaName } })
    setNewAreaName('')
    refresh()
  }

  async function createTable(e: React.FormEvent) {
    e.preventDefault()
    if (!newTable.areaId) return
    await addTable({ data: newTable as any })
    refresh()
  }

  async function removeTable(id: number) {
    await deleteTable({ data: { id } })
    refresh()
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    const result = await changePassword({ data: passwords })
    if ('error' in result && result.error) {
      setPasswordMessage(result.error)
      return
    }
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordMessage('Mot de passe mis à jour.')
  }

  async function updateEmail(e: React.FormEvent) {
    e.preventDefault()
    const result = await updateAccountEmail({ data: { newEmail: email, currentPassword: emailPassword } })
    if ('error' in result && result.error) {
      setEmailMessage(result.error)
      return
    }
    setEmail('')
    setEmailPassword('')
    setEmailMessage('E-mail mis à jour.')
    await router.invalidate()
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Espace de travail</p>
          <h1 className="text-3xl font-bold text-stone-950 dark:text-stone-50 tracking-tight">Paramètres du restaurant</h1>
        </div>
        {saved && <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">Enregistré</span>}
      </div>

      <form onSubmit={saveSettings} className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        <div className="relative h-56 bg-stone-100 dark:bg-stone-800">
          {coverImageUrl ? (
            <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#fee2e2,#fef3c7,#d1fae5)]">
              <ImagePlus className="h-12 w-12 text-stone-500 dark:text-stone-400/70" />
            </div>
          )}
          <div className="absolute bottom-4 left-5 flex items-center gap-3">
            <div className="h-20 w-20 overflow-hidden rounded-lg border-4 border-white bg-white dark:bg-stone-900 shadow-sm">
              {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xl font-bold text-stone-500 dark:text-stone-400">{name.slice(0, 1) || 'R'}</div>}
            </div>
            <div className="rounded-lg bg-white/90 px-4 py-2 backdrop-blur">
              <p className="text-lg font-semibold text-stone-950 dark:text-stone-50">{name || "Nom du restaurant"}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{overview.restaurant?.cuisine}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-4">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Profil</p>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Prix moyen du couvert (DA)</label>
              <input value={avgTicketPrice} onChange={(e) => setAvgTicketPrice(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageField label="Logo" value={logoUrl} onChange={setLogoUrl} onFile={(file) => setImageFromFile(file, setLogoUrl)} />
              <ImageField label="Image de couverture" value={coverImageUrl} onChange={setCoverImageUrl} onFile={(file) => setImageFromFile(file, setCoverImageUrl)} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Horaires d'ouverture</p>
            {DAYS.map(([d, label]) => (
              <div key={d} className="grid grid-cols-[42px_1fr_1fr] items-center gap-2 text-sm">
                <span className="uppercase text-stone-500 dark:text-stone-400">{label}</span>
                <input
                  type="time"
                  value={hours[d]?.[0]?.open ?? ''}
                  onChange={(e) => setHours({ ...hours, [d]: [{ open: e.target.value, close: hours[d]?.[0]?.close ?? '22:00' }] })}
                  className="min-w-0 rounded border border-stone-300 dark:border-stone-700 px-2 py-1"
                />
                <input
                  type="time"
                  value={hours[d]?.[0]?.close ?? ''}
                  onChange={(e) => setHours({ ...hours, [d]: [{ open: hours[d]?.[0]?.open ?? '12:00', close: e.target.value }] })}
                  className="min-w-0 rounded border border-stone-300 dark:border-stone-700 px-2 py-1"
                />
              </div>
            ))}
            <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white dark:ring-1 dark:ring-stone-700 hover:bg-stone-800"><Save className="h-4 w-4" /> Enregistrer</button>
          </div>
        </div>
      </form>

      <Link
        to="/owner/settings/whatsapp"
        className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/40"
      >
        <span className="flex items-start gap-3">
          <MessageCircle className="mt-0.5 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span>
            <span className="block font-semibold text-stone-900 dark:text-stone-100">WhatsApp</span>
            <span className="block text-sm text-stone-500 dark:text-stone-400">
              Votre numéro WhatsApp et les messages envoyés à vos clients.
            </span>
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
      </Link>

      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 dark:text-stone-100">Espaces & tables</p>
        {overview.areas.map((area) => (
          <div key={area.id} className="rounded-lg border border-stone-100 dark:border-stone-800 p-3">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{area.name}</p>
            <ul className="mt-2 space-y-1">
              {overview.tables.filter((t) => t.areaId === area.id).map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
                  <span>{t.label} — {t.capacity} places ({t.shape})</span>
                  <button onClick={() => removeTable(t.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <form onSubmit={createArea} className="flex gap-2 pt-2">
          <input placeholder="Nom du nouvel espace" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
          <button className="flex items-center gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"><Plus className="h-4 w-4" /> Area</button>
        </form>

        <form onSubmit={createTable} className="flex gap-2 flex-wrap pt-2">
          <select value={newTable.areaId} onChange={(e) => setNewTable({ ...newTable, areaId: Number(e.target.value) })} className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm">
            {overview.areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <input placeholder="Label" value={newTable.label} onChange={(e) => setNewTable({ ...newTable, label: e.target.value })} className="w-24 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
          <input type="number" min={1} value={newTable.capacity} onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })} className="w-20 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
          <select value={newTable.shape} onChange={(e) => setNewTable({ ...newTable, shape: e.target.value })} className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm">
            <option value="square">Carrée</option>
            <option value="round">Ronde</option>
            <option value="rect">Rectangulaire</option>
          </select>
          <button className="flex items-center gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"><Plus className="h-4 w-4" /> Table</button>
        </form>
      </div>

      <form onSubmit={updateEmail} className="bg-white rounded-lg border border-stone-200 p-6 space-y-3 shadow-sm dark:bg-stone-900 dark:border-stone-800">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><AtSign className="h-4 w-4" /> E-mail de connexion</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Adresse actuelle : <span className="font-medium text-stone-700 dark:text-stone-200">{session.email}</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nouvel e-mail" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input required type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} placeholder="Mot de passe actuel" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
        </div>
        {emailMessage && <p className={`text-sm ${emailMessage.includes('mis à jour') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{emailMessage}</p>}
        <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:ring-1 dark:ring-stone-700">Mettre à jour l'e-mail</button>
      </form>

      <form onSubmit={updatePassword} className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2"><KeyRound className="h-4 w-4" /> Owner password</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input required type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder="Mot de passe actuel" className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm" />
          <input required type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="Nouveau mot de passe" className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm" />
          <input required type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} placeholder="Confirmer le nouveau mot de passe" className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm" />
        </div>
        {passwordMessage && <p className={`text-sm ${passwordMessage.includes('updated') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{passwordMessage}</p>}
        <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white dark:ring-1 dark:ring-stone-700 hover:bg-stone-800"><Save className="h-4 w-4" /> Changer le mot de passe</button>
      </form>
    </div>
  )
}

function ImageField({ label, value, onChange, onFile }: { label: string; value: string; onChange: (value: string) => void; onFile: (file: File | undefined) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</label>
      <div className="mt-1 flex gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://... or upload" className="min-w-0 flex-1 rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm" />
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-stone-300 dark:border-stone-700 px-3 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/70">
          <Upload className="h-4 w-4" />
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="sr-only" />
        </label>
      </div>
    </div>
  )
}
