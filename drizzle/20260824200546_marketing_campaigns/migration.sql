CREATE TABLE "marketing_campaigns" (
	"id" serial PRIMARY KEY,
	"restaurant_id" integer NOT NULL,
	"name" text NOT NULL,
	"body" text NOT NULL,
	"audience" text DEFAULT 'all' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "campaign_logs" ADD COLUMN "campaign_id" integer;--> statement-breakpoint
ALTER TABLE "campaign_logs" ADD CONSTRAINT "campaign_logs_campaign_id_marketing_campaigns_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "marketing_campaigns"("id");--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");