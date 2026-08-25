import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { KeyRound, Mail } from 'lucide-react'
import { requestPasswordReset } from '../server/password-reset.functions'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await requestPasswordReset({ data: { email } })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-100 dark:bg-lime-500/15">
            <KeyRound className="h-5 w-5 text-lime-700 dark:text-lime-300" />
          </span>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Mot de passe oublié</h1>
        </div>

        {sent ? (
          <div className="space-y-5">
            <p className="text-sm text-stone-600 dark:text-stone-400 flex items-start gap-2">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              Si un compte existe pour cette adresse, un e-mail avec un lien de réinitialisation vient d'être envoyé.
              Pensez à vérifier vos spams.
            </p>
            <Link to="/owner/login" className="block text-center text-sm text-stone-500 hover:text-stone-900 dark:hover:text-stone-100">Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-stone-500 dark:text-stone-400">Entrez votre adresse e-mail — vous recevrez un lien pour choisir un nouveau mot de passe (valable 1 heure).</p>
            <div>
              <label className="text-xs text-stone-500 dark:text-stone-400">Adresse e-mail</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full mt-1 px-3 py-2.5 rounded-lg border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 text-sm"
              />
            </div>
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-900 text-sm font-medium disabled:opacity-50">
              {loading ? 'Envoi…' : 'Recevoir le lien'}
            </button>
          </form>
        )}
      </div>
      <Link to="/owner/login" className="mt-6 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">Retour à la connexion</Link>
    </div>
  )
}
