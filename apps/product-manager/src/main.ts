import { NestFactory } from '@nestjs/core';
import { ProductManagerModule } from './product-manager.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ProductManagerModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Connect RabbitMQ microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@localhost:5672'],
      queue: 'product_manager_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3002); // Changed from 3000 to avoid conflicts if needed, but primary communication is RMQ
  console.log(
    '[PRODUCT_MANAGER] is running and listening for RabbitMQ messages',
  );
}
bootstrap();
