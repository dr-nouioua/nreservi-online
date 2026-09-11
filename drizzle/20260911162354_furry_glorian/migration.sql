CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"specialty" text NOT NULL,
	"bio" text DEFAULT '',
	"photo_url" text,
	"qualifications" text DEFAULT '',
	"available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "doctor_id" integer;--> statement-breakpoint
CREATE INDEX "doctors_restaurant_idx" ON "doctors" ("restaurant_id");--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_doctor_id_doctors_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");