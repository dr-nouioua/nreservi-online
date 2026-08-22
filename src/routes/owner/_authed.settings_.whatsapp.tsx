import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Check, MessageCircle, RotateCcw, Save } from 'lucide-react'
import {
  getWhatsappSettings,
  saveWhatsappNumber,
  saveWhatsappTemplate,
  resetWhatsappTemplate,
} from '../../server/whatsapp.functions'
import {
  WHATSAPP_TEMPLATE_KINDS,
  WHATSAPP_VARIABLES,
  whatsappService,
  type WhatsappTemplateKind,
} from '../../services/whatsapp'

export const Route = createFileRoute('/owner/_authed/settings_/whatsapp')({
  loader: () => getWhatsappSettings(),
  component: WhatsappSettingsPage,
})

/** Sample reservation used only for the template preview. */
const PREVIEW = {
  guestName: 'Ahmed Benali',
  partySize: 4,
  date: '2026-08-22',
  time: '20:30',
  reference: 'NRS1024',
}

function WhatsappSettingsPage() {
  const initial = Route.useLoaderData()
  const [number, setNumber] = useState(initial.whatsappNumber ?? '')
  const [savedNumber, setSavedNumber] = useState(initial.whatsappNumber)
  const [numberError, setNumberError] = useState<string | null>(null)
  const [savingNumber, setSavingNumber] = useState(false)

  async function submitNumber(e: React.FormEvent) {
    e.preventDefault()
    setSavingNumber(true)
    setNumberError(null)
    const result = await saveWhatsappNumber({ data: { number } })
    setSavingNumber(false)
    if (!result.success) {
      setNumberError(result.error)
      return
    }
    setSavedNumber(result.whatsappNumber)
    setNumber(result.whatsappNumber ?? '')
  }

  return (
    <div className="max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Link to="/owner/settings" className="inline-flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100">
          <ArrowLeft className="h-3.5 w-3.5" /> Paramètres
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight text-stone-950 dark:text-stone-50">
          <MessageCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> WhatsApp
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Contactez vos clients depuis votre propre compte WhatsApp. nreservi prépare le message —
          vous appuyez sur Envoyer.
        </p>
      </div>

      <form onSubmit={submitNumber} className="space-y-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-stone-900 dark:text-stone-100">Numéro WhatsApp</p>
          {savedNumber && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              WhatsApp configuré <Check className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Le numéro du compte WhatsApp de votre établissement. Format international accepté, avec ou
          sans espaces.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="+213 XX XX XX XX"
            inputMode="tel"
            autoComplete="tel"
            className="min-w-0 flex-1 rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            disabled={savingNumber}
            className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white dark:ring-1 dark:ring-stone-700 hover:bg-stone-800 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Enregistrer
          </button>
        </div>
        {numberError && <p className="text-sm text-red-600 dark:text-red-400">{numberError}</p>}
        {savedNumber && !numberError && (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Enregistré : {whatsappService.formatPhoneForDisplay(savedNumber.replace(/\D/g, ''))}
          </p>
        )}
        {!savedNumber && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Sans numéro enregistré, le bouton WhatsApp reste masqué sur vos réservations.
          </p>
        )}
      </form>

      <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-6 shadow-sm">
        <p className="font-semibold text-stone-900 dark:text-stone-100">Variables disponibles</p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Insérez ces variables dans vos messages : elles sont remplacées par les informations de la
          réservation.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {WHATSAPP_VARIABLES.map((v) => (
            <li key={v.token} className="rounded-full bg-stone-100 dark:bg-stone-800 px-3 py-1 text-xs text-stone-600 dark:text-stone-400">
              <code className="font-mono text-stone-800 dark:text-stone-200">{v.token}</code> — {v.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <p className="font-semibold text-stone-900 dark:text-stone-100">Messages par défaut</p>
        {WHATSAPP_TEMPLATE_KINDS.map((meta) => {
          const template = initial.templates.find((t) => t.kind === meta.kind)
          return (
            <TemplateEditor
              key={meta.kind}
              kind={meta.kind}
              label={meta.label}
              hint={meta.hint}
              initialBody={template?.body ?? whatsappService.defaultTemplates[meta.kind]}
              initialEnabled={template?.enabled ?? true}
              businessName={initial.businessName || 'Votre établissement'}
            />
          )
        })}
      </div>
    </div>
  )
}

function TemplateEditor({
  kind,
  label,
  hint,
  initialBody,
  initialEnabled,
  businessName,
}: {
  kind: WhatsappTemplateKind
  label: string
  hint: string
  initialBody: string
  initialEnabled: boolean
  businessName: string
}) {
  const [body, setBody] = useState(initialBody)
  const [enabled, setEnabled] = useState(initialEnabled)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  async function save() {
    setError(null)
    const result = await saveWhatsappTemplate({ data: { kind, body, enabled } })
    if (!result.success) {
      setError(result.error)
      return
    }
    setMessage('Enregistré')
    setTimeout(() => setMessage(null), 2000)
  }

  async function restore() {
    const result = await resetWhatsappTemplate({ data: { kind } })
    setBody(result.body)
    setEnabled(true)
    setError(null)
    setMessage('Message par défaut restauré')
    setTimeout(() => setMessage(null), 2000)
  }

  const isDefault = body === whatsappService.defaultTemplates[kind]

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-stone-900 dark:text-stone-100">{label}</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">{hint}</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          {enabled ? 'Activé' : 'Désactivé'}
        </label>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={10}
        className="mt-3 w-full rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 font-mono text-xs leading-relaxed text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white dark:ring-1 dark:ring-stone-700 hover:bg-stone-800"
        >
          <Save className="h-4 w-4" /> Enregistrer
        </button>
        <button
          type="button"
          onClick={restore}
          disabled={isDefault}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 dark:border-stone-700 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/70 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" /> Restaurer le message par défaut
        </button>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="text-sm text-stone-500 dark:text-stone-400 underline hover:text-stone-800 dark:hover:text-stone-100"
        >
          {showPreview ? "Masquer l'aperçu" : 'Aperçu'}
        </button>
        {message && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</span>}
        {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
      </div>

      {showPreview && (
        <pre className="mt-3 rounded-lg bg-stone-50 dark:bg-stone-950 px-3 py-2 text-xs whitespace-pre-wrap text-stone-700 dark:text-stone-300">
          {whatsappService.buildMessage(body, PREVIEW, businessName)}
        </pre>
      )}
    </div>
  )
}
