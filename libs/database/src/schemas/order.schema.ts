import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  items: jsonb('items').default([]).notNull(),
  totalAmount: integer('total_amount').notNull(),
  totalItems: integer('total_items').notNull(),
  shippingFee: integer('shipping_fee').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  paymentStatus: varchar('payment_status', { length: 50 })
    .notNull()
    .default('pending'),
  paymentIntentId: varchar('payment_intent_id', { length: 255 }),
  shippingAddress: jsonb('shipping_address').notNull(),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
