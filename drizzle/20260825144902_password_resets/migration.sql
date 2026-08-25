CREATE TABLE "password_resets" (
	"id" serial PRIMARY KEY,
	"role" text NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
