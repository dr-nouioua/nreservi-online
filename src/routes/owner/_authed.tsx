import { createFileRoute, Link, Outlet, redirect, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { getSession, logout } from '../../server/auth.functions'
import { getOwnSubscription } from '../../server/owner.functions'
import { ThemeToggle } from '../../components/ThemeToggle'
import { BrandLogo } from '../../components/BrandLogo'

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

  // Drawer (mobile/tablet) + icon-only collapse (desktop). Persisted.
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('nreservi-sidebar') === 'collapsed',
  )
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Close the drawer whenever the route changes (spec §5).
  useEffect(() => { setDrawerOpen(false) }, [pathname])
  // Lock body scroll while the drawer is open on mobile.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem('nreservi-sidebar', c ? 'expanded' : 'collapsed')
      return !c
    })
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

  const sidebarWidth = collapsed ? 'lg:w-[68px]' : 'lg:w-56'

  const navLinks = () => (
    <nav className="space-y-1 flex-1 overflow-y-auto">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={() => setDrawerOpen(false)}
          activeOptions={{ exact: item.to === '/owner' || item.to === '/owner/settings' }}
          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 ${collapsed ? 'lg:justify-center' : ''}`}
          activeProps={{
            className: `flex items-center gap-2 px-2 py-2 rounded-lg text-sm bg-amber-50 text-amber-700 font-medium dark:bg-amber-400/10 dark:text-amber-300 ${collapsed ? 'lg:justify-center' : ''}`,
          }}
          title={item.label}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen lg:flex">
      {/* ---- Mobile overlay ---- */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ---- Sidebar: off-canvas drawer on mobile, fixed panel on desktop ---- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white p-4 transition-transform duration-200 ease-out dark:border-stone-800 dark:bg-stone-900
          lg:relative lg:z-auto lg:translate-x-0 lg:transition-[width,transform]
          ${sidebarWidth} ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex items-center justify-between gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
          <Link to="/" aria-label="nreservi.online — accueil" onClick={() => setDrawerOpen(false)}>
            <BrandLogo className={`${collapsed ? 'lg:h-5' : 'h-6'} w-auto max-w-full`} />
          </Link>
          {/* close button — mobile drawer only */}
          <button
            type="button"
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 lg:hidden dark:hover:bg-stone-800"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`font-semibold text-stone-900 px-2 mt-4 truncate dark:text-stone-100 ${collapsed ? 'lg:hidden' : ''}`}>Espace professionnel</p>
        <p className={`text-xs text-stone-400 px-2 mb-4 truncate ${collapsed ? 'lg:hidden' : ''}`}>{session.name}</p>

        {navLinks()}

        <div className={`flex items-center gap-1 border-t border-stone-100 pt-3 dark:border-stone-800 ${collapsed ? 'flex-col lg:items-center' : 'justify-between'}`}>
          <LogoutButton />
          <ThemeToggle />
          {/* desktop collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 lg:inline-flex dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
            title={collapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* ---- Content column ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar with hamburger */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-stone-200 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-900/90">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 -ml-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <BrandLogo className="h-5 w-auto max-w-[55%] object-contain" />
          <ThemeToggle />
        </header>

        <main className="min-h-screen flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 lg:min-h-0">
          <Outlet />
        </main>
      </div>
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
      title="Déconnexion"
      className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 ${full ? 'mt-6 w-full justify-center border border-stone-200 dark:border-stone-700' : ''}`}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span className={full ? '' : 'truncate'}>Déconnexion</span>
    </button>
  )
}
