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
  subscriptionTier: text("subscription_tier").notNull().default("starter"), // starter | growth | pro
  openingHours: jsonb("opening_hours").notNull().default({}), // { mon: [{open, close}], ... }
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
});

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
});

// ---------- Menu ----------

export const menuCategories = pgTable("menu_categories", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  categoryId: integer("category_id").notNull().references(() => menuCategories.id),
  name: text("name").notNull(),
  description: text("description").default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  photoUrl: text("photo_url"),
  available: boolean("available").notNull().default(true),
});

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
  date: date("date").notNull(),
  time: time("time").notNull(),
  status: text("status").notNull().default("pending"), // pending | confirmed | seated | completed | no_show | cancelled
  source: text("source").notNull().default("online"), // online | walk_in | phone
  specialRequests: text("special_requests").default(""),
  notes: text("notes").default(""),
  confirmationCode: text("confirmation_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export const campaignLogs = pgTable("campaign_logs", {
  id: serial().primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  ruleId: integer("rule_id").references(() => marketingRules.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  templateId: integer("template_id").references(() => marketingTemplates.id),
  status: text("status").notNull().default("sent"), // sent | delivered | read | booked | opted_out | failed
  sentAt: timestamp("sent_at").defaultNow(),
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
});

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
