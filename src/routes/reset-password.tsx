import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { resetPassword, validateResetToken } from '../server/password-reset.functions'

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, string> = {}) => ({ token: search.token ?? '' }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const [checked, setChecked] = useState<boolean | null>(null)
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function check() {
    const result = await validateResetToken({ data: { token } })
    setChecked(result.valid)
  }

  // Validate the token on mount (once).
  useEffect(() => {
    if (token) void check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const result = await resetPassword({ data: { token, newPassword: form.newPassword, confirmPassword: form.confirmPassword } })
    if ('error' in result && result.error) {
      setError(result.error)
      return
    }
    setError(null)
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-500/15">
            <KeyRound className="h-5 w-5 text-lime-700 dark:text-lime-300" />
          </span>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Nouveau mot de passe</h1>
        </div>

        {!token ? (
          <p className="text-sm text-red-600 dark:text-red-400">Lien invalide — demandez un nouveau lien depuis la page de connexion.</p>
        ) : checked === null ? (
          <p className="text-sm text-stone-400">Vérification du lien…</p>
        ) : !checked ? (
          <p className="text-sm text-red-600 dark:text-red-400">Ce lien est invalide ou a expiré. <Link to="/forgot-password" className="underline">Faites une nouvelle demande</Link>.</p>
        ) : success ? (
          <div className="space-y-5">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Mot de passe mis à jour ✓ Vous pouvez vous connecter.</p>
            <Link to="/owner/login" className="block text-center text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">Aller à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400">Nouveau mot de passe (8 caractères min.)</label>
              <input required type="password" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 text-sm" />
            </div>
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400">Confirmer</label>
              <input required type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 text-sm" />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button className="w-full py-2.5 rounded-lg bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-900 text-sm font-medium disabled:opacity-50">
              Mettre à jour
            </button>
          </form>
        )}
      </div>
      <Link to="/owner/login" className="mt-6 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">Retour à la connexion</Link>
    </div>
  )
}
