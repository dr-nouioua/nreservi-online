ALTER TABLE "restaurants" ADD COLUMN "subscription_start" date;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "subscription_end" date;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "subscription_history" jsonb DEFAULT '[]' NOT NULL;