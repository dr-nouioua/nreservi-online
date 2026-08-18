# nreservi.online — Multi-Service Reservation Platform

nreservi.online is a full-stack, multi-tenant reservation platform. The customer-facing interface is
French-first ("Mes réservations"); the owner and admin dashboards are unchanged. It supports four roles:

- **Customers** — browse restaurants, check real-time availability, book a table as a guest (phone number only), and manage their reservations.
- **Restaurant owners / staff** — a live reservation board, floor-plan view, analytics, menu management, restaurant settings, and WhatsApp-based marketing automation.
- **Platform super-admin** — onboard restaurants, approve/suspend accounts, manage subscription tiers, view cross-restaurant analytics, and support-login into any restaurant's dashboard.
- **Marketing engine** — automation rules that send WhatsApp campaigns to customer segments (lapsed guests, birthdays, VIPs, no-show win-back) and track delivery/read/booked performance.

## Tech stack

- **Framework:** TanStack Start (React 19, TanStack Router), deployed on Netlify
- **Database:** Netlify Database (managed Postgres) via Drizzle ORM — see `db/schema.ts`
- **Styling:** Tailwind CSS 4
- **Charts:** Chart.js / react-chartjs-2
- **Auth:** custom email/password login for owners, staff, and the admin, using signed HMAC session cookies (no third-party auth provider)
- **WhatsApp integration:** mocked send/receive, logged to the `whatsapp_messages` table (see "WhatsApp integration" below)
- **Background jobs:** a scheduled Netlify Function for reservation reminders, and an inbound-webhook Netlify Function for CANCEL/CONFIRM/STOP replies

## Running locally

```bash
pnpm install
netlify dev --port 8889
```

The database seeds itself automatically on first request with two active demo restaurants and one pending
onboarding applicant. Demo logins:

| Role | URL | Email | Password |
|---|---|---|---|
| Restaurant owner | `/owner/login` | `owner@olivetable.dev` | `owner123` |
| Restaurant owner | `/owner/login` | `owner@sakurahouse.dev` | `owner123` |
| Platform admin | `/admin/login` | `admin@platform.dev` | `admin123` |

Customers don't need an account — book from the homepage with any phone number, then look reservations up again
at `/my-reservations` with that same number.

## Branding

The public interface is branded **nreservi.online**. Web-ready assets are derived from the supplied artwork
(`brand-source/nreservi-logo-source.png`, not served) and live in `public/`:

| File | Use |
| --- | --- |
| `public/brand/nreservi-logo.png` | Horizontal lockup (815×125, transparent) — client header, footer, login pages, owner sidebar |
| `public/brand/nreservi-mark.png` | Symbol only (172×125, transparent) — footer, tight layouts |
| `public/brand/nreservi-icon.png` | App icon (512×512) — social/OG image |
| `public/favicon.ico`, `public/favicon-32.png`, `public/apple-touch-icon.png` | Browser and home-screen icons |

Sizing is handled with responsive height classes on the lockup so proportions are never distorted. The client
header contains exactly one navigation item, **Mes réservations**; owner access lives at `/owner/login`
("Espace professionnel", linked from the footer) and admin access at `/admin/login`, which is not linked from
any customer-facing page.

## WhatsApp integration

Two separate paths exist, on purpose.

**Owner → customer messages (V1, live): manual click-to-chat.** No API, no QR code, no WhatsApp Web
automation, no session storage — and nothing is ever sent automatically. `src/services/whatsapp.ts` is the
`whatsappService` seam: it normalizes phone numbers to E.164 (Algeria-first, so `0555 12 34 56` and
`+213555123456` both work), renders a French template from the reservation, and `generateWhatsAppLink()`
returns a standard `https://wa.me/<number>?text=<message>` deep link (plus a `web.whatsapp.com` fallback).

The owner configures the establishment's own WhatsApp number under **Paramètres → WhatsApp**
(`/owner/settings/whatsapp`), where the four default messages — *Demande reçue*, *Confirmation*, *Rappel*,
*Annulation* — can be enabled/disabled, edited with the `{{customer_name}}`, `{{business_name}}`,
`{{reservation_date}}`, `{{reservation_time}}`, `{{number_of_guests}}`, `{{reservation_id}}` variables, and
restored to their default. Overrides live in the `whatsapp_templates` table; a missing row means the French
default in code is used, so "restore default" is simply a row delete.

Once a number is saved, every reservation on the board gets a **WhatsApp** button that opens a review modal:
the template is picked from the reservation's status, the rendered message is editable, and *Ouvrir WhatsApp*
opens WhatsApp with the message pre-filled at the customer's number. **The owner presses Send themselves.**
The platform only records a `whatsapp_messages` row with status `prepared` — never `sent`, because it cannot
know. `{{reservation_id}}` is the public confirmation code, never the database id; no internal notes,
credentials, or private fields are exposed to the message.

To upgrade to V2 (official Business API, automatic sending), add a `mode: "cloud_api"` implementation inside
`src/services/whatsapp.ts` and replace `logWhatsappHandoff` with a real send — the reservation flow and the
template contract stay unchanged.

**Marketing/automated messages (mocked).** Real WhatsApp Business Platform (Meta Cloud API) or Twilio
integration requires an approved business account and credentials this environment doesn't have. The
marketing campaigns and scheduled reminders instead call `sendWhatsappMessage()` in
`src/server/whatsapp.server.ts`, which logs the message to the `whatsapp_messages` table so the UI can show
real delivery status. `netlify/functions/whatsapp-webhook.mts` is a ready-made inbound webhook handler that
parses CANCEL/CONFIRM/STOP replies; point a real provider's webhook at it and swap the mock sender for an
actual API call once credentials (`WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, or Twilio equivalents)
are available.

## Project structure

See `AGENTS.md` for the full directory breakdown and conventions.
