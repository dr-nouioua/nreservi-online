/**
 * whatsappService — the single seam between the reservation engine and WhatsApp.
 *
 * V1 (this file): "manual_deep_link" mode. Nothing is ever sent by the platform.
 * We normalize phone numbers, render a French template from reservation data, and
 * build a standard click-to-chat deep link. The owner opens WhatsApp with their own
 * account, reviews the prepared message, and presses Send themselves.
 *
 * V2: add a `mode: "cloud_api"` implementation here that posts to the WhatsApp
 * Business Platform. Callers depend only on `whatsappService` + the template/variable
 * contract below, so the reservation workflow does not need to change.
 *
 * This module is isomorphic on purpose — no database or server imports — so the owner
 * dashboard can build links in the browser and the server can reuse the same rendering.
 */

export type WhatsappTemplateKind = 'request_received' | 'confirmation' | 'reminder' | 'cancellation'

export const WHATSAPP_TEMPLATE_KINDS: {
  kind: WhatsappTemplateKind
  label: string
  hint: string
}[] = [
  {
    kind: 'request_received',
    label: 'Demande reçue',
    hint: "Pour les réservations en attente, avant confirmation.",
  },
  {
    kind: 'confirmation',
    label: 'Confirmation de réservation',
    hint: 'Pour confirmer une réservation au client.',
  },
  {
    kind: 'reminder',
    label: 'Rappel de réservation',
    hint: 'À envoyer la veille ou quelques heures avant.',
  },
  {
    kind: 'cancellation',
    label: 'Annulation de réservation',
    hint: 'Pour informer le client que sa réservation est annulée.',
  },
]

/** Variables available in every template. Nothing private or internal is exposed. */
export const WHATSAPP_VARIABLES = [
  { token: '{{customer_name}}', label: 'Nom du client' },
  { token: '{{business_name}}', label: "Nom de l'établissement" },
  { token: '{{reservation_date}}', label: 'Date (ex. 22 août 2026)' },
  { token: '{{reservation_time}}', label: 'Heure (ex. 20:30)' },
  { token: '{{number_of_guests}}', label: 'Nombre de personnes' },
  { token: '{{reservation_id}}', label: 'Référence publique de réservation' },
] as const

export const DEFAULT_WHATSAPP_TEMPLATES: Record<WhatsappTemplateKind, string> = {
  request_received: `Bonjour {{customer_name}} 👋

Nous avons bien reçu votre demande de réservation auprès de {{business_name}}.

📅 Date : {{reservation_date}}
🕐 Heure : {{reservation_time}}
👥 Nombre de personnes : {{number_of_guests}}
🔖 Référence : {{reservation_id}}

Nous revenons vers vous très vite pour la confirmer.
Merci !`,
  confirmation: `Bonjour {{customer_name}} 👋

Votre réservation auprès de {{business_name}} est confirmée.

📅 Date : {{reservation_date}}
🕐 Heure : {{reservation_time}}
👥 Nombre de personnes : {{number_of_guests}}
🔖 Référence : {{reservation_id}}

Merci et à bientôt !`,
  reminder: `Bonjour {{customer_name}} 👋

Petit rappel de votre réservation auprès de {{business_name}}.

📅 Date : {{reservation_date}}
🕐 Heure : {{reservation_time}}
👥 Nombre de personnes : {{number_of_guests}}
🔖 Référence : {{reservation_id}}

Pour modifier ou annuler, répondez simplement à ce message.
À très bientôt !`,
  cancellation: `Bonjour {{customer_name}},

Nous vous informons que votre réservation auprès de {{business_name}} a été annulée.

📅 Date : {{reservation_date}}
🕐 Heure : {{reservation_time}}
🔖 Référence : {{reservation_id}}

N'hésitez pas à nous contacter pour choisir un autre créneau.
Merci de votre compréhension.`,
}

/** Reservation status → the template that makes sense to send at that point. */
export function templateKindForStatus(status: string): WhatsappTemplateKind {
  switch (status) {
    case 'pending':
      return 'request_received'
    case 'cancelled':
    case 'no_show':
      return 'cancellation'
    default:
      return 'confirmation'
  }
}

// ---------- Phone numbers ----------

/** nreservi.online is Algeria-first, so bare local numbers default to +213. */
export const DEFAULT_COUNTRY_CODE = '213'

export type NormalizedPhone =
  | { ok: true; e164: string; digits: string; display: string }
  | { ok: false; error: string }

/**
 * Accepts what an owner would actually type — spaces, dashes, dots, parentheses,
 * a leading 0, 00 or + — and returns a single E.164 form.
 *
 *   0555 12 34 56   → +213555123456
 *   00213555123456  → +213555123456
 *   +213 555 123456 → +213555123456
 */
export function normalizePhoneNumber(raw: string, defaultCountryCode = DEFAULT_COUNTRY_CODE): NormalizedPhone {
  const cleaned = (raw ?? '').replace(/[^\d+]/g, '')
  if (!cleaned) return { ok: false, error: 'Entrez un numéro WhatsApp.' }

  let digits: string
  if (cleaned.startsWith('+')) {
    digits = cleaned.slice(1).replace(/\D/g, '')
  } else if (cleaned.startsWith('00')) {
    digits = cleaned.slice(2)
  } else if (cleaned.startsWith('0')) {
    digits = defaultCountryCode + cleaned.replace(/^0+/, '')
  } else if (
    defaultCountryCode === DEFAULT_COUNTRY_CODE &&
    cleaned.length === 9 &&
    /^[567]/.test(cleaned)
  ) {
    // Algerian mobile typed without its leading 0.
    digits = defaultCountryCode + cleaned
  } else {
    digits = cleaned
  }

  if (!/^[1-9]\d{7,14}$/.test(digits)) {
    return { ok: false, error: 'Numéro invalide. Utilisez le format international, ex. +213 555 12 34 56.' }
  }
  if (digits.startsWith(DEFAULT_COUNTRY_CODE) && digits.length !== DEFAULT_COUNTRY_CODE.length + 9) {
    return { ok: false, error: 'Un numéro algérien comporte 9 chiffres après +213, ex. +213 555 12 34 56.' }
  }

  return { ok: true, e164: `+${digits}`, digits, display: formatPhoneForDisplay(digits) }
}

/** Groups an Algerian number the way it is normally written; other countries stay E.164. */
export function formatPhoneForDisplay(digits: string): string {
  if (digits.startsWith(DEFAULT_COUNTRY_CODE) && digits.length === DEFAULT_COUNTRY_CODE.length + 9) {
    const national = digits.slice(DEFAULT_COUNTRY_CODE.length)
    return `+${DEFAULT_COUNTRY_CODE} ${national.slice(0, 3)} ${national.slice(3, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`
  }
  return `+${digits}`
}

/** Country code of the restaurant's own number, so customer numbers default to the same country. */
export function countryCodeFromNumber(e164: string | null | undefined): string {
  const digits = (e164 ?? '').replace(/\D/g, '')
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) return DEFAULT_COUNTRY_CODE
  return digits.slice(0, 2) || DEFAULT_COUNTRY_CODE
}

// ---------- Message rendering ----------

export type ReservationMessageInput = {
  guestName: string
  partySize: number
  /** ISO date, e.g. 2026-08-22 */
  date: string
  /** HH:MM or HH:MM:SS */
  time: string
  /** Public booking reference shown to the customer — never the database id. */
  reference: string
}

export function formatDateFr(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return isoDate
  return parsed.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function buildTemplateVariables(
  reservation: ReservationMessageInput,
  businessName: string,
): Record<string, string> {
  return {
    customer_name: reservation.guestName?.trim() || 'client',
    business_name: businessName,
    reservation_date: formatDateFr(reservation.date),
    reservation_time: reservation.time.slice(0, 5),
    number_of_guests: String(reservation.partySize),
    reservation_id: reservation.reference,
  }
}

export function renderTemplateBody(body: string, vars: Record<string, string>): string {
  return body.replace(/{{\s*(\w+)\s*}}/g, (_, key: string) => vars[key] ?? '')
}

export function buildMessage(
  body: string,
  reservation: ReservationMessageInput,
  businessName: string,
): string {
  return renderTemplateBody(body, buildTemplateVariables(reservation, businessName))
}

// ---------- Deep link ----------

export type WhatsappLink = { ok: true; url: string; webUrl: string; e164: string } | { ok: false; error: string }

/**
 * Builds a standard click-to-chat link. `wa.me` resolves itself: the WhatsApp app on
 * mobile, the desktop client or WhatsApp Web on desktop. `webUrl` is an explicit
 * WhatsApp Web fallback for when the app cannot be opened.
 *
 * The link only *opens* WhatsApp with the message pre-filled — it cannot send anything.
 */
export function generateWhatsAppLink(opts: {
  /** The recipient — the customer's number. The sender is whichever account the owner is signed into. */
  phone: string
  message: string
  defaultCountryCode?: string
}): WhatsappLink {
  const normalized = normalizePhoneNumber(opts.phone, opts.defaultCountryCode)
  if (!normalized.ok) return { ok: false, error: `Numéro du client inutilisable : ${normalized.error}` }
  const text = encodeURIComponent(opts.message)
  return {
    ok: true,
    url: `https://wa.me/${normalized.digits}?text=${text}`,
    webUrl: `https://web.whatsapp.com/send?phone=${normalized.digits}&text=${text}`,
    e164: normalized.e164,
  }
}

export const whatsappService = {
  /** V1 never sends. Swap this to "cloud_api" in V2 without touching the reservation flow. */
  mode: 'manual_deep_link' as const,
  templateKinds: WHATSAPP_TEMPLATE_KINDS,
  variables: WHATSAPP_VARIABLES,
  defaultTemplates: DEFAULT_WHATSAPP_TEMPLATES,
  templateKindForStatus,
  normalizePhoneNumber,
  formatPhoneForDisplay,
  countryCodeFromNumber,
  buildMessage,
  generateWhatsAppLink,
}
