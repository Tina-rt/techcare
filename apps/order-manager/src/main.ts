import 'reflect-metadata';
import { initTracing } from '@app/shared';
initTracing('order-manager');

import { NestFactory } from '@nestjs/core';
import { OrderManagerModule } from './order-manager.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(OrderManagerModule);
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
      queue: 'order_manager_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3008);
  console.log('[ORDER_MANAGER] is running and listening for RabbitMQ messages');
}
bootstrap();
