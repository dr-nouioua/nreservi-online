import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { loginAdmin } from '../../server/auth.functions'
import { ensureSeeded } from '../../server/seed.server'

const seedForLogin = createServerFn({ method: 'GET' }).handler(async () => {
  await ensureSeeded()
  return null
})

export const Route = createFileRoute('/admin/login')({
  loader: async () => {
    await seedForLogin()
    return null
  },
  component: AdminLogin,
})

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@platform.dev')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await loginAdmin({ data: { email, password } })
      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        navigate({ to: '/admin' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl p-8">
        <img src="/brand/nreservi-logo.png" alt="nreservi.online" width={815} height={125} className="h-7 w-auto" />
        <h1 className="text-xl font-bold text-stone-900 mt-5">Administration de la plateforme</h1>
        <p className="text-sm text-stone-500 mt-1">Accès réservé aux administrateurs.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="w-full py-2.5 rounded-lg bg-stone-950 text-white text-sm font-medium disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
