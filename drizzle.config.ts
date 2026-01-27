import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  // Point this to your library schema
  schema: './libs/database/src/schema.ts',
  out: './libs/database/drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
