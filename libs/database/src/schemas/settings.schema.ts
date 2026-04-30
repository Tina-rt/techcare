import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  shippingFee: integer('shipping_fee').default(0),
  supportLocation: text('support_location'),
  supportPhone: text('support_phone'),
  supportEmail: text('support_email'),
  termsAndConditions: text('terms_and_conditions'),
  privacyPolicy: text('privacy_policy'),
  socials: text('socials'), // Will store as JSON string
  logo: text('logo'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
