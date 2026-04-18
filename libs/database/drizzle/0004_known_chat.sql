CREATE TABLE "stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"type" text NOT NULL,
	"quantity_changed" integer NOT NULL,
	"previous_quantity" integer NOT NULL,
	"new_quantity" integer NOT NULL,
	"reference_id" text,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD COLUMN "reserved_quantity" integer DEFAULT 0 NOT NULL;