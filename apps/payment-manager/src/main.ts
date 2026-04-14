import { NestFactory } from '@nestjs/core';
import { PaymentManagerModule } from './payment-manager.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(PaymentManagerModule, { rawBody: true });
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
      queue: 'payment_manager_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3009);
  console.log(
    '[PAYMENT_MANAGER] is running and listening for RabbitMQ messages',
  );
}
bootstrap().catch((err) => console.error(err));
