import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as path from 'path';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool);

  console.log('Running migrations...');
  
  // In the built app, the migrations will be in a specific location
  // We'll use an environment variable or a default relative path
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER || path.join(__dirname, '../drizzle');
  
  console.log(`Using migrations from: ${migrationsFolder}`);

  await migrate(db, { migrationsFolder });
  
  console.log('Migrations completed successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:');
  console.error(err);
  process.exit(1);
});
