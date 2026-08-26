CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY,
	"admin_id" integer NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
