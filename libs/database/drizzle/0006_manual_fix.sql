DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipping_fee" integer DEFAULT 0,
	"support_location" text,
	"support_phone" text,
	"support_email" text,
	"terms_and_conditions" text,
	"privacy_policy" text,
	"socials" text,
	"logo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Fix orders table if needed (adding shipping_fee if missing)
DO $$ BEGIN
    ALTER TABLE "orders" ADD COLUMN "shipping_fee" integer DEFAULT 0 NOT NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Fix carts and orders user_id type if needed (converting to integer)
-- Note: This might fail if there is non-numeric data, but we assume it's clean for now or empty.
-- ALTER TABLE "carts" ALTER COLUMN "user_id" TYPE integer USING (user_id::integer);
-- ALTER TABLE "orders" ALTER COLUMN "user_id" TYPE integer USING (user_id::integer);
