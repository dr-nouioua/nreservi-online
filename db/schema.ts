import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  jsonb,
  date,
  time,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ---------- Platform / admin ----------

export const adminUsers = pgTable("admin_users", {
  id: serial().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---------- Restaurants ----------

export const restaurants = pgTable("restaurants", {
  id: serial().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  cuisine: text("cuisine").notNull(),
  address: text("address").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  whatsappNumber: text("whatsapp_number"),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  description: text("description").default(""),
  avgTicketPrice: numeric("avg_ticket_price", { precision: 10, scale: 2 }).default("0"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("4.5"),
  status: text("status").notNull().default("pending"), // pending | active | suspended
  subscriptionTier: text("subscription_tier").notNull().default("basic"), // basic | premium
   openingHours: jsonb("opening_hours").notNull().default({}), // { mon: [{open, close}], ... }
   showMenuImages: boolean("show_menu_images").notNull().default(true), // owner toggle: photos in the public menu
   subscriptionStart: date("subscription_start"),
   subscriptionEnd: date("subscription_end"), // null = no expiry (grandfathered)
   subscriptionHistory: jsonb("subscription_history").notNull().default([]),
   menuFixed: boolean("menu_fixed").notNull().default(false), // false = collapsible menu, true = always open
   babySeatAvailable: boolean("baby_seat_available").notNull().default(false), // show baby-seat option in the booking form
   expiryWarningSentFor: date("expiry_warning_sent_for"), // end-date the 14-day warning was last sent for
   hasParking: boolean("has_parking").notNull().default(false), // parking badge on the public page
   createdAt: timestamp("created_at").defaultNow(),
});

export const restaurantOwners = pgTable("restaurant_owners", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staffUsers = pgTable("staff_users", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("host"), // host | manager
  createdAt: timestamp("created_at").defaultNow(),
});

// ---------- Areas / Tables ----------

export const areas = pgTable("areas", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(), // indoor, terrace, bar, private room
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("areas_restaurant_idx").on(table.restaurantId),
]);

export const tables = pgTable("tables", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  areaId: integer("area_id").notNull().references(() => areas.id),
  label: text("label").notNull(),
  capacity: integer("capacity").notNull().default(2),
  posX: integer("pos_x").notNull().default(0),
  posY: integer("pos_y").notNull().default(0),
  shape: text("shape").notNull().default("square"), // square | round | rect
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("tables_restaurant_idx").on(table.restaurantId),
]);

// ---------- Menu ----------

export const menuCategories = pgTable("menu_categories", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [
  index("menu_categories_restaurant_idx").on(table.restaurantId),
]);

export const menuItems = pgTable("menu_items", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  categoryId: integer("category_id").notNull().references(() => menuCategories.id),
  name: text("name").notNull(),
  description: text("description").default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  photoUrl: text("photo_url"),
  available: boolean("available").notNull().default(true),
}, (table) => [
  index("menu_items_restaurant_idx").on(table.restaurantId),
  index("menu_items_category_idx").on(table.categoryId),
]);

// ---------- Customers ----------

export const customers = pgTable("customers", {
  id: serial().primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  email: text("email"),
  passwordHash: text("password_hash"),
  whatsappOptIn: boolean("whatsapp_opt_in").notNull().default(true),
  birthday: date("birthday"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---------- Reservations ----------

export const reservations = pgTable("reservations", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  customerId: integer("customer_id").references(() => customers.id),
  tableId: integer("table_id").references(() => tables.id),
  areaId: integer("area_id").references(() => areas.id),
  guestName: text("guest_name").notNull(),
  guestPhone: text("guest_phone").notNull(),
  partySize: integer("party_size").notNull(),
  babySeats: integer("baby_seats").notNull().default(0),
  date: date("date").notNull(),
  time: time("time").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed | seated | completed | no_show | cancelled
  source: text("source").notNull().default("online"), // online | walk_in | phone
  specialRequests: text("special_requests").default(""),
  notes: text("notes").default(""),
  confirmationCode: text("confirmation_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("reservations_restaurant_date_idx").on(table.restaurantId, table.date),
  index("reservations_guest_phone_date_idx").on(table.guestPhone, table.date),
  index("reservations_customer_idx").on(table.customerId),
]);

// ---------- Marketing ----------

export const marketingSegments = pgTable("marketing_segments", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // lapsed_30 | birthday_week | vip | no_show_winback
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketingTemplates = pgTable("marketing_templates", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  body: text("body").notNull(), // supports {{name}}, {{last_visit_date}}, {{offer_code}}
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketingRules = pgTable("marketing_rules", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  segmentId: integer("segment_id").notNull().references(() => marketingSegments.id),
  templateId: integer("template_id").notNull().references(() => marketingTemplates.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  body: text("body").notNull(), // supports {{customer_name}}, {{restaurant_name}}, {{last_reservation_date}}
  audience: text("audience").notNull().default("all"), // all | recent | regular | lapsed
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaignLogs = pgTable("campaign_logs", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  ruleId: integer("rule_id").references(() => marketingRules.id),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  templateId: integer("template_id").references(() => marketingTemplates.id),
  status: text("status").notNull().default("sent"), // sent | delivered | read | booked | opted_out | failed
  sentAt: timestamp("sent_at").defaultNow(),
}, (table) => [
  index("campaign_logs_restaurant_idx").on(table.restaurantId),
]);

// ---------- Mail server (SMTP, configured by the super-admin) ----------

// Single row (id=1). The SMTP password never leaves the server: the admin UI
// only ever receives a hasPassword flag.
export const mailSettings = pgTable("mail_settings", {
  id: integer("id").primaryKey().default(1),
  enabled: boolean("enabled").notNull().default(false),
  smtpHost: text("smtp_host").notNull().default(""),
  smtpPort: integer("smtp_port").notNull().default(587),
  smtpSecure: boolean("smtp_secure").notNull().default(false), // true = implicit TLS (465)
  smtpUser: text("smtp_user").notNull().default(""),
  smtpPass: text("smtp_pass").notNull().default(""),
  fromName: text("from_name").notNull().default("nreservi.online"),
  fromEmail: text("from_email").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Every outgoing email is journaled here (to, subject, status, error).
export const mailLog = pgTable("mail_log", {
  id: serial().primaryKey(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  kind: text("kind").notNull().default("custom"), // test | welcome | expiry_warning | expiry_notice | custom
  status: text("status").notNull().default("sent"), // sent | failed | skipped
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---------- WhatsApp message log ----------

export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  customerId: integer("customer_id").references(() => customers.id),
  direction: text("direction").notNull(), // outbound | inbound
  kind: text("kind").notNull(), // confirmation | reminder | cancellation | modification | marketing | inbound_reply
  body: text("body").notNull(),
  status: text("status").notNull().default("queued"), // queued | sent | delivered | read | failed
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("whatsapp_messages_restaurant_created_idx").on(table.restaurantId, table.createdAt),
]);

// ---------- WhatsApp owner templates ----------

// One row per customized template. A restaurant with no row for a kind falls back to
// the French default in src/services/whatsapp.ts, so "restore default" just deletes the row.
export const whatsappTemplates = pgTable(
  "whatsapp_templates",
  {
    id: serial().primaryKey(),
    restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
    kind: text("kind").notNull(), // request_received | confirmation | reminder | cancellation
    body: text("body").notNull(), // supports {{customer_name}}, {{business_name}}, {{reservation_date}}, {{reservation_time}}, {{number_of_guests}}, {{reservation_id}}
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [unique("whatsapp_templates_restaurant_kind_key").on(table.restaurantId, table.kind)],
);

// ---------- Inline ads (admin-managed, shown on restaurant pages) ----------

// restaurantId null = the ad is shown on every restaurant page.
// active false hides the ad without deleting it (can be re-enabled later).
export const ads = pgTable("ads", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  title: text("title").notNull(),
  body: text("body").default(""),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  ctaLabel: text("cta_label").default("Découvrir"),
  sortOrder: integer("sort_order").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(15), // carousel display time per ad
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("ads_restaurant_active_idx").on(table.restaurantId, table.active),
]);
