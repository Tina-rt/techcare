import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const stockMovements = pgTable('stock_movements', {
  id: serial('id').primaryKey(),
  productId: text('product_id').notNull(),
  type: text('type').notNull(), // StockMovementType enum
  quantityChanged: integer('quantity_changed').notNull(),
  previousQuantity: integer('previous_quantity').notNull(),
  newQuantity: integer('new_quantity').notNull(),
  referenceId: text('reference_id'), // orderId, etc.
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
