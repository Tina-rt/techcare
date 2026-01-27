import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseProvider, DATABASE_CONNECTION } from './database.provider';

@Global() // Optional: Makes it available everywhere without re-importing
@Module({
  imports: [ConfigModule],
  providers: [databaseProvider],
  exports: [DATABASE_CONNECTION], // Export the provider token
})
export class DatabaseModule {}
