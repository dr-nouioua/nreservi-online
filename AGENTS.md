# AGENTS.md

Multi-tenant restaurant reservation platform. TanStack Start (React 19) on Netlify, with Netlify Database
(Postgres via Drizzle ORM) for persistence.

## Directory structure

```
db/
  schema.ts               # All tables: restaurants, areas, tables, menu, customers, reservations,
                           # marketing segments/templates/rules, campaign logs, whatsapp message log,
                           # whatsapp owner templates, admin/owner/staff accounts.
  index.ts                # Drizzle client (Netlify Database adapter, zero-config).
netlify/
  database/migrations/    # Drizzle-generated SQL migrations — applied automatically on deploy.
  functions/
    whatsapp-webhook.mts       # Inbound WhatsApp webhook stub (CANCEL/CONFIRM/STOP handling).
    reservation-reminders.mts  # Scheduled function (hourly) that queues reminder messages.
src/
  services/
    whatsapp.ts       # whatsappService: isomorphic (no DB/server imports) phone normalization,
                      # French default templates, variable rendering, generateWhatsAppLink().
  components/
    SiteHeader.tsx    # Public header: logo + "Mes réservations" only.
    SiteFooter.tsx    # Public footer, incl. the "Espace professionnel" owner entry point.
    WhatsappComposer.tsx  # Owner-side review modal: prepares the message, opens WhatsApp, never sends.
  server/
    *.server.ts       # Server-only helpers (crypto, sessions, seeding, mock WhatsApp sender).
    *.functions.ts    # createServerFn wrappers — the only way routes/components touch the DB.
  routes/
    index.tsx                    # Customer home: browse/search restaurants.
    restaurants.$slug.tsx        # Restaurant profile, menu, availability calendar, booking form.
    my-reservations.tsx          # Guest lookup by phone: view/cancel bookings, WhatsApp opt-in.
    owner/login.tsx              # Owner/staff login (not behind the auth guard).
    owner/_authed.tsx            # Pathless layout: guards all /owner/* pages, renders sidebar nav.
    owner/_authed.index.tsx      # Today's reservation board + floor plan + walk-in modal.
    owner/_authed.analytics.tsx  # Occupancy, no-show/cancellation rate, peak hours/days, CSV export.
    owner/_authed.marketing.tsx  # Segments, rules, templates, "run now" sends, campaign log.
    owner/_authed.menu.tsx       # Menu categories/items, availability toggle ("86'd").
    owner/_authed.settings.tsx   # Opening hours, avg ticket price, areas/tables.
    owner/_authed.settings_.whatsapp.tsx  # /owner/settings/whatsapp — WhatsApp number + message templates.
                                          # Non-nested (`settings_`) so settings.tsx stays a leaf, not a layout.
    admin/login.tsx               # Super-admin login.
    admin/_authed.tsx              # Guarded admin layout.
    admin/_authed.index.tsx        # Cross-restaurant analytics, approve/suspend/delete, support-login.
    admin/_authed.onboard.tsx      # Create a new restaurant + owner account.
```

## Conventions

- **Auth:** no third-party identity provider. `src/server/session.server.ts` signs an HMAC cookie
  (`SESSION_SECRET` env var) containing `{ role, id, restaurantId? }`. `src/server/auth.functions.ts` exposes
  login/logout server functions per role and `requireSession()` for guards.
- **Route guards:** each protected area uses a pathless TanStack Router layout route (`_authed.tsx`) with a
  `beforeLoad` that calls `getSession()` and redirects to the matching `/login` page if the role doesn't match.
  Files named `_authed.foo.tsx` render at `/owner/foo` (or `/admin/foo`) without adding a URL segment for `_authed`.
- **Multi-tenancy:** every owner/staff server function calls `requireRestaurantId()` (in `owner.functions.ts`),
  which derives the restaurant from the session — never from client input — so one restaurant can't read or
  mutate another's data.
- **Seeding:** `src/server/seed.server.ts` inserts two active demo restaurants (with tables, menus, reservations,
  marketing templates) and one restaurant pending admin approval, the first time any page queries the database.
  It's idempotent (checks `restaurants` count first) and cheap to call from every entry-point loader.
- **WhatsApp:** two distinct paths. Owner→customer messaging is **manual**: build a link with
  `whatsappService.generateWhatsAppLink()` (`src/services/whatsapp.ts`) and let the owner press Send in
  WhatsApp — never send on their behalf, never automate WhatsApp Web, never add an API/QR/session layer.
  Handoffs are logged with status `prepared`, not `sent`. Automated/marketing messages still go through
  `sendWhatsappMessage()` in `whatsapp.server.ts`, the single seam to swap in a real provider later; never
  call a real WhatsApp API directly from a route.
- **WhatsApp templates:** French defaults live in code (`DEFAULT_WHATSAPP_TEMPLATES`); only owner overrides are
  stored in `whatsapp_templates`, unique per `(restaurant_id, kind)`. "Restore default" deletes the row.
  Messages may expose only reservation-facing data — `{{reservation_id}}` is the public `confirmationCode`,
  never the database id.
- **Money:** stored as `numeric` columns and passed around as strings to avoid float rounding; convert with
  `Number(...)` only for display/math like analytics revenue estimates.

## Known simplifications (documented, not hidden)

- WhatsApp sending/receiving is mocked (see README's "WhatsApp integration" section) — no real Business API
  credentials are available in this environment.
- The reservation board and floor plan refresh via polling (15s interval), not WebSockets — sufficient for a
  prototype; swap for Netlify's realtime/WebSocket support if true push updates are needed.
- SMS/email fallback notifications are not implemented; only the WhatsApp mock path exists.
