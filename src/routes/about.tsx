import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Car,
  Check,
  Mail,
  Menu,
  Phone,
  Scissors,
  Sparkles,
  Stethoscope,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { getSiteContent } from '../server/admin.functions'
import { BrandLogo } from '../components/BrandLogo'

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

function FootballIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7l2.5 1.5v3L12 13l-2.5-1.5v-3z" />
      <path d="M12 7V2" />
      <path d="M14.5 8.5l4-2.5" />
      <path d="M14.5 11.5l4 2.5" />
      <path d="M12 13v5" />
      <path d="M9.5 11.5l-4 2.5" />
      <path d="M9.5 8.5l-4-2.5" />
    </svg>
  )
}

function LandingPage() {
  const content = Route.useLoaderData() as {
    about: string
    contactEmail: string
    contactPhone: string
    packages: Package[]
    sections: any
  }

  const s = content.sections ?? {}
  const hero = s.hero ?? {}
  const sol = s.solutions ?? {}
  const prof = sol.professionals ?? {}
  const cli = sol.clients ?? {}

  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    s.about?.visible !== false && { href: '#apropos', label: 'À propos' },
    s.solutions?.visible !== false && { href: '#solutions', label: 'Solutions' },
    s.tarifs?.visible !== false && { href: '#tarifs', label: 'Tarifs' },
    s.contact?.visible !== false && { href: '#contact', label: 'Contact' },
  ].filter(Boolean) as { href: string; label: string }[]

  const subscriptions = content.packages.filter((p) => p.kind !== 'ads')
  const adsPackages = content.packages.filter((p) => p.kind === 'ads')

  const categories = [
    { icon: UtensilsCrossed, label: 'Restaurants', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', desc: 'Menus, photos, réservation en temps réel' },
    { icon: Scissors, label: 'Salons de beauté', color: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300', desc: 'Coiffure, manucure, soins — planifiez vos rendez-vous' },
    { icon: Sparkles, label: 'Spa & Bien-être', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', desc: 'Hammam, massage, gommage — détente à portée de main' },
    { icon: FootballIcon, label: 'Terrains de foot', color: 'bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300', desc: '5v5, 6v5, 7v7 — réservez votre créneau' },
    { icon: Car, label: 'Location de voitures', color: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300', desc: 'Berline, SUV, utilitaire — louez en quelques clics' },
    { icon: Stethoscope, label: 'Médecins', color: 'bg-[#069494]/10 text-[#069494] dark:bg-[#069494]/15 dark:text-teal-300', desc: 'Consultations, spécialistes — prenez rendez-vous facilement' },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* ---- Top bar + hamburger ---- */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandLogo className="h-6 w-auto" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} Menu
          </button>
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
              Explorer les établissements →
            </Link>
          </nav>
        )}
      </header>

      {/* ---- Hero ---- */}
      {hero.visible !== false && (
        <section className="mx-auto max-w-6xl px-4 pt-14 pb-16 text-center sm:px-6">
          {hero.badge && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-800 dark:bg-lime-500/15 dark:text-lime-300">
              {hero.badge}
            </p>
          )}
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
            {(hero.title ?? 'Réservez, planifiez, louez — tout en un seul endroit').split('—').map((part: string, i: number) =>
              i === 1 ? <span key={i}>— <span className="text-lime-600 dark:text-lime-400">{part.trim()}</span></span> : part
            )}
          </h1>
          {hero.subtitle && (
            <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              {hero.subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
            >
              Explorer les établissements <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Devenir partenaire
            </a>
          </div>
        </section>
      )}

      {/* ---- Catégories ---- */}
      {s.categories?.visible !== false && (
        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/40">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cat.color}`}>
                  <cat.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{cat.label}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-tight">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- À propos ---- */}
      {s.about?.visible !== false && (
        <section id="apropos" className="mx-auto max-w-4xl scroll-mt-20 px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">À propos</h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            {content.about}
          </p>
        </section>
      )}

      {/* ---- Solutions ---- */}
      {s.solutions?.visible !== false && (
        <section id="solutions" className="scroll-mt-20 bg-white py-16 dark:bg-stone-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Solutions</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {prof.visible !== false && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-7 dark:border-stone-800 dark:bg-stone-950/40">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-lime-100 dark:bg-lime-500/15">
                    <UtensilsCrossed className="h-5 w-5 text-lime-700 dark:text-lime-300" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">{prof.title || 'Pour les professionnels'}</h3>
                  <ul className="mt-4 space-y-2.5 text-sm text-stone-600 dark:text-stone-400">
                    {(prof.items ?? []).map((f: string) => (
                      <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                    ))}
                  </ul>
                </div>
              )}
              {cli.visible !== false && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-7 dark:border-stone-800 dark:bg-stone-950/40">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-stone-200 dark:bg-stone-800">
                    <Users className="h-5 w-5 text-stone-600 dark:text-stone-300" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">{cli.title || 'Pour les clients'}</h3>
                  <ul className="mt-4 space-y-2.5 text-sm text-stone-600 dark:text-stone-400">
                    {(cli.items ?? []).map((f: string) => (
                      <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
          </div>
        </section>
      )}

      {/* ---- Tarifs ---- */}
      {s.tarifs?.visible !== false && (
        <section id="tarifs" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Tarifs</h2>
          <p className="mt-3 text-center text-stone-600 dark:text-stone-400">Un abonnement unique, adapté à toutes les catégories : restaurants, salons, spas, terrains de foot, locations de voitures, médecins.</p>

          {/* Subscription cards */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {subscriptions.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border-2 p-8 text-center transition ${
                  p.popular
                    ? 'border-lime-400 bg-lime-50/60 shadow-xl dark:border-lime-500/50 dark:bg-lime-500/5'
                    : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/40'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-4 py-1 text-xs font-bold text-stone-950 shadow-sm">
                    Recommandé
                  </span>
                )}
                <p className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">{p.name}</p>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-stone-900 dark:text-stone-100">{p.price}</span>
                </p>
                {p.period && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-800 dark:bg-lime-500/15 dark:text-lime-300">
                    {p.period}
                  </p>
                )}
                <ul className="mt-6 space-y-3 text-sm text-stone-600 dark:text-stone-400 text-left">
                  {(p.features ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition ${
                    p.popular
                      ? 'bg-stone-950 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                      : 'border border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  Commencer
                </a>
              </div>
            ))}
          </div>

          {/* Ads section */}
          {adsPackages.length > 0 && (
            <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="text-center">
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Pour les marques & annonceurs</h3>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Visibilité ciblée auprès de la clientèle de vos établissements partenaires.</p>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {adsPackages.map((p) => (
                  <div key={p.name} className="rounded-xl border border-stone-200 p-5 dark:border-stone-800">
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
              <div className="mt-6 text-center">
                <a href="#contact" className="inline-flex items-center gap-2 text-sm font-medium text-lime-700 hover:underline dark:text-lime-300">
                  Discuter d'une campagne <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ---- Contact ---- */}
      {s.contact?.visible !== false && (
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
      )}

      {/* ---- Footer ---- */}
      <footer className="border-t border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <BrandLogo className="h-6 w-auto" />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            © {new Date().getFullYear()} nreservi.online — Tous droits réservés.{' '}
            <Link to="/terms" className="underline hover:text-stone-800 dark:hover:text-stone-200">Conditions générales</Link>
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-stone-400">
            <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300">Explorer</Link>
            <Link to="/owner/login" className="hover:text-stone-600 dark:hover:text-stone-300">Espace professionnel</Link>
            <Link to="/3991/login" className="hover:text-stone-600 dark:hover:text-stone-300">Administration</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
