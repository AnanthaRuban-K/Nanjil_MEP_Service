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
CREATE TABLE IF NOT EXISTS "booking_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"status" "status" NOT NULL,
	"note" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_number" varchar(20) NOT NULL,
	"customer_id" varchar(50) NOT NULL,
	"service_type" "service_type" NOT NULL,
	"description" text NOT NULL,
	"priority" "priority" DEFAULT 'normal' NOT NULL,
	"contact_info" jsonb NOT NULL,
	"location" jsonb,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"scheduled_time" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"assigned_team_id" varchar(50),
	"photos" jsonb DEFAULT '[]'::jsonb,
	"estimated_price" numeric(10, 2),
	"final_price" numeric(10, 2),
	"payment_status" varchar(20) DEFAULT 'pending',
	"rating" numeric(2, 1),
	"review" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
