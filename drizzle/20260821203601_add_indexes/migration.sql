CREATE INDEX "areas_restaurant_idx" ON "areas" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "campaign_logs_restaurant_idx" ON "campaign_logs" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "menu_categories_restaurant_idx" ON "menu_categories" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "menu_items_restaurant_idx" ON "menu_items" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "menu_items_category_idx" ON "menu_items" ("category_id");--> statement-breakpoint
CREATE INDEX "reservations_restaurant_date_idx" ON "reservations" ("restaurant_id","date");--> statement-breakpoint
CREATE INDEX "reservations_guest_phone_date_idx" ON "reservations" ("guest_phone","date");--> statement-breakpoint
CREATE INDEX "reservations_customer_idx" ON "reservations" ("customer_id");--> statement-breakpoint
CREATE INDEX "tables_restaurant_idx" ON "tables" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "whatsapp_messages_restaurant_created_idx" ON "whatsapp_messages" ("restaurant_id","created_at");