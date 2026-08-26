import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Baby,
  BarChart3,
  Car,
  Check,
  Clock,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { getSiteContent } from '../server/admin.functions'
import { BrandLogo } from '../components/BrandLogo'
import { ThemeToggle } from '../components/ThemeToggle'

export const Route = createFileRoute('/about')({
  loader: () => getSiteContent(),
  component: LandingPage,
})

type Package = {
  name: string
  price: string
  period?: string
  features?: string[]
  kind?: string
  popular?: boolean
}

function LandingPage() {
  const content = Route.useLoaderData() as {
    about: string
    contactEmail: string
    contactPhone: string
    packages: Package[]
  }

  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { href: '#apropos', label: 'À propos' },
    { href: '#solutions', label: 'Solutions' },
    { href: '#tarifs', label: 'Tarifs' },
    { href: '#contact', label: 'Contact' },
  ]

  const subscriptions = content.packages.filter((p) => p.kind !== 'ads')
  const adsPackages = content.packages.filter((p) => p.kind === 'ads')

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* ---- Top bar + hamburger ---- */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandLogo className="h-6 w-auto" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} Menu
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                {l.label}
              </a>
            ))}
            <Link to="/" className="mt-2 block rounded-lg px-3 py-2.5 text-sm font-medium text-lime-700 hover:bg-lime-50 dark:text-lime-300 dark:hover:bg-lime-500/10">
              Réserver une table →
            </Link>
          </nav>
        )}
      </header>

      {/* ---- Hero ---- */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-16 text-center sm:px-6">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-800 dark:bg-lime-500/15 dark:text-lime-300">
          🇩🇿 Solution 100 % algérienne
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          La réservation de table en ligne, <span className="text-lime-600 dark:text-lime-400">simple et accessible</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
          nreservi.online connecte les restaurants et leurs clients : disponibilités en temps réel,
          confirmation par WhatsApp et gestion complète pour les professionnels.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            Réserver une table <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Devenir partenaire
          </a>
        </div>
      </section>

      {/* ---- À propos ---- */}
      <section id="apropos" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">À propos</h2>
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-stone-600 dark:text-stone-400">
          {content.about}
        </p>
      </section>

      {/* ---- Solutions ---- */}
      <section id="solutions" className="scroll-mt-20 bg-white py-16 dark:bg-stone-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Solutions</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-7 dark:border-stone-800 dark:bg-stone-950/40">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-lime-100 dark:bg-lime-500/15">
                <UtensilsCrossed className="h-5 w-5 text-lime-700 dark:text-lime-300" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">Pour les restaurants</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-600 dark:text-stone-400">
                {[
                  'Page publique avec menu et photos',
                  'Module de réservation en temps réel',
                  'Confirmation et rappels par WhatsApp',
                  'Plan de salle et statistiques',
                  'Campagnes marketing ciblées',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-7 dark:border-stone-800 dark:bg-stone-950/40">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-stone-200 dark:bg-stone-800">
                <Users className="h-5 w-5 text-stone-600 dark:text-stone-300" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">Pour les clients</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-stone-600 dark:text-stone-400">
                {[
                  'Recherche par ville et type de cuisine',
                  'Réservation en quelques secondes, sans compte',
                  'Confirmation immédiate par WhatsApp',
                  'Gestion de ses réservations à tout moment',
                  'Options : chaises bébé, demandes spéciales',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Tarifs ---- */}
      <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Tarifs</h2>
        <p className="mt-3 text-center text-stone-600 dark:text-stone-400">Des formules simples pour chaque établissement — et des emplacements publicitaires pour les marques.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {subscriptions.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-7 ${
                p.popular
                  ? 'border-lime-400 bg-lime-50/60 shadow-lg dark:border-lime-500/50 dark:bg-lime-500/5'
                  : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/40'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-stone-950">Populaire</span>
              )}
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">{p.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold text-stone-900 dark:text-stone-100">{p.price}</span>
                {p.period && <span className="ml-1.5 text-sm text-stone-500 dark:text-stone-400">{p.period}</span>}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-stone-600 dark:text-stone-400">
                {(p.features ?? []).map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {adsPackages.length > 0 && (
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-7 dark:border-stone-800 dark:bg-stone-900/40">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Pour les marques & annonceurs</h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {adsPackages.map((p) => (
                <div key={p.name}>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">{p.name}</p>
                  <p className="mt-1 text-2xl font-bold text-lime-600 dark:text-lime-400">
                    {p.price} {p.period && <span className="text-sm font-normal text-stone-500 dark:text-stone-400">{p.period}</span>}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-400">
                    {(p.features ?? []).map((f) => (
                      <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <a href="#contact" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-lime-700 hover:underline dark:text-lime-300">
              Discuter d'une campagne <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </section>

      {/* ---- Contact ---- */}
      <section id="contact" className="scroll-mt-20 bg-white py-16 dark:bg-stone-900/40">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Contact</h2>
          <p className="mt-3 text-stone-600 dark:text-stone-400">
            Une question, une démonstration, un partenariat ? Écrivez-nous ou appelez-nous directement.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {content.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="rounded-xl border border-stone-200 p-6 transition hover:border-lime-400 dark:border-stone-800 dark:hover:border-lime-500/50"
              >
                <Mail className="mx-auto h-6 w-6 text-lime-600 dark:text-lime-400" />
                <p className="mt-3 text-xs uppercase tracking-wide text-stone-400">E-mail</p>
                <p className="mt-1 font-medium text-stone-900 dark:text-stone-100 break-all">{content.contactEmail}</p>
              </a>
            )}
            {content.contactPhone && (
              <a
                href={`tel:${content.contactPhone.replace(/\s/g, '')}`}
                className="rounded-xl border border-stone-200 p-6 transition hover:border-lime-400 dark:border-stone-800 dark:hover:border-lime-500/50"
              >
                <Phone className="mx-auto h-6 w-6 text-lime-600 dark:text-lime-400" />
                <p className="mt-3 text-xs uppercase tracking-wide text-stone-400">Téléphone</p>
                <p className="mt-1 font-medium text-stone-900 dark:text-stone-100">{content.contactPhone}</p>
              </a>
            )}
          </div>
          {!content.contactEmail && !content.contactPhone && (
            <p className="text-sm text-stone-400">Coordonnées bientôt disponibles.</p>
          )}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <BrandLogo className="h-6 w-auto" />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            © {new Date().getFullYear()} nreservi.online — Tous droits réservés.{' '}
            <Link to="/terms" className="underline hover:text-stone-800 dark:hover:text-stone-200">Conditions générales</Link>
          </p>
          <div className="flex gap-4 text-xs text-stone-400">
            <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300">Réserver une table</Link>
            <Link to="/owner/login" className="hover:text-stone-600 dark:hover:text-stone-300">Espace professionnel</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
