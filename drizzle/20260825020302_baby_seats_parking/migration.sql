ALTER TABLE "reservations" ADD COLUMN "baby_seats" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "baby_seat_available" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "has_parking" boolean DEFAULT false NOT NULL;