// apps/backend/drizzle/0001_initial.sql
CREATE TABLE IF NOT EXISTS "bookings" (
  "id" serial PRIMARY KEY NOT NULL,
  "booking_number" varchar(20) NOT NULL,
  "service_type" varchar(50) NOT NULL,
  "priority" varchar(20) DEFAULT 'normal' NOT NULL,
  "description" text NOT NULL,
  "contact_info" jsonb NOT NULL,
  "location" jsonb,
  "scheduled_time" timestamp NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "photos" jsonb DEFAULT '[]',
  "total_cost" numeric(10,2),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);

CREATE INDEX IF NOT EXISTS "idx_bookings_status" ON "bookings" ("status");
CREATE INDEX IF NOT EXISTS "idx_bookings_created_at" ON "bookings" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_bookings_service_type" ON "bookings" ("service_type");