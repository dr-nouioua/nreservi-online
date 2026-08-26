import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { AtSign, KeyRound, Save, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { listAdmins, createAdmin, deleteAdmin, updateAdminAccess } from '../../server/admin.functions'
import { ADMIN_MODULES } from '../../server/admin.permissions'
import { changePassword, updateAccountEmail } from '../../server/auth.functions'

export const Route = createFileRoute('/3991/_authed/account')({
  loader: () => listAdmins(),
  component: AdminAccountPage,
})

type AdminRow = Awaited<ReturnType<typeof listAdmins>>['admins'][number]

function AdminAccountPage() {
  const { session } = Route.useRouteContext() as {
    session: { id: number; name: string; email: string; adminRole: 'super' | 'admin'; permissions: string[] }
  }
  const router = useRouter()

  const loader = Route.useLoaderData() as { admins: AdminRow[]; viewerIsSuper: boolean }
  const viewerIsSuper = loader.viewerIsSuper
  const [admins, setAdmins] = useState<AdminRow[]>(loader.admins)
  const [listMessage, setListMessage] = useState<string | null>(null)

  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', permissions: [] as string[] })
  const [newAdminMessage, setNewAdminMessage] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailMessage, setEmailMessage] = useState<string | null>(null)

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  async function refresh() {
    const data = await listAdmins()
    setAdmins(data.admins)
  }

  const [permEditing, setPermEditing] = useState<number | null>(null)
  const [permDraft, setPermDraft] = useState<string[]>([])

  async function savePermissions(id: number) {
    const result = await updateAdminAccess({ data: { id, permissions: permDraft } })
    if ('error' in result && result.error) {
      setListMessage(result.error)
      return
    }
    setPermEditing(null)
    setListMessage('Privilèges mis à jour.')
    refresh()
  }

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault()
    const result = await createAdmin({ data: { ...newAdmin, adminRole: 'admin' as const } })
    if ('error' in result && result.error) {
      setNewAdminMessage(result.error)
      return
    }
    setNewAdmin({ name: '', email: '', password: '', permissions: [] })
    setNewAdminMessage('Administrateur créé.')
    refresh()
  }

  async function remove(id: number) {
    const result = await deleteAdmin({ data: { id } })
    if ('error' in result && result.error) {
      setListMessage(result.error)
      return
    }
    setListMessage(null)
    refresh()
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

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Compte &amp; administrateurs</h1>
      </div>

      {/* ---- Administrateurs list (super admin only) ---- */}
      {viewerIsSuper ? (
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><ShieldCheck className="h-4 w-4" /> Administrateurs de la plateforme</p>
        <ul className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
          {admins.map((a: AdminRow) => (
            <li key={a.id} className="py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                  {a.name}
                  {a.adminRole === 'super' && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">Super admin</span>
                  )}
                  {a.id === session.id && (
                    <span className="ml-2 rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-700 dark:bg-lime-500/15 dark:text-lime-300">vous</span>
                  )}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{a.email}</p>
                {a.adminRole !== 'super' && (
                  <p className="mt-0.5 text-[11px] text-stone-400">
                    {(a.permissions as string[])?.length > 0
                      ? (a.permissions as string[]).map((p) => ADMIN_MODULES.find((m) => m.key === p)?.label ?? p).join(' · ')
                      : 'Aucun module accessible'}
                  </p>
                )}
              </div>
              {viewerIsSuper && a.id !== session.id && a.adminRole !== 'super' && permEditing !== a.id && (
                <button
                  onClick={() => { setPermEditing(a.id); setPermDraft([...((a.permissions as string[]) ?? [])]) }}
                  title="Modifier les privilèges"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Privilèges
                </button>
              )}
            </div>

            {viewerIsSuper && permEditing === a.id ? (
              <div className="mt-3 space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950/40">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Modules accessibles pour {a.name} :</p>
                <div className="flex flex-wrap gap-2">
                  {ADMIN_MODULES.map((m) => (
                    <label key={m.key} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs dark:border-stone-800">
                      <input
                        type="checkbox"
                        checked={permDraft.includes(m.key)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...permDraft, m.key]
                            : permDraft.filter((p) => p !== m.key)
                          setPermDraft(next)
                        }}
                        className="accent-lime-500"
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => savePermissions(a.id)} className="rounded-lg bg-stone-950 px-3 py-1.5 text-xs font-medium text-white dark:bg-stone-100 dark:text-stone-900">Enregistrer</button>
                  <button onClick={() => setPermEditing(null)} className="text-xs text-stone-500">Annuler</button>
                </div>
              </div>
            ) : null}

            {a.id !== session.id && permEditing !== a.id && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => remove(a.id)}
                  title={admins.length <= 1 ? 'Dernier administrateur — suppression impossible' : 'Supprimer cet administrateur'}
                  disabled={admins.length <= 1}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </button>
              </div>
            )}
            </li>
          ))}
        </ul>

        <form onSubmit={addAdmin} className="mt-5 space-y-3 border-t border-stone-100 pt-4 dark:border-stone-800">
          <p className="text-sm font-medium text-stone-700 flex items-center gap-1 dark:text-stone-300"><UserPlus className="h-4 w-4" /> Ajouter un administrateur</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input required value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} placeholder="Nom" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
            <input required type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="E-mail" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
            <input required type="password" minLength={8} value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} placeholder="Mot de passe (8+ caractères)" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          </div>
          <div className="flex flex-wrap gap-2">
            {ADMIN_MODULES.map((m) => (
              <label key={m.key} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs dark:border-stone-800">
                <input
                  type="checkbox"
                  checked={newAdmin.permissions.includes(m.key)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...newAdmin.permissions, m.key]
                      : newAdmin.permissions.filter((p) => p !== m.key)
                    setNewAdmin({ ...newAdmin, permissions: next })
                  }}
                  className="accent-lime-500"
                />
                {m.label}
              </label>
            ))}
          </div>
          {newAdminMessage && (
            <p className={`text-sm ${newAdminMessage === 'Administrateur créé.' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{newAdminMessage}</p>
          )}
          {listMessage && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{listMessage}</p>}

          <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">Créer le compte</button>
        </form>
      </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400">
          La gestion des administrateurs est réservée au super administrateur.
        </div>
      )}

      {/* ---- Own email ---- */}
      <form onSubmit={updateEmail} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><AtSign className="h-4 w-4" /> Mon e-mail de connexion</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Adresse actuelle : <span className="font-medium text-stone-700 dark:text-stone-200">{session.email}</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nouvel e-mail" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input required type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} placeholder="Mot de passe actuel" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
        </div>
        {emailMessage && <p className={`text-sm ${emailMessage.includes('mis à jour') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{emailMessage}</p>}
        <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"><Save className="h-4 w-4" /> Mettre à jour l'e-mail</button>
      </form>

      {/* ---- Own password ---- */}
      <form onSubmit={updatePassword} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 space-y-3 shadow-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><KeyRound className="h-4 w-4" /> Mon mot de passe</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <input required type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder="Mot de passe actuel" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input required type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="Nouveau mot de passe" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input required type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} placeholder="Confirmer" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
        </div>
        {passwordMessage && <p className={`text-sm ${passwordMessage.includes('à jour') || passwordMessage.includes('updated') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{passwordMessage}</p>}
        <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"><Save className="h-4 w-4" /> Changer le mot de passe</button>
      </form>
    </div>
  )
}
