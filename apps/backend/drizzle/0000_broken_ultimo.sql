DO $$ BEGIN
 CREATE TYPE "booking_status" AS ENUM('pending', 'confirmed', 'in-progress', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "language" AS ENUM('ta', 'en');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_status" AS ENUM('pending', 'paid', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "priority" AS ENUM('normal', 'urgent', 'emergency');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "product_category" AS ENUM('electrical-switches', 'electrical-wiring', 'electrical-fixtures', 'electrical-fans', 'plumbing-pipes', 'plumbing-fittings', 'plumbing-fixtures', 'plumbing-tools', 'tools', 'accessories');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "service_category" AS ENUM('electrical', 'plumbing');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "technician_status" AS ENUM('available', 'busy', 'off-duty');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('customer', 'admin', 'technician');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"message_ta" text,
	"performed_by" uuid,
	"performed_by_type" varchar(20),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"service_id" uuid,
	"service_type" "service_category" NOT NULL,
	"sub_service" varchar(100),
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"description_ta" text,
	"photos" jsonb,
	"contact_info" jsonb NOT NULL,
	"location" jsonb,
	"scheduled_time" timestamp NOT NULL,
	"preferred_time_slot" varchar(50),
	"status" "booking_status" DEFAULT 'pending',
	"priority" "priority" DEFAULT 'normal',
	"assigned_technician_id" uuid,
	"estimated_arrival" timestamp,
	"actual_arrival" timestamp,
	"work_started_at" timestamp,
	"work_completed_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"material_cost" numeric(10, 2),
	"labor_cost" numeric(10, 2),
	"payment_status" "payment_status" DEFAULT 'pending',
	"payment_method" varchar(50) DEFAULT 'cash',
	"rating" integer,
	"review" text,
	"review_ta" text,
	"review_photos" jsonb,
	"admin_notes" text,
	"technician_notes" text,
	"work_summary" text,
	"materials_used" jsonb,
	"is_emergency" boolean DEFAULT false,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"warranty" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"booking_id" uuid,
	"transaction_type" varchar(20) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(10, 2),
	"total_amount" numeric(10, 2),
	"balance_after" integer NOT NULL,
	"notes" text,
	"performed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"booking_id" uuid,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"title_ta" varchar(255),
	"message" text NOT NULL,
	"message_ta" text,
	"channels" jsonb,
	"status" varchar(20) DEFAULT 'pending',
	"sent_at" timestamp,
	"read_at" timestamp,
	"action_url" varchar(500),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ta" varchar(255) NOT NULL,
	"category" "product_category" NOT NULL,
	"sub_category" varchar(100),
	"brand" varchar(100),
	"model" varchar(100),
	"sku" varchar(100),
	"cost" numeric(10, 2),
	"price" numeric(10, 2) NOT NULL,
	"discounted_price" numeric(10, 2),
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0,
	"reorder_level" integer DEFAULT 5,
	"max_stock_level" integer,
	"description_en" text,
	"description_ta" text,
	"specifications" jsonb,
	"images" jsonb NOT NULL,
	"supplier_info" jsonb,
	"total_sold" integer DEFAULT 0,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"last_sold_at" timestamp,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"is_digital" boolean DEFAULT false,
	"requires_installation" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"technician_id" uuid,
	"rating" integer NOT NULL,
	"service_rating" integer,
	"timeliness" integer,
	"communication" integer,
	"pricing" integer,
	"review_text" text,
	"review_text_ta" text,
	"review_photos" jsonb,
	"is_public" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"helpful_votes" integer DEFAULT 0,
	"admin_response" text,
	"admin_response_ta" text,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area_name_en" varchar(255) NOT NULL,
	"area_name_ta" varchar(255) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"district" varchar(100),
	"state" varchar(100) DEFAULT 'Tamil Nadu',
	"coordinates" jsonb,
	"is_covered" boolean DEFAULT true,
	"additional_charges" numeric(10, 2) DEFAULT '0',
	"travel_time" integer,
	"service_level" varchar(50) DEFAULT 'standard',
	"restrictions" jsonb,
	"landmarks" jsonb,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_ta" varchar(255) NOT NULL,
	"category" "service_category" NOT NULL,
	"sub_category" varchar(100),
	"description_en" text,
	"description_ta" text,
	"base_price" numeric(10, 2) DEFAULT '0',
	"estimated_duration" integer DEFAULT 60,
	"skills_required" jsonb,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "technicians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"skills" jsonb NOT NULL,
	"specializations" jsonb,
	"current_location" jsonb,
	"status" "technician_status" DEFAULT 'available',
	"rating" numeric(3, 2) DEFAULT '0',
	"total_jobs" integer DEFAULT 0,
	"completed_jobs" integer DEFAULT 0,
	"vehicle_info" jsonb,
	"emergency_contact" varchar(20),
	"working_hours" jsonb,
	"documents" jsonb,
	"is_active" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "technicians_phone_unique" UNIQUE("phone"),
	CONSTRAINT "technicians_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"language" "language" DEFAULT 'ta',
	"role" "user_role" DEFAULT 'customer',
	"is_active" boolean DEFAULT true,
	"preferences" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_events_booking_id_idx" ON "booking_events" ("booking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_events_type_idx" ON "booking_events" ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_events_performer_idx" ON "booking_events" ("performed_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_events_created_at_idx" ON "booking_events" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_customer_id_idx" ON "bookings" ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_technician_id_idx" ON "bookings" ("assigned_technician_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_priority_idx" ON "bookings" ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_service_type_idx" ON "bookings" ("service_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_scheduled_time_idx" ON "bookings" ("scheduled_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_emergency_idx" ON "bookings" ("is_emergency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_payment_status_idx" ON "bookings" ("payment_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_created_at_idx" ON "bookings" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_status_service_idx" ON "bookings" ("status","service_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_tech_status_idx" ON "bookings" ("assigned_technician_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_transactions_product_idx" ON "inventory_transactions" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_transactions_booking_idx" ON "inventory_transactions" ("booking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_transactions_type_idx" ON "inventory_transactions" ("transaction_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_transactions_created_at_idx" ON "inventory_transactions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_booking_id_idx" ON "notifications" ("booking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_status_idx" ON "notifications" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications" ("read_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_idx" ON "products" ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_sub_category_idx" ON "products" ("sub_category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_brand_idx" ON "products" ("brand");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_active_idx" ON "products" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_stock_idx" ON "products" ("stock_quantity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_price_idx" ON "products" ("price");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_featured_idx" ON "products" ("is_featured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_name_search_idx" ON "products" ("name_en","name_ta");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_booking_id_idx" ON "reviews" ("booking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_customer_id_idx" ON "reviews" ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_technician_id_idx" ON "reviews" ("technician_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_rating_idx" ON "reviews" ("rating");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_public_idx" ON "reviews" ("is_public");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_created_at_idx" ON "reviews" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_areas_pincode_idx" ON "service_areas" ("pincode");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_areas_district_idx" ON "service_areas" ("district");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_areas_covered_idx" ON "service_areas" ("is_covered");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_areas_active_idx" ON "service_areas" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_category_idx" ON "services" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_sub_category_idx" ON "services" ("sub_category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_active_idx" ON "services" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "technicians_phone_idx" ON "technicians" ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_status_idx" ON "technicians" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_skills_idx" ON "technicians" ("skills");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_active_idx" ON "technicians" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_rating_idx" ON "technicians" ("rating");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_id_idx" ON "users" ("clerk_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_events" ADD CONSTRAINT "booking_events_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_technician_id_technicians_id_fk" FOREIGN KEY ("assigned_technician_id") REFERENCES "technicians"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
