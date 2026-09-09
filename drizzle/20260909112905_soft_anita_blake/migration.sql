ALTER TABLE "restaurants" ADD COLUMN "has_showers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "has_locker_rooms" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "has_night_lighting" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "has_child_seat" boolean DEFAULT false NOT NULL;