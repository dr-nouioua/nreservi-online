import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarCheck,
  Car,
  Check,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Scissors,
  Sparkles,
  Stethoscope,
  Users,
  UtensilsCrossed,
  X,
  Zap,
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

  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { href: '#fonctionnement', label: 'Comment ça marche' },
    { href: '#categories', label: 'Catégories' },
    { href: '#tarifs', label: 'Tarifs' },
    { href: '#contact', label: 'Contact' },
  ]

  const subscriptions = content.packages.filter((p) => p.kind !== 'ads')
  const adsPackages = content.packages.filter((p) => p.kind === 'ads')

  const categories = [
    { icon: UtensilsCrossed, label: 'Restaurants', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', desc: 'Menus, photos, réservation en temps réel' },
    { icon: Scissors, label: 'Salons de beauté', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-700 dark:text-pink-300', desc: 'Coiffure, manucure, soins — planifiez vos rendez-vous' },
    { icon: Sparkles, label: 'Spa & Bien-être', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', desc: 'Hammam, massage, gommage — détente à portée de main' },
    { icon: FootballIcon, label: 'Terrains de foot', color: 'from-lime-400 to-green-500', bg: 'bg-lime-50 dark:bg-lime-500/10', text: 'text-lime-700 dark:text-lime-300', desc: '5v5, 6v6, 7v7 — réservez votre créneau' },
    { icon: Car, label: 'Location de voitures', color: 'from-slate-400 to-gray-600', bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-700 dark:text-slate-300', desc: 'Berline, SUV, utilitaire — louez en quelques clics' },
    { icon: Stethoscope, label: 'Médecins', color: 'from-[#069494] to-cyan-600', bg: 'bg-teal-50 dark:bg-[#069494]/10', text: 'text-[#069494] dark:text-teal-300', desc: 'Consultations, spécialistes — prenez rendez-vous facilement' },
  ]

  const steps = [
    { icon: MapPin, title: 'Trouvez', desc: 'Recherchez par ville, catégorie ou nom — trouvez l\'établissement qu\'il vous faut.' },
    { icon: CalendarCheck, title: 'Réservez', desc: 'Choisissez vos dates, créneaux ou véhicule. Confirmation en quelques secondes.' },
    { icon: Zap, title: 'Recevez', desc: 'Confirmation WhatsApp instantanée. Gérez vos réservations à tout moment.' },
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* ---- Navigation ---- */}
      <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-white/80 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandLogo className="h-6 w-auto" />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200">{l.label}</a>
            ))}
            <Link to="/" className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
              Explorer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 md:hidden">
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900 md:hidden">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">{l.label}</a>
            ))}
            <Link to="/" className="mt-2 block rounded-lg px-3 py-2.5 text-sm font-medium text-lime-700 hover:bg-lime-50 dark:text-lime-300 dark:hover:bg-lime-500/10">Explorer les établissements →</Link>
          </nav>
        )}
      </header>

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 text-center sm:px-6 sm:pt-28 sm:pb-32">
          {hero.badge && (
            <p className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-4 py-1.5 text-xs font-medium text-lime-300 backdrop-blur">
              {hero.badge}
            </p>
          )}
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {(hero.title ?? 'Réservez, planifiez, louez — tout en un seul endroit').split('—').map((part: string, i: number) =>
              i === 1 ? <span key={i}>— <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">{part.trim()}</span></span> : part
            )}
          </h1>
          {hero.subtitle && (
            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-400 sm:text-xl">{hero.subtitle}</p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-7 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-lime-400 shadow-lg shadow-lime-500/25">
              Explorer les établissements <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Devenir partenaire
            </a>
          </div>
          {/* Stats bar */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:mt-20">
            {[
              { n: '6+', label: 'Catégories' },
              { n: '24h', label: 'Confirmation WhatsApp' },
              { n: '100%', label: 'Gratuit pour les clients' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.n}</p>
                <p className="mt-1 text-xs text-stone-400 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="fonctionnement" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-lime-600 dark:text-lime-400">Simple et rapide</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">Comment ça marche ?</h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {i < steps.length - 1 && <div className="absolute left-1/2 top-10 hidden h-px w-full bg-gradient-to-r from-transparent via-stone-200 to-transparent sm:block dark:via-stone-700" />}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 shadow-lg shadow-lime-500/25">
                  <step.icon className="h-9 w-9 text-white" />
                </div>
                <p className="mt-6 text-lg font-bold text-stone-900 dark:text-white">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Categories ---- */}
      <section id="categories" className="scroll-mt-20 bg-white py-20 dark:bg-stone-900/40 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-lime-600 dark:text-lime-400">Toutes les activités</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">Une plateforme, six univers</h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.label} className={`group relative overflow-hidden rounded-2xl border border-stone-200 p-6 transition hover:shadow-lg dark:border-stone-800 ${cat.bg}`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-md`}>
                  <cat.icon className="h-6 w-6 text-white" />
                </div>
                <p className={`mt-4 text-lg font-bold ${cat.text}`}>{cat.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- About ---- */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-lime-600 dark:text-lime-400">Notre mission</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">À propos de nreservi</h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            {content.about}
          </p>
        </div>
      </section>

      {/* ---- Solutions ---- */}
      <section className="bg-white py-20 dark:bg-stone-900/40 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">Une solution pour chacun</h2>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-8 dark:border-stone-800 dark:from-stone-950 dark:to-stone-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 dark:bg-lime-500/15">
                <UtensilsCrossed className="h-6 w-6 text-lime-700 dark:text-lime-300" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-stone-900 dark:text-white">Pour les professionnels</h3>
              <ul className="mt-5 space-y-3 text-sm text-stone-600 dark:text-stone-400">
                {(s.solutions?.professionals?.items ?? [
                  "Page publique avec menu/photos/catalogue",
                  "Réservation en temps réel (tables, créneaux, véhicules)",
                  "Confirmation et rappels par WhatsApp",
                  "Tableau de bord multi-jours avec statistiques",
                  "Campagnes marketing ciblées",
                  "Gestion du menu, des stocks, des prix",
                ]).map((f: string) => (
                  <li key={f} className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-8 dark:border-stone-800 dark:from-stone-950 dark:to-stone-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-200 dark:bg-stone-800">
                <Users className="h-6 w-6 text-stone-600 dark:text-stone-300" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-stone-900 dark:text-white">Pour les clients</h3>
              <ul className="mt-5 space-y-3 text-sm text-stone-600 dark:text-stone-400">
                {(s.solutions?.clients?.items ?? [
                  "Recherche par ville, catégorie et type",
                  "Réservation en quelques secondes, sans compte",
                  "Confirmation immédiate par WhatsApp",
                  "Gestion de ses réservations à tout moment",
                  "Tous les services : restaurant, soins, sport, voiture",
                ]).map((f: string) => (
                  <li key={f} className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" /> {f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section id="tarifs" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-lime-600 dark:text-lime-400">Tarifs</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">Un abonnement, tout inclus</h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-stone-500 dark:text-stone-400">Adapté à toutes les catégories : restaurants, salons, spas, terrains de foot, locations de voitures, médecins.</p>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            {subscriptions.map((p) => (
              <div
                key={p.name}
                className={`relative overflow-hidden rounded-2xl border-2 p-8 transition ${
                  p.popular
                    ? 'border-lime-400 bg-gradient-to-br from-lime-50 to-white shadow-xl shadow-lime-500/10 dark:border-lime-500/50 dark:from-lime-500/5 dark:to-stone-900/40'
                    : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/40'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-0.5 right-6 rounded-b-lg bg-lime-400 px-4 py-1.5 text-xs font-bold text-stone-950 shadow-sm">Populaire</span>
                )}
                <p className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">{p.name}</p>
                <p className="mt-4">
                  <span className="text-5xl font-extrabold text-stone-900 dark:text-white">{p.price}</span>
                </p>
                {p.period && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-800 dark:bg-lime-500/15 dark:text-lime-300">{p.period}</p>
                )}
                <ul className="mt-7 space-y-3 text-sm text-stone-600 dark:text-stone-400">
                  {(p.features ?? []).map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-500/15"><Check className="h-3 w-3 text-lime-600 dark:text-lime-400" /></div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition ${
                    p.popular
                      ? 'bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-100'
                      : 'border border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800'
                  }`}
                >
                  Commencer <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>

          {adsPackages.length > 0 && (
            <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="text-center">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white">Pour les marques & annonceurs</h3>
                <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Visibilité ciblée auprès de la clientèle de vos établissements partenaires.</p>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {adsPackages.map((p) => (
                  <div key={p.name} className="rounded-xl border border-stone-200 p-5 dark:border-stone-800">
                    <p className="font-semibold text-stone-900 dark:text-white">{p.name}</p>
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
        </div>
      </section>

      {/* ---- Contact ---- */}
      <section id="contact" className="scroll-mt-20 bg-white py-20 dark:bg-stone-900/40 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-lime-600 dark:text-lime-400">Contact</p>
          <h2 className="mt-3 text-3xl font-bold text-stone-900 dark:text-white sm:text-4xl">Parlons de votre projet</h2>
          <p className="mt-4 text-stone-500 dark:text-stone-400">
            Une question, une démonstration, un partenariat ? Écrivez-nous ou appelez-nous directement.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {content.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="group rounded-2xl border border-stone-200 p-7 transition hover:border-lime-400 hover:shadow-lg hover:shadow-lime-500/5 dark:border-stone-800 dark:hover:border-lime-500/50"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 transition group-hover:bg-lime-200 dark:bg-lime-500/15 dark:group-hover:bg-lime-500/25">
                  <Mail className="h-5 w-5 text-lime-700 dark:text-lime-300" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-wide text-stone-400">E-mail</p>
                <p className="mt-1 font-medium text-stone-900 break-all dark:text-white">{content.contactEmail}</p>
              </a>
            )}
            {content.contactPhone && (
              <a
                href={`tel:${content.contactPhone.replace(/\s/g, '')}`}
                className="group rounded-2xl border border-stone-200 p-7 transition hover:border-lime-400 hover:shadow-lg hover:shadow-lime-500/5 dark:border-stone-800 dark:hover:border-lime-500/50"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 transition group-hover:bg-lime-200 dark:bg-lime-500/15 dark:group-hover:bg-lime-500/25">
                  <Phone className="h-5 w-5 text-lime-700 dark:text-lime-300" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-wide text-stone-400">Téléphone</p>
                <p className="mt-1 font-medium text-stone-900 dark:text-white">{content.contactPhone}</p>
              </a>
            )}
          </div>
          {!content.contactEmail && !content.contactPhone && (
            <p className="text-sm text-stone-400">Coordonnées bientôt disponibles.</p>
          )}
        </div>
      </section>

      {/* ---- CTA Banner ---- */}
      <section className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Prêt à rejoindre nreservi ?</h2>
          <p className="mt-4 text-stone-400">Créez votre page en quelques minutes et commencez à recevoir des réservations.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-7 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-lime-400 shadow-lg shadow-lime-500/25">
              Explorer les établissements <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-stone-200 bg-white py-10 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
          <BrandLogo className="h-6 w-auto" />
          <p className="text-xs text-stone-500 dark:text-stone-400">
            © {new Date().getFullYear()} nreservi.online — Tous droits réservés.{' '}
            <Link to="/terms" className="underline hover:text-stone-800 dark:hover:text-stone-200">Conditions générales</Link>
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-xs text-stone-400">
            <Link to="/" className="hover:text-stone-600 dark:hover:text-stone-300">Explorer</Link>
            <Link to="/owner/login" className="hover:text-stone-600 dark:hover:text-stone-300">Espace professionnel</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
