import 'reflect-metadata';
import { initTracing } from '@app/shared';
initTracing('cart-manager');

import { NestFactory } from '@nestjs/core';
import { CartManagerModule } from './cart-manager.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(CartManagerModule);
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
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'cart_manager_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3007);
  console.log('[CART_MANAGER] is running and listening for RabbitMQ messages');
}
bootstrap();
