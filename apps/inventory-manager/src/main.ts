import 'reflect-metadata';
import { initTracing } from '@app/shared';
initTracing('inventory-manager');

import { NestFactory } from '@nestjs/core';
import { InventoryManagerModule } from './inventory-manager.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(InventoryManagerModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'inventory_manager_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003);
  console.log(
    '[INVENTORY_MANAGER] is running and listening for RabbitMQ messages',
  );
}
bootstrap();
