import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Briefcase, Building2, Plus, Send, Trash2 } from 'lucide-react'
import {
  listSubscriptions,
  listMailContacts,
  addMailContact,
  deleteMailContact,
  emailRestaurants,
  emailContacts,
} from '../../server/admin.functions'

export const Route = createFileRoute('/admin/_authed/emails')({
  loader: () => Promise.all([listSubscriptions(), listMailContacts()]),
  component: EmailsPage,
})


const TEMPLATES = [
  {
    label: 'Offre publicitaire',
    subject: 'Proposition de partenariat publicitaire — nreservi.online',
    body: "Bonjour {{contact_name}},\n\nVotre marque {{company}} s'adresse exactement à notre audience : des clients qui réservent des tables dans les meilleurs restaurants.\n\nNous proposons des emplacements publicitaires premium sur les pages de nos restaurants (carte mise en avant sur la page d'accueil de chaque établissement).\n\nSouhaitez-vous échanger sur une offre adaptée à {{company}} ?\n\nL'équipe nreservi.online",
  },
  {
    label: 'Facture publicité',
    subject: 'Facture nreservi.online — publicité',
    body: "Bonjour {{contact_name}},\n\nVeuillez trouver en pièce jointe la facture correspondant à votre campagne publicitaire sur nreservi.online.\n\nNous restons à votre disposition pour tout renouvellement.\n\nL'équipe nreservi.online",
  },
]

function EmailsPage() {
  const [subs] = useState(Route.useLoaderData()[0])
  const [contacts, setContacts] = useState(Route.useLoaderData()[1])

  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<number>>(new Set())
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set())
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const [newContact, setNewContact] = useState({ name: '', company: '', email: '' })
  const [contactMessage, setContactMessage] = useState<string | null>(null)

  const nothingSelected = selectedRestaurants.size === 0 && selectedContacts.size === 0

  async function refreshContacts() {
    setContacts(await listMailContacts())
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setMessage(null)
    let sent = 0
    let failed = 0
    let lastError: string | null = null

    if (selectedRestaurants.size > 0) {
      const r = await emailRestaurants({ data: { ids: [...selectedRestaurants], subject: subject.trim(), body: body.trim() } })
      if ('error' in r && r.error) lastError = r.error
      else { sent += r.sent ?? 0; failed += r.failed ?? 0 }
    }
    if (selectedContacts.size > 0) {
      const r = await emailContacts({
        data: { ids: [...selectedContacts], subject: subject.trim(), body: body.trim(), amountDA: amount || null },
      })
      if ('error' in r && r.error) lastError = r.error
      else { sent += r.sent ?? 0; failed += r.failed ?? 0 }
    }

    setSending(false)
    if (sent === 0 && lastError) { setMessage(lastError); return }
    setMessage(`Envoyé à ${sent} destinataire(s)${failed ? ` — ${failed} échec(s)` : ''}.`)
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault()
    const result = await addMailContact({ data: newContact })
    if ('error' in result && result.error) {
      setContactMessage(result.error)
      return
    }
    setNewContact({ name: '', company: '', email: '' })
    setContactMessage('Contact ajouté.')
    refreshContacts()
  }

  async function removeContact(id: number) {
    if (!window.confirm('Supprimer ce contact ?')) return
    await deleteMailContact({ data: { id } })
    setSelectedContacts((prev) => { const n = new Set(prev); n.delete(id); return n })
    refreshContacts()
  }

  function applyTemplate(kind: 'offer' | 'invoice') {
    const t = TEMPLATES[kind === 'offer' ? 0 : 1]
    setSubject(t.subject)
    setBody(t.body)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-sm font-medium text-lime-300">Administration</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">E-mails</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Envois groupés personnalisés vers les restaurants et vos contacts entreprises (annonceurs, partenaires).
        </p>
      </div>

      {/* ---- Composition ---- */}
      <form onSubmit={send} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 space-y-4 shadow-sm">
        <p className="font-semibold text-stone-900 dark:text-stone-100">Nouvel envoi</p>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-2">Restaurants</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subs.map((s) => (
              <label key={s.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm dark:border-stone-800">
                <input
                  type="checkbox"
                  checked={selectedRestaurants.has(s.id)}
                  onChange={(e) => {
                    const n = new Set(selectedRestaurants)
                    if (e.target.checked) n.add(s.id)
                    else n.delete(s.id)
                    setSelectedRestaurants(n)
                  }}
                  className="accent-lime-500"
                />
                <Building2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span className="truncate text-stone-700 dark:text-stone-300">{s.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400 mb-2">Contacts entreprises</p>
          {contacts.length === 0 ? (
            <p className="text-sm text-stone-400">Aucun contact — ajoutez vos annonceurs ci-dessous.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {contacts.map((c) => (
                <label key={c.id} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-2.5 py-1.5 text-sm dark:border-stone-800">
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(c.id)}
                    onChange={(e) => {
                      const n = new Set(selectedContacts)
                      if (e.target.checked) n.add(c.id)
                      else n.delete(c.id)
                      setSelectedContacts(n)
                    }}
                    className="accent-lime-500"
                  />
                  <Briefcase className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="truncate text-stone-700 dark:text-stone-300">{c.company || c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => applyTemplate('offer')} className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
            Modèle : offre publicitaire
          </button>
          <button type="button" onClick={() => applyTemplate('invoice')} className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800">
            Modèle : facture
          </button>
        </div>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Objet"
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
        />
        <textarea
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={"Bonjour {{contact_name}},\n\n…"}
          className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
        />
        <div>
          <label className="text-xs text-stone-500 dark:text-stone-400">
            Montant (DA) — optionnel : génère une facture PDF jointe à l'e-mail
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ex. 25000"
            className="mt-1 w-48 rounded-lg border border-stone-300 px-3 py-2.5 text-sm dark:border-stone-700"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.startsWith('Envoyé') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{message}</p>
        )}
        <button
          disabled={sending || nothingSelected}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          <Send className="h-4 w-4" /> {sending ? 'Envoi…' : `Envoyer (${selectedRestaurants.size + selectedContacts.size} destinataire(s))`}
        </button>
      </form>

      {/* ---- Contacts entreprises ---- */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-sm space-y-4">
        <p className="font-semibold text-stone-900 dark:text-stone-100">Contacts entreprises</p>

        <form onSubmit={addContact} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input required value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Nom du contact" className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} placeholder="Société (ex. Coca-Cola)" className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <input required type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} placeholder="E-mail" className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700" />
          <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"><Plus className="h-4 w-4" /> Ajouter</button>
        </form>
        {contactMessage && <p className="text-xs text-red-600 dark:text-red-400">{contactMessage}</p>}

        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-200">
                  {c.name} <span className="font-normal text-stone-400">· {c.company}</span>
                </p>
                <p className="truncate text-xs text-stone-500 dark:text-stone-400">{c.email}</p>
              </div>
              <button onClick={() => removeContact(c.id)} aria-label="Supprimer" className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {contacts.length === 0 && <li className="py-3 text-sm text-stone-400">Aucun contact entreprise.</li>}
        </ul>
      </div>
    </div>
  )
}
