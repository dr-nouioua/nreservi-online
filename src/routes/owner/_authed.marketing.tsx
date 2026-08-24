import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Crown, Megaphone, MessageCircle, Plus, Trash2, Users } from 'lucide-react'
import {
  createCampaign,
  listCampaigns,
  deleteCampaign,
  getCampaignAudience,
  markCampaignRecipientPrepared,
} from '../../server/owner.functions'
import { whatsappService } from '../../services/whatsapp'

export const Route = createFileRoute('/owner/_authed/marketing')({
  loader: async () => {
    try {
      return { premium: true as const, campaigns: await listCampaigns() }
    } catch (e) {
      if ((e as Error & { code?: string }).code === 'PREMIUM_ONLY') return { premium: false as const, campaigns: [] }
      throw e
    }
  },
  component: MarketingPage,
})

type Campaign = Awaited<ReturnType<typeof listCampaigns>>[number]

type Recipient = {
  id: number
  name: string | null
  phone: string
  lastVisit: string | null
  visits: number
  message: string
}

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'Tous les clients' },
  { value: 'recent', label: 'Clients récents (30 derniers jours)' },
  { value: 'regular', label: 'Clients fidèles (3 réservations et +)' },
  { value: 'lapsed', label: 'Clients inactifs (60 jours et +)' },
]

const VARIABLES = ['{{customer_name}}', '{{restaurant_name}}', '{{last_reservation_date}}']

function MarketingPage() {
  const loader = Route.useLoaderData()
  return loader.premium ? <CampaignWorkspace initialCampaigns={loader.campaigns} /> : <PremiumUpsell />
}

function CampaignWorkspace({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [form, setForm] = useState({ name: '', body: '', audience: 'all' })
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [openCampaignId, setOpenCampaignId] = useState<number | null>(null)
  const [audience, setAudience] = useState<{ campaignName: string; audienceLabel: string; recipients: Recipient[] } | null>(null)
  const [loadingAudience, setLoadingAudience] = useState(false)

  async function refresh() {
    setCampaigns(await listCampaigns())
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    const result = await createCampaign({ data: form })
    if ('error' in result && result.error) {
      setFormMessage(result.error)
      return
    }
    setForm({ name: '', body: '', audience: 'all' })
    setFormMessage('Campagne créée.')
    refresh()
  }

  async function remove(id: number) {
    if (!window.confirm('Supprimer cette campagne et son historique ?')) return
    await deleteCampaign({ data: { id } })
    if (openCampaignId === id) { setOpenCampaignId(null); setAudience(null) }
    refresh()
  }

  async function openAudience(id: number) {
    if (openCampaignId === id) { setOpenCampaignId(null); setAudience(null); return }
    setLoadingAudience(true)
    try {
      const data = await getCampaignAudience({ data: { campaignId: id } })
      setAudience({ campaignName: data.campaign.name, audienceLabel: data.audienceLabel, recipients: data.recipients })
      setOpenCampaignId(id)
    } finally {
      setLoadingAudience(false)
    }
  }

  async function openWhatsApp(campaignId: number, recipient: Recipient) {
    const link = whatsappService.generateWhatsAppLink({ phone: recipient.phone, message: recipient.message })
    if (!link.ok) { alert(link.error); return }
    await markCampaignRecipientPrepared({ data: { campaignId, customerId: recipient.id } })
    window.open(link.url, '_blank', 'noopener')
    refresh()
    if (openCampaignId !== null) {
      const data = await getCampaignAudience({ data: { campaignId: openCampaignId } })
      setAudience({ campaignName: data.campaign.name, audienceLabel: data.audienceLabel, recipients: data.recipients })
    }
  }

  function insertVariable(v: string) {
    setForm((f) => ({ ...f, body: f.body + (f.body.endsWith(' ') || f.body === '' ? '' : ' ') + v + ' ' }))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Marketing</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight dark:text-stone-50">Campagnes WhatsApp</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Créez votre message, choisissez vos destinataires, puis envoyez manuellement via WhatsApp — vous appuyez toujours sur Envoyer.
        </p>
      </div>

      {/* ---- Création ---- */}
      <form onSubmit={create} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-4 shadow-sm">
        <p className="font-semibold text-stone-900 flex items-center gap-2 dark:text-stone-100"><Plus className="h-4 w-4" /> Nouvelle campagne</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom de la campagne (ex. Offre spéciale week-end)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
          />
          <select
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
          >
            {AUDIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <textarea
            required
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder={"Bonjour {{customer_name}},\n\nNous avons une nouvelle offre chez {{restaurant_name}}..."}
            className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {VARIABLES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="rounded-full border border-stone-200 px-2.5 py-1 text-xs font-mono text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {formMessage && (
          <p className={`text-sm ${formMessage === 'Campagne créée.' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formMessage}</p>
        )}
        <button className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white">
          Créer la campagne
        </button>
      </form>

      {/* ---- Liste des campagnes ---- */}
      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
                  <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" /> {c.name}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-stone-500 dark:text-stone-400">{c.body}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  <MessageCircle className="h-3.5 w-3.5" /> {c.sentCount} envoyé{c.sentCount > 1 ? 's' : ''}
                </span>
                <button onClick={() => remove(c.id)} aria-label="Supprimer" className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => openAudience(c.id)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Users className="h-4 w-4" />
              {openCampaignId === c.id ? 'Masquer les destinataires' : 'Voir les destinataires'}
            </button>

            {openCampaignId === c.id && (
              <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                {loadingAudience && <p className="text-sm text-stone-400">Chargement…</p>}
                {audience && (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                      {audience.audienceLabel} — {audience.recipients.length} destinataire{audience.recipients.length > 1 ? 's' : ''}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {audience.recipients.map((r) => (
                        <li key={r.id} className="rounded-lg border border-stone-100 p-3 text-sm dark:border-stone-800">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="min-w-0">
                              <p className="font-medium text-stone-800 dark:text-stone-200">{r.name ?? 'Client'} <span className="font-normal text-stone-400">· {r.phone}</span></p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">{r.message}</p>
                            </div>
                            <button
                              onClick={() => openWhatsApp(c.id, r)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                            >
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                            </button>
                          </div>
                        </li>
                      ))}
                      {audience.recipients.length === 0 && (
                        <li className="py-4 text-center text-sm text-stone-400">Aucun destinataire dans cette audience.</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {campaigns.length === 0 && (
          <p className="py-10 text-center text-sm text-stone-400">Aucune campagne pour l'instant — créez la première ci-dessus.</p>
        )}
      </div>
    </div>
  )
}

function PremiumUpsell() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <Crown className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">Module Marketing Premium</h1>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
          Créez des campagnes WhatsApp pour vos clients, avec messages personnalisés et audiences ciblées.
          Ce module est inclus dans la formule <span className="font-semibold">Premium</span>.
        </p>
        <Link
          to="/owner/billing"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          Voir mon abonnement
        </Link>
      </div>
    </div>
  )
}
