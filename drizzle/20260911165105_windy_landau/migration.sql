ALTER TABLE "reservations" DROP CONSTRAINT "reservations_doctor_id_doctors_id_fkey";--> statement-breakpoint
ALTER TABLE "reservations" DROP COLUMN "doctor_id";