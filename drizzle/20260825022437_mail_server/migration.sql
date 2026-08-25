CREATE TABLE "mail_log" (
	"id" serial PRIMARY KEY,
	"to_email" text NOT NULL,
	"subject" text NOT NULL,
	"kind" text DEFAULT 'custom' NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mail_settings" (
	"id" integer PRIMARY KEY DEFAULT 1,
	"enabled" boolean DEFAULT false NOT NULL,
	"smtp_host" text DEFAULT '' NOT NULL,
	"smtp_port" integer DEFAULT 587 NOT NULL,
	"smtp_secure" boolean DEFAULT false NOT NULL,
	"smtp_user" text DEFAULT '' NOT NULL,
	"smtp_pass" text DEFAULT '' NOT NULL,
	"from_name" text DEFAULT 'nreservi.online' NOT NULL,
	"from_email" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "expiry_warning_sent_for" date;