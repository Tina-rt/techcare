import { NestFactory } from '@nestjs/core';
import { InventoryManagerModule } from './inventory-manager.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(InventoryManagerModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@localhost:5672'],
      queue: 'inventory_service_queue',
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
