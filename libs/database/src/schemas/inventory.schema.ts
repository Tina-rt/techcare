import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  productId: text('product_id').notNull(), // Reference to MongoDB Product ID
  quantity: integer('quantity').notNull().default(0),
  location: text('location'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;
