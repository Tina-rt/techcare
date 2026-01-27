import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';

export const DATABASE_CONNECTION = 'DRIZZLE_DB';

export const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');

    const pool = new Pool({
      connectionString,
    });

    // Pass the schema to drizzle for type-safe query building
    return drizzle({ client: pool, schema });
  },
};
