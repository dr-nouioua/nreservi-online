import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { LayoutDashboard, BarChart3, CreditCard, Lock, Megaphone, MessageCircle, Settings, UtensilsCrossed, LogOut } from 'lucide-react'
import { getSession, logout } from '../../server/auth.functions'
import { getOwnSubscription } from '../../server/owner.functions'
import { ThemeToggle } from '../../components/ThemeToggle'

export const Route = createFileRoute('/owner/_authed')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session || (session.role !== 'owner' && session.role !== 'staff')) {
      throw redirect({ to: '/owner/login' })
    }
    // Ungated subscription snapshot — decides whether the workspace renders
    // at all. Expired/suspended restaurants get the lock screen below.
    const subscription = await getOwnSubscription()
    return { session, subscription }
  },
  component: OwnerLayout,
})

const nav = [
  { to: '/owner', label: 'Réservations', icon: LayoutDashboard },
  { to: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/owner/marketing', label: 'Marketing', icon: Megaphone },
  { to: '/owner/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/owner/settings', label: 'Paramètres', icon: Settings },
  { to: '/owner/settings/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { to: '/owner/billing', label: 'Abonnement', icon: CreditCard },
] as const

function OwnerLayout() {
  const { session, subscription } = Route.useRouteContext() as {
    session: { name: string; email: string }
    subscription: { effective: string; end: string | null; name?: string }
  }

  if (subscription.effective === 'expired' || subscription.effective === 'suspended' || subscription.effective === 'pending') {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <Lock className="mx-auto h-10 w-10 text-stone-400" />
          <h1 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">
            {subscription.effective === 'pending' ? 'Compte en attente de validation' : 'Accès suspendu'}
          </h1>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
            {subscription.effective === 'expired' && (
              <>
                Votre abonnement a expiré.
                <br />
                Votre accès à l'espace professionnel est actuellement suspendu.
                <br />
                Veuillez contacter l'administration pour renouveler votre abonnement.
              </>
            )}
            {subscription.effective === "suspended" && "Votre compte a été suspendu par l'administration. Contactez-nous pour rétablir votre accès."}
            {subscription.effective === "pending" && "Votre établissement sera actif dès sa validation par l'administration."}
          </p>
          <Link
            to="/owner/billing"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            Voir mon abonnement
          </Link>
          <LogoutButton full />
        </div>
      </main>
    )
  }

  return(
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-stone-200 bg-white p-4 flex flex-col dark:border-stone-800 dark:bg-stone-900">
        <a href="/" className="px-2" aria-label="nreservi.online — accueil">
          <img src="/brand/nreservi-logo.png" alt="nreservi.online" width={815} height={125} className="h-6 w-auto" />
        </a>
        <p className="font-semibold text-stone-900 px-2 mt-4 dark:text-stone-100">Espace professionnel</p>
        <p className="text-xs text-stone-400 px-2 mb-6">{session.name}</p>
        <nav className="space-y-1 flex-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === '/owner' || item.to === '/owner/settings' }}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              activeProps={{ className: 'flex items-center gap-2 px-2 py-2 rounded-lg text-sm bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium dark:bg-amber-400/10 dark:text-amber-300' }}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 pt-2">
          <LogoutButton />
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 bg-stone-50 min-h-screen overflow-y-auto dark:bg-stone-950">
        <Outlet />
      </main>
    </div>
  )
}

function LogoutButton({ full = false }: { full?: boolean }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await logout()
        window.location.href = '/owner/login'
      }}
      className={`inline-flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 ${full ? 'mt-6 justify-center border border-stone-200 w-full dark:border-stone-700' : 'w-full'}`}
    >
      <LogOut className="w-4 h-4" /> Déconnexion
    </button>
  )
}
