import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().unique(), // one cart per user
  items: jsonb('items').default([]).notNull(),
  totalAmount: integer('total_amount').default(0).notNull(),
  totalItems: integer('total_items').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CartRow = typeof carts.$inferSelect;
export type NewCartRow = typeof carts.$inferInsert;
