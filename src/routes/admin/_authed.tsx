import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { LogOut, Building2, Plus } from 'lucide-react'
import { getSession, logout } from '../../server/auth.functions'
import { ThemeToggle } from '../../components/ThemeToggle'

export const Route = createFileRoute('/admin/_authed')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      throw redirect({ to: '/admin/login' })
    }
    return { session }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { session } = Route.useRouteContext()
  return (
    <div className="min-h-screen">
      <header className="bg-stone-900 text-white dark:bg-stone-900 dark:border-b dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> nreservi.online · Administration</span>
            <nav className="flex items-center gap-4 text-sm text-stone-300">
              <Link to="/admin" activeProps={{ className: 'text-white' }}>Restaurants</Link>
              <Link to="/admin/onboard" activeProps={{ className: 'text-white' }} className="flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Onboard
              </Link>
              <Link to="/admin/subscriptions" activeProps={{ className: 'text-white' }}>Abonnements</Link>
              <Link to="/admin/ads" activeProps={{ className: 'text-white' }}>Publicités</Link>
              <Link to="/admin/account" activeProps={{ className: 'text-white' }}>Compte</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-300">
            <ThemeToggle />
            <span>{session.name}</span>
            <button
              onClick={async () => {
                await logout()
                window.location.href = '/admin/login'
              }}
              className="flex items-center gap-1 hover:text-white"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
