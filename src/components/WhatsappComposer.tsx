import { useMemo, useState } from 'react'
import { Check, Copy, ExternalLink, MessageCircle, X } from 'lucide-react'
import {
  WHATSAPP_TEMPLATE_KINDS,
  whatsappService,
  type WhatsappTemplateKind,
} from '../services/whatsapp'
import { logWhatsappHandoff } from '../server/whatsapp.functions'

export type ComposerReservation = {
  id: number
  guestName: string
  guestPhone: string
  partySize: number
  date: string
  time: string
  status: string
  confirmationCode: string
}

export type ComposerTemplate = {
  kind: WhatsappTemplateKind
  body: string
  enabled: boolean
}

/**
 * Review-then-open modal. It builds a click-to-chat link and nothing more: WhatsApp
 * opens with the message pre-filled and the owner presses Send themselves.
 */
export function WhatsappComposer({
  reservation,
  businessName,
  businessNumber,
  templates,
  onClose,
}: {
  reservation: ComposerReservation
  businessName: string
  /** The restaurant's own configured number — the account the owner sends from. */
  businessNumber: string
  templates: ComposerTemplate[]
  onClose: () => void
}) {
  const available = templates.filter((t) => t.enabled)
  const suggested = whatsappService.templateKindForStatus(reservation.status)
  const initialKind =
    available.find((t) => t.kind === suggested)?.kind ?? available[0]?.kind ?? suggested

  const [kind, setKind] = useState<WhatsappTemplateKind>(initialKind)
  const [message, setMessage] = useState(() => renderFor(initialKind))
  const [copied, setCopied] = useState(false)

  function renderFor(next: WhatsappTemplateKind) {
    const template =
      templates.find((t) => t.kind === next)?.body ?? whatsappService.defaultTemplates[next]
    return whatsappService.buildMessage(
      template,
      {
        guestName: reservation.guestName,
        partySize: reservation.partySize,
        date: reservation.date,
        time: reservation.time,
        reference: reservation.confirmationCode,
      },
      businessName,
    )
  }

  function pickKind(next: WhatsappTemplateKind) {
    setKind(next)
    setMessage(renderFor(next))
  }

  const link = useMemo(
    () =>
      whatsappService.generateWhatsAppLink({
        phone: reservation.guestPhone,
        message,
        defaultCountryCode: whatsappService.countryCodeFromNumber(businessNumber),
      }),
    [reservation.guestPhone, message, businessNumber],
  )

  // Best-effort audit trail: the owner opened WhatsApp. We never claim it was sent.
  function noteHandoff() {
    logWhatsappHandoff({ data: { reservationId: reservation.id, kind, body: message } }).catch(() => {})
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-stone-900">
              <MessageCircle className="h-4 w-4 text-emerald-600" /> Contacter sur WhatsApp
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Réservation #{reservation.confirmationCode} · {reservation.guestName} ·{' '}
              {link.ok
                ? whatsappService.formatPhoneForDisplay(link.e164.slice(1))
                : reservation.guestPhone}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mt-5 block text-xs font-medium text-stone-500">Message</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {WHATSAPP_TEMPLATE_KINDS.filter((t) =>
            available.some((a) => a.kind === t.kind),
          ).map((t) => (
            <button
              key={t.kind}
              type="button"
              onClick={() => pickKind(t.kind)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                kind === t.kind
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={12}
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2 font-mono text-xs leading-relaxed text-stone-800"
        />
        <p className="mt-2 text-xs text-stone-500">
          WhatsApp s'ouvre avec ce message déjà rempli. <strong>C'est vous qui appuyez sur Envoyer</strong> —
          nreservi n'envoie jamais de message à votre place.
        </p>

        {!link.ok && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{link.error}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {link.ok && (
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              onClick={noteHandoff}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" /> Ouvrir WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={copyMessage}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Message copié' : 'Copier le message'}
          </button>
        </div>

        {link.ok && (
          <p className="mt-3 text-xs text-stone-400">
            WhatsApp ne s'ouvre pas ?{' '}
            <a
              href={link.webUrl}
              target="_blank"
              rel="noreferrer"
              onClick={noteHandoff}
              className="inline-flex items-center gap-1 text-stone-600 underline"
            >
              Utiliser WhatsApp Web <ExternalLink className="h-3 w-3" />
            </a>{' '}
            ou copiez le message et collez-le dans la conversation.
          </p>
        )}
      </div>
    </div>
  )
}
