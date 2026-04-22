import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { user } from './user.schema';

export const address = pgTable('address', {
  id: serial('id').primaryKey(),
  street: text('street'),
  city: text('city').notNull(),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country').notNull(),
  userId: integer('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
});

export type Address = typeof address.$inferSelect;
export type NewAddress = typeof address.$inferInsert;
