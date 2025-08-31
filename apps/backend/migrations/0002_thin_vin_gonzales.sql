DO $$ BEGIN
 CREATE TYPE "priority" AS ENUM('normal', 'urgent', 'emergency');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "service_type" AS ENUM('electrical', 'plumbing');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "booking_number" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_type" SET DATA TYPE service_type;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "priority" SET DATA TYPE priority;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE status;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "photos" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "total_cost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "assigned_team";--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number");