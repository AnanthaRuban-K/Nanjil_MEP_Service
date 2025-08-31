DROP TABLE "booking_status_history";--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_booking_number_unique";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "booking_number" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "service_type" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "priority" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "priority" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "scheduled_time" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "assigned_team" jsonb;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "customer_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "started_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "completed_at";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "assigned_team_id";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "estimated_price";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "final_price";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "payment_status";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "rating";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "review";--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "updated_at";