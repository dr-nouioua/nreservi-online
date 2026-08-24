ALTER TABLE "restaurants" ADD COLUMN "menu_fixed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'confirmed';