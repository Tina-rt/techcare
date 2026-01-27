import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { defineRelations } from 'drizzle-orm';
import { user, type NewUser } from './schemas/user.schema';
import { address } from './schemas/address.schema';

export const userRelations = defineRelations({ user, address }, (r) => ({
  address: {
    user: r.one.user({
      from: r.address.userId,
      to: r.user.id,
    }),
  },
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

export { user, type NewUser };
