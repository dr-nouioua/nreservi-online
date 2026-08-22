CREATE TABLE "ads" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer,
	"title" text NOT NULL,
	"body" text DEFAULT '',
	"image_url" text,
	"link_url" text,
	"cta_label" text DEFAULT 'Découvrir',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "ads_restaurant_active_idx" ON "ads" ("restaurant_id","active");--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");