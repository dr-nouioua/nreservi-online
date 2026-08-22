CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "areas" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaign_logs" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"rule_id" integer,
	"customer_id" integer NOT NULL,
	"template_id" integer,
	"status" text DEFAULT 'sent' NOT NULL,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY,
	"phone" text NOT NULL UNIQUE,
	"name" text,
	"email" text,
	"password_hash" text,
	"whatsapp_opt_in" boolean DEFAULT true NOT NULL,
	"birthday" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_rules" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"segment_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_segments" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "marketing_templates" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"price" numeric(10,2) DEFAULT '0' NOT NULL,
	"photo_url" text,
	"available" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"customer_id" integer,
	"table_id" integer,
	"area_id" integer,
	"guest_name" text NOT NULL,
	"guest_phone" text NOT NULL,
	"party_size" integer NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"source" text DEFAULT 'online' NOT NULL,
	"special_requests" text DEFAULT '',
	"notes" text DEFAULT '',
	"confirmation_code" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurant_owners" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"cuisine" text NOT NULL,
	"address" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"whatsapp_number" text,
	"logo_url" text,
	"cover_image_url" text,
	"description" text DEFAULT '',
	"avg_ticket_price" numeric(10,2) DEFAULT '0',
	"rating" numeric(3,2) DEFAULT '4.5',
	"status" text DEFAULT 'pending' NOT NULL,
	"subscription_tier" text DEFAULT 'starter' NOT NULL,
	"opening_hours" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "staff_users" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'host' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"area_id" integer NOT NULL,
	"label" text NOT NULL,
	"capacity" integer DEFAULT 2 NOT NULL,
	"pos_x" integer DEFAULT 0 NOT NULL,
	"pos_y" integer DEFAULT 0 NOT NULL,
	"shape" text DEFAULT 'square' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer,
	"customer_id" integer,
	"direction" text NOT NULL,
	"kind" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "campaign_logs" ADD CONSTRAINT "campaign_logs_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "campaign_logs" ADD CONSTRAINT "campaign_logs_rule_id_marketing_rules_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "marketing_rules"("id");--> statement-breakpoint
ALTER TABLE "campaign_logs" ADD CONSTRAINT "campaign_logs_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "campaign_logs" ADD CONSTRAINT "campaign_logs_template_id_marketing_templates_id_fkey" FOREIGN KEY ("template_id") REFERENCES "marketing_templates"("id");--> statement-breakpoint
ALTER TABLE "marketing_rules" ADD CONSTRAINT "marketing_rules_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "marketing_rules" ADD CONSTRAINT "marketing_rules_segment_id_marketing_segments_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "marketing_segments"("id");--> statement-breakpoint
ALTER TABLE "marketing_rules" ADD CONSTRAINT "marketing_rules_template_id_marketing_templates_id_fkey" FOREIGN KEY ("template_id") REFERENCES "marketing_templates"("id");--> statement-breakpoint
ALTER TABLE "marketing_segments" ADD CONSTRAINT "marketing_segments_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "marketing_templates" ADD CONSTRAINT "marketing_templates_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_tables_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_area_id_areas_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id");--> statement-breakpoint
ALTER TABLE "restaurant_owners" ADD CONSTRAINT "restaurant_owners_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "staff_users" ADD CONSTRAINT "staff_users_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_area_id_areas_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id");--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id");