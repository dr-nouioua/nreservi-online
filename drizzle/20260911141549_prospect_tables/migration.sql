CREATE TABLE "prospect_activities" (
	"id" serial PRIMARY KEY,
	"prospect_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"type" text NOT NULL,
	"direction" text DEFAULT 'outbound',
	"subject" text DEFAULT '',
	"notes" text DEFAULT '',
	"outcome" text DEFAULT 'neutral',
	"scheduled_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prospect_contacts" (
	"id" serial PRIMARY KEY,
	"agent_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"business_type" text NOT NULL,
	"city" text DEFAULT '',
	"address" text DEFAULT '',
	"contact_name" text DEFAULT '',
	"contact_phone" text DEFAULT '',
	"contact_email" text DEFAULT '',
	"source" text DEFAULT 'other',
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'new',
	"lost_reason" text DEFAULT '',
	"notes" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "prospect_activities" ADD CONSTRAINT "prospect_activities_prospect_id_prospect_contacts_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospect_contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prospect_activities" ADD CONSTRAINT "prospect_activities_agent_id_admin_users_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "admin_users"("id");--> statement-breakpoint
ALTER TABLE "prospect_contacts" ADD CONSTRAINT "prospect_contacts_agent_id_admin_users_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "admin_users"("id");