CREATE TABLE "visit_counts" (
	"id" serial PRIMARY KEY,
	"day" date NOT NULL,
	"slug" text DEFAULT '' NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "visit_counts_day_slug_key" UNIQUE("day","slug")
);
--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "tiktok_url" text;