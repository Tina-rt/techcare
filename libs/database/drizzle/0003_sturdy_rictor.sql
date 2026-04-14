CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');
--> statement-breakpoint
CREATE TABLE "address" (

	"id" serial PRIMARY KEY NOT NULL,
	"street" text,
	"city" text NOT NULL,
	"state" text,
	"zip_code" text,
	"country" text NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"location" text,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "firstname" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'USER' NOT NULL;