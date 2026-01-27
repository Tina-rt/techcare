import { NestFactory } from '@nestjs/core';
import { InventoryManagerModule } from './inventory-manager.module';

async function bootstrap() {
  const app = await NestFactory.create(InventoryManagerModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
