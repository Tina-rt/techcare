ALTER TABLE "notification" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "read" boolean DEFAULT false NOT NULL;