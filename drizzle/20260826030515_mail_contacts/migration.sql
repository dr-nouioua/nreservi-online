CREATE TABLE "mail_contacts" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"note" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
