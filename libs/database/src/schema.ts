import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user, type NewUser, type User } from './schemas/user.schema';
import { address } from './schemas/address.schema';
import {
  inventory,
  type Inventory,
  type NewInventory,
} from './schemas/inventory.schema';
import {
  stockMovements,
  type StockMovement,
  type NewStockMovement,
} from './schemas/stock-movement.schema';

export const userRelations = relations(user, ({ one }) => ({
  address: one(address, {
    fields: [user.id],
    references: [address.userId],
  }),
}));

export const addressRelations = relations(address, ({ one }) => ({
  user: one(user, {
    fields: [address.userId],
    references: [user.id],
  }),
}));

export const notification = pgTable('notification', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  userId: integer('user_id'),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;

export { user, type NewUser, type User };
export { inventory, type Inventory, type NewInventory };
export { stockMovements, type StockMovement, type NewStockMovement };
export { address };
