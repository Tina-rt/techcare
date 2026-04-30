CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image" text,
	"author" text DEFAULT 'Pharmatech Team' NOT NULL,
	"category" text,
	"tags" text,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
