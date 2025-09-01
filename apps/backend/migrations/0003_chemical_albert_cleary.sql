ALTER TABLE "bookings" ALTER COLUMN "service_type" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "priority" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "priority" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "photos" SET DEFAULT '[]'::jsonb;