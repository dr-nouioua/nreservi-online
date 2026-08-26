ALTER TABLE "admin_users" ADD COLUMN "role" text DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "permissions" jsonb DEFAULT '[]' NOT NULL;--> statement-breakpoint
UPDATE "admin_users" SET "role" = 'super' WHERE "role" = 'admin';