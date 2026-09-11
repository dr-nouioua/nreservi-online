import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AtSign, Baby, Car, ChevronRight, DoorOpen, Droplets, ImagePlus, KeyRound, Lightbulb, MessageCircle, Pencil, Plus, Save, Stethoscope, Trash2, Upload } from 'lucide-react'
import { getOwnerOverview, updateRestaurantSettings, addArea, addTable, deleteTable, renameArea, deleteArea, setBabySeatAvailable, setHasParking, setHasShowers, setHasLockerRooms, setHasNightLighting, setHasChildSeat, setHasDoctors, setSlotDuration } from '../../server/owner.functions'
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
  const [facebookUrl, setFacebookUrl] = useState(initial.restaurant?.facebookUrl ?? '')
  const [instagramUrl, setInstagramUrl] = useState(initial.restaurant?.instagramUrl ?? '')
  const [tiktokUrl, setTiktokUrl] = useState(initial.restaurant?.tiktokUrl ?? '')
  const [mapsUrl, setMapsUrl] = useState(initial.restaurant?.mapsUrl ?? '')
  const [hours, setHours] = useState<Record<string, { open: string; close: string }[]>>(
    (initial.restaurant?.openingHours as any) ?? {},
  )
  const [babySeat, setBabySeat] = useState(initial.restaurant?.babySeatAvailable ?? false)
  const [parking, setParking] = useState(initial.restaurant?.hasParking ?? false)
  const [showers, setShowers] = useState(initial.restaurant?.hasShowers ?? false)
  const [lockerRooms, setLockerRooms] = useState(initial.restaurant?.hasLockerRooms ?? false)
  const [nightLighting, setNightLighting] = useState(initial.restaurant?.hasNightLighting ?? false)
  const [childSeat, setChildSeat] = useState(initial.restaurant?.hasChildSeat ?? false)
  const [hasDoctors, setHasDoctors] = useState(initial.restaurant?.hasDoctors ?? false)
  const [slotDuration, setLocalSlotDuration] = useState(initial.restaurant?.slotDuration ?? 30)

  const category = initial.restaurant?.category ?? 'restaurant'
  const isFootball = category === 'football_pitch'
  const isCarRental = category === 'car_rental'
  const isBarbershop = category === 'barbershop'
  const isSalonOrSpa = category === 'beauty_salon' || category === 'spa'
  const isDoctor = category === 'doctor'
  const showTables = category === 'restaurant'
  const [newAreaName, setNewAreaName] = useState('')
  const [newAreaFormat, setNewAreaFormat] = useState('5v5')
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null)
  const [areaName, setAreaName] = useState('')
  const [areaMessage, setAreaMessage] = useState<string | null>(null)
  const [newTable, setNewTable] = useState({ areaId: initial.areas[0]?.id, label: '', capacity: 2, shape: 'square' })
  const [saved, setSaved] = useState<string | null>(null)
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
    const result = await updateRestaurantSettings({ data: { name, description, logoUrl, coverImageUrl, facebookUrl, instagramUrl, tiktokUrl, mapsUrl, openingHours: hours } })
    if ('error' in result && result.error) {
      setSaved(result.error)
      setTimeout(() => setSaved(null), 3500)
      return
    }
    await setSlotDuration({ data: { duration: slotDuration } })
    setSaved('Enregistré')
    setTimeout(() => setSaved(null), 2000)
  }

  async function setImageFromFile(file: File | undefined, setter: (value: string) => void) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(String(reader.result))
    reader.readAsDataURL(file)
  }

  async function saveAreaName(id: number) {
    const result = await renameArea({ data: { id, name: areaName } })
    if ('error' in result && result.error) {
      setAreaMessage(result.error)
      return
    }
    setEditingAreaId(null)
    setAreaMessage(null)
    refresh()
  }

  async function removeArea(id: number) {
    const result = await deleteArea({ data: { id } })
    if ('error' in result && result.error) {
      setAreaMessage(result.error)
      return
    }
    setAreaMessage(null)
    refresh()
  }

  async function toggleFlag(kind: 'baby' | 'parking' | 'showers' | 'locker' | 'lighting' | 'childseat' | 'doctors') {
    const flags = { baby: babySeat, parking, showers: showers, locker: lockerRooms, lighting: nightLighting, childseat: childSeat, doctors: hasDoctors }
    const next = !flags[kind]
    if (kind === 'baby') setBabySeat(next)
    else if (kind === 'parking') setParking(next)
    else if (kind === 'showers') setShowers(next)
    else if (kind === 'locker') setLockerRooms(next)
    else if (kind === 'lighting') setNightLighting(next)
    else if (kind === 'childseat') setChildSeat(next)
    else if (kind === 'doctors') setHasDoctors(next)
    const fns = { baby: setBabySeatAvailable, parking: setHasParking, showers: setHasShowers, locker: setHasLockerRooms, lighting: setHasNightLighting, childseat: setHasChildSeat, doctors: setHasDoctors }
    await fns[kind]({ data: { enabled: next } })
  }

  async function createArea(e: React.FormEvent) {
    e.preventDefault()
    await addArea({ data: { name: newAreaName, format: isFootball ? newAreaFormat : undefined } })
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl space-y-6">
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
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 min-w-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border-4 border-white bg-white dark:bg-stone-900 shadow-sm">
              {logoUrl ? <img src={logoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xl font-bold text-stone-500 dark:text-stone-400">{name.slice(0, 1) || 'R'}</div>}
            </div>
            <div className="rounded-lg bg-white/90 px-4 py-2 backdrop-blur min-w-0">
              <p className="text-lg font-semibold text-stone-950 dark:text-stone-50 truncate">{name || "Nom du restaurant"}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{overview.restaurant?.cuisine}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-4">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Profil</p>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageField label="Logo" value={logoUrl} onChange={setLogoUrl} onFile={(file) => setImageFromFile(file, setLogoUrl)} />
              <ImageField label="Image de couverture" value={coverImageUrl} onChange={setCoverImageUrl} onFile={(file) => setImageFromFile(file, setCoverImageUrl)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              {initial.restaurant?.category === 'restaurant' && (
                <ServiceToggle enabled={babySeat} onToggle={() => toggleFlag('baby')} label="Chaises bébé" icon={Baby} hint="Proposez ce service aux clients qui réservent" />
              )}
              <ServiceToggle enabled={parking} onToggle={() => toggleFlag('parking')} label="Parking sur place" icon={Car} hint="Affiché sur votre page publique" />
              {initial.restaurant?.category === 'football_pitch' && (
                <>
                  <ServiceToggle enabled={showers} onToggle={() => toggleFlag('showers')} label="Douches" icon={Droplets} hint="Douches disponibles pour les joueurs" />
                  <ServiceToggle enabled={lockerRooms} onToggle={() => toggleFlag('locker')} label="Vestiaires" icon={DoorOpen} hint="Vestiaires disponibles" />
                  <ServiceToggle enabled={nightLighting} onToggle={() => toggleFlag('lighting')} label="Éclairage nocturne" icon={Lightbulb} hint="Terrains éclairés le soir" />
                </>
              )}
              {initial.restaurant?.category === 'car_rental' && (
                <ServiceToggle enabled={childSeat} onToggle={() => toggleFlag('childseat')} label="Siège bébé sur demande" icon={Baby} hint="Disponible à la demande" />
              )}
              {initial.restaurant?.category === 'doctor' && (
                <ServiceToggle enabled={hasDoctors} onToggle={() => toggleFlag('doctors')} label="Gestion des médecins" icon={Stethoscope} hint="Activez pour gérer les profils de médecins" />
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Facebook (https://…)</label>
                <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/monrestaurant" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Instagram (https://…)</label>
                <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/monrestaurant" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400">TikTok (https://…)</label>
                <input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://tiktok.com/@monrestaurant" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Lien Google Maps (itinéraire — invisible pour le client)</label>
                <input value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=…" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Horaires d'ouverture</p>
            {DAYS.map(([d, label]) => (
              <div key={d} className="grid grid-cols-[42px_1fr_1fr] items-center gap-2 text-sm">
                <span className="uppercase text-stone-500 dark:text-stone-400">{label}</span>
                <input
                  inputMode="numeric"
                  placeholder="HH:MM"
                  value={hours[d]?.[0]?.open ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9:]/g, "").slice(0, 5)
                    setHours({ ...hours, [d]: [{ open: v, close: hours[d]?.[0]?.close ?? "22:00" }] })
                  }}
                  className={`min-w-0 rounded border px-2 py-1 text-center text-sm ${/^([01]\d|2[0-3]):[0-5]\d$/.test(hours[d]?.[0]?.open ?? "") || !hours[d]?.[0]?.open ? "border-stone-300 dark:border-stone-700" : "border-red-400"}`}
                />
                <input
                  inputMode="numeric"
                  placeholder="HH:MM"
                  value={hours[d]?.[0]?.close ?? ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9:]/g, "").slice(0, 5)
                    setHours({ ...hours, [d]: [{ open: hours[d]?.[0]?.open ?? "12:00", close: v }] })
                  }}
                  className={`min-w-0 rounded border px-2 py-1 text-center text-sm ${/^([01]\d|2[0-3]):[0-5]\d$/.test(hours[d]?.[0]?.close ?? "") || !hours[d]?.[0]?.close ? "border-stone-300 dark:border-stone-700" : "border-red-400"}`}
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

      {initial.restaurant?.subscriptionTier === 'premium' ? (
      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 dark:text-stone-100">
          {isFootball ? 'Terrains' : (isSalonOrSpa || isBarbershop) ? 'Postes' : isCarRental ? 'Véhicules' : isDoctor ? 'Consultations' : 'Espaces & tables'}
        </p>
        {overview.areas.map((area) => (
          <div key={area.id} className="rounded-lg border border-stone-100 dark:border-stone-800 p-3">
            <div className="flex items-center justify-between gap-2">
              {editingAreaId === area.id ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <input value={areaName} onChange={(e) => setAreaName(e.target.value)} className="min-w-0 flex-1 rounded border border-stone-300 px-2 py-1 text-sm dark:border-stone-700" />
                  <button onClick={() => saveAreaName(area.id)} className="rounded-lg bg-stone-950 px-2.5 py-1 text-xs font-medium text-white dark:bg-stone-100 dark:text-stone-900">OK</button>
                  <button onClick={() => setEditingAreaId(null)} className="text-xs text-stone-500">Annuler</button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{area.name}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingAreaId(area.id); setAreaName(area.name) }} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800" title="Renommer l'espace">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { if (window.confirm(`Supprimer l'espace « ${area.name} » ?`)) removeArea(area.id) }} className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" title="Supprimer l'espace">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
            {areaMessage && editingAreaId === null && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{areaMessage}</p>}
            <ul className="mt-2 space-y-1">
              {showTables ? (
                overview.tables.filter((t) => t.areaId === area.id).map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
                    <span>{t.label} — {t.capacity} places ({t.shape})</span>
                    <button onClick={() => removeTable(t.id)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-sm text-stone-500 dark:text-stone-400 italic">
                  {isFootball ? `Terrain ${area.format ?? ''}` : (isSalonOrSpa || isBarbershop) ? 'Poste de travail' : isCarRental ? 'Véhicule' : isDoctor ? 'Salle de consultation' : ''}
                </li>
              )}
            </ul>
          </div>
        ))}

        <form onSubmit={createArea} className="flex gap-2 pt-2">
          <input placeholder={isFootball ? 'Nom du terrain' : (isSalonOrSpa || isBarbershop) ? 'Nom du poste' : isCarRental ? 'Type de véhicule' : 'Nom du nouvel espace'} value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
          {isFootball && (
            <select value={newAreaFormat} onChange={(e) => setNewAreaFormat(e.target.value)} className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm">
              <option value="5v5">5v5 (10 joueurs)</option>
              <option value="6v6">6v6 (12 joueurs)</option>
              <option value="7v7">7v7 (14 joueurs)</option>
            </select>
          )}
          <button className="flex items-center gap-1 rounded-lg bg-stone-100 dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"><Plus className="h-4 w-4" /> Ajouter</button>
        </form>

        {showTables && (
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
        )}
      </div>

      ) : (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400">
          La gestion des espaces & tables est incluse dans la formule <span className="font-semibold">Premium</span>.
        </div>
      )}

      <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 dark:text-stone-100">Créneaux horaires</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">Durée de chaque créneau de réservation affiché aux clients.</p>
        <div className="flex items-center gap-3">
          <label className="text-sm text-stone-700 dark:text-stone-300">Durée :</label>
          <select
            value={slotDuration}
            onChange={(e) => setLocalSlotDuration(Number(e.target.value))}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 heure</option>
            <option value={90}>1h30</option>
            <option value={120}>2 heures</option>
            <option value={150}>2h30</option>
            <option value={180}>3 heures</option>
          </select>
          <button
            type="button"
            onClick={async () => {
              const result = await setSlotDuration({ data: { duration: slotDuration } })
              if ('error' in result && result.error) {
                setSaved(result.error)
              } else {
                setSaved('Créneau enregistré')
              }
              setTimeout(() => setSaved(null), 2000)
            }}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            Confirmer
          </button>
        </div>
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


function ServiceToggle({ enabled, onToggle, label, hint, icon: Icon }: {
  enabled: boolean
  onToggle: () => void
  label: string
  hint: string
  icon: typeof Baby
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      className={`inline-flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 ${
        enabled
          ? 'border-lime-400/70 bg-lime-50 dark:border-lime-500/40 dark:bg-lime-500/10'
          : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${enabled ? 'bg-lime-400 text-stone-950' : 'bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500'}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${enabled ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 dark:text-stone-400'}`}>{label}</span>
        <span className="block text-[11px] text-stone-400">{hint}</span>
      </span>
      <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-lime-500' : 'bg-stone-300 dark:bg-stone-600'}`}>
        <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-all ${enabled ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}
