CREATE TABLE "whatsapp_templates" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"kind" text NOT NULL,
	"body" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "whatsapp_templates_restaurant_kind_key" UNIQUE("restaurant_id","kind")
);
--> statement-breakpoint
ALTER TABLE "whatsapp_templates" ADD CONSTRAINT "whatsapp_templates_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");