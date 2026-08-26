import { createFileRoute, Link, Outlet, redirect, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Building2,
  CreditCard,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  History,
  Plus,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react'
import { getSession, logout } from '../../server/auth.functions'
import { adminHasModule } from '../../server/admin.permissions'
import { ThemeToggle } from '../../components/ThemeToggle'
import { BrandLogo } from '../../components/BrandLogo'

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

const nav: { to: string; label: string; icon: typeof Building2; module?: string }[] = [
  { to: '/admin', label: 'Dashboard', icon: Building2 },
  { to: '/admin/onboard', label: 'Créer un restaurant', icon: Plus, module: 'onboard' },
  { to: '/admin/subscriptions', label: 'Abonnements', icon: CreditCard, module: 'subscriptions' },
  { to: '/admin/emails', label: 'E-mails', icon: Send, module: 'emails' },
  { to: '/admin/ads', label: 'Publicités', icon: Megaphone, module: 'ads' },
  { to: '/admin/mail', label: 'Serveur e-mail', icon: Mail, module: 'mail' },
  { to: '/admin/account', label: 'Compte', icon: ShieldCheck },
]

function AdminLayout() {
  const { session } = Route.useRouteContext() as {
    session: { name: string; email: string; adminRole: 'super' | 'admin'; permissions: string[] }
  }
  const visibleNav = nav.filter((item) => !item.module || adminHasModule(session, item.module))

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('nreservi-admin-sidebar') === 'collapsed',
  )
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => { setDrawerOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem('nreservi-admin-sidebar', c ? 'expanded' : 'collapsed')
      return !c
    })
  }

  const sidebarWidth = collapsed ? 'lg:w-[68px]' : 'lg:w-64'

  return (
    <div className="min-h-screen lg:flex">
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white p-4 transition-transform duration-200 ease-out dark:border-stone-800 dark:bg-stone-900
          lg:relative lg:z-auto lg:translate-x-0 lg:transition-[width,transform]
          ${sidebarWidth} ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex items-center justify-between gap-2 ${collapsed ? 'lg:justify-center' : ''}`}>
          <Link to="/" aria-label="nreservi.online — accueil" onClick={() => setDrawerOpen(false)}>
            <BrandLogo className={`${collapsed ? 'lg:h-5' : 'h-6'} w-auto max-w-full`} />
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 lg:hidden dark:hover:bg-stone-800"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`px-2 mt-4 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 ${collapsed ? 'lg:hidden' : ''}`}>
          Administration
        </p>
        <p className={`text-xs text-stone-400 px-2 mb-4 truncate ${collapsed ? 'lg:hidden' : ''}`}>{session.name}</p>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          {visibleNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setDrawerOpen(false)}
              activeOptions={{ exact: item.to === '/admin' }}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 ${collapsed ? 'lg:justify-center' : ''}`}
              activeProps={{
                className: `flex items-center gap-2 px-2 py-2 rounded-lg text-sm bg-lime-50 text-lime-800 font-medium dark:bg-lime-500/10 dark:text-lime-300 ${collapsed ? 'lg:justify-center' : ''}`,
              }}
              title={item.label}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={`flex items-center gap-1 border-t border-stone-100 pt-3 dark:border-stone-800 ${collapsed ? 'flex-col lg:items-center' : 'justify-between'}`}>
          <LogoutButton />
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 lg:inline-flex dark:hover:bg-stone-800 dark:hover:text-stone-200"
            aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
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
        window.location.href = '/admin/login'
      }}
      title="Déconnexion"
      className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 ${full ? 'mt-6 w-full justify-center border border-stone-200 dark:border-stone-700' : ''}`}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      <span className={full ? '' : 'truncate'}>Déconnexion</span>
    </button>
  )
}
