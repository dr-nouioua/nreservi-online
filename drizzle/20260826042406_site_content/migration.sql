CREATE TABLE "site_content" (
	"id" integer PRIMARY KEY DEFAULT 1,
	"about" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"contact_phone" text DEFAULT '' NOT NULL,
	"home_hero_image_url" text,
	"packages" jsonb DEFAULT '[]' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
