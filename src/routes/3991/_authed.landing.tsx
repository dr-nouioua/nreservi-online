import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Save, Trash2, Eye, EyeOff } from 'lucide-react'
import { getSiteContent, saveSiteContent } from '../../server/admin.functions'

export const Route = createFileRoute('/3991/_authed/landing')({
  beforeLoad: ({ context }) => {
    const { session } = context as { session: { adminRole: 'super' | 'admin' } }
    if (session.adminRole !== 'super') throw redirect({ to: '/3991' })
  },
  loader: () => getSiteContent(),
  component: LandingEditorPage,
})

type PackageRow = { name: string; price: string; period?: string; features: string[]; kind: string; popular?: boolean }
type SectionState = Record<string, any>

function LandingEditorPage() {
  const initial = Route.useLoaderData() as {
    about: string
    contactEmail: string
    contactPhone: string
    packages: PackageRow[]
    sections: SectionState
  }

  const [about, setAbout] = useState(initial.about)
  const [contactEmail, setContactEmail] = useState(initial.contactEmail)
  const [contactPhone, setContactPhone] = useState(initial.contactPhone)
  const [packages, setPackages] = useState<PackageRow[]>(
    (initial.packages as PackageRow[]).map((p) => ({ ...p, features: p.features ?? [] })),
  )
  const [sections, setSections] = useState<SectionState>(initial.sections)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function updateSection(path: string, value: any) {
    setSections((prev) => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj: any = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = obj[keys[i]] ?? {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  function getVisible(path: string): boolean {
    return path.split('.').reduce((o: any, k) => o?.[k], sections)?.visible ?? false
  }

  function toggleVisible(path: string) {
    updateSection(path + '.visible', !getVisible(path))
  }

  function updateSolutionItem(section: 'professionals' | 'clients', index: number, value: string) {
    const items = [...(sections.solutions?.[section]?.items ?? [])]
    items[index] = value
    updateSection(`solutions.${section}.items`, items)
  }

  function addSolutionItem(section: 'professionals' | 'clients') {
    const items = [...(sections.solutions?.[section]?.items ?? []), '']
    updateSection(`solutions.${section}.items`, items)
  }

  function removeSolutionItem(section: 'professionals' | 'clients', index: number) {
    const items = (sections.solutions?.[section]?.items ?? []).filter((_: string, i: number) => i !== index)
    updateSection(`solutions.${section}.items`, items)
  }

  function updatePackage(i: number, patch: Partial<PackageRow>) {
    setPackages(packages.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await saveSiteContent({
      data: { about, contactEmail, contactPhone, packages, sections },
    })
    setSaving(false)
    if ('error' in result && result.error) {
      setMessage(result.error)
      return
    }
    setMessage('Page de présentation mise à jour.')
  }

  function Toggle({ label, path }: { label: string; path: string }) {
    const vis = getVisible(path)
    return (
      <button
        type="button"
        onClick={() => toggleVisible(path)}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          vis
            ? 'bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300'
            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
        }`}
      >
        {vis ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {label}
      </button>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Page de présentation</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Contenu public de <a href="/about" target="_blank" className="underline">/about</a> : activez/désactivez les sections et éditez le contenu.
        </p>
      </div>

      <form onSubmit={save} className="space-y-6">

        {/* ---- Hero ---- */}
        <Card
          title="Hero"
          toggle={<Toggle label={getVisible('hero') ? 'Visible' : 'Masqué'} path="hero" />}
        >
          <Field label="Badge" value={sections.hero?.badge ?? ''} onChange={(v: string) => updateSection('hero.badge', v)} />
          <Field label="Titre" value={sections.hero?.title ?? ''} onChange={(v: string) => updateSection('hero.title', v)} />
          <Field label="Sous-titre" value={sections.hero?.subtitle ?? ''} onChange={(v: string) => updateSection('hero.subtitle', v)} />
        </Card>

        {/* ---- Catégories ---- */}
        <Card
          title="Catégories"
          toggle={<Toggle label={getVisible('categories') ? 'Visible' : 'Masqué'} path="categories" />}
        >
          <p className="text-xs text-stone-400">Affiche la grille de catégories (Restaurants, Salons, Spa, Foot, Voitures).</p>
        </Card>

        {/* ---- À propos ---- */}
        <Card
          title="À propos"
          toggle={<Toggle label={getVisible('about') ? 'Visible' : 'Masqué'} path="about" />}
        >
          <textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
        </Card>

        {/* ---- Solutions ---- */}
        <Card
          title="Solutions"
          toggle={<Toggle label={getVisible('solutions') ? 'Visible' : 'Masqué'} path="solutions" />}
        >
          <p className="text-xs text-stone-400 mb-3">Trois colonnes modifiables. Chacune peut être activée indépendamment.</p>
          {(['professionals', 'clients'] as const).map((key) => (
            <div key={key} className="rounded-lg border border-stone-200 p-4 space-y-2 dark:border-stone-800">
              <div className="flex flex-wrap items-center gap-2">
                <Toggle label={sections.solutions?.[key]?.visible !== false ? 'On' : 'Off'} path={`solutions.${key}`} />
                <input
                  value={sections.solutions?.[key]?.title ?? ''}
                  onChange={(e) => updateSection(`solutions.${key}.title`, e.target.value)}
                  placeholder={`Titre ${key}`}
                  className="flex-1 min-w-[150px] rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700"
                />
              </div>
              {(sections.solutions?.[key]?.items ?? []).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateSolutionItem(key, i, e.target.value)}
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700"
                  />
                  <button type="button" onClick={() => removeSolutionItem(key, i)} className="rounded-md p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addSolutionItem(key)} className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
                <Plus className="h-3 w-3" /> Ajouter
              </button>
            </div>
          ))}
        </Card>

        {/* ---- Tarifs ---- */}
        <Card
          title="Tarifs"
          toggle={<Toggle label={getVisible('tarifs') ? 'Visible' : 'Masqué'} path="tarifs" />}
        >
          <p className="text-xs text-stone-400">Abonnements établissements + publicités marques. Les formules sont affichées sur <a href="/about#tarifs" target="_blank" className="underline">/about</a>.</p>
        </Card>

        {/* ---- Contact ---- */}
        <Card
          title="Contact"
          toggle={<Toggle label={getVisible('contact') ? 'Visible' : 'Masqué'} path="contact" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400">E-mail public</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="contact@nreservi.online" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Téléphone public</label>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+213 555 00 00 00" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700" />
            </div>
          </div>
        </Card>

        {/* ---- Abonnements ---- */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Abonnements établissements</p>
            <button
              type="button"
              onClick={() => setPackages([...packages, { name: '', price: '', period: '', features: [], kind: 'subscription', popular: false }])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter
            </button>
          </div>
          <p className="text-xs text-stone-400">Formules valables pour toutes les catégories : restaurants, salons, spas, terrains de foot, locations de voitures, médecins. Le bouton "Populaire" met en surbrillance la carte sur /about.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {packages.filter((p) => p.kind === 'subscription').map((p, idx) => {
              const realIdx = packages.indexOf(p)
              return (
                <div key={realIdx} className={`rounded-xl border-2 p-5 space-y-3 transition ${p.popular ? 'border-lime-400 bg-lime-50/50 dark:border-lime-500/50 dark:bg-lime-500/5' : 'border-stone-200 dark:border-stone-800'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      value={p.name}
                      onChange={(e) => updatePackage(realIdx, { name: e.target.value })}
                      placeholder="Ex. 6 mois"
                      className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold dark:border-stone-700"
                    />
                    <button type="button" onClick={() => setPackages(packages.filter((_, i) => i !== realIdx))} className="rounded-md p-1 text-stone-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Prix</label>
                      <input value={p.price} onChange={(e) => updatePackage(realIdx, { price: e.target.value })} placeholder="15 000 DA" className="mt-0.5 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm dark:border-stone-700" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Période</label>
                      <input value={p.period ?? ''} onChange={(e) => updatePackage(realIdx, { period: e.target.value })} placeholder="6 mois + 1 offert" className="mt-0.5 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-sm dark:border-stone-700" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Avantages (un par ligne)</label>
                    <textarea
                      rows={3}
                      value={(p.features ?? []).join('\n')}
                      onChange={(e) => updatePackage(realIdx, { features: e.target.value.split('\n').filter(Boolean) })}
                      className="mt-0.5 w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs dark:border-stone-700"
                    />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                    <input type="checkbox" checked={Boolean(p.popular)} onChange={(e) => updatePackage(realIdx, { popular: e.target.checked })} className="accent-lime-500" />
                    Populaire (mis en avant sur /about)
                  </label>
                </div>
              )
            })}
          </div>
        </div>

        {/* ---- Publicités ---- */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Publicités (marques & annonceurs)</p>
            <button
              type="button"
              onClick={() => setPackages([...packages, { name: '', price: '', period: 'par mois', features: [], kind: 'ads', popular: false }])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter
            </button>
          </div>
          {packages.filter((p) => p.kind === 'ads').length === 0 && (
            <p className="text-xs text-stone-400 italic">Aucune formule publicitaire. Cliquez "Ajouter" pour en créer une.</p>
          )}
          {packages.filter((p) => p.kind === 'ads').map((p) => {
            const realIdx = packages.indexOf(p)
            return (
              <div key={realIdx} className="rounded-lg border border-stone-200 p-4 space-y-2.5 dark:border-stone-800">
                <div className="flex items-center justify-between gap-2">
                  <input value={p.name} onChange={(e) => updatePackage(realIdx, { name: e.target.value })} placeholder="Nom de la publicité" className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700" />
                  <button type="button" onClick={() => setPackages(packages.filter((_, i) => i !== realIdx))} className="rounded-md p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={p.price} onChange={(e) => updatePackage(realIdx, { price: e.target.value })} placeholder="Prix (ex. 5 000 DA+)" className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700" />
                  <input value={p.period ?? ''} onChange={(e) => updatePackage(realIdx, { period: e.target.value })} placeholder="par mois" className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-700" />
                </div>
                <textarea
                  rows={2}
                  value={(p.features ?? []).join('\n')}
                  onChange={(e) => updatePackage(realIdx, { features: e.target.value.split('\n').filter(Boolean) })}
                  placeholder="Avantages (un par ligne)"
                  className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs dark:border-stone-700"
                />
              </div>
            )
          })}
        </div>

        {message && (
          <p className={`text-sm ${message === 'Page de présentation mise à jour.' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{message}</p>
        )}
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
          <Save className="h-4 w-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}

function Card({ title, toggle, children }: { title: string; toggle: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-stone-900 dark:text-stone-100">{title}</p>
        {toggle}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
    </div>
  )
}
