import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BrandLogo } from "../../components/BrandLogo"
import { useState } from 'react'
import { loginOwner } from '../../server/auth.functions'
import { ensureSeeded } from '../../server/seed.server'
import { createServerFn } from '@tanstack/react-start'

const seedForLogin = createServerFn({ method: 'GET' }).handler(async () => {
  await ensureSeeded()
  return null
})

export const Route = createFileRoute('/owner/login')({
  loader: async () => {
    await seedForLogin()
    return null
  },
  component: OwnerLogin,
})

function OwnerLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await loginOwner({ data: { email, password } })
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        navigate({ to: '/owner' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800 px-4 py-12">
      <a href="/" className="mb-6" aria-label="nreservi.online — accueil">
        <BrandLogo className="h-8 w-auto" />
      </a>
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Espace professionnel</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Connectez-vous pour gérer les réservations de votre établissement.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400">E-mail</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
          </div>
          <div>
            <label className="text-xs text-stone-500 dark:text-stone-400">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-sm" />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-stone-500 hover:text-stone-900 hover:underline dark:text-stone-400 dark:hover:text-stone-100">Mot de passe oublié ?</Link>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button disabled={loading} className="w-full py-2.5 rounded-lg bg-stone-950 text-white dark:ring-1 dark:ring-stone-700 text-sm font-medium disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
      <a href="/" className="mt-6 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">
        Retour à nreservi.online
      </a>
    </div>
  )
}
