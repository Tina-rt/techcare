CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"items" jsonb DEFAULT '[]' NOT NULL,
	"total_amount" integer DEFAULT 0 NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "carts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"items" jsonb DEFAULT '[]' NOT NULL,
	"total_amount" integer NOT NULL,
	"total_items" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"payment_intent_id" varchar(255),
	"shipping_address" jsonb NOT NULL,
	"tracking_number" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
