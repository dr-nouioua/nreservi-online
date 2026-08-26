CREATE INDEX "admin_logs_created_idx" ON "admin_logs" ("created_at");--> statement-breakpoint
CREATE INDEX "mail_log_created_idx" ON "mail_log" ("created_at");--> statement-breakpoint
CREATE INDEX "visit_counts_slug_day_idx" ON "visit_counts" ("slug","day");