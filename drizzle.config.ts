import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  // Target individual schema files to avoid importing DTO decorators
  schema: './libs/database/src/schemas/*.schema.ts',
  out: './libs/database/drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
